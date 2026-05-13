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
const EDITOR_PASSWORD = 'editor@123';

interface Branch {
  id: number;
  name: string;
  name_bn: string;
  is_active: boolean;
}

function OrderReceipt({ order, onClose }: { order: any; onClose: () => void }) {
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
      '🛒 মাই বাজার',
      'mybazar.vercel.app | sohelmart.com',
      'WhatsApp: 01872149655',
      '════════════════════════════════════════',
      `শাখা: লালমোহন`,
      `তারিখ: ${new Date(order.created_at).toLocaleDateString('bn-BD')}`,
      '════════════════════════════════════════',
      `নাম: ${order.customer_name}`,
      `ফোন: ${order.customer_phone}`,
      `জেলা: ${order.district}, ${order.upazila}`,
      `ঠিকানা: ${order.address}`,
      `অর্ডার #: ${order.id}`,
      '════════════════════════════════════════',
      'পণ্য                                টাকা',
      '────────────────────────────────────────',
      ...((order.order_items || []).map((item: any) =>
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
          <div style={{ textAlign: 'center', borderBottom: '3px double #15803d', paddingBottom: '12px', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#15803d', margin: '0 0 4px 0' }}>🛒 মাই বাজার</h1>
            <p style={{ fontSize: '12px', color: '#4b5563', margin: '2px 0' }}>🌐 mybazar.vercel.app | sohelmart.com</p>
            <p style={{ fontSize: '12px', color: '#4b5563', margin: '2px 0' }}>📱 WhatsApp: 01872149655</p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1px 1fr',
            border: '1px solid #d1d5db', borderRadius: '8px',
            overflow: 'hidden', marginBottom: '12px',
          }}>
            <div style={{ padding: '12px', background: '#f9fafb' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#15803d', margin: '0 0 8px 0' }}>📍 আমাদের তথ্য</p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>শাখা: <strong>লালমোহন</strong></p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>সময়: {new Date(order.created_at).toLocaleTimeString('bn-BD')}</p>
            </div>
            <div style={{ background: '#d1d5db' }} />
            <div style={{ padding: '12px' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1d4ed8', margin: '0 0 8px 0' }}>👤 কাস্টমার তথ্য</p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>নাম: <strong>{order.customer_name}</strong></p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>ফোন: {order.customer_phone}</p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>জেলা: {order.district}, {order.upazila}</p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>ঠিকানা: {order.address}</p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>অর্ডার #: <strong>{order.id}</strong></p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '2px solid #374151', margin: '12px 0 8px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginBottom: '4px' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', margin: 0 }}>পণ্য</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', margin: 0 }}>টাকা</p>
          </div>

          {(order.order_items || []).map((item: any, i: number) => (
            <div key={i} style={{ borderBottom: '1px dashed #d1d5db', padding: '8px 4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, paddingRight: '16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 2px 0' }}>{item.products?.name}</p>
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

          <div style={{ borderTop: '2px solid #374151', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', margin: 0 }}>সর্বমোট:</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#15803d', margin: 0 }}>{order.total_amount} Tk</p>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
            ধন্যবাদ মাই বাজারে কেনাকাটা করার জন্য! 🙏
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
  const [showAdminDrawer, setShowAdminDrawer] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [todaySales, setTodaySales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [adminTab, setAdminTab] = useState('orders');
  const [branches2, setBranches2] = useState<any[]>([]);
  const [autoPrint, setAutoPrint] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchBranches();
    const savedRole = localStorage.getItem('role');
    if (savedRole) setRole(savedRole);
    const savedAutoPrint = localStorage.getItem('autoPrint');
    if (savedAutoPrint === 'true') setAutoPrint(true);
  }, []);

  useEffect(() => {
    if (role === 'admin') {
      fetchOrders();
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

      const channel = supabase
        .channel('orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
          fetchOrders();
          fetchNotifications();
          playNotificationSound();
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
    if (data) { setBranches(data as Branch[]); setBranches2(data); }
  }

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, name_bn, unit))')
      .order('created_at', { ascending: false });
    if (data) {
      setOrders(data);
      setTotalOrders(data.length);
      const today = new Date().toDateString();
      const todayOrders = data.filter((o: any) => new Date(o.created_at).toDateString() === today);
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

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setRole('admin'); localStorage.setItem('role', 'admin');
      setShowLoginModal(false); setPassword(''); setLoginError('');
    } else if (password === EDITOR_PASSWORD) {
      setRole('editor'); localStorage.setItem('role', 'editor');
      setShowLoginModal(false); setPassword(''); setLoginError('');
    } else {
      setLoginError('পাসওয়ার্ড ভুল হয়েছে!');
    }
  }

  function handleLogout() {
    setRole(null); localStorage.removeItem('role'); setShowAdminDrawer(false);
  }

  function toggleAutoPrint() {
    const newVal = !autoPrint;
    setAutoPrint(newVal);
    localStorage.setItem('autoPrint', newVal.toString());
  }

  const filteredOrders = orders.filter(o =>
    orderSearch === '' ||
    o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer_phone?.includes(orderSearch) ||
    String(o.id).includes(orderSearch)
  );

  if (!selectedBranch) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center relative">
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
          <button onClick={() => setShowLoginModal(true)}
            className="bg-white shadow rounded-full w-10 h-10 flex items-center justify-center text-xl">👤</button>
          {role && (
            <>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                {role === 'admin' ? '👑 Admin' : '✏️ Editor'}
              </span>
              <button onClick={handleLogout} className="text-xs text-red-500">লগআউট</button>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-center text-green-700 mb-2">🛒 মাই বাজার</h1>
          <p className="text-center text-gray-500 mb-6">আপনার শাখা সিলেক্ট করুন</p>
          <div className="space-y-3">
            {branches.map((branch) => (
              <button key={branch.id} onClick={() => setSelectedBranch(branch)}
                className="w-full py-3 px-4 bg-green-100 hover:bg-green-200 text-green-800 font-medium rounded-xl transition">
                {branch.name_bn || branch.name}
              </button>
            ))}
          </div>
        </div>

        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full mx-4">
              <h2 className="text-xl font-bold text-green-700 mb-4 text-center">🔐 লগইন</h2>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="পাসওয়ার্ড লিখুন"
                className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mb-2 focus:border-green-500 focus:outline-none"
                autoFocus />
              {loginError && <p className="text-red-500 text-xs mb-2">{loginError}</p>}
              <div className="flex gap-2">
                <button onClick={handleLogin}
                  className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex-1 font-medium">লগইন</button>
                <button onClick={() => { setShowLoginModal(false); setPassword(''); setLoginError(''); }}
                  className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium">বাতিল</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {selectedOrder && (
        <OrderReceipt order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {/* হেডার */}
      <div className="bg-green-700 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">🛒 মাই বাজার</h1>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <button onClick={() => { setShowAdminDrawer(true); fetchOrders(); fetchNotifications(); }}
              className="relative bg-yellow-500 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold">
              ⋯
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <button onClick={() => setSelectedBranch(null)}
            className="text-sm bg-green-600 px-3 py-1 rounded-lg">
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
      />

      {/* Admin Drawer */}
      {showAdminDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAdminDrawer(false)} />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full overflow-y-auto shadow-xl">
            <div className="bg-green-700 text-white p-4 flex justify-between items-center">
              <h2 className="font-bold text-lg">👑 Admin Panel</h2>
              <button onClick={() => setShowAdminDrawer(false)} className="text-2xl">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Today Sales</p>
                <p className="text-2xl font-bold text-green-700">{todaySales} Tk</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-blue-700">{totalOrders}</p>
              </div>
            </div>

            <div className="px-4 pb-2">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">🖨️ Auto Print</p>
                  <p className="text-xs text-gray-400">নতুন অর্ডারে অটো প্রিন্ট</p>
                </div>
                <button onClick={toggleAutoPrint}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${autoPrint ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {autoPrint ? '✅ চালু' : '❌ বন্ধ'}
                </button>
              </div>
            </div>

            <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
              {[
                { key: 'orders', label: '📋 Orders' },
                { key: 'notifications', label: `🔔 ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
              ].map(t => (
                <button key={t.key}
                  onClick={() => { setAdminTab(t.key); if (t.key === 'notifications') markAllRead(); }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${adminTab === t.key ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {t.label}
                </button>
              ))}
              <button onClick={handleLogout}
                className="px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-red-100 text-red-700">
                Logout
              </button>
            </div>

            {adminTab === 'orders' && (
              <div className="p-4 space-y-3">
                <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                  placeholder="🔍 নাম, ফোন বা অর্ডার নম্বর..."
                  className="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />

                {filteredOrders.length === 0 && (
                  <p className="text-center text-gray-400 mt-10">কোনো অর্ডার নেই</p>
                )}

                {filteredOrders.map((order: any) => (
                  <div key={order.id}
                    onDoubleClick={() => setSelectedOrder(order)}
                    className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm cursor-pointer hover:bg-green-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">#{order.id} - {order.customer_name}</h3>
                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                        <p className="text-xs text-gray-500">{order.district}, {order.upazila}</p>
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('bn-BD')}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="font-bold text-green-700">{order.total_amount} Tk</p>
                        <select value={order.status}
                          onChange={e => { e.stopPropagation(); updateOrderStatus(order.id, e.target.value); }}
                          className="border border-gray-300 rounded-lg px-1 py-1 text-xs">
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}
                          className="bg-blue-600 text-white px-2 py-1 rounded-lg text-xs">
                          🖨️ Print/Save
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 border-t pt-2">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-xs text-gray-600 py-1 border-b border-dashed border-gray-100">
                          <span>{item.products?.name} × {item.quantity} {item.products?.unit}</span>
                          <span className="font-medium">{item.price * item.quantity} Tk</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold text-green-700 mt-1 pt-1">
                        <span>মোট:</span>
                        <span>{order.total_amount} Tk</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-1">ডাবল ক্লিক করুন পুরো রিসিট দেখতে</p>
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'notifications' && (
              <div className="p-4 space-y-2">
                {notifications.length === 0 && <p className="text-center text-gray-400 mt-10">কোনো নোটিফিকেশন নেই</p>}
                {notifications.map((n: any) => (
                  <div key={n.id} className={`p-3 rounded-xl border ${n.is_read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                    <p className="text-sm font-medium text-gray-800">🔔 {n.message}</p>
                    <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString('bn-BD')}</p>
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