'use client';

import Header from './components/Header'
import SellerPanel from './components/SellerPanel'
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion'; // এটি যোগ করুন
import ProductList from './components/ProductList';
import CustomerAuth from './components/CustomerAuth';
import HeroBanner from './components/HeroBanner';
import { requestNotificationPermission, messaging, onMessage } from './firebase';

// 👑 নতুন ফিচার বারটি এখানে ইমপোর্ট করা হলো
import FeatureBar from './components/FeatureBar';
import MohasagorProducts from './components/MohasagorProducts';
import MohasagorAdmin from './components/MohasagorAdmin';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

const ADMIN_PASSWORD = 'sloahiella@admin';
const LOGO_URL = 'https://i.ibb.co.com/Y7kNKLtt/Chat-GPT-Image-Aug-28-2026-10-19-19-PM.png';
const PINK = '#db2777';
const PINK_DARK = '#be185d';
const PINK_LIGHT = '#fdf2f8';
const PINK_BORDER = '#fbcfe8';

interface Branch {
  id: number;
  name: string;
  name_bn: string;
  is_active: boolean;
}

function OrderReceipt({ order, onClose, isAdmin }: { order: any; onClose: () => void; isAdmin: boolean }) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = printRef.current?.innerHTML;
    const win = window.open('', '_blank');
    if (!win || !content) return;
    win.document.write(`<html><head><title>Order #${order.id}</title><style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family: Arial, sans-serif; width:210mm; min-height:297mm; padding:15mm; } @media print { body { padding:10mm; } }</style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  }

  function handleSave() {
    const lines = ['সোহেল মার্ট | মাই বাজার', 'sohelmart.com', 'WhatsApp: 01872149655', '════════════════════════════════════════', `তারিখ: ${new Date(order.created_at).toLocaleDateString('bn-BD')}`, `নাম: ${order.customer_name} | ফোন: ${order.customer_phone}`, `জেলা: ${order.district}, ${order.upazila}`, `ঠিকানা: ${order.address}`, `অর্ডার #: ${order.id}`, '════════════════════════════════════════', ...((order.order_items || []).map((item: any) => `${item.products?.name} × ${item.quantity} ${item.products?.unit} = ${(item.price * item.quantity).toFixed(0)} Tk`)), '════════════════════════════════════════', `সর্বমোট: ${order.total_amount} Tk`];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `order-${order.id}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: PINK, margin: 0 }}>অর্ডার #{order.id}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isAdmin && <button onClick={handlePrint} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}>🖨️ Print</button>}
            <button onClick={handleSave} style={{ background: PINK, color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}>💾 Save</button>
            <button onClick={onClose} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        <div ref={printRef} style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2px 1fr', border: `2px solid ${PINK}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1d4ed8', margin: '0 0 6px 0' }}>👤 কাস্টমার তথ্য</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>নাম: <strong>{order.customer_name}</strong></p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>ফোন: {order.customer_phone}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>জেলা: {order.district}, {order.upazila}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '3px 0' }}>ঠিকানা: {order.address}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '6px 0 2px 0', fontWeight: 'bold' }}>অর্ডার #: {order.id}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0' }}>তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
            </div>
            <div style={{ background: PINK }} />
            <div style={{ padding: '14px', background: PINK_LIGHT }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <img src={LOGO_URL} alt="লোগো" style={{ height: '36px', width: 'auto', borderRadius: '6px' }} />
                <div>
                  <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: PINK, margin: 0 }}>সোহেল মার্ট</h1>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>🌐 sohelmart.com</p>
              <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>📱 01872149655</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '6px 0 2px 0', fontWeight: 'bold' }}>তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0' }}>সময়: {new Date(order.created_at).toLocaleTimeString('bn-BD')}</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 4px', marginBottom: '4px', borderBottom: '2px solid #374151' }}>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: 0 }}>পণ্য</p>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: 0 }}>টাকা</p>
          </div>
        {(order.order_items || []).map((item: any, i: number) => {
            const displayName = item.product_name || item.products?.name || 'পণ্য';
            const displayImage = item.product_image || item.products?.image_url;
            const displayCode = item.product_code || item.products?.product_code;
            const displayUnit = item.products?.unit || 'pcs';
            return (
              <div key={i} style={{ borderBottom: '1px dashed #d1d5db', padding: '8px 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 2px 0' }}>{displayName}</p>
                    {item.selected_size && <p style={{ fontSize: '11px', color: '#db2777', fontWeight: 'bold', margin: '0 0 2px 0' }}>সাইজ: {item.selected_size}</p>}
                    {displayCode && <p style={{ fontSize: '11px', color: '#3b82f6', margin: '0 0 2px 0' }}>কোড: {displayCode}</p>}
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{item.price} Tk/{displayUnit} × {item.quantity} {displayUnit}</p>
                  </div>
                  {displayImage && <img src={displayImage} alt={displayName} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', margin: '0 8px', flexShrink: 0 }} />}
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: PINK, margin: 0, whiteSpace: 'nowrap' }}>{(item.price * item.quantity).toFixed(0)} Tk</p>
                </div>
              </div>
            );
          })}
          <div style={{ borderTop: '2px solid #374151', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', margin: 0 }}>সর্বমোট:</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: PINK, margin: 0 }}>{order.total_amount} Tk</p>
          </div>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>ধন্যবাদ সোহেল মার্টে কেনাকাটা করার জন্য! 😊</p>
        </div>
      </div>
    </div>
  );
}

