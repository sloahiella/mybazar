import { createClient } from '@supabase/supabase-js';

export function getAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error('SUPABASE_SECRET_KEY missing');
  return createClient('https://jthdtmqrapnfmmmeuqsw.supabase.co', key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// অনুরোধটা সত্যিই লগইন করা অ্যাডমিনের কিনা, সার্ভারে যাচাই করা হয়
export async function requireAdmin(request: Request, admin: any) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  const { data, error } = await admin.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email) return false;
  const { data: list } = await admin.from('admins').select('email');
  return (list || []).some((a: any) => String(a.email || '').toLowerCase() === email);
}