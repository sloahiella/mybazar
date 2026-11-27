import { NextResponse } from 'next/server';
import { getAdminClient, requireAdmin } from '../../_lib/adminAuth';

export const runtime = 'nodejs';

const fail = (message: string, status = 400) => NextResponse.json({ ok: false, message }, { status });

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

export async function POST(request: Request) {
  try {
    const admin = getAdminClient();
    if (!(await requireAdmin(request, admin))) {
      return fail('অনুমতি নেই। অ্যাডমিন হিসেবে নতুন করে লগইন করুন।', 401);
    }

    const b = await request.json().catch(() => ({}));
    const action = String(b?.action || '');

    if (action === 'list') {
      const pageId = Number(b?.pageId);
      if (!pageId) return fail('পেজ চেনা যায়নি');
      const { data } = await admin
        .from('page_editors')
        .select('id, user_id, email, is_blocked, created_at')
        .eq('page_id', pageId)
        .order('created_at', { ascending: true });
      return NextResponse.json({ ok: true, editors: data || [] });
    }

    if (action === 'add_editor') {
      const pageId = Number(b?.pageId);
      const email = String(b?.email || '').trim().toLowerCase().slice(0, 120);
      const password = String(b?.password || '');
      if (!pageId) return fail('পেজ চেনা যায়নি');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('সঠিক ইমেইল দিন');

      let user = await findUserByEmail(admin, email);
      let created = false;
      if (!user) {
        if (password.length < 8) return fail('নতুন অ্যাকাউন্টের জন্য কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন');
        const c = await admin.auth.admin.createUser({ email, password, email_confirm: true });
        if (c.error || !c.data?.user) return fail('অ্যাকাউন্ট বানানো যায়নি: ' + (c.error?.message || ''), 500);
        user = c.data.user;
        created = true;
      }

      const { error } = await admin.from('page_editors').insert({ page_id: pageId, user_id: user.id, email });
      if (error) {
        if (created) await admin.auth.admin.deleteUser(user.id);
        const dup = String(error.message || '').toLowerCase().includes('duplicate');
        return fail(dup ? 'এই ইমেইল এই পেজের এডিটর আগেই আছে' : 'যোগ করা যায়নি: ' + error.message, dup ? 400 : 500);
      }
      return NextResponse.json({ ok: true, linkedExisting: !created });
    }

    const editorId = Number(b?.editorId);
    if (!editorId) return fail('এডিটর চেনা যায়নি');
    const { data: ed } = await admin.from('page_editors').select('id, user_id, email').eq('id', editorId).maybeSingle();
    if (!ed) return fail('এডিটর পাওয়া যায়নি', 404);

    if (action === 'block' || action === 'unblock') {
      const { error } = await admin.from('page_editors').update({ is_blocked: action === 'block' }).eq('id', editorId);
      if (error) return fail('কাজটি করা যায়নি: ' + error.message, 500);
      return NextResponse.json({ ok: true });
    }

    if (action === 'delete') {
      const { error } = await admin.from('page_editors').delete().eq('id', editorId);
      if (error) return fail('মোছা যায়নি: ' + error.message, 500);
      return NextResponse.json({ ok: true });
    }

    if (action === 'reset_password') {
      const password = String(b?.password || '');
      if (password.length < 8) return fail('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন');
      const { data: adm } = await admin.from('admins').select('email');
      if ((adm || []).some((a: any) => String(a.email || '').toLowerCase() === String(ed.email).toLowerCase())) {
        return fail('এটা অ্যাডমিনের অ্যাকাউন্ট। "পাসওয়ার্ড ভুলে গেছেন?" ব্যবহার করুন।');
      }
      const { error } = await admin.auth.admin.updateUserById(ed.user_id, { password });
      if (error) return fail('পাসওয়ার্ড বদলানো যায়নি: ' + error.message, 500);
      return NextResponse.json({ ok: true });
    }

    return fail('অজানা কাজ');
  } catch (e) {
    console.error('editor-action error:', e);
    return fail('কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন', 500);
  }
}