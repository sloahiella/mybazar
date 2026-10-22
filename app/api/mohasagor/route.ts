import { NextResponse } from 'next/server';

export const maxDuration = 60;

const MAX_PAGES = 100;
const BATCH = 5;
const FRESH_MS = 10 * 60 * 1000;

let lastGood: any[] = [];
let lastGoodTime = 0;

async function fetchPage(page: number, attempts = 2): Promise<{ products: any[]; lastPage: number; ok: boolean; info: string }> {
  let info = '';
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`https://mohasagor.com.bd/api/reseller/product?page=${page}`, {
        method: 'GET',
        headers: {
          'api-key': process.env.MOHASAGOR_API_KEY || '',
          'secret-key': process.env.MOHASAGOR_SECRET_KEY || '',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (res.ok && Array.isArray(data?.products)) {
          return { products: data.products, lastPage: data?.last_page || 1, ok: true, info: '' };
        }
        info = `status ${res.status}: ${text.slice(0, 200)}`;
      } catch {
        info = `status ${res.status} (not JSON): ${text.slice(0, 200)}`;
      }
    } catch (e: any) {
      info = `fetch error: ${e?.message || e}`;
    }
    await new Promise((r) => setTimeout(r, 500 * (i + 1)));
  }
  return { products: [], lastPage: 1, ok: false, info };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const filter = (list: any[]) =>
      category ? list.filter((p: any) => p.category?.toLowerCase().includes(category.toLowerCase())) : list;

    if (lastGood.length > 0 && Date.now() - lastGoodTime < FRESH_MS) {
      const list = filter(lastGood);
      return NextResponse.json(
        { products: list, total: list.length },
        { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=600' } }
      );
    }

    const first = await fetchPage(1);
    let allOk = first.ok;
    const problems: string[] = first.ok ? [] : [`page 1 -> ${first.info}`];
    const lastPage = Math.min(first.lastPage, MAX_PAGES);
    let all: any[] = [...first.products];

    for (let start = 2; start <= lastPage; start += BATCH) {
      const batch = [];
      for (let p = start; p < start + BATCH && p <= lastPage; p++) batch.push(fetchPage(p));
      const results = await Promise.all(batch);
      results.forEach((r, i) => {
        all = all.concat(r.products);
        if (!r.ok) { allOk = false; problems.push(`page ${start + i} -> ${r.info}`); }
      });
    }

    if (allOk && all.length > 0) {
      lastGood = all;
      lastGoodTime = Date.now();
    } else if (lastGood.length > 0) {
      all = lastGood;
    }

    const list = filter(all);
    const body: any = { products: list, total: list.length, pages: lastPage };
    if (problems.length > 0) body.debug = problems.slice(0, 3);

    return NextResponse.json(body, {
      headers: {
        'Cache-Control':
          allOk && all.length > 0
            ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=600'
            : 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}