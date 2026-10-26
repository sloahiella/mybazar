import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const SYNC_KEY = 'sloahiella123';
const CHUNK = 30;
const BATCH = 5;

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

function snapshotOf(p: any) {
  return {
    id: p.id,
    name: p.name,
    product_code: p.product_code,
    category: p.category,
    price: p.price,
    sale_price: p.sale_price,
    thumbnail_img: p.thumbnail_img,
    details: String(p.details || '').replace(/<[^>]*>/g, '').slice(0, 800),
    stock_status: p.stock_status,
    product_images: (p.product_images || p.product_image || []).slice(0, 6),
    product_variants: p.product_variants || p.product_variant || [],
  };
}

async function fetchPage(page: number) {
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(`https://mohasagor.com.bd/api/reseller/product?page=${page}`, {
        headers: {
          'api-key': process.env.MOHASAGOR_API_KEY || '',
          'secret-key': process.env.MOHASAGOR_SECRET_KEY || '',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data?.products)) {
        return { products: data.products as any[], lastPage: (data?.last_page || 1) as number, ok: true };
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return { products: [] as any[], lastPage: 1, ok: false };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('key') !== SYNC_KEY) {
    return NextResponse.json({ ok: false, message: 'key ভুল' }, { status: 401 });
  }
  const from = Math.max(1, parseInt(searchParams.get('from') || '1', 10) || 1);

  const { data: assigns } = await supabase
    .from('mohasagor_assignments')
    .select('mohasagor_product_id, page_id')
    .range(0, 9999);
  const byMoha = new Map((assigns || []).map((a: any) => [String(a.mohasagor_product_id), a]));

  const first = await fetchPage(from);
  if (!first.ok) return NextResponse.json({ ok: false, message: 'মহাসাগর থেকে পেজ আনা যায়নি', from });

  const to = Math.min(from + CHUNK - 1, first.lastPage);
  let found: any[] = [...first.products];
  for (let start = from + 1; start <= to; start += BATCH) {
    const batch = [];
    for (let p = start; p < start + BATCH && p <= to; p++) batch.push(fetchPage(p));
    const results = await Promise.all(batch);
    results.forEach((r) => { found = found.concat(r.products); });
  }

  const rowsMap = new Map<string, any>();
  for (const p of found) {
    const a: any = byMoha.get(String(p.id));
    if (a) rowsMap.set(String(p.id), { mohasagor_product_id: a.mohasagor_product_id, page_id: a.page_id, product_data: snapshotOf(p) });
  }
  const rows = Array.from(rowsMap.values());

  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await supabase.from('mohasagor_assignments').upsert(rows.slice(i, i + 200), { onConflict: 'mohasagor_product_id' });
    if (error) return NextResponse.json({ ok: false, message: error.message, from });
  }

  return NextResponse.json({ ok: true, from, to, lastPage: first.lastPage, updated: rows.length, done: to >= first.lastPage, nextFrom: to + 1 });
}