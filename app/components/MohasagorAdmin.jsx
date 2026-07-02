'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MohasagorAdmin({ branchId = 1 }) {
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const res = await fetch('/api/mohasagor');
    const data = await res.json();
    setProducts(data.products || []);

    const { data: pagesData } = await supabase
      .from('pages').select('id, name, name_bn, parent_id').eq('branch_id', branchId).order('sort_order');
    setPages(pagesData || []);

    const { data: assignData } = await supabase.from('mohasagor_assignments').select('*');
    const map = {};
    (assignData || []).forEach(a => { map[a.mohasagor_product_id] = a; });
    setAssignments(map);
    setLoading(false);
  }

  async function assignProduct(productId, pageId) {
    setSaving(prev => ({ ...prev, [productId]: true }));
    const existing = assignments[productId];
    if (existing) {
      await supabase.from('mohasagor_assignments').update({ page_id: pageId }).eq('mohasagor_product_id', productId);
    } else {
      await supabase.from('mohasagor_assignments').insert({ mohasagor_product_id: productId, page_id: pageId });
    }
    setAssignments(prev => ({ ...prev, [productId]: { mohasagor_product_id: productId, page_id: pageId } }));
    setSaving(prev => ({ ...prev, [productId]: false }));
  }

  async function removeAssignment(productId) {
    setSaving(prev => ({ ...prev, [productId]: true }));
    await supabase.from('mohasagor_assignments').delete().eq('mohasagor_product_id', productId);
    setAssignments(prev => { const n = { ...prev }; delete n[productId]; return n; });
    setSaving(prev => ({ ...prev, [productId]: false }));
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p style={{ textAlign: 'center', padding: '40px', color: '#1f2937' }}>লোড হচ্ছে...</p>;

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color: '#db2777', marginBottom: '12px', fontSize: '15px' }}>মহাসাগর প্রোডাক্ট অ্যাসাইন ({products.length}টি)</h2>
      <input
        placeholder="প্রোডাক্ট বা category খুঁজুন..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '12px', fontSize: '14px', color: '#1f2937', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: assignments[p.id] ? '#fdf2f8' : '#f9fafb', borderRadius: '10px', padding: '10px', border: assignments[p.id] ? '1px solid #db2777' : '1px solid #e5e7eb' }}>
            <img src={p.thumbnail_img} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1f2937' }}>{p.name}</p>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{p.category} • ৳{p.price}</p>
            </div>
            <select
              value={assignments[p.id]?.page_id || ''}
              onChange={e => {
                if (e.target.value === '') removeAssignment(p.id);
                else assignProduct(p.id, parseInt(e.target.value));
              }}
              style={{ padding: '6px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '12px', flexShrink: 0, color: '#1f2937', background: 'white' }}
            >
              <option value="">-- পেজ নেই --</option>
              {pages.filter(pg => !pg.parent_id).map(pg => (
                <optgroup key={pg.id} label={pg.name_bn || pg.name}>
                  <option value={pg.id}>{pg.name_bn || pg.name}</option>
                  {pages.filter(sub => sub.parent_id === pg.id).map(sub => (
                    <option key={sub.id} value={sub.id}>　{sub.name_bn || sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {saving[p.id] && <span style={{ fontSize: '11px', color: '#db2777' }}>...</span>}
          </div>
        ))}
      </div>
    </div>
  );
}