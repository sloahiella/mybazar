'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const EVENT_LABEL: Record<string, string> = {
  code_sent: '📧 লগইনের চেষ্টা',
  code_ok: '✅ সফল লগইন',
  code_fail: '❌ ভুল কোড',
}

function fmt(t: string) {
  try { return new Date(t).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return t }
}

function shortUa(ua: string) {
  if (!ua) return ''
  const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iPhone/iPad' : /Windows/i.test(ua) ? 'Windows' : /Mac OS/i.test(ua) ? 'Mac' : /Linux/i.test(ua) ? 'Linux' : ''
  const br = /Edg\//i.test(ua) ? 'Edge' : /Chrome\//i.test(ua) ? 'Chrome' : /Firefox\//i.test(ua) ? 'Firefox' : /Safari\//i.test(ua) ? 'Safari' : ''
  return [br, os].filter(Boolean).join(' • ')
}

export default function LoginMonitor({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')

  async function api(body: any) {
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch('/api/admin/login-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify(body),
      })
      return await res.json()
    } catch (e) {
      return { ok: false, message: 'নেটওয়ার্ক সমস্যা' }
    }
  }

  async function load(silent = true) {
    if (!silent) setLoading(true)
    const r = await api({ action: 'list' })
    if (r.ok) { setData(r); setErr('') } else setErr(r.message || 'তথ্য আনা যায়নি')
    setLoading(false)
  }

  useEffect(() => {
    load(false)
    let ch: any = null
    let cancelled = false
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      if (session?.access_token) supabase.realtime.setAuth(session.access_token)
      ch = supabase.channel('login-events-' + Date.now())
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'login_events' }, () => load())
        .subscribe()
    })()
    const poll = setInterval(() => load(), 30000)
    return () => { cancelled = true; clearInterval(poll); if (ch) supabase.removeChannel(ch) }
  }, [])

  async function act(action: string, row: any) {
    const warn =
      action === 'revoke_user'
        ? `${row.email}-এর সব লগইন সেশন বাতিল করবেন?${row.isAdmin ? '\n(এটা অ্যাডমিন অ্যাকাউন্ট, আপনি নিজেও বের হয়ে যাবেন। আবার কোড দিয়ে ঢুকতে হবে।)' : ''}`
        : action === 'ban_user' ? `${row.email}-কে ব্লক করবেন? সে আর লগইন করতে পারবে না।` : ''
    if (warn && !confirm(warn)) return
    setBusy(row.id + action)
    const r = await api({ action, userId: row.id })
    setBusy('')
    if (!r.ok) alert(r.message || 'কাজটি করা যায়নি')
    load()
  }

  const users = data?.users || {}
  const adminEmails: string[] = data?.adminEmails || []
  const events: any[] = data?.events || []
  const sessions: any[] = data?.sessions || []
  const now = Date.now()

  const ids = Array.from(new Set([...sessions.map((s: any) => s.user_id), ...events.map((e: any) => e.user_id)].filter(Boolean))) as string[]
  const rows = ids.map((id) => {
    const u = users[id] || {}
    const ev = events.filter((e: any) => e.user_id === id)
    const active = sessions.filter((s: any) => s.user_id === id).length
    const fails1h = ev.filter((e: any) => e.event === 'code_fail' && now - new Date(e.created_at).getTime() < 3600000).length
    const ips24 = new Set(ev.filter((e: any) => e.ip && now - new Date(e.created_at).getTime() < 86400000).map((e: any) => e.ip)).size
    const email = u.email || '(অজানা)'
    return {
      id, email, banned: !!u.banned,
      isAdmin: adminEmails.includes(String(u.email || '').toLowerCase()),
      active, fails1h, ips24, last: ev[0],
      suspicious: fails1h >= 3 || ips24 >= 3,
    }
  }).sort((a, b) => Number(b.suspicious) - Number(a.suspicious) || b.active - a.active)

  const btn = (bg: string): any => ({ background: bg, color: 'white', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#f9fafb', width: '100%', maxWidth: '560px', borderRadius: '20px 20px 0 0', padding: '16px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, color: '#db2777', fontSize: '17px' }}>🛡️ লগইন নজরদারি</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => load(false)} style={btn('#6b7280')}>🔄</button>
            <button onClick={onClose} style={btn('#ef4444')}>✕</button>
          </div>
        </div>

        {err && <p style={{ color: '#ef4444', fontSize: '13px' }}>{err}</p>}
        {loading && <p style={{ color: '#9ca3af', textAlign: 'center' }}>লোড হচ্ছে...</p>}

        {!loading && (
          <>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: '4px 0 6px 0' }}>ব্যবহারকারী ও চালু সেশন</p>
            {rows.length === 0 && <p style={{ color: '#9ca3af', fontSize: '13px' }}>এখনও কোনো লগইনের তথ্য নেই।</p>}
            {rows.map((r) => (
              <div key={r.id} style={{ background: 'white', border: `1px solid ${r.suspicious ? '#fca5a5' : '#e5e7eb'}`, borderRadius: '12px', padding: '10px 12px', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>
                  {r.email} {r.isAdmin && <span style={{ fontSize: '11px', color: '#7c3aed' }}>👑 অ্যাডমিন</span>} {r.banned && <span style={{ fontSize: '11px', color: '#dc2626' }}>⛔ ব্লক</span>} {r.suspicious && <span style={{ fontSize: '11px', color: '#dc2626' }}>⚠️ সন্দেহজনক</span>}
                </p>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                  চালু সেশন: {r.active}টি · গত ১ ঘণ্টায় ভুল কোড: {r.fails1h}বার · গত ২৪ ঘণ্টায় আলাদা আইপি: {r.ips24}টি
                </p>
                {r.last && (
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                    শেষ ঘটনা: {EVENT_LABEL[r.last.event] || r.last.event}, {fmt(r.last.created_at)}{r.last.ip ? `, ${r.last.ip}` : ''}{r.last.user_agent ? `, ${shortUa(r.last.user_agent)}` : ''}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <button disabled={busy === r.id + 'revoke_user'} onClick={() => act('revoke_user', r)} style={btn('#f97316')}>🚪 সব সেশন বাতিল</button>
                  {!r.isAdmin && !r.banned && <button disabled={busy === r.id + 'ban_user'} onClick={() => act('ban_user', r)} style={btn('#ef4444')}>⛔ ব্লক</button>}
                  {r.banned && <button disabled={busy === r.id + 'unban_user'} onClick={() => act('unban_user', r)} style={btn('#16a34a')}>✅ আবার চালু</button>}
                </div>
              </div>
            ))}

            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: '14px 0 6px 0' }}>সাম্প্রতিক ঘটনা (সর্বশেষ ৫০টি)</p>
            {events.slice(0, 50).map((e: any) => (
              <div key={e.id} style={{ background: 'white', borderRadius: '8px', padding: '6px 10px', marginBottom: '4px', fontSize: '12px', color: '#374151', borderLeft: `3px solid ${e.event === 'code_fail' ? '#ef4444' : e.event === 'code_ok' ? '#16a34a' : '#9ca3af'}` }}>
                {EVENT_LABEL[e.event] || e.event} · {e.email || ''}<br />
                <span style={{ color: '#9ca3af' }}>{fmt(e.created_at)}{e.ip ? ` · ${e.ip}` : ''}{e.user_agent ? ` · ${shortUa(e.user_agent)}` : ''}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}