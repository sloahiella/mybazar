'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('add');
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', name_bn: '', product_code: '', description: '',
    price_per_unit: '', unit: 'Kg', branch_id: '',
    category: '', category_bn: '', stock: '', page_id: ''
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') window.location.href = '/';
    fetchProducts();
    fetchBranches();
    fetchPages();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*, stock(*), pages(name_bn, name)')
      .order('id', { ascending: false });
    if (data) setProducts(data);
  }

  async function fetchBranches() {
    const { data } = await supabase.from('branches').select('*');
    if (data) setBranches(data);
  }

  async function fetchPages() {
    const { data } = await supabase.from('pages').select('*');
    if (data) setPages(data);
  }

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

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
        page_id: form.page_id ? parseInt(form.page_id) : null,
        is_active: true
      }).select().single();

    if (error) { alert('সমস্যা: ' + error.message); setLoading(false); return; }

    if (form.stock && parseFloat(form.stock) > 0) {
      await supabase.from('stock').insert({ product_id: product.id, quantity: parseFloat(form.stock) });
    }
    alert('পণ্য যোগ হয়েছে!');
    setForm({ name: '', name_bn: '', product_code: '', description: '', price_per_unit: '', unit: 'Kg', branch_id: '', category: '', category_bn: '', stock: '', page_id: '' });
    fetchProducts();
    setLoading(false);
  }

  async function updateProduct() {
    if (!editProduct) return;
    setLoading(true);
    await supabase.from('products').update({
      name: editProduct.name, name_bn: editProduct.name_bn,
      price_per_unit: parseFloat(editProduct.price_per_unit),
      unit: editProduct.unit, category: editProduct.category,
      category_bn: editProduct.category_bn, description: editProduct.description,
      image_url: editProduct.image_url,
      page_id: editProduct.page_id ? parseInt(editProduct.page_id) : null
    }).eq('id', editProduct.id);
    alert('আপডেট হয়েছে!');
    setEditProduct(null);
    fetchProducts();
    setLoading(false);
  }

  async function deleteProduct(id) {
    if (!confirm('মুছে দেবেন?')) return;
    await supabase.from('stock').delete().eq('product_id', id);
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  }

  async function toggleProduct(id, status) {
    await supabase.from('products').update({ is_active: !status }).eq('id', id);
    fetchProducts();
  }

  async function addStock(productId, qty) {
    const { data: existing } = await supabase.from('stock').select('*').eq('product_id', productId).single();
    if (existing) {
      await supabase.from('stock').update({ quantity: existing.quantity + parseFloat(qty) }).eq('product_id', productId);
    } else {
      await supabase.from('stock').insert({ product_id: productId, quantity: parseFloat(qty) });
    }
    fetchProducts();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">👑 Admin Panel</h1>
        <div className="flex gap-2">
          <button onClick={() => window.location.href = '/'} className="text-sm bg-green-600 px-3 py-1 rounded-lg">🏠 হোম</button>
          <button onClick={() => { localStorage.removeItem('role'); window.location.href = '/'; }} className="text-sm bg-red-600 px-3 py-1 rounded-lg">লগআউট</button>
        </div>
      </div>

      <div className="flex gap-2 p-4 flex-wrap">
        {['add', 'list', 'orders'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${tab === t ? 'bg-green-700 text-white' : 'bg-white text-green-700 border border-green-700'}`}>
            {t === 'add' ? '+ পণ্য যোগ' : t === 'list' ? `পণ্য তালিকা (${products.length})` : 'অর্ডার লিস্ট'}
          </button>
        ))}
      </div>

      {tab === 'add' && (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow p-4 space-y-3">
            <h2 className="font-bold text-gray-700 text-lg">নতুন পণ্য যোগ করুন</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">ইংরেজি নাম *</label>
                <input name="name" value={form.name} onChange={handle} placeholder="Anchor Dal"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">বাংলা নাম</label>
                <input name="name_bn" value={form.name_bn} onChange={handle} placeholder="এ্যাংকর ডাল"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">পণ্য কোড *</label>
                <input name="product_code" value={form.product_code} onChange={handle} placeholder="P001"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">দাম *</label>
                <input name="price_per_unit" type="number" value={form.price_per_unit} onChange={handle} placeholder="120"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">ইউনিট</label>
                <select name="unit" value={form.unit} onChange={handle}
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
                  <option value="Kg">Kg (কেজি)</option>
                  <option value="Liter">Liter (লিটার)</option>
                  <option value="pcs">pcs (পিস)</option>
                  <option value="packet">Packet</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">শাখা *</label>
                <select name="branch_id" value={form.branch_id} onChange={handle}
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
                  <option value="">শাখা সিলেক্ট করুন</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name_bn || b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">পেজ</label>
                <select name="page_id" value={form.page_id} onChange={handle}
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
                  <option value="">পেজ সিলেক্ট করুন</option>
                  {pages.map(p => <option key={p.id} value={p.id}>{p.name_bn || p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">ক্যাটাগরি (ইং)</label>
                <input name="category" value={form.category} onChange={handle} placeholder="dal"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">ক্যাটাগরি (বাং)</label>
                <input name="category_bn" value={form.category_bn} onChange={handle} placeholder="ডাল"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">প্রাথমিক স্টক</label>
                <input name="stock" type="number" value={form.stock} onChange={handle} placeholder="50"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500">বৈশিষ্ট্য / বিবরণ</label>
                <textarea name="description" value={form.description} onChange={handle} rows={2}
                  placeholder="পণ্যের বৈশিষ্ট্য লিখুন"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
            </div>
            <button onClick={addProduct} disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50">
              {loading ? 'যোগ হচ্ছে...' : '+ পণ্য যোগ করুন'}
            </button>
          </div>
        </div>
      )}

      {tab === 'list' && (
        <div className="p-4 space-y-3">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow p-3">
              {editProduct?.id === product.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editProduct.name} onChange={e => setEditProduct({...editProduct, name: e.target.value})}
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm" placeholder="ইংরেজি নাম" />
                    <input value={editProduct.name_bn || ''} onChange={e => setEditProduct({...editProduct, name_bn: e.target.value})}
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm" placeholder="বাংলা নাম" />
                    <input type="number" value={editProduct.price_per_unit} onChange={e => setEditProduct({...editProduct, price_per_unit: e.target.value})}
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm" placeholder="দাম" />
                    <select value={editProduct.unit} onChange={e => setEditProduct({...editProduct, unit: e.target.value})}
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm">
                      <option value="Kg">Kg</option>
                      <option value="Liter">Liter</option>
                      <option value="pcs">pcs</option>
                      <option value="packet">Packet</option>
                    </select>
                    <input value={editProduct.category || ''} onChange={e => setEditProduct({...editProduct, category: e.target.value})}
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm" placeholder="ক্যাটাগরি (ইং)" />
                    <input value={editProduct.category_bn || ''} onChange={e => setEditProduct({...editProduct, category_bn: e.target.value})}
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm" placeholder="ক্যাটাগরি (বাং)" />
                    <input value={editProduct.image_url || ''} onChange={e => setEditProduct({...editProduct, image_url: e.target.value})}
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm col-span-2" placeholder="ছবির URL" />
                    <textarea value={editProduct.description || ''} onChange={e => setEditProduct({...editProduct, description: e.target.value})}
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm col-span-2" placeholder="বৈশিষ্ট্য" rows={2} />
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500">পেজ</label>
                      <select value={editProduct.page_id || ''} onChange={e => setEditProduct({...editProduct, page_id: e.target.value})}
                        className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm w-full mt-1">
                        <option value="">পেজ সিলেক্ট করুন</option>
                        {pages.map(p => <option key={p.id} value={p.id}>{p.name_bn || p.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={updateProduct} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex-1">সেভ</button>
                    <button onClick={() => setEditProduct(null)} className="bg-gray-200 text-gray-600 px-3 py-1 rounded-lg text-sm">বাতিল</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{product.name_bn || product.name}</h3>
                      <p className="text-xs text-gray-500">{product.name} | {product.product_code}</p>
                      <p className="text-green-700 font-bold text-sm">{product.price_per_unit} Tk/{product.unit}</p>
                      <p className="text-xs text-gray-400">Stock: {product.stock?.[0]?.quantity || 0} {product.unit}</p>
                      <p className="text-xs text-blue-500">পেজ: {product.pages?.name_bn || product.pages?.name || 'কোনো পেজ নেই'}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => toggleProduct(product.id, product.is_active)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.is_active ? '✅ Active' : '❌ Inactive'}
                      </button>
                      <button onClick={() => setEditProduct(product)}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">✏️ Edit</button>
                      <button onClick={() => deleteProduct(product.id)}
                        className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs">🗑️ Delete</button>
                    </div>
                  </div>
                  <StockAdder productId={product.id} unit={product.unit} onAdd={addStock} />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && <OrderList />}
    </div>
  );
}

function StockAdder({ productId, unit, onAdd }) {
  const [qty, setQty] = useState('');
  return (
    <div className="flex gap-2 mt-2">
      <input type="number" value={qty} onChange={e => setQty(e.target.value)}
        placeholder={`স্টক যোগ (${unit})`}
        className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm flex-1" />
      <button onClick={() => { if (qty) { onAdd(productId, qty); setQty(''); } }}
        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">+ স্টক</button>
    </div>
  );
}

function OrderList() {
  const [orders, setOrders] = useState([]);
  const supabaseClient = createClient(
    'https://jthdtmqrapnfmmmeuqsw.supabase.co',
    'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
  );

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    const { data } = await supabaseClient
      .from('orders')
      .select('*, order_items(*, products(name_bn, name))')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  }

  async function updateStatus(id, status) {
    await supabaseClient.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  }

  return (
    <div className="p-4 space-y-3">
      {orders.length === 0 && <p className="text-center text-gray-400 mt-10">কোনো অর্ডার নেই</p>}
      {orders.map(order => (
        <div key={order.id} className="bg-white rounded-xl shadow p-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-800">#{order.id} - {order.customer_name}</h3>
              <p className="text-xs text-gray-500">{order.customer_phone}</p>
              <p className="text-xs text-gray-500">{order.district}, {order.upazila}</p>
              <p className="text-xs text-gray-500">{order.address}</p>
              <p className="text-xs text-gray-500">পেমেন্ট: {order.payment_method}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-700">{order.total_amount} Tk</p>
              <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-xs mt-1">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="mt-2 border-t pt-2">
            {order.order_items?.map(item => (
              <p key={item.id} className="text-xs text-gray-600">
                {item.products?.name_bn || item.products?.name} x {item.quantity} = {item.price * item.quantity} Tk
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}