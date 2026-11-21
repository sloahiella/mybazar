'use client'
import { useState } from 'react'

export default function RiderRegister() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleRegister() {
    setError('')
    if (!name.trim() || !phone.trim() || !email.trim() || !vehicleNumber.trim() || !password.trim()) { setError('সব তথ্য দিন!'); return }
    if (phone.trim().length < 11) { setError('সঠিক ফোন নম্বর দিন!'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('সঠিক ইমেইল দিন!'); return }
    if (password.length < 8) { setError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন!'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/rider/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, vehicleNumber, password }),
      })
      const data = await res.json()
      setLoading(false)
      if (!data.ok) { setError(data.message || 'সমস্যা হয়েছে'); return }
      setDone(true)
    } catch (e) {
      setLoading(false)
      setError('নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন')
    }
  }

  const box: any = { minHeight: '100vh', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }
  const card: any = { background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '100%', boxShadow: '0 4px 20px rgba(219,39,119,0.15)' }
  const inp: any = { border: '2px solid #fbcfe8', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1f2937', marginBottom: '10px' }

  if (done) {
    return (
      <div style={box}><div style={{ ...card, textAlign: 'center' }}>
        <div style={{ fontSize: '48px' }}>⏳</div>
        <h2 style={{ color: '#db2777' }}>আবেদন পাঠানো হয়েছে</h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>অ্যাডমিন অনুমোদন দিলে আপনি ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।</p>
        <a href="/rider/login" style={{ color: '#db2777' }}>লগইন পাতায় যান</a>
      </div></div>
    )
  }

  return (
    <div style={box}><div style={card}>
      <h1 style={{ color: '#db2777', fontSize: '20px', textAlign: 'center', margin: '0 0 14px 0' }}>🏍️ রাইডার রেজিস্ট্রেশন</h1>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="আপনার নাম" style={inp} />
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="ফোন নম্বর" inputMode="tel" style={inp} />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Gmail / ইমেইল" type="email" style={inp} />
      <input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} placeholder="গাড়ির নম্বর" style={inp} />
      <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRegister()} placeholder="পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)" type="password" style={inp} />
      {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 8px 0' }}>{error}</p>}
      <button onClick={handleRegister} disabled={loading} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', width: '100%', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>{loading ? 'অপেক্ষা করুন...' : 'আবেদন করুন'}</button>
      <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '12px' }}><a href="/rider/login" style={{ color: '#db2777' }}>আগেই অ্যাকাউন্ট আছে? লগইন করুন</a></p>
    </div></div>
  )
}