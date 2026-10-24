import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TimeSlot } from '../../types';
import {
  Calendar,
  Clock,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

interface Step1ChooseSlotProps {
  onSlotConfirmed: () => void;
}

export const Step1ChooseSlot: React.FC<Step1ChooseSlotProps> = ({ onSlotConfirmed }) => {
  const {
    slots,
    selectedSlot,
    selectedDate,
    setSelectedDate,
    selectSlot,
    getSlotUsage,
    studentHasOrderInSlot,
    findLeastLoadedSlot,
    profile,
    rules,
  } = useApp();

  const dateOptions = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName =
        i === 0
          ? 'Hôm nay'
          : i === 1
          ? 'Ngày mai'
          : d.toLocaleDateString('vi-VN', { weekday: 'short' });
      list.push({ iso, label: dayName, dateStr: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) });
    }
    return list;
  }, []);

  const leastLoadedSlot = findLeastLoadedSlot(selectedDate);

  const handleSlotClick = (slot: TimeSlot) => {
    selectSlot(slot, selectedDate);
  };

  return (
    <div className="space-y-4 px-4 pt-3 pb-32 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
          Bước 1 trên 2
        </span>
        <h2 className="text-lg font-bold text-stone-900 tracking-tight mt-0.5">
          Chọn khung giờ nhận món
        </h2>
        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
          Sức chứa tối đa <strong>{rules.slotCapacity} đơn/khung</strong>. Chọn giờ trước để đảm bảo bạn luôn nhận món đúng giờ.
        </p>
      </div>

      {/* Date Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-stone-700 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-stone-500" />
          <span>Ngày nhận:</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {dateOptions.map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <button
                key={item.iso}
                onClick={() => {
                  feedback.tap();
                  setSelectedDate(item.iso);
                }}
                className={`py-2.5 px-3 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'border-stone-900 bg-stone-900 text-stone-100 shadow-sm'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="block text-xs font-semibold">{item.label}</span>
                <span className={`block text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                  {item.dateStr}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 10 Slots Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-600">
          <span className="font-semibold text-stone-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-500" /> 10 Khung giờ
          </span>
          <div className="flex items-center gap-2.5 text-[10px] text-stone-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> Vắng
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-600" /> Đông
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-stone-400" /> Đầy
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {slots.map((slot) => {
            const usage = getSlotUsage(slot.id, selectedDate);
            const isSelected = selectedSlot?.id === slot.id;
            const hasExistingOrder = studentHasOrderInSlot(profile.studentId, slot.id, selectedDate);
            const isAIBest = leastLoadedSlot?.id === slot.id && !usage.isFull && !hasExistingOrder;
            const remaining = Math.max(0, usage.capacity - usage.count);
            const isDisabled = usage.isFull || hasExistingOrder || !slot.isActive;

            // Muted, gentle indicator colors
            const barBg =
              usage.statusColor === 'green'
                ? 'bg-emerald-600'
                : usage.statusColor === 'yellow'
                ? 'bg-amber-600'
                : usage.statusColor === 'red'
                ? 'bg-rose-600'
                : 'bg-stone-400';

            return (
              <button
                key={slot.id}
                disabled={isDisabled}
                onClick={() => handleSlotClick(slot)}
                className={`relative p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-stone-900 bg-stone-50/80 ring-2 ring-stone-900 shadow-xs'
                    : isDisabled
                    ? 'border-stone-200 bg-stone-100/60 text-stone-400 cursor-not-allowed opacity-75'
                    : 'border-stone-200/90 bg-white hover:border-stone-400 shadow-[0_2px_10px_rgba(0,0,0,0.01)]'
                }`}
              >
                {isAIBest && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-stone-900 text-stone-100 text-[8px] font-bold tracking-tight">
                    Giờ vắng
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isSelected ? 'text-stone-950' : isDisabled ? 'text-stone-400' : 'text-stone-900'
                    }`}
                  >
                    {slot.label}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-stone-900 shrink-0" />}
                </div>

                <div className="mt-2.5">
                  {hasExistingOrder ? (
                    <span className="text-[10px] text-stone-500 font-medium block">
                      Đã có đơn ở khung này
                    </span>
                  ) : usage.isFull ? (
                    <span className="text-[10px] text-stone-400 font-medium block">
                      Đã kín chỗ ({usage.capacity}/{usage.capacity})
                    </span>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1">
                        <span>Còn <strong>{remaining}</strong>/{usage.capacity}</span>
                        <span className="font-mono text-[9px]">{usage.percent}%</span>
                      </div>
                      <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${barBg}`}
                          style={{ width: `${Math.max(4, usage.percent)}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gentle Information Note */}
      <div className="p-3 rounded-2xl bg-stone-100/70 border border-stone-200/60 text-xs text-stone-600 leading-relaxed flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
        <span>
          Đơn chỉ gồm món đóng gói (nước, snack) không tính vào giới hạn tải nhưng vẫn chọn khung giờ để căn tin chuẩn bị sẵn trước khi bạn đến.
        </span>
      </div>

      {/* Sticky Bottom Next Button */}
      <div className="fixed bottom-14 inset-x-0 z-30 p-3.5 bg-[#faf9f6]/95 backdrop-blur-md border-t border-stone-200/80 max-w-md mx-auto">
        <button
          disabled={!selectedSlot}
          onClick={() => {
            feedback.tap();
            onSlotConfirmed();
          }}
          className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
            selectedSlot
              ? 'bg-stone-900 hover:bg-stone-800 text-stone-100 active:scale-[0.99]'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          <span>
            {selectedSlot
              ? `Tiếp tục chọn món (${selectedSlot.label})`
              : 'Chọn một khung giờ để tiếp tục'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
