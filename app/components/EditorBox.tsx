'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function EditorBox({ page, onClose }: { page: any; onClose: () => void }) {
  const [editors, setEditors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function api(body: any) {
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch('/api/admin/editor-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify(body),
      })
      return await res.json()
    } catch (e) {
      return { ok: false, message: 'নেটওয়ার্ক সমস্যা' }
    }
  }

  async function load() {
    const r = await api({ action: 'list', pageId: page.id })
    if (r.ok) setEditors(r.editors || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const ch = supabase.channel('page-editors-' + page.id + '-' + Date.now())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_editors' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [page.id])

  async function act(body: any, okMsg?: string) {
    setBusy(true)
    const r = await api(body)
    setBusy(false)
    if (!r.ok) alert(r.message || 'কাজটি করা যায়নি')
    else if (okMsg) alert(okMsg)
    load()
    return r
  }

  async function addEditor() {
    if (!email.trim()) { alert('এডিটরের ইমেইল দিন'); return }
    const r = await act({ action: 'add_editor', pageId: page.id, email, password })
    if (r.ok) {
      alert(r.linkedExisting ? '✅ যোগ হয়েছে। এই ইমেইলে আগে থেকেই অ্যাকাউন্ট ছিল, তাই সেটার সাথে যুক্ত করা হয়েছে (পাসওয়ার্ড অপরিবর্তিত)।' : '✅ নতুন এডিটর অ্যাকাউন্ট তৈরি হয়েছে।')
      setEmail(''); setPassword('')
    }
  }

  function resetPassword(ed: any) {
    const p = prompt(`${ed.email}-এর নতুন পাসওয়ার্ড দিন (কমপক্ষে ৮ অক্ষর):`)
    if (!p) return
    act({ action: 'reset_password', editorId: ed.id, password: p }, '✅ পাসওয়ার্ড বদলানো হয়েছে। এডিটরকে জানিয়ে দিন।')
  }
  function remove(ed: any) {
    if (confirm(`${ed.email}-কে এই পেজের এডিটর থেকে সরাবেন?`)) act({ action: 'delete', editorId: ed.id })
  }

  const btn = (bg: string): any => ({ background: bg, color: 'white', border: 'none', borderRadius: '8px', padding: '5px 9px', fontSize: '11px', cursor: 'pointer' })
  const inp: any = { border: '2px solid #fbcfe8', borderRadius: '8px', padding: '7px 10px', width: '100%', fontSize: '12px', boxSizing: 'border-box', outline: 'none', color: '#1f2937', marginBottom: '6px' }

  return (
    <div style={{ marginLeft: '12px', background: '#fdf2f8', borderRadius: '8px', padding: '10px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <p style={{ fontSize: '12px', color: '#db2777', fontWeight: 'bold', margin: 0 }}>✏️ এডিটর: {page.name_bn || page.name}</p>

      {loading && <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>লোড হচ্ছে...</p>}
      {!loading && editors.length === 0 && <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>এই পেজে এখনও কোনো এডিটর নেই।</p>}

      {editors.map(ed => (
        <div key={ed.id} style={{ background: 'white', borderRadius: '8px', padding: '8px', opacity: busy ? 0.6 : 1 }}>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#111827' }}>
            ✉️ {ed.email} {ed.is_blocked && <span style={{ color: '#dc2626', fontSize: '11px' }}>⛔ ব্লক</span>}
          </p>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
            <button disabled={busy} onClick={() => resetPassword(ed)} style={btn('#2563eb')}>🔑 পাসওয়ার্ড</button>
            {!ed.is_blocked && <button disabled={busy} onClick={() => act({ action: 'block', editorId: ed.id })} style={btn('#f97316')}>⛔ ব্লক</button>}
            {ed.is_blocked && <button disabled={busy} onClick={() => act({ action: 'unblock', editorId: ed.id })} style={btn('#16a34a')}>✅ চালু</button>}
            <button disabled={busy} onClick={() => remove(ed)} style={btn('#ef4444')}>🗑️ সরান</button>
          </div>
        </div>
      ))}

      <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' }}>নতুন এডিটর যোগ। ইমেইলে আগে থেকে অ্যাকাউন্ট থাকলে পাসওয়ার্ড খালি রাখুন।</p>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="এডিটরের Gmail" type="email" style={inp} />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="পাসওয়ার্ড (নতুন হলে, কমপক্ষে ৮ অক্ষর)" type="text" style={inp} />
      <div style={{ display: 'flex', gap: '6px' }}>
        <button disabled={busy} onClick={addEditor} style={{ ...btn('#db2777'), flex: 1, padding: '8px', fontSize: '12px' }}>➕ যোগ করুন</button>
        <button onClick={onClose} style={{ ...btn('#9ca3af'), padding: '8px 12px', fontSize: '12px', color: '#374151', background: '#e5e7eb' }}>বন্ধ</button>
      </div>
    </div>
  )
}