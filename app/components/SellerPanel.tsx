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
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [pageName, setPageName] = useState('')

  useEffect(() => { fetchProducts(); fetchPageName(); }, [pageId])

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
    if (!productForm.name || !productForm.price) { alert('নাম এবং দাম আবশ্যক!'); return; }
    const { data: branchData } = await supabase.from('pages').select('branch_id').eq('id', pageId).single()
    const { data: inserted } = await supabase.from('products').insert({
      name: productForm.name, price_per_unit: parseFloat(productForm.price), unit: productForm.unit,
      description: productForm.description, image_url: productImage, page_id: pageId,
      branch_id: branchData?.branch_id, seller_id: seller.id, is_active: true,
      product_code: `${Date.now()}`, sort_order: 9999
    }).select().single()
    if (inserted && productForm.stock) {
      await supabase.from('stock').insert({ product_id: inserted.id, quantity: parseFloat(productForm.stock) })
    }
    setProductForm({ name: '', price: '', unit: 'pcs', description: '', stock: '' })
    setProductImage(''); setShowAddModal(false); fetchProducts()
  }

  async function deleteProduct(id: number) {
    if (!confirm('পণ্য মুছে দেবেন?')) return;
    await supabase.from('stock').delete().eq('product_id', id)
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }
async function handleDrop(toIndex: number) {
    if (dragIndex === null || dragIndex === toIndex) { setDragIndex(null); setDragOverIndex(null); return; }
    const items = [...products]
    const [removed] = items.splice(dragIndex, 1)
    items.splice(toIndex, 0, removed)
    setProducts(items)
    setDragIndex(null); setDragOverIndex(null)
    for (let i = 0; i < items.length; i++) {
      await supabase.from('products').update({ sort_order: i }).eq('id', items[i].id)
    }
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
       {products.map((prod, index) => (
         <div key={prod.id} 
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={e => { e.preventDefault(); if (dragIndex !== null && dragIndex !== index) setDragOverIndex(index); }}
            onDrop={e => { e.preventDefault(); handleDrop(index); }}
            style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden', border: dragOverIndex === index ? '2px solid #db2777' : '1px solid #e5e7eb', opacity: dragIndex === index ? 0.5 : 1, display: 'flex', flexDirection: 'column', cursor: 'grab' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 6px 0' }}>
              <button onClick={() => setEditingProduct(prod)} style={{ background: '#facc15', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', marginRight: '4px' }}>✏️</button>
              <button onClick={() => deleteProduct(prod.id)} style={{ background: '#fee2e2', color: '#dc2626', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>🗑️</button>
            </div>
           {prod.image_url && (
              <div style={{ position: 'relative' }}>
                <img src={prod.image_url} alt={prod.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', display: 'block', background: '#f9fafb', opacity: (prod.stock?.[0]?.quantity || 0) <= 0 ? 0.4 : 1 }} />
                {(prod.stock?.[0]?.quantity || 0) <= 0 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: '900', padding: '4px 10px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(239,68,68,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔴 স্টক আউট</span>
                  </div>
                )}
              </div>
            )}
            <div style={{ padding: '8px', flex: 1 }}>
              <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '13px', margin: '0 0 4px 0' }}>{prod.name}</p>
             <p style={{ color: '#db2777', fontWeight: 'bold', fontSize: '15px', margin: '0 0 4px 0' }}>1 {prod.unit} = {prod.price_per_unit} Tk</p>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Stock: {prod.stock?.[0]?.quantity || 0}</p>
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
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>Stock</label><input value={productForm.stock} type="number" onChange={e => setProductForm({...productForm, stock: e.target.value})} placeholder="0" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>বিবরণ</label><textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={3} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', color: '#1f2937' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '8px', padding: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={addProduct} disabled={uploading} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', flex: 1, fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>+ পণ্য যোগ করুন</button>
              <button onClick={() => setShowAddModal(false)} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '12px', padding: '12px 20px', fontSize: '16px', cursor: 'pointer' }}>বাতিল</button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 99999, padding: '16px', paddingTop: '70px', overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>✏️ পণ্য Edit</h2>
              <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>নাম *</label><input defaultValue={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>দাম *</label><input type="number" defaultValue={editingProduct.price_per_unit} onChange={e => setEditingProduct({...editingProduct, price_per_unit: parseFloat(e.target.value)})} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>ইউনিট</label><select defaultValue={editingProduct.unit} onChange={e => setEditingProduct({...editingProduct, unit: e.target.value})} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', background: 'white', color: '#1f2937' }}><option value="pcs">pcs</option><option value="Kg">Kg</option><option value="Liter">Liter</option><option value="packet">Packet</option></select></div>
              <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>প্রধান ছবি পরিবর্তন</label>
                {editingProduct.image_url && <img src={editingProduct.image_url} alt="preview" style={{ width: '100%', objectFit: 'contain', borderRadius: '8px', marginTop: '8px', maxHeight: '120px' }} />}
                <input type="file" accept="image/*" onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const fileName = `${Date.now()}-${file.name}`;
                  const { error } = await supabase.storage.from('products').upload(fileName, file);
                  if (error) { alert('Error: ' + error.message); return; }
                  const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
                  setEditingProduct({...editingProduct, image_url: urlData.publicUrl});
                }} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px', width: '100%', fontSize: '13px', marginTop: '8px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '12px' }}>
                <label style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 'bold' }}>অতিরিক্ত ছবি</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {(editingProduct.product_images || []).map((img: any, i: number) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img.image_url} alt="" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                      <button onClick={async () => {
                        await supabase.from('product_images').delete().eq('id', img.id);
                        fetchProducts();
                        setEditingProduct({...editingProduct, product_images: editingProduct.product_images.filter((_: any, j: number) => j !== i)});
                      }} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  ))}
                </div>
                <input type="file" accept="image/*" onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const fileName = `${Date.now()}-${file.name}`;
                  const { error } = await supabase.storage.from('products').upload(fileName, file);
                  if (error) { alert('Error: ' + error.message); return; }
                  const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
                  await supabase.from('product_images').insert({ product_id: editingProduct.id, image_url: urlData.publicUrl });
                  fetchProducts();
                  setEditingProduct({...editingProduct, product_images: [...(editingProduct.product_images || []), { image_url: urlData.publicUrl }]});
                }} style={{ border: '2px solid #bfdbfe', borderRadius: '8px', padding: '8px', width: '100%', fontSize: '13px', marginTop: '8px', boxSizing: 'border-box' }} />
              </div>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>ডিসকাউন্ট %</label><input type="number" defaultValue={editingProduct.discount_percent || ''} onChange={e => setEditingProduct({...editingProduct, discount_percent: parseFloat(e.target.value)})} placeholder="যেমন: 10, 20" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} /></div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280' }}>সাইজ</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {['S','M','L','XL','XXL','Free Size'].map(size => {
                    const selected = (editingProduct.sizes || []).includes(size);
                    return (
                      <button key={size} type="button" onClick={() => {
                        const current = editingProduct.sizes || [];
                        const updated = selected ? current.filter((s: string) => s !== size) : [...current, size];
                        setEditingProduct({...editingProduct, sizes: updated});
                      }} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '2px solid', cursor: 'pointer', borderColor: selected ? '#db2777' : '#e5e7eb', background: selected ? '#db2777' : 'white', color: selected ? 'white' : '#374151' }}>{size}</button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280' }}>নতুন স্টক</label>
                <input type="number" placeholder="নতুন স্টক লিখুন" onChange={e => setEditingProduct({...editingProduct, newStock: e.target.value})} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} />
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0 0' }}>বর্তমান স্টক: {editingProduct.stock?.[0]?.quantity || 0} pcs</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '12px', color: '#6b7280' }}>Status:</label>
                <button type="button" onClick={() => setEditingProduct({...editingProduct, is_active: !editingProduct.is_active})} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '2px solid', cursor: 'pointer', borderColor: editingProduct.is_active ? '#16a34a' : '#e5e7eb', background: editingProduct.is_active ? '#dcfce7' : '#f3f4f6', color: editingProduct.is_active ? '#16a34a' : '#9ca3af' }}>{editingProduct.is_active ? '✅ Active' : '❌ Inactive'}</button>
              </div>
              <div><label style={{ fontSize: '12px', color: '#6b7280' }}>বিবরণ</label><textarea defaultValue={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} rows={3} style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', color: '#1f2937' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '8px', padding: '16px', borderTop: '1px solid #e5e7eb' }}>
             <button onClick={async () => {
                const { error } = await supabase.from('products').update({
                  name: editingProduct.name,
                  price_per_unit: editingProduct.price_per_unit,
                  unit: editingProduct.unit,
                  description: editingProduct.description,
                  image_url: editingProduct.image_url,
                  discount_percent: editingProduct.discount_percent || 0,
                  is_active: editingProduct.is_active,
                }).eq('id', editingProduct.id);
                if (error) { alert('সমস্যা: ' + error.message); return; }
                if (editingProduct.newStock !== undefined && editingProduct.newStock !== '') {
                  const newQty = parseFloat(editingProduct.newStock);
                  const { data: existingStock } = await supabase.from('stock').select('*').eq('product_id', editingProduct.id).single();
                  if (existingStock) {
                    const { error: stockError } = await supabase.from('stock').update({ quantity: newQty }).eq('product_id', editingProduct.id);
                    if (stockError) { alert('স্টক সমস্যা: ' + stockError.message); return; }
                  } else {
                    const { error: stockError } = await supabase.from('stock').insert({ product_id: editingProduct.id, quantity: newQty });
                    if (stockError) { alert('স্টক সমস্যা: ' + stockError.message); return; }
                  }
                }
                setEditingProduct(null); fetchProducts();
              }} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', flex: 1, fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>সেভ করুন</button>
              <button onClick={() => setEditingProduct(null)} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '12px', padding: '12px 20px', fontSize: '16px', cursor: 'pointer' }}>বাতিল</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SellerProductsTab({ seller, onSelectPage }: { seller: any; onSelectPage: (pageId: number) => void }) {
  const [myPages, setMyPages] = useState<any[]>([])
  const [msg, setMsg] = useState('')
  const [newPageName, setNewPageName] = useState('')

  useEffect(() => { fetchMyPages(); }, [])

  async function fetchMyPages() {
    const { data } = await supabase.from('seller_pages').select('*, pages(name, name_bn)').eq('seller_id', seller.id).eq('status', 'approved')
    if (data) setMyPages(data)
  }

  async function requestNewPage() {
    if (!newPageName.trim()) return
    await supabase.from('seller_pages').insert({ seller_id: seller.id, page_name: newPageName, status: 'pending' })
    await supabase.from('notifications').insert({ message: `🏪 ${seller.shop_name} নতুন পেজ request করেছে: "${newPageName}"`, is_read: false, type: 'page_request' })
    setMsg('✅ নতুন পেজ request পাঠানো হয়েছে! Admin approve করলে দেখাবে।')
    setNewPageName(''); fetchMyPages()
  }

  return (
    <div style={{ padding: '16px' }}>
      {myPages.length === 0 && <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px' }}>কোনো পেজ নেই</p>}
      {myPages.map(p => (
        <div key={p.id} onClick={() => onSelectPage(p.page_id || p.id)}
          style={{ background: 'white', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#111' }}>🛍️ {p.pages?.name_bn || p.pages?.name || p.page_name || 'Unknown'}</p>
          <span style={{ fontSize: '20px', color: '#9ca3af' }}>›</span>
        </div>
      ))}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', marginTop: '16px' }}>
        <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#15803d', margin: '0 0 8px 0' }}>➕ নতুন পেজ request করুন</p>
        <input value={newPageName} onChange={e => setNewPageName(e.target.value)} placeholder="পেজের নাম লিখুন..." style={{ border: '2px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', width: '100%', fontSize: '13px', outline: 'none', marginBottom: '8px', boxSizing: 'border-box', color: '#1f2937' }} />
        <button onClick={requestNewPage} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', width: '100%' }}>Request পাঠান</button>
      </div>
      {msg && <p style={{ fontSize: '13px', color: '#16a34a', marginTop: '8px' }}>{msg}</p>}
    </div>
  )
}

export default function SellerPanel({ seller, onClose, isAdmin }: { seller: any; onClose: () => void; isAdmin?: boolean }) {
  const [tab, setTab] = useState('orders')
  const [selectedSellerPage, setSelectedSellerPage] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [dateFilter, setDateFilter] = useState('today')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [autoPrint, setAutoPrint] = useState(false)
  const [newOrderCount, setNewOrderCount] = useState(0)

  useEffect(() => {
    if (tab === 'orders') fetchOrders()
  }, [tab, dateFilter])

  async function fetchOrders() {
    const { data: items } = await supabase.from('order_items').select('*, products:product_id(name, image_url, unit)').eq('seller_id', seller.id).order('created_at', { ascending: false })
    if (!items) return
    const orderIds = items.map((i: any) => i.order_id)
    const { data: ords } = await supabase.from('orders').select('*').in('id', orderIds)
    const merged = items.map((item: any) => ({ ...item, order: ords?.find((o: any) => String(o.id) === String(item.order_id)) }))
    const now = new Date()
    const filtered = merged.filter((item: any) => {
      const d = new Date(item.order?.created_at)
      if (dateFilter === 'today') return d.toDateString() === now.toDateString()
      if (dateFilter === 'yesterday') { const y = new Date(now); y.setDate(y.getDate() - 1); return d.toDateString() === y.toDateString() }
      if (dateFilter === 'week') { const w = new Date(now); w.setDate(w.getDate() - 7); return d >= w }
      if (dateFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      return true
    })
    const lastSeen = localStorage.getItem(`seller_last_seen_${seller.id}`) || '0'
    const newOrders = filtered.filter((o: any) => new Date(o.order?.created_at).getTime() > parseInt(lastSeen))
    setNewOrderCount(newOrders.length)
    setOrders(filtered)
  }

  const filteredOrders = search ? orders.filter(o => o.order?.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.order?.customer_phone?.includes(search) || String(o.order_id).includes(search)) : orders
  const totalEarning = filteredOrders.reduce((a: number, o: any) => a + (o.price * o.quantity), 0)
  const totalOrders = new Set(filteredOrders.map((o: any) => o.order_id)).size

  if (tab === 'sellerpage' && selectedSellerPage) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#ffffff', zIndex: 9999, overflowY: 'auto' }}>
        <SellerPageProducts seller={seller} pageId={selectedSellerPage} onBack={() => setTab('products')} />
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, height: '100%', width: '400px', background: '#ffffff', zIndex: 9999, boxShadow: '-5px 0 15px rgba(0,0,0,0.2)', padding: '20px', overflowY: 'auto', color: '#000000' }}>

      {/* হেডার */}
      <div style={{ background: '#db2777', padding: '15px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#ffffff' }}>🏪 {seller.shop_name}</h2>
        {!isAdmin && <button onClick={onClose} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: '#ffffff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>✕</button>}
      </div>

      {/* তারিখ ফিল্টার */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', overflowX: 'auto' }}>
        {[{ key: 'today', label: 'আজকে' }, { key: 'yesterday', label: 'গতকাল' }, { key: 'week', label: 'এই সপ্তাহ' }, { key: 'month', label: 'এই মাস' }].map(d => (
          <button key={d.key} onClick={() => setDateFilter(d.key)} style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '20px', border: '1px solid', whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', borderColor: dateFilter === d.key ? '#db2777' : '#cccccc', background: dateFilter === d.key ? '#db2777' : '#ffffff', color: dateFilter === d.key ? '#ffffff' : '#000000' }}>{d.label}</button>
        ))}
      </div>

      {/* সার্চ বক্স */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="নাম, ফোন, অর্ডার নম্বর দিয়ে খুঁজুন..." style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #cccccc', borderRadius: '8px', color: '#000000', backgroundColor: '#ffffff', boxSizing: 'border-box', outline: 'none' }} />

      {/* বিক্রয় ও অর্ডার সংখ্যা */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div style={{ padding: '15px', border: '1px solid #fbcfe8', borderRadius: '10px', textAlign: 'center', background: '#fff5f7' }}>
          <p style={{ fontSize: '14px', color: '#db2777', margin: 0, fontWeight: 'bold' }}>💰 Sales</p>
          <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#000000', margin: 0 }}>৳{totalEarning}</p>
        </div>
        <div style={{ padding: '15px', border: '1px solid #bfdbfe', borderRadius: '10px', textAlign: 'center', background: '#eff6ff' }}>
          <p style={{ fontSize: '14px', color: '#2563eb', margin: 0, fontWeight: 'bold' }}>📦 Orders</p>
          <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#000000', margin: 0 }}>{totalOrders} টি</p>
        </div>
      </div>

      {/* অটো প্রিন্ট */}
      <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #dddddd' }}>
        <span style={{ color: '#000000', fontWeight: '600' }}>🖨️ Auto Print</span>
        <button onClick={() => setAutoPrint(!autoPrint)} style={{ background: autoPrint ? '#dcfce7' : '#fee2e2', border: 'none', padding: '5px 10px', borderRadius: '5px', color: autoPrint ? '#15803d' : '#b91c1c', fontWeight: 'bold', cursor: 'pointer' }}>{autoPrint ? '✅ চালু' : '❌ বন্ধ'}</button>
      </div>

      {/* ট্যাব মেনু */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '15px' }}>
        {[
          { id: 'orders', label: '📋 অর্ডার তালিকা', badge: newOrderCount },
          { id: 'products', label: '🛍️ পণ্যসমূহ ও পেজ' },
          { id: 'wallet', label: '💵 ওয়ালেট' },
          { id: 'withdraw', label: '💸 উইথড্র' },
          { id: 'logout', label: '🚪 লগআউট' },
        ].map(item => (
          <button key={item.id} onClick={async () => {
            if (item.id === 'logout') { await supabase.auth.signOut(); onClose(); window.location.reload(); return; }
            if (item.id === 'wallet') { window.location.href = '/seller/wallet'; return; }
            if (item.id === 'withdraw') { window.location.href = '/seller/withdraw'; return; }
            if (item.id === 'orders') { localStorage.setItem(`seller_last_seen_${seller.id}`, Date.now().toString()); setNewOrderCount(0); }
            setTab(item.id)
          }} style={{ whiteSpace: 'nowrap', padding: '10px 15px', fontSize: '14px', border: 'none', background: tab === item.id ? '#db2777' : '#f3f4f6', color: tab === item.id ? '#ffffff' : '#000000', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', position: 'relative' }}>
            {item.label}
            {(item as any).badge > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', fontSize: '10px', minWidth: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', padding: '0 3px' }}>{item.badge}</span>}
          </button>
        ))}
      </div>

      {/* অর্ডার তালিকা */}
      {tab === 'orders' && (
        <div>
          {filteredOrders.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0' }}>কোনো অর্ডার নেই</p>}
          {filteredOrders.map((item: any) => (
            <div key={item.id} onClick={() => setSelected(item)} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px', cursor: 'pointer', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {item.products?.image_url && <img src={item.products.image_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px' }} />}
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#111', margin: '0 0 2px 0', fontSize: '13px' }}>{item.products?.name}</p>
                    <p style={{ fontSize: '12px', color: '#db2777', fontWeight: 'bold', margin: '0 0 2px 0' }}>৳{item.price * item.quantity}</p>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>অর্ডার #{item.order_id}</p>
                  </div>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold', background: item.order?.status === 'delivered' ? '#dcfce7' : item.order?.status === 'confirmed' ? '#dbeafe' : '#fef9c3', color: item.order?.status === 'delivered' ? '#15803d' : item.order?.status === 'confirmed' ? '#1d4ed8' : '#854d0e' }}>
                  {item.order?.status === 'delivered' ? '✅ ডেলিভার্ড' : item.order?.status === 'confirmed' ? '✔️ কনফার্মড' : '⏳ পেন্ডিং'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* পণ্যসমূহ ও পেজ */}
      {tab === 'products' && (
        <SellerProductsTab seller={seller} onSelectPage={(pageId) => { setSelectedSellerPage(pageId); setTab('sellerpage'); }} />
      )}

      {/* অর্ডার detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>অর্ডার #{selected.order_id}</h2>
              <button onClick={() => setSelected(null)} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ background: '#fdf2f8', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1d4ed8', margin: '0 0 6px 0' }}>👤 কাস্টমার তথ্য</p>
                <p style={{ fontSize: '12px', color: '#374151', margin: '2px 0' }}>নাম: <strong>{selected.order?.customer_name}</strong></p>
                <p style={{ fontSize: '12px', color: '#374151', margin: '2px 0' }}>ফোন: {selected.order?.customer_phone}</p>
                <p style={{ fontSize: '12px', color: '#374151', margin: '2px 0' }}>জেলা: {selected.order?.district}, {selected.order?.upazila}</p>
                <p style={{ fontSize: '12px', color: '#374151', margin: '2px 0' }}>ঠিকানা: {selected.order?.address}</p>
                <p style={{ fontSize: '12px', color: '#374151', margin: '2px 0', fontWeight: 'bold' }}>অর্ডার #: {selected.order_id}</p>
                <p style={{ fontSize: '12px', color: '#374151', margin: '2px 0' }}>তারিখ: {new Date(selected.order?.created_at).toLocaleDateString('bn-BD')}</p>
              </div>
              <div style={{ borderBottom: '1px dashed #d1d5db', padding: '8px 0', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 2px 0' }}>{selected.products?.name}</p>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{selected.price} Tk × {selected.quantity} {selected.products?.unit}</p>
                  </div>
                  {selected.products?.image_url && <img src={selected.products.image_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', margin: '0 8px' }} />}
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>{selected.price * selected.quantity} Tk</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '2px solid #374151' }}>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', margin: 0 }}>সর্বমোট:</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#db2777', margin: 0 }}>{selected.price * selected.quantity} Tk</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}