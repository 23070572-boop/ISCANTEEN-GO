import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductType } from '../../types';
import {
  Search,
  Clock,
  RotateCcw,
  Plus,
  Minus,
  ShoppingBag,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

interface Step2SelectMenuProps {
  onChangeSlot: () => void;
  onOpenCart: () => void;
}

export const Step2SelectMenu: React.FC<Step2SelectMenuProps> = ({ onChangeSlot, onOpenCart }) => {
  const {
    products,
    categories,
    selectedSlot,
    selectedDate,
    holdTimeRemaining,
    cart,
    addToCart,
    cartPreparedCount,
    cartPreparedTypesCount,
    cartSubtotal,
    rules,
  } = useApp();

  const [activeTypeTab, setActiveTypeTab] = useState<ProductType>('prepared');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.type !== activeTypeTab) return false;
      if (selectedCategoryId !== 'all' && p.categoryId !== selectedCategoryId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [products, activeTypeTab, selectedCategoryId, searchQuery]);

  const getItemQuantity = (productId: number) => {
    const found = cart.find((i) => i.product.id === productId);
    return found ? found.quantity : 0;
  };

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-3 pb-32 animate-in fade-in duration-200">
      {/* Sticky Selected Slot Header with Change Slot Button */}
      <div className="sticky top-12 z-30 bg-[#faf9f6]/95 backdrop-blur-md px-4 py-2.5 border-b border-stone-200/70 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-4 h-4 text-stone-500 shrink-0" />
          <div className="truncate text-xs">
            <span className="text-stone-500 font-medium">Khung nhận: </span>
            <strong className="font-mono text-stone-900">{selectedSlot?.label}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {holdTimeRemaining > 0 && (
            <span className="font-mono text-[10px] text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded-md font-medium">
              {formatTime(holdTimeRemaining)}
            </span>
          )}
          <button
            onClick={() => {
              feedback.tap();
              onChangeSlot();
            }}
            className="text-xs text-stone-600 hover:text-stone-900 font-medium underline flex items-center gap-1"
          >
            Đổi giờ
          </button>
        </div>
      </div>

      {/* Segmented Type Switcher */}
      <div className="px-4 pt-1">
        <div className="grid grid-cols-2 p-1 bg-stone-200/60 rounded-2xl">
          <button
            onClick={() => {
              feedback.tap();
              setActiveTypeTab('prepared');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTypeTab === 'prepared'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Món làm tươi ({products.filter((p) => p.type === 'prepared').length})
          </button>

          <button
            onClick={() => {
              feedback.tap();
              setActiveTypeTab('ready');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTypeTab === 'ready'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Món đóng gói ({products.filter((p) => p.type === 'ready').length})
          </button>
        </div>
      </div>

      {/* Gentle Rules Limit Strip */}
      {activeTypeTab === 'prepared' ? (
        <div className="mx-4 p-2.5 rounded-2xl bg-stone-100/80 border border-stone-200/70 flex items-center justify-between text-xs text-stone-700">
          <span className="text-[11px] font-medium text-stone-600">Giới hạn món tươi:</span>
          <div className="flex items-center gap-2.5 font-mono text-[11px]">
            <span>
              Loại: <strong>{cartPreparedTypesCount}</strong>/{rules.maxPreparedItemTypesPerOrder}
            </span>
            <span>·</span>
            <span>
              Phần: <strong>{cartPreparedCount}</strong>/{rules.maxTotalPreparedItemsPerOrder}
            </span>
          </div>
        </div>
      ) : (
        <div className="mx-4 p-2 rounded-2xl bg-stone-100/80 border border-stone-200/70 text-[11px] text-stone-600 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span>Món đóng gói không giới hạn số lượng và không tính tải bếp.</span>
        </div>
      )}

      {/* Search Input */}
      <div className="px-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm kiếm món ăn, đồ uống..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-stone-400 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="px-4 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => {
            feedback.tap();
            setSelectedCategoryId('all');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategoryId === 'all'
              ? 'bg-stone-900 text-stone-100 shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
          }`}
        >
          Tất cả
        </button>

        {categories.map((cat) => {
          const count = products.filter((p) => p.categoryId === cat.id && p.type === activeTypeTab).length;
          if (count === 0) return null;
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                feedback.tap();
                setSelectedCategoryId(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-stone-900 text-stone-100 shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Products List Cards */}
      <div className="px-4 space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <ShoppingBag className="w-8 h-8 mx-auto text-stone-300 mb-2 stroke-1" />
            <p className="text-xs font-medium">Không tìm thấy món phù hợp</p>
          </div>
        ) : (
          filteredProducts.map((item) => {
            const qty = getItemQuantity(item.id);
            const isPrepared = item.type === 'prepared';
            const isAtItemLimit = isPrepared && qty >= rules.maxQuantityPerPreparedItem;
            const isAtTypesLimit = isPrepared && qty === 0 && cartPreparedTypesCount >= rules.maxPreparedItemTypesPerOrder;
            const isAtTotalLimit = isPrepared && cartPreparedCount >= rules.maxTotalPreparedItemsPerOrder;
            const disableAdd = !item.isAvailable || isAtItemLimit || isAtTypesLimit || isAtTotalLimit;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl bg-white border transition-all flex gap-3.5 ${
                  qty > 0
                    ? 'border-stone-400 ring-1 ring-stone-200 shadow-xs'
                    : 'border-stone-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:border-stone-300'
                }`}
              >
                {/* Food Image */}
                <div className="relative w-20 h-20 shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-xl"
                    loading="lazy"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-stone-900/60 rounded-xl flex items-center justify-center text-white text-[10px] font-bold">
                      Hết hàng
                    </div>
                  )}
                </div>

                {/* Details & Counter */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="font-semibold text-xs text-stone-900 truncate">
                        {item.name}
                      </h3>
                      <span className="font-mono text-xs font-bold text-stone-900 shrink-0">
                        {item.price.toLocaleString()}đ
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>

                    {item.isSponsored && (
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Được tài trợ bởi {item.sponsorName || 'Đối tác'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">
                      {isAtItemLimit
                        ? 'Tối đa 3 phần'
                        : isAtTypesLimit
                        ? 'Đã chọn đủ 4 loại'
                        : ''}
                    </span>

                    {qty === 0 ? (
                      <button
                        disabled={disableAdd}
                        onClick={() => addToCart(item, 1)}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1 transition-all active:scale-95 ${
                          disableAdd
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : 'bg-stone-900 hover:bg-stone-800 text-stone-100'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-stone-100 p-0.5 rounded-xl border border-stone-200">
                        <button
                          onClick={() => addToCart(item, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-stone-900 flex items-center justify-center font-bold text-xs shadow-2xs active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs text-stone-900 w-5 text-center">
                          {qty}
                        </span>
                        <button
                          disabled={disableAdd}
                          onClick={() => addToCart(item, 1)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs active:scale-90 ${
                            disableAdd
                              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                              : 'bg-stone-900 text-white'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Cart Bar - Subtle Dark Slate */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-14 inset-x-0 z-30 p-3.5 max-w-md mx-auto">
          <div className="bg-stone-900 text-stone-100 rounded-3xl p-3.5 shadow-xl flex items-center justify-between gap-3 border border-stone-800 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-stone-800 text-amber-300 flex items-center justify-center font-mono font-bold text-xs">
                {totalCartCount}
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block leading-tight">
                  Tạm tính ({cartPreparedTypesCount}/4 loại làm tươi)
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {cartSubtotal.toLocaleString()}đ
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                feedback.tap();
                onOpenCart();
              }}
              className="py-2.5 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-950 font-bold text-xs shadow-sm active:scale-95 transition-all"
            >
              Xem giỏ hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
