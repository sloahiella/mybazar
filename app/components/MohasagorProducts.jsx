'use client';
import { useEffect, useState } from 'react';

export default function MohasagorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/mohasagor')
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setProducts(data.products || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>লোড হচ্ছে...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red' }}>সমস্যা: {error}</p>;

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: '#db2777', marginBottom: '16px' }}>মহাসাগর প্রোডাক্ট ({products.length}টি)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {products.map((p, i) => (
          <div key={p.id || i} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />}
            <div style={{ padding: '10px' }}>
              <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#1f2937', margin: '0 0 4px 0' }}>{p.name}</p>
              <p style={{ color: '#db2777', fontWeight: 'bold', fontSize: '15px', margin: 0 }}>৳{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}