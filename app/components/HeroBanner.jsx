'use client';
import { useState, useEffect } from 'react';

export default function HeroBanner() {
  // 👑 আপনার দেওয়া নতুন নির্ভুল বানানের ফ্রেশ ব্যানার ইউআরএল এখানে বসিয়ে দেওয়া হলো
const banners = [
    "https://i.ibb.co.com/4nv1vmXx/00.png"
];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="w-full bg-white overflow-hidden box-border">
      {/* 👑 মোবাইল ও পিসি দুই জায়গাতেই ব্যানার না কেটে পারফেক্টলি ফিট করার জন্য aspect ratio ও object-fill সেট করা হলো */}
 <div className="w-full h-[140px] sm:h-[180px] md:h-[320px] overflow-hidden bg-white relative group">
        <img 
  src={banners[currentIndex]} 
  alt={`Sohel Mart Banner ${currentIndex + 1}`} 
  className="w-full h-full object-contain md:object-cover transition-opacity duration-700 ease-in-out bg-gray-50"
  key={currentIndex}
  onError={(e) => {
    e.currentTarget.src = "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/hero-banner.jpg.jpg";
  }}
/>

        {/* নিচে ছোট ডট ইন্ডিকেটর */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'w-3.5 bg-pink-600' : 'w-1.5 bg-white/60'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}