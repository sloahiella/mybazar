import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';

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
          next: { revalidate: 3600 },
        }
      );

      const data = await res.json();
      lastPage = data?.last_page || 1;
      const items = data?.products || [];
      allProducts = [...allProducts, ...items];
      currentPage++;

    } while (currentPage <= lastPage && currentPage <= 10);

    if (category) {
      allProducts = allProducts.filter((p: any) =>
        p.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    return NextResponse.json({ products: allProducts, total: allProducts.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}