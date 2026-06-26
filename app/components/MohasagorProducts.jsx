'use client';
import { useEffect, useState } from 'react';

export default function MohasagorProducts({ mohasagorCategory }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mohasagorCategory) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/mohasagor?category=${encodeURIComponent(mohasagorCategory)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setProducts(data.products || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [mohasagorCategory]);

  if (!mohasagorCategory) return null;
  if (loading) return <p style={{ textAlign: 'center', padding: '20px' }}>লোড হচ্ছে...</p>;
  if (error) return null;
  if (products.length === 0) return null;

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: '#db2777', marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
        🛍️ রিসেলার প্রোডাক্ট ({products.length}টি)
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {products.map((p, i) => (
          <div key={p.id || i} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            {p.thumbnail_img && <img src={p.thumbnail_img} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />}
            <div style={{ padding: '10px' }}>
              <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#1f2937', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <p style={{ color: '#db2777', fontWeight: 'bold', fontSize: '15px', margin: 0 }}>৳{p.sale_price}</p>
                {p.price > p.sale_price && <p style={{ color: '#9ca3af', fontSize: '12px', textDecoration: 'line-through', margin: 0 }}>৳{p.price}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}