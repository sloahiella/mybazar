'use client'
import { useState } from 'react'

export default function SellerPanel({ seller, onClose }: { seller: any; onClose: () => void }) {
  const [tab, setTab] = useState('orders')

  // নতুন লিস্ট অনুযায়ী বাটনগুলো
  const menuItems = [
    { id: 'orders', label: '🛒 অর্ডার' },
    { id: 'notifications', label: '🔔' }, // নোটিফিকেশন শুধু আইকন
    { id: 'products', label: '📦 প্রোডাক্ট ও পেজ' },
    { id: 'wallet', label: '💰 ওয়ালেট' },
    { id: 'withdraw', label: '🏦 উত্তোলন' },
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

      {/* স্ক্রিনশট অনুযায়ী পাশাপাশি বাটনগুলো */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
        {menuItems.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{ 
            whiteSpace: 'nowrap', padding: '10px 15px', fontSize: '14px', border: 'none', 
            background: tab === item.id ? '#db2777' : '#f3f4f6', 
            color: tab === item.id ? '#fff' : '#374151',
            borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px'
          }}>
            {item.label}
          </button>
        ))}
      </div>

      {/* বাকি সব ঠিক আছে */}
      <div style={{ marginTop: '20px', textAlign: 'center', color: '#999' }}>
        <p>এখানে আপনার নির্বাচিত ট্যাবের তথ্য আসবে</p>
      </div>
    </div>
  )
}