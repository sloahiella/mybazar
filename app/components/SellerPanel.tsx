'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
)

// ১. প্রোডাক্ট ডিটেইলস মডাল (ক্লিক করলে আসবে)
function ProductDetailModal({ product, onClose }: { product: any; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '15px', width: '90%', maxWidth: '400px', padding: '20px' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ float: 'right', border: 'none', background: '#eee', padding: '5px 10px', borderRadius: '50%' }}>✕</button>
        {product.image_url && <img src={product.image_url} style={{ width: '100%', borderRadius: '10px' }} />}
        <h2 style={{ fontSize: '18px', marginTop: '15px' }}>{product.name}</h2>
        <p style={{ color: '#db2777', fontWeight: 'bold' }}>৳{product.price_per_unit}</p>
      </div>
    </div>
  )
}

function SellerPageProducts({ seller, pageId, onBack }: { seller: any; pageId: number; onBack: () => void }) {
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  useEffect(() => { 
    supabase.from('products').select('*, stock(*)').eq('page_id', pageId).eq('seller_id', seller.id).then(({ data }) => {
      if (data) setProducts(data)
    })
  }, [pageId])

  return (
    <div style={{ background: '#fff' }}>
      <button onClick={onBack} style={{ margin: '10px', padding: '10px', background: '#db2777', color: '#fff', border: 'none', borderRadius: '5px' }}>← ফিরে যান</button>
      <div className="grid grid-cols-2 gap-3 p-4">
        {products.map(prod => (
          <div key={prod.id} 
               onClick={() => setSelectedProduct(prod)} // এখানে ক্লিক করলেই মডাল আসবে
               style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '10px', cursor: 'pointer' }}>
            <img src={prod.image_url} style={{ width: '100%', borderRadius: '5px' }} />
            <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{prod.name}</p>
          </div>
        ))}
      </div>
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  )
}

export default function SellerPanel({ seller }: { seller: any }) {
  const [tab, setTab] = useState('menu')
  const [selectedSellerPage, setSelectedSellerPage] = useState<any>(null)
  const [myPages, setMyPages] = useState<any[]>([])

  useEffect(() => {
    supabase.from('seller_pages').select('*, pages(name, name_bn)').eq('seller_id', seller.id).then(({ data }) => {
      if (data) setMyPages(data)
    })
  }, [])

  if (tab === 'sellerpage' && selectedSellerPage) {
    return <SellerPageProducts seller={seller} pageId={selectedSellerPage} onBack={() => setTab('menu')} />
  }

  return (
    <div style={{ padding: '20px' }}>
        {/* লেখা কালো করা হয়েছে যাতে স্পষ্ট দেখা যায় */}
        <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#000' }}>📋 আমার পেজ সমূহ</h3>
        {myPages.map(p => (
            <div key={p.id} 
                 onClick={() => { setSelectedSellerPage(p.page_id); setTab('sellerpage'); }} 
                 style={{ padding: '15px', background: '#f4f4f4', marginBottom: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#333' }}>
                {p.pages?.name_bn || p.pages?.name}
            </div>
        ))}
    </div>
  )
}