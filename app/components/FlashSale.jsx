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
      const { data } = await supabase.from('products').select('*').limit(6);
      if (data) setFlashProducts(data);
    }
    loadFlashProducts();
  }, []);

  if (flashProducts.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-pink-500 to-pink-600 py-4 px-4 my-4 rounded-2xl shadow-md max-w-7xl mx-auto box-border select-none">
      <div className="flex justify-between items-center mb-3 text-white">
        <div className="flex items-center gap-2">
          {/* 👑 আগুনের ইমোজির বদলে প্রিমিয়াম থ্রিডি ইফেক্ট ফ্ল্যাশ আইকন */}
          <img src="https://cdn-icons-png.flaticon.com/128/426/426833.png" alt="" className="w-6 h-6 object-contain animate-pulse invert brightness-200" />
          {/* 👑 এখানে "ফ্ল্যাশ সেলে" কেটে পারফেক্টলি "ফ্ল্যাশ সেল" লিখে দেওয়া হয়েছে */}
          <h3 className="text-base font-black m-0 tracking-wide">আজকের ধামাকা ফ্ল্যাশ সেল</h3>
        </div>
        <span className="text-[11px] bg-white text-pink-600 font-extrabold px-3 py-1 rounded-full shadow-sm animate-bounce">সীমিত অফার!</span>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
        {flashProducts.map((prod) => (
          <div key={prod.id} className="w-40 bg-white rounded-xl p-2 flex-shrink-0 shadow-sm relative group box-border cursor-pointer transition-all duration-300 hover:shadow-md">
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md z-10 tracking-wider shadow-sm">OFFER</span>
            <div className="w-full h-28 overflow-hidden rounded-lg mb-2 bg-gray-50 flex items-center justify-center">
              <img src={prod.image_url} alt="" className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
            </div>
            <h4 className="text-xs font-bold text-gray-700 m-0 truncate group-hover:text-pink-600 transition-colors">{prod.name}</h4>
            <p className="text-sm font-black text-pink-600 m-0 mt-1">৳{prod.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}