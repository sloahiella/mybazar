import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

// CORS হেডার - অন্য সার্ভার (Make.com) থেকে রিকোয়েস্ট আসলে যেন ব্লক না হয়
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Make.com কখনো কখনো আগে একটা OPTIONS রিকোয়েস্ট পাঠায় যাচাই করার জন্য - সেটার জবাব
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const productCode = (body.product_code || body.code || '').toString().trim();

    if (!productCode) {
      return NextResponse.json(
        { success: false, message: 'product_code দেওয়া হয়নি' },
        { status: 400, headers: corsHeaders }
      );
    }

    // ধাপ ১: নিজের products টেবিলে খোঁজা
    const { data: ownProduct } = await supabase
      .from('products')
      .select('name, name_bn, price_per_unit, description, category, category_bn')
      .eq('product_code', productCode)
      .eq('is_active', true)
      .single();

    if (ownProduct) {
      return NextResponse.json(
        {
          success: true,
          found: true,
          product_name: ownProduct.name_bn || ownProduct.name,
          retail_price: ownProduct.price_per_unit,
          category: ownProduct.category_bn || ownProduct.category,
        },
        { headers: corsHeaders }
      );
    }

    // ধাপ ২: Mohasagor প্রোডাক্টে খোঁজা (product_code দিয়ে)
    const res = await fetch(new URL('/api/mohasagor', request.url));
    const mohaData = await res.json();
    const mohaProduct = (mohaData.products || []).find(
      (p) => String(p.product_code) === String(productCode)
    );

    if (mohaProduct) {
      return NextResponse.json(
        {
          success: true,
          found: true,
          product_name: mohaProduct.name,
          retail_price: mohaProduct.price, // 👑 শুধু খুচরা দাম, পাইকারি (sale_price) কখনো পাঠানো হবে না
          category: mohaProduct.category,
        },
        { headers: corsHeaders }
      );
    }

    // কোথাও পাওয়া না গেলে
    return NextResponse.json(
      { success: true, found: false, message: 'এই কোডে কোনো পণ্য পাওয়া যায়নি' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('AI chat product lookup error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}