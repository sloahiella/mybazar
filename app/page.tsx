'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ProductList from './components/ProductList';

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

  useEffect(() => {
    fetchBranches();
    const savedRole = localStorage.getItem('role');
    if (savedRole) setRole(savedRole);
  }, []);

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

  async function updateOrderStatus(id: number, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
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
              onClick={() => { setShowAdminDrawer(true); fetchOrders(); }}
              className="bg-yellow-500 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold"
            >
              ⋯
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
                <p className="text-xs text-gray-500">আজকের বিক্রি</p>
                <p className="text-2xl font-bold text-green-700">{todaySales} Tk</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">মোট অর্ডার</p>
                <p className="text-2xl font-bold text-blue-700">{totalOrders}</p>
              </div>
            </div>

            <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
              {[
                { key: 'orders', label: '📋 অর্ডার' },
                { key: 'add_product', label: '+ পণ্য যোগ' },
              ].map(t => (
                <button key={t.key} onClick={() => setAdminTab(t.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${adminTab === t.key ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {t.label}
                </button>
              ))}
              <button onClick={handleLogout}
                className="px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-red-100 text-red-700">
                লগআউট
              </button>
            </div>

            {adminTab === 'orders' && (
              <div className="p-4 space-y-3">
                {orders.length === 0 && (
                  <p className="text-center text-gray-400 mt-10">কোনো অর্ডার নেই</p>
                )}
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">#{order.id} - {order.customer_name}</h3>
                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                        <p className="text-xs text-gray-500">{order.district}, {order.upazila}</p>
                        <p className="text-xs text-gray-500">{order.address}</p>
                        <p className="text-xs text-gray-500">পেমেন্ট: {order.payment_method}</p>
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('bn-BD')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700">{order.total_amount} Tk</p>
                        <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-1 py-1 text-xs mt-1">
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
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

function AddProductPanel({ branches, onDone }: { branches: any[], onDone: () => void }) {
  const [form, setForm] = useState({
    name: '', name_bn: '', product_code: '', description: '',
    price_per_unit: '', unit: 'Kg', branch_id: '',
    category: '', category_bn: '', stock: '', image_url: '', page_id: ''
  });
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('pages').select('*').then(({ data }) => {
      if (data) setPages(data);
    });
  }, []);

  const handle = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  async function addProduct() {
    if (!form.name || !form.product_code || !form.price_per_unit || !form.branch_id) {
      alert('নাম, কোড, দাম এবং শাখা আবশ্যক!');
      return;
    }
    setLoading(true);
    const { data: product, error } = await supabase
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
      await supabase.from('stock').insert({ product_id: product.id, quantity: parseFloat(form.stock) });
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
      <h3 className="font-bold text-gray-700">নতুন পণ্য যোগ করুন</h3>
      {[
        { name: 'name', label: 'ইংরেজি নাম *', placeholder: 'Anchor Dal' },
        { name: 'name_bn', label: 'বাংলা নাম', placeholder: 'এ্যাংকর ডাল' },
        { name: 'product_code', label: 'পণ্য কোড *', placeholder: 'P001' },
        { name: 'price_per_unit', label: 'দাম *', placeholder: '120', type: 'number' },
        { name: 'category', label: 'ক্যাটাগরি (ইং)', placeholder: 'dal' },
        { name: 'category_bn', label: 'ক্যাটাগরি (বাং)', placeholder: 'ডাল' },
        { name: 'stock', label: 'প্রাথমিক স্টক', placeholder: '50', type: 'number' },
        { name: 'image_url', label: 'ছবির URL', placeholder: 'https://...' },
      ].map((field: any) => (
        <div key={field.name}>
          <label className="text-xs text-gray-500">{field.label}</label>
          <input name={field.name} value={(form as any)[field.name]} onChange={handle}
            type={field.type || 'text'} placeholder={field.placeholder}
            className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
        </div>
      ))}
      <div>
        <label className="text-xs text-gray-500">বৈশিষ্ট্য</label>
        <textarea name="description" value={form.description} onChange={handle} rows={2}
          className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1"
          placeholder="পণ্যের বৈশিষ্ট্য লিখুন" />
      </div>
      <div>
        <label className="text-xs text-gray-500">ইউনিট</label>
        <select name="unit" value={form.unit} onChange={handle}
          className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
          <option value="Kg">Kg</option>
          <option value="Liter">Liter</option>
          <option value="pcs">pcs</option>
          <option value="packet">Packet</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500">শাখা *</label>
        <select name="branch_id" value={form.branch_id} onChange={handle}
          className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
          <option value="">শাখা সিলেক্ট করুন</option>
          {branches.map((b: any) => (
            <option key={b.id} value={b.id}>{b.name_bn || b.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500">পেজ</label>
        <select name="page_id" value={form.page_id} onChange={handle}
          className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
          <option value="">পেজ সিলেক্ট করুন</option>
          {pages.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name_bn || p.name}</option>
          ))}
        </select>
      </div>
      <button onClick={addProduct} disabled={loading}
        className="w-full bg-green-700 text-white py-3 rounded-xl font-bold disabled:opacity-50">
        {loading ? 'যোগ হচ্ছে...' : '+ পণ্য যোগ করুন'}
      </button>
    </div>
  );
}