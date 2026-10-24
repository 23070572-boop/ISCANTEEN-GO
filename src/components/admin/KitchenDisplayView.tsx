import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TimeSlot, Order } from '../../types';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  ArrowRight,
  Filter,
  CheckCheck,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const KitchenDisplayView: React.FC = () => {
  const {
    slots,
    orders,
    selectedDate,
    updateOrderStatus,
    batchUpdateSlotOrders,
  } = useApp();

  const [activeSlotId, setActiveSlotId] = useState<string>(slots[2]?.id || '09:45-10:00');

  // Filter orders for active slot and date
  const slotOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.slotId === activeSlotId &&
        o.orderDate === selectedDate &&
        o.status !== 'cancelled' &&
        o.status !== 'refunded'
    );
  }, [orders, activeSlotId, selectedDate]);

  // Aggregated Batch Preparation Summary for the 3 kitchen chefs
  const batchPrepSummary = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; type: string }>();

    slotOrders.forEach((o) => {
      // only count orders not yet completed
      if (o.status === 'placed' || o.status === 'paid' || o.status === 'preparing') {
        o.items.forEach((item) => {
          const key = item.product.id.toString();
          const existing = map.get(key);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            map.set(key, {
              name: item.product.name,
              quantity: item.quantity,
              type: item.product.type,
            });
          }
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);
  }, [slotOrders]);

  const activeSlot = slots.find((s) => s.id === activeSlotId);

  const handleBatchReady = () => {
    feedback.success();
    batchUpdateSlotOrders(activeSlotId, 'preparing', 'ready');
  };

  return (
    <div className="p-3.5 space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
              Màn hình Bếp Căn tin (KDS)
            </h2>
            <p className="text-xs text-gray-500">Chế biến theo lô cho 3 nhân viên bếp</p>
          </div>
        </div>

        <button
          onClick={handleBatchReady}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all"
        >
          <CheckCheck className="w-3.5 h-3.5" /> Báo xong cả lô
        </button>
      </div>

      {/* Slot selector pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {slots.map((slot) => {
          const count = orders.filter(
            (o) =>
              o.slotId === slot.id &&
              o.orderDate === selectedDate &&
              o.status !== 'cancelled' &&
              o.status !== 'refunded'
          ).length;
          const isSelected = activeSlotId === slot.id;

          return (
            <button
              key={slot.id}
              onClick={() => {
                feedback.tap();
                setActiveSlotId(slot.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>{slot.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Aggregated Batch Preparation Board (Crucial for 3 Chefs) */}
      <div className="bg-stone-900 rounded-3xl p-4 text-stone-100 shadow-md border border-stone-800 space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-300" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-200">
              Tổng số phần cần chế biến gộp — Khung {activeSlot?.label}
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold bg-stone-800 text-amber-200 px-2 py-0.5 rounded-lg border border-stone-700">
            {batchPrepSummary.reduce((sum, i) => sum + i.quantity, 0)} suất
          </span>
        </div>

        {batchPrepSummary.length === 0 ? (
          <p className="text-xs text-stone-400 py-3 text-center">
            Không có món nào đang chờ chế biến trong khung này.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {batchPrepSummary.map((item, idx) => (
              <div
                key={idx}
                className="bg-stone-800/80 rounded-2xl p-2.5 flex items-center justify-between border border-stone-700/60"
              >
                <div className="truncate pr-1">
                  <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                  <span className="text-[10px] text-stone-400">
                    {item.type === 'prepared' ? 'Làm tươi' : 'Có sẵn'}
                  </span>
                </div>
                <span className="font-mono text-sm font-bold text-amber-300 shrink-0">
                  {item.quantity}x
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders List for this Slot */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">
          Danh sách đơn hàng trong khung ({slotOrders.length} đơn)
        </h3>

        {slotOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
            <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2 stroke-1" />
            <p className="text-xs">Chưa có đơn nào trong khung giờ này</p>
          </div>
        ) : (
          slotOrders.map((order) => {
            const isReady = order.status === 'ready' || order.status === 'completed';

            return (
              <div
                key={order.id}
                className={`p-3.5 rounded-3xl bg-white border transition-all space-y-2.5 ${
                  isReady
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-gray-100 shadow-xs'
                }`}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-black text-gray-900 block">
                      {order.id}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      SV: {order.studentName} ({order.studentId})
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      order.status === 'ready'
                        ? 'bg-emerald-500 text-white'
                        : order.status === 'preparing'
                        ? 'bg-amber-500 text-white'
                        : order.status === 'completed'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {order.status === 'ready'
                      ? 'Sẵn sàng nhận'
                      : order.status === 'preparing'
                      ? 'Đang chế biến'
                      : order.status === 'completed'
                      ? 'Đã giao'
                      : 'Đã nhận'}
                  </span>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-2xl p-2.5 space-y-1 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-800">
                        <strong className="font-mono text-gray-950 font-bold">{item.quantity}x</strong>{' '}
                        {item.product.name}
                      </span>
                      {item.note && (
                        <span className="text-[10px] text-amber-700 italic font-medium">
                          "{item.note}"
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Customer Special Note Highlight */}
                {order.note && (
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Ghi chú của khách:</strong> {order.note}
                    </span>
                  </div>
                )}

                {/* Status action */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                  {order.status !== 'ready' && order.status !== 'completed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Xong món (Sẵn sàng)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
