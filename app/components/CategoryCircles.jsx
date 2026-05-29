'use client';

export default function CategoryCircles() {
  // আপনার বর্তমান ক্যাটাগরিগুলোর নাম ও ডেমো আইকন (পরবর্তীতে ইমেজ লিংক দিতে পারবেন)
  const categories = [
    { name: "Womens' Fashion", icon: "👗" },
    { name: "Baby Item", icon: "👶" },
    { name: "Men's Fashion", icon: "👕" },
    { name: "Electronics", icon: "🔌" },
    { name: "Groceries", icon: "🍎" },
    { name: "Cosmetics", icon: "💄" }
  ];

  return (
    <div className="w-full bg-white py-4 px-4 overflow-hidden">
      <p className="text-sm font-bold text-gray-800 mb-3 max-w-7xl mx-auto">🛍️ টপ ক্যাটাগরি সমূহ</p>
      <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2">
        {categories.map((cat, i) => (
          <button 
            key={i} 
            onClick={() => {
              // আপনার আগের ক্যাটাগরি ফিল্টার চেইঞ্জ লজিক ট্রিগার করবে
              const event = new CustomEvent('filterCategory', { detail: cat.name });
              window.dispatchEvent(event);
            }}
            className="flex flex-col items-center gap-2 border-none bg-none cursor-pointer flex-shrink-0 group"
          >
            <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-3xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white">
              {cat.icon}
            </div>
            <span className="text-xs font-semibold text-gray-600 group-hover:text-pink-600 transition-colors duration-200 white-space-nowrap">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}