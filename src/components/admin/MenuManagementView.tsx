import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  UtensilsCrossed,
  Plus,
  Check,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Search,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const MenuManagementView: React.FC = () => {
  const { products, toggleProductStatus, categories, addNewProduct } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<number | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form
  const [newName, setNewName] = useState('');
  const [newCatId, setNewCatId] = useState<number>(1);
  const [newPrice, setNewPrice] = useState<number>(25000);
  const [newType, setNewType] = useState<'prepared' | 'ready'>('prepared');
  const [newImage, setNewImage] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'
  );

  const filtered = products.filter((p) => {
    if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
    if (search.trim() && !p.name.toLowerCase().includes(search.toLowerCase().trim())) return false;
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    feedback.tap();
    addNewProduct({
      name: newName,
      categoryId: newCatId,
      price: Number(newPrice),
      image: newImage,
      type: newType,
      isAvailable: true,
      description: 'Món ăn mới bổ sung vào thực đơn căn tin',
    });
    setNewName('');
    setShowAddModal(false);
  };

  return (
    <div className="p-3.5 space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
            Quản lý Thực đơn Căn tin ({products.length} món)
          </h2>
          <p className="text-xs text-gray-500">Bật/tắt món, gán món tài trợ (Ad) & tồn kho</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center gap-1 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm món
        </button>
      </div>

      {/* Filter and Search */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Tìm kiếm món trong thực đơn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCat === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Tất cả ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === c.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-2.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-2xl bg-white border flex items-center justify-between gap-3 transition-all ${
              !item.isAvailable ? 'opacity-60 bg-gray-50 border-gray-200' : 'border-gray-100 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-gray-900 truncate">{item.name}</span>
                  {item.isSponsored && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-300">
                      Tài trợ
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                  <span className="font-mono font-bold text-orange-600">
                    {item.price.toLocaleString()}đ
                  </span>
                  <span>•</span>
                  <span>{item.type === 'prepared' ? 'Làm tươi' : 'Có sẵn'}</span>
                </div>
              </div>
            </div>

            {/* Admin Toggles */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Sponsored toggle */}
              <button
                onClick={() => {
                  feedback.tap();
                  toggleProductStatus(item.id, 'isSponsored');
                }}
                className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                  item.isSponsored
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
                title="Bật/Tắt gán món được tài trợ (Ad)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Ad</span>
              </button>

              {/* In-Stock / Available toggle */}
              <button
                onClick={() => {
                  feedback.tap();
                  toggleProductStatus(item.id, 'isAvailable');
                }}
                className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                  item.isAvailable
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {item.isAvailable ? 'Đang bán' : 'Hết hàng'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900">Thêm món mới vào thực đơn</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Tên món:</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ví dụ: Bánh bao xá xíu"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Danh mục:</label>
                <select
                  value={newCatId}
                  onChange={(e) => setNewCatId(Number(e.target.value))}
                  className="w-full p-2 text-xs rounded-xl border border-gray-200 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Giá (VND):</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  step="1000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Loại món:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewType('prepared')}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    newType === 'prepared'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  🍳 Cần chuẩn bị (Tươi)
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('ready')}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    newType === 'ready'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  🥤 Có sẵn (Đóng gói)
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Link hình ảnh:</label>
              <input
                type="url"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
              />
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700"
              >
                Lưu món
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
