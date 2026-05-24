'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
)

const LOGO_URL = 'https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/Untitled%20folder/logo.jpg'
const PINK = '#db2777'

export default function Header({ cartCount = 0, onCartClick, onMenuClick, role, onAdminClick, sellerUser, onSellerClick }: {
  cartCount?: number
  onCartClick?: () => void
  onMenuClick?: () => void
  role?: string | null
  onAdminClick?: () => void
  sellerUser?: any
  onSellerClick?: () => void
}) {
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

        <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '20px' }}>👤</span>
          <span style={{ fontSize: '10px' }}>Profile</span>
        </button>

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
    </div>
  )
}
