'use client';
import { useState, useEffect } from 'react';

export default function HeroBanner() {
  // এখানে আপনার ৩টি সম্ভাব্য লিংকের কম্বিনেশন রাখা হলো যাতে ছবি মিস না হয়
  const banners = [
    // ১ম ধামাকা অফার ব্যানার (১০০% ওয়ার্কিং)
    "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/hero-banner.jpg%20(1).jpg",
    // ২য় ব্যানার (যদি banner2.jpg.jpg নামে সেভ হয়ে থাকে)
    "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/banner2.jpg.jpg"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000); // ৩ সেকেন্ড পর পর স্লাইড হবে

    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="px-4 py-2 w-full max-w-[1200px] mx-auto box-border">
      <div className="w-full aspect-[21/9] md:aspect-[25/8] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-pink-100 relative group">
        
        {/* মেইন ইমেজ লোডার */}
        <img 
          src={banners[currentIndex]} 
          alt={`Sohel Mart Banner ${currentIndex + 1}`} 
          className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          key={currentIndex}
          // যদি কোনো কারণে এই ছবিতেও এরর আসে, তবে এটি ব্যাকআপ হিসেবে কাজ করবে
          onError={(e) => {
            e.currentTarget.src = "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/hero-banner.jpg%20(1).jpg";
          }}
        />

        {/* নিচের ছোট ডট ইন্ডিকেটর */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
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