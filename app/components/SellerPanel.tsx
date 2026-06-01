'use client'
import { useState } from 'react'

export default function SellerPanel({ seller, onClose }: { seller: any; onClose: () => void }) {
  const [tab, setTab] = useState('orders')

  return (
    <div style={{ 
      position: 'fixed', right: 0, top: 0, height: '100%', width: '380px', // একটু বড় করা হলো
      background: '#fff', zIndex: 99999, boxShadow: '-5px 0 15px rgba(0,0,0,0.2)', padding: '20px', overflowY: 'auto' 
    }}>
      {/* হেডার */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#333' }}>{seller.shop_name}</h2>
        <button onClick={onClose} style={{ border: 'none', background: '#eee', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>✕</button>
      </div>

      {/* ফিল্টার বাটন */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        {['আজকে', 'গতকাল', 'এই সপ্তাহ', 'এই মাস'].map(d => (
          <button key={d} style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '20px', border: '1px solid #ddd', background: '#fff' }}>{d}</button>
        ))}
      </div>

      {/* সেলস ও অর্ডার বক্স (বড় সাইজ) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #fbcfe8', borderRadius: '10px', textAlign: 'center', background: '#fff5f7' }}>
          <p style={{ fontSize: '13px', color: '#db2777', margin: '0 0 5px 0' }}>Sales</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', margin: 0 }}>0 Tk</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #bfdbfe', borderRadius: '10px', textAlign: 'center', background: '#eff6ff' }}>
          <p style={{ fontSize: '13px', color: '#2563eb', margin: '0 0 5px 0' }}>Orders</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', margin: 0 }}>0 টি</p>
        </div>
      </div>

      {/* ট্যাব বাটন (বড় ও স্পষ্ট) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['Orders', 'Sellers', 'Withdraw'].map(t => (
          <button key={t} onClick={() => setTab(t.toLowerCase())} style={{ 
            flex: 1, padding: '12px', fontSize: '14px', border: 'none', 
            background: tab === t.toLowerCase() ? '#db2777' : '#f3f4f6', 
            color: tab === t.toLowerCase() ? '#fff' : '#333',
            borderRadius: '8px', cursor: 'pointer' 
          }}>{t}</button>
        ))}
      </div>

      {/* নোটিফিকেশন */}
      <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', color: '#333' }}>
        <p style={{ fontSize: '14px', margin: '0 0 5px 0' }}>🔔 নতুন অর্ডার #58 - Md Sohel</p>
        <p style={{ fontSize: '12px', color: '#777', margin: 0 }}>২৯/৬/২০২৬, ৬:১৮:৫৬ PM</p>
      </div>
    </div>
  )
}