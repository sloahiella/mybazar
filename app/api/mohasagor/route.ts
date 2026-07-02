import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';

    const res = await fetch(
      `https://mohasagor.com.bd/api/reseller/product?page=1`,
      {
        method: 'GET',
        headers: {
          'api-key': process.env.MOHASAGOR_API_KEY || '',
          'secret-key': process.env.MOHASAGOR_SECRET_KEY || '',
          'Accept': 'application/json',
        },
       cache: 'no-store',
        next: { revalidate: 0 },
      }
    );

    const data = await res.json();
    console.log('Mohasagor raw response:', JSON.stringify(data).slice(0, 500));
    console.log('Status:', res.status);
    let products = data?.products || [];

    if (category) {
      products = products.filter((p: any) =>
        p.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    return NextResponse.json({ products, total: products.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}