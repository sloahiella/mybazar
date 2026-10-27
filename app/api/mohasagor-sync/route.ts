import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const SYNC_KEY = process.env.SYNC_KEY || '';
const CHUNK = 8;

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
  for (let i = 0; i < 4; i++) {
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
    await new Promise((r) => setTimeout(r, 700 * (i + 1)));
  }
  return { products: [] as any[], lastPage: 1, ok: false };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (!SYNC_KEY || searchParams.get('key') !== SYNC_KEY) {
    return NextResponse.json({ ok: false, message: 'key ভুল বা সেট করা নেই' }, { status: 401 });
  }

  const run = parseInt(searchParams.get('run') || '0', 10) || 0;
  const runAt = run ? new Date(run * 1000).toISOString() : new Date().toISOString();

  // শেষ ধাপ: অ্যাসাইন করা পণ্য আপডেট ও মুছে যাওয়া পণ্যের হিসাব
  if (searchParams.get('finalize') === '1') {
    if (!run) return NextResponse.json({ ok: false, message: 'run দরকার' });
    const { error } = await supabase.rpc('finalize_mohasagor_sync', { run_at: runAt });
    if (error) return NextResponse.json({ ok: false, message: error.message });
    return NextResponse.json({ ok: true, finalized: true });
  }

  const from = Math.max(1, parseInt(searchParams.get('from') || '1', 10) || 1);
  const requested = (searchParams.get('pages') || '').split(',').map((s) => parseInt(s, 10)).filter((n) => n > 0);
  const pageList = requested.length ? requested : Array.from({ length: CHUNK }, (_, i) => from + i);

  const rowsMap = new Map<string, any>();
  const failed: number[] = [];
  let lastPage = 0;
  let reachedEnd = false;
  let fields: string[] = [];

  for (const pg of pageList) {
    if (lastPage && pg > lastPage) { reachedEnd = true; break; }
    const r = await fetchPage(pg);
    if (!r.ok) { failed.push(pg); continue; }
    lastPage = Math.max(lastPage, r.lastPage);
    if (!fields.length && r.products[0]) fields = Object.keys(r.products[0]);
    for (const p of r.products) {
      rowsMap.set(String(p.id), {
        id: p.id,
        name: p.name,
        category: p.category,
        product_code: String(p.product_code ?? ''),
        price: p.price,
        thumbnail_img: p.thumbnail_img,
        data: snapshotOf(p),
        synced_at: runAt,
      });
    }
  }

  if (!lastPage) {
    return NextResponse.json({ ok: false, message: 'মহাসাগর থেকে কোনো পেজ আনা যায়নি', pages: pageList, failedPages: failed });
  }

  const rows = Array.from(rowsMap.values());
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await supabase.from('mohasagor_catalog').upsert(rows.slice(i, i + 200), { onConflict: 'id' });
    if (error) return NextResponse.json({ ok: false, message: error.message, pages: pageList, failedPages: failed });
  }

  const done = !requested.length && (reachedEnd || pageList[pageList.length - 1] >= lastPage);
  return NextResponse.json({
    ok: true,
    pages: pageList,
    saved: rows.length,
    failedPages: failed,
    lastPage,
    done,
    nextFrom: done ? null : from + CHUNK,
    fields,
  });
}