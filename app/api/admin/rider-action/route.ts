import { NextResponse } from 'next/server';
import { getAdminClient, requireAdmin } from '../../_lib/adminAuth';

export const runtime = 'nodejs';

const fail = (message: string, status = 400) => NextResponse.json({ ok: false, message }, { status });

export async function POST(request: Request) {
  try {
    const admin = getAdminClient();
    if (!(await requireAdmin(request, admin))) {
      return fail('অনুমতি নেই। অ্যাডমিন হিসেবে নতুন করে লগইন করুন।', 401);
    }

    const b = await request.json();
    const action = String(b?.action || '');
    const riderId = Number(b?.riderId);
    if (!riderId) return fail('রাইডার চেনা যায়নি');

    const { data: rider } = await admin.from('riders').select('id, user_id').eq('id', riderId).maybeSingle();
    if (!rider) return fail('রাইডার পাওয়া যায়নি', 404);

    if (action === 'reset_password') {
      const password = String(b?.password || '');
      if (password.length < 6) return fail('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন');
      if (!rider.user_id) return fail('এই রাইডারের লগইন অ্যাকাউন্ট নেই। মুছে নতুন করে রেজিস্ট্রেশন করান।');
      const { error } = await admin.auth.admin.updateUserById(rider.user_id, { password });
      if (error) return fail('পাসওয়ার্ড বদলানো যায়নি: ' + error.message, 500);
      return NextResponse.json({ ok: true });
    }

    if (action === 'block') {
      const { error } = await admin.from('riders').update({ is_approved: false, is_blocked: true }).eq('id', riderId);
      if (error) return fail('ব্লক করা যায়নি: ' + error.message, 500);
      if (rider.user_id) await admin.auth.admin.updateUserById(rider.user_id, { ban_duration: '87600h' });
      return NextResponse.json({ ok: true });
    }

    if (action === 'unblock') {
      const { error } = await admin.from('riders').update({ is_approved: true, is_blocked: false }).eq('id', riderId);
      if (error) return fail('চালু করা যায়নি: ' + error.message, 500);
      if (rider.user_id) await admin.auth.admin.updateUserById(rider.user_id, { ban_duration: 'none' });
      return NextResponse.json({ ok: true });
    }

    if (action === 'delete') {
      if (rider.user_id) await admin.auth.admin.deleteUser(rider.user_id);
      const { error } = await admin.from('riders').delete().eq('id', riderId);
      if (error) return fail('মোছা যায়নি: ' + error.message, 500);
      return NextResponse.json({ ok: true });
    }

    return fail('অজানা কাজ');
  } catch (e) {
    console.error('rider-action error:', e);
    return fail('কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন', 500);
  }
}