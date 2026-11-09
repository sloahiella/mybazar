import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'nodejs';

const admin = createClient('https://jthdtmqrapnfmmmeuqsw.supabase.co', process.env.SUPABASE_SECRET_KEY || '');

const MAX_SENDS = 3;
const LOCK_MS = 3 * 60 * 60 * 1000;
const WINDOW_MS = 60 * 60 * 1000;
const TTL_MS = 5 * 60 * 1000;

function hash(phone: string, code: string) {
  return crypto.createHash('sha256').update(`${phone}:${code}:${process.env.OTP_SECRET}`).digest('hex');
}

function mask(email: string) {
  const [u, d] = email.split('@');
  return `${u.slice(0, 2)}***@${d}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body?.phone || '').trim();
    if (phone.length < 11 || phone.length > 15) {
      return NextResponse.json({ ok: false, message: 'সঠিক ফোন নম্বর দিন' }, { status: 400 });
    }

    const now = Date.now();
    const { data: otp } = await admin.from('customer_otps').select('*').eq('phone', phone).maybeSingle();

    if (otp?.locked_until && new Date(otp.locked_until).getTime() > now) {
      const mins = Math.ceil((new Date(otp.locked_until).getTime() - now) / 60000);
      return NextResponse.json({ ok: false, message: `অনেকবার চেষ্টা হয়েছে। ${mins} মিনিট পরে আবার চেষ্টা করুন।` }, { status: 429 });
    }

    let sent = otp?.sent_count || 0;
    const windowStart = otp?.window_start ? new Date(otp.window_start).getTime() : 0;
    if (now - windowStart > WINDOW_MS) sent = 0;

    if (sent >= MAX_SENDS) {
      await admin.from('customer_otps').upsert({
        phone, code_hash: null, expires_at: null, attempts: 0, sent_count: 0,
        window_start: null, locked_until: new Date(now + LOCK_MS).toISOString(),
      });
      return NextResponse.json({ ok: false, message: 'কোড পাঠানোর সীমা শেষ। ৩ ঘণ্টা পরে আবার চেষ্টা করুন।' }, { status: 429 });
    }

    const { data: customer } = await admin.from('customers').select('email').eq('phone', phone).maybeSingle();
    if (!customer) {
      return NextResponse.json({ ok: false, message: 'এই নম্বরে কোনো অ্যাকাউন্ট নেই! নতুন রেজিস্ট্রেশন করুন।' }, { status: 404 });
    }
    if (!customer.email) {
      return NextResponse.json({ ok: false, message: 'এই অ্যাকাউন্টে ইমেইল নেই। হোয়াটসঅ্যাপে যোগাযোগ করুন: ০১৮৭২১৪৯৬৫৫' }, { status: 400 });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    await admin.from('customer_otps').upsert({
      phone,
      code_hash: hash(phone, code),
      expires_at: new Date(now + TTL_MS).toISOString(),
           attempts: sent === 0 ? 0 : (otp?.attempts || 0),
      sent_count: sent + 1,
      window_start: sent === 0 ? new Date(now).toISOString() : otp?.window_start,
      locked_until: null,
    });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.OTP_FROM,
        to: [customer.email],
        subject: 'সোহেল মার্ট লগইন কোড',
        text: `আপনার লগইন কোড: ${code}\nএই কোড ৫ মিনিট কাজ করবে। কাউকে কোডটি দেবেন না।`,
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, message: 'কোড পাঠানো যায়নি। একটু পরে চেষ্টা করুন বা হোয়াটসঅ্যাপে যোগাযোগ করুন।' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, maskedEmail: mask(customer.email) });
  } catch {
    return NextResponse.json({ ok: false, message: 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন' }, { status: 500 });
  }
}