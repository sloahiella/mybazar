import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { clientIp, allowed, tooMany } from '../../_lib/rateLimit';

export const runtime = 'nodejs';

function getAdmin() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error('SUPABASE_SECRET_KEY missing');
  return createClient('https://jthdtmqrapnfmmmeuqsw.supabase.co', key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const riderEmail = (phone: string) => `r${phone.replace(/\D/g, '')}@riders.sohelmart.com`;

export async function POST(request: Request) {
  try {
    const admin = getAdmin();
    if (!(await allowed(admin, `rider-reg:${clientIp(request)}`, 10, 3600))) return tooMany();

    const b = await request.json();
    const name = String(b?.name || '').trim().slice(0, 100);
    const phone = String(b?.phone || '').trim();
    const vehicle = String(b?.vehicleNumber || '').trim().slice(0, 30);
    const password = String(b?.password || '');

    if (!name || !phone || !vehicle || !password) {
      return NextResponse.json({ ok: false, message: 'সব তথ্য দিন!' }, { status: 400 });
    }
    if (phone.length < 11 || phone.length > 15) {
      return NextResponse.json({ ok: false, message: 'সঠিক ফোন নম্বর দিন!' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন!' }, { status: 400 });
    }

    const { data: existingRider } = await admin.from('riders').select('id').eq('phone', phone).maybeSingle();
    if (existingRider) {
      return NextResponse.json({ ok: false, message: 'এই ফোন নম্বরে আগেই রেজিস্ট্রেশন করা আছে!' });
    }

    const email = riderEmail(phone);
    let userId: string | null = null;

    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error) {
      // আগের মুছে ফেলা আবেদনের অ্যাকাউন্ট থেকে গেলে ওটাতেই নতুন পাসওয়ার্ড বসানো হয়
      const list = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list.data?.users?.find((u: any) => u.email === email);
      if (!found) {
        console.error('rider createUser error:', created.error.message);
        return NextResponse.json({ ok: false, message: 'রেজিস্ট্রেশন করা যায়নি, আবার চেষ্টা করুন' }, { status: 500 });
      }
      const upd = await admin.auth.admin.updateUserById(found.id, { password, email_confirm: true });
      if (upd.error) {
        return NextResponse.json({ ok: false, message: 'রেজিস্ট্রেশন করা যায়নি, আবার চেষ্টা করুন' }, { status: 500 });
      }
      userId = found.id;
    } else {
      userId = created.data?.user?.id || null;
    }

    const { error } = await admin.from('riders').insert({
      name, phone, vehicle_number: vehicle, user_id: userId, is_approved: false,
    });
    if (error) {
      console.error('rider insert error:', error.message);
      return NextResponse.json({ ok: false, message: 'রেজিস্ট্রেশন করা যায়নি, আবার চেষ্টা করুন' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('rider register error:', e);
    return NextResponse.json({ ok: false, message: 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন' }, { status: 500 });
  }
}