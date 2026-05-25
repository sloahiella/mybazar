'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
)

function SellerPageProducts({ seller, pageId, onBack }: { seller: any; pageId: number; onBack: () => void }) {
  const [products, setProducts] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productForm, setProductForm] = useState({ name: '', price: '', unit: 'pcs', description: '', stock: '' })
  const [uploading, setUploading] = useState(false)
  const [productImage, setProductImage] = useState('')
  const [pageName, setPageName] = useState('')

  useEffect(() => {
    fetchProducts()
    fetchPageName()
  }, [pageId])

  async function fetchPageName() {
    const { data } = await supabase.from('pages').select('name, name_bn').eq('id', pageId).single()
    if (data) setPageName(data.name_bn || data.name)
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*, stock(*), product_images(*)').eq('page_id', pageId).eq('seller_id', seller.id).eq('is_active', true).order('sort_order', { ascending: true })
    if (data) setProducts(data)
  }

  async function uploadImage(e: any) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('products').upload(fileName, file);
    if (error) { alert('Error: ' + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
    setProductImage(urlData.publicUrl);
    setUploading(false);
  }

  async function addProduct() {
    if (!productForm.name || !productForm.price) { alert('Name and price required!'); return; }
    const { data: branchData } = await supabase.from('pages').select('branch_id').eq('id', pageId).single()
    const { data: inserted } = await supabase.from('products').insert({
      name: productForm.name,
      price_per_unit: parseFloat(productForm.price),
      unit: productForm.unit,
      description: productForm.description,
      image_url: productImage,
      page_id: pageId,
      branch_id: branchData?.branch_id,
      seller_id: seller.id,
      is_active: true,
      product_code: `${Date.now()}`,
      sort_order: 9999
    }).select().single()
    if (inserted && productForm.stock) {
      await supabase.from('stock').insert({ product_id: inserted.id, quantity: parseFloat(productForm.stock) })
    }
    setProductForm({ name: '', price: '', unit: 'pcs', description: '', stock: '' })
    setProductImage('')
    setShowAddModal(false)
    fetchProducts()
  }

  async function deleteProduct(id: number) {
    if (!confirm('Delete this product?')) return;
    await supabase.from('stock').delete().eq('product_id', id)
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  return (
    <div>
     <div style={{ background: '#db2777', color: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}>←</button>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, flex: 1 }}>{pageName}</h2>
        <button onClick={() => setShowAddModal(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}>+ পণ্য যোগ</button>
      </div>

      {products.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>কোনো পণ্য নেই</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', padding: '12px' }}>
        {products.map(prod => (
          <div key={prod.id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 6px 0' }}>
              <button onClick={() => setEditingProduct(prod)} style={{ background: '#facc15', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', marginRight: '4px' }}>✏️</button>
              <button onClick={() => deleteProduct(prod.id)} style={{ background: '#fee2e2', color: '#dc2626', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>🗑️</button>
            </div>
            {prod.image_url && <img src={prod.image_url} alt={prod.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />}
            <div style={{ padding: '8px', flex: 1 }}>
              <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '13px', margin: '0 0 4px 0' }}>{prod.name}</p>
              <p style={{ color: '#db2777', fontWeight: 'bold', fontSize: '12px', margin: '0 0 4px 0' }}>1 {prod.unit} = {prod.price_per_unit} Tk</p>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 8px 0' }}>Stock: {prod.stock?.[0]?.quantity || 0}</p>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 99999, padding: '16px', paddingTop: '70px', overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>+ নতুন পণ্য যোগ</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>নাম *</label><input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="পণ্যের নাম" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>দাম *</label><input value={productForm.price} type="number" onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="0" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>ইউনিট</label><select value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', background: 'white', color: '#1f2937' }}><option value="pcs">pcs</option><option value="Kg">Kg</option><option value="Liter">Liter</option><option value="packet">Packet</option></select></div>
              <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>প্রধান ছবি</label>
                {productImage && <img src={productImage} alt="preview" style={{ width: '100%', objectFit: 'contain', borderRadius: '8px', marginTop: '8px', maxHeight: '120px' }} />}
                <input type="file" accept="image/*" onChange={uploadImage} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px', width: '100%', fontSize: '13px', marginTop: '8px', boxSizing: 'border-box' }} />
                {uploading && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>আপলোড হচ্ছে...</p>}
              </div>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>Stock (Optional)</label><input value={productForm.stock} type="number" onChange={e => setProductForm({...productForm, stock: e.target.value})} placeholder="0" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>বৈশিষ্ট্য</label><textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={3} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', color: '#1f2937' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '8px', padding: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={addProduct} disabled={uploading} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', flex: 1, fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>+ পণ্য যোগ করুন</button>
              <button onClick={() => setShowAddModal(false)} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '12px', padding: '12px 20px', fontSize: '16px', cursor: 'pointer' }}>বাতিল</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
function SellerProductsTab({ seller, onSelectPage }: { seller: any; onSelectPage: (pageId: number) => void }) {
  const [myPages, setMyPages] = useState<any[]>([])
  const [allPages, setAllPages] = useState<any[]>([])
  const [searchPage, setSearchPage] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
const [newPageName, setNewPageName] = useState('')
const [openMenuId, setOpenMenuId] = useState<any>(null)
const [addProductPageId, setAddProductPageId] = useState<any>(null)
const [productForm, setProductForm] = useState({ name: '', price: '', unit: 'pcs', description: '', stock: '' })
const [uploading, setUploading] = useState(false)
const [productImage, setProductImage] = useState('')
const [myProducts, setMyProducts] = useState<any[]>([])

useEffect(() => { fetchMyProducts() }, [])

async function fetchMyProducts() {
  const { data } = await supabase.from('products').select('*, stock(*)').eq('seller_id', seller.id).eq('is_active', true).order('created_at', { ascending: false })
  if (data) setMyProducts(data)
}

useEffect(() => {
    fetchMyPages()
    fetchAllPages()
  }, [])

  async function fetchMyPages() {
    const { data } = await supabase.from('seller_pages').select('*, pages(name, name_bn)').eq('seller_id', seller.id)
    if (data) setMyPages(data)
  }

  async function fetchAllPages() {
    const { data } = await supabase.from('pages').select('id, name, name_bn').order('name_bn')
    if (data) setAllPages(data)
  }

 async function requestNewPage() {
    if (!newPageName.trim()) return
    await supabase.from('seller_pages').insert({ seller_id: seller.id, page_name: newPageName, status: 'pending' })
    setMsg('✅ নতুন পেজ request পাঠানো হয়েছে! Admin approve করলে দেখাবে।')
    setNewPageName('')
    fetchMyPages()
  }
  async function uploadImage(e: any) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('products').upload(fileName, file);
    if (error) { alert('Error: ' + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
    setProductImage(urlData.publicUrl);
    setUploading(false);
  }

  async function addProduct(pageId: number) {
    if (!productForm.name || !productForm.price) { alert('Name and price required!'); return; }
    const { data: branchData } = await supabase.from('pages').select('branch_id').eq('id', pageId).single()
  const { data: inserted } = await supabase.from('products').insert({
      name: productForm.name,
      price_per_unit: parseFloat(productForm.price),
      unit: productForm.unit,
      description: productForm.description,
      image_url: productImage,
      page_id: pageId,
      branch_id: branchData?.branch_id,
      seller_id: seller.id,
      is_active: true,
      product_code: `${Date.now()}`,
      sort_order: 9999
    }).select().single()
   if (inserted && productForm.stock) {
      await supabase.from('stock').insert({ product_id: inserted.id, quantity: parseFloat(productForm.stock) })
    }
    setMsg('✅ Product added successfully!')
   setProductForm({ name: '', price: '', unit: 'pcs', description: '', stock: '' })
    setProductImage('')
    fetchMyProducts()
    setAddProductPageId(null)
  }
  async function requestPage(pageId: number) {
    const already = myPages.find(p => String(p.page_id) === String(pageId))
    if (already) { setMsg('এই পেজে আগেই যোগ করা হয়েছে!'); return; }
    await supabase.from('seller_pages').insert({ seller_id: seller.id, page_id: pageId, status: 'approved' })
    setMsg('✅ পেজ যোগ হয়েছে!')
    fetchMyPages()
  }

  const filteredPages = allPages.filter(p =>
    (p.name_bn || p.name).toLowerCase().includes(searchPage.toLowerCase())
  )

  return (
    <div style={{ padding: '16px' }}>
      <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#111', margin: '0 0 12px 0' }}>📋 আমার পেজ লিস্ট</p>
      {myPages.length === 0 && <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '16px' }}>কোনো পেজ নেই</p>}
     {myProducts.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#111', margin: '0 0 8px 0' }}>📦 আমার প্রোডাক্ট ({myProducts.length})</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {myProducts.map(prod => (
              <div key={prod.id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', padding: '6px 6px 0' }}>
                  <button onClick={async () => { if (!confirm('Delete this product?')) return; await supabase.from('stock').delete().eq('product_id', prod.id); await supabase.from('products').delete().eq('id', prod.id); fetchMyProducts(); }} style={{ background: '#fee2e2', color: '#dc2626', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>🗑️</button>
                </div>
                {prod.image_url && <img src={prod.image_url} alt={prod.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />}
                <div style={{ padding: '8px', flex: 1 }}>
                  <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '13px', margin: '0 0 4px 0', lineHeight: 1.4 }}>{prod.name}</p>
                  <p style={{ color: '#db2777', fontWeight: 'bold', fontSize: '12px', margin: '0 0 4px 0' }}>৳{prod.price_per_unit}/{prod.unit}</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Stock: {prod.stock?.[0]?.quantity || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {myPages.map(p => (
     <div key={p.id} style={{ background: '#f9fafb', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb' }}>
        <p onClick={() => onSelectPage(p.page_id || p.id)} style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#111', flex: 1, cursor: 'pointer' }}>{p.pages?.name_bn || p.pages?.name || p.page_name || 'Unknown'}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: p.status === 'approved' ? '#dcfce7' : '#fef9c3', color: p.status === 'approved' ? '#15803d' : '#854d0e' }}>
              {p.status === 'approved' ? '✅ Approved' : '⏳ Pending'}
            </span>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6b7280', padding: '2px 6px' }}>⋯</button>
              {openMenuId === p.id && (
                <div style={{ position: 'absolute', right: 0, top: '28px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '140px' }}>
                <button onClick={() => { setOpenMenuId(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#1f2937', borderBottom: '1px solid #f3f4f6' }}>📁 Add Sub Page</button>
                  <button onClick={async () => { setOpenMenuId(null); if (!confirm('Are you sure you want to delete this page?')) return; await supabase.from('seller_pages').delete().eq('id', p.id); fetchMyPages(); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#dc2626' }}>🗑️ Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

     {addProductPageId && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 99999, padding: '16px', paddingTop: '70px', overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>+ New Product</h2>
              <button onClick={() => setAddProductPageId(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>Name *</label><input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="Product name" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>Price *</label><input value={productForm.price} type="number" onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="0" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>Unit</label><select value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', background: 'white', color: '#1f2937' }}><option value="pcs">pcs</option><option value="Kg">Kg</option><option value="Liter">Liter</option><option value="packet">Packet</option></select></div>
              <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>Product Image</label>
                {productImage && <img src={productImage} alt="preview" style={{ width: '100%', objectFit: 'contain', borderRadius: '8px', marginTop: '8px', maxHeight: '120px' }} />}
                <input type="file" accept="image/*" onChange={uploadImage} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px', width: '100%', fontSize: '13px', marginTop: '8px', boxSizing: 'border-box' }} />
                {uploading && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>Uploading...</p>}
              </div>
             <div><label style={{ fontSize: '12px', color: '#6b7280' }}>Stock (Optional)</label><input value={productForm.stock} type="number" onChange={e => setProductForm({...productForm, stock: e.target.value})} placeholder="0" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>Description</label><textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={3} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', color: '#1f2937' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '8px', padding: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => addProduct(addProductPageId)} disabled={uploading} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', flex: 1, fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>+ Add Product</button>
              <button onClick={() => setAddProductPageId(null)} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '12px', padding: '12px 20px', fontSize: '16px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#111', margin: '16px 0 8px 0' }}>🔍 পেজ খুঁজুন ও যোগ করুন</p>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', marginTop: '12px' }}>
        <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#15803d', margin: '0 0 8px 0' }}>➕ নতুন পেজ request করুন</p>
        <input value={newPageName} onChange={e => setNewPageName(e.target.value)} placeholder="নতুন পেজের নাম লিখুন..."
          style={{ border: '2px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '13px', outline: 'none', marginBottom: '8px', boxSizing: 'border-box', color: '#1f2937' }} />
        <button onClick={requestNewPage} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', width: '100%' }}>Request পাঠান</button>
      </div>
      <input value={searchPage} onChange={e => setSearchPage(e.target.value)} placeholder="পেজের নাম লিখুন..."
        style={{ border: '2px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '13px', outline: 'none', marginBottom: '8px', boxSizing: 'border-box', color: '#1f2937' }} />
      {msg && <p style={{ fontSize: '13px', color: '#16a34a', marginBottom: '8px' }}>{msg}</p>}
      {filteredPages.map(p => (
        <div key={p.id} style={{ background: 'white', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#111' }}>{p.name_bn || p.name}</p>
          <button onClick={() => requestPage(p.id)} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>+ Request</button>
        </div>
      ))}
    </div>
  )
}
export default function SellerPanel({ seller, onClose, isAdmin }: { seller: any; onClose: () => void; isAdmin?: boolean }) {
 const [tab, setTab] = useState('menu')
 const [selectedSellerPage, setSelectedSellerPage] = useState<any>(null)

useEffect(() => {
  if (isAdmin) setTab('orders')
}, [isAdmin])
  const [orders, setOrders] = useState<any[]>([])
  const [dateFilter, setDateFilter] = useState('today')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    if (tab === 'orders') fetchOrders()
  }, [tab, dateFilter])

  async function fetchOrders() {
    const { data: items } = await supabase
      .from('order_items')
      .select('*, products:product_id(name, image_url, unit)')
      .eq('seller_id', seller.id)
      .order('created_at', { ascending: false })
    if (!items) return
    const orderIds = items.map((i: any) => i.order_id)
    const { data: ords } = await supabase.from('orders').select('*').in('id', orderIds)
    const merged = items.map((item: any) => ({
      ...item,
      order: ords?.find((o: any) => String(o.id) === String(item.order_id))
    }))
    const now = new Date()
    const filtered = merged.filter((item: any) => {
      const d = new Date(item.order?.created_at)
      if (dateFilter === 'today') return d.toDateString() === now.toDateString()
      if (dateFilter === 'yesterday') {
        const y = new Date(now); y.setDate(y.getDate() - 1)
        return d.toDateString() === y.toDateString()
      }
      if (dateFilter === 'week') {
        const w = new Date(now); w.setDate(w.getDate() - 7)
        return d >= w
      }
      if (dateFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      return true
    })
    setOrders(filtered)
  }

  const filteredOrders = search
    ? orders.filter(o =>
        o.order?.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.order?.customer_phone?.includes(search) ||
        String(o.order_id).includes(search))
    : orders

  const totalEarning = filteredOrders.reduce((a: number, o: any) => a + (o.price * o.quantity), 0)
  const totalOrders = new Set(filteredOrders.map((o: any) => o.order_id)).size

  const content = (
    <>
      <div style={{ background: '#16a34a', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {tab !== 'menu' && !isAdmin && (
            <button onClick={() => setTab('menu')} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>←</button>
          )}
          <h2 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>🏪 {seller.shop_name}</h2>
        </div>
        {!isAdmin && <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>✕</button>}
      </div>

      {tab === 'menu' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div onClick={() => setTab('orders')} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', cursor: 'pointer' }}>
            <span style={{ fontSize: '24px' }}>🛒</span>
            <div>
              <p style={{ fontWeight: 'bold', margin: 0, color: '#111' }}>অর্ডার</p>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>অর্ডার দেখুন</p>
            </div>
          </div>
          <div onClick={() => setTab('products')} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', cursor: 'pointer' }}>
            <span style={{ fontSize: '24px' }}>📦</span>
            <div>
              <p style={{ fontWeight: 'bold', margin: 0, color: '#111' }}>প্রোডাক্ট ও পেজ</p>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>পেজ ও প্রোডাক্ট ম্যানেজ করুন</p>
            </div>
          </div>
          <a href="/seller/wallet" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', textDecoration: 'none', color: '#111' }}>
            <span style={{ fontSize: '24px' }}>💰</span>
            <div>
              <p style={{ fontWeight: 'bold', margin: 0, color: '#111' }}>ওয়ালেট</p>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>আয় দেখুন</p>
            </div>
          </a>
          <a href="/seller/withdraw" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', textDecoration: 'none', color: '#111' }}>
            <span style={{ fontSize: '24px' }}>🏦</span>
            <div>
              <p style={{ fontWeight: 'bold', margin: 0, color: '#111' }}>উত্তোলন</p>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>টাকা তুলুন</p>
            </div>
          </a>
          <a href="/seller/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', textDecoration: 'none', color: '#111' }}>
            <span style={{ fontSize: '24px' }}>🔔</span>
            <div>
              <p style={{ fontWeight: 'bold', margin: 0, color: '#111' }}>নোটিফিকেশন</p>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>নতুন অর্ডার দেখুন</p>
            </div>
          </a>
          <button onClick={async () => { await supabase.auth.signOut(); onClose(); window.location.reload(); }}
            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
            লগআউট
          </button>
        </div>
      )}

{tab === 'products' && (
        <SellerProductsTab seller={seller} onSelectPage={(pageId) => { setSelectedSellerPage(pageId); setTab('sellerpage'); }} />
      )}
      {tab === 'orders' && (
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto' }}>
            {[
              { key: 'today', label: 'আজকে' },
              { key: 'yesterday', label: 'গতকাল' },
              { key: 'week', label: 'এই সপ্তাহ' },
              { key: 'month', label: 'এই মাস' },
            ].map(d => (
              <button key={d.key} onClick={() => setDateFilter(d.key)}
                style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', border: '2px solid', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  borderColor: dateFilter === d.key ? '#16a34a' : '#e5e7eb',
                  background: dateFilter === d.key ? '#16a34a' : 'white',
                  color: dateFilter === d.key ? 'white' : '#374151' }}>
                {d.label}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 নাম, ফোন বা অর্ডার নম্বর..."
            style={{ border: '2px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px', width: '100%', fontSize: '13px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box', color: '#1f2937' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: '#dcfce7', borderRadius: '12px', padding: '12px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
              <p style={{ fontSize: '12px', color: '#15803d', margin: '0 0 4px 0' }}>💰 আয়</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#15803d', margin: 0 }}>৳{totalEarning}</p>
            </div>
            <div style={{ background: '#dbeafe', borderRadius: '12px', padding: '12px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: '12px', color: '#1d4ed8', margin: '0 0 4px 0' }}>📦 অর্ডার</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1d4ed8', margin: 0 }}>{totalOrders} টি</p>
            </div>
          </div>
          {filteredOrders.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0' }}>কোনো অর্ডার নেই</p>}
          {filteredOrders.map((item: any) => (
            <div key={item.id} onClick={() => setSelected(item)}
              style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px', cursor: 'pointer', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {item.products?.image_url && <img src={item.products.image_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px' }} />}
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#111', margin: '0 0 2px 0', fontSize: '13px' }}>{item.products?.name}</p>
                    <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', margin: '0 0 2px 0' }}>৳{item.price * item.quantity}</p>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>অর্ডার #{item.order_id}</p>
                  </div>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold',
                  background: item.order?.status === 'delivered' ? '#dcfce7' : item.order?.status === 'confirmed' ? '#dbeafe' : '#fef9c3',
                  color: item.order?.status === 'delivered' ? '#15803d' : item.order?.status === 'confirmed' ? '#1d4ed8' : '#854d0e' }}>
                  {item.order?.status === 'delivered' ? '✅ ডেলিভারি' : item.order?.status === 'confirmed' ? '✔️ কনফার্ম' : '⏳ পেন্ডিং'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>অর্ডার #{selected.order_id}</h2>
        <button onClick={() => setSelected(null)} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2px 1fr', border: '2px solid #db2777', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '14px', background: '#fdf2f8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <img src="https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/Untitled%20folder/logo.jpg" alt="লোগো" style={{ height: '36px', width: 'auto', borderRadius: '6px' }} />
              <div>
                <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>সোহেল মার্ট</h1>
                <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>মাই বাজার</p>
              </div>
            </div>
            <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>🌐 sohelmart.com</p>
            <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>📱 01872149655</p>
            <p style={{ fontSize: '11px', color: '#374151', margin: '6px 0 2px 0', fontWeight: 'bold' }}>তারিখ: {new Date(selected.order?.created_at).toLocaleDateString('bn-BD')}</p>
            <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0' }}>সময়: {new Date(selected.order?.created_at).toLocaleTimeString('bn-BD')}</p>
          </div>
          <div style={{ background: '#db2777' }} />
          <div style={{ padding: '14px' }}>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1d4ed8', margin: '0 0 6px 0' }}>👤 কাস্টমার তথ্য</p>
            <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>নাম: <strong>{selected.order?.customer_name}</strong></p>
            <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>ফোন: {selected.order?.customer_phone}</p>
            <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>জেলা: {selected.order?.district}, {selected.order?.upazila}</p>
            <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>ঠিকানা: {selected.order?.address}</p>
            <p style={{ fontSize: '11px', color: '#374151', margin: '6px 0 2px 0', fontWeight: 'bold' }}>অর্ডার #: {selected.order_id}</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 4px', marginBottom: '4px', borderBottom: '2px solid #374151' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: 0 }}>পণ্য</p>
          <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: 0 }}>টাকা</p>
        </div>
        <div style={{ borderBottom: '1px dashed #d1d5db', padding: '8px 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 2px 0' }}>{selected.products?.name}</p>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{selected.price} Tk × {selected.quantity} {selected.products?.unit}</p>
            </div>
            {selected.products?.image_url && <img src={selected.products.image_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', margin: '0 8px' }} />}
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>{selected.price * selected.quantity} Tk</p>
          </div>
        </div>
        <div style={{ borderTop: '2px solid #374151', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', margin: 0 }}>সর্বমোট:</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>{selected.price * selected.quantity} Tk</p>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>ধন্যবাদ সোহেল মার্টে কেনাকাটা করার জন্য! 😊</p>
      </div>
      
          </div>
        </div>
      )}
    </>
  )

 if (isAdmin) return <div>{content}</div>

 if (tab === 'sellerpage' && selectedSellerPage) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'white', overflowY: 'auto' }}>
        <SellerPageProducts
          seller={seller}
          pageId={selectedSellerPage}
          onBack={() => setTab('products')}
        />
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'relative', marginLeft: 'auto', width: '100%', maxWidth: '400px', background: 'white', height: '100%', overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)' }}>
        {content}
      </div>
    </div>
  )
}