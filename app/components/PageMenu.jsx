'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

function PageItem({ page, selectedPage, onSelectPage, isAdmin, onRefresh, depth = 0 }) {
  const [showMenu, setShowMenu] = useState(false);
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
    onRefresh();
  }

  async function deletePage() {
    if (!confirm('এই পেজ মুছে দেবেন?')) return;
    await supabase.from('pages').delete().eq('id', page.id);
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
        <div className="px-2 py-1 space-y-1">
          <input value={editNameBn} onChange={e => setEditNameBn(e.target.value)}
            placeholder="বাংলা নাম"
            className="border-2 border-gray-300 rounded-lg px-2 py-1 w-full text-xs" />
          <input value={editName} onChange={e => setEditName(e.target.value)}
            placeholder="English name"
            className="border-2 border-gray-300 rounded-lg px-2 py-1 w-full text-xs" />
          <div className="flex gap-1">
            <button onClick={updatePage} disabled={loading}
              className="bg-green-700 text-white px-2 py-1 rounded-lg text-xs flex-1">সেভ</button>
            <button onClick={() => setShowEdit(false)}
              className="bg-gray-200 text-gray-600 px-2 py-1 rounded-lg text-xs">বাতিল</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1 relative">
          <button
            onClick={() => onSelectPage(page)}
            className={`flex-1 text-left px-3 py-2 rounded-lg text-sm font-medium ${selectedPage?.id === page.id ? 'bg-green-700 text-white' : 'hover:bg-gray-50 text-gray-700'} ${page.is_active === false ? 'opacity-50' : ''}`}>
            {depth > 0 && <span className="text-gray-400 mr-1">└</span>}
            {page.name_bn || page.name}
            {page.is_active === false && <span className="text-xs text-red-400 ml-1">(বন্ধ)</span>}
          </button>

          {isAdmin && (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg text-sm font-bold">
                ⋯
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg z-50 w-44 border border-gray-200">
                    <button onClick={() => { setShowEdit(true); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                      ✏️ নাম পরিবর্তন
                    </button>
                    <button onClick={() => { togglePage(); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                      {page.is_active === false ? '👁️ চালু করুন' : '🚫 বন্ধ করুন'}
                    </button>
                    <button onClick={() => { setShowAddSub(true); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                      ➕ সাব-পেজ যোগ
                    </button>
                    <button onClick={() => { deletePage(); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
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
        <div className="px-2 py-1 space-y-1 ml-3 bg-blue-50 rounded-lg p-2 mt-1">
          <p className="text-xs text-blue-700 font-bold">সাব-পেজ যোগ করুন</p>
          <input value={subNameBn} onChange={e => setSubNameBn(e.target.value)}
            placeholder="বাংলা নাম (শাড়ী)"
            className="border-2 border-gray-300 rounded-lg px-2 py-1 w-full text-xs" />
          <input value={subName} onChange={e => setSubName(e.target.value)}
            placeholder="English name (saree)"
            className="border-2 border-gray-300 rounded-lg px-2 py-1 w-full text-xs" />
          <div className="flex gap-1">
            <button onClick={addSubPage} disabled={loading}
              className="bg-green-700 text-white px-2 py-1 rounded-lg text-xs flex-1">যোগ করুন</button>
            <button onClick={() => setShowAddSub(false)}
              className="bg-gray-200 text-gray-600 px-2 py-1 rounded-lg text-xs">বাতিল</button>
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
  const [showMenu, setShowMenu] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageNameBn, setNewPageNameBn] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPages(); }, [branch]);

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
    <div className="flex items-center gap-2">
      {/* পেজ মেনু বাটন */}
      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-1 bg-white text-green-700 border-2 border-green-700 px-3 py-2 rounded-xl font-medium text-sm">
          ☰ পেজ
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute left-0 top-12 bg-white rounded-xl shadow-lg z-50 w-72 border border-gray-200 max-h-96 overflow-y-auto">
              <div className="p-2">
                <button
                  onClick={() => { onSelectPage(null); setShowMenu(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium mb-1 ${!selectedPage ? 'bg-green-700 text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                  🏠 সব পণ্য
                </button>

                {visiblePages.map(page => (
                  <PageItem key={page.id} page={page}
                    selectedPage={selectedPage}
                    onSelectPage={(p) => { onSelectPage(p); setShowMenu(false); }}
                    isAdmin={isAdmin} onRefresh={fetchPages} depth={0} />
                ))}

                {isAdmin && selectedPage && (
                  <div className="border-t mt-2 pt-2 px-2">
                    <button onClick={() => { onAddProduct(selectedPage); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-blue-600 hover:bg-blue-50 font-medium">
                      + এই পেজে পণ্য যোগ করুন
                    </button>
                  </div>
                )}

                {isAdmin && (
                  <div className="border-t mt-2 pt-2">
                    {showAddPage ? (
                      <div className="px-2 space-y-1">
                        <input value={newPageNameBn} onChange={e => setNewPageNameBn(e.target.value)}
                          placeholder="বাংলা নাম (মুদি সদয়)"
                          className="border-2 border-gray-300 rounded-lg px-2 py-1 w-full text-xs" />
                        <input value={newPageName} onChange={e => setNewPageName(e.target.value)}
                          placeholder="English name (grocery)"
                          className="border-2 border-gray-300 rounded-lg px-2 py-1 w-full text-xs" />
                        <div className="flex gap-1">
                          <button onClick={addPage} disabled={loading}
                            className="bg-green-700 text-white px-2 py-1 rounded-lg text-xs flex-1">যোগ করুন</button>
                          <button onClick={() => setShowAddPage(false)}
                            className="bg-gray-200 text-gray-600 px-2 py-1 rounded-lg text-xs">বাতিল</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAddPage(true)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-green-600 hover:bg-green-50 font-medium">
                        + নতুন পেজ যোগ করুন
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* কাস্টমারের জন্য অর্ডার বাটন */}
      {!isAdmin && (
        <button onClick={() => onShowOrders && onShowOrders()}
          className="flex items-center gap-1 bg-white text-green-700 border-2 border-green-700 px-3 py-2 rounded-xl font-medium text-sm">
          📋 অর্ডার
        </button>
      )}
    </div>
  );
}