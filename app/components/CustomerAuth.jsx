'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

const districts = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ',
  'কুমিল্লা', 'ফেনী', 'ব্রাহ্মণবাড়িয়া', 'রাঙ্গামাটি', 'নোয়াখালী', 'চাঁদপুর', 'লক্ষ্মীপুর',
  'কক্সবাজার', 'খাগড়াছড়ি', 'বান্দরবান', 'নরসিংদী', 'গাজীপুর', 'শরীয়তপুর', 'নারায়ণগঞ্জ',
  'টাঙ্গাইল', 'কিশোরগঞ্জ', 'মানিকগঞ্জ', 'মুন্সিগঞ্জ', 'রাজবাড়ী', 'মাদারীপুর', 'গোপালগঞ্জ',
  'ফরিদপুর', 'পঞ্চগড়', 'দিনাজপুর', 'লালমনিরহাট', 'নীলফামারী', 'গাইবান্ধা', 'ঠাকুরগাঁও',
  'রংপুর', 'কুড়িগ্রাম', 'সিরাজগঞ্জ', 'পাবনা', 'বগুড়া', 'নাটোর', 'জয়পুরহাট', 'চাঁপাইনবাবগঞ্জ',
  'নওগাঁ', 'যশোর', 'সাতক্ষীরা', 'মেহেরপুর', 'নড়াইল', 'চুয়াডাঙ্গা', 'কুষ্টিয়া', 'মাগুরা',
  'খুলনা', 'বাগেরহাট', 'ঝিনাইদহ', 'ঝালকাঠি', 'পটুয়াখালী', 'পিরোজপুর', 'বরিশাল', 'ভোলা',
  'বরগুনা', 'সিলেট', 'মৌলভীবাজার', 'হবিগঞ্জ', 'সুনামগঞ্জ', 'নেত্রকোনা', 'ময়মনসিংহ',
  'জামালপুর', 'শেরপুর'
];

export default function CustomerAuth({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!phone) { alert('ফোন নম্বর দিন!'); return; }
    setLoading(true);
    const { data } = await supabase.from('customers').select('*').eq('phone', phone).single();
    if (data) {
      localStorage.setItem('customer_phone', data.phone);
      localStorage.setItem('customer_name', data.name);
      localStorage.setItem('customer_district', data.district);
      localStorage.setItem('customer_upazila', data.upazila);
      onSuccess(data);
    } else {
      alert('এই নম্বরে কোনো অ্যাকাউন্ট নেই! নতুন রেজিস্ট্রেশন করুন।');
    }
    setLoading(false);
  }

  async function handleRegister() {
    if (!name || !phone || !district || !upazila) { alert('সব তথ্য দিন!'); return; }
    if (phone.length < 11) { alert('সঠিক ফোন নম্বর দিন!'); return; }
    setLoading(true);
    const { data: existing } = await supabase.from('customers').select('*').eq('phone', phone).single();
    if (existing) { alert('এই নম্বরে আগেই অ্যাকাউন্ট আছে! লগিন করুন।'); setLoading(false); setIsLogin(true); return; }
    const { data, error } = await supabase.from('customers').insert({ name, phone, district, upazila }).select().single();
    if (error) { alert('সমস্যা হয়েছে: ' + error.message); setLoading(false); return; }
    localStorage.setItem('customer_phone', data.phone);
    localStorage.setItem('customer_name', data.name);
    localStorage.setItem('customer_district', data.district);
    localStorage.setItem('customer_upazila', data.upazila);
    onSuccess(data);
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(219,39,119,0.15)', padding: '32px', maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#db2777', margin: '0 0 8px 0' }}>🛒 সোহেল মার্ট</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>মাই বাজার</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setIsLogin(true)}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', background: isLogin ? '#db2777' : '#f3f4f6', color: isLogin ? 'white' : '#374151' }}>
            লগিন
          </button>
          <button onClick={() => setIsLogin(false)}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', background: !isLogin ? '#db2777' : '#f3f4f6', color: !isLogin ? 'white' : '#374151' }}>
            রেজিস্ট্রেশন
          </button>
        </div>

        {!isLogin && (
          <div style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#db2777', margin: 0, textAlign: 'center', fontWeight: '500' }}>
              ⚠️ সঠিক তথ্য দিয়ে রেজিস্ট্রেশন করুন। অর্ডার করার সময় এই তথ্যগুলো স্বয়ংক্রিয়ভাবে বসে যাবে এবং পরিবর্তন করা যাবে না।
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>আপনার নাম *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="পূর্ণ নাম লিখুন"
                style={{ border: '2px solid #d1d5db', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1f2937' }} />
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>ফোন নম্বর *</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX"
              style={{ border: '2px solid #d1d5db', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1f2937' }} />
          </div>

          {!isLogin && (
            <>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>জেলা *</label>
                <select value={district} onChange={e => setDistrict(e.target.value)}
                  style={{ border: '2px solid #d1d5db', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1f2937', background: 'white' }}>
                  <option value="">জেলা সিলেক্ট করুন</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>উপজেলা *</label>
                <input value={upazila} onChange={e => setUpazila(e.target.value)} placeholder="উপজেলা লিখুন"
                  style={{ border: '2px solid #d1d5db', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1f2937' }} />
              </div>
            </>
          )}

          <button onClick={isLogin ? handleLogin : handleRegister} disabled={loading}
            style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.5 : 1, marginTop: '8px' }}>
            {loading ? 'অপেক্ষা করুন...' : isLogin ? 'লগিন করুন' : 'রেজিস্ট্রেশন করুন'}
          </button>
        </div>
      </div>
    </div>
  );
}