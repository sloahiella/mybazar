'use client'
import { useState } from 'react'
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

export default function RiderRegister() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister() {
    setError('')
    if (!name.trim() || !phone.trim() || !vehicleNumber.trim() || !password.trim()) {
      setError('সব তথ্য দিন!')
      return
    }
    if (phone.trim().length < 11) {
      setError('সঠিক ফোন নম্বর দিন!')
      return
    }
    if (password.length < 4) {
      setError('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের দিন!')
      return
    }
    setLoading(true)
    const { error: insertError } = await supabase.from('riders').insert({
      name: name.trim(),
      phone: phone.trim(),
      vehicle_number: vehicleNumber.trim(),
      password: password,
      is_approved: false,
    })
    setLoading(false)
    if (insertError) {
      if (insertError.code === '23505') {
        setError('এই ফোন নম্বরে আগেই রেজিস্ট্রেশন করা আছে!')
      } else {
        setError('সমস্যা হয়েছে: ' + insertError.message)
      }
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(219,39,119,0.15)' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>✅</div>
          <h2 style={{ color: PINK, fontSize: '20px', margin: '0 0 8px 0' }}>রেজিস্ট্রেশন সম্পন্ন!</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px 0' }}>অ্যাডমিন অনুমোদন দেওয়ার পর আপনি লগইন করতে পারবেন।</p>
          <a href="/" style={{ display: 'inline-block', background: PINK, color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px' }}>হোমে ফিরুন</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 20px rgba(219,39,119,0.15)' }}>
        <h1 style={{ color: PINK, fontSize: '22px', textAlign: 'center', margin: '0 0 4px 0' }}>🏍️ রাইডার রেজিস্ট্রেশন</h1>
        <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', margin: '0 0 20px 0' }}>সোহেল মার্ট</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>পূর্ণ নাম *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="আপনার নাম" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>ফোন নম্বর *</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>গাড়ির নম্বর *</label>
            <input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} placeholder="যেমন: ১ নম্বর গাড়ি" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>পাসওয়ার্ড *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="লগইনের জন্য পাসওয়ার্ড" style={inputStyle} />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '13px', background: '#fee2e2', padding: '10px', borderRadius: '8px', margin: 0, textAlign: 'center' }}>{error}</p>}

          <button onClick={handleRegister} disabled={loading} style={{ background: PINK, color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.5 : 1, marginTop: '4px' }}>
            {loading ? 'অপেক্ষা করুন...' : '✅ রেজিস্ট্রেশন করুন'}
          </button>
        </div>
      </div>
    </div>
  )
}