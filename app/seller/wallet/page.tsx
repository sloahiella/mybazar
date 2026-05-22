'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SellerWallet() {
  const router = useRouter()
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/seller/login'); return }

    const { data: seller } = await supabase
      .from('sellers')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (!seller) { router.push('/seller/login'); return }

    const { data: walletData } = await supabase
      .from('seller_wallet')
      .select('*')
      .eq('seller_id', seller.id)
      .single()

    if (walletData) setWallet(walletData)

    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('seller_id', seller.id)
      .order('created_at', { ascending: false })

    if (txData) setTransactions(txData)
    setLoading(false)
  }

  if (loading) return <p style={{textAlign:'center', marginTop:'40px'}}>লোড হচ্ছে...</p>

  return (
    <div style={{maxWidth:'600px', margin:'40px auto', padding:'20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px', fontWeight:'bold', color:'#111', margin:0}}>💰 আমার ওয়ালেট</h1>
        <button onClick={() => router.push('/seller/dashboard')}
          style={{background:'#e5e7eb', color:'#374151', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'14px', cursor:'pointer'}}>
          ← ড্যাশবোর্ড
        </button>
      </div>

      {/* ব্যালেন্স কার্ড */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'24px'}}>
        <div style={{background:'#dcfce7', border:'1px solid #bbf7d0', borderRadius:'12px', padding:'16px', textAlign:'center'}}>
          <p style={{fontSize:'12px', color:'#15803d', margin:'0 0 4px 0'}}>মোট আয়</p>
          <p style={{fontSize:'20px', fontWeight:'bold', color:'#15803d', margin:0}}>৳{wallet?.total_earned || 0}</p>
        </div>
        <div style={{background:'#dbeafe', border:'1px solid #bfdbfe', borderRadius:'12px', padding:'16px', textAlign:'center'}}>
          <p style={{fontSize:'12px', color:'#1d4ed8', margin:'0 0 4px 0'}}>উত্তোলনযোগ্য</p>
          <p style={{fontSize:'20px', fontWeight:'bold', color:'#1d4ed8', margin:0}}>৳{wallet?.available_balance || 0}</p>
        </div>
        <div style={{background:'#fef9c3', border:'1px solid #fde047', borderRadius:'12px', padding:'16px', textAlign:'center'}}>
          <p style={{fontSize:'12px', color:'#854d0e', margin:'0 0 4px 0'}}>হোল্ডে</p>
          <p style={{fontSize:'20px', fontWeight:'bold', color:'#854d0e', margin:0}}>৳{wallet?.on_hold || 0}</p>
        </div>
      </div>

      {/* উত্তোলন বাটন */}
      <button onClick={() => router.push('/seller/withdraw')}
        style={{width:'100%', background:'#16a34a', color:'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'16px', fontWeight:'bold', cursor:'pointer', marginBottom:'24px'}}>
        🏦 টাকা উত্তোলন করুন
      </button>

      {/* ট্রানজেকশন লিস্ট */}
      <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111', marginBottom:'12px'}}>📋 লেনদেনের ইতিহাস</h2>

      {transactions.length === 0 && (
        <p style={{color:'#888', textAlign:'center'}}>এখনো কোনো লেনদেন নেই</p>
      )}

      {transactions.map((tx) => (
        <div key={tx.id} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px', marginBottom:'12px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <p style={{fontSize:'14px', color:'#374151', margin:'0 0 4px 0'}}>অর্ডার #{tx.order_id}</p>
              <p style={{fontSize:'12px', color:'#888', margin:0}}>{new Date(tx.created_at).toLocaleDateString('bn-BD')}</p>
            </div>
            <div style={{textAlign:'right'}}>
              <p style={{fontSize:'16px', fontWeight:'bold', color:'#16a34a', margin:'0 0 4px 0'}}>+৳{tx.seller_amount}</p>
              <span style={{fontSize:'11px', padding:'2px 8px', borderRadius:'20px',
                background: tx.status === 'paid' ? '#dcfce7' : tx.status === 'available' ? '#dbeafe' : '#fef9c3',
                color: tx.status === 'paid' ? '#15803d' : tx.status === 'available' ? '#1d4ed8' : '#854d0e'}}>
                {tx.status === 'paid' ? '✅ পেইড' : tx.status === 'available' ? '💙 পাওয়ার যোগ্য' : '⏳ হোল্ডে'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}