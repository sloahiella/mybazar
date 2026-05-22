'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SellerWithdraw() {
  const router = useRouter()
  const [seller, setSeller] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [requests, setRequests] = useState<any[]>([])
  const [form, setForm] = useState({
    amount: '',
    method: 'bkash',
    account_number: '',
  })

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/seller/login'); return }

    const { data: sellerData } = await supabase
      .from('sellers')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (!sellerData) { router.push('/seller/login'); return }
    setSeller(sellerData)

    const { data: walletData } = await supabase
      .from('seller_wallet')
      .select('*')
      .eq('seller_id', sellerData.id)
      .single()

    if (walletData) setWallet(walletData)

    const { data: reqData } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('seller_id', sellerData.id)
      .order('created_at', { ascending: false })

    if (reqData) setRequests(reqData)
    setLoading(false)
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    if (!form.amount || !form.account_number) {
      alert('সব তথ্য দিন!')
      return
    }
    if (parseFloat(form.amount) > (wallet?.available_balance || 0)) {
      alert('উত্তোলনযোগ্য ব্যালেন্সের বেশি তোলা যাবে না!')
      return
    }
    setSubmitting(true)
    await supabase.from('withdrawal_requests').insert({
      seller_id: seller.id,
      amount: parseFloat(form.amount),
      method: form.method,
      account_number: form.account_number,
      status: 'pending',
    })
    alert('উত্তোলন রিকোয়েস্ট পাঠানো হয়েছে! Admin অ্যাপ্রুভ করলে টাকা পাবেন।')
    setForm({ amount: '', method: 'bkash', account_number: '' })
    init()
    setSubmitting(false)
  }

  const inp: any = { border: '2px solid #aaa', padding: '10px', borderRadius: '6px', fontSize: '15px', color: '#111', background: '#f9f9f9', width: '100%', boxSizing: 'border-box' }

  if (loading) return <p style={{textAlign:'center', marginTop:'40px'}}>লোড হচ্ছে...</p>

  return (
    <div style={{maxWidth:'500px', margin:'40px auto', padding:'20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px', fontWeight:'bold', color:'#111', margin:0}}>🏦 টাকা উত্তোলন</h1>
        <button onClick={() => router.push('/seller/wallet')}
          style={{background:'#e5e7eb', color:'#374151', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'14px', cursor:'pointer'}}>
          ← ওয়ালেট
        </button>
      </div>

      {/* ব্যালেন্স */}
      <div style={{background:'#dbeafe', border:'1px solid #bfdbfe', borderRadius:'12px', padding:'16px', textAlign:'center', marginBottom:'24px'}}>
        <p style={{fontSize:'14px', color:'#1d4ed8', margin:'0 0 4px 0'}}>উত্তোলনযোগ্য ব্যালেন্স</p>
        <p style={{fontSize:'28px', fontWeight:'bold', color:'#1d4ed8', margin:0}}>৳{wallet?.available_balance || 0}</p>
      </div>

      {/* ফর্ম */}
      <form onSubmit={handleSubmit} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px', marginBottom:'24px'}}>
        <h2 style={{fontSize:'16px', fontWeight:'bold', color:'#111', marginBottom:'16px'}}>নতুন রিকোয়েস্ট</h2>

        <div style={{marginBottom:'12px'}}>
          <label style={{fontSize:'14px', fontWeight:'bold', color:'#333', display:'block', marginBottom:'4px'}}>পরিমাণ (৳)</label>
          <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="কত টাকা তুলবেন" required style={inp} />
        </div>

        <div style={{marginBottom:'12px'}}>
          <label style={{fontSize:'14px', fontWeight:'bold', color:'#333', display:'block', marginBottom:'4px'}}>পদ্ধতি</label>
          <select value={form.method} onChange={e => setForm({...form, method: e.target.value})} style={inp}>
            <option value="bkash">বিকাশ</option>
            <option value="nagad">নগদ</option>
            <option value="bank">ব্যাংক</option>
          </select>
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'14px', fontWeight:'bold', color:'#333', display:'block', marginBottom:'4px'}}>একাউন্ট নম্বর</label>
          <input type="text" value={form.account_number} onChange={e => setForm({...form, account_number: e.target.value})} placeholder="আপনার বিকাশ/নগদ/ব্যাংক নম্বর" required style={inp} />
        </div>

        <button type="submit" disabled={submitting}
          style={{width:'100%', background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', padding:'12px', fontSize:'16px', fontWeight:'bold', cursor:'pointer'}}>
          {submitting ? 'পাঠানো হচ্ছে...' : '✅ রিকোয়েস্ট পাঠান'}
        </button>
      </form>

      {/* আগের রিকোয়েস্ট */}
      <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111', marginBottom:'12px'}}>📋 রিকোয়েস্টের ইতিহাস</h2>

      {requests.length === 0 && (
        <p style={{color:'#888', textAlign:'center'}}>এখনো কোনো রিকোয়েস্ট নেই</p>
      )}

      {requests.map((req) => (
        <div key={req.id} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px', marginBottom:'12px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <p style={{fontSize:'16px', fontWeight:'bold', color:'#111', margin:'0 0 4px 0'}}>৳{req.amount}</p>
              <p style={{fontSize:'12px', color:'#888', margin:'0 0 2px 0'}}>{req.method} → {req.account_number}</p>
              <p style={{fontSize:'12px', color:'#888', margin:0}}>{new Date(req.created_at).toLocaleDateString('bn-BD')}</p>
            </div>
            <span style={{fontSize:'12px', padding:'4px 10px', borderRadius:'20px',
              background: req.status === 'completed' ? '#dcfce7' : req.status === 'rejected' ? '#fee2e2' : '#fef9c3',
              color: req.status === 'completed' ? '#15803d' : req.status === 'rejected' ? '#dc2626' : '#854d0e'}}>
              {req.status === 'completed' ? '✅ সম্পন্ন' : req.status === 'rejected' ? '❌ বাতিল' : '⏳ অপেক্ষমান'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}