import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getAdmin() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error('SUPABASE_SECRET_KEY missing');
  return createClient('https://jthdtmqrapnfmmmeuqsw.supabase.co', key);
}

export async function POST(request: Request) {
      const admin = getAdmin();
  try {
    const b = await request.json();
    const name = String(b?.name || '').trim().slice(0, 100);
    const phone = String(b?.phone || '').trim();
    const email = String(b?.email || '').trim().toLowerCase().slice(0, 120);
    const district = String(b?.district || '').trim().slice(0, 60);
    const upazila = String(b?.upazila || '').trim().slice(0, 60);

    if (!name || !phone || !email || !district || !upazila) {
      return NextResponse.json({ ok: false, message: 'সব তথ্য দিন!' }, { status: 400 });
    }
    if (phone.length < 11 || phone.length > 15) {
      return NextResponse.json({ ok: false, message: 'সঠিক ফোন নম্বর দিন!' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, message: 'সঠিক ইমেইল দিন!' }, { status: 400 });
    }

    const { data: existing } = await admin.from('customers').select('phone').eq('phone', phone).maybeSingle();
    if (existing) return NextResponse.json({ ok: false, exists: true });

    const { data, error } = await admin
      .from('customers')
      .insert({ name, phone, email, district, upazila })
      .select('name, phone, email, district, upazila')
      .single();
    if (error) return NextResponse.json({ ok: false, message: 'নিবন্ধন করা যায়নি, আবার চেষ্টা করুন' }, { status: 500 });

    return NextResponse.json({ ok: true, customer: data });
  } catch {
    return NextResponse.json({ ok: false, message: 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন' }, { status: 500 });
  }
}