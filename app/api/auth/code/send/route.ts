import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminClient, bearerToken, sessionIdFromToken, logLogin } from '../../../_lib/adminAuth';
import { clientIp, allowed, tooMany } from '../../../_lib/rateLimit';

export const runtime = 'nodejs';

const TTL_MS = 5 * 60 * 1000;
const fail = (message: string, status = 400) => NextResponse.json({ ok: false, message }, { status });

function hash(sessionId: string, code: string) {
  return crypto.createHash('sha256').update(`${sessionId}:${code}:${process.env.OTP_SECRET}`).digest('hex');
}

function mask(email: string) {
  const [u, d] = email.split('@');
  return `${u.slice(0, 2)}***@${d}`;
}

export async function POST(request: Request) {
  try {
    const admin = getAdminClient();
    const token = bearerToken(request);
    if (!token) return fail('লগইন সেশন পাওয়া যায়নি', 401);

    const { data: u, error: uErr } = await admin.auth.getUser(token);
    const user = u?.user;
    if (uErr || !user || !user.email) return fail('লগইন সেশন পাওয়া যায়নি', 401);

    const sessionId = sessionIdFromToken(token);
    if (!sessionId) return fail('সেশন চেনা যায়নি, আবার লগইন করুন', 401);

    const ip = clientIp(request);
    const ua = String(request.headers.get('user-agent') || '').slice(0, 160);
    if (!(await allowed(admin, `staffcode-send:${user.id}`, 5, 3600))) return tooMany();
    if (!(await allowed(admin, `staffcode-ip:${ip}`, 30, 3600))) return tooMany();

    // এই লগইনের কোনো স্টাফ ভূমিকা আছে কিনা (নইলে কোড পাঠানো হয় না)
    const email = user.email.toLowerCase();
    const [adm, rid, sel] = await Promise.all([
      admin.from('admins').select('email'),
      admin.from('riders').select('id').eq('user_id', user.id).eq('is_approved', true).limit(1),
      admin.from('sellers').select('id').eq('profile_id', user.id).limit(1),
    ]);
    const hasRole =
      (adm.data || []).some((a: any) => String(a.email || '').toLowerCase() === email) ||
      (rid.data?.length ?? 0) > 0 ||
      (sel.data?.length ?? 0) > 0;
    if (!hasRole) return fail('এই অ্যাকাউন্টে কোনো প্যানেলের অনুমতি নেই');

    const code = String(crypto.randomInt(100000, 1000000));
    const { error: upErr } = await admin.from('staff_codes').upsert({
      session_id: sessionId,
      user_id: user.id,
      code_hash: hash(sessionId, code),
      expires_at: new Date(Date.now() + TTL_MS).toISOString(),
      attempts: 0,
    });
    if (upErr) {
      console.error('staff_codes upsert error:', upErr.message);
      return fail('কোড তৈরি করা যায়নি, আবার চেষ্টা করুন', 500);
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.OTP_FROM,
        to: [user.email],
        subject: 'সোহেল মার্ট: লগইন কোড',
        text:
          `আপনার লগইন কোড: ${code}\n\n` +
          `কেউ আপনার অ্যাকাউন্টে (${user.email}) লগইনের চেষ্টা করছে।\n` +
          `আইপি: ${ip}\nডিভাইস: ${ua}\n\n` +
          `কোডটি ৫ মিনিট কাজ করবে। এটা আপনি না হলে কাউকে কোড দেবেন না, আর পাসওয়ার্ড বদলে ফেলুন।`,
      }),
    });
    if (!res.ok) {
      console.error('Resend error', res.status, await res.text());
      return fail('কোড পাঠানো যায়নি। একটু পরে চেষ্টা করুন।', 502);
    }

    await logLogin(admin, { userId: user.id, email: user.email, event: 'code_sent', ip, ua });
    return NextResponse.json({ ok: true, maskedEmail: mask(user.email) });
  } catch (e) {
    console.error('staff code send error:', e);
    return fail('কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন', 500);
  }
}