'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ProductList from './components/ProductList';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

const ADMIN_PASSWORD = 'sloahiella@admin';
const EDITOR_PASSWORD = 'editor@123';

interface Branch {
  id: number;
  name: string;
  name_bn: string;
  is_active: boolean;
}

export default function Home() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    fetchBranches();
    const savedRole = localStorage.getItem('role');
    if (savedRole) setRole(savedRole);
  }, []);

  async function fetchBranches() {
    const { data } = await supabase.from('branches').select('*');
    if (data) setBranches(data as Branch[]);
  }

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setRole('admin');
      localStorage.setItem('role', 'admin');
      setShowLoginModal(false);
      setPassword('');
      setLoginError('');
      window.location.href = '/admin';
    } else if (password === EDITOR_PASSWORD) {
      setRole('editor');
      localStorage.setItem('role', 'editor');
      setShowLoginModal(false);
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('পাসওয়ার্ড ভুল হয়েছে!');
    }
  }

  function handleLogout() {
    setRole(null);
    localStorage.removeItem('role');
  }

  if (!selectedBranch) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center relative">

        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-white shadow rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-green-50"
          >
            👤
          </button>
          {role && (
            <div className="mt-1 flex flex-col items-end gap-1">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                {role === 'admin' ? '👑 Admin' : '✏️ Editor'}
              </span>
              <button onClick={handleLogout} className="text-xs text-red-500">লগআউট</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-center text-green-700 mb-2">
            🛒 মাই বাজার
          </h1>
          <p className="text-center text-gray-500 mb-6">
            আপনার শাখা সিলেক্ট করুন
          </p>
          <div className="space-y-3">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(branch)}
                className="w-full py-3 px-4 bg-green-100 hover:bg-green-200 text-green-800 font-medium rounded-xl transition"
              >
                {branch.name_bn || branch.name}
              </button>
            ))}
          </div>
        </div>

        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full mx-4">
              <h2 className="text-xl font-bold text-green-700 mb-4 text-center">🔐 লগইন</h2>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="পাসওয়ার্ড লিখুন"
                className="border-2 border-gray-300 rounded-lg px-3 py-2 w-full text-sm mb-2 focus:border-green-500 focus:outline-none"
                autoFocus
              />
              {loginError && (
                <p className="text-red-500 text-xs mb-2">{loginError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleLogin}
                  className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex-1 font-medium"
                >
                  লগইন
                </button>
                <button
                  onClick={() => { setShowLoginModal(false); setPassword(''); setLoginError(''); }}
                  className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  বাতিল
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      <div className="bg-green-700 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">🛒 মাই বাজার</h1>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <button
              onClick={() => window.location.href = '/admin'}
              className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-lg font-medium"
            >
              👑 Admin
            </button>
          )}
          <button
            onClick={() => setSelectedBranch(null)}
            className="text-sm bg-green-600 px-3 py-1 rounded-lg"
          >
            {selectedBranch.name_bn || selectedBranch.name} ✕
          </button>
        </div>
      </div>
      <ProductList branch={selectedBranch} />
    </div>
  );
}