import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 10;

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const TIMEOUT = Symbol('timeout');
function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(TIMEOUT), ms))]);
}

// সবসময় JSON, সবসময় status 200, যাতে মেক ভেঙে না যায়
function reply(body) {
  return NextResponse.json(body, { status: 200, headers: corsHeaders });
}

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
function toAsciiDigits(s) {
  return s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

function finalPrice(price, discount) {
  const p = Number(price) || 0;
  const d = Number(discount) || 0;
  return d > 0 ? Math.round(p * (1 - d / 100)) : p;
}

function mohaInStock(pd) {
  const s = String(pd?.stock_status || '').toLowerCase();
  return !(s.includes('out') || s.includes('unavailable'));
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ----- পণ্য খোঁজা -----
async function searchByTerm(term, code) {
  const safe = term.replace(/[,()%*\\]/g, ' ').trim().slice(0, 80);

  let ownQ = supabase
    .from('products')
    .select('name, name_bn, price_per_unit, discount_percent, product_code, category, category_bn, stock(quantity)')
    .eq('is_active', true)
    .limit(5);
  let catQ = supabase
    .from('mohasagor_catalog')
    .select('id, name, category, product_code, price')
    .limit(30);

  if (code) {
    ownQ = ownQ.eq('product_code', code);
    catQ = catQ.eq('product_code', code);
  } else {
    if (!safe) return [];
    ownQ = ownQ.or(`name.ilike.%${safe}%,name_bn.ilike.%${safe}%,category.ilike.%${safe}%,category_bn.ilike.%${safe}%`);
    catQ = catQ.or(`name.ilike.%${safe}%,category.ilike.%${safe}%`);
  }

  const [ownRes, catRes] = await Promise.all([ownQ, catQ]);
  const results = [];

  (ownRes.data || []).forEach((p) => {
    const qty = Number(p.stock?.[0]?.quantity) || 0;
    results.push({
      product_name: p.name_bn || p.name,
      product_code: p.product_code,
      retail_price: finalPrice(p.price_per_unit, p.discount_percent),
      category: p.category_bn || p.category,
      in_stock: qty > 0,
    });
  });

  // মহাসাগরের পণ্যের মধ্যে শুধু যেগুলো সাইটে অ্যাসাইন করা আছে
  const catRows = catRes.data || [];
  if (catRows.length > 0) {
    const ids = catRows.map((c) => c.id);
    const { data: assigns } = await supabase
      .from('mohasagor_assignments')
      .select('mohasagor_product_id, custom_price, discount_percent, product_data')
      .in('mohasagor_product_id', ids);
    const byId = new Map((assigns || []).map((a) => [String(a.mohasagor_product_id), a]));
    for (const c of catRows) {
      const a = byId.get(String(c.id));
      if (!a || !a.product_data) continue;
      const base = a.custom_price != null ? a.custom_price : c.price;
      results.push({
        product_name: c.name,
        product_code: c.product_code,
        retail_price: finalPrice(base, a.discount_percent),
        category: c.category,
        in_stock: mohaInStock(a.product_data),
      });
    }
  }

  return results.slice(0, 5);
}

async function searchProducts(rawText) {
  const text = toAsciiDigits(rawText);
  const codeMatch = text.match(/\d{3,}/);
  const code = codeMatch ? codeMatch[0] : null;

  if (code) {
    const byCode = await searchByTerm(text, code);
    if (byCode.length > 0) return byCode;
  }

  const words = text.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w.length >= 2);
  const phrase = words.join(' ');
  if (phrase) {
    const byPhrase = await searchByTerm(phrase, null);
    if (byPhrase.length > 0) return byPhrase;
  }

  const longest = [...words].sort((a, b) => b.length - a.length)[0];
  if (longest && longest !== phrase) return await searchByTerm(longest, null);
  return [];
}

export async function POST(request) {
  const empty = { success: false, found: false, count: 0, products: [] };
  try {
    let body = {};
    try { body = await request.json(); } catch { body = {}; }
    const rawText = String(body.query || body.message || body.product_code || body.name || '').trim();
    if (!rawText) return reply({ ...empty, message: 'query দেওয়া হয়নি' });

    const result = await withTimeout(searchProducts(rawText), 4500);
    if (result === TIMEOUT) return reply({ ...empty, message: 'সাময়িক সমস্যা, একটু পরে চেষ্টা করুন' });

    return reply({
      success: true,
      found: result.length > 0,
      count: result.length,
      products: result,
      ...(result.length === 0 ? { message: 'কোনো পণ্য খুঁজে পাওয়া যায়নি' } : {}),
    });
  } catch (e) {
    console.error('ai-chat error:', e);
    return reply({ ...empty, message: 'সাময়িক সমস্যা হয়েছে, একটু পরে চেষ্টা করুন' });
  }
}

// ----- র‍্যান্ডম পণ্য (ফেসবুকে অটো-পোস্টের জন্য) -----
async function randomProduct() {
  const [ownC, mohaC] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('mohasagor_assignments').select('mohasagor_product_id', { count: 'exact', head: true }).not('product_data', 'is', null),
  ]);
  const own = ownC.count || 0;
  const moha = mohaC.count || 0;
  const total = own + moha;
  if (total === 0) return null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const r = Math.floor(Math.random() * total);

    if (r < own) {
      const { data } = await supabase
        .from('products')
        .select('id, name, name_bn, price_per_unit, discount_percent, description, image_url, product_images(image_url), stock(quantity)')
        .eq('is_active', true)
        .order('id')
        .range(r, r);
      const p = data && data[0];
      if (!p || !(Number(p.stock?.[0]?.quantity) > 0)) continue;
      const images = [];
      if (p.image_url) images.push(p.image_url);
      (p.product_images || []).forEach((im) => { if (im.image_url && !images.includes(im.image_url)) images.push(im.image_url); });
      return {
        product_name: p.name_bn || p.name,
        price: finalPrice(p.price_per_unit, p.discount_percent),
        description: String(p.description || '').split('\nSize:')[0].slice(0, 200),
        images,
        buy_link: `https://sohelmart.com/?product=${p.id}`,
      };
    }

    const idx = r - own;
    const { data } = await supabase
      .from('mohasagor_assignments')
      .select('mohasagor_product_id, custom_price, discount_percent, product_data')
      .not('product_data', 'is', null)
      .order('mohasagor_product_id')
      .range(idx, idx);
    const a = data && data[0];
    const pd = a && a.product_data;
    if (!pd || !mohaInStock(pd)) continue;
    const images = [];
    if (pd.thumbnail_img) images.push(pd.thumbnail_img);
    (pd.product_images || []).forEach((im) => { const u = im.product_image; if (u && !images.includes(u)) images.push(u); });
    return {
      product_name: pd.name,
      price: finalPrice(a.custom_price != null ? a.custom_price : pd.price, a.discount_percent),
      description: String(pd.details || '').slice(0, 200),
      images,
      buy_link: `https://sohelmart.com/?product=moha-${a.mohasagor_product_id}`,
    };
  }
  return null;
}

export async function GET() {
  try {
    const result = await withTimeout(randomProduct(), 4500);
    if (result === TIMEOUT || !result) return reply({ success: false, message: 'এখন কোনো পণ্য পাওয়া যায়নি' });
    return reply({ success: true, ...result });
  } catch (e) {
    console.error('random product error:', e);
    return reply({ success: false, message: 'সাময়িক সমস্যা হয়েছে' });
  }
}