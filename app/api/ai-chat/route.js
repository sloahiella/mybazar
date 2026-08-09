import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rawText = (body.query || body.message || body.product_code || body.name || '').toString().trim();

    if (!rawText) {
      return NextResponse.json(
        { success: false, message: 'query দেওয়া হয়নি' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 👑 ধাপ ১: বাক্যের মধ্যে থেকে সংখ্যা (প্রোডাক্ট কোড) নিজে থেকে বের করা
    const codeMatch = rawText.match(/\d{3,}/); // ৩ বা তার বেশি ডিজিটের সংখ্যা খুঁজবে
    const extractedCode = codeMatch ? codeMatch[0] : null;

    let results = [];

    // 👑 ধাপ ২: কোড দিয়ে সরাসরি খোঁজা (সবচেয়ে নির্ভুল)
    if (extractedCode) {
      const { data: ownByCode } = await supabase
        .from('products')
        .select('name, name_bn, price_per_unit, product_code, category, category_bn')
        .eq('product_code', extractedCode)
        .eq('is_active', true)
        .limit(1);
      if (ownByCode && ownByCode.length > 0) results = ownByCode;

      if (results.length === 0) {
        const res = await fetch(new URL('/api/mohasagor', request.url));
        const mohaData = await res.json();
        const mohaMatch = (mohaData.products || []).filter(
          (p) => String(p.product_code) === String(extractedCode)
        );
        results = mohaMatch.map((p) => ({
          name: p.name,
          name_bn: p.name,
          price_per_unit: p.price,
          product_code: p.product_code,
          category: p.category,
          category_bn: p.category,
        }));
      }
    }

    // 👑 ধাপ ৩: কোড দিয়ে না পেলে, নাম দিয়ে খোঁজা (বাংলা ও ইংরেজি দুটোতেই, আংশিক মিল হলেও চলবে)
    if (results.length === 0) {
      const { data: ownByName } = await supabase
        .from('products')
        .select('name, name_bn, price_per_unit, product_code, category, category_bn')
        .or(`name.ilike.%${rawText}%,name_bn.ilike.%${rawText}%,category.ilike.%${rawText}%,category_bn.ilike.%${rawText}%`)
        .eq('is_active', true)
        .limit(5);
      if (ownByName) results = ownByName;
    }

    // 👑 ধাপ ৪: এখনো না পেলে Mohasagor প্রোডাক্টেও নাম দিয়ে খোঁজা
    if (results.length === 0) {
      const res = await fetch(new URL('/api/mohasagor', request.url));
      const mohaData = await res.json();
      const lowerText = rawText.toLowerCase();
      const mohaMatch = (mohaData.products || [])
        .filter((p) => p.name?.toLowerCase().includes(lowerText) || p.category?.toLowerCase().includes(lowerText))
        .slice(0, 5);
      results = mohaMatch.map((p) => ({
        name: p.name,
        name_bn: p.name,
        price_per_unit: p.price,
        product_code: p.product_code,
        category: p.category,
        category_bn: p.category,
      }));
    }

    // 👑 ধাপ ৫: সাজানো JSON রেসপন্স - শুধু retail price, wholesale কখনো না
    if (results.length === 0) {
      return NextResponse.json(
        { success: true, found: false, count: 0, products: [], message: 'কোনো পণ্য খুঁজে পাওয়া যায়নি' },
        { headers: corsHeaders }
      );
    }

    const formattedProducts = results.map((p) => ({
      product_name: p.name_bn || p.name,
      product_code: p.product_code,
      retail_price: p.price_per_unit,
      category: p.category_bn || p.category,
    }));

    return NextResponse.json(
      {
        success: true,
        found: true,
        count: formattedProducts.length,
        products: formattedProducts,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('AI chat lookup error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}