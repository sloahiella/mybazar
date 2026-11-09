import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'nodejs';

const admin = createClient('https://jthdtmqrapnfmmmeuqsw.supabase.co', process.env.SUPABASE_SECRET_KEY || '');

const MAX_WRONG = 3;
const LOCK_MS = 3 * 60 * 60 * 1000;

function hash(phone: string, code: string) {
  return crypto.createHash('sha256').update(`${phone}:${code}:${process.env.OTP_SECRET}`).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body?.phone || '').trim();
    const code = String(body?.code || '').trim();
    const now = Date.now();

    const { data: otp } = await admin.from('customer_otps').select('*').eq('phone', phone).maybeSingle();

    if (otp?.locked_until && new Date(otp.locked_until).getTime() > now) {
      const mins = Math.ceil((new Date(otp.locked_until).getTime() - now) / 60000);
      return NextResponse.json({ ok: false, locked: true, message: `এই নম্বরটি সাময়িক লক করা আছে। ${mins} মিনিট পরে চেষ্টা করুন।` }, { status: 429 });
    }

    if (!otp || !otp.code_hash || !otp.expires_at || new Date(otp.expires_at).getTime() < now) {
      return NextResponse.json({ ok: false, message: 'কোডের মেয়াদ শেষ বা কোড পাঠানো হয়নি। নতুন কোড নিন।' }, { status: 400 });
    }

    const a = Buffer.from(hash(phone, code));
    const b = Buffer.from(otp.code_hash);
    const match = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!match) {
      const wrong = (otp.attempts || 0) + 1;
      if (wrong >= MAX_WRONG) {
        await admin.from('customer_otps').update({
          code_hash: null, expires_at: null, attempts: 0, sent_count: 0, window_start: null,
          locked_until: new Date(now + LOCK_MS).toISOString(),
        }).eq('phone', phone);
        return NextResponse.json({ ok: false, locked: true, message: '৩ বার ভুল কোড দেওয়া হয়েছে। নিরাপত্তার জন্য নম্বরটি ৩ ঘণ্টা লক করা হলো।' }, { status: 429 });
      }
      await admin.from('customer_otps').update({ attempts: wrong }).eq('phone', phone);
      return NextResponse.json({ ok: false, message: `কোড ভুল হয়েছে। আর ${MAX_WRONG - wrong} বার চেষ্টা করতে পারবেন।` }, { status: 400 });
    }

    await admin.from('customer_otps').update({
      code_hash: null, expires_at: null, attempts: 0, sent_count: 0, window_start: null,
    }).eq('phone', phone);

    const { data: customer } = await admin.from('customers').select('name, phone, email, district, upazila').eq('phone', phone).maybeSingle();
    if (!customer) return NextResponse.json({ ok: false, message: 'অ্যাকাউন্ট পাওয়া যায়নি' }, { status: 404 });

    return NextResponse.json({ ok: true, customer });
  } catch {
    return NextResponse.json({ ok: false, message: 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন' }, { status: 500 });
  }
}