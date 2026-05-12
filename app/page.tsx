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

      requestNotificationPermission().then(token => {
        if (token) {
          localStorage.setItem('fcm_token', token);
          saveFCMToken(token);
        }
      });

      if (messaging) {
        onMessage(messaging, (payload: any) => {
          const title = payload.notification?.title || 'নতুন অর্ডার!';
          const body = payload.notification?.body || '';
          if (Notification.permission === 'granted') {
            new Notification(title, { body });
          }
          fetchOrders();
          fetchNotifications();
          playNotificationSound();
        });
      }

      const channel = supabase
        .channel('orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
          fetchOrders();
          fetchNotifications();
          playNotificationSound();
          if (autoPrint) {
            setTimeout(() => printOrder(payload.new as any), 1000);
          }
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [role, autoPrint]);

  async function saveFCMToken(token: string) {
    try {
      await supabase.from('fcm_tokens').upsert({ token, created_at: new Date().toISOString() });
    } catch (e) {}
  }

  function playNotificationSound() {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {}
  }

  async function fetchBranches() {
    const { data } = await supabase.from('branches').select('*');
    if (data) {
      setBranches(data as Branch[]);
      setBranches2(data);
    }
  }

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name_bn, name))')
      .order('created_at', { ascending: false });
    if (data) {
      setOrders(data);
      setTotalOrders(data.length);
      const today = new Date().toDateString();
      const todayOrders = data.filter((o: any) =>
        new Date(o.created_at).toDateString() === today
      );
      const todayTotal = todayOrders.reduce((a: number, o: any) => a + o.total_amount, 0);
      setTodaySales(todayTotal);
    }
  }

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
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

  function printOrder(order: any) {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
      <head>
        <title>Order #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
          h2 { color: #15803d; border-bottom: 2px solid #15803d; padding-bottom: 10px; }
          .shop-info { background: #f0fdf4; padding: 10px; border-radius: 8px; margin-bottom: 10px; }
          .info { margin: 5px 0; font-size: 14px; }
          .item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #ccc; font-size: 14px; }
          .total { font-size: 18px; font-weight: bold; color: #15803d; margin-top: 10px; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="shop-info">
          <h2>🛒 Sohelmart</h2>
          <p class="info"><b>Website:</b> sohelmart.com</p>
          <p class="info"><b>Phone:</b> 01872149655</p>
          <p class="info"><b>Branch:</b> ${order.branch_id === 1 ? 'লালমোহন' : 'শাখা'}</p>
        </div>
        <p class="info"><b>Order #:</b> ${order.id}</p>
        <p class="info"><b>Name:</b> ${order.customer_name}</p>
        <p class="info"><b>Phone:</b> ${order.customer_phone}</p>
        <p class="info"><b>District:</b> ${order.district}</p>
        <p class="info"><b>Upazila:</b> ${order.upazila}</p>
        <p class="info"><b>Address:</b> ${order.address}</p>
        <p class="info"><b>Payment:</b> ${order.payment_method}</p>
        <p class="info"><b>Date:</b> ${new Date(order.created_at).toLocaleString()}</p>
        <hr/>
        <b>Items:</b>
        ${order.order_items?.map((item: any) => `
          <div class="item">
            <span>${item.products?.name_bn || item.products?.name}</span>
            <span>${item.quantity} x ${item.price} = ${item.quantity * item.price} Tk</span>
          </div>
        `).join('')}
        <p class="total">Total: ${order.total_amount} Tk</p>
        <div class="footer">ধন্যবাদ আমাদের সাথে কেনাকাটা করার জন্য!</div>
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  }

  async function saveOrderAsImage(order: any) {
    const content = `
🛒 Sohelmart
sohelmart.com | 01872149655
শাখা: ${order.branch_id === 1 ? 'লালমোহন' : 'শাখা'}

অর্ডার #${order.id}
নাম: ${order.customer_name}
ফোন: ${order.customer_phone}
জেলা: ${order.district}, ${order.upazila}
ঠিকানা: ${order.address}
পেমেন্ট: ${order.payment_method}
তারিখ: ${new Date(order.created_at).toLocaleString('bn-BD')}

পণ্য তালিকা:
${order.order_items?.map((item: any) =>
  `${item.products?.name_bn || item.products?.name} x ${item.quantity} = ${item.quantity * item.price} Tk`
).join('\n')}

মোট: ${order.total_amount} Tk
ধন্যবাদ!`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setRole('admin');
      localStorage.setItem('role', 'admin');
      setShowLoginModal(false);
      setPassword('');
      setLoginError('');
    } else if (password === EDITOR_PASSWORD) {
      setRole('editor');
      localStorage.setItem('role', 'editor');
      setShowLoginModal(false);
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('পাসওয়ার্ড ভুল হয়েছে!');
    }
  }

  function handleLogout() {
    setRole(null);
    localStorage.removeItem('role');
    setShowAdminDrawer(false);
  }

  function toggleAutoPrint() {
    const newVal = !autoPrint;
    setAutoPrint(newVal);
    localStorage.setItem('autoPrint', newVal.toString());
  }

  if (!selectedBranch) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-white shadow rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-green-50"
          >
            👤
          </button>
          {role && (
            <div className="mt-1 flex flex-col items-end gap-1">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                {role === 'admin' ? '👑 Admin' : '✏️ Editor'}
              </span>
              <button onClick={handleLogout} className="text-xs text-red-500">লগআউট</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-center text-green-700 mb-2">
            🛒 মাই বাজার
          </h1>
          <p className="text-center text-gray-500 mb-6">
            আপনার শাখা সিলেক্ট করুন
          </p>
          <div className="space-y-3">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(branch)}
                className="w-full py-3 px-4 bg-green-100 hover:bg-green-200 text-green-800 font-medium rounded-xl transition"
              >
                {branch.name_bn || branch.name}
              </button>
            ))}
          </div>
        </div>

        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full mx-4">
              <h2 className="text-xl font-bold text-green-700 mb-4 text-center">🔐 লগইন</h2>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="পাসওয়ার্ড লিখুন"
                className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mb-2 focus:border-green-500 focus:outline-none"
                autoFocus
              />
              {loginError && <p className="text-red-500 text-xs mb-2">{loginError}</p>}
              <div className="flex gap-2">
                <button onClick={handleLogin}
                  className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex-1 font-medium">
                  লগইন
                </button>
                <button onClick={() => { setShowLoginModal(false); setPassword(''); setLoginError(''); }}
                  className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium">
                  বাতিল
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      <div className="bg-green-700 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">🛒 মাই বাজার</h1>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <button
              onClick={() => { setShowAdminDrawer(true); fetchOrders(); fetchNotifications(); }}
              className="relative bg-yellow-500 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold"
            >
              ⋯
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setSelectedBranch(null)}
            className="text-sm bg-green-600 px-3 py-1 rounded-lg"
          >
            {selectedBranch.name_bn || selectedBranch.name} ✕
          </button>
        </div>
      </div>

      <ProductList branch={selectedBranch} role={role} />

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
                <p className="text-xs text-gray-500">Today's Sales</p>
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
                { key: 'add_product', label: '+ Product' },
              ].map(t => (
                <button key={t.key} onClick={() => { setAdminTab(t.key); if (t.key === 'notifications') markAllRead(); }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${adminTab === t.key ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {t.label}
                </button>
              ))}
              <button onClick={handleLogout}
                className="px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-red-100 text-red-700">
                Logout
              </button>
            </div>

            {adminTab === 'notifications' && (
              <div className="p-4 space-y-2">
                {notifications.length === 0 && (
                  <p className="text-center text-gray-400 mt-10">কোনো নোটিফিকেশন নেই</p>
                )}
                {notifications.map((n: any) => (
                  <div key={n.id} className={`p-3 rounded-xl border ${n.is_read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                    <p className="text-sm font-medium text-gray-800">🔔 {n.message}</p>
                    <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString('bn-BD')}</p>
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'orders' && (
              <div className="p-4 space-y-3">
                {orders.length === 0 && (
                  <p className="text-center text-gray-400 mt-10">No orders yet</p>
                )}
                {orders.map((order: any) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={updateOrderStatus}
                    onPrint={printOrder}
                    onSave={saveOrderAsImage}
                  />
                ))}
              </div>
            )}

            {adminTab === 'add_product' && (
              <AddProductPanel branches={branches2} onDone={() => setAdminTab('orders')} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onStatusChange, onPrint, onSave }: any) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800 text-sm">#{order.id} - {order.customer_name}</h3>
          <p className="text-xs text-gray-500">{order.customer_phone}</p>
          <p className="text-xs text-gray-500">{order.district}, {order.upazila}</p>
          <p className="text-xs text-gray-500">{order.address}</p>
          <p className="text-xs text-gray-500">Payment: {order.payment_method}</p>
          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('bn-BD')}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="font-bold text-green-700">{order.total_amount} Tk</p>
          <select value={order.status} onChange={e => onStatusChange(order.id, e.target.value)}
            className="border border-gray-300 rounded-lg px-1 py-1 text-xs">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}
              className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold">
              ⋯
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg z-50 w-48 border border-gray-200">
                <button onClick={() => { onPrint(order); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                  🖨️ প্রিন্ট করুন
                </button>
                <button onClick={() => { onSave(order); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                  💾 সেভ করুন
                </button>
              </div>
            )}
            {showMenu && (
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 border-t pt-2">
        {order.order_items?.map((item: any) => (
          <p key={item.id} className="text-xs text-gray-600">
            {item.products?.name_bn || item.products?.name} x {item.quantity} = {item.price * item.quantity} Tk
          </p>
        ))}
      </div>
    </div>
  );
}

function AddProductPanel({ branches, onDone }: { branches: any[], onDone: () => void }) {
  const [form, setForm] = useState({
    name: '', name_bn: '', product_code: '', description: '',
    price_per_unit: '', unit: 'Kg', branch_id: '',
    category: '', category_bn: '', stock: '', image_url: '', page_id: ''
  });
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.from('pages').select('*').then(({ data }) => {
      if (data) setPages(data);
    });
  }, []);

  const handle = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  async function uploadImage(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('products').upload(fileName, file);
    if (error) { alert('সমস্যা: ' + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
    setForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
  }

  async function addProduct() {
    if (!form.name || !form.product_code || !form.price_per_unit || !form.branch_id) {
      alert('নাম, কোড, দাম এবং শাখা আবশ্যক!');
      return;
    }
    const supabaseClient = createClient(
      'https://jthdtmqrapnfmmmeuqsw.supabase.co',
      'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
    );
    setLoading(true);
    const { data: product, error } = await supabaseClient
      .from('products')
      .insert({
        name: form.name, name_bn: form.name_bn,
        product_code: form.product_code, description: form.description,
        price_per_unit: parseFloat(form.price_per_unit),
        unit: form.unit, branch_id: parseInt(form.branch_id),
        category: form.category, category_bn: form.category_bn,
        image_url: form.image_url,
        page_id: form.page_id ? parseInt(form.page_id) : null,
        is_active: true
      }).select().single();

    if (error) { alert('সমস্যা: ' + error.message); setLoading(false); return; }

    if (form.stock && parseFloat(form.stock) > 0) {
      await supabaseClient.from('stock').insert({ product_id: product.id, quantity: parseFloat(form.stock) });
    }
    alert('পণ্য যোগ হয়েছে!');
    setForm({
      name: '', name_bn: '', product_code: '', description: '',
      price_per_unit: '', unit: 'Kg', branch_id: '',
      category: '', category_bn: '', stock: '', image_url: '', page_id: ''
    });
    setLoading(false);
    onDone();
  }

  return (
    <div className="p-4 space-y-2">
      <h3 className="font-bold text-gray-700">Add New Product</h3>
      {[
        { name: 'name', label: 'English Name *', placeholder: 'Anchor Dal' },
        { name: 'name_bn', label: 'Bengali Name', placeholder: 'এ্যাংকর ডাল' },
        { name: 'product_code', label: 'Product Code *', placeholder: 'P001' },
        { name: 'price_per_unit', label: 'Price *', placeholder: '120', type: 'number' },
        { name: 'category', label: 'Category (EN)', placeholder: 'dal' },
        { name: 'category_bn', label: 'Category (BN)', placeholder: 'ডাল' },
        { name: 'stock', label: 'Initial Stock', placeholder: '50', type: 'number' },
      ].map((field: any) => (
        <div key={field.name}>
          <label className="text-xs text-gray-500">{field.label}</label>
          <input name={field.name} value={(form as any)[field.name]} onChange={handle}
            type={field.type || 'text'} placeholder={field.placeholder}
            className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
        </div>
      ))}
      <div>
        <label className="text-xs text-gray-500">Description</label>
        <textarea name="description" value={form.description} onChange={handle} rows={2}
          className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1"
          placeholder="Product description" />
      </div>
      <div>
        <label className="text-xs text-gray-500">Unit</label>
        <select name="unit" value={form.unit} onChange={handle}
          className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
          <option value="Kg">Kg</option>
          <option value="Liter">Liter</option>
          <option value="pcs">pcs</option>
          <option value="packet">Packet</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500">Branch *</label>
        <select name="branch_id" value={form.branch_id} onChange={handle}
          className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
          <option value="">Select Branch</option>
          {branches.map((b: any) => (
            <option key={b.id} value={b.id}>{b.name_bn || b.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500">Page</label>
        <select name="page_id" value={form.page_id} onChange={handle}
          className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
          <option value="">Select Page</option>
          {pages.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name_bn || p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500">Image</label>
        {form.image_url && (
          <img src={form.image_url} alt="product" className="w-full object-contain rounded-lg mt-1 mb-1 max-h-32" />
        )}
        <input type="file" accept="image/*" onChange={uploadImage}
          className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
        {uploading && <p className="text-xs text-blue-500 mt-1">Uploading...</p>}
      </div>
      <button onClick={addProduct} disabled={loading || uploading}
        className="w-full bg-green-700 text-white py-3 rounded-xl font-bold disabled:opacity-50">
        {loading ? 'Adding...' : '+ Add Product'}
      </button>
    </div>
  );
}