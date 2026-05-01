'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ProductList from './components/ProductList';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

export default function Home() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  async function fetchBranches() {
    const { data } = await supabase.from('branches').select('*');
    if (data) setBranches(data);
  }

  if (!selectedBranch) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      <div className="bg-green-700 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">🛒 মাই বাজার</h1>
        <button
          onClick={() => setSelectedBranch(null)}
          className="text-sm bg-green-600 px-3 py-1 rounded-lg"
        >
          {selectedBranch.name_bn || selectedBranch.name} ✕
        </button>
      </div>
      <ProductList branch={selectedBranch} />
    </div>
  );
}