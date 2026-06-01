'use client'
import { useState } from 'react'

export default function SellerPanel({ seller }: { seller: any }) {
  const [activeTab, setActiveTab] = useState('orders')

  return (
    <div style={{ padding: '10px', background: '#fff', fontSize: '12px' }}>
      {/* ফিল্টার সেকশন */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        {['আজকে', 'গতকাল', 'এই সপ্তাহ', 'এই মাস'].map(label => (
          <button key={label} style={{ padding: '5px 10px', borderRadius: '15px', border: '1px solid #ddd', background: label === 'আজকে' ? '#db2777' : '#fff', color: label === 'আজকে' ? '#fff' : '#000' }}>
            {label}
          </button>
        ))}
      </div>

      {/* সার্চবার */}
      <input type="text" placeholder="তারিখ, নাম, ফোন বা অর্ডার নম্বর..." style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />

      {/* সেলস ও অর্ডার বক্স */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div style={{ padding: '15px', border: '1px solid #fbcfe8', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: '#db2777', margin: 0 }}>Sales</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>0 Tk</p>
        </div>
        <div style={{ padding: '15px', border: '1px solid #bfdbfe', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: '#2563eb', margin: 0 }}>Orders</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>0 টি</p>
        </div>
      </div>

      {/* ট্যাব ও বাটন */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        {['Orders', 'Sellers', 'Withdraw'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: activeTab === tab.toLowerCase() ? '#db2777' : '#f3f4f6' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* নোটিফিকেশন লিস্ট */}
      <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
        <p style={{ fontSize: '11px', color: '#666' }}>🔔 নতুন অর্ডার #58 - Md Sohel</p>
        <p style={{ fontSize: '11px', color: '#999' }}>২৯/৬/২০২৬, ৬:১৮:৫৬ PM</p>
      </div>
    </div>
  )
}