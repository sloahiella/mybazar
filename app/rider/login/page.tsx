'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function RiderLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    if (!email.trim() || !password.trim()) { setError('ইমেইল ও পাসওয়ার্ড দিন!'); return }
    setLoading(true)
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (authError || !auth?.user) { setLoading(false); setError('ইমেইল বা পাসওয়ার্ড ভুল!'); return }

    const { data: rider } = await supabase.from('riders').select('id, name, vehicle_number, is_approved').eq('user_id', auth.user.id).maybeSingle()
    if (!rider) { await supabase.auth.signOut({ scope: 'local' }); setLoading(false); setError('এই অ্যাকাউন্টে রাইডারের তথ্য পাওয়া যায়নি!'); return }
    if (!rider.is_approved) { await supabase.auth.signOut({ scope: 'local' }); setLoading(false); setError('আপনার অ্যাকাউন্ট অনুমোদন হয়নি বা ব্লক করা আছে!'); return }

    localStorage.setItem('role', 'rider')
    localStorage.setItem('rider_id', String(rider.id))
    localStorage.setItem('rider_name', rider.name)
    localStorage.setItem('rider_vehicle', rider.vehicle_number)
    setLoading(false)
    window.location.href = '/'
  }

  const box: any = { minHeight: '100vh', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }
  const card: any = { background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '100%', boxShadow: '0 4px 20px rgba(219,39,119,0.15)' }
  const inp: any = { border: '2px solid #fbcfe8', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1f2937', marginBottom: '10px' }

  return (
    <div style={box}><div style={card}>
      <h1 style={{ color: '#db2777', fontSize: '20px', textAlign: 'center', margin: '0 0 14px 0' }}>🏍️ রাইডার লগইন</h1>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="ইমেইল" type="email" style={inp} />
      <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="পাসওয়ার্ড" type="password" style={inp} />
      {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 8px 0' }}>{error}</p>}
      <button onClick={handleLogin} disabled={loading} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', width: '100%', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>{loading ? 'অপেক্ষা করুন...' : 'লগইন'}</button>
      <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '12px' }}><a href="/forgot-password" style={{ color: '#db2777' }}>পাসওয়ার্ড ভুলে গেছেন?</a></p>
      <p style={{ textAlign: 'center', fontSize: '13px', margin: 0 }}><a href="/rider/register" style={{ color: '#db2777' }}>নতুন রাইডার? রেজিস্ট্রেশন করুন</a></p>
    </div></div>
  )
}