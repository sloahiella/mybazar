'use client';
import Header from './components/Header'
import SellerPanel from './components/SellerPanel'
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import ProductList from './components/ProductList';
import CustomerAuth from './components/CustomerAuth';
import HeroBanner from './components/HeroBanner'; 
import { requestNotificationPermission, messaging, onMessage } from './firebase';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

const ADMIN_PASSWORD = 'sloahiella@admin';
const LOGO_URL = 'https://jthdtmqrapnfmmmeuqsw.supabase.co/storage/v1/object/public/products/Untitled%20folder/logo.jpg';
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

// 🎛️ ব্যানার আপলোড এবং লাইভ কাটার (Cropper) মডিউল
function BannerManagement() {
  const [banners, setBanners] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [cropTop, setCropTop] = useState(15);
  const [cropBottom, setCropBottom] = useState(15);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => { fetchBanners(); }, []);

  async function fetchBanners() {
    const { data } = await supabase.storage.from('products').list('', { search: 'hero-banner' });
    if (data) {
      const urls = data.map(file => supabase.storage.from('products').getPublicUrl(file.name).data.publicUrl);
      setBanners(urls);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleCropAndUpload() {
    if (!imageRef.current || !selectedFile) return;
    setUploading(true);

    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sourceX = 0;
    const sourceY = (img.naturalHeight * cropTop) / 100;
    const sourceWidth = img.naturalWidth;
    const sourceHeight = img.naturalHeight - (img.naturalHeight * (cropTop + cropBottom)) / 100;

    canvas.width = sourceWidth;
    canvas.height = sourceHeight;

    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const fileName = `hero-banner-${Date.now()}.jpg`;
      
      const { error } = await supabase.storage.from('products').upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

      if (error) { alert('আপলোড হয়নি: ' + error.message); } 
      else {
        alert('নতুন ব্যানার পারফেক্টলি কেটে লাইভ করা হয়েছে! 🎉');
        setImageSrc(null); setSelectedFile(null);
        fetchBanners();
        window.location.reload();
      }
      setUploading(false);
    }, 'image/jpeg', 0.95);
  }

  async function deleteBanner(url: string) {
    if (!confirm('এই ব্যানারটি কি নিশ্চিত মুছে ফেলতে চান?')) return;
    const fileName = url.split('/').pop()?.split('?')[0];
    if (fileName) {
      await supabase.storage.from('products').remove([decodeURIComponent(fileName)]);
      alert('ব্যানার মুছে ফেলা হয়েছে!');
      fetchBanners();
      window.location.reload();
    }
  }

  return (
    <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '14px', border: '1px solid #e5e7eb', marginTop: '8px' }}>
      <p style={{ fontWeight: 'bold', fontSize: '13px', color: PINK_DARK, marginBottom: '8px' }}>📤 নতুন ব্যানার কাটুন ও যোগ করুন</p>
      
      <div style={{ border: `2px dashed ${PINK_BORDER}`, padding: '12px', borderRadius: '10px', textAlign: 'center', background: '#fff', marginBottom: '10px' }}>
        <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '12px', width: '100%' }} />
      </div>

      {imageSrc && (
        <div style={{ background: '#111827', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
          <p style={{ color: '#fff', fontSize: '11px', textAlign: 'center', margin: '0 0 6px 0' }}>↕️ স্লাইডার টেনে উপর-নিচ সাইজ করুন</p>
          
          <div style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
            <img ref={imageRef} src={imageSrc} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${cropTop}%`, background: 'rgba(0,0,0,0.75)', borderBottom: '2px dashed #f43f5e' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${cropBottom}%`, background: 'rgba(0,0,0,0.75)', borderTop: '2px dashed #f43f5e' }} />
          </div>

          <div style={{ background: '#fff', padding: '8px', borderRadius: '6px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#374151', display: 'block' }}>🔼 উপর থেকে কাটুন: 
              <input type="range" min="0" max="45" value={cropTop} onChange={e => setCropTop(Number(e.target.value))} style={{ width: '100%' }} />
            </label>
            <label style={{ fontSize: '11px', color: '#374151', display: 'block' }}>🔽 নিচ থেকে কাটুন: 
              <input type="range" min="0" max="45" value={cropBottom} onChange={e => setCropBottom(Number(e.target.value))} style={{ width: '100%' }} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <button onClick={handleCropAndUpload} disabled={uploading} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', flex: 1, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              {uploading ? 'প্রসেসিং...' : '✂️ ব্যানার কেটে আপলোড দিন'}
            </button>
            <button onClick={() => { setImageSrc(null); setSelectedFile(null); }} style={{ background: '#4b5563', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', cursor: 'pointer' }}>বাতিল</button>
          </div>
        </div>
      )}

      <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#374151', margin: '8px 0 4px 0' }}>🖼️ লাইভ ব্যানার লিস্ট ({banners.length}):</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {banners.map((url, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <img src={url} alt="" style={{ width: '80px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />
            <button onClick={() => deleteBanner(url)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>🗑️ মুছুন</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderReceipt({ order, onClose, isAdmin }: { order: any; onClose: () => void; isAdmin: boolean }) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = printRef.current?.innerHTML;
    const win = window.open('', '_blank');
    if (!win || !content) return;
    win.document.write(`<html><head><title>Order #${order.id}</title></head><body>${content}</body></html>`);
    win.document.close(); win.print();
  }

  function handleSave() {
    const lines = [`অর্ডার #: ${order.id}`, `নাম: ${order.customer_name}`, `ফোন: ${order.customer_phone}`, `সর্বমোট: ${order.total_amount} Tk`];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `order-${order.id}.txt`; a.click(); URL.revokeObjectURL(url);
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
        <div ref={printRef} style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2px 1fr', border: `2px solid ${PINK}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '14px', background: PINK_LIGHT }}>
              <img src={LOGO_URL} alt="লোগো" style={{ height: '36px', borderRadius: '6px' }} />
              <p style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '6px' }}>সোহেল মার্ট</p>
            </div>
            <div style={{ background: PINK }} />
            <div style={{ padding: '14px' }}>
              <p style={{ fontSize: '11px' }}>নাম: {order.customer_name}</p>
              <p style={{ fontSize: '11px' }}>ফোন: {order.customer_phone}</p>
              <p style={{ fontSize: '11px' }}>ঠিকানা: {order.address}</p>
            </div>
          </div>
          {order.order_items?.map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px dashed #e5e7eb' }}>
              <span>{item.products?.name} × {item.quantity}</span>
              <span>{item.price * item.quantity} Tk</span>
            </div>
          ))}
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '10px', textAlign: 'right' }}>মোট: {order.total_amount} Tk</p>
        </div>
      </div>
    </div>
  );
}

