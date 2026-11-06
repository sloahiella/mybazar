import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'nodejs';

const admin = createClient('https://jthdtmqrapnfmmmeuqsw.supabase.co', process.env.SUPABASE_SECRET_KEY || '');

const MAX_WRONG = 5;

function hash(phone: string, code: string) {
  return crypto.createHash('sha256').update(`${phone}:${code}:${process.env.OTP_SECRET}`).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body?.phone || '').trim();
    const code = String(body?.code || '').trim();

    const { data: otp } = await admin.from('customer_otps').select('*').eq('phone', phone).maybeSingle();
    if (!otp || !otp.code_hash || !otp.expires_at || new Date(otp.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ ok: false, message: 'কোডের মেয়াদ শেষ বা কোড পাঠানো হয়নি। নতুন কোড নিন।' }, { status: 400 });
    }
    if ((otp.attempts || 0) >= MAX_WRONG) {
      return NextResponse.json({ ok: false, message: 'অনেকবার ভুল কোড দেওয়া হয়েছে। নতুন কোড নিন।' }, { status: 429 });
    }

    const a = Buffer.from(hash(phone, code));
    const b = Buffer.from(otp.code_hash);
    const match = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!match) {
      await admin.from('customer_otps').update({ attempts: (otp.attempts || 0) + 1 }).eq('phone', phone);
      return NextResponse.json({ ok: false, message: 'কোড ভুল হয়েছে' }, { status: 400 });
    }

    await admin.from('customer_otps').update({ code_hash: null, expires_at: null, attempts: 0 }).eq('phone', phone);
    const { data: customer } = await admin.from('customers').select('name, phone, email, district, upazila').eq('phone', phone).maybeSingle();
    if (!customer) return NextResponse.json({ ok: false, message: 'অ্যাকাউন্ট পাওয়া যায়নি' }, { status: 404 });

    return NextResponse.json({ ok: true, customer });
  } catch {
    return NextResponse.json({ ok: false, message: 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন' }, { status: 500 });
  }
}