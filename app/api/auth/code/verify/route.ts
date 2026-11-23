import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminClient, bearerToken, sessionIdFromToken, logLogin } from '../../../_lib/adminAuth';
import { clientIp, allowed, tooMany } from '../../../_lib/rateLimit';

export const runtime = 'nodejs';

const MAX_WRONG = 5;
// যাচাই-করা সেশনের কোনো নির্দিষ্ট মেয়াদ নেই। বাতিল হয় লগআউট, পাসওয়ার্ড বদল, ব্লক বা অ্যাডমিনের বাতিলে
const NO_EXPIRY = '2100-01-01T00:00:00Z';
const fail = (message: string, status = 400) => NextResponse.json({ ok: false, message }, { status });

function hash(sessionId: string, code: string) {
  return crypto.createHash('sha256').update(`${sessionId}:${code}:${process.env.OTP_SECRET}`).digest('hex');
}

export async function POST(request: Request) {
  try {
    const admin = getAdminClient();
    const token = bearerToken(request);
    if (!token) return fail('লগইন সেশন পাওয়া যায়নি', 401);

    const { data: u, error: uErr } = await admin.auth.getUser(token);
    const user = u?.user;
    if (uErr || !user) return fail('লগইন সেশন পাওয়া যায়নি', 401);

    const sessionId = sessionIdFromToken(token);
    if (!sessionId) return fail('সেশন চেনা যায়নি, আবার লগইন করুন', 401);

    const ip = clientIp(request);
    const ua = String(request.headers.get('user-agent') || '').slice(0, 160);
    if (!(await allowed(admin, `staffcode-verify:${user.id}`, 30, 3600))) return tooMany();

    const body = await request.json().catch(() => ({}));
    const code = String(body?.code || '').trim();

    const { data: row } = await admin.from('staff_codes').select('*').eq('session_id', sessionId).maybeSingle();
    if (!row || !row.code_hash || !row.expires_at || new Date(row.expires_at).getTime() < Date.now()) {
      return fail('কোডের মেয়াদ শেষ বা কোড পাঠানো হয়নি। নতুন কোড নিন।');
    }
    if ((row.attempts || 0) >= MAX_WRONG) {
      return fail('অনেকবার ভুল কোড দেওয়া হয়েছে। নতুন কোড নিন।', 429);
    }

    const a = Buffer.from(hash(sessionId, code));
    const b = Buffer.from(row.code_hash);
    const match = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!match) {
      const wrong = (row.attempts || 0) + 1;
      await admin.from('staff_codes').update({ attempts: wrong }).eq('session_id', sessionId);
      await logLogin(admin, { userId: user.id, email: user.email || '', event: 'code_fail', ip, ua });
      return fail(`কোড ভুল হয়েছে। আর ${Math.max(0, MAX_WRONG - wrong)} বার চেষ্টা করতে পারবেন।`);
    }

    await admin.from('staff_codes').delete().eq('session_id', sessionId);
    const { error: vErr } = await admin.from('verified_sessions').upsert({
      session_id: sessionId,
      user_id: user.id,
      verified_at: new Date().toISOString(),
      expires_at: NO_EXPIRY,
    });
    if (vErr) {
      console.error('verified_sessions upsert error:', vErr.message);
      return fail('যাচাই সেভ করা যায়নি, আবার চেষ্টা করুন', 500);
    }

    await logLogin(admin, { userId: user.id, email: user.email || '', event: 'code_ok', ip, ua });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('staff code verify error:', e);
    return fail('কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন', 500);
  }
}