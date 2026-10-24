import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Banknote,
  Sparkles,
  Camera,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';
import confetti from 'canvas-confetti';

export const PickupCounterView: React.FC = () => {
  const {
    orders,
    selectedDate,
    updateOrderStatus,
    collectCounterPayment,
    showToast,
  } = useApp();

  const [searchInput, setSearchInput] = useState('');
  const [scannedOrder, setScannedOrder] = useState<Order | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(true);

  // Available ready or placed orders for quick testing
  const candidateOrders = orders.filter(
    (o) => o.status === 'ready' || o.status === 'preparing' || o.status === 'placed'
  );

  const handleSearch = (code: string) => {
    feedback.tap();
    const clean = code.trim().toUpperCase();
    const found = orders.find(
      (o) => o.id.toUpperCase() === clean || o.studentId === clean
    );

    if (found) {
      setScannedOrder(found);
      feedback.tap();
    } else {
      feedback.warning();
      showToast(`Không tìm thấy đơn hàng với mã "${clean}"!`, 'error');
    }
  };

  const handleConfirmDelivery = () => {
    if (!scannedOrder) return;

    if (!scannedOrder.isPaid) {
      feedback.warning();
      alert('Đơn này chưa thanh toán! Vui lòng bấm "Thu tiền tại quầy" trước khi giao.');
      return;
    }

    feedback.success();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }

    updateOrderStatus(scannedOrder.id, 'completed');
    showToast(`Đã giao món thành công cho sinh viên ${scannedOrder.studentName}!`, 'success');
    setScannedOrder(null);
  };

  const handleCollectMoney = () => {
    if (!scannedOrder) return;
    feedback.success();
    collectCounterPayment(scannedOrder.id);
    // Refresh local scanned order state
    setScannedOrder((prev) => (prev ? { ...prev, isPaid: true } : null));
  };

  return (
    <div className="p-3.5 space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
          Quầy giao món & Quét mã QR
        </h2>
        <p className="text-xs text-gray-500">
          Xác minh sinh viên, thu tiền tại quầy và giao thức ăn
        </p>
      </div>

      {/* Simulated Scanner Viewfinder */}
      <div className="bg-stone-900 rounded-3xl p-5 text-stone-100 shadow-md relative overflow-hidden flex flex-col items-center justify-center border border-stone-800">
        {/* Viewfinder box */}
        <div className="w-64 h-48 border border-stone-600 rounded-2xl relative flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-stone-300 to-transparent animate-pulse shadow-[0_0_8px_#ffffff]" />
          <div className="text-center p-3">
            <Camera className="w-7 h-7 text-stone-300 mx-auto mb-2 opacity-90" />
            <p className="text-xs font-semibold text-stone-200">Camera quét mã QR sinh viên</p>
            <p className="text-[10px] text-stone-400 mt-0.5">
              Đưa mã QR trên màn hình vào khung để quét
            </p>
          </div>
        </div>

        {/* Quick test buttons for examiner/user */}
        <div className="mt-3.5 w-full">
          <span className="text-[10px] text-stone-400 block mb-1.5 text-center">
            Bấm nhanh đơn mẫu để kiểm tra:
          </span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar justify-center">
            {candidateOrders.slice(0, 3).map((o) => (
              <button
                key={o.id}
                onClick={() => handleSearch(o.id)}
                className="px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-mono text-[11px] font-medium whitespace-nowrap active:scale-95 transition-all"
              >
                {o.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Search Form */}
      <div className="bg-white rounded-3xl p-3.5 border border-gray-100 shadow-sm">
        <label className="text-[11px] font-bold text-gray-700 block mb-1">
          Nhập mã đơn hoặc Mã số sinh viên:
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="VD: IC-261024-001 hoặc 23070572"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono uppercase"
            />
          </div>
          <button
            onClick={() => handleSearch(searchInput)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
          >
            Tìm đơn
          </button>
        </div>
      </div>

      {/* Scanned Order Details Modal / Card */}
      {scannedOrder && (
        <div className="bg-white rounded-3xl p-5 border border-stone-300 shadow-xl space-y-3.5 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div>
              <span className="font-mono text-sm font-bold text-stone-900 block">
                {scannedOrder.id}
              </span>
              <span className="text-xs text-stone-500">
                {scannedOrder.studentName} · MSSV: {scannedOrder.studentId}
              </span>
            </div>
            <button
              onClick={() => setScannedOrder(null)}
              className="p-1 rounded-full text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
          </div>

          {/* Validation Warnings */}
          <div className="space-y-1.5">
            {scannedOrder.status === 'completed' && (
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Đơn này đã được giao trước đó</span>
              </div>
            )}

            {scannedOrder.status === 'cancelled' && (
              <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Đơn này đã bị hủy</span>
              </div>
            )}

            {!scannedOrder.isPaid && (
              <div className="p-2.5 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-stone-600 shrink-0" />
                  <span>
                    Chưa thanh toán: <strong>{scannedOrder.total.toLocaleString()}đ</strong>
                  </span>
                </div>
                <button
                  onClick={handleCollectMoney}
                  className="px-3 py-1 rounded-xl bg-stone-900 text-white font-medium text-xs shadow-xs active:scale-95"
                >
                  Thu tiền ngay
                </button>
              </div>
            )}
          </div>

          {/* Slot verification */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex justify-between items-center">
            <div>
              <span className="text-[10px] text-stone-400 block">Khung giờ hẹn:</span>
              <span className="font-mono font-bold text-stone-900 text-xs">
                {scannedOrder.slotLabel} ({scannedOrder.orderDate})
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block">Thanh toán:</span>
              <span className="font-semibold text-stone-800">
                {scannedOrder.isPaid ? '✓ Đã thanh toán' : '✗ Chưa thanh toán'}
              </span>
            </div>
          </div>

          {/* Dish items checklist */}
          <div className="bg-stone-50 rounded-2xl p-3 space-y-1.5 text-xs border border-stone-200/60">
            <span className="font-semibold text-stone-700 block text-[11px] uppercase tracking-wider">
              Món cần giao ({scannedOrder.items.length}):
            </span>
            {scannedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-0.5">
                <span className="text-stone-800">
                  <strong className="font-mono text-stone-950">{item.quantity}x</strong>{' '}
                  {item.product.name}
                </span>
                {item.note && (
                  <span className="text-[10px] text-stone-500 italic">"{item.note}"</span>
                )}
              </div>
            ))}
          </div>

          {/* Action button */}
          <div className="pt-1">
            <button
              disabled={!scannedOrder.isPaid || scannedOrder.status === 'cancelled'}
              onClick={handleConfirmDelivery}
              className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                scannedOrder.isPaid && scannedOrder.status !== 'cancelled'
                  ? 'bg-stone-900 hover:bg-stone-800 text-stone-100 active:scale-98'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận giao món cho sinh viên</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
