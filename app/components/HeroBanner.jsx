'use client';
import { useState, useEffect } from 'react';

export default function HeroBanner() {
  // desktop = ল্যাপটপের ছবি (1800x500), mobile = মোবাইলের ছবি (1760x800)
  // mobile না দিলে ল্যাপটপের ছবিই মোবাইলে দেখাবে
  const banners = [
    {
      desktop: "https://i.ibb.co.com/Z6dVLJQg/laptop-1.jpg",
      mobile: "https://i.ibb.co.com/21BLsSvk/mobile-1.jpg",
      desktop: "",
      mobile: "https://i.ibb.co.com/zVz2rJP3/moile-2.jpg",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const current = banners[currentIndex];

  return (
    <div className="w-full bg-white overflow-hidden box-border">
      <div className="w-full aspect-[11/5] md:aspect-[18/5] overflow-hidden bg-white relative group">
        <picture key={currentIndex}>
          {current.mobile && <source media="(max-width: 767px)" srcSet={current.mobile} />}
          <img
            src={current.desktop}
            alt={`Sohel Mart Banner ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            onError={(e) => {
              e.currentTarget.src = "https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/hero-banner.jpg.jpg";
            }}
          />
        </picture>

        {banners.length > 1 && (
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
        )}
      </div>
    </div>
  );
}