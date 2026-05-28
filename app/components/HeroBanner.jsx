'use client';
import { useState, useEffect } from 'react';

export default function HeroBanner() {
  // আপনার দেওয়া ২টি ব্যানারের লিংকের অ্যারে
  const banners = [
    "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/hero-banner.jpg%20(1).jpg",
    "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/100%20(1).jpg"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // অটোমেটিক ৩ সেকেন্ড পর পর ব্যানার চেঞ্জ হওয়ার লজিক
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000); // ৩০০০ মিলিসেকেন্ড = ৩ সেকেন্ড

    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="px-4 py-2 w-full max-w-[1200px] mx-auto box-border">
      {/* ব্যানার কন্টেইনার - গোভ্যালির মতো চিকন ও লম্বা রেশিও */}
      <div className="w-full aspect-[21/9] md:aspect-[25/8] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-pink-100 relative group">
        
        {/* মেইন ব্যানার ইমেজ */}
        <img 
          src={banners[currentIndex]} 
          alt={`Sohel Mart Banner ${currentIndex + 1}`} 
          className="w-full h-full object-cover transition-all duration-700 ease-in-out"
        />

        {/* নিচে ছোট ডট ইন্ডিকেটর (কোন ব্যানার চলছে তা বোঝার জন্য) */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
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