function AdminSellerView({ seller, onBack }: { seller: any; onBack: () => void }) {
  const [orders, setOrders] = useState<any[]>([])
  const [dateFilter, setDateFilter] = useState('today')
  useEffect(() => {
    async function getOrders() {
      const { data } = await supabase.from('order_items').select('*, products:product_id(name, image_url, unit)').eq('seller_id', seller.id);
      if (data) setOrders(data);
    }
    getOrders();
  }, [seller.id]);
  return (
    <div style={{ padding: '12px' }}>
      <button onClick={onBack} style={{ padding: '4px 10px', borderRadius: '6px', background: '#e5e7eb', border: 'none', cursor: 'pointer' }}>← ব্যাক</button>
      <p style={{ fontWeight: 'bold', marginTop: '8px' }}>🏪 {seller.shop_name} এর সেলস</p>
      {orders.map((o: any) => (
        <div key={o.id} style={{ background: '#fff', padding: '8px', borderRadius: '8px', marginBottom: '6px', border: '1px solid #e5e7eb' }}>
          <p style={{ margin: 0, fontSize: '12px' }}>{o.products?.name} × {o.quantity}</p>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#16a34a' }}>৳{o.price * o.quantity}</p>
        </div>
      ))}
    </div>
  );
}

function SellerManagement() {
  const [sellers, setSellers] = useState<any[]>([])
  const [selectedSeller, setSelectedSeller] = useState<any>(null)
  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('sellers').select('*, profiles(full_name, phone)').order('created_at', { ascending: false });
      if (data) setSellers(data);
    }
    load();
  }, []);
  if (selectedSeller) return <AdminSellerView seller={selectedSeller} onBack={() => setSelectedSeller(null)} />
  return (
    <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {sellers.map(s => (
        <div key={s.id} onClick={() => setSelectedSeller(s)} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px', cursor: 'pointer' }}>
          <p style={{ fontWeight: 'bold', margin: 0, fontSize: '13px' }}>🏪 {s.shop_name}</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#6b7280' }}>👤 {s.profiles?.full_name} ({s.profiles?.phone})</p>
        </div>
      ))}
    </div>
  );
}

