import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let allProducts: any[] = [];
    let currentPage = 1;
    let lastPage = 1;

    do {
      const res = await fetch(
        `https://mohasagor.com.bd/api/reseller/product?page=${currentPage}`,
        {
          method: 'GET',
          headers: {
            'api-key': process.env.MOHASAGOR_API_KEY || '',
            'secret-key': process.env.MOHASAGOR_SECRET_KEY || '',
            'Accept': 'application/json',
          },
          cache: 'no-store',
        }
      );

      const data = await res.json();
      lastPage = data?.last_page || 1;
      const items = data?.products || [];
      allProducts = [...allProducts, ...items];
      currentPage++;

    } while (currentPage <= lastPage);

    return NextResponse.json({ products: allProducts, total: allProducts.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}