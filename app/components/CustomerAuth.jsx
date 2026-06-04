'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

const districtUpazilas = {
  'ঢাকা': ['ধামরাই', 'দোহার', 'কেরানীগঞ্জ', 'নবাবগঞ্জ', 'সাভার', 'ঢাকা সদর'],
  'চট্টগ্রাম': ['আনোয়ারা', 'বাঁশখালী', 'বোয়ালখালী', 'চন্দনাইশ', 'ফটিকছড়ি', 'হাটহাজারী', 'কর্ণফুলী', 'লোহাগাড়া', 'মীরসরাই', 'পটিয়া', 'রাঙ্গুনিয়া', 'রাউজান', 'সন্দ্বীপ', 'সাতকানিয়া', 'সীতাকুণ্ড', 'চট্টগ্রাম সদর'],
  'রাজশাহী': ['বাঘা', 'বাগমারা', 'চারঘাট', 'দুর্গাপুর', 'গোদাগাড়ী', 'মোহনপুর', 'পবা', 'পুঠিয়া', 'তানোর', 'রাজশাহী সদর'],
  'খুলনা': ['বটিয়াঘাটা', 'দাকোপ', 'ডুমুরিয়া', 'ফুলতলা', 'কয়রা', 'পাইকগাছা', 'রূপসা', 'তেরখাদা', 'খুলনা সদর'],
  'বরিশাল': ['আগৈলঝাড়া', 'বাকেরগঞ্জ', 'বানারীপাড়া', 'গৌরনদী', 'হিজলা', 'মেহেন্দিগঞ্জ', 'মুলাদী', 'উজিরপুর', 'বরিশাল সদর'],
  'সিলেট': ['বালাগঞ্জ', 'বিয়ানীবাজার', 'বিশ্বনাথ', 'কোম্পানিগঞ্জ', 'ফেঞ্চুগঞ্জ', 'গোলাপগঞ্জ', 'গোয়াইনঘাট', 'জৈন্তাপুর', 'কানাইঘাট', 'ওসমানীনগর', 'সিলেট সদর', 'জকিগঞ্জ', 'দক্ষিণ সুরমা'],
  'রংপুর': ['বদরগঞ্জ', 'গঙ্গাচড়া', 'কাউনিয়া', 'মিঠাপুকুর', 'পীরগঞ্জ', 'পীরগাছা', 'তারাগঞ্জ', 'রংপুর সদর'],
  'ময়মনসিংহ': ['ভালুকা', 'ধোবাউড়া', 'ফুলবাড়িয়া', 'গফরগাঁও', 'গৌরীপুর', 'হালুয়াঘাট', 'ঈশ্বরগঞ্জ', 'মুক্তাগাছা', 'নান্দাইল', 'ফুলপুর', 'তারাকান্দা', 'ত্রিশাল', 'ময়মনসিংহ সদর'],
  'কুমিল্লা': ['বরুড়া', 'ব্রাহ্মণপাড়া', 'বুড়িচং', 'চান্দিনা', 'চৌদ্দগ্রাম', 'দাউদকান্দি', 'দেবীদ্বার', 'হোমনা', 'লাকসাম', 'লালমাই', 'মেঘনা', 'মনোহরগঞ্জ', 'মুরাদনগর', 'নাঙ্গলকোট', 'তিতাস', 'কুমিল্লা সদর'],
  'ফেনী': ['ছাগলনাইয়া', 'দাগনভূঞা', 'ফুলগাজী', 'পরশুরাম', 'সোনাগাজী', 'ফেনী সদর'],
  'ব্রাহ্মণবাড়িয়া': ['আখাউড়া', 'বাঞ্ছারামপুর', 'বিজয়নগর', 'কসবা', 'নাসিরনগর', 'নবীনগর', 'সরাইল', 'ব্রাহ্মণবাড়িয়া সদর'],
  'রাঙ্গামাটি': ['বাঘাইছড়ি', 'বরকল', 'বিলাইছড়ি', 'জুরাছড়ি', 'কাউখালী', 'কাপ্তাই', 'লংগদু', 'নানিয়ারচর', 'রাজস্থলী', 'রাঙ্গামাটি সদর'],
  'নোয়াখালী': ['বেগমগঞ্জ', 'চাটখিল', 'কোম্পানিগঞ্জ', 'হাতিয়া', 'কবিরহাট', 'সেনবাগ', 'সোনাইমুড়ি', 'সুবর্ণচর', 'নোয়াখালী সদর'],
  'চাঁদপুর': ['ফরিদগঞ্জ', 'হাইমচর', 'হাজীগঞ্জ', 'কচুয়া', 'মতলব উত্তর', 'মতলব দক্ষিণ', 'শাহরাস্তি', 'চাঁদপুর সদর'],
  'লক্ষ্মীপুর': ['কমলনগর', 'লক্ষ্মীপুর সদর', 'রামগঞ্জ', 'রামগতি', 'রায়পুর'],
  'কক্সবাজার': ['চকরিয়া', 'কুতুবদিয়া', 'মহেশখালী', 'পেকুয়া', 'রামু', 'টেকনাফ', 'উখিয়া', 'কক্সবাজার সদর'],
  'খাগড়াছড়ি': ['দিঘিনালা', 'গুইমারা', 'খাগড়াছড়ি সদর', 'লক্ষ্মীছড়ি', 'মাটিরাঙ্গা', 'মানিকছড়ি', 'মহালছড়ি', 'পানছড়ি', 'রামগড়'],
  'বান্দরবান': ['আলীকদম', 'বান্দরবান সদর', 'লামা', 'নাইক্ষ্যংছড়ি', 'রোয়াংছড়ি', 'রুমা', 'থানচি'],
  'নরসিংদী': ['বেলাব', 'মনোহরদী', 'নরসিংদী সদর', 'পলাশ', 'রায়পুরা', 'শিবপুর'],
  'গাজীপুর': ['কালিয়াকৈর', 'কালীগঞ্জ', 'কাপাসিয়া', 'গাজীপুর সদর', 'শ্রীপুর', 'টঙ্গী'],
  'শরীয়তপুর': ['ভেদরগঞ্জ', 'ডামুড্যা', 'গোসাইরহাট', 'জাজিরা', 'নড়িয়া', 'শরীয়তপুর সদর'],
  'নারায়ণগঞ্জ': ['আড়াইহাজার', 'বন্দর', 'নারায়ণগঞ্জ সদর', 'রূপগঞ্জ', 'সোনারগাঁ'],
  'টাঙ্গাইল': ['বাসাইল', 'ভূঞাপুর', 'দেলদুয়ার', 'ধনবাড়ী', 'ঘাটাইল', 'গোপালপুর', 'কালিহাতী', 'মধুপুর', 'মির্জাপুর', 'নাগরপুর', 'সখিপুর', 'টাঙ্গাইল সদর'],
  'কিশোরগঞ্জ': ['অষ্টগ্রাম', 'বাজিতপুর', 'ভৈরব', 'হোসেনপুর', 'ইটনা', 'করিমগঞ্জ', 'কটিয়াদী', 'কিশোরগঞ্জ সদর', 'কুলিয়ারচর', 'মিঠামইন', 'নিকলী', 'পাকুন্দিয়া', 'তাড়াইল'],
  'মানিকগঞ্জ': ['দৌলতপুর', 'ঘিওর', 'হরিরামপুর', 'মানিকগঞ্জ সদর', 'সাটুরিয়া', 'শিবালয়', 'সিঙ্গাইর'],
  'মুন্সিগঞ্জ': ['গজারিয়া', 'লৌহজং', 'মুন্সিগঞ্জ সদর', 'শ্রীনগর', 'সিরাজদিখান', 'টঙ্গিবাড়ী'],
  'রাজবাড়ী': ['বালিয়াকান্দি', 'গোয়ালন্দ', 'কালুখালী', 'পাংশা', 'রাজবাড়ী সদর'],
  'মাদারীপুর': ['কালকিনি', 'মাদারীপুর সদর', 'রাজৈর', 'শিবচর'],
  'গোপালগঞ্জ': ['কাশিয়ানী', 'কোটালীপাড়া', 'মুকসুদপুর', 'গোপালগঞ্জ সদর', 'টুঙ্গিপাড়া'],
  'ফরিদপুর': ['আলফাডাঙ্গা', 'ভাঙ্গা', 'বোয়ালমারী', 'চরভদ্রাসন', 'ফরিদপুর সদর', 'মধুখালী', 'নগরকান্দা', 'সালথা'],
  'পঞ্চগড়': ['আটোয়ারী', 'বোদা', 'দেবীগঞ্জ', 'পঞ্চগড় সদর', 'তেতুলিয়া'],
  'দিনাজপুর': ['বিরামপুর', 'বিরল', 'বোচাগঞ্জ', 'চিরিরবন্দর', 'ফুলবাড়ী', 'ঘোড়াঘাট', 'হাকিমপুর', 'খানসামা', 'দিনাজপুর সদর', 'নবাবগঞ্জ', 'পার্বতীপুর', 'কাহারোল'],
  'লালমনিরহাট': ['আদিতমারী', 'হাতীবান্ধা', 'কালীগঞ্জ', 'লালমনিরহাট সদর', 'পাটগ্রাম'],
  'নীলফামারী': ['ডিমলা', 'ডোমার', 'জলঢাকা', 'কিশোরগঞ্জ', 'নীলফামারী সদর', 'সৈয়দপুর'],
  'গাইবান্ধা': ['ফুলছড়ি', 'গাইবান্ধা সদর', 'গোবিন্দগঞ্জ', 'পলাশবাড়ী', 'সাদুল্লাপুর', 'সাঘাটা', 'সুন্দরগঞ্জ'],
  'ঠাকুরগাঁও': ['বালিয়াডাঙ্গী', 'হরিপুর', 'পীরগঞ্জ', 'রাণীশংকৈল', 'ঠাকুরগাঁও সদর'],
  'কুড়িগ্রাম': ['ভূরুঙ্গামারী', 'চর রাজিবপুর', 'চিলমারী', 'ফুলবাড়ী', 'কুড়িগ্রাম সদর', 'নাগেশ্বরী', 'রাজারহাট', 'রৌমারী', 'উলিপুর'],
  'সিরাজগঞ্জ': ['বেলকুচি', 'চৌহালী', 'কামারখন্দ', 'কাজীপুর', 'রায়গঞ্জ', 'শাহজাদপুর', 'সিরাজগঞ্জ সদর', 'তাড়াশ', 'উল্লাপাড়া'],
  'পাবনা': ['আটঘরিয়া', 'বেড়া', 'ভাঙ্গুড়া', 'চাটমোহর', 'ফরিদপুর', 'ঈশ্বরদী', 'পাবনা সদর', 'সাঁথিয়া', 'সুজানগর'],
  'বগুড়া': ['আদমদীঘি', 'বগুড়া সদর', 'ধুনট', 'দুপচাঁচিয়া', 'গাবতলী', 'কাহালু', 'নন্দীগ্রাম', 'সারিয়াকান্দি', 'শাজাহানপুর', 'শেরপুর', 'শিবগঞ্জ', 'সোনাতলা'],
  'নাটোর': ['বাগাতিপাড়া', 'বড়াইগ্রাম', 'গুরুদাসপুর', 'লালপুর', 'নাটোর সদর', 'সিংড়া'],
  'জয়পুরহাট': ['আক্কেলপুর', 'কালাই', 'ক্ষেতলাল', 'পাঁচবিবি', 'জয়পুরহাট সদর'],
  'চাঁপাইনবাবগঞ্জ': ['ভোলাহাট', 'গোমস্তাপুর', 'নাচোল', 'চাঁপাইনবাবগঞ্জ সদর', 'শিবগঞ্জ'],
  'নওগাঁ': ['আত্রাই', 'বদলগাছী', 'ধামইরহাট', 'মহাদেবপুর', 'মান্দা', 'নিয়ামতপুর', 'নওগাঁ সদর', 'পত্নীতলা', 'পোরশা', 'রাণীনগর', 'সাপাহার'],
  'যশোর': ['অভয়নগর', 'বাঘারপাড়া', 'চৌগাছা', 'ঝিকরগাছা', 'কেশবপুর', 'মণিরামপুর', 'শার্শা', 'যশোর সদর'],
  'সাতক্ষীরা': ['আশাশুনি', 'দেবহাটা', 'কালীগঞ্জ', 'কলারোয়া', 'সাতক্ষীরা সদর', 'শ্যামনগর', 'তালা'],
  'মেহেরপুর': ['গাংনী', 'মুজিবনগর', 'মেহেরপুর সদর'],
  'নড়াইল': ['কালিয়া', 'লোহাগড়া', 'নড়াইল সদর'],
  'চুয়াডাঙ্গা': ['আলমডাঙ্গা', 'চুয়াডাঙ্গা সদর', 'দামুড়হুদা', 'জীবননগর'],
  'কুষ্টিয়া': ['ভেড়ামারা', 'দৌলতপুর', 'কুমারখালী', 'কুষ্টিয়া সদর', 'মিরপুর', 'খোকসা'],
  'মাগুরা': ['মহম্মদপুর', 'মাগুরা সদর', 'শালিখা', 'শ্রীপুর'],
  'বাগেরহাট': ['বাগেরহাট সদর', 'চিতলমারী', 'ফকিরহাট', 'কচুয়া', 'মোংলা', 'মোরেলগঞ্জ', 'মোল্লাহাট', 'রামপাল', 'শরণখোলা'],
  'ঝিনাইদহ': ['হরিণাকুণ্ডু', 'ঝিনাইদহ সদর', 'কালীগঞ্জ', 'কোটচাঁদপুর', 'মহেশপুর', 'শৈলকুপা'],
  'ঝালকাঠি': ['ঝালকাঠি সদর', 'কাঁঠালিয়া', 'নলছিটি', 'রাজাপুর'],
  'পটুয়াখালী': ['বাউফল', 'দশমিনা', 'গলাচিপা', 'কলাপাড়া', 'মির্জাগঞ্জ', 'পটুয়াখালী সদর', 'রাঙ্গাবালী'],
  'পিরোজপুর': ['ভাণ্ডারিয়া', 'কাউখালী', 'মঠবাড়িয়া', 'নাজিরপুর', 'নেছারাবাদ', 'পিরোজপুর সদর', 'জিয়ানগর'],
  'ভোলা': ['বোরহানউদ্দিন', 'চরফ্যাশন', 'দৌলতখান', 'লালমোহন', 'মনপুরা', 'তজুমদ্দিন', 'ভোলা সদর'],
  'বরগুনা': ['আমতলী', 'বামনা', 'বরগুনা সদর', 'বেতাগী', 'পাথরঘাটা', 'তালতলী'],
  'মৌলভীবাজার': ['বড়লেখা', 'জুড়ী', 'কমলগঞ্জ', 'কুলাউড়া', 'মৌলভীবাজার সদর', 'রাজনগর', 'শ্রীমঙ্গল'],
  'হবিগঞ্জ': ['আজমিরীগঞ্জ', 'বাহুবল', 'বানিয়াচং', 'চুনারুঘাট', 'হবিগঞ্জ সদর', 'লাখাই', 'মাধবপুর', 'নবীগঞ্জ'],
  'সুনামগঞ্জ': ['বিশ্বম্ভরপুর', 'ছাতক', 'দিরাই', 'দোয়ারাবাজার', 'জগন্নাথপুর', 'জামালগঞ্জ', 'সুনামগঞ্জ সদর', 'শাল্লা', 'তাহিরপুর', 'ধর্মপাশা', 'মধ্যনগর'],
  'নেত্রকোনা': ['আটপাড়া', 'বারহাট্টা', 'দুর্গাপুর', 'খালিয়াজুরী', 'কলমাকান্দা', 'কেন্দুয়া', 'মদন', 'মোহনগঞ্জ', 'নেত্রকোনা সদর', 'পূর্বধলা'],
  'জামালপুর': ['বকশীগঞ্জ', 'দেওয়ানগঞ্জ', 'ইসলামপুর', 'জামালপুর সদর', 'মাদারগঞ্জ', 'মেলান্দহ', 'সরিষাবাড়ী'],
  'শেরপুর': ['ঝিনাইগাতী', 'নকলা', 'নালিতাবাড়ী', 'শেরপুর সদর', 'শ্রীবরদী'],
};