function AdminSellerView({ seller, onBack }: { seller: any; onBack: () => void }) {
  const [orders, setOrders] = useState<any[]>([])
  const [dateFilter, setDateFilter] = useState('today')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { fetchOrders() }, [dateFilter])

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
    setOrders(filtered)
  }

  const filteredOrders = search ? orders.filter(o => o.order?.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.order?.customer_phone?.includes(search) || String(o.order_id).includes(search)) : orders
  const totalEarning = filteredOrders.reduce((a: number, o: any) => a + (o.price * o.quantity), 0)
  const totalOrders = new Set(filteredOrders.map((o: any) => o.order_id)).size

  return (
    <div>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={onBack} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}>← ব্যাক</button>
        <p style={{ fontWeight: 'bold', color: '#111', margin: 0 }}>🏪 {seller.shop_name}</p>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto' }}>
          {[{ key: 'today', label: 'আজকে' }, { key: 'yesterday', label: 'গতকাল' }, { key: 'week', label: 'এই সপ্তাহ' }, { key: 'month', label: 'এই মাস' }].map(d => (
            <button key={d.key} onClick={() => setDateFilter(d.key)} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', border: '2px solid', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, borderColor: dateFilter === d.key ? PINK : '#e5e7eb', background: dateFilter === d.key ? PINK : 'white', color: dateFilter === d.key ? 'white' : '#374151' }}>{d.label}</button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 নাম, ফোন বা অর্ডার নম্বর..." style={{ border: '2px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px', width: '100%', fontSize: '13px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box', color: '#1f2937' }} />
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
          <div key={item.id} onClick={() => setSelected(item)} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px', cursor: 'pointer', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {item.products?.image_url && <img src={item.products.image_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px' }} />}
                <div>
                  <p style={{ fontWeight: 'bold', color: '#111', margin: '0 0 2px 0', fontSize: '13px' }}>{item.products?.name}</p>
                  <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', margin: '0 0 2px 0' }}>৳{item.price * item.quantity}</p>
                  <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>অর্ডার #{item.order_id}</p>
                </div>
              </div>
              <div>
                <select value={item.order?.status || 'pending'} onChange={async e => { e.stopPropagation(); await supabase.from('orders').update({ status: e.target.value }).eq('id', item.order_id); fetchOrders(); }} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px 6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>
                  <option value="pending">⏳ Pending</option>
                  <option value="confirmed">✔️ Confirmed</option>
                  <option value="shipped">🚚 Shipped</option>
                  <option value="delivered">✅ Delivered</option>
                </select>
                {item.order?.status === 'shipped' && (
                  <input
                    placeholder="ট্র্যাকিং লিংক দিন..."
                    defaultValue={item.order?.tracking_url || ''}
                    onBlur={async e => {
                      await supabase.from('orders').update({ tracking_url: e.target.value }).eq('id', item.order_id);
                      fetchOrders();
                    }}
                    style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 6px', fontSize: '11px', width: '100%', outline: 'none', color: '#1f2937', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selected && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: PINK, margin: 0 }}>অর্ডার #{selected.order_id}</h2>
        <button onClick={() => setSelected(null)} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2px 1fr', border: `2px solid ${PINK}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '14px', background: PINK_LIGHT }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <img src={LOGO_URL} alt="লোগো" style={{ height: '36px', width: 'auto', borderRadius: '6px' }} />
              <div>
                <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: PINK, margin: 0 }}>সোহেল মার্ট</h1>
              </div>
            </div>
            <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>🌐 sohelmart.com</p>
            <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0' }}>📱 01872149655</p>
            <p style={{ fontSize: '11px', color: '#374151', margin: '6px 0 2px 0', fontWeight: 'bold' }}>তারিখ: {new Date(selected.order?.created_at).toLocaleDateString('bn-BD')}</p>
            <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0' }}>সময়: {new Date(selected.order?.created_at).toLocaleTimeString('bn-BD')}</p>
          </div>
          <div style={{ background: PINK }} />
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
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: PINK, margin: 0 }}>{selected.price * selected.quantity} Tk</p>
          </div>
        </div>
        <div style={{ borderTop: '2px solid #374151', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', margin: 0 }}>সর্বমোট:</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: PINK, margin: 0 }}>{selected.price * selected.quantity} Tk</p>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>ধন্যবাদ সোহেল মার্টে কেনাকাটা করার জন্য! 😊</p>
      </div>
    </div>
  </div>
)}
    </div>
  )
}

