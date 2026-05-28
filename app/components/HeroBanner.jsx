'use client';
import { useState, useEffect } from 'react';

export default function HeroBanner() {
  // আপনার ২টি ব্যানারের সঠিক লিংক
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
    // 👑 চারপাশে কোনো গ্যাপ ছাড়া ফুল-উইডথ (Full Width) করার জন্য এখানে পরিবর্তন করা হলো
    <div className="w-full bg-white overflow-hidden box-border">
      
      {/* কন্টেইনার থেকে px-4, py-2, max-w এবং rounded-2xl সম্পূর্ণ বাদ দেওয়া হলো */}
      <div className="w-full aspect-[21/9] md:aspect-[25/8] overflow-hidden bg-gray-100 relative group">
        
        {/* মেইন ইমেজ */}
        <img 
          src={banners[currentIndex]} 
          alt={`Sohel Mart Banner ${currentIndex + 1}`} 
          className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          key={currentIndex}
          onError={(e) => {
            e.currentTarget.src = "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/hero-banner.jpg%20(1).jpg";
          }}
        />

        {/* নিচে ছোট ডট ইন্ডিকেটর */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'w-4 bg-pink-600' : 'w-2 bg-white/60'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}