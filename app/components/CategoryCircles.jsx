'use client';

export default function CategoryCircles() {
  // 👑 মানসম্মত মডার্ন এবং কালারফুল ভেক্টর আইকন সেট করা হলো
  const categories = [
    { 
      name: "Womens' Fashion", 
      icon: "https://cdn-icons-png.flaticon.com/128/3159/3159614.png" // সুন্দর ড্রেস আইকন
    },
    { 
      name: "Baby Item", 
      icon: "https://cdn-icons-png.flaticon.com/128/4250/4250436.png" // কিউট বেবি ফিডার/টয় আইকন
    },
    { 
      name: "Men's Fashion", 
      icon: "https://cdn-icons-png.flaticon.com/128/3159/3159577.png" // জেন্টলম্যান শার্ট আইকন
    },
    { 
      name: "Electronics", 
      icon: "https://cdn-icons-png.flaticon.com/128/3659/3659899.png" // আধুনিক স্মার্টফোন/গ্যাজেট আইকন
    },
    { 
      name: "Groceries", 
      icon: "https://cdn-icons-png.flaticon.com/128/3081/3081910.png" // টাটকা অ্যাপেল/ফুড বাস্কেট আইকন
    },
    { 
      name: "Cosmetics", 
      icon: "https://cdn-icons-png.flaticon.com/128/2983/2983803.png" // প্রিমিয়াম লিপস্টিক/মেকআপ আইকন
    }
  ];

  return (
    <div className="w-full bg-white py-4 px-4 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center gap-2 mb-4">
        <img src="https://cdn-icons-png.flaticon.com/128/3502/3502685.png" alt="" className="w-5 h-5 object-contain" />
        <p className="text-sm font-black text-gray-800 m-0">টপ ক্যাটাগরি সমূহ</p>
      </div>
      <div className="max-w-7xl mx-auto flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-2">
        {categories.map((cat, i) => (
          <button 
            key={i} 
            onClick={() => {
              const event = new CustomEvent('filterCategory', { detail: cat.name });
              window.dispatchEvent(event);
            }}
            className="flex flex-col items-center gap-2 border-none bg-none cursor-pointer flex-shrink-0 group outline-none"
          >
            {/* 👑 বৃত্তের ভেতরের ব্যাকগ্রাউন্ড ও বর্ডার আরও ক্রিস্পি করা হলো */}
            <div className="w-16 h-16 rounded-full bg-pink-50/50 border border-pink-100/60 flex items-center justify-center p-3.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-pink-600 group-hover:border-pink-600">
              <img 
                src={cat.icon} 
                alt={cat.name} 
                className="w-full h-full object-contain transition-all duration-300 group-hover:invert group-hover:brightness-200" 
              />
            </div>
            <span className="text-[11px] font-bold text-gray-600 group-hover:text-pink-600 transition-colors duration-200 whitespace-nowrap">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}