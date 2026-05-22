'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminWithdrawals() {
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    const { data } = await supabase
      .from('withdrawal_requests')
      .select('*, sellers(shop_name, profiles(full_name, phone))')
      .order('created_at', { ascending: false })
    if (data) setRequests(data)
    setLoading(false)
  }

  async function approve(id: string) {
    await supabase.from('withdrawal_requests').update({ status: 'completed' }).eq('id', id)
    fetchRequests()
  }

  async function reject(id: string) {
    await supabase.from('withdrawal_requests').update({ status: 'rejected' }).eq('id', id)
    fetchRequests()
  }

  return (
    <div style={{maxWidth:'700px', margin:'40px auto', padding:'20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px', fontWeight:'bold', color:'#111', margin:0}}>🏦 উত্তোলন রিকোয়েস্ট</h1>
        <button onClick={() => router.push('/admin/sellers')}
          style={{background:'#e5e7eb', color:'#374151', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'14px', cursor:'pointer'}}>
          ← Admin Panel
        </button>
      </div>

      {loading && <p style={{textAlign:'center'}}>লোড হচ্ছে...</p>}

      {!loading && requests.length === 0 && (
        <p style={{color:'#888', textAlign:'center'}}>কোনো রিকোয়েস্ট নেই</p>
      )}

      {requests.map((req) => (
        <div key={req.id} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px', marginBottom:'16px', boxShadow:'0 1px 4px #0001'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
            <div>
              <p style={{fontWeight:'bold', fontSize:'16px', color:'#111', margin:'0 0 4px 0'}}>
                🏪 {req.sellers?.shop_name}
              </p>
              <p style={{fontSize:'14px', color:'#555', margin:'2px 0'}}>
                👤 {req.sellers?.profiles?.full_name}
              </p>
              <p style={{fontSize:'14px', color:'#555', margin:'2px 0'}}>
                📱 {req.sellers?.profiles?.phone}
              </p>
              <p style={{fontSize:'14px', color:'#16a34a', fontWeight:'bold', margin:'4px 0'}}>
                💰 ৳{req.amount}
              </p>
              <p style={{fontSize:'13px', color:'#555', margin:'2px 0'}}>
                {req.method === 'bkash' ? '💗 বিকাশ' : req.method === 'nagad' ? '🟠 নগদ' : '🏦 ব্যাংক'} → {req.account_number}
              </p>
              <p style={{fontSize:'12px', color:'#888', margin:'4px 0'}}>
                {new Date(req.created_at).toLocaleString('bn-BD')}
              </p>
              <span style={{fontSize:'12px', padding:'3px 10px', borderRadius:'20px', display:'inline-block', marginTop:'4px',
                background: req.status === 'completed' ? '#dcfce7' : req.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                color: req.status === 'completed' ? '#15803d' : req.status === 'rejected' ? '#dc2626' : '#854d0e'}}>
                {req.status === 'completed' ? '✅ সম্পন্ন' : req.status === 'rejected' ? '❌ বাতিল' : '⏳ অপেক্ষমান'}
              </span>
            </div>

            {req.status === 'pending' && (
              <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                <button onClick={() => approve(req.id)}
                  style={{background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'14px', fontWeight:'bold', cursor:'pointer'}}>
                  ✅ অ্যাপ্রুভ
                </button>
                <button onClick={() => reject(req.id)}
                  style={{background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'14px', fontWeight:'bold', cursor:'pointer'}}>
                  ❌ রিজেক্ট
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}