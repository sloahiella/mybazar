'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SellerOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/seller/login'); return }
    const { data: seller } = await supabase.from('sellers').select('*').eq('profile_id', user.id).single()
    if (!seller) { router.push('/seller/login'); return }
    const { data } = await supabase.from('order_items').select('*, products:product_id(name, image_url, unit)').eq('seller_id', seller.id).order('created_at', { ascending: false })
    if (!data) { setLoading(false); return }
    const ids = data.map((d: any) => d.order_id)
    const { data: ords } = await supabase.from('orders').select('*').in('id', ids)
    const merged = data.map((d: any) => ({ ...d, order: ords?.find((o: any) => String(o.id) === String(d.order_id)) }))
    setOrders(merged)
    setLoading(false)
  }

  if (loading) return <p style={{textAlign:'center', marginTop:'40px'}}>লোড হচ্ছে...</p>

  return (
    <div style={{maxWidth:'700px', margin:'40px auto', padding:'20px'}}>

     {selected && (
  <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'16px'}}>
    <div style={{background:'white', borderRadius:'16px', width:'100%', maxWidth:'500px', maxHeight:'90vh', overflowY:'auto'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', borderBottom:'1px solid #e5e7eb', position:'sticky', top:0, background:'white'}}>
        <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#db2777', margin:0}}>অর্ডার #{selected.order?.id}</h2>
        <div style={{display:'flex', gap:'8px'}}>
          <button onClick={() => {
            const win = window.open('', '_blank')
            if (!win) return
            win.document.write(`<html><head><title>Order #${selected.order?.id}</title>
            <style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family: Arial, sans-serif; padding:15mm; }</style>
            </head><body>
            <h2>অর্ডার #${selected.order?.id}</h2>
            <p>নাম: ${selected.order?.customer_name}</p>
            <p>ফোন: ${selected.order?.customer_phone}</p>
            <p>জেলা: ${selected.order?.district}, ${selected.order?.upazila}</p>
            <p>ঠিকানা: ${selected.order?.address}</p>
            <hr/>
            <p>পণ্য: ${selected.products?.name}</p>
            <p>পরিমাণ: ${selected.quantity} ${selected.products?.unit}</p>
            <p>মোট: ${selected.price * selected.quantity} Tk</p>
            </body></html>`)
            win.document.close()
            win.print()
          }} style={{background:'#2563eb', color:'white', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'14px', cursor:'pointer'}}>🖨️ Print</button>
          <button onClick={() => setSelected(null)} style={{background:'#e5e7eb', color:'#374151', border:'none', borderRadius:'8px', padding:'8px 12px', fontSize:'14px', cursor:'pointer'}}>✕</button>
        </div>
      </div>
      <div style={{padding:'24px'}}>
       <div style={{display:'grid', gridTemplateColumns:'1fr 2px 1fr', border:'2px solid #db2777', borderRadius:'8px', overflow:'hidden', marginBottom:'16px'}}>
          <div style={{padding:'14px', background:'#fdf2f8'}}>
  <img src="https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/Untitled%20folder/logo.jpg" alt="লোগো" style={{height:'36px', width:'auto', borderRadius:'6px', marginBottom:'8px'}} />
  <p style={{fontSize:'11px', color:'#4b5563', margin:'2px 0'}}>🌐 sohelmart.com</p>
  <p style={{fontSize:'11px', color:'#4b5563', margin:'2px 0'}}>📱 01872149655</p>
  <p style={{fontSize:'11px', color:'#374151', margin:'6px 0 2px 0', fontWeight:'bold'}}>তারিখ: {new Date(selected.order?.created_at).toLocaleDateString('bn-BD')}</p>
  <p style={{fontSize:'11px', color:'#374151', margin:'2px 0'}}>সময়: {new Date(selected.order?.created_at).toLocaleTimeString('bn-BD')}</p>
</div>
          <div style={{background:'#db2777'}} />
          <div style={{padding:'14px'}}>
            <p style={{fontSize:'13px', fontWeight:'bold', color:'#1d4ed8', margin:'0 0 6px 0'}}>👤 কাস্টমার তথ্য</p>
            <p style={{fontSize:'12px', color:'#374151', margin:'3px 0'}}>নাম: <strong>{selected.order?.customer_name}</strong></p>
            <p style={{fontSize:'12px', color:'#374151', margin:'3px 0'}}>ফোন: {selected.order?.customer_phone}</p>
            <p style={{fontSize:'12px', color:'#374151', margin:'3px 0'}}>জেলা: {selected.order?.district}, {selected.order?.upazila}</p>
            <p style={{fontSize:'12px', color:'#374151', margin:'3px 0'}}>ঠিকানা: {selected.order?.address}</p>
          </div>
        </div>
        <div style={{borderBottom:'2px solid #374151', padding:'6px 0', marginBottom:'8px', display:'flex', justifyContent:'space-between'}}>
          <p style={{fontSize:'13px', fontWeight:'bold', color:'#374151', margin:0}}>পণ্য</p>
          <p style={{fontSize:'13px', fontWeight:'bold', color:'#374151', margin:0}}>টাকা</p>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px dashed #d1d5db'}}>
          <div>
            <p style={{fontSize:'13px', fontWeight:'bold', color:'#1f2937', margin:'0 0 2px 0'}}>{selected.products?.name}</p>
            <p style={{fontSize:'11px', color:'#6b7280', margin:0}}>{selected.price} Tk × {selected.quantity} {selected.products?.unit}</p>
          </div>
          <p style={{fontSize:'14px', fontWeight:'bold', color:'#db2777', margin:0}}>৳{selected.price * selected.quantity}</p>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', marginTop:'8px', paddingTop:'8px', borderTop:'2px solid #374151'}}>
          <p style={{fontSize:'16px', fontWeight:'bold', color:'#374151', margin:0}}>সর্বমোট:</p>
          <p style={{fontSize:'20px', fontWeight:'bold', color:'#db2777', margin:0}}>৳{selected.price * selected.quantity}</p>
        </div>
      </div>
    </div>
  </div>
)}

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px', fontWeight:'bold', color:'#111', margin:0}}>🛒 আমার অর্ডার</h1>
        <button onClick={() => router.push('/seller/dashboard')} style={{background:'#e5e7eb', color:'#374151', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'14px', cursor:'pointer'}}>← ড্যাশবোর্ড</button>
      </div>

      {orders.length === 0 && <p style={{color:'#888', textAlign:'center'}}>এখনো কোনো অর্ডার নেই</p>}

      {orders.map((item) => (
        <div key={item.id} onClick={() => setSelected(item)}
          style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px', marginBottom:'12px', cursor:'pointer'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
              {item.products?.image_url && <img src={item.products.image_url} alt="" style={{width:'50px', height:'50px', objectFit:'contain', borderRadius:'8px'}} />}
              <div>
                <p style={{fontWeight:'bold', color:'#111', margin:'0 0 4px 0'}}>{item.products?.name}</p>
                <p style={{fontSize:'13px', color:'#555', margin:'0 0 2px 0'}}>পরিমাণ: {item.quantity} {item.products?.unit}</p>
                <p style={{fontSize:'13px', color:'#16a34a', fontWeight:'bold', margin:'0 0 2px 0'}}>৳{item.price * item.quantity}</p>
                <p style={{fontSize:'12px', color:'#888', margin:0}}>অর্ডার #{item.order_id}</p>
                <p style={{fontSize:'11px', color:'#2563eb', margin:'4px 0 0 0'}}>👆 বিস্তারিত দেখতে ক্লিক করুন</p>
              </div>
            </div>
            <span style={{fontSize:'12px', padding:'4px 10px', borderRadius:'20px', fontWeight:'bold',
              background: item.order?.status === 'delivered' ? '#dcfce7' : item.order?.status === 'confirmed' ? '#dbeafe' : '#fef9c3',
              color: item.order?.status === 'delivered' ? '#15803d' : item.order?.status === 'confirmed' ? '#1d4ed8' : '#854d0e'}}>
              {item.order?.status === 'delivered' ? '✅ ডেলিভারি' : item.order?.status === 'confirmed' ? '✔️ কনফার্ম' : '⏳ পেন্ডিং'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
