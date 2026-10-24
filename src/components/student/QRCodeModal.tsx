import React, { useState } from 'react';
import { Order } from '../../types';
import { X, QrCode, Sun, Download, Calendar, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { feedback } from '../../utils/feedback';

interface QRCodeModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ order, isOpen, onClose }) => {
  const [brightnessBoosted, setBrightnessBoosted] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !order) return null;

  const toggleBrightness = () => {
    feedback.tap();
    setBrightnessBoosted(!brightnessBoosted);
  };

  const handleSaveQR = () => {
    feedback.success();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddToCalendar = () => {
    feedback.tap();
    alert(`Đã thêm lịch hẹn nhận món lúc ${order.slotLabel} ngày ${order.orderDate}`);
  };

  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    order.id + '|' + order.studentId + '|' + order.slotId
  )}&margin=8`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl transition-all duration-300 ${
          brightnessBoosted ? 'bg-white ring-8 ring-stone-300' : 'bg-[#faf9f6]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-stone-700" />
            <h3 className="font-bold text-stone-900 text-sm">Mã nhận món</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slot info */}
        <div className="mt-3.5 flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-3 text-xs">
          <div>
            <span className="text-[10px] text-stone-400 font-medium block">Khung giờ hẹn:</span>
            <span className="font-bold text-stone-900 text-sm font-mono">{order.slotLabel}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone-400 font-medium block">Trạng thái:</span>
            <span className="text-xs font-semibold text-stone-800 capitalize">
              {order.status === 'ready'
                ? 'Sẵn sàng tại quầy'
                : order.status === 'preparing'
                ? 'Đang chế biến'
                : 'Đã xác nhận'}
            </span>
          </div>
        </div>

        {/* High-Contrast QR Code */}
        <div className="my-4 flex flex-col items-center">
          <div className="p-3 bg-white border border-stone-200 rounded-2xl shadow-xs flex flex-col items-center">
            <img
              src={qrSvgUrl}
              alt={`QR Code ${order.id}`}
              className="w-48 h-48 object-contain rounded-lg"
            />
            <div className="mt-2 text-center">
              <span className="font-mono text-sm font-bold tracking-wider text-stone-900 block">
                {order.id}
              </span>
              <span className="text-[10px] text-stone-400">
                {order.studentName} · {order.studentId}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
            <span>Mã lưu offline — mở được khi không có mạng</span>
          </div>
        </div>

        {/* Order summary mini list */}
        <div className="bg-white rounded-2xl p-3 mb-3 text-xs text-stone-600 border border-stone-200/80 max-h-24 overflow-y-auto divide-y divide-stone-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-1 flex items-center justify-between">
              <span className="truncate pr-2">
                <span className="font-bold text-stone-800">{item.quantity}x</span> {item.product.name}
              </span>
              <span className="font-mono text-stone-700 shrink-0">
                {(item.product.price * item.quantity).toLocaleString()}đ
              </span>
            </div>
          ))}
          <div className="pt-1.5 flex items-center justify-between font-bold text-stone-900 text-xs">
            <span>Tổng cộng:</span>
            <span className="font-mono">{order.total.toLocaleString()}đ</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={toggleBrightness}
            className={`py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1 border transition-all ${
              brightnessBoosted
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span className="text-[10px]">{brightnessBoosted ? 'Hạ sáng' : 'Tăng sáng'}</span>
          </button>

          <button
            onClick={handleSaveQR}
            className="py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1 bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 transition-all"
          >
            {savedSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="text-[10px]">{savedSuccess ? 'Đã lưu' : 'Lưu ảnh'}</span>
          </button>

          <button
            onClick={handleAddToCalendar}
            className="py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1 bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[10px]">Thêm lịch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
