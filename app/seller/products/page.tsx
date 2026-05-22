'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SellerProducts() {
  const router = useRouter()
  const [seller, setSeller] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ product_id: '', price: '', stock: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/seller/login'); return }

    const { data: sellerData } = await supabase
      .from('sellers')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (!sellerData) { router.push('/seller/login'); return }
    setSeller(sellerData)

    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true })
    if (productData) setAllProducts(productData)

    const { data: listingData } = await supabase
      .from('product_listings')
      .select('*, products(name, image_url)')
      .eq('seller_id', sellerData.id)
    if (listingData) setProducts(listingData)

    setLoading(false)
  }

  async function handleAdd(e: any) {
    e.preventDefault()
    setAdding(true)

    await supabase.from('product_listings').insert({
      product_id: parseInt(form.product_id),
      seller_id: seller.id,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      is_active: true,
    })

    setForm({ product_id: '', price: '', stock: '' })
    const { data } = await supabase
      .from('product_listings')
      .select('*, products(name, image_url)')
      .eq('seller_id', seller.id)
    if (data) setProducts(data)
    setAdding(false)
  }

  async function deleteListing(id: number) {
    await supabase.from('product_listings').delete().eq('id', id)
    setProducts(products.filter((p) => p.id !== id))
  }

  const filteredProducts = allProducts.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const inp: any = { border: '2px solid #aaa', padding: '10px', borderRadius: '6px', fontSize: '15px', color: '#111', background: '#f9f9f9', width: '100%', boxSizing: 'border-box' }

  if (loading) return <p style={{textAlign:'center', marginTop:'40px'}}>লোড হচ্ছে...</p>

  return (
    <div style={{maxWidth:'700px', margin:'40px auto', padding:'20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px', fontWeight:'bold', color:'#111', margin:0}}>📦 আমার প্রোডাক্ট</h1>
        <button onClick={() => router.push('/seller/dashboard')}
          style={{background:'#e5e7eb', color:'#374151', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'14px', cursor:'pointer'}}>
          ← ড্যাশবোর্ড
        </button>
      </div>

      {/* প্রোডাক্ট যোগ করুন */}
      <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px', marginBottom:'24px'}}>
        <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111', marginBottom:'16px'}}>➕ প্রোডাক্ট যোগ করুন</h2>
        
        <input placeholder="🔍 প্রোডাক্ট খুঁজুন..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{...inp, marginBottom:'12px'}} />

        <form onSubmit={handleAdd} style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <select value={form.product_id} onChange={(e) => setForm({...form, product_id: e.target.value})} required style={inp}>
            <option value="">প্রোডাক্ট সিলেক্ট করুন</option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <input name="price" type="number" placeholder="আপনার দাম (৳)" value={form.price}
            onChange={(e) => setForm({...form, price: e.target.value})} required style={inp} />

          <input name="stock" type="number" placeholder="স্টক (কতটা আছে)" value={form.stock}
            onChange={(e) => setForm({...form, stock: e.target.value})} required style={inp} />

          <button type="submit" disabled={adding}
            style={{background:'#16a34a', color:'#fff', padding:'12px', borderRadius:'6px', fontSize:'16px', fontWeight:'bold', border:'none', cursor:'pointer'}}>
            {adding ? 'যোগ হচ্ছে...' : '✅ যোগ করুন'}
          </button>
        </form>
      </div>

      {/* আমার লিস্টিং */}
      <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111', marginBottom:'12px'}}>📋 আমার লিস্টিং</h2>
      
      {products.length === 0 && (
        <p style={{color:'#888', textAlign:'center'}}>এখনো কোনো প্রোডাক্ট যোগ করেননি</p>
      )}

      {products.map((listing) => (
        <div key={listing.id} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px', marginBottom:'12px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            {listing.products?.image_url && (
              <img src={listing.products.image_url} alt="" style={{width:'50px', height:'50px', objectFit:'contain', borderRadius:'8px'}} />
            )}
            <div>
              <p style={{fontWeight:'bold', color:'#111', margin:'0 0 4px 0'}}>{listing.products?.name}</p>
              <p style={{fontSize:'14px', color:'#16a34a', margin:'0 0 2px 0', fontWeight:'bold'}}>৳{listing.price}</p>
              <p style={{fontSize:'13px', color:'#888', margin:0}}>স্টক: {listing.stock}টি</p>
            </div>
          </div>
          <button onClick={() => deleteListing(listing.id)}
            style={{background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:'8px', padding:'8px 12px', fontSize:'14px', cursor:'pointer', fontWeight:'bold'}}>
            🗑️ মুছুন
          </button>
        </div>
      ))}
    </div>
  )
}