import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RotateCcw,
  CheckCircle2,
  Copy,
  Clock,
  Check,
  CreditCard,
  Building,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const RefundsManagementView: React.FC = () => {
  const { orders, markAsRefunded } = useApp();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pendingRefunds = orders.filter((o) => o.status === 'refund_requested');
  const processedRefunds = orders.filter((o) => o.status === 'refunded');

  const handleCopy = (text: string, id: string) => {
    feedback.tap();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmRefund = (orderId: string) => {
    feedback.success();
    markAsRefunded(orderId);
  };

  return (
    <div className="p-3.5 space-y-4 pb-20 animate-in fade-in duration-200">
      <div>
        <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
          Xử lý yêu cầu hoàn tiền ({pendingRefunds.length})
        </h2>
        <p className="text-xs text-gray-500">
          Chuyển khoản trả lại sinh viên đã thanh toán trực tuyến nhưng hủy đơn
        </p>
      </div>

      {/* Pending refunds list */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-xs text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Chờ Admin chuyển khoản & duyệt
        </h3>

        {pendingRefunds.length === 0 ? (
          <div className="py-10 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 stroke-1" />
            <p className="text-xs font-bold text-gray-700">Tất cả yêu cầu đã được xử lý xong!</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Không còn yêu cầu hoàn tiền nào tồn đọng</p>
          </div>
        ) : (
          pendingRefunds.map((order) => (
            <div
              key={order.id}
              className="p-4 rounded-3xl bg-white border border-rose-200 ring-1 ring-rose-100 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div>
                  <span className="font-mono text-xs font-black text-gray-900 block">
                    {order.id}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    SV: {order.studentName} ({order.studentId})
                  </span>
                </div>
                <span className="text-sm font-black text-rose-600 font-mono">
                  {order.total.toLocaleString()} VND
                </span>
              </div>

              {/* Bank Transfer Details Card */}
              <div className="bg-rose-50/70 rounded-2xl p-3 border border-rose-200/80 space-y-1.5 text-xs text-rose-950">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px] uppercase font-bold">Ngân hàng:</span>
                  <strong className="font-bold">{order.refundInfo?.bankName || 'Vietcombank'}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px] uppercase font-bold">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-sm">
                      {order.refundInfo?.accountNumber || 'Chưa cung cấp'}
                    </span>
                    {order.refundInfo?.accountNumber && (
                      <button
                        onClick={() => handleCopy(order.refundInfo!.accountNumber, order.id)}
                        className="p-1 rounded-md bg-white border border-rose-300 text-rose-700 hover:bg-rose-100"
                        title="Sao chép STK"
                      >
                        {copiedId === order.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px] uppercase font-bold">Chủ tài khoản:</span>
                  <strong className="font-bold uppercase">
                    {order.refundInfo?.accountHolder || order.studentName}
                  </strong>
                </div>

                {order.cancellationReason && (
                  <p className="pt-1 text-[11px] text-gray-600 italic border-t border-rose-200">
                    Lý do: "{order.cancellationReason}"
                  </p>
                )}
              </div>

              {/* Confirm Refund Button */}
              <button
                onClick={() => handleConfirmRefund(order.id)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã chuyển khoản - Mark as Refunded</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* History */}
      {processedRefunds.length > 0 && (
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <h3 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">
            Lịch sử đã hoàn tiền ({processedRefunds.length})
          </h3>
          <div className="space-y-2">
            {processedRefunds.map((o) => (
              <div
                key={o.id}
                className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs flex items-center justify-between text-gray-600"
              >
                <div>
                  <span className="font-mono font-bold text-gray-800">{o.id}</span>
                  <span className="block text-[10px] text-gray-400">
                    {o.studentName} • {o.refundInfo?.bankName} - {o.refundInfo?.accountNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-600">
                    +{o.total.toLocaleString()}đ
                  </span>
                  <span className="block text-[9px] text-emerald-700 font-bold">✓ Hoàn tất</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
