import { NextResponse } from 'next/server';

export function clientIp(request: Request) {
  const xf = request.headers.get('x-forwarded-for') || '';
  return xf.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
}

// ডাটাবেজে সমস্যা হলে সাইট আটকানো হয় না (ঝুঁকি: তখন সীমা কাজ করবে না)
export async function allowed(admin: any, key: string, limit: number, windowSeconds: number) {
  const { data, error } = await admin.rpc('hit_rate_limit', { p_key: key, p_limit: limit, p_window_seconds: windowSeconds });
  if (error) return true;
  return data === true;
}

export function tooMany() {
  return NextResponse.json({ ok: false, message: 'অনেক বেশি অনুরোধ। একটু পরে আবার চেষ্টা করুন।' }, { status: 429 });
}