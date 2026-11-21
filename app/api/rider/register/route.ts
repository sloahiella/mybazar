import { NextResponse } from 'next/server';
import { clientIp, allowed, tooMany } from '../../_lib/rateLimit';
import { getAdminClient } from '../../_lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const admin = getAdminClient();
    if (!(await allowed(admin, `rider-reg:${clientIp(request)}`, 10, 3600))) return tooMany();

    const b = await request.json();
    const name = String(b?.name || '').trim().slice(0, 100);
    const phone = String(b?.phone || '').trim();
    const email = String(b?.email || '').trim().toLowerCase().slice(0, 120);
    const vehicle = String(b?.vehicleNumber || '').trim().slice(0, 30);
    const password = String(b?.password || '');

    if (!name || !phone || !email || !vehicle || !password) {
      return NextResponse.json({ ok: false, message: 'সব তথ্য দিন!' }, { status: 400 });
    }
    if (phone.length < 11 || phone.length > 15) {
      return NextResponse.json({ ok: false, message: 'সঠিক ফোন নম্বর দিন!' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, message: 'সঠিক ইমেইল দিন!' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ ok: false, message: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন!' }, { status: 400 });
    }

    const { data: dup } = await admin.from('riders').select('id').or(`phone.eq.${phone},email.eq.${email}`).limit(1);
    if (dup && dup.length > 0) {
      return NextResponse.json({ ok: false, message: 'এই ফোন নম্বর বা ইমেইলে আগেই রেজিস্ট্রেশন করা আছে!' });
    }

    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error || !created.data?.user) {
      const m = String(created.error?.message || '').toLowerCase();
      if (m.includes('already') || m.includes('registered')) {
        return NextResponse.json({ ok: false, message: 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে!' });
      }
      console.error('rider createUser error:', created.error?.message);
      return NextResponse.json({ ok: false, message: 'রেজিস্ট্রেশন করা যায়নি, আবার চেষ্টা করুন' }, { status: 500 });
    }
    const userId = created.data.user.id;

    const { error } = await admin.from('riders').insert({
      name, phone, email, vehicle_number: vehicle, user_id: userId, is_approved: false,
    });
    if (error) {
      await admin.auth.admin.deleteUser(userId);
      console.error('rider insert error:', error.message);
      return NextResponse.json({ ok: false, message: 'রেজিস্ট্রেশন করা যায়নি, আবার চেষ্টা করুন' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('rider register error:', e);
    return NextResponse.json({ ok: false, message: 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন' }, { status: 500 });
  }
}