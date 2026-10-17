import { NextResponse } from 'next/server';

const MAX_PAGES = 10;

async function fetchPage(page: number): Promise<{ products: any[]; lastPage: number; ok: boolean }> {
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
    if (!res.ok) return { products: [], lastPage: 1, ok: false };
    const data = await res.json();
    return { products: data?.products || [], lastPage: data?.last_page || 1, ok: true };
  } catch {
    return { products: [], lastPage: 1, ok: false };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';

    const first = await fetchPage(1);
    const lastPage = Math.min(first.lastPage, MAX_PAGES);
    let allProducts: any[] = [...first.products];
    let allOk = first.ok;

    // বাকি পেজগুলো ৩টা করে একসাথে আনা হচ্ছে
    for (let start = 2; start <= lastPage; start += 3) {
      const batch = [];
      for (let p = start; p < start + 3 && p <= lastPage; p++) batch.push(fetchPage(p));
      const results = await Promise.all(batch);
      for (const r of results) {
        allProducts = allProducts.concat(r.products);
        if (!r.ok) allOk = false;
      }
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