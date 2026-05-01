'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import OrderForm from './OrderForm';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

function isOfficeOpen() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const openTime = 9 * 60 + 30;
  const closeTime = 21 * 60 + 30;
  return totalMinutes >= openTime && totalMinutes <= closeTime;
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
          <h3 className="font-bold text-gray-800">{item.name_bn || item.name}</h3>
          <p className="text-xs text-gray-400">{item.price_per_unit} Tk/{item.unit}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="text-blue-500 text-xs border border-blue-500 px-2 py-1 rounded-lg">Edit</button>
          <button onClick={() => onRemove(item.id)} className="text-red-500 text-xs border border-red-500 px-2 py-1 rounded-lg">Remove</button>
        </div>
      </div>
      {editing ? (
        <div className="mt-2 bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500 mb-2">পরিমাণ পরিবর্তন করুন</p>
          <div className="flex gap-1 mb-1">
            <input
              type="number" min="0" step={isPiece ? '1' : '0.001'} value={newQty}
              onChange={e => setNewQty(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-2 py-2 w-full text-sm text-gray-900 font-medium focus:border-green-500 focus:outline-none"
              placeholder="পরিমাণ লিখুন"
            />
            {isPiece ? (
              <select value={newQty} onChange={e => setNewQty(e.target.value)} className="border-2 border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 font-medium bg-white">
                <option value="">pcs</option>
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            ) : (
              <select value={newUnit} onChange={e => setNewUnit(e.target.value)} className="border-2 border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 font-medium bg-white">
                {isKg && <><option value={item.unit}>Kg</option><option value="gm">gm</option></>}
                {isLiter && <><option value={item.unit}>Liter</option><option value="ml">ml</option></>}
              </select>
            )}
          </div>
          {newQty && parseFloat(newQty) > 0 && (
            <p className="text-xs text-green-700 font-bold bg-green-50 p-1 rounded border border-green-200 mb-2">
              {newQty} {isPiece ? item.unit : newUnit} = {(getActualQty() * item.price_per_unit).toFixed(0)} Tk
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={() => { const actual = getActualQty(); if (actual > 0) { onUpdate(item.id, actual); setEditing(false); } }} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex-1 font-medium">সেভ করুন</button>
            <button onClick={() => setEditing(false)} className="bg-gray-200 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium">বন্ধ করুন</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600 font-medium">{item.qty} {item.unit}</span>
          <span className="font-bold text-green-700">{(item.price_per_unit * item.qty).toFixed(0)} Tk</span>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState(product.unit);
  const stock = product.stock?.[0]?.quantity || 0;
  const u = (product.unit || '').toLowerCase().trim();
  const isKg = u === 'kg';
  const isLiter = u === 'liter' || u === 'l';
  const isPiece = !isKg && !isLiter;

  const getActualQty = () => {
    const q = parseFloat(qty);
    if (!q || q <= 0) return 0;
    if (isKg && unit === 'gm') return q / 1000;
    if (isLiter && unit === 'ml') return q / 1000;
    return q;
  };

  return (
    <div className="bg-white rounded-xl shadow p-3">
      <h3 className="font-bold text-gray-800 text-sm">{product.name_bn || product.name}</h3>
      <p className="text-xs text-gray-500">{product.name}</p>
      <p className="text-green-700 font-bold text-sm mt-1">1 {product.unit} = {product.price_per_unit} Tk</p>
      <p className="text-xs text-gray-400">Stock: {stock} {product.unit}</p>
      <div className="mt-2">
        <div className="flex gap-1 mb-1">
          <input
            type="number" min="0" step={isPiece ? '1' : '0.001'} value={qty}
            onChange={e => setQty(e.target.value)}
            className="border-2 border-gray-300 rounded-lg px-2 py-2 w-full text-sm text-gray-900 font-medium focus:border-green-500 focus:outline-none"
            placeholder="পরিমাণ লিখুন"
          />
          {isPiece ? (
            <select value={qty} onChange={e => setQty(e.target.value)} className="border-2 border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 font-medium bg-white">
              <option value="">pcs</option>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          ) : (
            <select value={unit} onChange={e => setUnit(e.target.value)} className="border-2 border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 font-medium bg-white">
              {isKg && <><option value={product.unit}>Kg</option><option value="gm">gm</option></>}
              {isLiter && <><option value={product.unit}>Liter</option><option value="ml">ml</option></>}
            </select>
          )}
        </div>
        {qty && parseFloat(qty) > 0 && (
          <p className="text-xs text-green-700 mb-1 font-bold bg-green-50 p-1 rounded border border-green-200">
            {qty} {isPiece ? product.unit : unit} = {(getActualQty() * product.price_per_unit).toFixed(0)} Tk
          </p>
        )}
        <button
          onClick={() => { const actual = getActualQty(); if (actual > 0) onAdd(product, actual); }}
          className="bg-green-600 text-white px-2 py-2 rounded-lg text-sm w-full font-medium"
        >
          🛒 ঝুড়িতে যোগ করুন
        </button>
      </div>
    </div>
  );
}

export default function ProductList({ branch }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [officeOpen] = useState(isOfficeOpen());

  useEffect(() => {
    fetchProducts();
  }, [branch]);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, stock(*)')
      .eq('branch_id', branch.id)
      .eq('is_active', true);
    if (data) setProducts(data);
    setLoading(false);
  }

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  const filtered = products.filter(p => {
    const matchSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.name_bn && p.name_bn.includes(search)) ||
      (p.category_bn && p.category_bn.includes(search));
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

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

  function removeFromCart(id) {
    setCart(cart.filter(c => c.id !== id));
  }

  const total = cart.reduce((a, c) => a + c.price_per_unit * c.qty, 0);

  if (showOrder) {
    return (
      <OrderForm
        cart={cart}
        branch={branch}
        total={total}
        onBack={() => setShowOrder(false)}
        onSuccess={(id) => { setOrderId(id); setShowOrder(false); setCart([]); setShowCart(false); }}
      />
    );
  }

  if (orderId) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">অর্ডার সফল হয়েছে!</h2>
          <p className="text-gray-500 mb-2">আপনার অর্ডার নম্বর:</p>
          <p className="text-3xl font-bold text-green-700 mb-6">#{orderId}</p>
          <p className="text-gray-500 mb-6">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো!</p>
          <button onClick={() => { setOrderId(null); setShowCart(false); }} className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-lg">
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
          <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">{cart.length} টি পণ্য</span>
        </div>
        <div className="p-4 space-y-3">
          {cart.map(item => (
            <CartItem key={item.id} item={item} onUpdate={updateCartQty} onRemove={removeFromCart} />
          ))}
        </div>

        {!officeOpen && (
          <div className="mx-4 bg-red-50 border-2 border-red-300 rounded-xl p-4 text-center">
            <p className="text-red-600 font-bold text-lg">🔴 আমাদের অফিস এখন বন্ধ</p>
            <p className="text-red-500 text-sm mt-1">অফিস সময়: সকাল ৯:৩০ - রাত ৯:৩০</p>
            <p className="text-gray-500 text-sm mt-1">অন্য সময়ে অর্ডার করুন</p>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
          <div className="flex justify-between mb-3">
            <span className="font-bold text-gray-700 text-lg">Total:</span>
            <span className="font-bold text-green-700 text-xl">{total.toFixed(0)} Tk</span>
          </div>
          <button
            onClick={() => officeOpen && setShowOrder(true)}
            className={`w-full py-3 rounded-xl font-bold text-lg ${officeOpen ? 'bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {officeOpen ? 'অর্ডার করুন' : '🔴 অফিস বন্ধ'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="p-4">
        <input
          type="text"
          placeholder="🔍 পণ্য সার্চ করুন..."
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedCategory(null); }}
          className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 font-medium shadow-sm focus:border-green-500 focus:outline-none"
        />
      </div>
      {categories.length > 0 && (
        <div className="px-4 flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${!selectedCategory ? 'bg-green-700 text-white' : 'bg-white text-green-700 border-2 border-green-700'}`}>
            সব পণ্য
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === cat ? 'bg-green-700 text-white' : 'bg-white text-green-700 border-2 border-green-700'}`}>
              {products.find(p => p.category === cat)?.category_bn || cat}
            </button>
          ))}
        </div>
      )}
      {loading && <p className="text-center text-gray-400 mt-10">লোড হচ্ছে...</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} onAdd={addToCart} />
        ))}
        {!loading && filtered.length === 0 && (
          <p className="col-span-4 text-center text-gray-400 mt-10">কোনো পণ্য পাওয়া যায়নি</p>
        )}
      </div>
      {cart.length > 0 && (
        <div onClick={() => setShowCart(true)} className="fixed bottom-0 left-0 right-0 bg-green-700 text-white p-4 cursor-pointer">
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