'use client';
import { useState, useEffect } from 'react';

export default function HeroBanner() {
  const banners = [
     "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/hero-banner.jpg%20(1).jpg",
  "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/banner2.jpg.jpg"
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
      {/* 👑 মোবাইল ও পিসি দুই জায়গাতেই ব্যানার না কেটে পারফেক্টলি ফিট করার জন্য aspect ratio ও object-fill সেট করা হলো */}
      <div className="w-full aspect-[21/9] md:aspect-[25/8] overflow-hidden bg-gray-100 relative group">
        
        <img 
          src={banners[currentIndex]} 
          alt={`Sohel Mart Banner ${currentIndex + 1}`} 
          className="w-full h-full object-fill md:object-cover transition-opacity duration-700 ease-in-out"
          key={currentIndex}
          onError={(e) => {
            e.currentTarget.src = "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/hero-banner.jpg%20(1).jpg";
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