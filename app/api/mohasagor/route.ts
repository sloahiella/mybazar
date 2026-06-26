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
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      const data = await res.json();
      console.log('Mohasagor response:', JSON.stringify(data).slice(0, 300));
      
      lastPage = data?.data?.last_page || data?.last_page || 1;
      const items = data?.data?.data || data?.data || data?.products || [];
      allProducts = [...allProducts, ...items];
      currentPage++;

    } while (currentPage <= lastPage);

    return NextResponse.json({ products: allProducts, total: allProducts.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}