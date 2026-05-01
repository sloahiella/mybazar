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
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('products');
  const [form, setForm] = useState({
    name: '',
    name_bn: '',
    product_code: '',
    description: '',
    price_per_unit: '',
    unit: 'Kg',
    branch_id: '',
    category: '',
    category_bn: '',
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchBranches();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*, stock(*), branches(name_bn)')
      .order('id', { ascending: false });
    if (data) setProducts(data);
  }

  async function fetchBranches() {
    const { data } = await supabase.from('branches').select('*');
    if (data) setBranches(data);
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
        name: form.name,
        name_bn: form.name_bn,
        product_code: form.product_code,
        description: form.description,
        price_per_unit: parseFloat(form.price_per_unit),
        unit: form.unit,
        branch_id: parseInt(form.branch_id),
        category: form.category,
        category_bn: form.category_bn,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      alert('সমস্যা হয়েছে: ' + error.message);
      setLoading(false);
      return;
    }

    if (form.stock && parseFloat(form.stock) > 0) {
      await supabase.from('stock').insert({
        product_id: product.id,
        quantity: parseFloat(form.stock)
      });
    }

    alert('পণ্য যোগ হয়েছে!');
    setForm({
      name: '', name_bn: '', product_code: '', description: '',
      price_per_unit: '', unit: 'Kg', branch_id: '', category: '',
      category_bn: '', stock: ''
    });
    fetchProducts();
    setLoading(false);
  }

  async function toggleProduct(id, status) {
    await supabase.from('products').update({ is_active: !status }).eq('id', id);
    fetchProducts();
  }

  async function addStock(productId, qty) {
    const existing = await supabase.from('stock').select('*').eq('product_id', productId).single();
    if (existing.data) {
      await supabase.from('stock').update({
        quantity: existing.data.quantity + parseFloat(qty)
      }).eq('product_id', productId);
    } else {
      await supabase.from('stock').insert({ product_id: productId, quantity: parseFloat(qty) });
    }
    fetchProducts();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white p-4">
        <h1 className="text-xl font-bold">🛒 Admin Panel - মাই বাজার</h1>
      </div>

      <div className="flex gap-2 p-4">
        <button
          onClick={() => setTab('products')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'products' ? 'bg-green-700 text-white' : 'bg-white text-green-700 border border-green-700'}`}
        >
          পণ্য যোগ করুন
        </button>
        <button
          onClick={() => setTab('list')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'list' ? 'bg-green-700 text-white' : 'bg-white text-green-700 border border-green-700'}`}
        >
          পণ্য তালিকা ({products.length})
        </button>
      </div>

      {tab === 'products' && (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow p-4 space-y-3">
            <h2 className="font-bold text-gray-700 text-lg">নতুন পণ্য যোগ করুন</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">ইংরেজি নাম *</label>
                <input name="name" value={form.name} onChange={handle}
                  placeholder="Anchor Dal"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">বাংলা নাম</label>
                <input name="name_bn" value={form.name_bn} onChange={handle}
                  placeholder="এ্যাংকর ডাল"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">পণ্য কোড *</label>
                <input name="product_code" value={form.product_code} onChange={handle}
                  placeholder="P001"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">দাম (প্রতি ইউনিট) *</label>
                <input name="price_per_unit" value={form.price_per_unit} onChange={handle}
                  type="number" placeholder="120"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">ইউনিট</label>
                <select name="unit" value={form.unit} onChange={handle}
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
                  <option value="Kg">Kg (কেজি)</option>
                  <option value="Liter">Liter (লিটার)</option>
                  <option value="pcs">pcs (পিস)</option>
                  <option value="packet">Packet (প্যাকেট)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">শাখা *</label>
                <select name="branch_id" value={form.branch_id} onChange={handle}
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1">
                  <option value="">শাখা সিলেক্ট করুন</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name_bn || b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">ক্যাটাগরি (ইংরেজি)</label>
                <input name="category" value={form.category} onChange={handle}
                  placeholder="dal"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">ক্যাটাগরি (বাংলা)</label>
                <input name="category_bn" value={form.category_bn} onChange={handle}
                  placeholder="ডাল"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">প্রাথমিক স্টক</label>
                <input name="stock" value={form.stock} onChange={handle}
                  type="number" placeholder="50"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500">বিবরণ</label>
                <input name="description" value={form.description} onChange={handle}
                  placeholder="পণ্যের বিবরণ"
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mt-1" />
              </div>
            </div>

            <button
              onClick={addProduct}
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50"
            >
              {loading ? 'যোগ হচ্ছে...' : '+ পণ্য যোগ করুন'}
            </button>
          </div>
        </div>
      )}

      {tab === 'list' && (
        <div className="p-4">
          <div className="space-y-3">
            {products.map(product => (
              <ProductRow
                key={product.id}
                product={product}
                onToggle={toggleProduct}
                onAddStock={addStock}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, onToggle, onAddStock }) {
  const [addQty, setAddQty] = useState('');
  const stock = product.stock?.[0]?.quantity || 0;

  return (
    <div className="bg-white rounded-xl shadow p-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800">{product.name_bn || product.name}</h3>
          <p className="text-xs text-gray-500">{product.name} | {product.product_code}</p>
          <p className="text-green-700 font-bold text-sm">{product.price_per_unit} Tk/{product.unit}</p>
          <p className="text-xs text-gray-400">Stock: {stock} {product.unit}</p>
        </div>
        <button
          onClick={() => onToggle(product.id, product.is_active)}
          className={`px-3 py-1 rounded-lg text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
        >
          {product.is_active ? '✅ Active' : '❌ Inactive'}
        </button>
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="number"
          value={addQty}
          onChange={e => setAddQty(e.target.value)}
          placeholder="স্টক যোগ করুন"
          className="border-2 border-gray-300 rounded-lg px-2 py-1 text-sm flex-1"
        />
        <button
          onClick={() => { if (addQty) { onAddStock(product.id, addQty); setAddQty(''); } }}
          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
        >
          + স্টক
        </button>
      </div>
    </div>
  );
}