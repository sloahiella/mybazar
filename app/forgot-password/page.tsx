'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [cool, setCool] = useState(0)

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('email')
    if (q) setEmail(q)
  }, [])

  useEffect(() => {
    if (cool <= 0) return
    const t = setTimeout(() => setCool(cool - 1), 1000)
    return () => clearTimeout(t)
  }, [cool])

  async function sendCode() {
    setMsg('')
    const e = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setMsg('সঠিক ইমেইল দিন'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(e)
    setLoading(false)
    if (error) {
      setMsg(error.message.includes('seconds') ? 'একটু অপেক্ষা করে আবার চেষ্টা করুন' : 'কোড পাঠানো যায়নি: ' + error.message)
      return
    }
    setStep('code')
    setCool(60)
  }

  async function resetNow() {
    setMsg('')
    const e = email.trim().toLowerCase()
    if (code.trim().length < 6) { setMsg('ইমেইলে আসা কোডটি দিন'); return }
    if (password.length < 8) { setMsg('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন'); return }
    setLoading(true)
    const { error: vErr } = await supabase.auth.verifyOtp({ email: e, token: code.trim(), type: 'recovery' })
    if (vErr) { setLoading(false); setMsg('কোড ভুল বা মেয়াদ শেষ। নতুন কোড নিন।'); return }
    const { error: uErr } = await supabase.auth.updateUser({ password })
    if (uErr) { setLoading(false); setMsg('পাসওয়ার্ড বদলানো যায়নি: ' + uErr.message); return }
    await supabase.auth.signOut({ scope: 'local' })
    setLoading(false)
    setStep('done')
  }

  const box: any = { minHeight: '100vh', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }
  const card: any = { background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '100%', boxShadow: '0 4px 20px rgba(219,39,119,0.15)' }
  const inp: any = { border: '2px solid #fbcfe8', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1f2937', marginBottom: '10px' }
  const btn: any = { background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', width: '100%', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.5 : 1 }

  if (step === 'done') {
    return (
      <div style={box}><div style={{ ...card, textAlign: 'center' }}>
        <div style={{ fontSize: '48px' }}>✅</div>
        <h2 style={{ color: '#db2777' }}>পাসওয়ার্ড বদলানো হয়েছে</h2>
        <a href="/" style={{ color: '#db2777' }}>হোমে ফিরে নতুন পাসওয়ার্ডে লগইন করুন</a>
      </div></div>
    )
  }

  return (
    <div style={box}><div style={card}>
      <h1 style={{ color: '#db2777', fontSize: '20px', textAlign: 'center', margin: '0 0 12px 0' }}>🔑 পাসওয়ার্ড ভুলে গেছেন?</h1>
      {step === 'email' ? (
        <>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 10px 0' }}>আপনার ইমেইল দিন। ইমেইল নিবন্ধিত থাকলে ৬ অঙ্কের কোড যাবে।</p>
          <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendCode()} placeholder="ইমেইল" type="email" style={inp} />
          {msg && <p style={{ color: '#ef4444', fontSize: '13px' }}>{msg}</p>}
          <button onClick={sendCode} disabled={loading} style={btn}>{loading ? 'অপেক্ষা করুন...' : 'কোড পাঠান'}</button>
        </>
      ) : (
        <>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 10px 0' }}>{email} ঠিকানায় কোড গেছে (স্প্যামও দেখুন)।</p>
          <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))} inputMode="numeric" placeholder="কোড" style={{ ...inp, textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }} />
          <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && resetNow()} placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)" type="password" style={inp} />
          {msg && <p style={{ color: '#ef4444', fontSize: '13px' }}>{msg}</p>}
          <button onClick={resetNow} disabled={loading} style={btn}>{loading ? 'অপেক্ষা করুন...' : 'পাসওয়ার্ড বদলান'}</button>
          <button onClick={sendCode} disabled={loading || cool > 0} style={{ background: 'none', border: 'none', color: cool > 0 ? '#9ca3af' : '#db2777', fontSize: '13px', cursor: cool > 0 ? 'not-allowed' : 'pointer', marginTop: '10px', width: '100%' }}>
            {cool > 0 ? `আবার কোড পাঠান (${cool} সেকেন্ড)` : 'আবার কোড পাঠান'}
          </button>
        </>
      )}
    </div></div>
  )
}