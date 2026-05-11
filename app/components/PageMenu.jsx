'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

export default function PageMenu({ branch, selectedPage, onSelectPage, isAdmin, onAddProduct }) {
  const [pages, setPages] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageNameBn, setNewPageNameBn] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNameBn, setEditNameBn] = useState('');

  useEffect(() => {
    fetchPages();
  }, [branch]);

  async function fetchPages() {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('branch_id', branch.id)
      .order('sort_order');
    if (data) setPages(data);
  }

  async function addPage() {
    if (!newPageName) return;
    setLoading(true);
    await supabase.from('pages').insert({
      branch_id: branch.id,
      name: newPageName,
      name_bn: newPageNameBn || newPageName,
      sort_order: pages.length,
      is_active: true
    });
    setNewPageName('');
    setNewPageNameBn('');
    setShowAddPage(false);
    fetchPages();
    setLoading(false);
  }

  async function deletePage(id) {
    if (!confirm('এই পেজ মুছে দেবেন?')) return;
    await supabase.from('pages').delete().eq('id', id);
    if (selectedPage?.id === id) onSelectPage(null);
    fetchPages();
  }

  async function togglePage(id, currentStatus) {
    await supabase.from('pages').update({ is_active: !currentStatus }).eq('id', id);
    fetchPages();
  }

  async function updatePage(id) {
    if (!editName) return;
    setLoading(true);
    await supabase.from('pages').update({
      name: editName,
      name_bn: editNameBn || editName
    }).eq('id', id);
    setEditingPage(null);
    fetchPages();
    setLoading(false);
  }

  const visiblePages = isAdmin ? pages : pages.filter(p => p.is_active !== false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1 bg-white text-green-700 border-2 border-green-700 px-3 py-2 rounded-xl font-medium text-sm"
      >
        ☰ পেজ
      </button>

      {showMenu && (
        <div className="absolute left-0 top-12 bg-white rounded-xl shadow-lg z-50 w-72 border border-gray-200">
          <div className="p-2">
            <button
              onClick={() => { onSelectPage(null); setShowMenu(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${!selectedPage ? 'bg-green-700 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              🏠 সব পণ্য
            </button>

            {visiblePages.map(page => (
              <div key={page.id}>
                {editingPage === page.id ? (
                  <div className="px-2 py-1 space-y-1">
                    <input value={editNameBn} onChange={e => setEditNameBn(e.target.value)}
                      placeholder="বাংলা নাম"
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 w-full text-xs" />
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      placeholder="English name"
                      className="border-2 border-gray-300 rounded-lg px-2 py-1 w-full text-xs" />
                    <div className="flex gap-1">
                      <button onClick={() => updatePage(page.id)} disabled={loading}
                        className="bg-green-700 text-white px-2 py-1 rounded-lg text-xs flex-1">
                        সেভ
                      </button>
                      <button onClick={() => setEditingPage(null)}
                        className="bg-gray-200 text-gray-600 px-2 py-1 rounded-lg text-xs">
                        বাতিল
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 group">
                    <button
                      onClick={() => { onSelectPage(page); setShowMenu(false); }}
                      className={`flex-1 text-left px-3 py-2 rounded-lg text-sm font-medium ${selectedPage?.id === page.id ? 'bg-green-700 text-white' : 'hover:bg-gray-50 text-gray-700'} ${page.is_active === false ? 'opacity-50' : ''}`}
                    >
                      {page.name_bn || page.name}
                      {page.is_active === false && <span className="text-xs text-red-400 ml-1">(বন্ধ)</span>}
                    </button>
                    {isAdmin && (
                      <div className="flex gap-1 pr-1">
                        <button
                          onClick={() => {
                            setEditingPage(page.id);
                            setEditName(page.name);
                            setEditNameBn(page.name_bn || '');
                          }}
                          className="text-blue-400 text-xs px-1 hover:text-blue-600"
                          title="নাম পরিবর্তন"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => togglePage(page.id, page.is_active !== false)}
                          className="text-xs px-1"
                          title={page.is_active === false ? 'চালু করুন' : 'বন্ধ করুন'}
                        >
                          {page.is_active === false ? '👁️' : '🚫'}
                        </button>
                        <button
                          onClick={() => deletePage(page.id)}
                          className="text-red-400 text-xs px-1 hover:text-red-600"
                          title="মুছুন"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isAdmin && selectedPage && (
              <div className="border-t mt-2 pt-2 px-2">
                <button
                  onClick={() => { onAddProduct(selectedPage); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-blue-600 hover:bg-blue-50 font-medium"
                >
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
                        className="bg-green-700 text-white px-2 py-1 rounded-lg text-xs flex-1">
                        যোগ করুন
                      </button>
                      <button onClick={() => setShowAddPage(false)}
                        className="bg-gray-200 text-gray-600 px-2 py-1 rounded-lg text-xs">
                        বাতিল
                      </button>
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
      )}

      {showMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}