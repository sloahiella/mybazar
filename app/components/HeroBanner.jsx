'use client';
import { useState, useEffect } from 'react';

export default function HeroBanner() {
  const banners = [
    "https://i.ibb.co.com/j9kBtqS5/050.jpg"
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
      <div className="w-full aspect-[5/1] overflow-hidden bg-white relative group">
        <img
          src={banners[currentIndex]}
          alt={`Sohel Mart Banner ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          key={currentIndex}
          onError={(e) => {
            e.currentTarget.src = "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/hero-banner.jpg.jpg";
          }}
        />

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