function WithdrawalManagement() {
  return <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>কোনো রিকোয়েস্ট পেন্ডিং নেই</p>;
}

export const dynamic = 'force-dynamic';
export default function Home() {
  const [branches, setBranches] = useState<Branch[]>([]);
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
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    fetchBranches();
    const savedRole = localStorage.getItem('role');
    if (savedRole) setRole(savedRole);
    const savedPhone = localStorage.getItem('customer_phone');
    if (savedPhone) setCustomer({ phone: savedPhone });
  }, []);

  useEffect(() => {
    if (role === 'admin' || role === 'editor') {
      fetchOrders();
    }
  }, [role]);

  async function fetchBranches() {
    const { data } = await supabase.from('branches').select('*');
    if (data) setBranches(data as Branch[]);
  }

  async function fetchOrders(filterPageId?: string) {
    const activePageId = filterPageId || localStorage.getItem('current_page_id');
    const { data } = await supabase.from('orders').select('*, order_items(*, products(name, name_bn, unit, image_url, page_id, product_code))').order('created_at', { ascending: false });
    if (data) {
      let filteredData = data;
      if (activePageId) { filteredData = data.filter((o: any) => o.order_items?.some((item: any) => String(item.products?.page_id) === String(activePageId))); }
      setOrders(filteredData); setTotalOrders(filteredData.length);
    }
  }

  async function updateOrderStatus(id: number, status: string) { await supabase.from('orders').update({ status }).eq('id', id); fetchOrders(); }

  async function handleLogin() {
    if (loginType === 'admin') {
      if (password === ADMIN_PASSWORD) { setRole('admin'); localStorage.setItem('role', 'admin'); setShowLoginModal(false); setPassword(''); setLoginError(''); }
      else { setLoginError('Admin পাসওয়ার্ড ভুল!'); }
    }
  }

  function handleLogout() { setRole(null); localStorage.removeItem('role'); setShowAdminDrawer(false); }

  const dateFilteredOrders = orders.filter((o: any) => {
    if (orderSearch) return String(o.id).includes(orderSearch) || o.customer_phone?.includes(orderSearch);
    return true;
  });

  if (!selectedBranch) {
    return (
      <div style={{ minHeight: '100vh', background: PINK_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <img src={LOGO_URL} alt="লোগো" style={{ height: '80px', borderRadius: '12px', marginBottom: '12px', cursor: 'pointer' }}
            onClick={() => { const count = parseInt(sessionStorage.getItem('logoClick') || '0') + 1; sessionStorage.setItem('logoClick', String(count)); if (count >= 3) { sessionStorage.removeItem('logoClick'); setShowLoginModal(true); } }} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: PINK, margin: '0 0 16px 0' }}>সোহেল মার্ট</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {branches.map((branch) => (<button key={branch.id} onClick={() => setSelectedBranch(branch)} style={{ padding: '14px', background: PINK_LIGHT, border: `2px solid ${PINK_BORDER}`, borderRadius: '12px', color: PINK_DARK, fontWeight: '600', cursor: 'pointer' }}>{branch.name_bn || branch.name}</button>))}
          </div>
        </div>
        {showLoginModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', maxWidth: '300px', width: '100%' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: PINK, textAlign: 'center', marginBottom: '12px' }}>🔐 Admin লগইন</h2>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="পাসওয়ার্ড দিন" style={{ border: `2px solid ${PINK_BORDER}`, borderRadius: '8px', padding: '10px', width: '100%', marginBottom: '10px', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleLogin} style={{ background: PINK, color: 'white', border: 'none', borderRadius: '8px', padding: '10px', flex: 1, cursor: 'pointer', fontWeight: 'bold' }}>লগইন</button>
                <button onClick={() => setShowLoginModal(false)} style={{ background: '#e5e7eb', borderRadius: '8px', padding: '10px', border: 'none', cursor: 'pointer' }}>বাতিল</button>
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
      <Header
        role={role}
        sellerUser={sellerUser}
        onAdminClick={() => { setShowAdminDrawer(true); fetchOrders(); }}
        onMenuClick={() => setShowPageMenu(true)}
        onCartClick={() => setOpenCart(true)}
      />

      <HeroBanner />

      <ProductList
        branch={selectedBranch}
        role={role}
        openMenu={showPageMenu}
        onMenuClose={() => setShowPageMenu(false)}
        openCart={openCart}
        onCartClose={() => setOpenCart(false)}
        onPageChange={(pageId: string | null) => {
          localStorage.setItem('current_page_id', pageId || '');
          fetchOrders(pageId || undefined);
        }}
      />

      {showAdminDrawer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex' }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAdminDrawer(false)} />
          <div style={{ position: 'relative', marginLeft: 'auto', width: '100%', maxWidth: '360px', background: 'white', height: '100%', overflowY: 'auto', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)' }}>
            <div style={{ background: PINK, color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>👑 সোহেল মার্ট এডমিন প্যানেল</h2>
              <button onClick={() => setShowAdminDrawer(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}>✕</button>
            </div>
            
            {/* 👑 মেইন মেনু ট্যাব সিলেকশন */}
            <div style={{ display: 'flex', gap: '4px', padding: '10px 16px', background: '#f3f4f6', overflowX: 'auto' }}>
              <button onClick={() => setAdminTab('orders')} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer', background: adminTab === 'orders' ? PINK : '#fff', color: adminTab === 'orders' ? '#fff' : '#374151', fontWeight: 'bold' }}>📦 অর্ডারস</button>
              <button onClick={() => setAdminTab('banners')} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer', background: adminTab === 'banners' ? PINK : '#fff', color: adminTab === 'banners' ? '#fff' : '#374151', fontWeight: 'bold' }}>🖼️ ব্যানার সেটিংস</button>
              <button onClick={() => setAdminTab('sellers')} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer', background: adminTab === 'sellers' ? PINK : '#fff', color: adminTab === 'sellers' ? '#fff' : '#374151', fontWeight: 'bold' }}>🏪 সেলার</button>
              <button onClick={handleLogout} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#dc2626' }}>Logout</button>
            </div>

            <div style={{ padding: '12px 0' }}>
              {/* 🖼️ ব্যানার ট্যাব কন্টেন্ট */}
              {adminTab === 'banners' && <BannerManagement />}

              {/* 📦 অর্ডার ট্যাব কন্টেন্ট */}
              {adminTab === 'orders' && (
                <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="🔍 অর্ডার নম্বর বা ফোন..." style={{ border: `1px solid #e5e7eb`, borderRadius: '8px', padding: '8px', width: '100%', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  {dateFilteredOrders.map((order: any) => (
                    <div key={order.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', fontSize: '13px' }}>#{order.id} - {order.customer_name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>ফোন: {order.customer_phone}</p>
                      <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: PINK, fontSize: '13px' }}>{order.total_amount} Tk</p>
                      <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)} style={{ marginTop: '6px', width: '100%', padding: '4px', borderRadius: '6px', fontSize: '12px' }}>
                        <option value="pending">⏳ Pending</option>
                        <option value="confirmed">✔️ Confirmed</option>
                        <option value="shipped">🚚 Shipped</option>
                        <option value="delivered">✅ Delivered</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === 'sellers' && <SellerManagement />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}