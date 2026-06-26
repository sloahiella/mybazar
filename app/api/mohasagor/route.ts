import { NextResponse } from 'next/server';

const API_KEY = process.env.MOHASAGOR_API_KEY || '';
const SECRET_KEY = process.env.MOHASAGOR_SECRET_KEY || '';

export async function GET() {
  try {
    let allProducts: any[] = [];
    let currentPage = 1;
    let lastPage = 1;

    do {
      const res = await fetch(
        `https://mohasagor.com.bd/api/reseller/product?page=${currentPage}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'X-Secret-Key': SECRET_KEY,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      const data = await res.json();
      lastPage = data.last_page || 1;
      allProducts = [...allProducts, ...(data.data || [])];
      currentPage++;

    } while (currentPage <= lastPage);

    return NextResponse.json({ products: allProducts, total: allProducts.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}