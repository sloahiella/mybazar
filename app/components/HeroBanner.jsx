'use client';
import { useState, useEffect } from 'react';

export default function HeroBanner() {
  // আপনার দেওয়া ২টি ব্যানারের সঠিক লিংকের অ্যারে
  const banners = [
    // ১ম ব্যানার
    "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/hero-banner.jpg%20(1).jpg",
    // ২য় ব্যানার (লিংকটি ঠিক করে দেওয়া হলো)
    "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/banner2.jpg"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // অটোমেটিক ৩ সেকেন্ড পর পর ব্যানার চেঞ্জ হওয়ার লজিক
  useEffect(() => {
    // যদি ব্যানারের অ্যারে খালি থাকে, তবে কিছু করার দরকার নেই
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000); // ৩০০০ মিলিসেকেন্ড = ৩ সেকেন্ড

    // কম্পোনেন্ট আনমাউন্ট হলে টাইমারটি পরিষ্কার করা
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="px-4 py-2 w-full max-w-[1200px] mx-auto box-border">
      {/* ব্যানার কন্টেইনার - চিকন ও লম্বা রেশিও (Aspect Ratio) */}
      <div className="w-full aspect-[21/9] md:aspect-[25/8] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-pink-100 relative group">
        
        {/* মেইন ব্যানার ইমেজ (ফেড অ্যানিমেশন সহ) */}
        <img 
          src={banners[currentIndex]} 
          alt={`Sohel Mart Banner ${currentIndex + 1}`} 
          // টেলউইন্ড অ্যানিমেশন ক্লাস
          className="w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-100"
          key={currentIndex} // ইমেজ চেঞ্জ হলে অ্যানিমেশন ট্রিগার করার জন্য কি (Key)
        />

        {/* নিচে ছোট ডট ইন্ডিকেটর (কোন ব্যানার চলছে তা বোঝার জন্য) */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'w-4 bg-pink-600' : 'w-2 bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}