'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

function PageItem({ page, selectedPage, onSelectPage, isAdmin, onRefresh, depth = 0, closeMenu, onDragStart, onDragOver, onDrop, isDragging, branch }) {
  const [showDotMenu, setShowDotMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);
  const [showPasswordSet, setShowPasswordSet] = useState(false);
  const [showPaymentSet, setShowPaymentSet] = useState(false);
  const [editName, setEditName] = useState(page.name);
  const [editNameBn, setEditNameBn] = useState(page.name_bn || '');
  const [subName, setSubName] = useState('');
  const [subNameBn, setSubNameBn] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [bkashNumber, setBkashNumber] = useState(page.bkash_number || '');
  const [nagadNumber, setNagadNumber] = useState(page.nagad_number || '');
  const [rocketNumber, setRocketNumber] = useState(page.rocket_number || '');
  const [subPages, setSubPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // সাব-ক্যাটাগরির ড্রাগ অ্যান্ড ড্রপ স্টেট
  const [subDragIndex, setSubDragIndex] = useState(null);
  const [subDragOverIndex, setSubDragOverIndex] = useState(null);

  useEffect(() => { fetchSubPages(); }, [page.id]);

  async function fetchSubPages() {
    const { data } = await supabase.from('pages').select('*').eq('parent_id', page.id).order('sort_order');
    if (data) setSubPages(data);
  }

  async function updatePage() {
    setLoading(true);
    await supabase.from('pages').update({ name: editName, name_bn: editNameBn || editName }).eq('id', page.id);
    setShowEdit(false); setLoading(false); onRefresh();
  }

  async function togglePage() {
    await supabase.from('pages').update({ is_active: !page.is_active }).eq('id', page.id);
    setShowDotMenu(false); onRefresh();
  }

  async function deletePage() {
    if (!confirm('এই পেজ মুছে দেবেন?')) return;
    const { error } = await supabase.from('pages').delete().eq('id', page.id);
    if (error) { alert('সমস্যা: ' + error.message); return; }
    setShowDotMenu(false); onRefresh();
  }

  async function addSubPage() {
    if (!subName) return;
    setLoading(true);
    // 👑 ফিক্সড: সাব-ক্যাটাগরি তৈরি করার সময় কারেন্ট ব্রাঞ্চের আইডি (branch.id) নিখুঁতভাবে লক করা হলো ভাই
    await supabase.from('pages').insert({ 
      name: subName, 
      name_bn: subNameBn || subName, 
      parent_id: page.id, 
      branch_id: branch.id, 
      sort_order: subPages.length, 
      is_active: true 
    });
    setSubName(''); setSubNameBn(''); setShowAddSub(false);
    fetchSubPages(); setLoading(false);
    setIsExpanded(true);
  }

  async function setPassword() {
    if (!newPassword) return;
    await supabase.from('pages').update({ vendor_password: newPassword }).eq('id', page.id);
    setShowPasswordSet(false); setNewPassword('');
    alert('Password সেট হয়েছে!');
  }

  async function savePaymentNumbers() {
    await supabase.from('pages').update({ bkash_number: bkashNumber || null, nagad_number: nagadNumber || null, rocket_number: rocketNumber || null }).eq('id', page.id);
    setShowPaymentSet(false); alert('Payment নম্বর সেট হয়েছে!');
  }

  // সাব-ক্যাটাগরি ড্রাগ লজিক
  function handleSubDragStart(index) { setSubDragIndex(index); }
  function handleSubDragOver(index) { if (subDragIndex !== null && subDragIndex !== index) setSubDragOverIndex(index); }
  async function handleSubDrop() {
    if (subDragIndex === null || subDragOverIndex === null || subDragIndex === subDragOverIndex) { setSubDragIndex(null); setSubDragOverIndex(null); return; }
    const items = Array.from(subPages);
    const [removed] = items.splice(subDragIndex, 1);
    items.splice(subDragOverIndex, 0, removed);
    setSubPages(items);
    setSubDragIndex(null); setSubDragOverIndex(null);
    for (let i = 0; i < items.length; i++) {
      await supabase.from('pages').update({ sort_order: i }).eq('id', items[i].id);
    }
    fetchSubPages();
  }

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const visibleSubPages = isAdmin ? subPages : subPages.filter(p => p.is_active !== false);
  const hasSubPages = visibleSubPages.length > 0;

  const inp = { border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', width: '100%', boxSizing: 'border-box', color: '#1f2937' };

  return (
    <div 
      onDragOver={e => { e.preventDefault(); onDragOver && onDragOver(); }} 
      onDrop={onDrop}
      style={{ marginLeft: depth > 0 ? 12 : 0, opacity: isDragging ? 0.5 : 1, border: isDragging ? '1px dashed #db2777' : 'none' }}
    >
      {showEdit ? (
        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input value={editNameBn} onChange={e => setEditNameBn(e.target.value)} placeholder="বাংলা নাম" style={inp} />
          <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="English name" style={inp} />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={updatePage} disabled={loading} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', flex: 1, cursor: 'pointer' }}>সেভ</button>
            <button onClick={() => setShowEdit(false)} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>বাতিল</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative', borderBottom: depth === 0 ? '1px solid #f3f4f6' : 'none' }}>
          
          {/* 👑 এডমিনের জন্য ক্যাটাগরি ড্রয়ারে ড্রাগ করার আইকন */}
          {isAdmin && (
            <span 
              draggable 
              onDragStart={onDragStart} 
              style={{ background: '#f3f4f6', color: '#9ca3af', fontSize: '12px', padding: '4px 6px', borderRadius: '4px', cursor: 'grab', userSelect: 'none', marginLeft: '6px' }}
            >
              ⠿
            </span>
          )}

          <div 
            onClick={() => { onSelectPage(page); closeMenu(); }} 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', background: selectedPage?.id === page.id ? '#db2777' : 'transparent', color: selectedPage?.id === page.id ? 'white' : '#374151', opacity: page.is_active === false ? 0.5 : 1 }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {depth > 0 && !isAdmin && <span style={{ color: '#9ca3af', marginRight: '6px' }}>└─</span>}
              {page.name_bn || page.name}
              {page.is_active === false && <span style={{ fontSize: '10px', color: '#ef4444', marginLeft: '4px' }}>(বন্ধ)</span>}
            </span>
          </div>

          {hasSubPages && (
            <button 
              onClick={toggleExpand}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', fontSize: '12px', color: selectedPage?.id === page.id ? 'white' : '#9ca3af', position: 'absolute', right: isAdmin ? '35px' : '10px', zIndex: 10, display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ▼
            </button>
          )}

          {isAdmin && (
            <div style={{ position: 'relative' }}>
              <button onClick={e => { e.stopPropagation(); setShowDotMenu(!showDotMenu); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: '16px', color: selectedPage?.id === page.id ? 'white' : '#9ca3af', fontWeight: 'bold' }}>⋯</button>
              {showDotMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowDotMenu(false)} />
                  <div style={{ position: 'absolute', right: 0, top: '32px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 9999, width: '180px', border: '1px solid #e5e7eb' }}>
                    <button onClick={() => { setShowEdit(true); setShowDotMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer', color: '#374151' }}>✏️ নাম পরিবর্তন</button>
                    <button onClick={togglePage} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer', color: '#374151' }}>{page.is_active === false ? '👁️ চালু করুন' : '🚫 বন্ধ করুন'}</button>
                    <button onClick={() => { setShowAddSub(true); setShowDotMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer', color: '#374151' }}>¼ সাব-পেজ যোগ</button>
                    <button onClick={() => { setShowPasswordSet(true); setShowDotMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer', color: '#374151' }}>🔑 Password সেট করুন</button>
                    <button onClick={() => { setShowPaymentSet(true); setShowDotMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer', color: '#374151' }}>💳 Payment নম্বর সেট</button>
                    <button onClick={deletePage} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}>🗑️ মুছুন</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {showAddSub && (
        <div style={{ marginLeft: '12px', background: '#eff6ff', borderRadius: '8px', padding: '10px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 'bold', margin: 0 }}>সাব-পেজ যোগ করুন</p>
          <input value={subNameBn} onChange={e => setSubNameBn(e.target.value)} placeholder="বাংলা নাম" style={inp} />
          <input value={subName} onChange={e => setSubName(e.target.value)} placeholder="English name" style={inp} />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={addSubPage} disabled={loading} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', flex: 1, cursor: 'pointer' }}>যোগ করুন</button>
            <button onClick={() => setShowAddSub(false)} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>বাতিল</button>
          </div>
        </div>
      )}

      {showPasswordSet && (
        <div style={{ marginLeft: '12px', background: '#fdf2f8', borderRadius: '8px', padding: '10px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ fontSize: '12px', color: '#db2777', fontWeight: 'bold', margin: 0 }}>🔑 Editor Password সেট করুন</p>
          <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="password লিখুন" type="text" style={inp} />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={setPassword} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', flex: 1, cursor: 'pointer' }}>সেট করুন</button>
            <button onClick={() => { setShowPasswordSet(false); setNewPassword(''); }} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>বাতিল</button>
          </div>
        </div>
      )}

      {showPaymentSet && (
        <div style={{ marginLeft: '12px', background: '#f0fdf4', borderRadius: '8px', padding: '10px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold', margin: 0 }}>💳 Payment নম্বর সেট করুন</p>
          <input value={bkashNumber} onChange={e => setBkashNumber(e.target.value)} placeholder="💗 বিকাশ নম্বর" style={inp} />
          <input value={nagadNumber} onChange={e => setNagadNumber(e.target.value)} placeholder="🟠 নগদ নম্বর" style={inp} />
          <input value={rocketNumber} onChange={e => setRocketNumber(e.target.value)} placeholder="🚀 রকেট নম্বর" style={inp} />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={savePaymentNumbers} style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', flex: 1, cursor: 'pointer' }}>সেট করুন</button>
            <button onClick={() => setShowPaymentSet(false)} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>বাতিল</button>
          </div>
        </div>
      )}

      {hasSubPages && isExpanded && (
        <div style={{ background: '#fafafa', borderRadius: '8px', padding: '4px 0', marginTop: '2px' }}>
          {visibleSubPages.map((sub, sIndex) => (
            <PageItem 
              key={sub.id} 
              page={sub} 
              selectedPage={selectedPage} 
              onSelectPage={onSelectPage} 
              isAdmin={isAdmin} 
              onRefresh={() => { fetchSubPages(); onRefresh(); }} 
              depth={depth + 1} 
              closeMenu={closeMenu}
              onDragStart={() => handleSubDragStart(sIndex)}
              onDragOver={() => handleSubDragOver(sIndex)}
              onDrop={handleSubDrop}
              isDragging={subDragIndex === sIndex}
              branch={branch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PageMenu({ branch, selectedPage, onSelectPage, isAdmin, onAddProduct, onShowOrders, isOpenFromParent, onCloseFromParent }) {
  const [pages, setPages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageNameBn, setNewPageNameBn] = useState('');
  const [loading, setLoading] = useState(false);

  // মেইন ক্যাটাগরির ড্রাগ স্টেট
  const [menuDragIndex, setMenuDragIndex] = useState(null);
  const [menuDragOverIndex, setMenuDragOverIndex] = useState(null);

  useEffect(() => { fetchPages(); }, [branch]);

  useEffect(() => {
    setIsOpen(isOpenFromParent);
  }, [isOpenFromParent]);

  function closeMenu() {
    setIsOpen(false);
    if (onCloseFromParent) onCloseFromParent();
  }

  async function fetchPages() {
    const { data } = await supabase.from('pages').select('*').eq('branch_id', branch.id).is('parent_id', null).order('sort_order');
    if (data) setPages(data);
  }

  async function addPage() {
    if (!newPageName) return;
    setLoading(true);
    // 👑 ফিক্সড: মেইন ক্যাটাগরি তৈরি করার সময় কারেন্ট ব্রাঞ্চের আইডি (branch.id) নিখুঁতভাবে লক করা হলো ভাই
    await supabase.from('pages').insert({ 
      branch_id: branch.id, 
      name: newPageName, 
      name_bn: newPageNameBn || newPageName, 
      sort_order: pages.length, 
      is_active: true 
    });
    setNewPageName(''); setNewPageNameBn(''); setShowAddPage(false);
    fetchPages(); setLoading(false);
  }

  // মেইন ক্যাটাগরি ড্রাগ অ্যান্ড ড্রপ হ্যান্ডলার
  function handleMenuDragStart(index) { setMenuDragIndex(index); }
  function handleMenuDragOver(index) { if (menuDragIndex !== null && menuDragIndex !== index) setMenuDragOverIndex(index); }
  async function handleMenuDrop() {
    if (menuDragIndex === null || menuDragOverIndex === null || menuDragIndex === menuDragOverIndex) { setMenuDragIndex(null); setMenuDragOverIndex(null); return; }
    const items = Array.from(pages);
    const [removed] = items.splice(menuDragIndex, 1);
    items.splice(menuDragOverIndex, 0, removed);
    setPages(items);
    setMenuDragIndex(null); setMenuDragOverIndex(null);
    for (let i = 0; i < items.length; i++) {
      await supabase.from('pages').update({ sort_order: i }).eq('id', items[i].id);
    }
    fetchPages();
  }

  const visiblePages = isAdmin ? pages : pages.filter(p => p.is_active !== false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button onClick={() => setIsOpen(prev => !prev)} style={{ display: 'none' }}>
        ☰ পেজ
      </button>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }} onClick={closeMenu} />
          
          <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, background: 'white', zIndex: 9999, width: '300px', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(0,0,0,0.2)' }}>
            
            <div style={{ background: '#db2777', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 20 }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>☰ ক্যাটাগরি</h2>
              <button onClick={closeMenu} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
              <button onClick={() => { onSelectPage(null); closeMenu(); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', marginBottom: '4px', background: !selectedPage ? '#db2777' : 'transparent', color: !selectedPage ? 'white' : '#374151' }}>
                🏠 সব পণ্য
              </button>
              
              {visiblePages.map((page, index) => (
                <PageItem 
                  key={page.id} 
                  page={page} 
                  selectedPage={selectedPage} 
                  onSelectPage={(p) => { onSelectPage(p); }} 
                  isAdmin={isAdmin} 
                  onRefresh={fetchPages} 
                  depth={0} 
                  closeMenu={closeMenu}
                  onDragStart={() => handleMenuDragStart(index)}
                  onDragOver={() => handleMenuDragOver(index)}
                  onDrop={handleMenuDrop}
                  isDragging={menuDragIndex === index}
                  branch={branch}
                />
              ))}
              
              {isAdmin && selectedPage && (
                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '8px', paddingTop: '8px' }}>
                  <button onClick={() => { onAddProduct(selectedPage); closeMenu(); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer', color: '#1d4ed8', fontWeight: '500' }}>
                    + এই পেজে পণ্য যোগ করুন
                  </button>
                </div>
              )}
              {isAdmin && (
                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '8px', paddingTop: '8px' }}>
                  {showAddPage ? (
                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input value={newPageNameBn} onChange={e => setNewPageNameBn(e.target.value)} placeholder="বাংলা নাম" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', width: '100%', boxSizing: 'border-box', color: '#1f2937' }} />
                      <input value={newPageName} onChange={e => setNewPageName(e.target.value)} placeholder="English name" style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', width: '100%', boxSizing: 'border-box', color: '#1f2937' }} />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={addPage} disabled={loading} style={{ background: '#db2777', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', flex: 1, cursor: 'pointer' }}>যোগ করুন</button>
                        <button onClick={() => setShowAddPage(false)} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>বাতিল</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddPage(true)} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer', color: '#db2777', fontWeight: '500' }}>
                      + নতুন পেজ যোগ করুন
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', padding: '16px', background: '#ffffff', flexShrink: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', margin: '0 0 8px 0' }}>📞 যোগাযোগ</p>
              
              <a href="tel:01872149655" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555', margin: '6px 0', textDecoration: 'none' }}>
                📱 <span>01872149655</span>
              </a>
              
              <a href="https://wa.me/8801872149655" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#25D366', fontWeight: 'bold', margin: '6px 0', textDecoration: 'none' }}>
                <img src="https://cdn-icons-png.flaticon.com/128/3670/3670051.png" alt="WhatsApp" style={{ width: '16px', height: '16px' }} />
                <span>WhatsApp: 01872149655</span>
              </a>

              <a href="https://www.facebook.com/profile.php?id=61583250601904" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1877f2', fontWeight: 'bold', margin: '6px 0', textDecoration: 'none' }}>
                <img src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" alt="Facebook" style={{ width: '16px', height: '16px' }} />
                <span>Facebook Page</span>
              </a>

              <a href="https://youtube.com/@mdsohel-o9q1l?si=H1NMcxfnjeJ6rFED" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ff0000', fontWeight: 'bold', margin: '6px 0', textDecoration: 'none' }}>
                <img src="https://cdn-icons-png.flaticon.com/128/1384/1384060.png" alt="YouTube" style={{ width: '16px', height: '16px' }} />
                <span>YouTube Channel</span>
              </a>

              <a href="https://sohelmart.com" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2563eb', margin: '6px 0', textDecoration: 'none' }}>
                🌐 <span>sohelmart.com</span>
              </a>
            </div>

          </div>
        </>
      )}
    </div>
  );
}