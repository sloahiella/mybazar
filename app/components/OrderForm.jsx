'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

export default function OrderForm({ cart, branch, total, onSuccess, onBack }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    district: '',
    upazila: '',
    address: '',
    payment: 'cash'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function submitOrder() {
    if (!form.name || !form.phone || !form.address) {
      setError('নাম, ফোন নম্বর এবং ঠিকানা আবশ্যক!');
      return;
    }
    setLoading(true);
    setError('');

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        branch_id: branch.id,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        district: form.district,
        upazila: form.upazila,
        address: form.address,
        payment_method: form.payment,
        total_amount: total,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      setError('অর্ডার করতে সমস্যা হয়েছে! আবার চেষ্টা করুন।');
      setLoading(false);
      return;
    }

    const items = cart.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.qty,
      price: item.price_per_unit
    }));

    await supabase.from('order_items').insert(items);

    setLoading(false);
    onSuccess(order.id);
  }

  return (
    <div className="min-h-screen bg-green-50 pb-24">
      <div className="bg-white p-4 shadow flex items-center gap-3">
        <button onClick={onBack} className="text-green-700 font-bold text-lg">
          &larr; ঝুড়িতে ফিরুন
        </button>
        <h2 className="text-xl font-bold text-green-700">অর্ডার ফর্ম</h2>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-white rounded-xl shadow p-3">
          <h3 className="font-bold text-gray-700 mb-3">আপনার তথ্য দিন</h3>

          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500 font-medium">নাম *</label>
              <input
                name="name"
                value={form.name}
                onChange={handle}
                placeholder="আপনার পূর্ণ নাম"
                className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm text-gray-900 mt-1 focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">ফোন নম্বর *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handle}
                placeholder="01XXXXXXXXX"
                className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm text-gray-900 mt-1 focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">ইমেইল</label>
              <input
                name="email"
                value={form.email}
                onChange={handle}
                placeholder="example@email.com"
                className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm text-gray-900 mt-1 focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">জেলা</label>
              <input
                name="district"
                value={form.district}
                onChange={handle}
                placeholder="আপনার জেলা"
                className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm text-gray-900 mt-1 focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">উপজেলা</label>
              <input
                name="upazila"
                value={form.upazila}
                onChange={handle}
                placeholder="আপনার উপজেলা"
                className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm text-gray-900 mt-1 focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">বিস্তারিত ঠিকানা *</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handle}
                placeholder="গ্রাম/মহল্লা, বাড়ির নাম/নম্বর"
                rows={2}
                className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm text-gray-900 mt-1 focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-3">
          <h3 className="font-bold text-gray-700 mb-3">পেমেন্ট পদ্ধতি</h3>
          <div className="grid grid-cols-3 gap-2">
            {['cash', 'bkash', 'nagad'].map(method => (
              <button
                key={method}
                onClick={() => setForm({ ...form, payment: method })}
                className={`py-2 rounded-xl text-sm font-medium border-2 ${form.payment === method ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                {method === 'cash' ? 'ক্যাশ' : method === 'bkash' ? 'বিকাশ' : 'নগদ'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-3">
          <h3 className="font-bold text-gray-700 mb-2">অর্ডার সারসংক্ষেপ</h3>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600 py-1 border-b">
              <span>{item.name_bn || item.name} ({item.qty} {item.unit})</span>
              <span className="font-bold">{(item.price_per_unit * item.qty).toFixed(0)} Tk</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-green-700 mt-2 text-lg">
            <span>Total:</span>
            <span>{total.toFixed(0)} Tk</span>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
        <button
          onClick={submitOrder}
          disabled={loading}
          className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50"
        >
          {loading ? 'অপেক্ষা করুন...' : 'অর্ডার নিশ্চিত করুন'}
        </button>
      </div>
    </div>
  );
}