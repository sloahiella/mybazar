'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
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
    setCode('')
    setStep('code')
    setCool(60)
  }

  async function checkCode() {
    setMsg('')
    const e = email.trim().toLowerCase()
    if (code.trim().length < 6) { setMsg('ইমেইলে আসা কোডটি দিন'); return }
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email: e, token: code.trim(), type: 'recovery' })
    setLoading(false)
    if (error) { setMsg('কোড ভুল বা মেয়াদ শেষ। আবার চেষ্টা করুন, বা নতুন কোড নিন।'); return }
    setStep('password')
  }

  async function savePassword() {
    setMsg('')
    if (password.length < 8) { setMsg('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setLoading(false); setMsg('পাসওয়ার্ড বদলানো যায়নি: ' + error.message); return }
    await supabase.auth.signOut({ scope: 'local' })
    setLoading(false)
    setStep('done')
  }

  async function cancelAll() {
    await supabase.auth.signOut({ scope: 'local' })
    setStep('email'); setCode(''); setPassword(''); setMsg('')
  }

  const box: any = { minHeight: '100vh', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }
  const card: any = { background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '100%', boxShadow: '0 4px 20px rgba(219,39,119,0.15)' }
  const inp: any = { border: '2px solid #fbcfe8', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1f2937', marginBottom: '10px' }
  const btn: any = { background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', width: '100%', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.5 : 1 }
  const linkBtn: any = { background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', marginTop: '10px', width: '100%' }
  const stepNo = step === 'email' ? 1 : step === 'code' ? 2 : 3

  if (step === 'done') {
    const goBtn: any = { display: 'block', textAlign: 'center', textDecoration: 'none', borderRadius: '12px', padding: '12px', fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }
    return (
      <div style={box}><div style={{ ...card, textAlign: 'center' }}>
        <div style={{ fontSize: '48px' }}>✅</div>
        <h2 style={{ color: '#db2777', margin: '8px 0' }}>পাসওয়ার্ড বদলানো হয়েছে</h2>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 16px 0' }}>এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।</p>
        <a href="/" style={{ ...goBtn, background: '#db2777', color: 'white' }}>🏠 হোমে যান</a>
        <a href="/rider/login" style={{ ...goBtn, background: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8' }}>🏍️ রাইডার লগইন</a>
        <a href="/seller/login" style={{ ...goBtn, background: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8', marginBottom: 0 }}>🏪 সেলার লগইন</a>
        <p style={{ color: '#9ca3af', fontSize: '11px', margin: '12px 0 0 0' }}>অ্যাডমিন বা এডিটর হলে হোমে গিয়ে লোগোতে ৫ বার চাপুন।</p>
      </div></div>
    )
  }

  return (
    <div style={box}><div style={card}>
      <h1 style={{ color: '#db2777', fontSize: '20px', textAlign: 'center', margin: '0 0 4px 0' }}>🔑 পাসওয়ার্ড ভুলে গেছেন?</h1>
      <p style={{ color: '#9ca3af', fontSize: '12px', textAlign: 'center', margin: '0 0 14px 0' }}>ধাপ {stepNo}/৩</p>

      {step === 'email' && (
        <>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 10px 0' }}>আপনার ইমেইল দিন। ইমেইল নিবন্ধিত থাকলে কোড যাবে।</p>
          <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendCode()} placeholder="ইমেইল" type="email" style={inp} />
          {msg && <p style={{ color: '#ef4444', fontSize: '13px' }}>{msg}</p>}
          <button onClick={sendCode} disabled={loading} style={btn}>{loading ? 'অপেক্ষা করুন...' : 'কোড পাঠান'}</button>
        </>
      )}

      {step === 'code' && (
        <>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 10px 0' }}>{email} ঠিকানায় কোড গেছে (স্প্যামও দেখুন)।</p>
          <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))} onKeyDown={e => e.key === 'Enter' && checkCode()} inputMode="numeric" placeholder="কোড" style={{ ...inp, textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }} />
          {msg && <p style={{ color: '#ef4444', fontSize: '13px' }}>{msg}</p>}
          <button onClick={checkCode} disabled={loading} style={btn}>{loading ? 'অপেক্ষা করুন...' : 'কোড যাচাই করুন'}</button>
          <button onClick={sendCode} disabled={loading || cool > 0} style={{ ...linkBtn, color: cool > 0 ? '#9ca3af' : '#db2777', cursor: cool > 0 ? 'not-allowed' : 'pointer' }}>
            {cool > 0 ? `আবার কোড পাঠান (${cool} সেকেন্ড)` : 'আবার কোড পাঠান'}
          </button>
          <button onClick={() => { setStep('email'); setMsg('') }} style={{ ...linkBtn, color: '#6b7280', marginTop: '2px' }}>← ইমেইল বদলান</button>
        </>
      )}

      {step === 'password' && (
        <>
          <p style={{ color: '#15803d', fontSize: '13px', margin: '0 0 10px 0' }}>✅ কোড ঠিক আছে। এখন নতুন পাসওয়ার্ড দিন।</p>
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && savePassword()} placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)" type={show ? 'text' : 'password'} style={{ ...inp, marginBottom: 0, paddingRight: '48px' }} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>{show ? '🙈' : '👁️'}</button>
          </div>
          {msg && <p style={{ color: '#ef4444', fontSize: '13px' }}>{msg}</p>}
          <button onClick={savePassword} disabled={loading} style={btn}>{loading ? 'অপেক্ষা করুন...' : 'পাসওয়ার্ড বদলান'}</button>
          <button onClick={cancelAll} style={{ ...linkBtn, color: '#6b7280' }}>বাতিল করুন</button>
        </>
      )}
    </div></div>
  )
}