'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
)

export default function SellerPanel({ seller, onClose, isAdmin }: { seller: any; onClose: () => void; isAdmin?: boolean }) {
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState<any[]>([])
  const [dateFilter, setDateFilter] = useState('today')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // ট্যাব পরিবর্তনের সাথে সাথে ডাটা লোড
  useEffect(() => {
    if (tab === 'orders') fetchOrders()
  }, [tab, dateFilter])

  async function fetchOrders() {
    const { data: items } = await supabase.from('order_items').select('*, products:product_id(name, image_url, unit)').eq('seller_id', seller.id).order('created_at', { ascending: false })
    if (!items) return
    const orderIds = items.map((i: any) => i.order_id)
    const { data: ords } = await supabase.from('orders').select('*').in('id', orderIds)
    const merged = items.map((item: any) => ({ ...item, order: ords?.find((o: any) => String(o.id) === String(item.order_id)) }))
    
    // ফিল্টার লজিক
    const now = new Date()
    const filtered = merged.filter((item: any) => {
      const d = new Date(item.order?.created_at)
      if (dateFilter === 'today') return d.toDateString() === now.toDateString()
      if (dateFilter === 'yesterday') { const y = new Date(now); y.setDate(y.getDate() - 1); return d.toDateString() === y.toDateString() }
      if (dateFilter === 'week') { const w = new Date(now); w.setDate(w.getDate() - 7); return d >= w }
      if (dateFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      return true
    })
    setOrders(filtered)
  }

  const filteredOrders = search ? orders.filter(o => o.order?.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.order?.customer_phone?.includes(search) || String(o.order_id).includes(search)) : orders
  const totalEarning = filteredOrders.reduce((a: number, o: any) => a + (o.price * o.quantity), 0)
  const totalOrders = new Set(filteredOrders.map((o: any) => o.order_id)).size

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, height: '100%', width: '400px', background: '#fff', zIndex: 99999, boxShadow: '-5px 0 15px rgba(0,0,0,0.2)', padding: '20px', overflowY: 'auto' }}>
      
      {/* হেডার */}
      <div style={{ background: '#db2777', padding: '15px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{seller.shop_name}</h2>
        <button onClick={onClose} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>✕</button>
      </div>

      {/* মেনু বাটনসমূহ */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '15px' }}>
        {[
            {id: 'orders', label: '🛒 অর্ডার'},
            {id: 'products', label: '📦 প্রোডাক্ট'},
            {id: 'wallet', label: '💰 ওয়ালেট'},
            {id: 'withdraw', label: '🏦 উত্তোলন'},
            {id: 'logout', label: 'লগআউট'}
        ].map(item => (
          <button key={item.id} onClick={() => {
            if(item.id === 'logout') { supabase.auth.signOut(); window.location.reload(); }
            else setTab(item.id);
          }} style={{ 
            whiteSpace: 'nowrap', padding: '10px 15px', fontSize: '14px', border: 'none', 
            background: tab === item.id ? '#db2777' : '#f3f4f6', 
            color: tab === item.id ? '#fff' : '#000',
            borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
          }}>{item.label}</button>
        ))}
      </div>

      {/* কন্টেন্ট এরিয়া */}
      {tab === 'orders' && (
        <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                {[{key:'today', l:'আজ'}, {key:'yesterday', l:'গতকাল'}, {key:'week', l:'সপ্তাহ'}, {key:'month', l:'মাস'}].map(d => (
                    <button key={d.key} onClick={() => setDateFilter(d.key)} style={{ padding: '5px 10px', borderRadius: '15px', border: '1px solid #ddd', background: dateFilter === d.key ? '#db2777' : '#fff', color: dateFilter === d.key ? '#fff' : '#000', fontSize: '12px' }}>{d.l}</button>
                ))}
            </div>
            <input type="text" placeholder="🔍 সার্চ করুন..." onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div style={{ padding: '10px', background: '#fff5f7', border: '1px solid #fbcfe8', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#db2777', margin: 0 }}>Sales</p>
                    <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{totalEarning} Tk</p>
                </div>
                <div style={{ padding: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#2563eb', margin: 0 }}>Orders</p>
                    <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{totalOrders} টি</p>
                </div>
            </div>
            {filteredOrders.map((o: any) => (
                <div key={o.id} onClick={() => setSelectedOrder(o)} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold' }}>{o.products?.name} - {o.quantity} {o.products?.unit}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>অর্ডার #{o.order_id} | {o.order?.customer_name}</p>
                </div>
            ))}
        </>
      )}

      {tab === 'products' && <p style={{ textAlign: 'center', color: '#666' }}>প্রোডাক্ট ম্যানেজমেন্ট পেজ শীঘ্রই আসছে...</p>}
      {tab === 'wallet' && <p style={{ textAlign: 'center', color: '#666' }}>ওয়ালেট ব্যালেন্স: 0 Tk</p>}
      {tab === 'withdraw' && <p style={{ textAlign: 'center', color: '#666' }}>উত্তোলন করার জন্য অনুরোধ করুন...</p>}
    </div>
  )
}