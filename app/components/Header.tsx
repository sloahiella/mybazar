'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
)

const LOGO_URL = 'https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/Untitled%20folder/logo.jpg'
const PINK = '#db2777'

export default function Header({ cartCount = 0, onCartClick, onMenuClick, role, onAdminClick, sellerUser, onSellerClick, onOrdersClick }: {
  cartCount?: number
  onCartClick?: () => void
  onMenuClick?: () => void
  role?: string | null
  onAdminClick?: () => void
  sellerUser?: any
  onSellerClick?: () => void
  onOrdersClick?: () => void
}) {
  const [showProfile, setShowProfile] = useState(false)
 const [customerName, setCustomerName] = useState<string | null>(null)
  const [customerPhone, setCustomerPhone] = useState<string | null>(null)

 const [customerAvatar, setCustomerAvatar] = useState<string | null>(null)

  useEffect(() => {
    setCustomerName(localStorage.getItem('customer_name'))
    setCustomerPhone(localStorage.getItem('customer_phone'))
    setCustomerAvatar(localStorage.getItem('customer_avatar'))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.removeItem('customer_phone')
    localStorage.removeItem('customer_name')
    localStorage.removeItem('customer_district')
    localStorage.removeItem('customer_upazila')
    setShowProfile(false)
    window.location.reload()
  }

  return (
    <div style={{ background: PINK, color: 'white', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
      
      {/* বাম দিক */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onMenuClick} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '4px' }}>☰</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={LOGO_URL} alt="লোগো" style={{ height: '36px', width: 'auto', borderRadius: '6px' }} />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>সোহেল মার্ট</h1>
            <p style={{ fontSize: '10px', margin: 0, opacity: 0.8 }}>মাই বাজার</p>
          </div>
        </div>
      </div>

      {/* ডান দিক */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        
       {sellerUser && (
          <button onClick={onSellerClick} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontSize: '20px' }}>🏪</span>
            <span style={{ fontSize: '10px' }}>Seller</span>
          </button>
        )}

        {(role === 'admin' || role === 'editor') && (
          <button onClick={onAdminClick} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontSize: '20px' }}>{role === 'admin' ? '👑' : '📋'}</span>
            <span style={{ fontSize: '10px' }}>{role === 'admin' ? 'Admin' : 'Editor'}</span>
          </button>
        )}

        {/* Profile বাটন */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowProfile(!showProfile)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
           <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: customerName ? '#fbbf24' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: customerName ? '14px' : '18px', fontWeight: 'bold', color: customerName ? '#111' : 'white' }}>
              {customerAvatar ? <img src={customerAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : customerName ? customerName[0].toUpperCase() : '👤'}
            </div>
            <span style={{ fontSize: '10px' }}>{customerName ? customerName.split(' ')[0] : 'Profile'}</span>
          </button>

          {/* Dropdown */}
          {showProfile && (
            <div style={{ position: 'absolute', right: 0, top: '70px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', minWidth: '200px', zIndex: 999, overflow: 'hidden' }}>
              {customerPhone ? (
                <>
                  <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', background: '#fdf2f8' }}>
                    <p style={{ fontWeight: 'bold', color: '#1f2937', margin: 0, fontSize: '14px' }}>👤 {customerName}</p>
                    <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '12px' }}>📱 {customerPhone}</p>
                  </div>
                  <button onClick={() => { setShowProfile(false); onOrdersClick && onOrdersClick(); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📋 আমার অর্ডার
                  </button>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #e5e7eb' }}>
                    🚪 লগআউট
                  </button>
                </>
              ) : (
                <button onClick={() => { setShowProfile(false); onCartClick && onCartClick(); }} style={{ width: '100%', padding: '16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: PINK, fontWeight: 'bold' }}>
                  🔑 লগইন করুন
                </button>
              )}
            </div>
          )}
        </div>

        <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '20px' }}>♡</span>
          <span style={{ fontSize: '10px' }}>Wishlist</span>
        </button>

        <button onClick={onCartClick} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', position: 'relative' }}>
          <span style={{ fontSize: '20px' }}>🛒</span>
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#fbbf24', color: '#111', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{cartCount}</span>
          )}
          <span style={{ fontSize: '10px' }}>Cart</span>
        </button>
      </div>

      {/* Dropdown বন্ধ করতে outside click */}
      {showProfile && <div onClick={() => setShowProfile(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />}
    </div>
  )
}