export default function CustomerAuth({ onSuccess }) {
 const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const phone = user.phone || user.user_metadata?.phone || '00000000000';
        localStorage.setItem('customer_name', name);
        localStorage.setItem('customer_phone', phone);
        localStorage.setItem('customer_district', '');
        localStorage.setItem('customer_upazila', '');
        onSuccess({ name, phone, district: '', upazila: '' });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const upazilas = district ? (districtUpazilas[district] || []) : [];
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
   if (!name || !phone || !email || !district || !upazila) { alert('সব তথ্য দিন!'); return; }
    if (phone.length < 11) { alert('সঠিক ফোন নম্বর দিন!'); return; }
    setLoading(true);
    const { data: existing } = await supabase.from('customers').select('*').eq('phone', phone).single();
    if (existing) { alert('এই নম্বরে আগেই অ্যাকাউন্ট আছে! লগিন করুন।'); setLoading(false); setIsLogin(true); return; }
   const { data, error } = await supabase.from('customers').insert({ name, phone, email, district, upazila }).select().single();
    if (error) { alert('সমস্যা হয়েছে: ' + error.message); setLoading(false); return; }
    localStorage.setItem('customer_phone', data.phone);
    localStorage.setItem('customer_name', data.name);
    localStorage.setItem('customer_district', data.district);
    localStorage.setItem('customer_upazila', data.upazila);
    localStorage.setItem('customer_email', data.email || '');
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
              ⚠️ সঠিক তথ্য দিয়ে রেজিস্ট্রেশন করুন। অর্ডার করার সময় এই তথ্যগুলো স্বয়ংক্রিয়ভাবে বসে যাবে এবং পরবর্তীতে পরিবর্তন করা যাবে না।
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
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>ইমেইল *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com"
                style={{ border: '2px solid #d1d5db', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1f2937' }} />
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>জেলা *</label>
                <select value={district} onChange={e => { setDistrict(e.target.value); setUpazila(''); }}
                  style={{ border: '2px solid #d1d5db', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1f2937', background: 'white' }}>
                  <option value="">জেলা সিলেক্ট করুন</option>
                  {Object.keys(districtUpazilas).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>উপজেলা *</label>
                <select value={upazila} onChange={e => setUpazila(e.target.value)}
                  disabled={!district}
                  style={{ border: '2px solid #d1d5db', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1f2937', background: 'white', opacity: !district ? 0.5 : 1 }}>
                  <option value="">উপজেলা সিলেক্ট করুন</option>
                  {upazilas.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </>
          )}

       <button onClick={isLogin ? handleLogin : handleRegister} disabled={loading}
            style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.5 : 1, marginTop: '8px' }}>
            {loading ? 'অপেক্ষা করুন...' : isLogin ? 'লগিন করুন' : 'রেজিস্ট্রেশন করুন'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>অথবা</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          <button onClick={async () => {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: window.location.origin }
            });
            if (error) alert('সমস্যা: ' + error.message);
          }}
            style={{ background: 'white', color: '#374151', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px', height: '20px' }} />
            Google দিয়ে লগিন করুন
          </button>
        </div>
      </div>
    </div>
  );
}