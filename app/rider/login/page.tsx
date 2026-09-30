'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const PINK = '#db2777'
const PINK_BORDER = '#fbcfe8'

const inputStyle = {
  border: `2px solid ${PINK_BORDER}`,
  borderRadius: '10px',
  padding: '10px 14px',
  width: '100%',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box' as const,
  color: '#1f2937',
  background: 'white',
}

export default function RiderLogin() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    if (!phone.trim() || !password.trim()) { setError('ফোন ও পাসওয়ার্ড দিন!'); return }
    setLoading(true)
    const { data } = await supabase.from('riders').select('*').eq('phone', phone.trim()).single()
    setLoading(false)
    if (!data) { setError('এই নম্বরে কোনো অ্যাকাউন্ট নেই!'); return }
    if (data.password !== password) { setError('পাসওয়ার্ড ভুল!'); return }
    if (!data.is_approved) { setError('আপনার অ্যাকাউন্ট এখনো অনুমোদন হয়নি!'); return }
    localStorage.setItem('role', 'rider')
    localStorage.setItem('rider_id', String(data.id))
    localStorage.setItem('rider_name', data.name)
    localStorage.setItem('rider_vehicle', data.vehicle_number)
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '380px', width: '100%', boxShadow: '0 4px 20px rgba(219,39,119,0.15)' }}>
        <h1 style={{ color: PINK, fontSize: '22px', textAlign: 'center', margin: '0 0 4px 0' }}>🏍️ রাইডার লগইন</h1>
        <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', margin: '0 0 20px 0' }}>সোহেল মার্ট</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>ফোন নম্বর</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" onKeyDown={e => e.key === 'Enter' && handleLogin()} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>পাসওয়ার্ড</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={inputStyle} />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '13px', background: '#fee2e2', padding: '10px', borderRadius: '8px', margin: 0, textAlign: 'center' }}>{error}</p>}

          <button onClick={handleLogin} disabled={loading} style={{ background: PINK, color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.5 : 1, marginTop: '4px' }}>
            {loading ? 'অপেক্ষা করুন...' : 'লগইন করুন'}
          </button>
          <a href="/rider/register" style={{ textAlign: 'center', fontSize: '13px', color: PINK, textDecoration: 'none' }}>অ্যাকাউন্ট নেই? রেজিস্ট্রেশন করুন</a>
        </div>
      </div>
    </div>
  )
}