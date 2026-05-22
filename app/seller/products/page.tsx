'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SellerProducts() {
  const router = useRouter()
  const [seller, setSeller] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [features, setFeatures] = useState<string[]>([''])
  const [form, setForm] = useState({
    name: '', name_bn: '', product_code: '', price: '', stock: '',
    unit: 'pcs', category: '', category_bn: '', description: ''
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/seller/login'); return }
    const { data: sellerData } = await supabase.from('sellers').select('*').eq('profile_id', user.id).single()
    if (!sellerData) { router.push('/seller/login'); return }
    setSeller(sellerData)
    fetchProducts(sellerData.id)
    setLoading(false)
  }

  async function fetchProducts(sellerId: string) {
    const { data } = await supabase.from('products').select('*').eq('seller_id', sellerId).order('created_at', { ascending: false })
    if (data) setProducts(data)
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    if (!image) { alert('ছবি দিন!'); return }
    setUploading(true)

    const fileExt = image.name.split('.').pop()
    const fileName = `seller-products/${seller.id}-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('products').upload(fileName, image)
    if (uploadError) { alert('ছবি আপলোড হয়নি!'); setUploading(false); return }

    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName)

    await supabase.from('products').insert({
      name: form.name,
      name_bn: form.name_bn || form.name,
      product_code: form.product_code || null,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
      unit: form.unit,
      category: form.category,
      category_bn: form.category_bn,
      description: form.description,
      features: features.filter(f => f.trim()),
      image_url: urlData.publicUrl,
      seller_id: seller.id,
      is_approved: false
    })

    alert('প্রোডাক্ট যোগ হয়েছে! Admin অ্যাপ্রুভ করলে সাইটে দেখাবে।')
    setForm({ name: '', name_bn: '', product_code: '', price: '', stock: '', unit: 'pcs', category: '', category_bn: '', description: '' })
    setFeatures([''])
    setImage(null)
    setImagePreview('')
    setShowForm(false)
    fetchProducts(seller.id)
    setUploading(false)
  }

  const inp: any = { border: '2px solid #e5e7eb', borderRadius: '8px', padding: '10px', width: '100%', fontSize: '14px', color: '#111', background: '#f9fafb', boxSizing: 'border-box' }

  if (loading) return <p style={{textAlign:'center', marginTop:'40px'}}>লোড হচ্ছে...</p>

  return (
    <div style={{maxWidth:'700px', margin:'40px auto', padding:'20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px', fontWeight:'bold', color:'#111', margin:0}}>📦 আমার প্রোডাক্ট</h1>
        <button onClick={() => setShowForm(!showForm)}
          style={{background:'#16a34a', color:'white', border:'none', borderRadius:'8px', padding:'10px 16px', fontSize:'14px', fontWeight:'bold', cursor:'pointer'}}>
          {showForm ? '✕ বাতিল' : '+ প্রোডাক্ট যোগ'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px', marginBottom:'24px'}}>
          <h2 style={{fontSize:'16px', fontWeight:'bold', color:'#111', marginBottom:'16px'}}>+ নতুন পণ্য যোগ</h2>
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <div>
              <label style={{fontSize:'13px', fontWeight:'bold', color:'#555'}}>নাম *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="প্রোডাক্টের নাম (ইংরেজি)" required style={inp} />
            </div>
            <div>
              <label style={{fontSize:'13px', fontWeight:'bold', color:'#555'}}>বিকল্প নাম</label>
              <input value={form.name_bn} onChange={e => setForm({...form, name_bn: e.target.value})} placeholder="প্রোডাক্টের নাম (বাংলা)" style={inp} />
            </div>
            <div>
              <label style={{fontSize:'13px', fontWeight:'bold', color:'#555'}}>পণ্য কোড <span style={{color:'#9ca3af', fontWeight:'normal'}}>(ঐচ্ছিক)</span></label>
              <input value={form.product_code} onChange={e => setForm({...form, product_code: e.target.value})} placeholder="যেমন: 1234" style={inp} />
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
              <div>
                <label style={{fontSize:'13px', fontWeight:'bold', color:'#555'}}>দাম *</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="দাম" required style={inp} />
              </div>
              <div>
                <label style={{fontSize:'13px', fontWeight:'bold', color:'#555'}}>ইউনিট</label>
                <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} style={inp}>
                  <option value="Kg">Kg</option>
                  <option value="Liter">Liter</option>
                  <option value="pcs">pcs</option>
                  <option value="Packet">Packet</option>
                </select>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
              <div>
                <label style={{fontSize:'13px', fontWeight:'bold', color:'#555'}}>ক্যাটাগরি (ইং)</label>
                <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Category" style={inp} />
              </div>
              <div>
                <label style={{fontSize:'13px', fontWeight:'bold', color:'#555'}}>ক্যাটাগরি (বাং)</label>
                <input value={form.category_bn} onChange={e => setForm({...form, category_bn: e.target.value})} placeholder="ক্যাটাগরি" style={inp} />
              </div>
            </div>
            <div>
              <label style={{fontSize:'13px', fontWeight:'bold', color:'#555'}}>প্রাথমিক স্টক</label>
              <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="স্টক পরিমাণ" style={inp} />
            </div>
            <div>
              <label style={{fontSize:'13px', fontWeight:'bold', color:'#555'}}>প্রধান ছবি *</label>
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files?.[0]
                if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)) }
              }} style={{...inp, padding:'6px'}} />
              {imagePreview && <img src={imagePreview} alt="" style={{width:'100px', height:'100px', objectFit:'contain', marginTop:'8px', borderRadius:'8px'}} />}
            </div>
            <div>
              <label style={{fontSize:'13px', fontWeight:'bold', color:'#555'}}>বৈশিষ্ট্য</label>
              {features.map((f, i) => (
                <div key={i} style={{display:'flex', gap:'8px', marginBottom:'6px'}}>
                  <input value={f} onChange={e => { const arr = [...features]; arr[i] = e.target.value; setFeatures(arr) }}
                    placeholder={`বৈশিষ্ট্য ${i + 1}`} style={inp} />
                  {features.length > 1 && (
                    <button type="button" onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                      style={{background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'8px', padding:'8px 12px', cursor:'pointer'}}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setFeatures([...features, ''])}
                style={{background:'#f3f4f6', color:'#374151', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', cursor:'pointer'}}>
                + বৈশিষ্ট্য যোগ
              </button>
            </div>
            <div style={{display:'flex', gap:'8px'}}>
              <button type="submit" disabled={uploading}
                style={{flex:1, background: uploading ? '#9ca3af' : '#16a34a', color:'white', border:'none', borderRadius:'8px', padding:'12px', fontSize:'16px', fontWeight:'bold', cursor:'pointer'}}>
                {uploading ? 'আপলোড হচ্ছে...' : '+ পণ্য যোগ করুন'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{background:'#e5e7eb', color:'#374151', border:'none', borderRadius:'8px', padding:'12px 16px', fontSize:'14px', cursor:'pointer'}}>
                বাতিল
              </button>
            </div>
          </div>
        </form>
      )}

      {products.length === 0 && !showForm && (
        <p style={{color:'#888', textAlign:'center'}}>এখনো কোনো প্রোডাক্ট নেই</p>
      )}

      {products.map((product) => (
        <div key={product.id} style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px', marginBottom:'12px', display:'flex', gap:'12px', alignItems:'center'}}>
          {product.image_url && <img src={product.image_url} alt="" style={{width:'60px', height:'60px', objectFit:'contain', borderRadius:'8px'}} />}
          <div style={{flex:1}}>
            <p style={{fontWeight:'bold', color:'#111', margin:'0 0 4px 0'}}>{product.name}</p>
            <p style={{fontSize:'13px', color:'#16a34a', fontWeight:'bold', margin:'0 0 2px 0'}}>৳{product.price}</p>
            <p style={{fontSize:'12px', color:'#888', margin:0}}>স্টক: {product.stock} {product.unit}</p>
          </div>
          <span style={{
            fontSize:'12px', padding:'4px 10px', borderRadius:'20px', fontWeight:'bold',
            background: product.is_approved ? '#dcfce7' : '#fef9c3',
            color: product.is_approved ? '#15803d' : '#854d0e'
          }}>
            {product.is_approved ? '✅ অ্যাপ্রুভড' : '⏳ অপেক্ষমান'}
          </span>
        </div>
      ))}
    </div>
  )
}
