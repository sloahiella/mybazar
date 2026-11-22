import { NextResponse } from 'next/server';
import { getAdminClient, requireAdmin } from '../../_lib/adminAuth';

export const runtime = 'nodejs';

const fail = (message: string, status = 400) => NextResponse.json({ ok: false, message }, { status });

// ইমেইল দিয়ে লগইন অ্যাকাউন্ট খোঁজা
async function findUserByEmail(admin: any, email: string) {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    const users = data?.users || [];
    const found = users.find((u: any) => String(u.email || '').toLowerCase() === email);
    if (found) return found;
    if (users.length < 200) return null;
  }
  return null;
}

// এই লগইনে অ্যাডমিন বা সেলারের ভূমিকাও আছে কিনা
async function userRoles(admin: any, userId: string, email: string) {
  const [adm, sel] = await Promise.all([
    admin.from('admins').select('email'),
    admin.from('sellers').select('id').eq('profile_id', userId).limit(1),
  ]);
  const isAdmin = (adm.data || []).some((a: any) => String(a.email || '').toLowerCase() === email);
  const isSeller = !!(sel.data && sel.data.length > 0);
  return { isAdmin, isSeller };
}

export async function POST(request: Request) {
  try {
    const admin = getAdminClient();
    if (!(await requireAdmin(request, admin))) {
      return fail('অনুমতি নেই। অ্যাডমিন হিসেবে নতুন করে লগইন করুন।', 401);
    }

    const b = await request.json();
    const action = String(b?.action || '');

    // ----- নতুন রাইডার যোগ (বা আগের অ্যাকাউন্টের সাথে যুক্ত) -----
    if (action === 'add_rider') {
      const name = String(b?.name || '').trim().slice(0, 100);
      const phone = String(b?.phone || '').trim();
      const email = String(b?.email || '').trim().toLowerCase().slice(0, 120);
      const vehicle = String(b?.vehicleNumber || '').trim().slice(0, 30);
      const password = String(b?.password || '');

      if (!name || !phone || !email || !vehicle) return fail('নাম, ফোন, ইমেইল ও গাড়ির নম্বর দিন');
      if (phone.length < 11 || phone.length > 15) return fail('সঠিক ফোন নম্বর দিন');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('সঠিক ইমেইল দিন');

      const { data: dup } = await admin.from('riders').select('id').or(`phone.eq.${phone},email.eq.${email}`).limit(1);
      if (dup && dup.length > 0) return fail('এই ফোন নম্বর বা ইমেইলে রাইডার আগেই আছে');

      let user = await findUserByEmail(admin, email);
      let created = false;
      if (!user) {
        if (password.length < 8) return fail('নতুন অ্যাকাউন্টের জন্য কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন');
        const c = await admin.auth.admin.createUser({ email, password, email_confirm: true });
        if (c.error || !c.data?.user) return fail('অ্যাকাউন্ট বানানো যায়নি: ' + (c.error?.message || ''), 500);
        user = c.data.user;
        created = true;
      }

      const { error } = await admin.from('riders').insert({
        name, phone, email, vehicle_number: vehicle, user_id: user.id, is_approved: true,
      });
      if (error) {
        if (created) await admin.auth.admin.deleteUser(user.id);
        return fail('রাইডার যোগ করা যায়নি: ' + error.message, 500);
      }
      return NextResponse.json({ ok: true, linkedExisting: !created });
    }

    // ----- বিদ্যমান রাইডারের কাজ -----
    const riderId = Number(b?.riderId);
    if (!riderId) return fail('রাইডার চেনা যায়নি');

    const { data: rider } = await admin.from('riders').select('id, user_id').eq('id', riderId).maybeSingle();
    if (!rider) return fail('রাইডার পাওয়া যায়নি', 404);

    let roles = { isAdmin: false, isSeller: false };
    if (rider.user_id) {
      const { data: u } = await admin.auth.admin.getUserById(rider.user_id);
      roles = await userRoles(admin, rider.user_id, String(u?.user?.email || '').toLowerCase());
    }
    const shared = roles.isAdmin || roles.isSeller;

    if (action === 'reset_password') {
      if (roles.isAdmin) return fail('এটা অ্যাডমিনের অ্যাকাউন্ট। এখান থেকে নয়, "পাসওয়ার্ড ভুলে গেছেন?" ব্যবহার করুন।');
      const password = String(b?.password || '');
      if (password.length < 8) return fail('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন');
      if (!rider.user_id) return fail('এই রাইডারের লগইন অ্যাকাউন্ট নেই। মুছে নতুন করে যোগ করুন।');
      const { error } = await admin.auth.admin.updateUserById(rider.user_id, { password });
      if (error) return fail('পাসওয়ার্ড বদলানো যায়নি: ' + error.message, 500);
      return NextResponse.json({ ok: true });
    }

    if (action === 'block') {
      const { error } = await admin.from('riders').update({ is_approved: false, is_blocked: true }).eq('id', riderId);
      if (error) return fail('ব্লক করা যায়নি: ' + error.message, 500);
      if (rider.user_id && !shared) await admin.auth.admin.updateUserById(rider.user_id, { ban_duration: '87600h' });
      return NextResponse.json({ ok: true });
    }

    if (action === 'unblock') {
      const { error } = await admin.from('riders').update({ is_approved: true, is_blocked: false }).eq('id', riderId);
      if (error) return fail('চালু করা যায়নি: ' + error.message, 500);
      if (rider.user_id && !shared) await admin.auth.admin.updateUserById(rider.user_id, { ban_duration: 'none' });
      return NextResponse.json({ ok: true });
    }

    if (action === 'delete') {
      if (rider.user_id && !shared) await admin.auth.admin.deleteUser(rider.user_id);
      const { error } = await admin.from('riders').delete().eq('id', riderId);
      if (error) return fail('মোছা যায়নি: ' + error.message, 500);
      return NextResponse.json({ ok: true, keptAccount: !!(rider.user_id && shared) });
    }

    return fail('অজানা কাজ');
  } catch (e) {
    console.error('rider-action error:', e);
    return fail('কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন', 500);
  }
}