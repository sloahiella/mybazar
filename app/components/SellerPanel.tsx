'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
)

export default function SellerPanel({ seller, onClose }: { seller: any; onClose: () => void }) {
  const [tab, setTab] = useState('orders')
  const [dateFilter, setDateFilter] = useState('আজকে')

  return (
    <div style={{ background: '#fff', padding: '10px' }}>
        {/* কমপ্যাক্ট হেডার */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>🏪 {seller.shop_name}</h2>
            <button onClick={onClose} style={{ border: 'none', background: '#eee', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>বন্ধ করুন</button>
        </div>

        {/* ছোট ফিল্টার বাটন */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['আজকে', 'গতকাল', 'এই সপ্তাহ', 'এই মাস'].map(d => (
                <button key={d} onClick={() => setDateFilter(d)} style={{ padding: '4px 10px', borderRadius: '15px', border: '1px solid #ddd', background: dateFilter === d ? '#db2777' : '#fff', color: dateFilter === d ? '#fff' : '#333', fontSize: '11px' }}>
                    {d}
                </button>
            ))}
        </div>

        {/* ছোট সামারি বক্স */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <div style={{ padding: '10px', background: '#fdf2f8', borderRadius: '8px', border: '1px solid #fbcfe8', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: '#db2777', margin: 0 }}>Sales</p>
                <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>0 Tk</p>
            </div>
            <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: '#2563eb', margin: 0 }}>Orders</p>
                <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>0 টি</p>
            </div>
        </div>

        {/* ছোট ট্যাব বাটন */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['Orders', 'Products', 'Withdraw'].map((item) => (
                <button key={item} onClick={() => setTab(item.toLowerCase())} style={{ flex: 1, padding: '6px', borderRadius: '6px', border: 'none', background: tab === item.toLowerCase() ? '#db2777' : '#eee', color: tab === item.toLowerCase() ? '#fff' : '#000', fontSize: '12px' }}>
                    {item}
                </button>
            ))}
        </div>
        
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '20px' }}>
            কোনো নতুন অর্ডার নেই
        </div>
    </div>
  )
}