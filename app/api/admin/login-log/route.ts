import { NextResponse } from 'next/server';
import { getAdminClient, requireAdmin, revokeUserSessions } from '../../_lib/adminAuth';

export const runtime = 'nodejs';

const fail = (message: string, status = 400) => NextResponse.json({ ok: false, message }, { status });

export async function POST(request: Request) {
  try {
    const admin = getAdminClient();
    if (!(await requireAdmin(request, admin))) {
      return fail('অনুমতি নেই। অ্যাডমিন হিসেবে নতুন করে লগইন করুন।', 401);
    }

    const b = await request.json().catch(() => ({}));
    const action = String(b?.action || 'list');

    const { data: adm } = await admin.from('admins').select('email');
    const adminEmails = (adm || []).map((a: any) => String(a.email || '').toLowerCase());

    if (action === 'list') {
      const [ev, ses] = await Promise.all([
        admin.from('login_events').select('id, user_id, email, event, ip, user_agent, created_at').order('created_at', { ascending: false }).limit(200),
        admin.rpc('active_staff_sessions'),
      ]);
      const events = ev.data || [];
      const sessions = (ses.data as any[]) || [];
      const ids = Array.from(
        new Set([...events.map((e: any) => e.user_id), ...sessions.map((s: any) => s.user_id)].filter(Boolean))
      ).slice(0, 40) as string[];

      const users: Record<string, any> = {};
      await Promise.all(
        ids.map(async (id) => {
          const { data } = await admin.auth.admin.getUserById(id);
          const u: any = data?.user;
          if (u) users[id] = { email: u.email, banned: !!u.banned_until && new Date(u.banned_until).getTime() > Date.now() };
        })
      );
      return NextResponse.json({ ok: true, events, sessions, users, adminEmails });
    }

    const userId = String(b?.userId || '');
    if (!userId) return fail('ব্যবহারকারী চেনা যায়নি');
    const { data: target } = await admin.auth.admin.getUserById(userId);
    const tEmail = String(target?.user?.email || '').toLowerCase();
    if (!tEmail) return fail('ব্যবহারকারী পাওয়া যায়নি', 404);
    const targetIsAdmin = adminEmails.includes(tEmail);

    if (action === 'revoke_user') {
      await revokeUserSessions(admin, userId);
      return NextResponse.json({ ok: true });
    }

    if (action === 'ban_user') {
      if (targetIsAdmin) return fail('অ্যাডমিন অ্যাকাউন্ট ব্লক করা যায় না।');
      const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: '87600h' });
      if (error) return fail('ব্লক করা যায়নি: ' + error.message, 500);
      await revokeUserSessions(admin, userId);
      return NextResponse.json({ ok: true });
    }

    if (action === 'unban_user') {
      const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
      if (error) return fail('চালু করা যায়নি: ' + error.message, 500);
      return NextResponse.json({ ok: true });
    }

    return fail('অজানা কাজ');
  } catch (e) {
    console.error('login-log error:', e);
    return fail('কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন', 500);
  }
}