'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminSellers() {
  const [sellers, setSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSellers()
  }, [])

  async function fetchSellers() {
    const { data } = await supabase
      .from('sellers')
      .select('*, profiles(full_name, phone)')
      .order('created_at', { ascending: false })
    if (data) setSellers(data)
    setLoading(false)
  }

  async function approveSeller(id: string) {
    await supabase.from('sellers').update({ is_approved: true }).eq('id', id)
    fetchSellers()
  }

  async function rejectSeller(id: string) {
    await supabase.from('sellers').delete().eq('id', id)
    fetchSellers()
  }

  return (
    <div style={{maxWidth:'700px', margin:'40px auto', padding:'20px'}}>
      <h1 style={{fontSize:'24px', fontWeight:'bold', marginBottom:'24px', color:'#111'}}>
        🏪 সেলার অ্যাপ্রুভাল প্যানেল
      </h1>

      {loading && <p>লোড হচ্ছে...</p>}

      {sellers.length === 0 && !loading && (
        <p style={{color:'#888', textAlign:'center'}}>কোনো সেলার নেই</p>
      )}

      {sellers.map((seller) => (
        <div key={seller.id} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px', marginBottom:'16px', boxShadow:'0 1px 4px #0001'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
            <div>
              <p style={{fontWeight:'bold', fontSize:'16px', color:'#111', margin:'0 0 4px 0'}}>
                🏪 {seller.shop_name}
              </p>
              <p style={{fontSize:'14px', color:'#555', margin:'2px 0'}}>
                👤 {seller.profiles?.full_name}
              </p>
              <p style={{fontSize:'14px', color:'#555', margin:'2px 0'}}>
                📱 {seller.profiles?.phone}
              </p>
              <p style={{fontSize:'14px', color:'#555', margin:'2px 0'}}>
                💳 বিকাশ: {seller.bkash_number}
              </p>
              <p style={{fontSize:'13px', color:'#888', margin:'4px 0'}}>
                📝 {seller.shop_description}
              </p>
              <span style={{
                display:'inline-block', marginTop:'6px',
                padding:'2px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'bold',
                background: seller.is_approved ? '#dcfce7' : '#fef9c3',
                color: seller.is_approved ? '#16a34a' : '#ca8a04'
              }}>
                {seller.is_approved ? '✅ অ্যাপ্রুভড' : '⏳ অপেক্ষমান'}
              </span>
            </div>

            {!seller.is_approved && (
              <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                <button onClick={() => approveSeller(seller.id)}
                  style={{background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'14px', fontWeight:'bold', cursor:'pointer'}}>
                  ✅ অ্যাপ্রুভ
                </button>
                <button onClick={() => rejectSeller(seller.id)}
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