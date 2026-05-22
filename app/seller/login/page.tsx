'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SellerLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError('ইমেইল বা পাসওয়ার্ড ভুল!')
      setLoading(false)
      return
    }

    router.push('/')
    setLoading(false)
  }

  const inp: any = { border: '2px solid #aaa', padding: '12px', borderRadius: '6px', fontSize: '16px', color: '#111', background: '#f9f9f9', width: '100%', boxSizing: 'border-box' }
  const lbl: any = { fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '4px', display: 'block' }

  return (
    <div style={{maxWidth:'420px', margin:'60px auto', padding:'30px', background:'#fff', borderRadius:'12px', boxShadow:'0 2px 16px #0002'}}>
      <h1 style={{fontSize:'24px', fontWeight:'bold', textAlign:'center', marginBottom:'24px', color:'#111'}}>
        🏪 সেলার লগিন
      </h1>

      <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
        <div>
          <label style={lbl}>ইমেইল</label>
          <input name="email" type="email" placeholder="আপনার ইমেইল" onChange={handleChange} required style={inp} />
        </div>

        <div>
          <label style={lbl}>পাসওয়ার্ড</label>
          <div style={{position:'relative'}}>
            <input name="password" type={showPassword ? 'text' : 'password'} placeholder="আপনার পাসওয়ার্ড" onChange={handleChange} required style={{...inp, paddingRight:'48px'}} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={{position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'20px'}}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && (
          <p style={{color:'#ef4444', fontSize:'14px', margin:0, textAlign:'center'}}>{error}</p>
        )}

        <button type="submit" disabled={loading}
          style={{background:'#16a34a', color:'#fff', padding:'14px', borderRadius:'6px', fontSize:'17px', fontWeight:'bold', border:'none', cursor:'pointer'}}>
          {loading ? 'অপেক্ষা করুন...' : 'লগিন করুন'}
        </button>

        <p style={{textAlign:'center', fontSize:'14px', color:'#555', margin:0}}>
          অ্যাকাউন্ট নেই?{' '}
          <a href="/seller/register" style={{color:'#16a34a', fontWeight:'bold', textDecoration:'none'}}>
            রেজিস্ট্রেশন করুন
          </a>
        </p>
      </form>
    </div>
  )
}