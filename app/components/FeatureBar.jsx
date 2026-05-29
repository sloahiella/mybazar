cat << 'EOF' > app/components/FeatureBar.jsx
'use client';

export default function FeatureBar() {
  const features = [
    { icon: '🚚', title: 'দ্রুত হোম ডেলিভারি', desc: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি' },
    { icon: '🛡️', title: '১০০% অরিজিনাল পণ্য', desc: 'সেরা কোয়ালিটির আসল পণ্য' },
    { icon: '💬', title: '২৪/৭ কাস্টমার সাপোর্ট', desc: 'যেকোনো প্রয়োজনে লাইভ চ্যাট বা কল' }
  ];

  return (
    <div className="w-full bg-white border-b border-gray-100 py-3 px-4 box-border">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {features.map((f, i) => (
          <div key={i} className="flex items-center justify-center gap-3 bg-pink-50/40 p-3 rounded-xl border border-pink-100/30">
            <span className="text-2xl">{f.icon}</span>
            <div className="text-left">
              <h4 className="text-sm font-bold text-gray-800 m-0">{f.title}</h4>
              <p className="text-xs text-gray-500 m-0 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF