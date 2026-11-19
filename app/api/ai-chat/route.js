import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

// বাইরের যেকোনো অ্যাপ (Make.com সহ) পড়তে পারবে
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'no-store',
};

const TIMEOUT = Symbol('timeout');
function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(TIMEOUT), ms))]);
}

// সবসময় JSON, সবসময় status 200
function reply(body) {
  return NextResponse.json(body, { status: 200, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
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

function oneLine(s, n) {
  return String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
}

// ----- শব্দ বিশ্লেষণ -----
const SYN = new Map(Object.entries({
  'লাল': ['red'], 'নীল': ['blue'], 'কালো': ['black'], 'সাদা': ['white'], 'সবুজ': ['green'],
  'হলুদ': ['yellow'], 'গোলাপি': ['pink'], 'বাদামি': ['brown'], 'ধূসর': ['grey', 'gray'],
  'জামা': ['shirt', 'dress', 'top'], 'শার্ট': ['shirt'], 'টিশার্ট': ['t-shirt', 'tshirt'],
  'প্যান্ট': ['pant', 'trouser'], 'ঘড়ি': ['watch'], 'জুতা': ['shoe', 'sandal'], 'ব্যাগ': ['bag'],
  'হুডি': ['hoodie'], 'জ্যাকেট': ['jacket'], 'ফোন': ['phone', 'mobile'], 'চার্জার': ['charger'],
  'ইয়ারবাড': ['earbud'], 'হেডফোন': ['headphone'], 'বোতল': ['bottle'], 'চশমা': ['sunglass', 'glass'],
  'বেল্ট': ['belt'], 'মানিব্যাগ': ['wallet'], 'টুপি': ['cap', 'hat'], 'বোরকা': ['borka', 'burqa'],
  'পাঞ্জাবি': ['panjabi'], 'শাড়ি': ['saree', 'sharee'],
  'oil': ['তেল'], 'rice': ['চাল'], 'salt': ['লবণ', 'লবন'], 'sugar': ['চিনি'], 'potato': ['আলু'],
  'onion': ['পেঁয়াজ', 'পিয়াজ'], 'egg': ['ডিম'], 'dal': ['ডাল'], 'lentil': ['ডাল'], 'vegetable': ['সবজি'],
}));

const STOP = new Set([
  'আছে', 'আছেন', 'কি', 'কী', 'কত', 'দাম', 'দিন', 'দেন', 'চাই', 'লাগবে', 'এর', 'এই', 'এটা', 'ওটা',
  'একটা', 'একটি', 'ভাই', 'আপু', 'আপনাদের', 'আপনার', 'আমি', 'আমার', 'টাকা', 'প্লিজ', 'কোথায়',
  'দেখান', 'দেখাও', 'ছবি', 'মত', 'মতো', 'এমন', 'এরকম',
  'hello', 'hi', 'price', 'the', 'is', 'are', 'do', 'you', 'have', 'show', 'me', 'please', 'any',
  'want', 'need', 'looking', 'for', 'and', 'with', 'pic', 'photo', 'image',
]);

const SUFFIXES = ['গুলোর', 'গুলো', 'গুলি', 'টার', 'টির', 'টা', 'টি', 'খানা', 'ের', 'কে', 'র'];
function stemOf(w) {
  for (const s of SUFFIXES) {
    if (w.endsWith(s) && w.length - s.length >= 2) return w.slice(0, -s.length);
  }
  return w;
}

// প্রতিটা শব্দের জন্য একটা দল: শব্দ, তার মূল রূপ, আর ইংরেজি/বাংলা সমার্থক
function buildGroups(text) {
  const words = toAsciiDigits(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP.has(w) && !/^\d+$/.test(w));
  const seen = new Set();
  const groups = [];
  for (const w of words.slice(0, 8)) {
    if (seen.has(w)) continue;
    seen.add(w);
    const variants = new Set([w]);
    const st = stemOf(w);
    if (st !== w) variants.add(st);
    for (const v of [w, st]) (SYN.get(v) || []).forEach((x) => variants.add(x));
    groups.push([...variants]);
  }
  return groups;
}

function cleanTerm(v) {
  return v.replace(/[,()%*\\"'.:]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ----- পণ্যকে একই চেহারায় আনা (কেনা দাম কখনও যায় না) -----
const OWN_SELECT = 'id, name, name_bn, price_per_unit, discount_percent, product_code, category, category_bn, description, image_url, product_images(image_url), stock(quantity)';
const MOHA_SELECT = 'mohasagor_product_id, custom_price, discount_percent, product_data, p_name, p_category';

function ownItem(p, matchType) {
  const qty = Number(p.stock?.[0]?.quantity) || 0;
  const dp = Number(p.discount_percent) || 0;
  return {
    product_name: p.name_bn || p.name,
    product_code: p.product_code,
    retail_price: finalPrice(p.price_per_unit, dp),
    original_price: dp > 0 ? Number(p.price_per_unit) : null,
    category: p.category_bn || p.category,
    description: oneLine(String(p.description || '').split('\nSize:')[0], 150),
    image_url: p.image_url || p.product_images?.[0]?.image_url || null,
    buy_link: `https://sohelmart.com/?product=${p.id}`,
    in_stock: qty > 0,
    match_type: matchType,
  };
}

function mohaItem(a, matchType) {
  const pd = a.product_data || {};
  const base = a.custom_price != null ? a.custom_price : pd.price;
  const dp = Number(a.discount_percent) || 0;
  return {
    product_name: pd.name,
    product_code: pd.product_code,
    retail_price: finalPrice(base, dp),
    original_price: dp > 0 ? Number(base) : null,
    category: pd.category,
    description: oneLine(pd.details, 150),
    image_url: pd.thumbnail_img || pd.product_images?.[0]?.product_image || null,
    buy_link: `https://sohelmart.com/?product=moha-${a.mohasagor_product_id}`,
    in_stock: mohaInStock(pd),
    match_type: matchType,
  };
}

// ----- খোঁজা -----
async function searchByCode(code) {
  const [ownRes, mohaRes] = await Promise.all([
    supabase.from('products').select(OWN_SELECT).eq('is_active', true).eq('product_code', code).limit(3),
    supabase.from('mohasagor_assignments').select(MOHA_SELECT).eq('p_code', code).limit(3),
  ]);
  return [
    ...(ownRes.data || []).map((p) => ownItem(p, 'exact')),
    ...(mohaRes.data || []).map((a) => mohaItem(a, 'exact')),
  ];
}

async function searchByGroups(groups) {
  const variants = [];
  groups.forEach((g) => g.forEach((v) => {
    const c = cleanTerm(v);
    if (c && !variants.includes(c)) variants.push(c);
  }));
  const vs = variants.slice(0, 14);
  if (vs.length === 0) return { exact: [], similar: [] };

  const ownOr = vs.map((v) => `name.ilike.%${v}%,name_bn.ilike.%${v}%,category.ilike.%${v}%,category_bn.ilike.%${v}%`).join(',');
  const mohaOr = vs.map((v) => `p_name.ilike.%${v}%,p_category.ilike.%${v}%`).join(',');

  const [ownRes, mohaRes] = await Promise.all([
    supabase.from('products').select(OWN_SELECT).eq('is_active', true).or(ownOr).order('id', { ascending: false }).limit(40),
    supabase.from('mohasagor_assignments').select(MOHA_SELECT).or(mohaOr).order('mohasagor_product_id', { ascending: false }).limit(40),
  ]);

  const matchCount = (text) => {
    const t = text.toLowerCase();
    return groups.filter((g) => g.some((v) => t.includes(v.toLowerCase()))).length;
  };

  const scored = [];
  (ownRes.data || []).forEach((p) => {
    const m = matchCount(`${p.name || ''} ${p.name_bn || ''} ${p.category || ''} ${p.category_bn || ''}`);
    if (m > 0) scored.push({ m, item: ownItem(p, '') });
  });
  (mohaRes.data || []).forEach((a) => {
    const m = matchCount(`${a.p_name || ''} ${a.p_category || ''}`);
    if (m > 0) scored.push({ m, item: mohaItem(a, '') });
  });

  scored.sort((a, b) => (Number(b.item.in_stock) - Number(a.item.in_stock)) || (b.m - a.m));
  const exact = scored.filter((s) => s.m === groups.length).map((s) => ({ ...s.item, match_type: 'exact' }));
  const similar = scored.filter((s) => s.m < groups.length).map((s) => ({ ...s.item, match_type: 'similar' }));
  return { exact, similar };
}

// কিছুই না মিললে সাইটের কিছু স্টকে থাকা পণ্য
async function suggestions(n = 4) {
  const [ownRes, mohaRes] = await Promise.all([
    supabase.from('products').select(OWN_SELECT).eq('is_active', true).order('id', { ascending: false }).limit(8),
    supabase.from('mohasagor_assignments').select(MOHA_SELECT).not('product_data', 'is', null).order('mohasagor_product_id', { ascending: false }).limit(8),
  ]);
  const own = (ownRes.data || []).map((p) => ownItem(p, 'suggestion')).filter((i) => i.in_stock);
  const moha = (mohaRes.data || []).map((a) => mohaItem(a, 'suggestion')).filter((i) => i.in_stock);
  return [...own.slice(0, n / 2), ...moha.slice(0, n / 2)];
}

async function searchProducts(rawText) {
  const text = toAsciiDigits(rawText);
  const codeMatch = text.match(/\d{3,}/);
  if (codeMatch) {
    const byCode = await searchByCode(codeMatch[0]);
    if (byCode.length > 0) return { products: byCode.slice(0, 5), similar: [] };
  }
  const groups = buildGroups(text);
  if (groups.length > 0) {
    const { exact, similar } = await searchByGroups(groups);
    if (exact.length > 0) return { products: exact.slice(0, 5), similar: similar.slice(0, 4) };
    if (similar.length > 0) return { products: [], similar: similar.slice(0, 4) };
  }
  return { products: [], similar: await suggestions(4), suggestionOnly: true };
}

async function runSearch(text) {
  const empty = { success: false, found: false, count: 0, products: [], similar_products: [] };
  const result = await withTimeout(searchProducts(text), 8000);
  if (result === TIMEOUT) return { ...empty, message: 'সাময়িক সমস্যা, একটু পরে চেষ্টা করুন' };
  const { products, similar, suggestionOnly } = result;
  return {
    success: true,
    found: products.length > 0,
    count: products.length,
    products,
    similar_products: similar,
    message: products.length > 0 ? undefined
      : suggestionOnly ? 'মিল পাওয়া যায়নি, তবে আমাদের কিছু পণ্য আছে'
      : 'সরাসরি এই পণ্য নেই, তবে একই ধরনের কিছু পণ্য আছে',
  };
}

// ----- অনুরোধ পড়া (JSON ভাঙা থাকলেও সাধারণ লেখা হিসেবে নেবে) -----
async function readBody(request) {
  let raw = '';
  try { raw = await request.text(); } catch { raw = ''; }
  if (!raw) return {};
  try {
    const j = JSON.parse(raw);
    return j && typeof j === 'object' ? j : { query: String(j) };
  } catch {}
  if (raw.includes('=') && !raw.includes(' ')) {
    try { return Object.fromEntries(new URLSearchParams(raw)); } catch {}
  }
  return { query: raw };
}

function collectText(b) {
  const parts = [];
  for (const k of ['query', 'message', 'description', 'image_description', 'keywords', 'name', 'product_code', 'text', 'q']) {
    const v = b?.[k];
    if (Array.isArray(v)) parts.push(v.join(' '));
    else if (v != null && typeof v !== 'object') parts.push(String(v));
  }
  return parts.join(' ').trim().slice(0, 500);
}

export async function POST(request) {
  try {
    const body = await readBody(request);
    const text = collectText(body);
    if (!text) {
      return reply({ success: false, found: false, count: 0, products: [], similar_products: [], message: 'query বা keywords দেওয়া হয়নি' });
    }
    return reply(await runSearch(text));
  } catch (e) {
    console.error('ai-chat error:', e);
    return reply({ success: false, found: false, count: 0, products: [], similar_products: [], message: 'সাময়িক সমস্যা হয়েছে, একটু পরে চেষ্টা করুন' });
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
        description: oneLine(String(p.description || '').split('\nSize:')[0], 200),
        image_url: images[0] || null,
        images,
        buy_link: `https://sohelmart.com/?product=${p.id}`,
        in_stock: true,
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
      description: oneLine(pd.details, 200),
      image_url: images[0] || null,
      images,
      buy_link: `https://sohelmart.com/?product=moha-${a.mohasagor_product_id}`,
      in_stock: true,
    };
  }
  return null;
}

// GET: ?q=... দিলে খোঁজে, কিছু না দিলে একটা র‍্যান্ডম পণ্য দেয়
export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const text = collectText({
      q: sp.get('q'), query: sp.get('query'), keywords: sp.get('keywords'),
      description: sp.get('description'), name: sp.get('name'), product_code: sp.get('product_code'),
    });
    if (text) return reply(await runSearch(text));

    const result = await withTimeout(randomProduct(), 8000);
    if (result === TIMEOUT || !result) return reply({ success: false, message: 'এখন কোনো পণ্য পাওয়া যায়নি' });
    return reply({ success: true, ...result });
  } catch (e) {
    console.error('ai-chat GET error:', e);
    return reply({ success: false, message: 'সাময়িক সমস্যা হয়েছে' });
  }
}