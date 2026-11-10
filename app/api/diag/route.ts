import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET() {
  const k = process.env.SUPABASE_SECRET_KEY || '';
  const admin = createClient('https://jthdtmqrapnfmmmeuqsw.supabase.co', k || 'missing');
  const { count, error } = await admin.from('customers').select('*', { count: 'exact', head: true });
  return NextResponse.json({ keyPrefix: k.slice(0, 10), keyLength: k.length, customersVisible: count, error: error?.message || null });
}