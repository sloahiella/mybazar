'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
)

export default function SellerPanel({ seller, onClose }: { seller: any; onClose: () => void }) {
  const [tab, setTab] = useState('orders') // ডিফল্ট ট্যাব অর্ডার
  const [dateFilter, setDateFilter] = useState('today')
  const [orders, setOrders] = useState<any[]>([])

  // অ্যাডমিনের মতো লেআউট ও লজিক
  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: '16px' }}>
        {/* টপ হেডার */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>🏪 {seller.shop_name}</h2>
            <button onClick={onClose} style={{ border: 'none', background: '#eee', padding: '8px 12px', borderRadius: '8px' }}>✕</button>
        </div>

        {/* ফিল্টার বাটনসমূহ (অ্যাডমিনের স্টাইল) */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
            {['আজকে', 'গতকাল', 'এই সপ্তাহ', 'এই মাস'].map(d => (
                <button key={d} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', background: dateFilter === d ? '#db2777' : '#fff', color: dateFilter === d ? '#fff' : '#333' }}>
                    {d}
                </button>
            ))}
        </div>

        {/* সেলস ও অর্ডার সামারি বক্স */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '16px', background: '#fdf2f8', borderRadius: '12px', border: '1px solid #fbcfe8', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#db2777' }}>Sales</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold' }}>0 Tk</p>
            </div>
            <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#2563eb' }}>Orders</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold' }}>0 টি</p>
            </div>
        </div>

        {/* সেকশন ট্যাবসমূহ */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button onClick={() => setTab('orders')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: tab === 'orders' ? '#db2777' : '#eee', color: tab === 'orders' ? '#fff' : '#000' }}>Orders</button>
            <button onClick={() => setTab('products')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: tab === 'products' ? '#db2777' : '#eee', color: tab === 'products' ? '#fff' : '#000' }}>Products</button>
            <button onClick={() => setTab('withdraw')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: tab === 'withdraw' ? '#db2777' : '#eee', color: tab === 'withdraw' ? '#fff' : '#000' }}>Withdraw</button>
        </div>

        {/* কন্টেন্ট এরিয়া */}
        <div style={{ marginTop: '10px' }}>
            {tab === 'orders' && <p style={{ textAlign: 'center', color: '#999' }}>কোনো নতুন অর্ডার নেই</p>}
            {tab === 'products' && <p style={{ textAlign: 'center', color: '#999' }}>আপনার প্রোডাক্ট লিস্ট এখানে আসবে</p>}
        </div>
    </div>
  )
}