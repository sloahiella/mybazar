import { createClient } from '@supabase/supabase-js';

export function getAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error('SUPABASE_SECRET_KEY missing');
  return createClient('https://jthdtmqrapnfmmmeuqsw.supabase.co', key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function bearerToken(request: Request) {
  return (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
}

// টোকেন আগেই getUser দিয়ে যাচাই হয়, এখানে শুধু ভেতরের সেশন নম্বর পড়া হয়
export function sessionIdFromToken(token: string) {
  try {
    const part = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
    return String(payload.session_id || '');
  } catch {
    return '';
  }
}

// বাধ্যতামূলক চালু থাকলে, এই সেশনে কোড যাচাই হয়েছে কিনা
export async function sessionIsVerified(admin: any, token: string, userId: string) {
  const { data: flag } = await admin.from('auth_flags').select('value').eq('key', 'enforce_staff_code').maybeSingle();
  if (!flag?.value) return true;
  const sid = sessionIdFromToken(token);
  if (!sid) return false;
  const { data } = await admin.from('verified_sessions').select('expires_at').eq('session_id', sid).eq('user_id', userId).maybeSingle();
  return !!data && new Date(data.expires_at).getTime() > Date.now();
}

// অনুরোধটা সত্যিই লগইন করা (এবং প্রয়োজনে কোড-যাচাই হওয়া) অ্যাডমিনের কিনা
export async function requireAdmin(request: Request, admin: any) {
  const token = bearerToken(request);
  if (!token) return false;
  const { data, error } = await admin.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email) return false;
  const { data: list } = await admin.from('admins').select('email');
  const isAdm = (list || []).some((a: any) => String(a.email || '').toLowerCase() === email);
  if (!isAdm) return false;
  return await sessionIsVerified(admin, token, data.user.id);
}

// লগইনের ঘটনা লিখে রাখা (ব্যর্থ হলে মূল কাজ থামে না)
export async function logLogin(admin: any, e: { userId?: string; email?: string; event: string; ip?: string; ua?: string }) {
  try {
    await admin.from('login_events').insert({
      user_id: e.userId || null,
      email: e.email || null,
      event: e.event,
      ip: e.ip || null,
      user_agent: e.ua || null,
    });
  } catch {}
}

export async function revokeUserSessions(admin: any, userId: string) {
  await admin.rpc('revoke_user_sessions', { uid: userId });
}