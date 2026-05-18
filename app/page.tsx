'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import ProductList from './components/ProductList';
import { requestNotificationPermission, messaging, onMessage } from './firebase';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

const ADMIN_PASSWORD = 'sloahiella@admin';
const LOGO_URL = 'https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/Untitled%20folder/logo.jpg';
const PINK = '#db2777';
const PINK_DARK = '#be185d';
const PINK_LIGHT = '#fdf2f8';
const PINK_BORDER = '#fbcfe8';

interface Branch {
  id: number;
  name: string;
  name_bn: string;
  is_active: boolean;
}

function OrderReceipt({ order, onClose, isAdmin }: { order: any; onClose: () => void; isAdmin: boolean }) {
  const printRef = useRef<HTMLDivElement>(null);

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
      'সোহেল মার্ট | মাই বাজার',
      'sohelmart.com',
      'WhatsApp: 01872149655',
      '════════════════════════════════════════',
      `তারিখ: ${new Date(order.created_at).toLocaleDateString('bn-BD')}`,
      `নাম: ${order.customer_name} | ফোন: ${order.customer_phone}`,
      `জেলা: ${order.district}, ${order.upazila}`,
      `ঠিকানা: ${order.address}`,
      `অর্ডার #: ${order.id}`,
      '════════════════════════════════════════',
      ...((order.order_items || []).map((item: any) =>
        `${item.products?.name} × ${item.quantity} ${item.products?.unit} = ${(item.price * item.quantity).toFixed(0)} Tk`
      )),
      '════════════════════════════════════════',
      `সর্বমোট: ${order.total_amount} Tk`,
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: PINK, margin: 0 }}>অর্ডার #{order.id}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isAdmin && (
              <button onClick={handlePrint} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}>🖨️ Print</button>
            )}
            <button onClick={handleSave} style={{ background: PINK, color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}>💾 Save</button>
            <button onClick={onClose} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        <div ref={printRef} style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2px 1fr', border: `2px solid ${PINK}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '14px', background: PINK_LIGHT }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <img src={LOGO_URL} alt="লোগো" style={{ height: '36px', width: 'auto', borderRadius: '6px' }} />
                <div>
                  <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: PINK, margin: 0 }}>সোহেল মার্ট</h1>
                  <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>মাই বাজার</p>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>🌐 sohelmart.com</p>
              <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>📱 01872149655</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '6px 0 2px 0', fontWeight: 'bold' }}>তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0' }}>সময়: {new Date(order.created_at).toLocaleTimeString('bn-BD')}</p>
            </div>
            <div style={{ background: PINK }} />
            <div style={{ padding: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1d4ed8', margin: '0 0 6px 0' }}>👤 কাস্টমার তথ্য</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>নাম: <strong>{order.customer_name}</strong></p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>ফোন: {order.customer_phone}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>জেলা: {order.district}, {order.upazila}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>ঠিকানা: {order.address}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '6px 0 2px 0', fontWeight: 'bold' }}>অর্ডার #: {order.id}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0' }}>তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 4px', marginBottom: '4px', borderBottom: '2px solid #374151' }}>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: 0 }}>পণ্য</p>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: 0 }}>টাকা</p>
          </div>

          {(order.order_items || []).map((item: any, i: number) => (
            <div key={i} style={{ borderBottom: '1px dashed #d1d5db', padding: '8px 4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 2px 0' }}>{item.products?.name}</p>
                  {item.products?.product_code && (
  <p style={{ fontSize: '11px', color: '#3b82f6', margin: '0 0 2px 0' }}>কোড: {item.products?.product_code}</p>
)}
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                    {item.price} Tk/{item.products?.unit} × {item.quantity} {item.products?.unit}
                  </p>
                </div>
                {item.products?.image_url && (
                  <img src={item.products.image_url} alt={item.products.name}
                    style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', margin: '0 8px', flexShrink: 0 }} />
                )}
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: PINK, margin: 0, whiteSpace: 'nowrap' }}>
                  {(item.price * item.quantity).toFixed(0)} Tk
                </p>
              </div>
            </div>
          ))}

          <div style={{ borderTop: '2px solid #374151', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', margin: 0 }}>সর্বমোট:</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: PINK, margin: 0 }}>{order.total_amount} Tk</p>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
            ধন্যবাদ সোহেল মার্টে কেনাকাটা করার জন্য! 😊
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');
  const [loginType, setLoginType] = useState<string>('admin');
  const [showAdminDrawer, setShowAdminDrawer] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [todaySales, setTodaySales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [adminTab, setAdminTab] = useState('orders');
  const [autoPrint, setAutoPrint] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    fetchBranches();
    const savedRole = localStorage.getItem('role');
    if (savedRole) setRole(savedRole);
    const savedAutoPrint = localStorage.getItem('autoPrint');
    if (savedAutoPrint === 'true') setAutoPrint(true);
  }, []);

  useEffect(() => {
    if (role === 'admin' || role === 'editor') {
      fetchOrders();
      if (role === 'admin') {
        fetchNotifications();
        try {
          requestNotificationPermission().then((token: string | null) => {
            if (token) localStorage.setItem('fcm_token', token);
          });
          if (messaging) {
            onMessage(messaging, (payload: any) => {
              fetchOrders();
              fetchNotifications();
              playNotificationSound();
            });
          }
        } catch (e) {}
      }

      const channel = supabase
        .channel('orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, async (payload) => {
          fetchOrders();
          if (role === 'admin') {
            fetchNotifications();
            playNotificationSound();
            const fcmToken = localStorage.getItem('fcm_token');
            if (fcmToken) {
              const order = payload.new;
              await fetch('https://jthdtmqrapnfmmmeuqsw.supabase.co/functions/v1/send-notification', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J`,
                },
                body: JSON.stringify({
                  token: fcmToken,
                  title: '🛒 নতুন অর্ডার!',
                  body: `অর্ডার #${order.id} - ${order.total_amount} Tk`,
                }),
              });
            }
          }
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [role]);

  function playNotificationSound() {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 880;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {}
  }

  async function fetchBranches() {
    const { data } = await supabase.from('branches').select('*');
    if (data) setBranches(data as Branch[]);
  }

 async function fetchOrders(filterPageId?: string) {
  const editorPageId = localStorage.getItem('editor_page_id');
  const currentPageId = filterPageId !== undefined ? filterPageId : localStorage.getItem('current_page_id');
  const activePageId = currentPageId || (role === 'editor' ? editorPageId : null);

  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, name_bn, unit, image_url, page_id, product_code))')
    .order('created_at', { ascending: false });

  if (data) {
    let filteredData = data;
    if (activePageId) {
      filteredData = data.filter((o: any) =>
        o.order_items?.some((item: any) => {
          const productPageId = item.products?.page_id;
          // page_id null হলে হোম পেজের অর্ডার হিসেবে গণ্য হবে
          if (!productPageId && !activePageId) return true;
          return String(productPageId) === String(activePageId);
        })
      );
    }
    setOrders(filteredData);
    setTotalOrders(filteredData.length);
    const today = new Date().toDateString();
    const todayOrders = filteredData.filter((o: any) => new Date(o.created_at).toDateString() === today);
    setTodaySales(todayOrders.reduce((a: number, o: any) => a + o.total_amount, 0));
  }
}

  async function fetchNotifications() {
    const { data } = await supabase.from('notifications').select('*')
      .order('created_at', { ascending: false }).limit(20);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    }
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    fetchNotifications();
  }

  async function updateOrderStatus(id: number, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  }

  async function handleLogin() {
    if (loginType === 'admin') {
      if (password === ADMIN_PASSWORD) {
        setRole('admin'); localStorage.setItem('role', 'admin');
        setShowLoginModal(false); setPassword(''); setLoginError('');
      } else {
        setLoginError('Admin পাসওয়ার্ড ভুল!');
      }
    } else {
      const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('vendor_password', password)
        .single();
      if (data) {
        setRole('editor');
        localStorage.setItem('role', 'editor');
        localStorage.setItem('editor_page_id', String(data.id));
        localStorage.setItem('editor_page_name', data.name_bn || data.name);
        setShowLoginModal(false); setPassword(''); setLoginError('');
      } else {
        setLoginError('Editor পাসওয়ার্ড ভুল!');
      }
    }
  }

  function handleLogout() {
    setRole(null);
    localStorage.removeItem('role');
    localStorage.removeItem('editor_page_id');
    localStorage.removeItem('editor_page_name');
    localStorage.removeItem('current_page_id');
    setShowAdminDrawer(false);
  }

  function toggleAutoPrint() {
    const newVal = !autoPrint;
    setAutoPrint(newVal);
    localStorage.setItem('autoPrint', newVal.toString());
  }

  const getFilteredByDate = (data: any[]) => {
    const now = new Date();
    if (orderSearch) {
      return data.filter((o: any) => {
        const dateStr = new Date(o.created_at).toLocaleDateString('bn-BD');
        const dateStrEn = new Date(o.created_at).toLocaleDateString('en-US');
        return (
          String(o.id).includes(orderSearch) ||
          dateStr.includes(orderSearch) ||
          dateStrEn.toLowerCase().includes(orderSearch.toLowerCase()) ||
          (o.customer_name && o.customer_name.toLowerCase().includes(orderSearch.toLowerCase())) ||
          (o.customer_phone && o.customer_phone.includes(orderSearch))
        );
      });
    }
    return data.filter((o: any) => {
      const orderDate = new Date(o.created_at);
      if (dateFilter === 'today') {
        return orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return orderDate.toDateString() === yesterday.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      } else if (dateFilter === 'month') {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const dateFilteredOrders = getFilteredByDate(orders);
  const filteredSales = dateFilteredOrders.reduce((a: number, o: any) => a + o.total_amount, 0);
  const filteredOrders2 = dateFilteredOrders.length;

  const filteredOrders = orders.filter(o =>
    orderSearch === '' ||
    o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer_phone?.includes(orderSearch) ||
    String(o.id).includes(orderSearch) ||
    new Date(o.created_at).toLocaleDateString('bn-BD').includes(orderSearch) ||
    new Date(o.created_at).toLocaleDateString('en-US').includes(orderSearch)
  );

  if (!selectedBranch) {
    return (
      <div style={{ minHeight: '100vh', background: PINK_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <button onClick={() => setShowLoginModal(true)}
            style={{ background: 'white', border: `2px solid ${PINK}`, borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer' }}>👤</button>
          {role && (
            <>
              <span style={{ fontSize: '12px', background: PINK_LIGHT, color: PINK, padding: '4px 8px', borderRadius: '20px', fontWeight: '500', border: `1px solid ${PINK_BORDER}` }}>
                {role === 'admin' ? '👑 Admin' : `✏️ ${localStorage.getItem('editor_page_name') || 'Editor'}`}
              </span>
              <button onClick={handleLogout} style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>লগআউট</button>
            </>
          )}
        </div>

        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(219,39,119,0.15)', padding: '32px', maxWidth: '400px', width: '100%', margin: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src={LOGO_URL} alt="লোগো" style={{ height: '80px', width: 'auto', borderRadius: '12px', marginBottom: '12px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: PINK, margin: '0 0 4px 0' }}>সোহেল মার্ট</h1>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>মাই বাজার</p>
          </div>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>শাখা সিলেক্ট করুন</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {branches.map((branch) => (
              <button key={branch.id} onClick={() => setSelectedBranch(branch)}
                style={{ padding: '14px', background: PINK_LIGHT, border: `2px solid ${PINK_BORDER}`, borderRadius: '12px', color: PINK_DARK, fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>
                {branch.name_bn || branch.name}
              </button>
            ))}
          </div>
        </div>

        {showLoginModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', maxWidth: '340px', width: '100%', margin: '0 16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: PINK, textAlign: 'center', marginBottom: '16px' }}>🔐 লগইন</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => setLoginType('admin')}
                  style={{ padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', border: '2px solid', cursor: 'pointer', borderColor: loginType === 'admin' ? PINK : '#e5e7eb', background: loginType === 'admin' ? PINK : 'white', color: loginType === 'admin' ? 'white' : '#374151' }}>
                  👑 Admin
                </button>
                <button onClick={() => setLoginType('editor')}
                  style={{ padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', border: '2px solid', cursor: 'pointer', borderColor: loginType === 'editor' ? PINK : '#e5e7eb', background: loginType === 'editor' ? PINK : 'white', color: loginType === 'editor' ? 'white' : '#374151' }}>
                  ✏️ Editor
                </button>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder={loginType === 'admin' ? 'Admin পাসওয়ার্ড' : 'Editor পাসওয়ার্ড'}
                style={{ border: `2px solid ${PINK_BORDER}`, borderRadius: '8px', padding: '10px 12px', width: '100%', fontSize: '14px', marginBottom: '8px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }}
                autoFocus />
              {loginError && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px' }}>{loginError}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleLogin}
                  style={{ background: PINK, color: 'white', border: 'none', borderRadius: '8px', padding: '10px', flex: 1, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>লগইন</button>
                <button onClick={() => { setShowLoginModal(false); setPassword(''); setLoginError(''); }}
                  style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', cursor: 'pointer' }}>বাতিল</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf2f8' }}>
      {selectedOrder && (
        <OrderReceipt order={selectedOrder} onClose={() => setSelectedOrder(null)} isAdmin={role === 'admin'} />
      )}

      {/* হেডার */}
      <div style={{ background: PINK, color: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={LOGO_URL} alt="লোগো" style={{ height: '36px', width: 'auto', borderRadius: '6px' }} />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>সোহেল মার্ট</h1>
            <p style={{ fontSize: '11px', margin: 0, opacity: 0.8 }}>মাই বাজার</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {role === 'editor' && (
            <button onClick={() => { setShowAdminDrawer(true); fetchOrders(); }}
              style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' }}>
              📋
            </button>
          )}
          {role === 'admin' && (
            <button onClick={() => {
              setShowAdminDrawer(true);
              const pageId = localStorage.getItem('current_page_id');
              fetchOrders(pageId || undefined);
              fetchNotifications();
            }}
              style={{ position: 'relative', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
              ⋯
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <button onClick={() => { setSelectedBranch(null); localStorage.removeItem('current_page_id'); }}
            style={{ fontSize: '13px', background: PINK_DARK, color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
            {selectedBranch.name_bn || selectedBranch.name} ✕
          </button>
        </div>
      </div>

      <ProductList
        branch={selectedBranch}
        role={role}
        onOrderSuccess={(orderId: number, phone: string) => {
          localStorage.setItem('customer_phone', phone);
        }}
        onPageChange={(pageId: string | null) => {
          localStorage.setItem('current_page_id', pageId || '');
          if (role === 'admin') fetchOrders(pageId || undefined);
        }}
      />

      {/* Admin/Editor Drawer */}
      {showAdminDrawer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAdminDrawer(false)} />
          <div style={{ position: 'relative', marginLeft: 'auto', width: '100%', maxWidth: '380px', background: 'white', height: '100%', overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)' }}>
            <div style={{ background: PINK, color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>
  {role === 'editor'
    ? `✏️ ${localStorage.getItem('editor_page_name') || 'Editor'} Panel`
    : localStorage.getItem('current_page_id')
      ? `📋 ${localStorage.getItem('current_page_name') || 'Admin'} Panel`
      : '👑 Admin Panel'}
</h2>
              <button onClick={() => setShowAdminDrawer(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Date Filter */}
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto' }}>
                {[
                  { key: 'today', label: 'আজকে' },
                  { key: 'yesterday', label: 'গতকাল' },
                  { key: 'week', label: 'এই সপ্তাহ' },
                  { key: 'month', label: 'এই মাস' },
                ].map(d => (
                  <button key={d.key}
                    onClick={() => { setDateFilter(d.key); setOrderSearch(''); }}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
                      fontWeight: '500', border: '2px solid', cursor: 'pointer',
                      whiteSpace: 'nowrap', flexShrink: 0,
                      borderColor: dateFilter === d.key ? PINK : '#e5e7eb',
                      background: dateFilter === d.key ? PINK : 'white',
                      color: dateFilter === d.key ? 'white' : '#374151',
                    }}>
                    {d.label}
                  </button>
                ))}
              </div>

              {/* তারিখ সার্চ */}
              <input
                type="text"
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                placeholder="🔍 তারিখ, নাম, ফোন বা অর্ডার নম্বর..."
                style={{ border: `2px solid ${PINK_BORDER}`, borderRadius: '10px', padding: '8px 12px', width: '100%', fontSize: '13px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', color: '#1f2937' }}
              />

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: PINK_LIGHT, borderRadius: '12px', padding: '12px', textAlign: 'center', border: `1px solid ${PINK_BORDER}` }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>💰 Sales</p>
                  <p style={{ fontSize: '22px', fontWeight: 'bold', color: PINK, margin: 0 }}>{filteredSales} Tk</p>
                </div>
                <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '12px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>📦 Orders</p>
                  <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#1d4ed8', margin: 0 }}>{filteredOrders2} টি</p>
                </div>
              </div>
            </div>

            {role === 'admin' && (
              <div style={{ padding: '0 16px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb', borderRadius: '12px', padding: '12px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', margin: '0 0 2px 0' }}>🖨️ Auto Print</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>নতুন অর্ডারে অটো প্রিন্ট</p>
                  </div>
                  <button onClick={toggleAutoPrint}
                    style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', border: 'none', cursor: 'pointer', background: autoPrint ? PINK : '#e5e7eb', color: autoPrint ? 'white' : '#6b7280' }}>
                    {autoPrint ? '✅ চালু' : '❌ বন্ধ'}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', padding: '0 16px 12px', overflowX: 'auto' }}>
              {[
                { key: 'orders', label: '📋 Orders' },
                ...(role === 'admin' ? [{ key: 'notifications', label: `🔔 ${unreadCount > 0 ? `(${unreadCount})` : ''}` }] : []),
              ].map(t => (
                <button key={t.key}
                  onClick={() => { setAdminTab(t.key); if (t.key === 'notifications') markAllRead(); }}
                  style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', background: adminTab === t.key ? PINK : '#f3f4f6', color: adminTab === t.key ? 'white' : '#374151' }}>
                  {t.label}
                </button>
              ))}
              <button onClick={handleLogout}
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#dc2626' }}>
                Logout
              </button>
            </div>

            {adminTab === 'orders' && (
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dateFilteredOrders.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>কোনো অর্ডার নেই</p>
                )}

                {dateFilteredOrders.map((order: any) => (
                  <div key={order.id}
                    onDoubleClick={() => setSelectedOrder(order)}
                    style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '14px', margin: '0 0 2px 0' }}>#{order.id} - {order.customer_name}</h3>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>{order.customer_phone}</p>
                        {order.transaction_id && (
                          <p style={{ fontSize: '12px', color: PINK, margin: '2px 0', fontWeight: '600' }}>💳 TrxID: {order.transaction_id}</p>
                        )}
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>{order.district}, {order.upazila}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0' }}>{new Date(order.created_at).toLocaleString('bn-BD')}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <p style={{ fontWeight: 'bold', color: PINK, margin: 0 }}>{order.total_amount} Tk</p>
                        <select value={order.status}
                          onChange={e => { e.stopPropagation(); updateOrderStatus(order.id, e.target.value); }}
                          style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px 6px', fontSize: '12px', cursor: 'pointer' }}>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          {role === 'admin' && <option value="cancelled">Cancelled</option>}
                        </select>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}
                          style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>
                          🖨️ Print/Save
                        </button>
                      </div>
                    </div>
                    <div style={{ marginTop: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', padding: '3px 0', borderBottom: '1px dashed #f3f4f6' }}>
                          <span>{item.products?.name} × {item.quantity} {item.products?.unit}</span>
                          <span style={{ fontWeight: '500' }}>{item.price * item.quantity} Tk</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', color: PINK, marginTop: '4px' }}>
                        <span>মোট:</span>
                        <span>{order.total_amount} Tk</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '4px' }}>ডাবল ক্লিক করুন পুরো রিসিট দেখতে</p>
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'notifications' && role === 'admin' && (
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>কোনো নোটিফিকেশন নেই</p>}
                {notifications.map((n: any) => (
                  <div key={n.id} style={{ padding: '12px', borderRadius: '12px', border: '1px solid', borderColor: n.is_read ? '#e5e7eb' : PINK_BORDER, background: n.is_read ? '#f9fafb' : PINK_LIGHT }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: '0 0 4px 0' }}>🔔 {n.message}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{new Date(n.created_at).toLocaleString('bn-BD')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}