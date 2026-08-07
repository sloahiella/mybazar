import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

export async function POST(request) {
  try {
    const body = await request.json();
    const customerMessage = body.message || body.text || '';

    if (!customerMessage) {
      return NextResponse.json({ success: false, error: 'কোনো মেসেজ পাওয়া যায়নি' }, { status: 400 });
    }

    // ধাপ ১: কাস্টমারের মেসেজ থেকে সম্ভাব্য প্রোডাক্ট নাম দিয়ে ডাটাবেজে খোঁজা
    const { data: products } = await supabase
      .from('products')
      .select('name, name_bn, price_per_unit, description, category, category_bn')
      .or(`name.ilike.%${customerMessage}%,name_bn.ilike.%${customerMessage}%,category.ilike.%${customerMessage}%`)
      .eq('is_active', true)
      .limit(5);

    // ধাপ ২: প্রোডাক্ট তথ্য দিয়ে Gemini-কে প্রম্পট বানানো
    let productContext = 'কোনো মিলে যাওয়া প্রোডাক্ট পাওয়া যায়নি।';
    if (products && products.length > 0) {
      productContext = products.map(p =>
        `নাম: ${p.name_bn || p.name}, দাম: ${p.price_per_unit} টাকা, বিবরণ: ${p.description || 'নেই'}`
      ).join('\n');
    }

    const prompt = `তুমি SohelMart নামের একটি বাংলাদেশি অনলাইন শপের কাস্টমার সাপোর্ট সহকারী। কাস্টমার জিজ্ঞেস করেছে: "${customerMessage}"

আমাদের স্টোরে পাওয়া সম্ভাব্য প্রোডাক্ট তথ্য:
${productContext}

উপরের তথ্য ব্যবহার করে কাস্টমারকে বাংলায়, বন্ধুত্বপূর্ণ ও সংক্ষিপ্তভাবে উত্তর দাও। প্রোডাক্ট না পাওয়া গেলে সেটা জানিয়ে সাহায্যের জন্য বলো।`;

    // ধাপ ৩: Gemini API কল করা
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const geminiData = await geminiResponse.json();
    const aiAnswer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'দুঃখিত, উত্তর তৈরি করা যায়নি।';

    // ধাপ ৪: Make.com এ উত্তর ফেরত পাঠানো
    return NextResponse.json({
      success: true,
      answer: aiAnswer,
      matchedProducts: products?.length || 0,
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}