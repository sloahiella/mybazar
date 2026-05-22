'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SellerDashboard() {
  const router = useRouter()
  const [seller, setSeller] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    checkSeller()
  }, [])

  async function checkSeller() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/seller/login'); return }

    const { data } = await supabase
      .from('sellers')
      .select('*, profiles(full_name, phone)')
      .eq('profile_id', user.id)
      .single()

    if (!data) { router.push('/seller/register'); return }
    setSeller(data)
    fetchNotifications(data.id)

    supabase
      .channel('seller_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'seller_notifications', filter: `seller_id=eq.${data.id}` }, () => {
        fetchNotifications(data.id)
      })
      .subscribe()

    setLoading(false)
  }

  async function fetchNotifications(sellerId: string) {
    const { data } = await supabase
      .from('seller_notifications')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter((n: any) => !n.is_read).length)
    }
  }

  async function markAllRead() {
    if (!seller) return
    await supabase.from('seller_notifications').update({ is_read: true }).eq('seller_id', seller.id)
    fetchNotifications(seller.id)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <p style={{textAlign:'center', marginTop:'40px'}}>লোড হচ্ছে...</p>

  return (
    <div style={{maxWidth:'700px', margin:'40px auto', padding:'20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
        <div>
          <h1 style={{fontSize:'24px', fontWeight:'bold', color:'#111', margin:'0 0 4px 0'}}>
            🏪 {seller.shop_name}
          </h1>
          <p style={{fontSize:'14px', color:'#555', margin:0}}>
            👤 {seller.profiles?.full_name} | 📱 {seller.profiles?.phone}
          </p>
        </div>
        <button onClick={handleLogout}
          style={{background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'14px', cursor:'pointer'}}>
          লগআউট
        </button>
      </div>

      {!seller.is_approved && (
        <div style={{background:'#fef9c3', border:'1px solid #fde047', borderRadius:'12px', padding:'16px', marginBottom:'24px', textAlign:'center'}}>
          <p style={{fontSize:'16px', color:'#854d0e', margin:0}}>
            ⏳ আপনার অ্যাকাউন্ট এখনো অ্যাপ্রুভ হয়নি।
          </p>
        </div>
      )}

      {notifications.length > 0 && (
        <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px', marginBottom:'24px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
            <h2 style={{fontSize:'16px', fontWeight:'bold', color:'#111', margin:0}}>
              🔔 নোটিফিকেশন
              {unreadCount > 0 && (
                <span style={{background:'#ef4444', color:'white', fontSize:'11px', padding:'2px 8px', borderRadius:'20px', marginLeft:'8px'}}>
                  {unreadCount}
                </span>
              )}
            </h2>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                style={{fontSize:'12px', color:'#2563eb', background:'none', border:'none', cursor:'pointer'}}>
                সব পড়া হয়েছে
              </button>
            )}
          </div>
          {notifications.map((n) => (
            <div key={n.id} style={{padding:'8px 12px', borderRadius:'8px', marginBottom:'8px',
              background: n.is_read ? '#f9fafb' : '#eff6ff',
              border: n.is_read ? '1px solid #e5e7eb' : '1px solid #bfdbfe'}}>
              <p style={{fontSize:'13px', color:'#111', margin:'0 0 2px 0'}}>{n.message}</p>
              <p style={{fontSize:'11px', color:'#888', margin:0}}>{new Date(n.created_at).toLocaleString('bn-BD')}</p>
            </div>
          ))}
        </div>
      )}

      {seller.is_approved && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px', textAlign:'center', cursor:'pointer'}}
            onClick={() => router.push('/seller/products')}>
            <p style={{fontSize:'32px', margin:'0 0 8px 0'}}>📦</p>
            <p style={{fontSize:'16px', fontWeight:'bold', color:'#111', margin:0}}>প্রোডাক্ট</p>
            <p style={{fontSize:'13px', color:'#888', margin:'4px 0 0 0'}}>প্রোডাক্ট আপলোড করুন</p>
          </div>

          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px', textAlign:'center', cursor:'pointer'}}
            onClick={() => router.push('/seller/orders')}>
            <p style={{fontSize:'32px', margin:'0 0 8px 0'}}>🛒</p>
            <p style={{fontSize:'16px', fontWeight:'bold', color:'#111', margin:0}}>অর্ডার</p>
            <p style={{fontSize:'13px', color:'#888', margin:'4px 0 0 0'}}>অর্ডার দেখুন</p>
          </div>

          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px', textAlign:'center', cursor:'pointer'}}
            onClick={() => router.push('/seller/wallet')}>
            <p style={{fontSize:'32px', margin:'0 0 8px 0'}}>💰</p>
            <p style={{fontSize:'16px', fontWeight:'bold', color:'#111', margin:0}}>ওয়ালেট</p>
            <p style={{fontSize:'13px', color:'#888', margin:'4px 0 0 0'}}>আয় দেখুন</p>
          </div>

          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px', textAlign:'center', cursor:'pointer'}}
            onClick={() => router.push('/seller/withdraw')}>
            <p style={{fontSize:'32px', margin:'0 0 8px 0'}}>🏦</p>
            <p style={{fontSize:'16px', fontWeight:'bold', color:'#111', margin:0}}>উত্তোলন</p>
            <p style={{fontSize:'13px', color:'#888', margin:'4px 0 0 0'}}>টাকা তুলুন</p>
          </div>
        </div>
      )}
    </div>
  )
}