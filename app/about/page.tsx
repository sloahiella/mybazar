import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'সোহেল মার্ট সম্পর্কে | লালমোহনের অনলাইন বাজার',
  description:
    'সোহেল মার্ট লালমোহনের অনলাইন বাজার। কাঁচা বাজার ও মুদি বাজার ঘরে বসে অর্ডার করুন। ৩০০ টাকা বা তার বেশি অর্ডারে (১৫০ টাকার কাঁচা বাজারসহ) ডেলিভারি ফ্রি।',
  alternates: { canonical: 'https://sohelmart.com/about' },
};

const WHATSAPP = '8801872149655';

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GroceryStore',
    name: 'Sohel Mart (সোহেল মার্ট)',
    url: 'https://sohelmart.com',
    telephone: '+8801872149655',
    description:
      'লালমোহনের অনলাইন বাজার। কাঁচা বাজার ও মুদি বাজারের পণ্য ঘরে পৌঁছে দেওয়া হয়।',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'লালমোহন থানার মোড় ও করিমুন্নেছা হাফিজ মহিলা কলেজের মাঝামাঝি',
      addressLocality: 'Lalmohan',
      addressRegion: 'Bhola',
      addressCountry: 'BD',
    },
  };

  const box = { background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '1px solid #fbcfe8' } as const;
  const h2 = { fontSize: '17px', color: '#be185d', margin: '0 0 8px 0' } as const;
  const p = { fontSize: '14px', color: '#374151', lineHeight: 1.8, margin: '4px 0' } as const;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif', background: '#fdf2f8', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <a href="/" style={{ color: '#db2777', fontSize: '14px', textDecoration: 'none' }}>← সোহেল মার্টে ফিরুন</a>
      <h1 style={{ fontSize: '24px', color: '#db2777', margin: '12px 0' }}>সোহেল মার্ট সম্পর্কে</h1>

      <div style={box}>
        <h2 style={h2}>আমরা কারা</h2>
        <p style={p}>সোহেল মার্ট লালমোহনের একটি অনলাইন বাজার। এখান থেকে কাঁচা বাজার (শাকসবজি) ও মুদি বাজারের পণ্য ঘরে বসে অর্ডার করা যায়।</p>
      </div>

      <div style={box}>
        <h2 style={h2}>দোকানের ঠিকানা</h2>
        <p style={p}>লালমোহন থানার মোড় ও করিমুন্নেছা হাফিজ মহিলা কলেজের মাঝামাঝি, লালমোহন, ভোলা।</p>
        <p style={p}>ফোন ও হোয়াটসঅ্যাপ: ০১৮৭২১৪৯৬৫৫</p>
      </div>

      <div style={box}>
        <h2 style={h2}>অর্ডারের নিয়ম</h2>
             <p style={p}>• মোট ৩০০ টাকা বা তার বেশির অর্ডারে, যার মধ্যে কমপক্ষে ১৫০ টাকার কাঁচা বাজার আছে, ডেলিভারি চার্জ ফ্রি।</p>
        <p style={p}>• এর কম হলে অর্ডার করা যাবে, তবে ডেলিভারি চার্জ যোগ হবে।</p>
        <p style={p}>• ওয়েবসাইট থেকে পণ্য বেছে "ঝুড়িতে রাখুন" চাপুন, তারপর নিজের তথ্য দিয়ে অর্ডার নিশ্চিত করুন।</p>
      </div>

      <div style={box}>
        <h2 style={h2}>ডেলিভারি</h2>
        <p style={p}>আমাদের গাড়ি এক একদিন এক একটি এলাকায় যায়, শুধু সেই এলাকায় ডেলিভারি দেওয়া হয়। ইনশাআল্লাহ ধীরে ধীরে লালমোহনের প্রতিটি এলাকা ও রাস্তায় ডেলিভারি দেওয়া হবে।</p>
        <p style={p}>যে এলাকায় আমাদের গাড়ি যায় না, সেখান থেকে অর্ডার করতে হলে আগে আমাদের সাথে যোগাযোগ করুন।</p>
      </div>

      <div style={box}>
        <h2 style={h2}>ওয়েবসাইটে অর্ডার করতে না পারলে</h2>
        <p style={p}>কাগজে পণ্যের তালিকা লিখে আমাদের হোয়াটসঅ্যাপে পাঠান। আমরা সেই অনুযায়ী অর্ডার প্রস্তুত করব।</p>
        <a
          href={`https://wa.me/${WHATSAPP}`}
          style={{ display: 'inline-block', marginTop: '8px', background: '#16a34a', color: 'white', padding: '10px 18px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}
        >
          💬 হোয়াটসঅ্যাপে লিখুন
        </a>
      </div>
    </div>
  );
}
