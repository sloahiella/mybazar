'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ResetPassword() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true) })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function submit() {
    setMsg('')
    if (password.length < 8) { setMsg('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setMsg('বদলানো যায়নি: ' + error.message); return }
    await supabase.auth.signOut()
    setDone(true)
  }

  const box: any = { minHeight: '100vh', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }
  const card: any = { background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '100%', boxShadow: '0 4px 20px rgba(219,39,119,0.15)' }

  if (done) {
    return (
      <div style={box}><div style={{ ...card, textAlign: 'center' }}>
        <div style={{ fontSize: '48px' }}>✅</div>
        <h2 style={{ color: '#db2777' }}>পাসওয়ার্ড বদলানো হয়েছে</h2>
        <a href="/" style={{ color: '#db2777' }}>হোমে ফিরুন, তারপর নতুন পাসওয়ার্ডে লগইন করুন</a>
      </div></div>
    )
  }

  return (
    <div style={box}><div style={card}>
      <h1 style={{ color: '#db2777', fontSize: '20px', textAlign: 'center', margin: '0 0 12px 0' }}>নতুন পাসওয়ার্ড দিন</h1>
      {!ready ? (
        <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>ইমেইলে পাঠানো লিংক থেকে এই পাতায় আসুন।</p>
      ) : (
        <>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)" style={{ border: '2px solid #fbcfe8', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} />
          {msg && <p style={{ color: '#ef4444', fontSize: '13px' }}>{msg}</p>}
          <button onClick={submit} disabled={loading} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', width: '100%', fontSize: '15px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>{loading ? 'অপেক্ষা করুন...' : 'পাসওয়ার্ড বদলান'}</button>
        </>
      )}
    </div></div>
  )
}