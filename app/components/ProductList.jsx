'use client';
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

function OrderReceiptModal({ order, onClose }) {
  const printRef = useRef(null);

  function handlePrint() {
    const content = printRef.current?.innerHTML;
    const win = window.open('', '_blank');
    if (!win || !content) return;
    win.document.write(`
      <html><head><title>Order #${order.id}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: Arial, sans-serif; width:210mm; min-height:297mm; padding:15mm; }
        @media print { body { padding:10mm; } }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  }

  function handleSave() {
    const lines = [
      '🛒 মাই বাজার',
      'mybazar.vercel.app | sohelmart.com',
      'WhatsApp: 01872149655',
      '════════════════════════════════════════',
      `শাখা: লালমোহন`,
      `তারিখ: ${new Date(order.created_at).toLocaleDateString('bn-BD')}`,
      `নাম: ${order.customer_name}`,
      `ফোন: ${order.customer_phone}`,
      `জেলা: ${order.district}, ${order.upazila}`,
      `ঠিকানা: ${order.address}`,
      `অর্ডার #: ${order.id}`,
      '════════════════════════════════════════',
      'পণ্য                                টাকা',
      '────────────────────────────────────────',
      ...((order.order_items || []).map(item =>
        `${item.products?.name}\n${item.price} Tk/${item.products?.unit} × ${item.quantity} ${item.products?.unit}     ${(item.price * item.quantity).toFixed(0)} Tk\n────────────────`
      )),
      '════════════════════════════════════════',
      `সর্বমোট:                        ${order.total_amount} Tk`,
      '════════════════════════════════════════',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-green-700">অর্ডার #{order.id}</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">🖨️ Print</button>
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">💾 Save</button>
            <button onClick={onClose} className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm">✕</button>
          </div>
        </div>

        <div ref={printRef} style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
          {/* হেডার - মাই বাজার বাম, কাস্টমার ঠিকানা ডান */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1px 1fr',
            border: '2px solid #15803d',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '16px',
          }}>
            {/* বাম - আমাদের তথ্য */}
            <div style={{ padding: '14px', background: '#f0fdf4' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#15803d', margin: '0 0 6px 0' }}>🛒 মাই বাজার</h1>
              <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>🌐 mybazar.vercel.app</p>
              <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>🌐 sohelmart.com</p>
              <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>📱 WhatsApp: 01872149655</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '6px 0 2px 0', fontWeight: 'bold' }}>📍 শাখা: লালমোহন</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0' }}>তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0' }}>সময়: {new Date(order.created_at).toLocaleTimeString('bn-BD')}</p>
            </div>

            {/* মাঝের দাগ */}
            <div style={{ background: '#15803d' }} />

            {/* ডান - কাস্টমার তথ্য */}
            <div style={{ padding: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1d4ed8', margin: '0 0 8px 0' }}>👤 কাস্টমার তথ্য</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>নাম: <strong>{order.customer_name}</strong></p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>ফোন: {order.customer_phone}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>জেলা: {order.district}, {order.upazila}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>ঠিকানা: {order.address}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '6px 0 3px 0', fontWeight: 'bold' }}>অর্ডার #: {order.id}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
            </div>
          </div>

          {/* পণ্য হেডার */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 4px', marginBottom: '4px', borderBottom: '2px solid #374151' }}>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: 0 }}>পণ্য</p>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: 0 }}>টাকা</p>
          </div>

          {/* পণ্য লিস্ট */}
          {(order.order_items || []).map((item, i) => (
            <div key={i} style={{ borderBottom: '1px dashed #d1d5db', padding: '8px 4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, paddingRight: '16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 2px 0' }}>
                    {item.products?.name}
                  </p>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                    {item.price} Tk/{item.products?.unit} × {item.quantity} {item.products?.unit}
                  </p>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#15803d', margin: 0, whiteSpace: 'nowrap' }}>
                  {(item.price * item.quantity).toFixed(0)} Tk
                </p>
              </div>
            </div>
          ))}

          {/* মোট */}
          <div style={{ borderTop: '2px solid #374151', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', margin: 0 }}>সর্বমোট:</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#15803d', margin: 0 }}>{order.total_amount} Tk</p>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
            ধন্যবাদ মাই বাজারে কেনাকাটা করার জন্য! 
          </p>
        </div>
      </div>
    </div>
  );
}

function MyOrdersModal({ onClose }) {
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem('customer_phone');
    if (savedPhone) { setPhone(savedPhone); fetchOrders(savedPhone); }
  }, []);

  async function fetchOrders(p) {
    if (!p) return;
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, name_bn, unit))')
      .eq('customer_phone', p)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
    setSearched(true);
    localStorage.setItem('customer_phone', p);
  }

  const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const dateStr = new Date(o.created_at).toLocaleDateString('bn-BD');
    const dateStrEn = new Date(o.created_at).toLocaleDateString('en-US');
    return (
      String(o.id).includes(search) ||
      dateStr.includes(search) ||
      dateStrEn.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      {selectedOrder && (
        <OrderReceiptModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
            <h2 className="text-lg font-bold text-green-700">📋 আমার অর্ডার</h2>
            <button onClick={onClose} className="text-gray-400 text-2xl">✕</button>
          </div>
          <div className="p-4">
            <div className="flex gap-2 mb-3">
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="ফোন নম্বর দিন"
                className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:border-green-500 focus:outline-none" />
              <button onClick={() => fetchOrders(phone)}
                className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap font-medium">
                খুঁজুন
              </button>
            </div>

            {orders.length > 0 && (
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 তারিখ বা অর্ডার নম্বর লিখুন..."
                className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:border-green-500 focus:outline-none mb-3" />
            )}

            {loading && <p className="text-center text-gray-400 py-8">লোড হচ্ছে...</p>}
            {!loading && searched && orders.length === 0 && (
              <p className="text-center text-gray-400 py-8">কোনো অর্ডার পাওয়া যায়নি</p>
            )}

            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-green-50 border border-gray-200 active:bg-green-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">অর্ডার #{order.id}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.order_items?.length} টি পণ্য</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700 text-lg">{order.total_amount} Tk</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'}`}>
                        {order.status === 'delivered' ? '✅ ডেলিভারি' :
                         order.status === 'confirmed' ? '✔️ কনফার্ম' :
                         order.status === 'cancelled' ? '❌ বাতিল' : '⏳ পেন্ডিং'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductCard({ product, onAdd, isAdmin, onEdit, onDoubleClick, isDragging, onDragStart }) {
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState(product.unit);
  const [showDesc, setShowDesc] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const stock = product.stock?.[0]?.quantity || 0;
  const u = (product.unit || '').toLowerCase().trim();
  const isKg = u === 'kg';
  const isLiter = u === 'liter' || u === 'l';
  const isPiece = !isKg && !isLiter;

  const allImages = [];
  if (product.image_url) allImages.push(product.image_url);
  if (product.product_images) {
    product.product_images
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach(img => {
        if (img.image_url && img.image_url !== product.image_url) {
          allImages.push(img.image_url);
        }
      });
  }

  const handleImageTap = () => {
    if (allImages.length > 1) setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const getActualQty = () => {
    const q = parseFloat(qty);
    if (!q || q <= 0) return 0;
    if (isKg && unit === 'gm') return q / 1000;
    if (isLiter && unit === 'ml') return q / 1000;
    return q;
  };

  return (
    <div style={{
      background: 'white', borderRadius: '12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)', padding: '10px',
      opacity: isDragging ? 0.5 : 1,
      border: isDragging ? '2px solid #16a34a' : '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box',
    }}>
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginBottom: '6px', flexShrink: 0 }}>
          <span onMouseDown={onDragStart} onTouchStart={onDragStart}
            style={{ background: '#e5e7eb', color: '#6b7280', fontSize: '12px', padding: '2px 6px', borderRadius: '4px', cursor: 'grab' }}>⠿</span>
          <button onClick={() => onEdit(product)}
            style={{ background: '#facc15', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>✏️</button>
        </div>
      )}

      {allImages.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '8px', cursor: 'pointer', flexShrink: 0 }} onClick={handleImageTap}>
          <img src={allImages[currentImageIndex]} alt={product.name}
            style={{ width: '100%', height: '110px', objectFit: 'contain', borderRadius: '8px' }} />
          {allImages.length > 1 && (
            <div style={{ position: 'absolute', bottom: '4px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '4px' }}>
              {allImages.map((_, i) => (
                <div key={i} style={{
                  borderRadius: '50%',
                  width: i === currentImageIndex ? '8px' : '6px',
                  height: i === currentImageIndex ? '8px' : '6px',
                  background: i === currentImageIndex ? '#16a34a' : '#d1d5db',
                }} />
              ))}
            </div>
          )}
        </div>
      )}

      <div onDoubleClick={() => onDoubleClick(product)} style={{ cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}>
        <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '13px', lineHeight: '1.4', wordBreak: 'break-word', overflowWrap: 'anywhere', margin: 0 }}>
          {product.name}
        </p>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ flexShrink: 0 }}>
        {product.product_code && (
          <p style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '500', margin: '0 0 2px 0' }}>কোড: {product.product_code}</p>
        )}
        <p style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '12px', margin: '2px 0' }}>
          1 {product.unit} = {product.price_per_unit} Tk
        </p>
        {isAdmin ? (
          <p style={{ fontSize: '11px', color: stock <= 0 ? '#ef4444' : '#9ca3af', margin: '0 0 4px 0' }}>
            Stock: {stock} {product.unit} {stock <= 0 && '⚠️'}
          </p>
        ) : (
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 4px 0' }}>Stock: {stock} {product.unit}</p>
        )}
        {product.description && (
          <div style={{ marginBottom: '4px' }}>
            <button onClick={() => setShowDesc(!showDesc)}
              style={{ fontSize: '11px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
              বৈশিষ্ট্য {showDesc ? '▲' : '▼'}
            </button>
            {showDesc && (
              <p style={{ fontSize: '11px', color: '#4b5563', background: '#eff6ff', padding: '6px', borderRadius: '6px', margin: '4px 0 0 0' }}>
                {product.description}
              </p>
            )}
          </div>
        )}
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            <input type="number" min="0" step={isPiece ? '1' : '0.001'} value={qty}
              onChange={e => setQty(e.target.value)}
              style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 4px', width: '100%', fontSize: '12px', color: '#1f2937', outline: 'none', minWidth: 0 }}
              placeholder="পরিমাণ" />
            {!isPiece && (
              <select value={unit} onChange={e => setUnit(e.target.value)}
                style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 2px', fontSize: '11px', background: 'white', flexShrink: 0 }}>
                {isKg && <><option value={product.unit}>Kg</option><option value="gm">gm</option></>}
                {isLiter && <><option value={product.unit}>L</option><option value="ml">ml</option></>}
              </select>
            )}
            {isPiece && (
              <span style={{ border: '2px solid #e5e7eb', borderRadius: '8px', padding: '6px 4px', fontSize: '11px', color: '#6b7280', background: '#f9fafb', flexShrink: 0 }}>pcs</span>
            )}
          </div>
          {qty && parseFloat(qty) > 0 && (
            <p style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold', background: '#f0fdf4', padding: '3px 6px', borderRadius: '6px', border: '1px solid #bbf7d0', margin: '0 0 4px 0' }}>
              = {(getActualQty() * product.price_per_unit).toFixed(0)} Tk
            </p>
          )}
          <button onClick={() => { const a = getActualQty(); if (a > 0) onAdd(product, a); }}
            style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 4px', fontSize: '12px', width: '100%', cursor: 'pointer', fontWeight: '500' }}>
            🛒 ঝুড়িতে রাখুন
          </button>
        </div>
      </div>
    </div>
  );
}

function EditProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product.name || '', name_bn: product.name_bn || '',
    product_code: product.product_code || '',
    price_per_unit: product.price_per_unit || '', unit: product.unit || 'Kg',
    category: product.category || '', category_bn: product.category_bn || '',
    description: product.description || '', image_url: product.image_url || '',
    is_active: product.is_active,
  });
  const [stockQty, setStockQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extraImages, setExtraImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const currentStock = product.stock?.[0]?.quantity || 0;
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => { fetchExtraImages(); }, []);

  async function fetchExtraImages() {
    setLoadingImages(true);
    const { data } = await supabase.from('product_images').select('*').eq('product_id', product.id).order('sort_order');
    if (data) setExtraImages(data);
    setLoadingImages(false);
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
    fetchExtraImages();
    setUploading(false);
  }

  async function deleteExtraImage(id) {
    await supabase.from('product_images').delete().eq('id', id);
    fetchExtraImages();
  }

  async function save() {
    setLoading(true);
    await supabase.from('products').update({
      name: form.name, name_bn: form.name_bn, product_code: form.product_code,
      price_per_unit: parseFloat(form.price_per_unit), unit: form.unit,
      category: form.category, category_bn: form.category_bn,
      description: form.description, image_url: form.image_url, is_active: form.is_active
    }).eq('id', product.id);
    if (stockQty && parseFloat(stockQty) > 0) {
      const { data: existing } = await supabase.from('stock').select('*').eq('product_id', product.id).single();
      if (existing) {
        await supabase.from('stock').update({ quantity: existing.quantity + parseFloat(stockQty) }).eq('product_id', product.id);
      } else {
        await supabase.from('stock').insert({ product_id: product.id, quantity: parseFloat(stockQty) });
      }
    }
    setLoading(false); onSave(); onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-green-700">✏️ পণ্য Edit</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl">✕</button>
        </div>
        <div className="space-y-2">
          <div><label className="text-xs text-gray-500">নাম *</label>
            <input name="name" value={form.name} onChange={handle} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">বিকল্প নাম</label>
            <input name="name_bn" value={form.name_bn} onChange={handle} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">পণ্য কোড</label>
            <input name="product_code" value={form.product_code} onChange={handle} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">দাম (Tk)</label>
            <input name="price_per_unit" type="number" value={form.price_per_unit} onChange={handle} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">ইউনিট</label>
            <select name="unit" value={form.unit} onChange={handle} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
              <option value="Kg">Kg</option><option value="Liter">Liter</option>
              <option value="pcs">pcs</option><option value="packet">Packet</option>
            </select></div>
          <div><label className="text-xs text-gray-500">ক্যাটাগরি (ইং)</label>
            <input name="category" value={form.category} onChange={handle} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">ক্যাটাগরি (বাং)</label>
            <input name="category_bn" value={form.category_bn} onChange={handle} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div className="bg-green-50 rounded-lg p-3">
            <label className="text-xs text-green-700 font-bold">প্রধান ছবি</label>
            {form.image_url && <img src={form.image_url} alt="main" className="w-full object-contain rounded-lg mt-1 mb-1 max-h-32" />}
            <input type="file" accept="image/*" onChange={uploadMainImage} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <label className="text-xs text-blue-700 font-bold">অতিরিক্ত ছবি</label>
            {loadingImages ? <p className="text-xs text-gray-400 mt-1">লোড হচ্ছে...</p> : (
              <div className="flex gap-2 flex-wrap mt-2">
                {extraImages.map(img => (
                  <div key={img.id} className="relative">
                    <img src={img.image_url} alt="extra" className="w-16 h-16 object-cover rounded-lg" />
                    <button onClick={() => deleteExtraImage(img.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">✕</button>
                  </div>
                ))}
              </div>
            )}
            <input type="file" accept="image/*" onChange={uploadExtraImage} className="border-2 border-blue-300 rounded-lg px-3 py-2 w-full text-sm mt-2" />
            {uploading && <p className="text-xs text-blue-500 mt-1">আপলোড হচ্ছে...</p>}
          </div>
          <div><label className="text-xs text-gray-500">বৈশিষ্ট্য</label>
            <textarea name="description" value={form.description} onChange={handle} rows={3} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div className="bg-blue-50 rounded-lg p-3">
            <label className="text-xs text-blue-700 font-bold">স্টক যোগ (বর্তমান: {currentStock} {product.unit})</label>
            <input type="number" value={stockQty} onChange={e => setStockQty(e.target.value)} className="border-2 border-blue-300 rounded-lg px-3 py-2 w-full text-sm mt-1" placeholder="কত যোগ করবেন?" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Status:</label>
            <button onClick={() => setForm({...form, is_active: !form.is_active})}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${form.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {form.is_active ? '✅ Active' : '❌ Inactive'}
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={save} disabled={loading || uploading} className="bg-green-700 text-white px-4 py-2 rounded-xl flex-1 font-bold disabled:opacity-50">
            {loading ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
          </button>
          <button onClick={onClose} className="bg-gray-200 text-gray-600 px-4 py-2 rounded-xl">বাতিল</button>
        </div>
      </div>
    </div>
  );
}

function AddProductModal({ branch, defaultPage, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', name_bn: '', product_code: '', description: '',
    price_per_unit: '', unit: 'Kg', category: '', category_bn: '',
    stock: '', image_url: '', page_id: defaultPage?.id || ''
  });
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
    const { data: product, error } = await supabase.from('products').insert({
      name: form.name, name_bn: form.name_bn, product_code: form.product_code,
      description: form.description, price_per_unit: parseFloat(form.price_per_unit),
      unit: form.unit, branch_id: branch.id, category: form.category,
      category_bn: form.category_bn, image_url: form.image_url,
      page_id: form.page_id ? parseInt(form.page_id) : null, is_active: true
    }).select().single();
    if (error) { alert('সমস্যা: ' + error.message); setLoading(false); return; }
    if (form.stock && parseFloat(form.stock) > 0) {
      await supabase.from('stock').insert({ product_id: product.id, quantity: parseFloat(form.stock) });
    }
    alert('পণ্য যোগ হয়েছে!');
    setLoading(false); onSave(); onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-green-700">+ নতুন পণ্য যোগ</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl">✕</button>
        </div>
        <div className="space-y-2">
          <div><label className="text-xs text-gray-500">নাম *</label>
            <input name="name" value={form.name} onChange={handle} placeholder="এ্যাংকর ডাল" className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">বিকল্প নাম</label>
            <input name="name_bn" value={form.name_bn} onChange={handle} placeholder="Anchor Dal" className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">পণ্য কোড *</label>
            <input name="product_code" value={form.product_code} onChange={handle} placeholder="P001" className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">দাম *</label>
            <input name="price_per_unit" type="number" value={form.price_per_unit} onChange={handle} placeholder="120" className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">ইউনিট</label>
            <select name="unit" value={form.unit} onChange={handle} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
              <option value="Kg">Kg</option><option value="Liter">Liter</option>
              <option value="pcs">pcs</option><option value="packet">Packet</option>
            </select></div>
          <div><label className="text-xs text-gray-500">ক্যাটাগরি (ইং)</label>
            <input name="category" value={form.category} onChange={handle} placeholder="dal" className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">ক্যাটাগরি (বাং)</label>
            <input name="category_bn" value={form.category_bn} onChange={handle} placeholder="ডাল" className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">প্রাথমিক স্টক</label>
            <input name="stock" type="number" value={form.stock} onChange={handle} placeholder="50" className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
          <div>
            <label className="text-xs text-gray-500">প্রধান ছবি</label>
            {form.image_url && <img src={form.image_url} alt="product" className="w-full object-contain rounded-lg mt-1 mb-1 max-h-32" />}
            <input type="file" accept="image/*" onChange={uploadImage} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
            {uploading && <p className="text-xs text-blue-500 mt-1">আপলোড হচ্ছে...</p>}
          </div>
          <div><label className="text-xs text-gray-500">বৈশিষ্ট্য</label>
            <textarea name="description" value={form.description} onChange={handle} rows={2} className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" /></div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={save} disabled={loading || uploading} className="bg-green-700 text-white px-4 py-2 rounded-xl flex-1 font-bold disabled:opacity-50">
            {loading ? 'যোগ হচ্ছে...' : '+ পণ্য যোগ করুন'}
          </button>
          <button onClick={onClose} className="bg-gray-200 text-gray-600 px-4 py-2 rounded-xl">বাতিল</button>
        </div>
      </div>
    </div>
  );
}

export default function ProductList({ branch, role, onOrderSuccess }) {
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalPage, setAddModalPage] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showMyOrders, setShowMyOrders] = useState(false);

  const isAdmin = role === 'admin';

  useEffect(() => { fetchProducts(); }, [branch]);

  useEffect(() => {
    const handlePopState = () => {
      if (showMyOrders) { setShowMyOrders(false); return; }
      if (editingProduct) { setEditingProduct(null); return; }
      if (showAddModal) { setShowAddModal(false); return; }
      if (showOrder) { setShowOrder(false); return; }
      if (showCart) { setShowCart(false); return; }
      if (selectedName) { setSelectedName(null); return; }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showMyOrders, editingProduct, showAddModal, showCart, showOrder, selectedName]);

  useEffect(() => {
    if (editingProduct || showAddModal || showCart || showOrder || showMyOrders) {
      window.history.pushState(null, '', window.location.href);
    }
  }, [editingProduct, showAddModal, showCart, showOrder, showMyOrders]);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, stock(*), product_images(*)')
      .eq('branch_id', branch.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (data) setProducts(data);
    setLoading(false);
  }

  function handleDragStart(index) { setDragIndex(index); }
  function handleDragOver(index) { if (dragIndex !== null) setDragOverIndex(index); }

  async function handleDrop(dropIndex) {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null); setDragOverIndex(null); return;
    }
    const items = Array.from(products);
    const [removed] = items.splice(dragIndex, 1);
    items.splice(dropIndex, 0, removed);
    setProducts(items);
    setDragIndex(null); setDragOverIndex(null);
    for (let i = 0; i < items.length; i++) {
      await supabase.from('products').update({ sort_order: i }).eq('id', items[i].id);
    }
  }

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  const getDisplayProducts = () => {
    let baseProducts = products;
    if (selectedPage) {
      baseProducts = products.filter(p => String(p.page_id) === String(selectedPage.id));
    }
    if (!isAdmin) {
      baseProducts = baseProducts.filter(p => (p.stock?.[0]?.quantity || 0) > 0);
    }
    if (search !== '' || selectedName) {
      let allBase = isAdmin ? products : products.filter(p => (p.stock?.[0]?.quantity || 0) > 0);
      let filtered = allBase.filter(p =>
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.name_bn && p.name_bn.toLowerCase().includes(search.toLowerCase())) ||
        (p.product_code && p.product_code.toLowerCase().includes(search.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
        (p.category_bn && p.category_bn.includes(search))
      );
      if (selectedName) return filtered.filter(p => p.name === selectedName);
      return filtered;
    }
    if (selectedCategory) {
      baseProducts = baseProducts.filter(p => p.category === selectedCategory);
    }
    if (!isAdmin) {
      const seen = new Set();
      return baseProducts.filter(p => {
        if (seen.has(p.name)) return false;
        seen.add(p.name);
        return true;
      });
    }
    return baseProducts;
  };

  const displayProducts = getDisplayProducts();

  function addToCart(product, qty) {
    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      setCart(cart.map(c => c.id === product.id ? { ...c, qty: parseFloat((c.qty + qty).toFixed(3)) } : c));
    } else {
      setCart([...cart, { ...product, qty }]);
    }
  }

  function updateCartQty(id, qty) {
    if (qty <= 0) setCart(cart.filter(c => c.id !== id));
    else setCart(cart.map(c => c.id === id ? { ...c, qty } : c));
  }

  function removeFromCart(id) { setCart(cart.filter(c => c.id !== id)); }

  const total = cart.reduce((a, c) => a + c.price_per_unit * c.qty, 0);

  if (showOrder) {
    return <OrderForm cart={cart} branch={branch} total={total}
      onBack={() => setShowOrder(false)}
      onSuccess={(id, phone) => {
        setOrderId(id); setShowOrder(false); setCart([]); setShowCart(false);
        if (onOrderSuccess) onOrderSuccess(id, phone);
      }} />;
  }

  if (orderId) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">অর্ডার সফল!</h2>
          <p className="text-3xl font-bold text-green-700 mb-6">#{orderId}</p>
          <button onClick={() => { setOrderId(null); setShowCart(false); }}
            className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-lg">
            আবার কেনাকাটা করুন
          </button>
        </div>
      </div>
    );
  }

  if (showCart) {
    return (
      <div className="min-h-screen bg-green-50 pb-32">
        <div className="bg-white p-4 shadow flex items-center justify-between">
          <button onClick={() => setShowCart(false)} className="text-green-700 font-bold text-lg">&larr; পণ্য দেখুন</button>
          <h2 className="text-xl font-bold text-green-700">🛒 আপনার ঝুড়ি</h2>
          <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">{cart.length} টি</span>
        </div>
        <div className="p-4 space-y-3">
          {cart.map(item => <CartItem key={item.id} item={item} onUpdate={updateCartQty} onRemove={removeFromCart} />)}
        </div>
        {!officeOpen && (
          <div className="mx-4 bg-red-50 border-2 border-red-300 rounded-xl p-4 text-center">
            <p className="text-red-600 font-bold">🔴 অফিস বন্ধ</p>
            <p className="text-red-500 text-sm">সকাল ৯:৩০ - রাত ৯:৩০</p>
          </div>
        )}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
          <div className="flex justify-between mb-3">
            <span className="font-bold text-gray-700 text-lg">Total:</span>
            <span className="font-bold text-green-700 text-xl">{total.toFixed(0)} Tk</span>
          </div>
          <button onClick={() => officeOpen && setShowOrder(true)}
            className={`w-full py-3 rounded-xl font-bold text-lg ${officeOpen ? 'bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
            {officeOpen ? 'অর্ডার করুন' : '🔴 অফিস বন্ধ'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {showMyOrders && <MyOrdersModal onClose={() => setShowMyOrders(false)} />}

      {editingProduct && (
        <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={fetchProducts} />
      )}
      {showAddModal && (
        <AddProductModal branch={branch} defaultPage={addModalPage}
          onClose={() => setShowAddModal(false)} onSave={fetchProducts} />
      )}

      <div className="px-4 pt-4 flex items-center gap-2 overflow-x-auto">
        <PageMenu
          branch={branch}
          selectedPage={selectedPage}
          onSelectPage={(page) => { setSelectedPage(page); setSelectedName(null); setSelectedCategory(null); }}
          isAdmin={isAdmin}
          onAddProduct={(page) => { setAddModalPage(page); setShowAddModal(true); }}
          onShowOrders={() => setShowMyOrders(true)}
        />
        {selectedPage && (
          <span className="text-sm font-medium text-green-700 bg-green-50 border border-green-300 px-3 py-1 rounded-full whitespace-nowrap">
            {selectedPage.name_bn || selectedPage.name}
          </span>
        )}
        {isAdmin && (
          <button onClick={() => { setAddModalPage(selectedPage); setShowAddModal(true); }}
            className="bg-green-700 text-white text-xs px-3 py-2 rounded-xl font-medium whitespace-nowrap">
            + পণ্য যোগ
          </button>
        )}
      </div>

      <div className="p-4">
        <input type="text" placeholder="🔍 পণ্যের নাম বা কোড লিখুন..."
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedCategory(null); setSelectedName(null); }}
          className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 font-medium shadow-sm focus:border-green-500 focus:outline-none" />
      </div>

      {selectedName && (
        <div className="px-4 mb-2">
          <div className="flex items-center gap-2 bg-green-50 border border-green-300 rounded-xl px-3 py-2">
            <span className="text-green-700 font-medium text-sm">🔍 {selectedName} এর সব পণ্য</span>
            <button onClick={() => setSelectedName(null)} className="ml-auto text-red-500 font-bold text-lg">✕</button>
          </div>
        </div>
      )}

      <div className="px-4 flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => { setSelectedCategory(null); setSelectedName(null); setSelectedPage(null); }}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${!selectedCategory && !selectedName && !selectedPage ? 'bg-green-700 text-white' : 'bg-white text-green-700 border-2 border-green-700'}`}>
          সব পণ্য
        </button>
        {categories.map(cat => {
          const catProducts = products.filter(p => p.category === cat);
          const catName = catProducts[0]?.category_bn || cat;
          return (
            <button key={cat} onClick={() => { setSelectedCategory(cat); setSelectedName(null); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === cat ? 'bg-green-700 text-white' : 'bg-white text-green-700 border-2 border-green-700'}`}>
              {catName} ({catProducts.length})
            </button>
          );
        })}
      </div>

      {isAdmin && <p className="text-xs text-center text-yellow-600 mb-1">⠿ আইকন ধরে Drag করে পণ্য সাজান</p>}
      {!search && !selectedName && !isAdmin && (
        <p className="text-xs text-center text-gray-400 mb-1">💡 একই পণ্যের সব ভ্যারিয়েন্ট দেখতে ডাবল ক্লিক করুন</p>
      )}

      {loading && <p className="text-center text-gray-400 mt-10">লোড হচ্ছে...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 items-stretch">
        {displayProducts.map((product, index) => (
          <div key={product.id}
            style={{
              outline: isAdmin && dragOverIndex === index && dragIndex !== index ? '2px solid #16a34a' : 'none',
              borderRadius: '12px', height: '100%',
            }}
            onDragOver={(e) => { e.preventDefault(); if (isAdmin) handleDragOver(index); }}
            onDrop={() => { if (isAdmin) handleDrop(index); }}>
            <ProductCard
              product={product} onAdd={addToCart} isAdmin={isAdmin}
              onEdit={setEditingProduct} onDoubleClick={(p) => setSelectedName(p.name)}
              isDragging={dragIndex === index} onDragStart={() => handleDragStart(index)} />
          </div>
        ))}
        {!loading && displayProducts.length === 0 && (
          <p className="col-span-4 text-center text-gray-400 mt-10">কোনো পণ্য পাওয়া যায়নি</p>
        )}
      </div>

      {cart.length > 0 && (
        <div onClick={() => setShowCart(true)}
          className="fixed bottom-0 left-0 right-0 bg-green-700 text-white p-4 cursor-pointer">
          <div className="flex justify-between items-center">
            <span>🛒 {cart.length} টি পণ্য</span>
            <span className="font-bold text-lg">{total.toFixed(0)} Tk</span>
            <span>ঝুড়ি দেখুন →</span>
          </div>
        </div>
      )}
    </div>
  );
}