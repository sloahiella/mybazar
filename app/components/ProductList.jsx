function ProductCard({ product, onAdd, isAdmin, onEdit, onDoubleClick }) {
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState(product.unit);
  const [showDesc, setShowDesc] = useState(false);
  const stock = product.stock?.[0]?.quantity || 0;
  const u = (product.unit || '').toLowerCase().trim();
  const isKg = u === 'kg';
  const isLiter = u === 'liter' || u === 'l';
  const isPiece = !isKg && !isLiter;

  const getActualQty = () => {
    const q = parseFloat(qty);
    if (!q || q <= 0) return 0;
    if (isKg && unit === 'gm') return q / 1000;
    if (isLiter && unit === 'ml') return q / 1000;
    return q;
  };

  return (
    <div className="bg-white rounded-xl shadow p-3 relative">
      {isAdmin && (
        <button onClick={() => onEdit(product)}
          className="absolute top-2 right-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-lg z-10">
          ✏️
        </button>
      )}
      {product.image_url && (
        <img src={product.image_url} alt={product.name_bn || product.name}
          className="w-full h-24 object-cover rounded-lg mb-2" />
      )}

      <div onDoubleClick={() => onDoubleClick(product)} className="cursor-pointer select-none">
        <h3 className="font-bold text-gray-800 text-sm pr-8">{product.name_bn || product.name}</h3>
        <p className="text-xs text-gray-400">{product.name}</p>
        <p className="text-xs text-blue-500 font-medium">কোড: {product.product_code}</p>
      </div>

      <p className="text-green-700 font-bold text-sm mt-1">
        1 {product.unit} = {product.price_per_unit} Tk
      </p>
      <p className="text-xs text-gray-400">Stock: {stock} {product.unit}</p>

      {product.description && (
        <>
          <button onClick={() => setShowDesc(!showDesc)}
            className="text-xs text-blue-600 underline mt-1 block">
            বৈশিষ্ট্য {showDesc ? '▲' : '▼'}
          </button>
          {showDesc && (
            <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded-lg mt-1">
              {product.description}
            </p>
          )}
        </>
      )}

      <div className="mt-2">
        <div className="flex gap-1 mb-1">
          <input
            type="number"
            min="0"
            step={isPiece ? '1' : '0.001'}
            value={qty}
            onChange={e => setQty(e.target.value)}
            className="border-2 border-gray-300 rounded-lg px-2 py-2 w-full text-sm text-gray-900 font-medium focus:border-green-500 focus:outline-none"
            placeholder="পরিমাণ লিখুন"
          />
          {isPiece ? (
            <select value={qty} onChange={e => setQty(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-2 py-2 text-sm bg-white">
              <option value="">pcs</option>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          ) : (
            <select value={unit} onChange={e => setUnit(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-2 py-2 text-sm bg-white">
              {isKg && <><option value={product.unit}>Kg</option><option value="gm">gm</option></>}
              {isLiter && <><option value={product.unit}>Liter</option><option value="ml">ml</option></>}
            </select>
          )}
        </div>
        {qty && parseFloat(qty) > 0 && (
          <p className="text-xs text-green-700 mb-1 font-bold bg-green-50 p-1 rounded border border-green-200">
            {qty} {isPiece ? product.unit : unit} = {(getActualQty() * product.price_per_unit).toFixed(0)} Tk
          </p>
        )}
        <button
          onClick={() => { const a = getActualQty(); if (a > 0) onAdd(product, a); }}
          className="bg-green-600 text-white px-2 py-2 rounded-lg text-sm w-full font-medium"
        >
          🛒 ঝুড়িতে যোগ করুন
        </button>
      </div>
    </div>
  );
}