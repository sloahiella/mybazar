'use client';

export default function FeatureBar() {
  const features = [
    { icon: '🚚', title: 'দ্রুত হোম ডেলিভারি', desc: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি' },
    // 👑 এখানে "অরিজিনাল" বানানটি একদম ১০০% সঠিক করে দেওয়া হলো ভাই
    { icon: '🛡️', title: '১০০% অরিজিনাল পণ্য', desc: 'সেরা কোয়ালিটির আসল পণ্য' },
    { icon: '💬', title: '২৪/৭ কাস্টমার সাপোর্ট', desc: 'যেকোনো প্রয়োজনে লাইভ চ্যাট বা কল' }
  ];

  return (
    <div className="w-full bg-white border-b border-gray-100 py-2.5 px-2 md:px-4 box-border select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-1.5 md:gap-4 text-center">
        {features.map((f, i) => (
          <div 
            key={i} 
            className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 bg-pink-50/40 p-1.5 md:p-3 rounded-xl border border-pink-100/30 box-border"
          >
            <span className="text-lg md:text-2xl flex-shrink-0">{f.icon}</span>
            
            <div className="text-center md:text-left min-w-0 w-full">
              <h4 className="text-[9px] sm:text-[10px] md:text-sm font-black text-gray-800 m-0 truncate w-full">
                {f.title}
              </h4>
              <p className="text-[8px] md:text-xs text-gray-500 m-0 mt-0.5 truncate md:whitespace-normal w-full">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}