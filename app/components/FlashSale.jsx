'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

export default function FlashSale() {
  const [flashProducts, setFlashProducts] = useState([]);

  useEffect(() => {
    async function loadFlashProducts() {
      // ডাটাবেজ থেকে অফারের বা যেকোনো ৬টি পণ্য ফ্ল্যাশ সেলে দেখানোর জন্য রিড
      const { data } = await supabase.from('products').select('*').limit(6);
      if (data) setFlashProducts(data);
    }
    loadFlashProducts();
  }, []);

  if (flashProducts.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-pink-500 to-pink-600 py-4 px-4 my-4 rounded-2xl shadow-md max-w-7xl mx-auto box-border">
      <div className="flex justify-between items-center mb-3 text-white">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">🔥</span>
          <h3 className="text-lg font-bold m-0">আজকের ধামাকা ফ্ল্যাশ সেল</h3>
        </div>
        <span className="text-xs bg-white text-pink-600 font-bold px-2.5 py-1 rounded-full animate-bounce">সীমিত অফার!</span>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
        {flashProducts.map((prod) => (
          <div key={prod.id} className="w-40 bg-white rounded-xl p-2 flex-shrink-0 shadow-sm relative group box-border">
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md z-10">OFFER</span>
            <div className="w-full h-28 overflow-hidden rounded-lg mb-2 bg-gray-50 flex items-center justify-center">
              <img src={prod.image_url} alt="" className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h4 className="text-xs font-bold text-gray-800 m-0 truncate">{prod.name}</h4>
            <p className="text-sm font-black text-pink-600 m-0 mt-1">৳{prod.price}</p>
          </button>
        ))}
      </div>
    </div>
  );
}