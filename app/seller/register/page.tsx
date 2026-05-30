'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SellerRegister() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '', shop_name: '', shop_description: '', bkash_number: '', branch_id: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e: any) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError) { setError(authError.message); setLoading(false); return }

    const user = authData.user
    if (!user) { setError('সমস্যা হয়েছে!'); setLoading(false); return }

    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: form.full_name,
      phone: form.phone,
      role: 'seller'
    })

    await supabase.from('sellers').insert({
      profile_id: user.id,
      shop_name: form.shop_name,
      shop_description: form.shop_description,
      bkash_number: form.bkash_number,
      branch_id: parseInt(form.branch_id),
      is_approved: false
    })

    alert('রেজিস্ট্রেশন সম্পন্ন! Admin অ্যাপ্রুভ করলে আপনি সেলার হিসেবে কাজ করতে পারবেন।')
    router.push('/')
    setLoading(false)
  }

  const inp = { border: '2px solid #d1fae5', borderRadius: '8px', padding: '10px', width: '100%', fontSize: '14px', color: '#111', background: '#f9fafb', boxSizing: 'border-box' as const }

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px #0001' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#16a34a', marginBottom: '20px', textAlign: 'center' }}>🏪 সেলার রেজিস্ট্রেশন</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div><label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>পূর্ণ নাম *</label>
            <input name="full_name" value={form.full_name} onChange={handle} placeholder="আপনার নাম" required style={inp} /></div>

          <div><label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>ফোন নম্বর *</label>
            <input name="phone" value={form.phone} onChange={handle} placeholder="01XXXXXXXXX" required style={inp} /></div>

          <div><label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>ইমেইল *</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="email@example.com" required style={inp} /></div>

          <div><label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>পাসওয়ার্ড *</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="কমপক্ষে ৬ অক্ষর" required style={inp} /></div>

          <div><label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>দোকানের নাম *</label>
            <input name="shop_name" value={form.shop_name} onChange={handle} placeholder="আপনার দোকানের নাম" required style={inp} /></div>

          <div><label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>দোকানের বিবরণ</label>
            <input name="shop_description" value={form.shop_description} onChange={handle} placeholder="সংক্ষিপ্ত বিবরণ" style={inp} /></div>

          <div><label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>বিকাশ নম্বর *</label>
            <input name="bkash_number" value={form.bkash_number} onChange={handle} placeholder="01XXXXXXXXX" required style={inp} /></div>

          <div><label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>শাখা সিলেক্ট করুন *</label>
            <select name="branch_id" value={form.branch_id} onChange={handle} required style={inp}>
              <option value="">-- শাখা সিলেক্ট করুন --</option>
              <option value="1">ঢাকা</option>
              <option value="5">লালমোহন</option>
            </select>
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{ background: loading ? '#9ca3af' : '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'অপেক্ষা করুন...' : '✅ রেজিস্ট্রেশন করুন'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
            আগে থেকে একাউন্ট আছে? <a href="/seller/login" style={{ color: '#16a34a', fontWeight: 'bold' }}>লগিন করুন</a>
          </p>
        </form>
      </div>
    </div>
  )
}