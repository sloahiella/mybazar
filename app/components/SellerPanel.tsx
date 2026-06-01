'use client'
import { useState } from 'react'

export default function SellerPanel({ seller, onClose }: { seller: any; onClose: () => void }) {
  const [tab, setTab] = useState('orders')
  const [dateFilter, setDateFilter] = useState('আজকে')

  // মেনু অপশনগুলো আপনার দেওয়া লিস্ট অনুযায়ী
  const menuItems = [
    { id: 'orders', label: '🛒 অর্ডার লিস্ট' },
    { id: 'products', label: '📦 প্রোডাক্ট ও পেজ — পেজ ও প্রোডাক্ট ম্যানেজ করুন' },
    { id: 'wallet', label: '💰 ওয়ালেট — আয় দেখুন' },
    { id: 'withdraw', label: '🏦 উত্তোলন — টাকা তুলুন' },
    { id: 'notifications', label: '🔔 নোটিফিকেশন — নতুন অর্ডার দেখুন' },
    { id: 'logout', label: 'লগআউট' },
  ]

  return (
    <div style={{ 
      position: 'fixed', right: 0, top: 0, height: '100%', width: '400px', 
      background: '#fff', zIndex: 99999, boxShadow: '-5px 0 15px rgba(0,0,0,0.2)', padding: '20px', overflowY: 'auto' 
    }}>
      {/* হেডার */}
      <div style={{ background: '#db2777', padding: '15px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{seller.shop_name}</h2>
        <button onClick={onClose} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>✕</button>
      </div>

      {/* ফিল্টার */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        {['আজকে', 'গতকাল', 'এই সপ্তাহ', 'এই মাস'].map(d => (
          <button key={d} onClick={() => setDateFilter(d)} style={{ 
            padding: '8px 12px', fontSize: '13px', borderRadius: '20px', border: '1px solid #ddd', 
            background: dateFilter === d ? '#db2777' : '#fff', 
            color: dateFilter === d ? '#fff' : '#333', cursor: 'pointer' 
          }}>{d}</button>
        ))}
      </div>

      {/* সামারি বক্স */}
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

      {/* মেনু লিস্ট */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {menuItems.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{ 
            textAlign: 'left', padding: '15px', fontSize: '14px', border: 'none', 
            background: tab === item.id ? '#db2777' : '#f3f4f6', 
            color: tab === item.id ? '#fff' : '#333',
            borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
          }}>{item.label}</button>
        ))}
      </div>
    </div>
  )
}