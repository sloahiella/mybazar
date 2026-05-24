
'use client';
import CustomerAuth from './CustomerAuth';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import OrderForm from './OrderForm';
import PageMenu from './PageMenu';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

function isOfficeOpen() {
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  return totalMinutes >= 570 && totalMinutes <= 1290;
}
function CategoryGrid({ branch, onSelectPage }) {
  const [pages, setPages] = useState([]);
  const [pageProducts, setPageProducts] = useState({});

  useEffect(() => { fetchPages(); }, [branch]);

  async function fetchPages() {
    const { data } = await supabase.from('pages').select('*')
      .eq('branch_id', branch.id).is('parent_id', null)
      .eq('is_active', true).order('sort_order');
    if (data) {
      setPages(data);
      data.forEach(page => fetchFirstProduct(page.id));
    }
  }

 async function fetchFirstProduct(pageId) {
    const { data } = await supabase.from('products').select('image_url, name, price_per_unit, discount_percent')
      .eq('page_id', pageId).eq('is_active', true).limit(1).single();
    if (data) setPageProducts(prev => ({ ...prev, [pageId]: data }));
  }

  if (pages.length === 0) return null;

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {pages.map(page => (
         <div key={page.id} onClick={() => onSelectPage(page)} style={{ cursor: 'pointer', textAlign: 'center', width: 'calc(25% - 6px)', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: '12px', overflow: 'hidden', background: '#e0f2fe', marginBottom: '6px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                {pageProducts[page.id] ? (
                  <img src={pageProducts[page.id].image_url} alt={page.name_bn || page.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🛍️</div>
                )}
              </div>
            </div>
         <p style={{ fontSize: '15px', color: '#1f2937', fontWeight: '600', margin: '4px 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pageProducts[page.id]?.name || (page.name_bn || page.name)}
            </p>
          {pageProducts[page.id]?.discount_percent > 0 ? (
              <div>
              <span style={{ fontSize: '16px', color: '#db2777', fontWeight: 'bold' }}>
                  ৳{Math.round(pageProducts[page.id].price_per_unit * (1 - pageProducts[page.id].discount_percent / 100))}
                </span>
                {' '}
                <span style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'line-through' }}>
                  ৳{pageProducts[page.id].price_per_unit}
                </span>
                {' '}
               <span style={{ fontSize: '13px', color: '#f97316', fontWeight: 'bold' }}>
                  ({pageProducts[page.id].discount_percent}% OFF)
                </span>
              </div>
            ) : (
             <p style={{ fontSize: '16px', color: '#db2777', fontWeight: 'bold', margin: 0 }}>
                {pageProducts[page.id]?.price_per_unit ? `${pageProducts[page.id].price_per_unit} Tk` : ''}
              </p>
           )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CartItem({ item, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [newQty, setNewQty] = useState(item.qty.toString());
  const [newUnit, setNewUnit] = useState(item.unit);
  const u = (item.unit || '').toLowerCase().trim();
  const isKg = u === 'kg';
  const isLiter = u === 'liter' || u === 'l';
  const isPiece = !isKg && !isLiter;

  const getActualQty = () => {
    const q = parseFloat(newQty);
    if (!q || q <= 0) return 0;
    if (isKg && newUnit === 'gm') return q / 1000;
    if (isLiter && newUnit === 'ml') return q / 1000;
    return q;
  };

  return (
    <div className="bg-white rounded-xl shadow p-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800">{item.name}</h3>
          <p className="text-xs text-gray-400">{item.price_per_unit} Tk/{item.unit}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="text-blue-500 text-xs border border-blue-500 px-2 py-1 rounded-lg">Edit</button>
          <button onClick={() => onRemove(item.id)} className="text-red-500 text-xs border border-red-500 px-2 py-1 rounded-lg">Remove</button>
        </div>
      </div>
      {editing ? (
        <div className="mt-2 bg-gray-50 rounded-lg p-2">
          <div className="flex gap-1 mb-1">
            <input type="number" min="0" step={isPiece ? '1' : '0.001'} value={newQty}
              onChange={e => setNewQty(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-2 py-2 w-full text-sm text-gray-900"
              placeholder="পরিমাণ লিখুন" />
            {!isPiece && (
              <select value={newUnit} onChange={e => setNewUnit(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-2 py-2 text-sm bg-white">
                {isKg && <><option value={item.unit}>Kg</option><option value="gm">gm</option></>}
                {isLiter && <><option value={item.unit}>Liter</option><option value="ml">ml</option></>}
              </select>
            )}
          </div>
          {newQty && parseFloat(newQty) > 0 && (
            <p className="text-xs text-green-700 font-bold bg-green-50 p-1 rounded mb-2">
              {newQty} {isPiece ? item.unit : newUnit} = {(getActualQty() * item.price_per_unit).toFixed(0)} Tk
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={() => { const a = getActualQty(); if (a > 0) { onUpdate(item.id, a); setEditing(false); } }}
              className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex-1">সেভ</button>
            <button onClick={() => setEditing(false)} className="bg-gray-200 text-gray-600 px-3 py-1 rounded-lg text-sm">বাতিল</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600">{item.qty} {item.unit}</span>
          <span className="font-bold text-green-700">{(item.price_per_unit * item.qty).toFixed(0)} Tk</span>
        </div>
      )}
    </div>
  );
}

function OrderReceiptModal({ order, onClose, isAdmin = false }) {
  const printRef = useRef(null);
  function handlePrint() {
    const content = printRef.current?.innerHTML;
    const win = window.open('', '_blank');
    if (!win || !content) return;
    win.document.write(`<html><head><title>Order #${order.id}</title><style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family: Arial, sans-serif; padding:15mm; }</style></head><body>${content}</body></html>`);
    win.document.close(); win.print();
  }
  function handleSave() {
    const lines = ['সোহেল মার্ট | মাই বাজার', 'sohelmart.com', 'WhatsApp: 01872149655', '════════════════════════════════════════', `তারিখ: ${new Date(order.created_at).toLocaleDateString('bn-BD')}`, `নাম: ${order.customer_name} | ফোন: ${order.customer_phone}`, `ঠিকানা: ${order.address}`, `অর্ডার #: ${order.id}`, '════════════════════════════════════════', ...((order.order_items || []).map(item => `${item.products?.name} × ${item.quantity} = ${(item.price * item.quantity).toFixed(0)} Tk`)), '════════════════════════════════════════', `সর্বমোট: ${order.total_amount} Tk`];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `order-${order.id}.txt`; a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>অর্ডার #{order.id}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isAdmin && <button onClick={handlePrint} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}>🖨️ Print</button>}
            <button onClick={handleSave} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}>💾 Save</button>
            <button onClick={onClose} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        <div ref={printRef} style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2px 1fr', border: '2px solid #db2777', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '14px', background: '#fdf2f8' }}>
              <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#db2777', margin: '0 0 6px 0' }}>🛒 সোহেল মার্ট</h1>
              <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>🌐 sohelmart.com</p>
              <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>📱 01872149655</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '6px 0 2px 0' }}>তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0' }}>সময়: {new Date(order.created_at).toLocaleTimeString('bn-BD')}</p>
            </div>
            <div style={{ background: '#db2777' }} />
            <div style={{ padding: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1d4ed8', margin: '0 0 6px 0' }}>👤 কাস্টমার তথ্য</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>নাম: <strong>{order.customer_name}</strong></p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>ফোন: {order.customer_phone}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>জেলা: {order.district}, {order.upazila}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>ঠিকানা: {order.address}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '6px 0 2px 0', fontWeight: 'bold' }}>অর্ডার #: {order.id}</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 4px', marginBottom: '4px', borderBottom: '2px solid #374151' }}>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: 0 }}>পণ্য</p>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: 0 }}>টাকা</p>
          </div>
          {(order.order_items || []).map((item, i) => (
            <div key={i} style={{ borderBottom: '1px dashed #d1d5db', padding: '8px 4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 2px 0' }}>{item.products?.name}</p>
                  <p style={{ fontSize: '11px', color: '#3b82f6', margin: '0 0 2px 0' }}>কোড: {String(item.products?.product_code ?? item?.product_code ?? 'N/A')}</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{item.price} Tk/{item.products?.unit} × {item.quantity} {item.products?.unit}</p>
                </div>
                {item.products?.image_url && <img src={item.products.image_url} alt={item.products.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', margin: '0 8px', flexShrink: 0 }} />}
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#db2777', margin: 0, whiteSpace: 'nowrap' }}>{(item.price * item.quantity).toFixed(0)} Tk</p>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '2px solid #374151', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', margin: 0 }}>সর্বমোট:</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>{order.total_amount} Tk</p>
          </div>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>ধন্যবাদ সোহেল মার্টে কেনাকাটা করার জন্য! 😊</p>
        </div>
      </div>
    </div>
  );
}

function OrdersModal({ onClose, isAdmin = false }) {
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      const savedPhone = localStorage.getItem('customer_phone');
      if (savedPhone) { setPhone(savedPhone); fetchOrders(savedPhone); }
    } else { fetchAllOrders(); }
  }, []);

  async function fetchOrders(p) {
    if (!p) return;
    setLoading(true);
    const { data } = await supabase.from('orders').select('*, order_items(*, products(name, name_bn, unit, image_url, product_code))').eq('customer_phone', p).order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false); setSearched(true);
    localStorage.setItem('customer_phone', p);
  }

  async function fetchAllOrders() {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*, order_items(*, products(name, name_bn, unit, image_url, product_code))').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false); setSearched(true);
  }

  const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const dateStr = new Date(o.created_at).toLocaleDateString('bn-BD');
    const dateStrEn = new Date(o.created_at).toLocaleDateString('en-US');
    return String(o.id).includes(search) || dateStr.includes(search) || dateStrEn.toLowerCase().includes(search.toLowerCase()) || (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase())) || (o.customer_phone && o.customer_phone.includes(search));
  });

  if (selectedOrder) return <OrderReceiptModal order={selectedOrder} onClose={() => setSelectedOrder(null)} isAdmin={isAdmin} />;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: 'white' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>{isAdmin ? '📋 সব অর্ডার' : '📋 আমার অর্ডার'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>
        <div style={{ padding: '16px' }}>
          {!isAdmin && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="ফোন নম্বর দিন" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', outline: 'none', color: '#1f2937' }} />
              <button onClick={() => fetchOrders(phone)} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600' }}>খুঁজুন</button>
            </div>
          )}
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 তারিখ, অর্ডার নম্বর বা নাম..." style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', color: '#1f2937' }} />
          {loading && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>লোড হচ্ছে...</p>}
          {!loading && searched && orders.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>কোনো অর্ডার পাওয়া যায়নি</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredOrders.map((order) => (
              <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ background: '#f9fafb', borderRadius: '12px', padding: '12px', cursor: 'pointer', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '14px', margin: '0 0 4px 0' }}>অর্ডার #{order.id}</p>
                    {isAdmin && <p style={{ fontSize: '12px', color: '#374151', margin: '0 0 2px 0' }}>{order.customer_name}</p>}
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px 0' }}>{new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{order.order_items?.length} টি পণ্য</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', color: '#db2777', fontSize: '18px', margin: '0 0 6px 0' }}>{order.total_amount} Tk</p>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: order.status === 'delivered' ? '#dcfce7' : order.status === 'confirmed' ? '#dbeafe' : order.status === 'cancelled' ? '#fee2e2' : '#fef9c3', color: order.status === 'delivered' ? '#15803d' : order.status === 'confirmed' ? '#1d4ed8' : order.status === 'cancelled' ? '#dc2626' : '#854d0e' }}>
                      {order.status === 'delivered' ? '✅ ডেলিভারি' : order.status === 'confirmed' ? '✔️ কনফার্ম' : order.status === 'cancelled' ? '❌ বাতিল' : '⏳ পেন্ডিং'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubPageChips({ selectedPage, branch, isAdmin, onSelectPage }) {
  const [subPages, setSubPages] = useState([]);
  const [rootPages, setRootPages] = useState([]);

  useEffect(() => {
    if (selectedPage) { fetchSubPages(selectedPage.id); }
    else { fetchRootPages(); }
  }, [selectedPage, branch]);

  async function fetchSubPages(parentId) {
    const { data } = await supabase.from('pages').select('*').eq('parent_id', parentId).order('sort_order');
    if (data) setSubPages(isAdmin ? data : data.filter(p => p.is_active !== false));
  }

  async function fetchRootPages() {
    const { data } = await supabase.from('pages').select('*').eq('branch_id', branch.id).is('parent_id', null).order('sort_order');
    if (data) setRootPages(isAdmin ? data : data.filter(p => p.is_active !== false));
  }

  const pages = selectedPage ? subPages : rootPages;
  if (pages.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
      {pages.map(page => (
        <button key={page.id} onClick={() => onSelectPage(page)}
          style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', border: '2px solid #db2777', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, background: 'white', color: '#db2777' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#db2777'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#db2777'; }}>
          {page.name_bn || page.name}
        </button>
      ))}
    </div>
  );
}

function ProductCard({ product, onAdd, isAdmin, isEditor, editorPageId, onEdit, onDoubleClick, isDragging, onDragStart, onDragOver, onDrop }) {
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState(product.unit);
  const [showDesc, setShowDesc] = useState(false);
  const [showSellers, setShowSellers] = useState(false);
  const [listings, setListings] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [listingCount, setListingCount] = useState(0);
  const stock = product.stock?.[0]?.quantity || 0;
  const u = (product.unit || '').toLowerCase().trim();
  const isKg = u === 'kg';
  const isLiter = u === 'liter' || u === 'l';
  const isPiece = !isKg && !isLiter;
  const canEdit = isAdmin || (isEditor && String(product.page_id) === String(editorPageId));

  const allImages = [];
  if (product.image_url) allImages.push(product.image_url);
  if (product.product_images) {
    product.product_images.sort((a, b) => a.sort_order - b.sort_order).forEach(img => { if (img.image_url && img.image_url !== product.image_url) allImages.push(img.image_url); });
  }

  const getActualQty = () => {
    const q = parseFloat(qty);
    if (!q || q <= 0) return 0;
    if (isKg && unit === 'gm') return q / 1000;
    if (isLiter && unit === 'ml') return q / 1000;
    return q;
  };

  async function fetchListings() {
    const { data } = await supabase.from('product_listings').select('*, sellers(shop_name)').eq('product_id', product.id).eq('is_active', true).order('price', { ascending: true });
    if (data) setListings(data);
    setShowSellers(!showSellers);
  }

  useEffect(() => {
    async function checkListings() {
      const { count } = await supabase.from('product_listings').select('*', { count: 'exact', head: true }).eq('product_id', product.id).eq('is_active', true);
      if (count) setListingCount(count);
    }
    checkListings();
  }, []);

  return (
    <div onDragOver={e => { e.preventDefault(); onDragOver && onDragOver(); }} onDrop={onDrop}
      style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden', opacity: isDragging ? 0.5 : 1, border: isDragging ? '2px solid #db2777' : '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {canEdit && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', padding: '6px 6px 0', flexShrink: 0 }}>
          {isAdmin && <span draggable onDragStart={onDragStart} onMouseDown={onDragStart} onTouchStart={onDragStart} style={{ background: '#e5e7eb', color: '#6b7280', fontSize: '12px', padding: '2px 6px', borderRadius: '4px', cursor: 'grab', userSelect: 'none' }}>⠿</span>}
          <button onClick={() => onEdit(product)} style={{ background: '#facc15', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>✏️</button>
        </div>
      )}
      {allImages.length > 0 && (
        <div style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }} onClick={() => allImages.length > 1 && setCurrentImageIndex(prev => (prev + 1) % allImages.length)}>
          <img src={allImages[currentImageIndex]} alt={product.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
          {allImages.length > 1 && (
            <div style={{ position: 'absolute', bottom: '4px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '4px' }}>
              {allImages.map((_, i) => <div key={i} style={{ borderRadius: '50%', width: i === currentImageIndex ? '8px' : '6px', height: i === currentImageIndex ? '8px' : '6px', background: i === currentImageIndex ? '#db2777' : '#d1d5db' }} />)}
            </div>
          )}
        </div>
      )}
   <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div onDoubleClick={() => onDoubleClick(product)} style={{ cursor: 'pointer', userSelect: 'none', marginBottom: '4px' }}>
          <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '13px', lineHeight: '1.4', wordBreak: 'break-word', margin: 0 }}>{product.name}</p>
        </div>
        <div style={{ flex: 1 }} />
        {product.product_code && <p style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '500', margin: '0 0 2px 0' }}>কোড: {product.product_code}</p>}
       {product.discount_percent > 0 ? (
  <div style={{ margin: '2px 0' }}>
    <span style={{ color: '#db2777', fontWeight: 'bold', fontSize: '13px' }}>
      ৳{Math.round(product.price_per_unit * (1 - product.discount_percent / 100))}
    </span>
    {' '}
    <span style={{ color: '#9ca3af', fontSize: '11px', textDecoration: 'line-through' }}>
      ৳{product.price_per_unit}
    </span>
    {' '}
    <span style={{ color: '#f97316', fontSize: '11px', fontWeight: 'bold' }}>
      ({product.discount_percent}% OFF)
    </span>
  </div>
) : (
  <p style={{ color: '#db2777', fontWeight: 'bold', fontSize: '12px', margin: '2px 0' }}>1 {product.unit} = {product.price_per_unit} Tk</p>
)}
        {listingCount >= 1 && <button onClick={fetchListings} style={{ fontSize: '11px', color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', marginBottom: '4px' }}>🏪 সেলারদের দাম দেখুন ({listingCount}জন)</button>}
        {showSellers && listings.length > 0 && (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px', marginBottom: '4px' }}>
            {listings.map((listing) => (
              <div key={listing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px dashed #e5e7eb' }}>
                <span style={{ fontSize: '11px', color: '#374151' }}>🏪 {listing.sellers?.shop_name}</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#db2777' }}>৳{listing.price}</span>
                <button onClick={() => onAdd({ ...product, price_per_unit: listing.price, seller_id: listing.seller_id, shop_name: listing.sellers?.shop_name }, 1)} style={{ fontSize: '11px', background: '#db2777', color: 'white', border: 'none', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', marginLeft: '4px' }}>🛒 Add</button>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontSize: '11px', color: stock <= 0 ? '#ef4444' : '#9ca3af', margin: '0 0 4px 0' }}>Stock: {stock} {product.unit} {stock <= 0 && '⚠️'}</p>
        {product.description && (
          <div style={{ marginBottom: '4px' }}>
            <button onClick={() => setShowDesc(!showDesc)} style={{ fontSize: '11px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>বৈশিষ্ট্য {showDesc ? '▲' : '▼'}</button>
            {showDesc && <p style={{ fontSize: '11px', color: '#4b5563', background: '#eff6ff', padding: '6px', borderRadius: '6px', margin: '4px 0 0 0' }}>{product.description}</p>}
          </div>
        )}
        <div style={{ marginTop: '4px' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            <input type="number" min="0" step={isPiece ? '1' : '0.001'} value={qty} onChange={e => setQty(e.target.value)} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 4px', width: '100%', fontSize: '12px', color: '#1f2937', outline: 'none', minWidth: 0 }} placeholder="পরিমাণ" />
            {!isPiece && (
              <select value={unit} onChange={e => setUnit(e.target.value)} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 2px', fontSize: '11px', background: 'white', flexShrink: 0 }}>
                {isKg && <><option value={product.unit}>Kg</option><option value="gm">gm</option></>}
                {isLiter && <><option value={product.unit}>L</option><option value="ml">ml</option></>}
              </select>
            )}
            {isPiece && <span style={{ border: '2px solid #e5e7eb', borderRadius: '8px', padding: '6px 4px', fontSize: '11px', color: '#6b7280', background: '#f9fafb', flexShrink: 0 }}>pcs</span>}
          </div>
          {qty && parseFloat(qty) > 0 && <p style={{ fontSize: '11px', color: '#db2777', fontWeight: 'bold', background: '#fdf2f8', padding: '3px 6px', borderRadius: '6px', border: '1px solid #fbcfe8', margin: '0 0 4px 0' }}>= {(getActualQty() * product.price_per_unit).toFixed(0)} Tk</p>}
          <button onClick={() => { const a = getActualQty(); if (a > 0) onAdd({ ...product, seller_id: 'sohel-mart', shop_name: 'Sohel Mart' }, a); }} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 4px', fontSize: '12px', width: '100%', cursor: 'pointer', fontWeight: '500' }}>🛒 ঝুড়িতে রাখুন</button>
        </div>
      </div>
    </div>
  );
}

function EditProductModal({ product, onClose, onSave }) {
 const [form, setForm] = useState({ name: product.name || '', name_bn: product.name_bn || '', product_code: product.product_code || '', price_per_unit: product.price_per_unit || '', unit: product.unit || 'Kg', category: product.category || '', category_bn: product.category_bn || '', description: product.description || '', image_url: product.image_url || '', is_active: product.is_active, page_id: product.page_id ? String(product.page_id) : '', discount_percent: product.discount_percent || 0 });
  const [stockQty, setStockQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extraImages, setExtraImages] = useState([]);
  const [pages, setPages] = useState([]);
  const currentStock = product.stock?.[0]?.quantity || 0;
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => { fetchExtraImages(); fetchPages(); }, []);

  async function fetchPages() {
    const { data } = await supabase.from('pages').select('id, name, name_bn').order('name_bn');
    if (data) setPages(data);
  }

  async function fetchExtraImages() {
    const { data } = await supabase.from('product_images').select('*').eq('product_id', product.id).order('sort_order');
    if (data) setExtraImages(data);
  }

  async function uploadMainImage(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('products').upload(fileName, file);
    if (error) { alert('সমস্যা: ' + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
    setForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
  }

  async function uploadExtraImage(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('products').upload(fileName, file);
    if (error) { alert('সমস্যা: ' + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
    await supabase.from('product_images').insert({ product_id: product.id, image_url: urlData.publicUrl, sort_order: extraImages.length });
    fetchExtraImages(); setUploading(false);
  }

  async function deleteExtraImage(id) {
    await supabase.from('product_images').delete().eq('id', id);
    fetchExtraImages();
  }

  async function save() {
    setLoading(true);
   await supabase.from('products').update({ name: form.name, name_bn: form.name_bn, product_code: form.product_code, price_per_unit: parseFloat(form.price_per_unit), unit: form.unit, category: form.category, category_bn: form.category_bn, description: form.description, image_url: form.image_url, is_active: form.is_active, page_id: form.page_id ? parseInt(form.page_id) : null, discount_percent: parseFloat(form.discount_percent) || 0 }).eq('id', product.id);
    if (stockQty !== '') {
      const newQty = parseFloat(stockQty);
      if (!isNaN(newQty) && newQty >= 0) {
        const { data: existing } = await supabase.from('stock').select('*').eq('product_id', product.id).single();
        if (existing) { await supabase.from('stock').update({ quantity: newQty }).eq('product_id', product.id); }
        else { await supabase.from('stock').insert({ product_id: product.id, quantity: newQty }); }
      }
    }
    setLoading(false); onSave(); onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>✏️ পণ্য Edit</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>নাম *</label><input name="name" value={form.name} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>বিকল্প নাম</label><input name="name_bn" value={form.name_bn} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>পণ্য কোড</label><input name="product_code" value={form.product_code} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>দাম (Tk)</label><input name="price_per_unit" type="number" value={form.price_per_unit} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>ইউনিট</label><select name="unit" value={form.unit} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', background: 'white', color: '#1f2937' }}><option value="Kg">Kg</option><option value="Liter">Liter</option><option value="pcs">pcs</option><option value="packet">Packet</option></select></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>পেজ সিলেক্ট করুন</label><select name="page_id" value={form.page_id} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', background: 'white', color: '#1f2937' }}><option value="">-- পেজ সিলেক্ট করুন --</option>{pages.map(page => <option key={page.id} value={page.id}>{page.name_bn || page.name}</option>)}</select></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>ক্যাটাগরি (ইং)</label><input name="category" value={form.category} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>ক্যাটাগরি (বাং)</label><input name="category_bn" value={form.category_bn} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '12px' }}>
            <label style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>প্রধান ছবি</label>
            {form.image_url && <img src={form.image_url} alt="main" style={{ width: '100%', objectFit: 'contain', borderRadius: '8px', marginTop: '8px', maxHeight: '120px' }} />}
            <input type="file" accept="image/*" onChange={uploadMainImage} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px', width: '100%', fontSize: '13px', marginTop: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '12px' }}>
            <label style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 'bold' }}>অতিরিক্ত ছবি</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {extraImages.map(img => (
                <div key={img.id} style={{ position: 'relative' }}>
                  <img src={img.image_url} alt="extra" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }} />
                  <button onClick={() => deleteExtraImage(img.id)} style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" onChange={uploadExtraImage} style={{ border: '2px solid #bfdbfe', borderRadius: '8px', padding: '8px', width: '100%', fontSize: '13px', marginTop: '8px', boxSizing: 'border-box' }} />
            {uploading && <p style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>আপলোড হচ্ছে...</p>}
          </div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>ডিসকাউন্ট % (যেমন: 10, 20, 45)</label><input name="discount_percent" type="number" min="0" max="99" value={form.discount_percent} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>বৈশিষ্ট্য</label><textarea name="description" value={form.description} onChange={handle} rows={3} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', color: '#1f2937' }} /></div>
          <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '12px' }}>
            <label style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 'bold' }}>স্টক সেট করুন (বর্তমান: {currentStock} {product.unit})</label>
            <input type="number" min="0" step="0.001" value={stockQty} onChange={e => setStockQty(e.target.value)} placeholder="নতুন স্টক লিখুন" style={{ border: '2px solid #bfdbfe', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '8px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} />
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' }}>* যা লিখবেন সেটাই নতুন স্টক হবে</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: '#6b7280' }}>Status:</label>
            <button onClick={() => setForm({ ...form, is_active: !form.is_active })} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', border: 'none', cursor: 'pointer', background: form.is_active ? '#dcfce7' : '#fee2e2', color: form.is_active ? '#15803d' : '#dc2626' }}>{form.is_active ? '✅ Active' : '❌ Inactive'}</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', padding: '16px', borderTop: '1px solid #e5e7eb' }}>
          <button onClick={save} disabled={loading || uploading} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', flex: 1, fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: (loading || uploading) ? 0.5 : 1 }}>{loading ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</button>
          <button onClick={async () => { if (!confirm('পণ্য মুছে দেবেন?')) return; await supabase.from('stock').delete().eq('product_id', product.id); await supabase.from('product_images').delete().eq('product_id', product.id); await supabase.from('products').delete().eq('id', product.id); onSave(); onClose(); }} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 16px', fontSize: '16px', cursor: 'pointer' }}>🗑️</button>
          <button onClick={onClose} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '12px', padding: '12px 20px', fontSize: '16px', cursor: 'pointer' }}>বাতিল</button>
        </div>
      </div>
    </div>
  );
}

function AddProductModal({ branch, defaultPage, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', name_bn: '', product_code: '', description: '', price_per_unit: '', unit: 'Kg', category: '', category_bn: '', stock: '', image_url: '', page_id: defaultPage?.id || '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function uploadImage(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('products').upload(fileName, file);
    if (error) { alert('সমস্যা: ' + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
    setForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
  }

  async function save() {
    if (!form.name || !form.product_code || !form.price_per_unit) { alert('নাম, কোড, দাম আবশ্যক!'); return; }
    setLoading(true);
    const { data: product, error } = await supabase.from('products').insert({ name: form.name, name_bn: form.name_bn, product_code: form.product_code, description: form.description, price_per_unit: parseFloat(form.price_per_unit), unit: form.unit, branch_id: branch.id, category: form.category, category_bn: form.category_bn, image_url: form.image_url, page_id: form.page_id ? parseInt(form.page_id) : null, is_active: true }).select().single();
    if (error) { alert('সমস্যা: ' + error.message); setLoading(false); return; }
    if (form.stock && parseFloat(form.stock) > 0) { await supabase.from('stock').insert({ product_id: product.id, quantity: parseFloat(form.stock) }); }
    alert('পণ্য যোগ হয়েছে!');
    setLoading(false); onSave(); onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>+ নতুন পণ্য যোগ</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>নাম *</label><input name="name" value={form.name} onChange={handle} placeholder="পণ্যের নাম" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>বিকল্প নাম</label><input name="name_bn" value={form.name_bn} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>পণ্য কোড *</label><input name="product_code" value={form.product_code} onChange={handle} placeholder="P001" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>দাম *</label><input name="price_per_unit" type="number" value={form.price_per_unit} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>ইউনিট</label><select name="unit" value={form.unit} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', background: 'white', color: '#1f2937' }}><option value="Kg">Kg</option><option value="Liter">Liter</option><option value="pcs">pcs</option><option value="packet">Packet</option></select></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>ক্যাটাগরি (ইং)</label><input name="category" value={form.category} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>ক্যাটাগরি (বাং)</label><input name="category_bn" value={form.category_bn} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>প্রাথমিক স্টক</label><input name="stock" type="number" value={form.stock} onChange={handle} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280' }}>প্রধান ছবি</label>
            {form.image_url && <img src={form.image_url} alt="product" style={{ width: '100%', objectFit: 'contain', borderRadius: '8px', marginTop: '8px', maxHeight: '120px' }} />}
            <input type="file" accept="image/*" onChange={uploadImage} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px', width: '100%', fontSize: '13px', marginTop: '8px', boxSizing: 'border-box' }} />
            {uploading && <p style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>আপলোড হচ্ছে...</p>}
          </div>
          <div><label style={{ fontSize: '12px', color: '#6b7280' }}>বৈশিষ্ট্য</label><textarea name="description" value={form.description} onChange={handle} rows={2} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', color: '#1f2937' }} /></div>
        </div>
        <div style={{ display: 'flex', gap: '8px', padding: '16px', borderTop: '1px solid #e5e7eb' }}>
          <button onClick={save} disabled={loading || uploading} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', flex: 1, fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: (loading || uploading) ? 0.5 : 1 }}>{loading ? 'যোগ হচ্ছে...' : '+ পণ্য যোগ করুন'}</button>
          <button onClick={onClose} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '12px', padding: '12px 20px', fontSize: '16px', cursor: 'pointer' }}>বাতিল</button>
        </div>
      </div>
    </div>
  );
}

export default function ProductList({ branch, role, onOrderSuccess, onPageChange, openMenu, onMenuClose, openCart, onCartClose }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [officeOpen] = useState(isOfficeOpen());
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageHistory, setPageHistory] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalPage, setAddModalPage] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const [subPageIds, setSubPageIds] = useState([]);

  const isAdmin = role === 'admin';
  const isEditor = role === 'editor';
  const editorPageId = isEditor ? localStorage.getItem('editor_page_id') : null;

  useEffect(() => { fetchProducts(); }, [branch]);
useEffect(() => {
  if (openCart) {
    const savedPhone = localStorage.getItem('customer_phone');
    if (savedPhone) {
      setShowCart(true);
    } else {
      setShowOrder(true);
    }
    if (onCartClose) onCartClose();
  }
}, [openCart]);
  async function fetchSubPageIds(pageId) {
    const { data } = await supabase.from('pages').select('id').eq('parent_id', pageId);
    if (data) setSubPageIds(data.map(p => p.id));
    else setSubPageIds([]);
  }

  useEffect(() => {
    const handlePopState = () => {
      if (showOrders) { setShowOrders(false); return; }
      if (editingProduct) { setEditingProduct(null); return; }
      if (showAddModal) { setShowAddModal(false); return; }
      if (showOrder) { setShowOrder(false); return; }
      if (showCart) { setShowCart(false); return; }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showOrders, editingProduct, showAddModal, showCart, showOrder]);

  useEffect(() => {
    if (editingProduct || showAddModal || showCart || showOrder || showOrders) {
      window.history.pushState(null, '', window.location.href);
    }
  }, [editingProduct, showAddModal, showCart, showOrder, showOrders]);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*, stock(*), product_images(*)').eq('branch_id', branch.id).eq('is_active', true).order('sort_order', { ascending: true });
    if (data) setProducts(data);
    setLoading(false);
  }

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  function handleDragStart(index) { dragItem.current = index; setDragIndex(index); }
  function handleDragOver(index) { dragOverItem.current = index; if (dragIndex !== null && dragIndex !== index) setDragOverIndex(index); }

  async function handleDrop() {
    const from = dragItem.current; const to = dragOverItem.current;
    if (from === null || to === null || from === to) { setDragIndex(null); setDragOverIndex(null); return; }
    const items = Array.from(products);
    const [removed] = items.splice(from, 1);
    items.splice(to, 0, removed);
    setProducts(items);
    dragItem.current = null; dragOverItem.current = null;
    setDragIndex(null); setDragOverIndex(null);
    for (let i = 0; i < items.length; i++) { await supabase.from('products').update({ sort_order: i }).eq('id', items[i].id); }
  }

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  const getDisplayProducts = () => {
    let baseProducts = products;
    if (selectedPage) {
      baseProducts = products.filter(p => String(p.page_id) === String(selectedPage.id) || subPageIds.map(String).includes(String(p.page_id)));
    }
    if (!isAdmin && !isEditor) { baseProducts = baseProducts.filter(p => (p.stock?.[0]?.quantity || 0) > 0); }
    if (search !== '' || selectedName) {
      let allBase = (isAdmin || isEditor) ? products : products.filter(p => (p.stock?.[0]?.quantity || 0) > 0);
      let filtered = allBase.filter(p => search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || (p.name_bn && p.name_bn.toLowerCase().includes(search.toLowerCase())) || (p.product_code && p.product_code.toLowerCase().includes(search.toLowerCase())) || (p.category && p.category.toLowerCase().includes(search.toLowerCase())) || (p.category_bn && p.category_bn.includes(search)));
      if (selectedName) return filtered.filter(p => p.name === selectedName);
      return filtered;
    }
    if (selectedCategory) baseProducts = baseProducts.filter(p => p.category === selectedCategory);
    if (!isAdmin && !isEditor) {
      const seen = new Set();
      return baseProducts.filter(p => { if (seen.has(p.name)) return false; seen.add(p.name); return true; });
    }
    return baseProducts;
  };

  const displayProducts = getDisplayProducts();

  function addToCart(product, qty) {
    const existing = cart.find(c => c.id === product.id);
    if (existing) { setCart(cart.map(c => c.id === product.id ? { ...c, qty: parseFloat((c.qty + qty).toFixed(3)) } : c)); return; }
    const cartSellerIds = [...new Set(cart.map(c => c.seller_id).filter(Boolean))];
    const newSellerId = product.seller_id;
    if (newSellerId && cartSellerIds.length > 0 && !cartSellerIds.includes(newSellerId)) {
      const confirmed = window.confirm(`প্রিয় কাস্টমার! 🛵 ${cartSellerIds.length + 1}টি দোকান থেকে অর্ডার করতে হলে — ডেলিভারি চার্জ ৳১০ বাড়বে।\n\nঠিক আছে, ঝুড়িতে রাখুন?`);
      if (!confirmed) return;
    }
    setCart([...cart, { ...product, qty }]);
  }

  function updateCartQty(id, qty) {
    if (qty <= 0) setCart(cart.filter(c => c.id !== id));
    else setCart(cart.map(c => c.id === id ? { ...c, qty } : c));
  }

  function removeFromCart(id) { setCart(cart.filter(c => c.id !== id)); }
  const total = cart.reduce((a, c) => a + c.price_per_unit * c.qty, 0);

  const handlePageSelect = (page) => {
    if (page) setPageHistory(prev => [...prev, selectedPage]);
    else setPageHistory([]);
    setSelectedPage(page);
    setSelectedName(null);
    setSelectedCategory(null);
    localStorage.setItem('current_page_id', page ? String(page.id) : '');
    localStorage.setItem('current_page_name', page ? (page.name_bn || page.name) : '');
    if (page) fetchSubPageIds(page.id);
    else setSubPageIds([]);
    if (onPageChange) onPageChange(page ? String(page.id) : null);
  };

  if (showOrder) {
    const savedPhone = localStorage.getItem('customer_phone');
    if (!savedPhone) {
      return <CustomerAuth onSuccess={(data) => { localStorage.setItem('customer_phone', data.phone); localStorage.setItem('customer_name', data.name); localStorage.setItem('customer_district', data.district); localStorage.setItem('customer_upazila', data.upazila); setShowOrder(true); }} />;
    }
    return <OrderForm cart={cart} branch={branch} total={total} onBack={() => setShowOrder(false)} onSuccess={(id, phone) => { setOrderId(id); setShowOrder(false); setCart([]); setShowCart(false); if (onOrderSuccess) onOrderSuccess(id, phone); }} />;
  }

  if (orderId) {
    return (
      <div style={{ minHeight: '100vh', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(219,39,119,0.15)', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#db2777', marginBottom: '8px' }}>অর্ডার সফল!</h2>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#db2777', marginBottom: '24px' }}>#{orderId}</p>
          <button onClick={() => { setOrderId(null); setShowCart(false); }} style={{ width: '100%', background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>আবার কেনাকাটা করুন</button>
        </div>
      </div>
    );
  }

  if (showCart) {
    return (
      <div className="min-h-screen bg-pink-50 pb-32">
        <div style={{ background: '#db2777', color: 'white', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>←</button>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>🛒 আপনার ঝুড়ি</h2>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '13px' }}>{cart.length} টি</span>
        </div>
        <div className="p-4 space-y-3">
          {cart.map(item => <CartItem key={item.id} item={item} onUpdate={updateCartQty} onRemove={removeFromCart} />)}
        </div>
        <div style={{ padding: '16px', background: 'white', margin: '16px', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
  {localStorage.getItem('customer_phone') ? (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0', fontSize: '14px' }}>👤 {localStorage.getItem('customer_name') || 'কাস্টমার'}</p>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>📱 {localStorage.getItem('customer_phone')}</p>
      </div>
      <button onClick={() => { localStorage.removeItem('customer_phone'); localStorage.removeItem('customer_name'); localStorage.removeItem('customer_district'); localStorage.removeItem('customer_upazila'); setShowCart(false); setShowCart(true); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>লগআউট</button>
    </div>
  ) : (
    <CustomerAuth onSuccess={(data) => {
      localStorage.setItem('customer_phone', data.phone);
      localStorage.setItem('customer_name', data.name);
      localStorage.setItem('customer_district', data.district);
      localStorage.setItem('customer_upazila', data.upazila);
      setShowCart(false);
      setShowCart(true);
    }} />
  )}
</div>
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '16px', boxShadow: '0 -4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontWeight: 'bold', color: '#374151', fontSize: '18px' }}>Total:</span>
            <span style={{ fontWeight: 'bold', color: '#db2777', fontSize: '20px' }}>{total.toFixed(0)} Tk</span>
          </div>
          <button onClick={() => officeOpen && setShowOrder(true)} style={{ width: '100%', background: officeOpen ? '#db2777' : '#9ca3af', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '18px', fontWeight: 'bold', cursor: officeOpen ? 'pointer' : 'not-allowed' }}>{officeOpen ? 'অর্ডার করুন' : '🔴 অফিস বন্ধ'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {showOrders && <OrdersModal onClose={() => setShowOrders(false)} isAdmin={isAdmin || isEditor} />}
      {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={fetchProducts} />}
      {showAddModal && <AddProductModal branch={branch} defaultPage={addModalPage} onClose={() => setShowAddModal(false)} onSave={fetchProducts} />}

      <PageMenu
        branch={branch}
        selectedPage={selectedPage}
        isOpenFromParent={openMenu}
        onCloseFromParent={onMenuClose}
        onSelectPage={handlePageSelect}
        isAdmin={isAdmin}
        onAddProduct={(page) => { setAddModalPage(page); setShowAddModal(true); }}
        onShowOrders={() => setShowOrders(true)}
      />

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 mb-3">
          {selectedPage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => {
                const prevPage = pageHistory[pageHistory.length - 1] || null;
                setPageHistory(prev => prev.slice(0, -1));
                setSelectedPage(prevPage);
                setSelectedName(null);
                setSelectedCategory(null);
                localStorage.setItem('current_page_id', prevPage ? String(prevPage.id) : '');
                localStorage.setItem('current_page_name', prevPage ? (prevPage.name_bn || prevPage.name) : '');
                if (prevPage) fetchSubPageIds(prevPage.id);
                else setSubPageIds([]);
                if (onPageChange) onPageChange(prevPage ? String(prevPage.id) : null);
              }} style={{ fontSize: '12px', color: '#6b7280', background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}>
                ← {pageHistory[pageHistory.length - 1]?.name_bn || pageHistory[pageHistory.length - 1]?.name || 'হোম'}
              </button>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#db2777' }}>{selectedPage.name_bn || selectedPage.name}</span>
            </div>
          )}
          {(isAdmin || isEditor) && (
            <button onClick={() => { setAddModalPage(selectedPage); setShowAddModal(true); }} style={{ background: '#db2777', color: 'white', fontSize: '12px', padding: '8px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>+ পণ্য যোগ</button>
          )}
        </div>
        <SubPageChips selectedPage={selectedPage} branch={branch} isAdmin={isAdmin} onSelectPage={handlePageSelect} />
      </div>
<div className="p-4">
        <input type="text" placeholder="🔍 পণ্যের নাম বা কোড লিখুন..." value={search} onChange={e => { setSearch(e.target.value); setSelectedCategory(null); setSelectedName(null); }} style={{ width: '100%', border: '2px solid #fbcfe8', borderRadius: '12px', padding: '12px 16px', color: '#1f2937', fontSize: '14px', fontWeight: '500', outline: 'none', boxSizing: 'border-box' }} />
      </div>

{!selectedPage && !search && !selectedCategory && !selectedName && (
  <>
    <CategoryGrid branch={branch} onSelectPage={handlePageSelect} />
    <div style={{ height: '20px' }} />
  </>
)}
     
      {selectedName && (
        <div className="px-4 mb-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '12px', padding: '8px 12px' }}>
            <span style={{ color: '#db2777', fontWeight: '500', fontSize: '13px' }}>🔍 {selectedName} এর সব পণ্য</span>
            <button onClick={() => setSelectedName(null)} style={{ marginLeft: 'auto', color: '#ef4444', fontWeight: 'bold', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

     {(selectedPage || search || selectedCategory || selectedName) && (
     <div className="px-4 flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => { setSelectedCategory(null); setSelectedName(null); }} style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', border: '2px solid #db2777', cursor: 'pointer', background: !selectedCategory && !selectedName ? '#db2777' : 'white', color: !selectedCategory && !selectedName ? 'white' : '#db2777' }}>সব পণ্য</button>
        {categories.map(cat => {
          const catProducts = products.filter(p => p.category === cat);
          const catName = catProducts[0]?.category_bn || cat;
         return <button key={cat} onClick={() => { setSelectedCategory(cat); setSelectedName(null); }} style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', border: '2px solid #db2777', cursor: 'pointer', background: selectedCategory === cat ? '#db2777' : 'white', color: selectedCategory === cat ? 'white' : '#db2777' }}>{catName} ({catProducts.length})</button>;
        })}
      </div>
)}

      {isAdmin && <p style={{ fontSize: '12px', textAlign: 'center', color: '#f59e0b', marginBottom: '4px' }}>⠿ আইকন ধরে Drag করে পণ্য সাজান</p>}
      {loading && <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '40px' }}>লোড হচ্ছে...</p>}

      {(!selectedPage && !search && !selectedCategory && !selectedName) ? null : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 items-stretch">
        {displayProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} onAdd={addToCart} isAdmin={isAdmin} isEditor={isEditor} editorPageId={editorPageId} onEdit={setEditingProduct} onDoubleClick={(p) => setSelectedName(p.name)} isDragging={dragIndex === index} onDragStart={() => handleDragStart(index)} onDragOver={() => handleDragOver(index)} onDrop={() => handleDrop()} />
        ))}
     {!loading && displayProducts.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9ca3af', marginTop: '40px' }}>কোনো পণ্য পাওয়া যায়নি</p>}
      </div>
)}

      {cart.length > 0 && (
        <div onClick={() => setShowCart(true)} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#db2777', color: 'white', padding: '16px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🛒 {cart.length} টি পণ্য</span>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{total.toFixed(0)} Tk</span>
            <span>ঝুড়ি দেখুন →</span>
          </div>
        </div>
      )}
    </div>
  );
}
