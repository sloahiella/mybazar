'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
)

const LOGO_URL = 'https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/Untitled%20folder/logo.jpg'
const PINK = '#be185d' 

export default function Header({ cartCount = 0, onCartClick, onMenuClick, role, onAdminClick, sellerUser, onSellerClick, onOrdersClick, onSelectPage }: {
  cartCount?: number
  onCartClick?: () => void
  onMenuClick?: () => void
  role?: string | null
  onAdminClick?: () => void
  sellerUser?: any
  onSellerClick?: () => void
  onOrdersClick?: () => void
  onSelectPage?: (product: any) => void
}) {
  const [showProfile, setShowProfile] = useState(false)
  const [customerName, setCustomerName] = useState<string | null>(null)
  const [customerPhone, setCustomerPhone] = useState<string | null>(null)
  const [customerAvatar, setCustomerAvatar] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // 🔍 লাইভ সার্চের জন্য স্টেট সমূহ
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // মোবাইল স্ক্রিন ট্র্যাক করার হুক
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    function updateCustomer() {
      setCustomerName(localStorage.getItem('customer_name'))
      setCustomerPhone(localStorage.getItem('customer_phone'))
      setCustomerAvatar(localStorage.getItem('customer_avatar'))
    }
    updateCustomer()
    window.addEventListener('storage', updateCustomer)
    window.addEventListener('customerLoggedIn', updateCustomer)
    return () => {
      window.removeEventListener('storage', updateCustomer)
      window.removeEventListener('customerLoggedIn', updateCustomer)
    }
  }, [])

  // 🔍 টাইপ করার সাথে সাথে সুপাবেস থেকে লাইভ সার্চ করার লজিক
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,name_bn.ilike.%${searchQuery}%`)
        .limit(6)

      if (data) setSearchResults(data)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  // 🔍 সার্চ বক্সের বাইরে ক্লিক করলে পপআপ ড্রপডাউন বন্ধ করার লজিক
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
   <>
    <div style={{ background: PINK, color: 'white', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>

      {/* বাম দিক (মেনু ও লোগো) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <button onClick={onMenuClick} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '4px' }}>☰</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={LOGO_URL} alt="লোগো" style={{ height: '36px', width: 'auto', borderRadius: '6px' }} />
        </div>
      </div>

      {/* 🔍 মাঝখানে: লাইভ সার্চ বক্স সেকশন */}
      <div ref={searchRef} style={{ flex: 1, maxWidth: '500px', margin: '0 20px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '10px', padding: '4px 12px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="কাঙ্ক্ষিত পণ্যটি সার্চ করুন..." 
            style={{ width: '100%', border: 'none', background: 'none', outline: 'none', fontSize: '14px', padding: '6px 0', color: '#1f2937' }}
          />
          <span style={{ color: '#9ca3af', fontSize: '16px', marginLeft: '8px' }}>🔍</span>
        </div>

        {/* 🔥 ড্রপডাউন পপআপ বক্স (textAlign ফিক্সড করা হয়েছে) */}
        {showDropdown && searchQuery.trim().length > 0 && (
          <div style={{ position: 'absolute', top: '48px', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', overflow: 'hidden', zIndex: 99999 }}>
            {searchResults.length === 0 ? (
              <p style={{ margin: 0, padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>কোনো পণ্য পাওয়া যায়নি! 🔍</p>
            ) : (
              searchResults.map((prod) => (
                <div 
                  key={prod.id}
                  onClick={() => {
                    const event = new CustomEvent('searchProductSelect', { detail: prod })
                    window.dispatchEvent(event)
                    setShowDropdown(false)
                    setSearchQuery('')
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <img src={prod.image_url} alt="" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px', background: '#f9fafb', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#1f2937', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name_bn || prod.name}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: 'bold', color: '#db2777', textAlign: 'left' }}>৳{prod.price}</p>
                  </div>
                  <span style={{ color: '#d1d5db', fontSize: '12px' }}>➔</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ডান দিক (আইকন ও প্যানেল বাটন সমূহ) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>

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

        <button onClick={onCartClick} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', display: isMobile ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: customerName ? '#fbbf24' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: customerName ? '14px' : '18px', fontWeight: 'bold', color: customerName ? '#111' : 'white' }}>
            {customerAvatar ? <img src={customerAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : customerName ? customerName[0].toUpperCase() : '👤'}
          </div>
          <span style={{ fontSize: '10px' }}>{customerName ? customerName.split(' ')[0] : 'Profile'}</span>
        </button>

        <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', display: isMobile ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '20px' }}>♡</span>
          <span style={{ fontSize: '10px' }}>Wishlist</span>
        </button>

        <div style={{ position: 'relative', display: isMobile ? 'none' : 'block' }}>
          <button onClick={() => setShowProfile(!showProfile)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontSize: '20px' }}>🛒</span>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#fbbf24', color: '#111', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{cartCount}</span>
            )}
            <span style={{ fontSize: '10px' }}>Cart</span>
          </button>

          {/* Sidebar Profiler */}
          {showProfile && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ background: 'white', width: '280px', height: '100%', overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)' }}>
                {customerPhone ? (
                  <>
                    <div style={{ background: PINK, padding: '24px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', background: '#fbbf24', flexShrink: 0 }}>
                        {customerAvatar ? <img src={customerAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#111' }}>{customerName?.[0]?.toUpperCase()}</div>}
                      </div>
                      <div>
                        <p style={{ fontWeight: 'bold', color: 'white', margin: 0, fontSize: '16px' }}>{customerName}</p>
                        <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0', fontSize: '12px' }}>{customerPhone}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {[
                        { icon: '📋', label: 'অর্ডার লিস্ট', onClick: () => { setShowProfile(false); onOrdersClick && onOrdersClick(); } },
                        { icon: '❤️', label: 'আমার Wishlist', onClick: () => setShowProfile(false) },
                        { icon: '📍', label: 'আমার ঠিকানা', onClick: () => setShowProfile(false) },
                        { icon: '👤', label: 'Account তথ্য', onClick: () => setShowProfile(false) },
                      ].map((item, i) => (
                        <button key={i} onClick={item.onClick} style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '18px' }}>{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                      <button onClick={handleLogout} style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', borderTop: '1px solid #e5e7eb', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🚪</span>
                        লগআউট
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                    <p style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>লগইন করুন</p>
                    <button onClick={() => { setShowProfile(false); onCartClick && onCartClick(); }} style={{ background: PINK, color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                      🔑 লগইন করুন
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showProfile && <div onClick={() => setShowProfile(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />}
    </div>

    {/* Mobile Bottom Navigation */}
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e5e7eb', display: isMobile ? 'flex' : 'none', justifyContent: 'space-around', alignItems: 'center', height: '60px', zIndex: 100, boxShadow: '0 -2px 8px rgba(0,0,0,0.08)' }}>
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 16px' }}>
        <span style={{ fontSize: '20px' }}>🏠</span>
        <span style={{ fontSize: '10px', color: '#6b7280' }}>Home</span>
      </button>
      <button onClick={onMenuClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 16px' }}>
        <span style={{ fontSize: '20px' }}>☰</span>
        <span style={{ fontSize: '10px', color: '#6b7280' }}>Category</span>
      </button>
      <button onClick={onCartClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 16px', position: 'relative' }}>
        <span style={{ fontSize: '20px' }}>🛒</span>
        {cartCount > 0 && <span style={{ position: 'absolute', top: '4px', right: '8px', background: '#db2777', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{cartCount}</span>}
        <span style={{ fontSize: '10px', color: '#6b7280' }}>Cart</span>
      </button>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 16px' }}>
        <span style={{ fontSize: '20px' }}>💬</span>
        <a href="https://wa.me/8801872149655" target="_blank" rel="noreferrer" style={{ fontSize: '10px', color: '#6b7280', textDecoration: 'none' }}>Live Chat</a>
      </button>
      <button onClick={() => setShowProfile(!showProfile)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 16px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', background: customerName ? '#fbbf24' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: customerName ? '12px' : '16px', fontWeight: 'bold', color: customerName ? '#111' : '#6b7280' }}>
          {customerAvatar ? <img src={customerAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : customerName ? customerName[0].toUpperCase() : '👤'}
        </div>
        <span style={{ fontSize: '10px', color: '#6b7280' }}>Profile</span>
      </button>
    </div>
   </>
  )
}