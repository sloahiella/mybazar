'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { sendStaffCode, verifyStaffCode } from '@/lib/staffCode'

type RoleInfo = { key: 'admin' | 'rider' | 'seller' | 'editor'; icon: string; label: string; rider?: any; editor?: { pageId: number; pageName: string } }

export default function StaffLogin() {
  const [step, setStep] = useState<'password' | 'code' | 'choose'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [code, setCode] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [cool, setCool] = useState(0)

  useEffect(() => {
    if (cool <= 0) return
    const t = setTimeout(() => setCool(cool - 1), 1000)
    return () => clearTimeout(t)
  }, [cool])

  // যাচাইয়ের আগেও কোন কোন অনুমোদিত ভূমিকা আছে তা চেনা
  async function detectRoles(userId: string) {
    const found: RoleInfo[] = []
    let note = ''

    const { data: isAdm } = await supabase.rpc('is_admin_account')
    if (isAdm) found.push({ key: 'admin', icon: '👑', label: 'অ্যাডমিন প্যানেল' })

    const { data: rider } = await supabase.from('riders').select('id, name, vehicle_number, is_approved, is_blocked').eq('user_id', userId).maybeSingle()
    if (rider) {
      if (rider.is_approved) found.push({ key: 'rider', icon: '🏍️', label: 'রাইডার প্যানেল', rider })
      else note = rider.is_blocked ? 'আপনার রাইডার অ্যাকাউন্ট ব্লক করা আছে।' : 'আপনার রাইডার আবেদন এখনো অনুমোদন হয়নি।'
    }

    const { data: seller } = await supabase.from('sellers').select('id, is_approved').eq('profile_id', userId).limit(1)
    if (seller && seller.length > 0) {
      if (seller[0].is_approved) found.push({ key: 'seller', icon: '🏪', label: 'সেলার প্যানেল' })
      else note = 'আপনার সেলার আবেদন এখনো অনুমোদন হয়নি।'
    }

    const { data: eds } = await supabase.from('page_editors').select('page_id, is_blocked').eq('user_id', userId)
    const active = (eds || []).filter((e: any) => !e.is_blocked)
    if (active.length > 0) {
      const { data: pgs } = await supabase.from('pages').select('id, name, name_bn').in('id', active.map((e: any) => e.page_id))
      active.forEach((e: any) => {
        const pg = (pgs || []).find((p: any) => String(p.id) === String(e.page_id))
        const nm = pg ? (pg.name_bn || pg.name) : 'পেজ ' + e.page_id
        found.push({ key: 'editor', icon: '✏️', label: `এডিটর প্যানেল: ${nm}`, editor: { pageId: e.page_id, pageName: nm } })
      })
    } else if ((eds || []).length > 0 && !note) {
      note = 'আপনার এডিটর অ্যাকাউন্ট ব্লক করা আছে।'
    }

    return { found, note }
  }

  async function submitPassword() {
    setMsg('')
    const e = email.trim().toLowerCase()
    if (!e || !password) { setMsg('ইমেইল ও পাসওয়ার্ড দিন'); return }
    setLoading(true)
    const { data: auth, error } = await supabase.auth.signInWithPassword({ email: e, password })
    if (error || !auth?.user || !auth.session) { setLoading(false); setMsg('ইমেইল বা পাসওয়ার্ড ভুল!'); return }

    const { found, note } = await detectRoles(auth.user.id)
    if (found.length === 0) {
      await supabase.auth.signOut({ scope: 'local' })
      setLoading(false)
      setMsg(note || 'এই অ্যাকাউন্টে কোনো প্যানেলের অনুমতি নেই।')
      return
    }
    setRoles(found)

    const r = await sendStaffCode(auth.session.access_token)
    setLoading(false)
    if (!r.ok) {
      await supabase.auth.signOut({ scope: 'local' })
      setMsg(r.message || 'কোড পাঠানো যায়নি')
      return
    }
    setMaskedEmail(r.maskedEmail || e)
    setCode('')
    setStep('code')
    setCool(60)
  }

  async function resend() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setStep('password'); setMsg('সেশন শেষ, আবার লগইন করুন'); return }
    setLoading(true); setMsg('')
    const r = await sendStaffCode(session.access_token)
    setLoading(false)
    if (!r.ok) { setMsg(r.message || 'কোড পাঠানো যায়নি'); return }
    setCode(''); setCool(60)
  }

  async function submitCode() {
    setMsg('')
    if (code.trim().length < 6) { setMsg('ইমেইলে আসা কোডটি দিন'); return }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setStep('password'); setMsg('সেশন শেষ, আবার লগইন করুন'); return }
    setLoading(true)
    const r = await verifyStaffCode(session.access_token, code.trim())
    setLoading(false)
    if (!r.ok) { setMsg(r.message || 'কোড ভুল হয়েছে'); return }
    if (roles.length === 1) go(roles[0])
    else setStep('choose')
  }

  function go(r: RoleInfo) {
    ;['role', 'editor_page_id', 'editor_page_name', 'current_page_id', 'rider_id', 'rider_name', 'rider_vehicle'].forEach(k => localStorage.removeItem(k))
    if (r.key === 'admin') localStorage.setItem('role', 'admin')
    if (r.key === 'rider' && r.rider) {
      localStorage.setItem('role', 'rider')
      localStorage.setItem('rider_id', String(r.rider.id))
      localStorage.setItem('rider_name', r.rider.name)
      localStorage.setItem('rider_vehicle', r.rider.vehicle_number)
    }
    if (r.key === 'editor' && r.editor) {
      localStorage.setItem('role', 'editor')
      localStorage.setItem('editor_page_id', String(r.editor.pageId))
      localStorage.setItem('editor_page_name', r.editor.pageName)
    }
    window.location.href = '/'
  }

  async function cancelAll() {
    await supabase.auth.signOut({ scope: 'local' })
    setStep('password'); setCode(''); setPassword(''); setMsg('')
  }

  const box: any = { minHeight: '100vh', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }
  const card: any = { background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '100%', boxShadow: '0 4px 20px rgba(219,39,119,0.15)' }
  const inp: any = { border: '2px solid #fbcfe8', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1f2937', marginBottom: '10px' }
  const btn: any = { background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', width: '100%', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.5 : 1 }
  const linkBtn: any = { background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', marginTop: '10px', width: '100%' }

  return (
    <div style={box}><div style={card}>
      <h1 style={{ color: '#db2777', fontSize: '20px', textAlign: 'center', margin: '0 0 4px 0' }}>🔐 স্টাফ লগইন</h1>
      <p style={{ color: '#9ca3af', fontSize: '12px', textAlign: 'center', margin: '0 0 14px 0' }}>অ্যাডমিন, এডিটর, রাইডার ও সেলার</p>

      {step === 'password' && (
        <>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="ইমেইল" type="email" style={inp} />
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitPassword()} placeholder="পাসওয়ার্ড" type={showPw ? 'text' : 'password'} style={{ ...inp, marginBottom: 0, paddingRight: '48px' }} />
            <button type="button" onClick={() => setShowPw(!showPw)} aria-label="পাসওয়ার্ড দেখুন বা লুকান" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>{showPw ? '🙈' : '👁️'}</button>
          </div>
          {msg && <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 8px 0' }}>{msg}</p>}
          <button onClick={submitPassword} disabled={loading} style={btn}>{loading ? 'অপেক্ষা করুন...' : 'এগিয়ে যান'}</button>
          <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '12px' }}><a href="/forgot-password" style={{ color: '#db2777' }}>পাসওয়ার্ড ভুলে গেছেন?</a></p>
          <p style={{ textAlign: 'center', fontSize: '13px', margin: 0 }}><a href="/rider/register" style={{ color: '#db2777' }}>নতুন রাইডার? রেজিস্ট্রেশন করুন</a></p>
        </>
      )}

      {step === 'code' && (
        <>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 10px 0' }}>নিরাপত্তার জন্য {maskedEmail} ঠিকানায় একটা কোড গেছে (স্প্যামও দেখুন)। কোডটি দিন।</p>
          <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))} onKeyDown={e => e.key === 'Enter' && submitCode()} inputMode="numeric" placeholder="কোড" style={{ ...inp, textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }} />
          {msg && <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 8px 0' }}>{msg}</p>}
          <button onClick={submitCode} disabled={loading} style={btn}>{loading ? 'অপেক্ষা করুন...' : 'লগইন করুন'}</button>
          <button onClick={resend} disabled={loading || cool > 0} style={{ ...linkBtn, color: cool > 0 ? '#9ca3af' : '#db2777', cursor: cool > 0 ? 'not-allowed' : 'pointer' }}>{cool > 0 ? `আবার কোড পাঠান (${cool} সেকেন্ড)` : 'আবার কোড পাঠান'}</button>
          <button onClick={cancelAll} style={{ ...linkBtn, color: '#6b7280', marginTop: '2px' }}>← বাতিল করুন</button>
        </>
      )}

      {step === 'choose' && (
        <>
          <p style={{ color: '#15803d', fontSize: '13px', margin: '0 0 12px 0' }}>✅ যাচাই হয়েছে। কোন প্যানেলে ঢুকবেন?</p>
          {roles.map((r, i) => (
            <button key={i} onClick={() => go(r)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', marginBottom: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 600, color: '#1f2937', textAlign: 'left' }}>
              <span style={{ fontSize: '24px' }}>{r.icon}</span>{r.label}
            </button>
          ))}
        </>
      )}
    </div></div>
  )
}