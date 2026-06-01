'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
)

// ১. প্রোডাক্ট ডিটেইলস মডাল
function ProductDetailModal({ product, onClose }: { product: any; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '20px' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ float: 'right', border: 'none', background: '#eee', padding: '5px 10px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        {product.image_url && <img src={product.image_url} style={{ width: '100%', borderRadius: '12px' }} />}
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '15px' }}>{product.name}</h2>
        <p style={{ color: '#db2777', fontWeight: 'bold', fontSize: '18px' }}>৳{product.price_per_unit}</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>{product.description}</p>
      </div>
    </div>
  )
}

function SellerPageProducts({ seller, pageId, onBack }: { seller: any; pageId: number; onBack: () => void }) {
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [pageName, setPageName] = useState('')

  useEffect(() => { 
    supabase.from('products').select('*, stock(*)').eq('page_id', pageId).eq('seller_id', seller.id).eq('is_active', true).then(({ data }) => { if(data) setProducts(data) })
    supabase.from('pages').select('name_bn, name').eq('id', pageId).single().then(({ data }) => { if(data) setPageName(data.name_bn || data.name) })
  }, [pageId])

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ background: '#db2777', color: 'white', padding: '16px', display: 'flex', alignItems: 'center' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <h2 style={{ fontSize: '18px', margin: '0 0 0 15px' }}>{pageName}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
        {products.map(prod => (
          <div key={prod.id} onClick={() => setSelectedProduct(prod)} style={{ background: 'white', borderRadius: '12px', border: '1px solid #eee', cursor: 'pointer', padding: '10px' }}>
            <img src={prod.image_url} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px' }} />
            <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '10px 0 5px' }}>{prod.name}</p>
            <p style={{ color: '#db2777', fontWeight: 'bold' }}>৳{prod.price_per_unit}</p>
          </div>
        ))}
      </div>
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  )
}

export default function SellerPanel({ seller, onClose }: { seller: any; onClose: () => void }) {
  const [tab, setTab] = useState('menu')
  const [selectedSellerPage, setSelectedSellerPage] = useState<any>(null)
  const [myPages, setMyPages] = useState<any[]>([])

  useEffect(() => {
    supabase.from('seller_pages').select('*, pages(name, name_bn)').eq('seller_id', seller.id).then(({ data }) => {
      if (data) setMyPages(data)
    })
  }, [])

  if (tab === 'sellerpage' && selectedSellerPage) {
    return <SellerPageProducts seller={seller} pageId={selectedSellerPage} onBack={() => setTab('products')} />
  }

  return (
    <div style={{ padding: '20px', background: '#fff', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', color: '#000' }}>🏪 {seller.shop_name}</h3>
            <button onClick={onClose} style={{ border: 'none', background: '#eee', padding: '8px 15px', borderRadius: '8px' }}>বন্ধ করুন</button>
        </div>
        
        {/* মেনু বাটনগুলো যা আগে ছিল */}
        <div onClick={() => setTab('orders')} style={{ padding: '15px', background: '#f0fdf4', marginBottom: '10px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #bbf7d0' }}>🛒 অর্ডার সমূহ</div>
        <div onClick={() => setTab('products')} style={{ padding: '15px', background: '#eff6ff', marginBottom: '10px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #bfdbfe' }}>📦 আমার প্রোডাক্ট</div>
        <a href="/seller/wallet" style={{ display: 'block', padding: '15px', background: '#fffbeb', marginBottom: '10px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #fde68a', textDecoration: 'none', color: '#000' }}>💰 ওয়ালেট</a>
        <a href="/seller/withdraw" style={{ display: 'block', padding: '15px', background: '#fef2f2', marginBottom: '10px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #fecaca', textDecoration: 'none', color: '#000' }}>🏦 উত্তোলন</a>
        
        <h3 style={{ fontSize: '16px', color: '#000', marginTop: '20px', marginBottom: '10px' }}>📋 আমার পেজ সমূহ</h3>
        {myPages.map(p => (
            <div key={p.id} 
                 onClick={() => { setSelectedSellerPage(p.page_id); setTab('sellerpage'); }} 
                 style={{ padding: '15px', background: '#f9fafb', marginBottom: '10px', borderRadius: '10px', cursor: 'pointer', color: '#333', border: '1px solid #e5e7eb' }}>
                {p.pages?.name_bn || p.pages?.name}
            </div>
        ))}
    </div>
  )
}