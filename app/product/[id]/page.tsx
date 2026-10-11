import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

export const dynamic = 'force-dynamic';

async function getProduct(id: string) {
  const { data } = await supabase
    .from('products')
    .select('*, stock(*)')
    .eq('id', id)
    .eq('is_active', true)
    .single();
  return data;
}

function cleanDesc(desc?: string | null) {
  return (desc || '').split('\nSize:')[0].trim();
}

function finalPrice(p: any) {
  const d = Number(p.discount_percent) || 0;
  return Math.round(Number(p.price_per_unit) * (1 - d / 100));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) return { title: 'পণ্য পাওয়া যায়নি | Sohel Mart' };
  const title = `${p.name} - ৳${finalPrice(p)} | Sohel Mart`;
  const description = cleanDesc(p.description).slice(0, 150) || `${p.name} এখন সোহেল মার্টে। দাম ৳${finalPrice(p)}।`;
  return {
    title,
    description,
    alternates: { canonical: `https://sohelmart.com/product/${id}` },
    openGraph: {
      title,
      description,
      images: p.image_url ? [p.image_url] : [],
      type: 'website',
      url: `https://sohelmart.com/product/${id}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getProduct(id);

  if (!p) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>পণ্যটি পাওয়া যায়নি।</p>
        <a href="/" style={{ color: '#db2777' }}>সোহেল মার্টে ফিরুন</a>
      </div>
    );
  }

  const qty = Number(p.stock?.[0]?.quantity) || 0;
  const price = finalPrice(p);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: p.image_url ? [p.image_url] : undefined,
    description: cleanDesc(p.description) || p.name,
    sku: p.product_code ? String(p.product_code) : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: price,
      availability: qty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://sohelmart.com/product/${id}`,
    },
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <a href="/" style={{ color: '#db2777', fontSize: '14px', textDecoration: 'none' }}>← সোহেল মার্ট</a>
      {p.image_url && (
        <img src={p.image_url} alt={p.name} style={{ width: '100%', borderRadius: '12px', marginTop: '12px' }} />
      )}
      <h1 style={{ fontSize: '22px', color: '#1f2937', margin: '12px 0 4px' }}>{p.name}</h1>
      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#db2777', margin: '4px 0' }}>
        ৳{price} / {p.unit}
      </p>
      <p style={{ fontSize: '14px', color: qty > 0 ? '#15803d' : '#dc2626', fontWeight: 'bold' }}>
        {qty > 0 ? '✅ স্টকে আছে' : '🔴 স্টক আউট'}
      </p>
      {p.product_code && <p style={{ fontSize: '13px', color: '#6b7280' }}>পণ্য কোড: {p.product_code}</p>}
      <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{cleanDesc(p.description)}</p>
      {qty > 0 && (
        <a
          href={`/?product=${id}`}
          style={{ display: 'block', textAlign: 'center', background: '#db2777', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none', marginTop: '16px' }}
        >
          🛒 অর্ডার করতে এখানে চাপুন
        </a>
      )}
    </div>
  );
}