function SellerManagement() {
  const [sellers, setSellers] = useState<any[]>([])
  const [selectedSeller, setSelectedSeller] = useState<any>(null)
  const [pageRequests, setPageRequests] = useState<any[]>([])

  useEffect(() => { fetchSellers(); fetchPageRequests(); }, [])

  async function fetchSellers() {
    const { data } = await supabase.from('sellers').select('*, profiles(full_name, phone)').order('created_at', { ascending: false })
    if (data) setSellers(data)
  }

  async function fetchPageRequests() {
    const { data } = await supabase.from('seller_pages').select('*, sellers(shop_name), pages(name, name_bn)').eq('status', 'pending').order('created_at', { ascending: false })
    if (data) setPageRequests(data)
  }

  async function approvePageRequest(id: string) {
    const req = pageRequests.find(r => String(r.id) === String(id))
    if (req?.page_name && !req?.page_id) {
      const { data: newPage } = await supabase.from('pages').insert({
        name: req.page_name,
        name_bn: req.page_name,
        branch_id: 1,
        is_active: true
      }).select().single()
      if (newPage) {
        await supabase.from('seller_pages').update({ status: 'approved', page_id: newPage.id }).eq('id', id)
      }
    } else {
      await supabase.from('seller_pages').update({ status: 'approved' }).eq('id', id)
    }
    fetchPageRequests()
  }

  async function rejectPageRequest(id: string) {
    await supabase.from('seller_pages').delete().eq('id', id)
    fetchPageRequests()
  }

  async function approveSeller(id: string) {
    await supabase.from('sellers').update({ is_approved: true }).eq('id', id)
    fetchSellers()
  }

  async function rejectSeller(id: string) {
    if (!confirm('এই সেলার মুছে দেবেন?')) return
    await supabase.from('sellers').delete().eq('id', id)
    fetchSellers()
  }

  if (selectedSeller) {
    return <AdminSellerView seller={selectedSeller} onBack={() => setSelectedSeller(null)} />
  }

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
     {pageRequests.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#db2777', margin: '0 0 8px 0' }}>📋 Page Requests ({pageRequests.length})</p>
          {pageRequests.map(req => (
            <div key={req.id} style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 2px 0' }}>🏪 {req.sellers?.shop_name}</p>
                <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>📄 {req.pages?.name_bn || req.pages?.name}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => approvePageRequest(req.id)} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}>✅ Approve</button>
                <button onClick={() => rejectPageRequest(req.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}>❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {sellers.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>কোনো সেলার নেই</p>}
      {sellers.map((seller) => (
        <div key={seller.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div onClick={() => setSelectedSeller(seller)} style={{ cursor: 'pointer', flex: 1 }}>
              <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#111', margin: '0 0 2px 0' }}>🏪 {seller.shop_name}</p>
              <p style={{ fontSize: '12px', color: '#555', margin: '2px 0' }}>👤 {seller.profiles?.full_name}</p>
              <p style={{ fontSize: '12px', color: '#555', margin: '2px 0' }}>📱 {seller.profiles?.phone}</p>
              <p style={{ fontSize: '11px', color: '#2563eb', margin: '4px 0 0 0' }}>👆 ক্লিক করুন প্যানেল দেখতে</p>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', marginTop: '4px', background: seller.is_approved ? '#dcfce7' : '#fef9c3', color: seller.is_approved ? '#15803d' : '#854d0e' }}>
                {seller.is_approved ? '✅ অ্যাপ্রুভড' : '⏳ অপেক্ষমান'}
              </span>
            </div>
            {!seller.is_approved && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button onClick={() => approveSeller(seller.id)} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>✅ Approve</button>
                <button onClick={() => rejectSeller(seller.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>❌ Reject</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function WithdrawalManagement() {
  const [requests, setRequests] = useState<any[]>([])
  useEffect(() => { fetchRequests() }, [])
  async function fetchRequests() {
    const { data } = await supabase.from('withdrawal_requests').select('*, sellers(shop_name)').order('created_at', { ascending: false })
    if (data) setRequests(data)
  }
  async function approve(id: string) { await supabase.from('withdrawal_requests').update({ status: 'completed' }).eq('id', id); fetchRequests() }
  async function reject(id: string) { await supabase.from('withdrawal_requests').update({ status: 'rejected' }).eq('id', id); fetchRequests() }

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {requests.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>কোনো রিকোয়েস্ট নেই</p>}
      {requests.map((req) => (
        <div key={req.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#111', margin: '0 0 2px 0' }}>🏪 {req.sellers?.shop_name}</p>
              {/* 👑 লাইন ৩৮৩: এখানে টাইপো 'font  Weight' থেকে ডাবল স্পেস মুছে পুরোপুরি ঠিক করে দেওয়া হয়েছে ভাই */}
              <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: 'bold', margin: '2px 0' }}>৳{req.amount}</p>
              <p style={{ fontSize: '12px', color: '#555', margin: '2px 0' }}>{req.method === 'bkash' ? '💗 বিকাশ' : req.method === 'nagad' ? '🟠 নগদ' : '🏦 ব্যাংক'} → {req.account_number}</p>
              <p style={{ fontSize: '11px', color: '#888', margin: '2px 0' }}>{new Date(req.created_at).toLocaleDateString('bn-BD')}</p>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', marginTop: '4px', background: req.status === 'completed' ? '#dcfce7' : req.status === 'rejected' ? '#fee2e2' : '#fef9c3', color: req.status === 'completed' ? '#15803d' : req.status === 'rejected' ? '#dc2626' : '#854d0e' }}>
                {req.status === 'completed' ? '✅ সম্পন্ন' : req.status === 'rejected' ? '❌ বাতিল' : '⏳ অপেক্ষমান'}
              </span>
            </div>
            {req.status === 'pending' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button onClick={() => approve(req.id)} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>✅ Approve</button>
                <button onClick={() => reject(req.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>❌ Reject</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export const dynamic = 'force-dynamic';
export default function Home() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allBranches, setAllBranches] = useState<any[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loginError, setLoginError] = useState('');
  const [loginType, setLoginType] = useState<string>('admin');
  const [showAdminDrawer, setShowAdminDrawer] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [todaySales, setTodaySales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [adminTab, setAdminTab] = useState('orders');
  const [autoPrint, setAutoPrint] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [sellerUser, setSellerUser] = useState<any>(null);
  const [showSellerDrawer, setShowSellerDrawer] = useState(false);
  const [showPageMenu, setShowPageMenu] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [showCustomerAuth, setShowCustomerAuth] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');
const [showSettings, setShowSettings] = useState(false);
const [showEmailForm, setShowEmailForm] = useState(false);  
const [showMohasagorAdmin, setShowMohasagorAdmin] = useState(false);
const [showBranchControl, setShowBranchControl] = useState(false);
const [settingsSearch, setSettingsSearch] = useState('');
const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isDoorOpen, setIsDoorOpen] = useState(false);
const [mohasagorCategory, setMohasagorCategory] = useState<string | null>(null);
const [mohasagorRefresh, setMohasagorRefresh] = useState(0); 
const [currentPageId, setCurrentPageId] = useState<string | null>(() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('page') || localStorage.getItem('current_page_id') || null;
  }
  return null;
});
 
useEffect(() => {
    fetchBranches();
    async function checkUrlPage() {
      const urlParams = new URLSearchParams(window.location.search);
      const pageId = urlParams.get('page');
      if (pageId) {
        const { data: page } = await supabase.from('pages').select('branch_id, name, name_bn, mohasagor_category').eq('id', pageId).single();
        if (page?.branch_id) {
          const { data: branch } = await supabase.from('branches').select('*').eq('id', page.branch_id).single();
          if (branch) {
            setSelectedBranch(branch);
            localStorage.setItem('current_page_id', pageId);
            localStorage.setItem('current_page_name', page.name_bn || page.name);
            setCurrentPageId(pageId);
            setMohasagorCategory(page.mohasagor_category || null);
          }
        }
      }
    }
    checkUrlPage();

    async function checkUrlProduct() {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('product');
      if (productId) {
        const isMoha = productId.startsWith('moha-');
        if (!isMoha) {
          const { data: product } = await supabase.from('products').select('page_id, branch_id').eq('id', productId).single();
          if (product?.branch_id) {
            const { data: branch } = await supabase.from('branches').select('*').eq('id', product.branch_id).single();
            if (branch) setSelectedBranch(branch);
          }
        } else {
          // 👑 Mohasagor প্রোডাক্টের জন্য: mohasagor_assignments থেকে page_id বের করে, সেই page এর branch খুঁজে বের করা হলো
          const mohaId = productId.replace('moha-', '');
          const { data: assign } = await supabase.from('mohasagor_assignments').select('page_id').eq('mohasagor_product_id', mohaId).single();
          if (assign?.page_id) {
            const { data: page } = await supabase.from('pages').select('branch_id').eq('id', assign.page_id).single();
            if (page?.branch_id) {
              const { data: branch } = await supabase.from('branches').select('*').eq('id', page.branch_id).single();
              if (branch) setSelectedBranch(branch);
            }
          }
        }
      }
    }
    checkUrlProduct();

    async function checkSellerLogin() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: seller } = await supabase.from('sellers').select('*, profiles(full_name)').eq('profile_id', user.id).single()
 if (seller?.is_approved) {
    setSellerUser(seller)
    if (seller.branch_id) {
      const { data: branch } = await supabase.from('branches').select('*').eq('id', seller.branch_id).single()
      if (branch) {
        setSelectedBranch(branch)
      }
    }
  }
}
    async function checkGoogleLogin() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const user = session.user
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        const phone = user.phone || user.user_metadata?.phone || user.email || '00000000000'
        if (!localStorage.getItem('customer_phone')) {
          const avatar = user.user_metadata?.avatar_url || ''
          localStorage.setItem('customer_name', name)
          localStorage.setItem('customer_phone', phone)
          localStorage.setItem('customer_district', '')
          localStorage.setItem('customer_upazila', '')
          localStorage.setItem('customer_avatar', avatar)
          setCustomer({ phone, name })
        }
      }
    }
    checkGoogleLogin()
    checkSellerLogin()
    const savedRole = localStorage.getItem('role');
    if (savedRole) setRole(savedRole);
    if (localStorage.getItem('autoPrint') === 'true') setAutoPrint(true);
    const savedPhone = localStorage.getItem('customer_phone');
    if (savedPhone) setCustomer({ phone: savedPhone });
  }, []);

  // 👑 ব্রাঞ্চ না হারিয়ে ধাপে ধাপে ব্যাক আসার জন্য একদম নিখুঁত লিসেনার
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPageId = urlParams.get('page');
      
      // রিফ্রেশ ছাড়া শুধু লোকাল স্টেট এবং অর্ডারের ডাটা সিঙ্ক করবে
      if (urlPageId) {
        localStorage.setItem('current_page_id', urlPageId);
        if (role === 'admin') fetchOrders(urlPageId);
      } else {
        localStorage.setItem('current_page_id', '');
        if (role === 'admin') fetchOrders(undefined);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [role]);

  useEffect(() => {
    if (role === 'admin' || role === 'editor') {
      fetchOrders();
      if (role === 'admin') {
        fetchNotifications();
        try {
          requestNotificationPermission().then((token: string | null) => { if (token) localStorage.setItem('fcm_token', token); });
          if (messaging) { onMessage(messaging, (payload: any) => { fetchOrders(); fetchNotifications(); playNotificationSound(); }); }
        } catch (e) {}
      }
      const channel = supabase.channel('orders').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, async (payload) => {
        fetchOrders();
        if (role === 'admin') {
          fetchNotifications(); playNotificationSound();
          const fcmToken = localStorage.getItem('fcm_token');
          if (fcmToken) {
            const order = payload.new;
            await fetch('https://jthdtmqrapnfmmmeuqsw.supabase.co/functions/v1/send-notification', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J` }, body: JSON.stringify({ token: fcmToken, title: '🛒 নতুন অর্ডার!', body: `অর্ডার #${order.id} - ${order.total_amount} Tk` }) });
          }
        }
      }).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [role]);

  function playNotificationSound() {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode); gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 880;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime); oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {}
  }

      async function fetchBranches() {
    const { data } = await supabase.from('branches').select('*').order('created_at', { ascending: true });
    if (data) {
      setAllBranches(data);
      const activeBranches = data.filter((b: any) => b.is_active !== false);
      setBranches(activeBranches as Branch[]);
      if (activeBranches.length === 1 && !selectedBranch) {
        setSelectedBranch(activeBranches[0] as Branch);
      }
    }
    setBranchesLoading(false);
  }
  async function fetchOrders(filterPageId?: string) {
    const editorPageId = localStorage.getItem('editor_page_id');
    const currentPageId = filterPageId !== undefined ? filterPageId : localStorage.getItem('current_page_id');
    const activePageId = currentPageId || (role === 'editor' ? editorPageId : null);
    const { data } = await supabase.from('orders').select('*, order_items(*, products(name, name_bn, unit, image_url, page_id, product_code))').order('created_at', { ascending: false });
    if (data) {
      let filteredData = data;
      if (activePageId) { filteredData = data.filter((o: any) => o.order_items?.some((item: any) => { const productPageId = item.products?.page_id; if (!productPageId && !activePageId) return true; return String(productPageId) === String(activePageId); })); }
     setOrders(filteredData); setTotalOrders(filteredData.length);
      const today = new Date().toDateString();
      const activeOrders = filteredData.filter((o: any) => o.status !== 'cancelled');
      const todayOrders = activeOrders.filter((o: any) => new Date(o.created_at).toDateString() === today);
      setTodaySales(todayOrders.reduce((a: number, o: any) => a + o.total_amount, 0));
    }
  }

  async function fetchNotifications() {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) { setNotifications(data); setUnreadCount(data.filter((n: any) => !n.is_read).length); }
  }

  async function markAllRead() { await supabase.from('notifications').update({ is_read: true }).eq('is_read', false); fetchNotifications(); }
      async function updateOrderStatus(id: number, status: string, customerPhone?: string) {
    await supabase.from('orders').update({ status }).eq('id', id);
    await supabase.from('notifications').update({ is_read: true }).ilike('body', `%#${id}%`);
    if (status === 'confirmed' && customerPhone) {
      sendWhatsAppConfirmation(customerPhone);
    }
    fetchOrders();
    fetchNotifications();
  }

  async function handleLogin() {
    if (loginType === 'admin') {
      if (password === ADMIN_PASSWORD) { setRole('admin'); localStorage.setItem('role', 'admin'); setShowLoginModal(false); setPassword(''); setLoginError(''); }
      else { setLoginError('Admin পাসওয়ার্ড ভুল!'); }
    } else {
      const { data } = await supabase.from('pages').select('*').eq('vendor_password', password).single();
      if (data) { setRole('editor'); localStorage.setItem('role', 'editor'); localStorage.setItem('editor_page_id', String(data.id)); localStorage.setItem('editor_page_name', data.name_bn || data.name); setShowLoginModal(false); setPassword(''); setLoginError(''); }
      else { setLoginError('Editor পাসওয়ার্ড ভুল!'); }
    }
  }

  function handleLogout() { setRole(null); localStorage.removeItem('role'); localStorage.removeItem('editor_page_id'); localStorage.removeItem('editor_page_name'); localStorage.removeItem('current_page_id'); setShowAdminDrawer(false); }
  function toggleAutoPrint() { const newVal = !autoPrint; setAutoPrint(newVal); localStorage.setItem('autoPrint', newVal.toString()); }

  const getFilteredByDate = (data: any[]) => {
    const now = new Date();
    if (orderSearch) { return data.filter((o: any) => { const dateStr = new Date(o.created_at).toLocaleDateString('bn-BD'); const dateStrEn = new Date(o.created_at).toLocaleDateString('en-US'); return String(o.id).includes(orderSearch) || dateStr.includes(orderSearch) || dateStrEn.toLowerCase().includes(orderSearch.toLowerCase()) || (o.customer_name && o.customer_name.toLowerCase().includes(orderSearch.toLowerCase())) || (o.customer_phone && o.customer_phone.includes(orderSearch)); }); }
    return data.filter((o: any) => {
      const orderDate = new Date(o.created_at);
      if (dateFilter === 'today') return orderDate.toDateString() === now.toDateString();
      if (dateFilter === 'yesterday') { const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1); return orderDate.toDateString() === yesterday.toDateString(); }
      if (dateFilter === 'week') { const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7); return orderDate >= weekAgo; }
      if (dateFilter === 'month') return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      return true;
    });
  };

 const dateFilteredOrders = getFilteredByDate(orders);
  const activeFilteredOrders = dateFilteredOrders.filter((o: any) => o.status !== 'cancelled');
  const filteredSales = activeFilteredOrders.reduce((a: number, o: any) => a + o.total_amount, 0);
  const filteredOrders2 = activeFilteredOrders.length;

if (!selectedBranch) {
    return (
      <div style={{ minHeight: '100vh', background: PINK_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div className="rotating-border" style={{ maxWidth: '400px', width: '100%', margin: '0 16px', borderRadius: '21px', position: 'relative' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '21px', boxShadow: '0 4px 20px rgba(219,39,119,0.15)', position: 'relative', overflow: 'hidden', minHeight: '280px' }}>

            {/* লোগো ও বাটন — সবার উপরে zIndex 20 */}
            <div style={{ position: 'relative', zIndex: 20 }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <img src={LOGO_URL} alt="লোগো" style={{ height: '80px', width: 'auto', borderRadius: '12px', cursor: 'pointer', display: 'block', margin: '0 auto 12px' }}
                  onClick={() => { const count = parseInt(sessionStorage.getItem('logoClick') || '0') + 1; sessionStorage.setItem('logoClick', String(count)); if (count >= 5) { sessionStorage.removeItem('logoClick'); setShowLoginModal(true); } }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {branches.map((branch) => (
                  <button key={branch.id} onClick={() => { 
                    setIsDoorOpen(true); 
                    setTimeout(() => {
                      setSelectedBranch(branch);
                      const urlParams = new URLSearchParams(window.location.search);
                      const pageId = urlParams.get('page');
                      if (pageId) {
                        localStorage.setItem('current_page_id', pageId);
                      }
                    }, 900); 
                  }}
                    style={{ padding: '14px', background: PINK_LIGHT, border: `2px solid ${PINK_BORDER}`, borderRadius: '12px', color: PINK_DARK, fontWeight: '600', fontSize: '16px', cursor: 'pointer', position: 'relative', zIndex: 20 }}>
                    {branch.name.charAt(0).toUpperCase() + branch.name.slice(1)}
                  </button>
                ))}
              </div>
            </div>

           {/* বাম দরজার পাল্লা */}
            <motion.div
              animate={isDoorOpen ? { x: '-100%' } : { x: '0%' }}
              transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '50%', height: '100%', zIndex: 15,
                background: 'linear-gradient(135deg, #fff0f6 0%, #ffe4f0 50%, #ffd6e8 100%)',
                borderRight: '2px solid #f9a8d4',
                overflow: 'hidden',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 150 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                {/* বর্ডার ডিজাইন */}
                <rect x="4" y="4" width="142" height="292" rx="4" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="4,3"/>
                <rect x="10" y="10" width="130" height="280" rx="3" fill="none" stroke="#fda4af" strokeWidth="0.8"/>
                
                {/* উপরের কোণের পাতা */}
                <g transform="translate(20, 20)">
                  <ellipse cx="0" cy="0" rx="18" ry="8" fill="#f9a8d4" opacity="0.6" transform="rotate(-45)"/>
                  <ellipse cx="0" cy="0" rx="14" ry="6" fill="#fb7185" opacity="0.5" transform="rotate(-20)"/>
                  <ellipse cx="0" cy="0" rx="10" ry="5" fill="#f43f5e" opacity="0.4" transform="rotate(10)"/>
                  <circle cx="0" cy="0" r="3" fill="#be185d" opacity="0.8"/>
                </g>
                <g transform="translate(130, 20)">
                  <ellipse cx="0" cy="0" rx="18" ry="8" fill="#f9a8d4" opacity="0.6" transform="rotate(45)"/>
                  <ellipse cx="0" cy="0" rx="14" ry="6" fill="#fb7185" opacity="0.5" transform="rotate(20)"/>
                  <ellipse cx="0" cy="0" rx="10" ry="5" fill="#f43f5e" opacity="0.4" transform="rotate(-10)"/>
                  <circle cx="0" cy="0" r="3" fill="#be185d" opacity="0.8"/>
                </g>

                {/* মাঝের ফুল */}
                <g transform="translate(75, 150)">
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fda4af" opacity="0.7" transform="rotate(0)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fda4af" opacity="0.7" transform="rotate(45)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fda4af" opacity="0.7" transform="rotate(90)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fda4af" opacity="0.7" transform="rotate(135)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fbcfe8" opacity="0.6" transform="rotate(22.5)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fbcfe8" opacity="0.6" transform="rotate(67.5)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fbcfe8" opacity="0.6" transform="rotate(112.5)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fbcfe8" opacity="0.6" transform="rotate(157.5)"/>
                  <circle cx="0" cy="0" r="10" fill="#db2777"/>
                  <circle cx="0" cy="0" r="6" fill="#be185d"/>
                  <circle cx="0" cy="0" r="3" fill="#fce7f3"/>
                </g>

                {/* ছোট পাতা উপরে */}
                <g transform="translate(75, 70)">
                  <ellipse cx="-15" cy="0" rx="12" ry="5" fill="#f9a8d4" opacity="0.5" transform="rotate(-30 -15 0)"/>
                  <ellipse cx="15" cy="0" rx="12" ry="5" fill="#f9a8d4" opacity="0.5" transform="rotate(30 15 0)"/>
                  <ellipse cx="0" cy="-10" rx="5" ry="12" fill="#fda4af" opacity="0.5"/>
                </g>

                {/* ছোট পাতা নিচে */}
                <g transform="translate(75, 230)">
                  <ellipse cx="-15" cy="0" rx="12" ry="5" fill="#f9a8d4" opacity="0.5" transform="rotate(30 -15 0)"/>
                  <ellipse cx="15" cy="0" rx="12" ry="5" fill="#f9a8d4" opacity="0.5" transform="rotate(-30 15 0)"/>
                  <ellipse cx="0" cy="10" rx="5" ry="12" fill="#fda4af" opacity="0.5"/>
                </g>

                {/* নিচের কোণের পাতা */}
                <g transform="translate(20, 280)">
                  <ellipse cx="0" cy="0" rx="18" ry="8" fill="#f9a8d4" opacity="0.6" transform="rotate(45)"/>
                  <ellipse cx="0" cy="0" rx="14" ry="6" fill="#fb7185" opacity="0.5" transform="rotate(20)"/>
                  <circle cx="0" cy="0" r="3" fill="#be185d" opacity="0.8"/>
                </g>
                <g transform="translate(130, 280)">
                  <ellipse cx="0" cy="0" rx="18" ry="8" fill="#f9a8d4" opacity="0.6" transform="rotate(-45)"/>
                  <ellipse cx="0" cy="0" rx="14" ry="6" fill="#fb7185" opacity="0.5" transform="rotate(-20)"/>
                  <circle cx="0" cy="0" r="3" fill="#be185d" opacity="0.8"/>
                </g>

                {/* দরজার হাতল */}
                <circle cx="132" cy="150" r="5" fill="#db2777" opacity="0.8"/>
                <circle cx="132" cy="150" r="3" fill="#fce7f3"/>
              </svg>
            </motion.div>

            {/* ডান দরজার পাল্লা */}
            <motion.div
              animate={isDoorOpen ? { x: '100%' } : { x: '0%' }}
              transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
              style={{
                position: 'absolute', top: 0, right: 0,
                width: '50%', height: '100%', zIndex: 15,
                background: 'linear-gradient(225deg, #fff0f6 0%, #ffe4f0 50%, #ffd6e8 100%)',
                borderLeft: '2px solid #f9a8d4',
                overflow: 'hidden',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 150 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                {/* বর্ডার ডিজাইন */}
                <rect x="4" y="4" width="142" height="292" rx="4" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="4,3"/>
                <rect x="10" y="10" width="130" height="280" rx="3" fill="none" stroke="#fda4af" strokeWidth="0.8"/>

                {/* উপরের কোণের পাতা */}
                <g transform="translate(20, 20)">
                  <ellipse cx="0" cy="0" rx="18" ry="8" fill="#f9a8d4" opacity="0.6" transform="rotate(-45)"/>
                  <ellipse cx="0" cy="0" rx="14" ry="6" fill="#fb7185" opacity="0.5" transform="rotate(-20)"/>
                  <ellipse cx="0" cy="0" rx="10" ry="5" fill="#f43f5e" opacity="0.4" transform="rotate(10)"/>
                  <circle cx="0" cy="0" r="3" fill="#be185d" opacity="0.8"/>
                </g>
                <g transform="translate(130, 20)">
                  <ellipse cx="0" cy="0" rx="18" ry="8" fill="#f9a8d4" opacity="0.6" transform="rotate(45)"/>
                  <ellipse cx="0" cy="0" rx="14" ry="6" fill="#fb7185" opacity="0.5" transform="rotate(20)"/>
                  <ellipse cx="0" cy="0" rx="10" ry="5" fill="#f43f5e" opacity="0.4" transform="rotate(-10)"/>
                  <circle cx="0" cy="0" r="3" fill="#be185d" opacity="0.8"/>
                </g>

                {/* মাঝের ফুল */}
                <g transform="translate(75, 150)">
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fda4af" opacity="0.7" transform="rotate(0)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fda4af" opacity="0.7" transform="rotate(45)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fda4af" opacity="0.7" transform="rotate(90)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fda4af" opacity="0.7" transform="rotate(135)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fbcfe8" opacity="0.6" transform="rotate(22.5)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fbcfe8" opacity="0.6" transform="rotate(67.5)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fbcfe8" opacity="0.6" transform="rotate(112.5)"/>
                  <ellipse cx="0" cy="-22" rx="9" ry="16" fill="#fbcfe8" opacity="0.6" transform="rotate(157.5)"/>
                  <circle cx="0" cy="0" r="10" fill="#db2777"/>
                  <circle cx="0" cy="0" r="6" fill="#be185d"/>
                  <circle cx="0" cy="0" r="3" fill="#fce7f3"/>
                </g>

                {/* ছোট পাতা উপরে */}
                <g transform="translate(75, 70)">
                  <ellipse cx="-15" cy="0" rx="12" ry="5" fill="#f9a8d4" opacity="0.5" transform="rotate(-30 -15 0)"/>
                  <ellipse cx="15" cy="0" rx="12" ry="5" fill="#f9a8d4" opacity="0.5" transform="rotate(30 15 0)"/>
                  <ellipse cx="0" cy="-10" rx="5" ry="12" fill="#fda4af" opacity="0.5"/>
                </g>

                {/* ছোট পাতা নিচে */}
                <g transform="translate(75, 230)">
                  <ellipse cx="-15" cy="0" rx="12" ry="5" fill="#f9a8d4" opacity="0.5" transform="rotate(30 -15 0)"/>
                  <ellipse cx="15" cy="0" rx="12" ry="5" fill="#f9a8d4" opacity="0.5" transform="rotate(-30 15 0)"/>
                  <ellipse cx="0" cy="10" rx="5" ry="12" fill="#fda4af" opacity="0.5"/>
                </g>

                {/* নিচের কোণের পাতা */}
                <g transform="translate(20, 280)">
                  <ellipse cx="0" cy="0" rx="18" ry="8" fill="#f9a8d4" opacity="0.6" transform="rotate(45)"/>
                  <ellipse cx="0" cy="0" rx="14" ry="6" fill="#fb7185" opacity="0.5" transform="rotate(20)"/>
                  <circle cx="0" cy="0" r="3" fill="#be185d" opacity="0.8"/>
                </g>
                <g transform="translate(130, 280)">
                  <ellipse cx="0" cy="0" rx="18" ry="8" fill="#f9a8d4" opacity="0.6" transform="rotate(-45)"/>
                  <ellipse cx="0" cy="0" rx="14" ry="6" fill="#fb7185" opacity="0.5" transform="rotate(-20)"/>
                  <circle cx="0" cy="0" r="3" fill="#be185d" opacity="0.8"/>
                </g>

                {/* দরজার হাতল */}
                <circle cx="18" cy="150" r="5" fill="#db2777" opacity="0.8"/>
                <circle cx="18" cy="150" r="3" fill="#fce7f3"/>
              </svg>
            </motion.div>

          </div>
        </div>

        {showLoginModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', maxWidth: '340px', width: '100%', margin: '0 16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: PINK, textAlign: 'center', marginBottom: '16px' }}>🔐 লগইন</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => setLoginType('admin')} style={{ padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', border: '2px solid', cursor: 'pointer', borderColor: loginType === 'admin' ? PINK : '#e5e7eb', background: loginType === 'admin' ? PINK : 'white', color: loginType === 'admin' ? 'white' : '#374151' }}>👑 Admin</button>
                <button onClick={() => setLoginType('editor')} style={{ padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', border: '2px solid', cursor: 'pointer', borderColor: loginType === 'editor' ? PINK : '#e5e7eb', background: loginType === 'editor' ? PINK : 'white', color: loginType === 'editor' ? 'white' : '#374151' }}>✏️ Editor</button>
                <button onClick={() => { setShowLoginModal(false); window.location.href = '/seller/login'; }} style={{ padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', border: '2px solid #16a34a', cursor: 'pointer', background: 'white', color: '#16a34a' }}>🏪 Seller</button>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder={loginType === 'admin' ? 'Admin পাসওয়ার্ড' : 'Editor পাসওয়ার্ড'} style={{ border: `2px solid ${PINK_BORDER}`, borderRadius: '8px', padding: '10px 12px', width: '100%', fontSize: '14px', marginBottom: '8px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }} autoFocus />
              {loginError && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px' }}>{loginError}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleLogin} style={{ background: PINK, color: 'white', border: 'none', borderRadius: '8px', padding: '10px', flex: 1, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>লগইন</button>
                <button onClick={() => { setShowLoginModal(false); setPassword(''); setLoginError(''); }} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', cursor: 'pointer' }}>বাতিল</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ minHeight: '100vh', background: '#fdf2f8' }}>
      {selectedOrder && <OrderReceipt order={selectedOrder} onClose={() => setSelectedOrder(null)} isAdmin={role === 'admin'} />}
      {showCustomerAuth && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto', background: '#fdf2f8' }}>
          <div style={{ background: '#be185d', color: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 100 }}>
            <button onClick={() => setShowCustomerAuth(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}>←</button>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>লগইন / রেজিস্ট্রেশন</h2>
          </div>
          <CustomerAuth onSuccess={(data: any) => {
            localStorage.setItem('customer_phone', data.phone);
            localStorage.setItem('customer_name', data.name);
            localStorage.setItem('customer_district', data.district);
            localStorage.setItem('customer_upazila', data.upazila);
            setShowCustomerAuth(false);
          }} />
        </div>
      )}
<Header
        role={role}
        sellerUser={sellerUser}
        hideHeader={cartOpen}
       notificationCount={unreadCount}
        onSellerClick={() => setShowSellerDrawer(true)}
        onAdminClick={() => {
          setShowAdminDrawer(true);
          const pageId = localStorage.getItem('current_page_id');
          fetchOrders(pageId || undefined);
          fetchNotifications();
        }}
        onSettingsClick={() => setShowSettings(true)}
        onMenuClick={() => setShowPageMenu(true)}
        onOrdersClick={() => {
          const savedPhone = localStorage.getItem('customer_phone');
          if (savedPhone) {
            setOpenCart(false);
            const event = new CustomEvent('showCustomerOrders');
            window.dispatchEvent(event);
          } else if (role === 'admin' || role === 'editor') {
            setShowAdminDrawer(true);
          }
        }}
        onCartClick={() => {
          const savedPhone = localStorage.getItem('customer_phone');
          if (savedPhone) { setOpenCart(true); }
          else { setShowCustomerAuth(true); }
        }}
      />

 {!currentPageId && <HeroBanner />}
      {currentPageId && (
        <div style={{
          backgroundImage: 'linear-gradient(135deg, rgba(160,0,53,0.55) 0%, rgba(165,0,74,0.55) 50%, rgba(225,29,116,0.55) 100%), url(https://i.ibb.co.com/1JvzJ4jx/page-hiro-baner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: 'clamp(20px, 5vw, 40px) 16px clamp(20px, 5vw, 50px)',
          minHeight: 'clamp(120px, 25vw, 200px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(10px, 3vw, 16px)', fontWeight: '500', margin: '0 0 8px 0', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Your Trusted Online Shop</p>
          <p style={{ color: 'white', fontSize: 'clamp(24px, 6vw, 60px)', fontWeight: '900', margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 4px 24px rgba(0,0,0,0.4)', lineHeight: '1.1', wordBreak: 'break-word' }}>
            {localStorage.getItem('current_page_name') || ''}
          </p>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '620px', background: 'white', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: 'clamp(2px, 0.5vw, 4px)' }}>
            <span style={{ paddingLeft: 'clamp(8px, 2vw, 16px)', fontSize: 'clamp(12px, 3vw, 16px)', color: '#9ca3af' }}>🔍</span>
            <input
              type="text"
              id="heroSearchInput"
              placeholder="Search products..."
              onChange={e => {
                window.dispatchEvent(new CustomEvent('heroSearch', { detail: e.currentTarget.value }));
              }}
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', padding: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(12px, 3vw, 14px)', color: '#1f2937', background: 'transparent' }}
            />
            <button
              onClick={() => {
                const input = document.getElementById('heroSearchInput') as HTMLInputElement;
                window.dispatchEvent(new CustomEvent('heroSearch', { detail: input?.value || '' }));
              }}
              style={{ background: '#db2777', color: 'white', border: 'none', padding: 'clamp(8px, 2vw, 12px) clamp(12px, 4vw, 28px)', fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 'bold', cursor: 'pointer', borderRadius: '26px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Search
            </button>
          </div>
        </div>
      )}
      <FeatureBar />

      <ProductList
        branch={selectedBranch}
        role={role}
        openMenu={showPageMenu}
        onMenuClose={() => setShowPageMenu(false)}
        openCart={openCart}
        onCartClose={() => setOpenCart(false)}
        onCartOpenChange={(val: boolean) => setCartOpen(val)}
        onOrderSuccess={(orderId: number, phone: string) => {
          localStorage.setItem('customer_phone', phone);
        }}
        onPageChange={(pageId: string | null) => {
         setCurrentPageId(pageId);
          localStorage.setItem('current_page_id', pageId || '');
          if (pageId) {
            supabase.from('pages').select('mohasagor_category').eq('id', pageId).single().then(({ data }) => {
              setMohasagorCategory(data?.mohasagor_category || null);
            });
          } else {
            setMohasagorCategory(null);
          }
          if (role === 'admin') fetchOrders(pageId || undefined);
          
          // ব্রাউজারের ব্যাক বাটন ট্র্যাকিংয়ের জন্য হিস্ট্রি কুয়েরি পুশ
          if (pageId) {
            window.history.pushState({ page: pageId }, '', `?page=${pageId}`);
          } else {
            window.history.pushState(null, '', window.location.pathname);
          }
        }}
      />

{showSettings && (
       <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowSettings(false)} />
          <div style={{ position: 'relative', marginLeft: 'auto', width: '100%', maxWidth: '380px', background: 'white', height: '100%', overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)' }}>
            <div style={{ background: PINK, color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>⚙️ Settings</h2>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>
        <div style={{ padding: '16px' }}>
              {!showEmailForm && !showMohasagorAdmin && (
                <input
                  value={settingsSearch}
                  onChange={e => setSettingsSearch(e.target.value)}
                  placeholder="🔍 সেটিংস খুঁজুন..."
                  style={{ border: '2px solid #d1d5db', borderRadius: '10px', padding: '10px 14px', width: '100%', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }}
                />
              )}
              {!showEmailForm && !showMohasagorAdmin && 'email send'.includes(settingsSearch.toLowerCase()) && (
                <button onClick={() => setShowEmailForm(true)} style={{ width: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#1f2937', textAlign: 'left', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📧</span> Email Send
                </button>
              )}
                          {!showEmailForm && !showMohasagorAdmin && !showBranchControl && 'মহাসাগর প্রোডাক্ট অ্যাসাইন'.includes(settingsSearch) && (
                <button onClick={() => setShowMohasagorAdmin(true)} style={{ width: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#1f2937', textAlign: 'left', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🏷️</span> মহাসাগর প্রোডাক্ট অ্যাসাইন
                </button>
              )}
              {!showEmailForm && !showMohasagorAdmin && !showBranchControl && 'শাখা নিয়ন্ত্রণ'.includes(settingsSearch) && (
                <button onClick={() => setShowBranchControl(true)} style={{ width: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#1f2937', textAlign: 'left', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🏢</span> শাখা নিয়ন্ত্রণ
                </button>
              )}
              {showMohasagorAdmin && (
                <div>
                  <button onClick={() => setShowMohasagorAdmin(false)} style={{ background: 'none', border: 'none', color: PINK, fontSize: '13px', cursor: 'pointer', marginBottom: '8px', padding: 0 }}>← ব্যাক</button>
                  <MohasagorAdmin branchId={1} onAssign={() => setMohasagorRefresh(r => r + 1)} />
                </div>
              )}
              {showBranchControl && (
                <div>
                  <button onClick={() => setShowBranchControl(false)} style={{ background: 'none', border: 'none', color: PINK, fontSize: '13px', cursor: 'pointer', marginBottom: '8px', padding: 0 }}>← ব্যাক</button>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px 0' }}>একটা শাখা বন্ধ করলে কাস্টমার সরাসরি অন্য শাখায় ঢুকে যাবে।</p>
                                    {allBranches.map((b: any) => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{b.name_bn || b.name}</span>
                      <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                        <input
                          type="checkbox"
                          checked={b.is_active !== false}
                          onChange={async (e) => {
                            const newVal = e.target.checked;
                            // 👑 সেফটি চেক: বন্ধ করার চেষ্টা করলে, এটাই যদি একমাত্র active branch হয়, তাহলে বন্ধ করতে দেওয়া হবে না
                            if (!newVal) {
                              const activeCount = allBranches.filter((x: any) => x.is_active !== false).length;
                              if (activeCount <= 1) {
                                alert('⚠️ সব শাখা বন্ধ করা যাবে না! অন্তত একটা শাখা সবসময় চালু থাকতে হবে।');
                                return;
                              }
                            }
                            await supabase.from('branches').update({ is_active: newVal }).eq('id', b.id);
                            fetchBranches();
                          }}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: b.is_active !== false ? PINK : '#d1d5db', borderRadius: '24px', transition: '0.2s' }}>
                          <span style={{ position: 'absolute', height: '18px', width: '18px', left: b.is_active !== false ? '23px' : '3px', bottom: '3px', background: 'white', borderRadius: '50%', transition: '0.2s' }} />
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {showEmailForm && (
              <div style={{ background: '#fdf2f8', border: `1px solid ${PINK_BORDER}`, borderRadius: '12px', padding: '16px' }}>
                <button onClick={() => setShowEmailForm(false)} style={{ background: 'none', border: 'none', color: PINK, fontSize: '13px', cursor: 'pointer', marginBottom: '8px', padding: 0 }}>← ব্যাক</button>
                <p style={{ fontWeight: 'bold', fontSize: '15px', color: PINK, margin: '0 0 4px 0' }}>📧 কাস্টমারদের ইমেইল পাঠান</p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px 0' }}>মেসেজে {'{name}'} লিখলে কাস্টমারের নাম বসে যাবে</p>
                <input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="সাবজেক্ট লিখুন..."
                  style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '10px 12px', width: '100%', fontSize: '14px', marginBottom: '8px', boxSizing: 'border-box', outline: 'none', color: '#1f2937' }}
                />
                <textarea
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  placeholder="প্রিয় {name}, আমাদের নতুন অফার..."
                  rows={6}
                  style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '10px 12px', width: '100%', fontSize: '14px', marginBottom: '8px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', color: '#1f2937' }}
                />
                <button
                  onClick={async () => {
                    if (!emailSubject || !emailMessage) { alert('সাবজেক্ট এবং মেসেজ লিখুন!'); return; }
                    if (!confirm('সব কাস্টমারকে ইমেইল পাঠানো হবে। নিশ্চিত?')) return;
                    setSendingEmail(true);
                    try {
                      const res = await fetch('https://jthdtmqrapnfmmmeuqsw.supabase.co/functions/v1/smart-worker', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subject: emailSubject, message: emailMessage })
                      });
                      const data = await res.json();
                      if (data.ok) { alert(`✅ ${data.sent} জন কাস্টমারকে ইমেইল পাঠানো হয়েছে!`); setEmailSubject(''); setEmailMessage(''); }
                      else { alert('সমস্যা: ' + (data.error || 'অজানা সমস্যা')); }
                    } catch (e: any) {
                      alert('সমস্যা: ' + e.message);
                    }
                    setSendingEmail(false);
                  }}
                  disabled={sendingEmail}
                  style={{ background: PINK, color: 'white', border: 'none', borderRadius: '10px', padding: '12px', width: '100%', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', opacity: sendingEmail ? 0.5 : 1 }}
                >
{sendingEmail ? 'পাঠানো হচ্ছে...' : '📧 ইমেইল পাঠান'}
                </button>
              </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {showSellerDrawer && <SellerPanel seller={sellerUser} onClose={() => setShowSellerDrawer(false)} />}
      {showAdminDrawer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAdminDrawer(false)} />
          <div style={{ position: 'relative', marginLeft: 'auto', width: '100%', maxWidth: '380px', background: 'white', height: '100%', overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)' }}>
            <div style={{ background: PINK, color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{role === 'editor' ? `✏️ ${localStorage.getItem('editor_page_name') || 'Editor'} Panel` : localStorage.getItem('current_page_id') ? `📋 ${localStorage.getItem('current_page_name') || 'Admin'} Panel` : '👑 Admin Panel'}</h2>
              <button onClick={() => setShowAdminDrawer(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto' }}>
                {[{ key: 'today', label: 'আজকে' }, { key: 'yesterday', label: 'গতকাল' }, { key: 'week', label: 'এই সপ্তাহ' }, { key: 'month', label: 'এই মাস' }].map(d => (<button key={d.key} onClick={() => { setDateFilter(d.key); setOrderSearch(''); }} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', border: '2px solid', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, borderColor: dateFilter === d.key ? PINK : '#e5e7eb', background: dateFilter === d.key ? PINK : 'white', color: dateFilter === d.key ? 'white' : '#374151' }}>{d.label}</button>))}
              </div>
              <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="🔍 তারিখ, নাম, ফোন বা অর্ডার নম্বর..." style={{ border: `2px solid ${PINK_BORDER}`, borderRadius: '10px', padding: '8px 12px', width: '100%', fontSize: '13px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', color: '#1f2937' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: PINK_LIGHT, borderRadius: '12px', padding: '12px', textAlign: 'center', border: `1px solid ${PINK_BORDER}` }}><p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>💰 Sales</p><p style={{ fontSize: '22px', fontWeight: 'bold', color: PINK, margin: 0 }}>{filteredSales} Tk</p></div>
                <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '12px', textAlign: 'center', border: '1px solid #bfdbfe' }}><p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>📦 Orders</p><p style={{ fontSize: '22px', fontWeight: 'bold', color: '#1d4ed8', margin: 0 }}>{filteredOrders2} টি</p></div>
              </div>
            </div>
            {role === 'admin' && (
              <div style={{ padding: '0 16px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb', borderRadius: '12px', padding: '12px' }}>
                  <div><p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', margin: '0 0 2px 0' }}>🖨️ Auto Print</p><p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>নতুন অর্ডারে অটো প্রিন্ট</p></div>
                  <button onClick={toggleAutoPrint} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', border: 'none', cursor: 'pointer', background: autoPrint ? PINK : '#e5e7eb', color: autoPrint ? 'white' : '#6b7280' }}>{autoPrint ? '✅ চালু' : '❌ বন্ধ'}</button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', padding: '0 16px 12px', overflowX: 'auto' }}>
             {[{ key: 'orders', label: '📋 Orders' }, ...(role === 'admin' ? [{ key: 'sellers', label: '🏪 Sellers' }, { key: 'withdrawals', label: '💰 Withdraw' }] : [])].map(t => (
  <button key={t.key} onClick={() => { setAdminTab(t.key); if (t.key === 'orders') markAllRead(); }} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', background: adminTab === t.key ? PINK : '#f3f4f6', color: adminTab === t.key ? 'white' : '#374151', position: 'relative' }}>
    {t.label}
    {t.key === 'orders' && unreadCount > 0 && (
      <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', fontSize: '10px', minWidth: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', padding: '0 3px' }}>{unreadCount}</span>
    )}
  </button>
))}
              <button onClick={handleLogout} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#dc2626' }}>Logout</button>
            </div>
            {adminTab === 'orders' && (
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dateFilteredOrders.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>কোনো অর্ডার নেই</p>}
                {dateFilteredOrders.map((order: any) => (
                  <div key={order.id} onDoubleClick={() => setSelectedOrder(order)} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '14px', margin: '0 0 2px 0' }}>#{order.id} - {order.customer_name}</h3>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>{order.customer_phone}</p>
                        {order.transaction_id && <p style={{ fontSize: '12px', color: PINK, margin: '2px 0', fontWeight: '600' }}>💳 TrxID: {order.transaction_id}</p>}
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>{order.district}, {order.upazila}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0' }}>{new Date(order.created_at).toLocaleString('bn-BD')}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <p style={{ fontWeight: 'bold', color: PINK, margin: 0 }}>{order.total_amount} Tk</p>
                       <select value={order.status} onChange={e => { e.stopPropagation(); updateOrderStatus(order.id, e.target.value, order.customer_phone); }} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px 6px', fontSize: '12px', cursor: 'pointer' }}>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">🚚 Shipped</option>
                          <option value="delivered">Delivered</option>
                          {role === 'admin' && <option value="cancelled">Cancelled</option>}
                        </select>
                        {order.status === 'shipped' && (
                          <div style={{ marginTop: '4px', display: 'flex', gap: '4px' }}>
                            <input
                              placeholder="ট্র্যাকিং লিংক দিন..."
                              defaultValue={order.tracking_url || ''}
                              onBlur={async e => {
                                await supabase.from('orders').update({ tracking_url: e.target.value }).eq('id', order.id);
                                fetchOrders();
                              }}
                              style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 6px', fontSize: '11px', width: '100%', outline: 'none', color: '#1f2937' }}
                            />
                          </div>
                        )}
                        <button onClick={e => { e.stopPropagation(); setSelectedOrder(order); }} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>🖨️ Print/Save</button>
                      </div>
                    </div>
                    <div style={{ marginTop: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
                      {order.order_items?.map((item: any) => (<div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', padding: '3px 0', borderBottom: '1px dashed #f3f4f6' }}><span>{item.products?.name} × {item.quantity} {item.products?.unit}</span><span style={{ fontWeight: '500' }}>{item.price * item.quantity} Tk</span></div>))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', color: PINK, marginTop: '4px' }}><span>মোট:</span><span>{order.total_amount} Tk</span></div>
                    </div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '4px' }}>ডাবল ক্লিক করুন পুরো রিসিট দেখতে</p>
                  </div>
                ))}
              </div>
            )}
            {adminTab === 'sellers' && role === 'admin' && <SellerManagement />}
            {adminTab === 'withdrawals' && role === 'admin' && <WithdrawalManagement />}
          </div>
        </div>
      )}
    </div>
  );
}
function formatBDPhone(phone: string): string {
  // 👑 সব ধরনের ফরম্যাট (01xxxxxxxxx, +8801xxxxxxxxx, 8801xxxxxxxxx) থেকে সঠিক 88 কোড বসানো
  let cleaned = phone.replace(/[^0-9]/g, ''); // শুধু সংখ্যা রাখা
  if (cleaned.startsWith('01')) {
    cleaned = '88' + cleaned;
  } else if (cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '88' + '0' + cleaned;
  }
  // যদি ইতিমধ্যে 880 দিয়ে শুরু হয়, তাহলে ঠিকই আছে
  return cleaned;
}

function sendWhatsAppConfirmation(phone: string) {
  const formattedPhone = formatBDPhone(phone);
  const message = `আসসালামু আলাইকুম! Sohel Mart-এ আপনার অর্ডারটি কনফার্ম হয়েছে। আমাদের ওপর ভরসা রাখার জন্য ধন্যবাদ। খুব শিগগিরই আমরা আপনার সেরা ও তাজা বাজার আপনার ঠিকানায় পৌঁছে দেবো! - সোহেল মার্ট টিম`;
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}