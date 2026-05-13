'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

function PageItem({ page, selectedPage, onSelectPage, isAdmin, onRefresh, depth = 0 }) {
  const [showDotMenu, setShowDotMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);
  const [editName, setEditName] = useState(page.name);
  const [editNameBn, setEditNameBn] = useState(page.name_bn || '');
  const [subName, setSubName] = useState('');
  const [subNameBn, setSubNameBn] = useState('');
  const [subPages, setSubPages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSubPages(); }, []);

  async function fetchSubPages() {
    const { data } = await supabase.from('pages').select('*')
      .eq('parent_id', page.id).order('sort_order');
    if (data) setSubPages(data);
  }

  async function updatePage() {
    setLoading(true);
    await supabase.from('pages').update({
      name: editName, name_bn: editNameBn || editName
    }).eq('id', page.id);
    setShowEdit(false);
    setLoading(false);
    onRefresh();
  }

  async function togglePage() {
    await supabase.from('pages').update({ is_active: !page.is_active }).eq('id', page.id);
    setShowDotMenu(false);
    onRefresh();
  }

  async function deletePage() {
    if (!confirm('এই পেজ মুছে দেবেন?')) return;
    await supabase.from('pages').delete().eq('id', page.id);
    setShowDotMenu(false);
    onRefresh();
  }

  async function addSubPage() {
    if (!subName) return;
    setLoading(true);
    await supabase.from('pages').insert({
      name: subName, name_bn: subNameBn || subName,
      parent_id: page.id, branch_id: page.branch_id,
      sort_order: subPages.length, is_active: true
    });
    setSubName(''); setSubNameBn('');
    setShowAddSub(false);
    fetchSubPages();
    setLoading(false);
  }

  return (
    <div style={{ marginLeft: depth * 12 }}>
      {showEdit ? (
        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input value={editNameBn} onChange={e => setEditNameBn(e.target.value)}
            placeholder="বাংলা নাম"
            style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', width: '100%', boxSizing: 'border-box' }} />
          <input value={editName} onChange={e => setEditName(e.target.value)}
            placeholder="English name"
            style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', width: '100%', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={updatePage} disabled={loading}
              style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', flex: 1, cursor: 'pointer' }}>সেভ</button>
            <button onClick={() => setShowEdit(false)}
              style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>বাতিল</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
          <button
            onClick={() => onSelectPage(page)}
            style={{
              flex: 1, textAlign: 'left', padding: '8px 12px', borderRadius: '8px',
              fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer',
              background: selectedPage?.id === page.id ? '#15803d' : 'transparent',
              color: selectedPage?.id === page.id ? 'white' : '#374151',
              opacity: page.is_active === false ? 0.5 : 1,
            }}>
            {depth > 0 && <span style={{ color: '#9ca3af', marginRight: '4px' }}>└</span>}
            {page.name_bn || page.name}
            {page.is_active === false && <span style={{ fontSize: '10px', color: '#ef4444', marginLeft: '4px' }}>(বন্ধ)</span>}
          </button>

          {isAdmin && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={e => { e.stopPropagation(); setShowDotMenu(!showDotMenu); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: '16px', color: '#9ca3af', fontWeight: 'bold' }}>
                ⋯
              </button>
              {showDotMenu && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setShowDotMenu(false)} />
                  <div style={{
                    position: 'absolute', right: 0, top: '32px',
                    background: 'white', borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    zIndex: 9999, width: '180px',
                    border: '1px solid #e5e7eb',
                  }}>
                    <button onClick={() => { setShowEdit(true); setShowDotMenu(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer' }}>
                      ✏️ নাম পরিবর্তন
                    </button>
                    <button onClick={togglePage}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer' }}>
                      {page.is_active === false ? '👁️ চালু করুন' : '🚫 বন্ধ করুন'}
                    </button>
                    <button onClick={() => { setShowAddSub(true); setShowDotMenu(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer' }}>
                      ➕ সাব-পেজ যোগ
                    </button>
                    <button onClick={deletePage}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}>
                      🗑️ মুছুন
                    </button>
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
          <input value={subNameBn} onChange={e => setSubNameBn(e.target.value)}
            placeholder="বাংলা নাম (শাড়ী)"
            style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', width: '100%', boxSizing: 'border-box' }} />
          <input value={subName} onChange={e => setSubName(e.target.value)}
            placeholder="English name (saree)"
            style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', width: '100%', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={addSubPage} disabled={loading}
              style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', flex: 1, cursor: 'pointer' }}>যোগ করুন</button>
            <button onClick={() => setShowAddSub(false)}
              style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>বাতিল</button>
          </div>
        </div>
      )}

      {subPages.map(sub => (
        <PageItem key={sub.id} page={sub} selectedPage={selectedPage}
          onSelectPage={onSelectPage} isAdmin={isAdmin}
          onRefresh={() => { fetchSubPages(); onRefresh(); }}
          depth={depth + 1} />
      ))}
    </div>
  );
}

export default function PageMenu({ branch, selectedPage, onSelectPage, isAdmin, onAddProduct, onShowOrders }) {
  const [pages, setPages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageNameBn, setNewPageNameBn] = useState('');
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => { fetchPages(); }, [branch]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  async function fetchPages() {
    const { data } = await supabase.from('pages').select('*')
      .eq('branch_id', branch.id).is('parent_id', null).order('sort_order');
    if (data) setPages(data);
  }

  async function addPage() {
    if (!newPageName) return;
    setLoading(true);
    await supabase.from('pages').insert({
      branch_id: branch.id, name: newPageName,
      name_bn: newPageNameBn || newPageName,
      sort_order: pages.length, is_active: true
    });
    setNewPageName(''); setNewPageNameBn('');
    setShowAddPage(false);
    fetchPages();
    setLoading(false);
  }

  const visiblePages = isAdmin ? pages : pages.filter(p => p.is_active !== false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

      {/* পেজ মেনু */}
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(prev => !prev)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: isOpen ? '#15803d' : 'white',
            color: isOpen ? 'white' : '#15803d',
            border: '2px solid #15803d',
            padding: '8px 14px', borderRadius: '12px',
            fontWeight: '600', fontSize: '14px',
            whiteSpace: 'nowrap', cursor: 'pointer',
          }}>
          ☰ পেজ
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute', left: 0, top: '48px',
            background: 'white', borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            zIndex: 9999, width: '300px',
            border: '1px solid #e5e7eb',
            maxHeight: '400px', overflowY: 'auto',
          }}>
            <div style={{ padding: '8px' }}>
              <button
                onClick={() => { onSelectPage(null); setIsOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px',
                  borderRadius: '8px', fontSize: '14px', fontWeight: '500',
                  border: 'none', cursor: 'pointer', marginBottom: '4px',
                  background: !selectedPage ? '#15803d' : 'transparent',
                  color: !selectedPage ? 'white' : '#374151',
                }}>
                🏠 সব পণ্য
              </button>

              {visiblePages.map(page => (
                <PageItem key={page.id} page={page}
                  selectedPage={selectedPage}
                  onSelectPage={(p) => { onSelectPage(p); setIsOpen(false); }}
                  isAdmin={isAdmin} onRefresh={fetchPages} depth={0} />
              ))}

              {isAdmin && selectedPage && (
                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '8px', paddingTop: '8px' }}>
                  <button
                    onClick={() => { onAddProduct(selectedPage); setIsOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer', color: '#1d4ed8', fontWeight: '500' }}>
                    + এই পেজে পণ্য যোগ করুন
                  </button>
                </div>
              )}

              {isAdmin && (
                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '8px', paddingTop: '8px' }}>
                  {showAddPage ? (
                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input value={newPageNameBn} onChange={e => setNewPageNameBn(e.target.value)}
                        placeholder="বাংলা নাম"
                        style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', width: '100%', boxSizing: 'border-box' }} />
                      <input value={newPageName} onChange={e => setNewPageName(e.target.value)}
                        placeholder="English name"
                        style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', width: '100%', boxSizing: 'border-box' }} />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={addPage} disabled={loading}
                          style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', flex: 1, cursor: 'pointer' }}>যোগ করুন</button>
                        <button onClick={() => setShowAddPage(false)}
                          style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>বাতিল</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddPage(true)}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: 'none', cursor: 'pointer', color: '#15803d', fontWeight: '500' }}>
                      + নতুন পেজ যোগ করুন
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* কাস্টমারের অর্ডার লিস্ট বাটন */}
      {!isAdmin && (
        <button
          onClick={() => onShowOrders && onShowOrders()}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'white', color: '#15803d',
            border: '2px solid #15803d',
            padding: '8px 14px', borderRadius: '12px',
            fontWeight: '600', fontSize: '14px',
            whiteSpace: 'nowrap', cursor: 'pointer',
          }}>
          📋 অর্ডার লিস্ট
        </button>
      )}

    </div>
  );
}