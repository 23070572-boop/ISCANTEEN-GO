import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Sliders,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const SlotConfigView: React.FC = () => {
  const { slots, toggleSlotActive, rules, updateRules, showToast } = useApp();

  const [capacity, setCapacity] = useState<number>(rules.slotCapacity || 24);
  const [maxTypes, setMaxTypes] = useState<number>(rules.maxPreparedItemTypesPerOrder || 4);
  const [maxPerItem, setMaxPerItem] = useState<number>(rules.maxQuantityPerPreparedItem || 3);
  const [maxTotal, setMaxTotal] = useState<number>(rules.maxTotalPreparedItemsPerOrder || 8);
  const [holdSecs, setHoldSecs] = useState<number>(rules.holdDurationSeconds || 300);

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    feedback.tap();
    updateRules({
      slotCapacity: Number(capacity),
      maxPreparedItemTypesPerOrder: Number(maxTypes),
      maxQuantityPerPreparedItem: Number(maxPerItem),
      maxTotalPreparedItemsPerOrder: Number(maxTotal),
      holdDurationSeconds: Number(holdSecs),
    });
  };

  return (
    <div className="p-3.5 space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-stone-900 tracking-tight">
          Cấu hình Khung giờ & 4 Quy tắc Bếp
        </h2>
        <p className="text-xs text-stone-500">
          Điều chỉnh định ngạch 24 đơn/khung và thông số kiểm soát tải tự động
        </p>
      </div>

      {/* Rules Config Form */}
      <form onSubmit={handleSaveRules} className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3.5">
        <h3 className="font-semibold text-xs text-stone-800 tracking-tight flex items-center gap-2 pb-1 border-b border-stone-100">
          <Sliders className="w-3.5 h-3.5 text-stone-600" />
          <span>4 Quy tắc cốt lõi (M-Commerce Engine)</span>
        </h3>

        {/* Rule 1: Capacity */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-stone-700 flex items-center justify-between">
            <span>Rule 1: Giới hạn đơn mỗi khung giờ</span>
            <span className="font-mono text-stone-900 font-semibold">{capacity} đơn/khung</span>
          </label>
          <input
            type="number"
            min="5"
            max="100"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono transition-all"
          />
          <p className="text-[10px] text-stone-400">
            Tiêu chuẩn đề xuất: 24 đơn/khung (240 đơn/ngày, chỉ tính đơn có món chế biến sẵn).
          </p>
        </div>

        {/* Rule 2: Max types */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-stone-700 flex items-center justify-between">
            <span>Rule 2: Tối đa loại món làm tươi / đơn</span>
            <span className="font-mono text-stone-900 font-semibold">{maxTypes} loại</span>
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={maxTypes}
            onChange={(e) => setMaxTypes(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono transition-all"
          />
        </div>

        {/* Rule 3: Max portion per item & Total portion */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-stone-700 block">
              Rule 3: Max suất/món
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={maxPerItem}
              onChange={(e) => setMaxPerItem(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-stone-700 block">
              Rule 3b: Tổng suất tươi/đơn
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={maxTotal}
              onChange={(e) => setMaxTotal(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono transition-all"
            />
          </div>
        </div>

        {/* Hold timer */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-stone-700 flex items-center justify-between">
            <span>Thời gian giữ chỗ tạm thời (Rule 4 lock)</span>
            <span className="font-mono text-stone-900 font-semibold">{holdSecs}s ({Math.floor(holdSecs / 60)} phút)</span>
          </label>
          <input
            type="number"
            min="60"
            max="900"
            step="30"
            value={holdSecs}
            onChange={(e) => setHoldSecs(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono transition-all"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Áp dụng cấu hình quy tắc</span>
        </button>
      </form>

      {/* Emergency Toggle Individual Slots */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-stone-100">
          <h3 className="font-semibold text-xs text-stone-800 tracking-tight flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-stone-600" />
            <span>Trạng thái 10 Khung giờ hoạt động</span>
          </h3>
        </div>

        <div className="divide-y divide-stone-100">
          {slots.map((s) => (
            <div key={s.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-stone-900">{s.label}</span>
                <span className="block text-[10px] text-stone-400">
                  {s.isActive ? 'Đang mở nhận đơn tự động' : 'Tạm dừng nhận đơn'}
                </span>
              </div>

              <button
                onClick={() => {
                  feedback.tap();
                  toggleSlotActive(s.id);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
                  s.isActive
                    ? 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                {s.isActive ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-rose-600" />}
                <span>{s.isActive ? 'Đang mở' : 'Khóa'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
