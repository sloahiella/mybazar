'use client'
import { useState } from 'react'

export default function SellerPanel({ seller, onClose }: { seller: any; onClose: () => void }) {
  const [tab, setTab] = useState('orders')

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, height: '100%', width: '400px', background: '#fff', zIndex: 99999, boxShadow: '-5px 0 15px rgba(0,0,0,0.2)', padding: '20px', overflowY: 'auto' }}>
      
      {/* হেডার */}
      <div style={{ background: '#db2777', padding: '15px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{seller.shop_name}</h2>
        <button onClick={onClose} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>✕</button>
      </div>

      {/* ফিল্টার বাটন */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        {['আজকে', 'গতকাল', 'এই সপ্তাহ', 'এই মাস'].map(d => (
          <button key={d} style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '20px', border: '1px solid #ddd', background: d === 'আজকে' ? '#db2777' : '#fff', color: d === 'আজকে' ? '#fff' : '#333' }}>{d}</button>
        ))}
      </div>

      {/* সার্চ বার */}
      <input type="text" placeholder="🔍 তারিখ, নাম, ফোন বা অর্ডার নম্বর..." style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #fbcfe8', borderRadius: '8px' }} />

      {/* সেলস ও অর্ডার বক্স */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div style={{ padding: '15px', border: '1px solid #fbcfe8', borderRadius: '10px', textAlign: 'center', background: '#fff5f7' }}>
          <p style={{ fontSize: '12px', color: '#db2777', margin: 0 }}>Sales</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>0 Tk</p>
        </div>
        <div style={{ padding: '15px', border: '1px solid #bfdbfe', borderRadius: '10px', textAlign: 'center', background: '#eff6ff' }}>
          <p style={{ fontSize: '12px', color: '#2563eb', margin: 0 }}>Orders</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>0 টি</p>
        </div>
      </div>

      {/* অটো প্রিন্ট অপশন */}
      <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee' }}>
        <span>🖨️ Auto Print</span>
        <button style={{ background: '#fecaca', border: 'none', padding: '5px 10px', borderRadius: '5px', color: '#b91c1c' }}>✕ বন্ধ</button>
      </div>

      {/* মেনু বাটনগুলো */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
        {[
            {id: 'orders', label: '🛒 অর্ডার লিস্ট'},
            {id: 'products', label: '📦 প্রোডাক্ট ও পেজ'},
            {id: 'wallet', label: '💰 ওয়ালেট'},
            {id: 'withdraw', label: '🏦 উত্তোলন'},
            {id: 'logout', label: 'লগআউট'}
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{ 
            whiteSpace: 'nowrap', padding: '10px 15px', fontSize: '14px', border: 'none', 
            background: tab === item.id ? '#db2777' : '#f3f4f6', 
            color: tab === item.id ? '#fff' : '#374151',
            borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
          }}>{item.label}</button>
        ))}
      </div>
    </div>
  )
}