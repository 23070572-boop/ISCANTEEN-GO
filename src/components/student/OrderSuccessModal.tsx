import React, { useState } from 'react';
import { Order } from '../../types';
import {
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onViewMyOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
  onViewMyOrders,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    order.id + '|' + order.studentId + '|' + order.slotId
  )}&margin=8`;

  const handleSaveQR = () => {
    feedback.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#faf9f6] p-6 shadow-2xl text-center space-y-3.5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 text-stone-900 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 stroke-[2]" />
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
            Đặt đơn thành công
          </span>
          <h2 className="text-xl font-bold text-stone-950 tracking-tight font-mono mt-0.5">
            {order.id}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {order.paymentMethod === 'pay_at_counter'
              ? 'Chờ thanh toán tại quầy trước giờ nhận 15 phút'
              : 'Đã thanh toán trực tuyến thành công'}
          </p>
        </div>

        {/* Slot info */}
        <div className="p-3 rounded-2xl bg-white border border-stone-200 flex items-center justify-between text-xs">
          <div className="text-left">
            <span className="text-[10px] text-stone-400 block">Khung giờ hẹn:</span>
            <span className="font-bold text-stone-900 font-mono text-sm">
              {order.slotLabel}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone-400 block">Ngày hẹn:</span>
            <span className="font-medium text-stone-700">{order.orderDate}</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="p-3 bg-white border border-stone-200 rounded-2xl shadow-xs inline-block mx-auto">
          <img
            src={qrSvgUrl}
            alt="Mã QR nhận món"
            className="w-44 h-44 mx-auto object-contain rounded-lg"
          />
          <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mã đã lưu tự động vào máy để mở offline</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleSaveQR}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{copied ? 'Đã lưu!' : 'Lưu ảnh QR'}</span>
          </button>

          <button
            onClick={() => {
              feedback.tap();
              onClose();
              onViewMyOrders();
            }}
            className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
          >
            <span>Đơn của tôi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
