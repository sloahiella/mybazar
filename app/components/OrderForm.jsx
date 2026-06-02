'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

const PINK = '#db2777';
const PINK_LIGHT = '#fdf2f8';
const PINK_BORDER = '#fbcfe8';

const ADMIN_BKASH = '01872149655';
const ADMIN_NAGAD = '01872149655';

const inputStyle = {
  border: `2px solid ${PINK_BORDER}`,
  borderRadius: '8px',
  padding: '10px 12px',
  width: '100%',
  fontSize: '14px',
  marginTop: '4px',
  boxSizing: 'border-box',
  outline: 'none',
  color: '#1f2937',
  background: 'white',
};

export default function OrderForm({ cart, branch, total, onSuccess, onBack }) {
  const uniqueSellers = [...new Set(cart.map(item => item.seller_id).filter(Boolean))];
  const [form, setForm] = useState({
    name: localStorage.getItem('customer_name') || '',
    phone: localStorage.getItem('customer_phone') || '',
    email: '',
    district: localStorage.getItem('customer_district') || '',
    upazila: localStorage.getItem('customer_upazila') || '',
    address: '',
    payment: 'cod',
    transaction_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bkashNumber, setBkashNumber] = useState(ADMIN_BKASH);
  const [nagadNumber, setNagadNumber] = useState(ADMIN_NAGAD);

  useEffect(() => {
    fetchPaymentNumbers();
  }, []);

  async function fetchPaymentNumbers() {
    const pageIds = [...new Set(cart.map(item => item.page_id).filter(Boolean))];
    if (pageIds.length === 0) return;
    const { data } = await supabase.from('pages').select('bkash_number, nagad_number')
      .eq('id', pageIds[0]).single();
    if (data) {
      if (data.bkash_number) setBkashNumber(data.bkash_number);
      if (data.nagad_number) setNagadNumber(data.nagad_number);
    }
  }

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function submitOrder() {
    if (!form.name || !form.phone || !form.address) {
      setError('নাম, ফোন নম্বর এবং ঠিকানা আবশ্যক!');
      return;
    }
    if ((form.payment === 'bkash' || form.payment === 'nagad') && !form.transaction_id) {
      setError('বিকাশ/নগদ এ পেমেন্ট করলে Transaction ID দিতে হবে!');
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
        transaction_id: form.transaction_id || null,
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
    onSuccess(order.id, form.phone);
    return;
    if (itemsError) {
      console.error('order_items error details:', JSON.stringify(itemsError));
      console.error('items data:', JSON.stringify(items));
    }
  
  }

  return (
    <div style={{ minHeight: '100vh', background: PINK_LIGHT, paddingBottom: '100px' }}>
      <div style={{ background: PINK, color: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>←</button>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>অর্ডার ফর্ম</h2>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontWeight: 'bold', color: '#374151', marginBottom: '12px', fontSize: '15px' }}>আপনার তথ্য দিন</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>নাম *</label>
              <input name="name" value={form.name} onChange={handle}
                placeholder="আপনার পূর্ণ নাম"
                readOnly={!!localStorage.getItem('customer_name')}
                style={{ ...inputStyle, background: localStorage.getItem('customer_name') ? '#fdf2f8' : 'white' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>ফোন নম্বর *</label>
              <input name="phone" value={form.phone} onChange={handle}
                placeholder="01XXXXXXXXX"
                readOnly={!!localStorage.getItem('customer_phone')}
                style={{ ...inputStyle, background: localStorage.getItem('customer_phone') ? '#fdf2f8' : 'white' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>জেলা</label>
              <input name="district" value={form.district} onChange={handle}
                placeholder="আপনার জেলা"
                readOnly={!!localStorage.getItem('customer_district')}
                style={{ ...inputStyle, background: localStorage.getItem('customer_district') ? '#fdf2f8' : 'white' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>উপজেলা</label>
              <input name="upazila" value={form.upazila} onChange={handle}
                placeholder="আপনার উপজেলা"
                readOnly={!!localStorage.getItem('customer_upazila')}
                style={{ ...inputStyle, background: localStorage.getItem('customer_upazila') ? '#fdf2f8' : 'white' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>বিস্তারিত ঠিকানা *</label>
              <textarea name="address" value={form.address} onChange={handle}
                placeholder="গ্রাম/মহল্লা, বাড়ির নাম/নম্বর"
                rows={2}
                style={{ ...inputStyle, resize: 'none' }} />
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontWeight: 'bold', color: '#374151', marginBottom: '12px', fontSize: '15px' }}>পেমেন্ট পদ্ধতি</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { key: 'cod', label: '🚚 ক্যাশ অন ডেলিভারি' },
              { key: 'bkash', label: '💗 বিকাশ' },
              { key: 'nagad', label: '🟠 নগদ' },
            ].map(method => (
              <button key={method.key}
                onClick={() => setForm({ ...form, payment: method.key, transaction_id: '' })}
                style={{
                  padding: '10px 6px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                  border: '2px solid', cursor: 'pointer',
                  borderColor: form.payment === method.key ? PINK : '#e5e7eb',
                  background: form.payment === method.key ? PINK : 'white',
                  color: form.payment === method.key ? 'white' : '#374151',
                }}>
                {method.label}
              </button>
            ))}
          </div>

          {form.payment === 'bkash' && (
            <div style={{ background: '#fdf2f8', border: `1px solid ${PINK_BORDER}`, borderRadius: '12px', padding: '12px', marginTop: '12px' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: PINK, margin: '0 0 6px 0' }}>💗 বিকাশে পেমেন্ট করুন</p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '3px 0' }}>📱 নম্বর: <strong>{bkashNumber}</strong></p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '3px 0' }}>💰 পরিমাণ: <strong>{total.toFixed(0)} Tk</strong></p>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '6px 0 0 0' }}>বিকাশ Send Money করে Transaction ID লিখুন</p>
              <input name="transaction_id" value={form.transaction_id} onChange={handle}
                placeholder="Transaction ID লিখুন (যেমন: 8N6A2T3K9P)"
                style={{ ...inputStyle, border: `2px solid ${PINK_BORDER}`, marginTop: '8px' }} />
            </div>
          )}

          {form.payment === 'nagad' && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '12px', marginTop: '12px' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#ea580c', margin: '0 0 6px 0' }}>🟠 নগদে পেমেন্ট করুন</p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '3px 0' }}>📱 নম্বর: <strong>{nagadNumber}</strong></p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '3px 0' }}>💰 পরিমাণ: <strong>{total.toFixed(0)} Tk</strong></p>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '6px 0 0 0' }}>নগদ Send Money করে Transaction ID লিখুন</p>
              <input name="transaction_id" value={form.transaction_id} onChange={handle}
                placeholder="Transaction ID লিখুন"
                style={{ ...inputStyle, border: '2px solid #fed7aa', marginTop: '8px' }} />
            </div>
          )}

          {form.payment === 'cod' && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px', marginTop: '12px' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#15803d', margin: '0 0 4px 0' }}>🚚 ক্যাশ অন ডেলিভারি</p>
              <p style={{ fontSize: '12px', color: '#374151', margin: 0 }}>পণ্য পাওয়ার পর <strong>{total.toFixed(0)} Tk</strong> পরিশোধ করুন।</p>
            </div>
          )}
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontWeight: 'bold', color: '#374151', marginBottom: '8px', fontSize: '15px' }}>অর্ডার সারসংক্ষেপ</h3>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', padding: '6px 0', borderBottom: '1px dashed #e5e7eb' }}>
              <span>{item.name} ({item.qty} {item.unit})</span>
              <span style={{ fontWeight: 'bold', color: '#374151' }}>{(item.price_per_unit * item.qty).toFixed(0)} Tk</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: PINK, marginTop: '8px', fontSize: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
            <span>সর্বমোট:</span>
            <span>{total.toFixed(0)} Tk</span>
          </div>
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', background: '#fee2e2', padding: '10px', borderRadius: '8px' }}>{error}</p>
        )}
      </div>

     <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '16px', paddingBottom: '80px', boxShadow: '0 -4px 12px rgba(0,0,0,0.08)' }}>
        <button onClick={submitOrder} disabled={loading}
          style={{
            width: '100%', background: loading ? '#9ca3af' : PINK, color: 'white',
            border: 'none', borderRadius: '12px', padding: '14px',
            fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'
          }}>
          {loading ? 'অপেক্ষা করুন...' : 'অর্ডার নিশ্চিত করুন'}
        </button>
      </div>
    </div>
  );
}