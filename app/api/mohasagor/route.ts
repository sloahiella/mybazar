import { NextResponse } from 'next/server';

export const maxDuration = 60;

const MAX_PAGES = 10;

// সর্বশেষ সম্পূর্ণ সফল তালিকা মনে রাখা হয়, কোনো পেজ ফেল করলে এটাই দেখানো হবে
let lastGood: any[] = [];

async function fetchPage(page: number, attempts = 3): Promise<{ products: any[]; lastPage: number; ok: boolean }> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`https://mohasagor.com.bd/api/reseller/product?page=${page}`, {
        method: 'GET',
        headers: {
          'api-key': process.env.MOHASAGOR_API_KEY || '',
          'secret-key': process.env.MOHASAGOR_SECRET_KEY || '',
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = await res.json();
        return { products: data?.products || [], lastPage: data?.last_page || 1, ok: true };
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 400 * (i + 1)));
  }
  return { products: [], lastPage: 1, ok: false };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';

    const first = await fetchPage(1);
    let allOk = first.ok;
    const lastPage = Math.min(first.lastPage, MAX_PAGES);
    let allProducts: any[] = [...first.products];

    for (let p = 2; p <= lastPage; p++) {
      const r = await fetchPage(p);
      allProducts = allProducts.concat(r.products);
      if (!r.ok) allOk = false;
    }

    if (allOk && allProducts.length > 0) {
      lastGood = allProducts;
    } else if (lastGood.length > 0) {
      allProducts = lastGood;
      allOk = false;
    }

    if (category) {
      allProducts = allProducts.filter((p: any) =>
        p.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    return NextResponse.json(
      { products: allProducts, total: allProducts.length },
      {
        headers: {
          'Cache-Control':
            allOk && allProducts.length > 0
              ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=600'
              : 'no-store',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}