'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

function PageSelector({ pages, value, onChange }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  
 const selected = pages.find(p => String(p.id) === String(value));
 const parentPages = pages.filter(p => !p.parent_id); 
 const filtered = search 
    ? pages.filter(p => (p.name_bn || p.name).toLowerCase().includes(search.toLowerCase()))
    : pages;

  return (
    <div style={{ position: 'relative', flexShrink: 0, width: '160px' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '12px', cursor: 'pointer', background: 'white', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {selected ? (selected.name_bn || selected.name) : '-- পেজ নেই --'}
      </div>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 999, background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '220px' }}>
          <input
            autoFocus
            placeholder="পেজ খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px', border: 'none', borderBottom: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', color: '#1f2937', boxSizing: 'border-box' }}
          />
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <div
              onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
              style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', color: '#6b7280' }}
            >-- পেজ নেই --</div>
         {search ? filtered.map(pg => (
              <div
                key={pg.id}
                onClick={() => { onChange(pg.id); setOpen(false); setSearch(''); }}
                style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', color: '#1f2937', background: String(value) === String(pg.id) ? '#fdf2f8' : 'white', paddingLeft: pg.parent_id ? '24px' : '12px' }}
              >
                {pg.parent_id ? '↳ ' : ''}{pg.name_bn || pg.name}
              </div>
            )) : parentPages.map(pg => (
              <div key={pg.id}>
                <div
                  onClick={() => { onChange(pg.id); setOpen(false); setSearch(''); }}
                  style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', color: '#1f2937', fontWeight: 'bold', background: String(value) === String(pg.id) ? '#fdf2f8' : 'white' }}
                >
                  {pg.name_bn || pg.name}
                </div>
                {pages.filter(sub => String(sub.parent_id) === String(pg.id)).map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => { onChange(sub.id); setOpen(false); setSearch(''); }}
                    style={{ padding: '6px 12px 6px 24px', fontSize: '12px', cursor: 'pointer', color: '#6b7280', background: String(value) === String(sub.id) ? '#fdf2f8' : 'white' }}
                  >
                    ↳ {sub.name_bn || sub.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MohasagorAdmin({ branchId = 1, onAssign }) {
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

    const { data: assignData } = await supabase.from('mohasagor_assignments').select('*').range(0, 9999);
  const map = {};
    (assignData || []).forEach(a => { map[String(a.mohasagor_product_id)] = a; });
    setAssignments(map);
    setLoading(false);
  }

  async function assignProduct(productId, pageId) {
    const pid = String(productId);
    setSaving(prev => ({ ...prev, [pid]: true }));
    if (pageId === '') {
      const { error } = await supabase.from('mohasagor_assignments').delete().eq('mohasagor_product_id', productId);
      if (error) { alert('মুছতে সমস্যা: ' + error.message); console.error('Delete error:', error); }
      setAssignments(prev => { const n = { ...prev }; delete n[pid]; return n; });
    } else {
      const { error } = await supabase
        .from('mohasagor_assignments')
        .upsert({ mohasagor_product_id: parseInt(productId), page_id: parseInt(pageId) }, { onConflict: 'mohasagor_product_id' });
      if (error) {
        alert('সেভ করতে সমস্যা হয়েছে: ' + error.message + ' (কোড: ' + error.code + ')');
        console.error('Upsert error:', error);
      } else {
        setAssignments(prev => ({ ...prev, [pid]: { mohasagor_product_id: productId, page_id: pageId } }));
      }
    }
    setSaving(prev => ({ ...prev, [pid]: false }));
    if (onAssign) onAssign();
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
         <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: assignments[String(p.id)] ? '#fdf2f8' : '#f9fafb', borderRadius: '10px', padding: '10px', border: assignments[String(p.id)] ? '1px solid #db2777' : '1px solid #e5e7eb' }}>
            <img src={p.thumbnail_img} alt={p.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1f2937' }}>{p.name}</p>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{p.category} • ৳{p.price}</p>
            </div>
            <PageSelector
              pages={pages}
              value={assignments[String(p.id)]?.page_id || ''}
              onChange={(pageId) => assignProduct(p.id, pageId)}
            />
            {saving[String(p.id)] && <span style={{ fontSize: '11px', color: '#db2777' }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}