import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { QRCodeModal } from './QRCodeModal';
import {
  Clock,
  QrCode,
  RotateCcw,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const MyOrdersView: React.FC = () => {
  const { orders, profile, cancelOrder, reorder } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedQRModalOrder, setSelectedQRModalOrder] = useState<Order | null>(null);

  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Bận lịch học đột xuất');
  const [bankName, setBankName] = useState(profile.bankName || 'Vietcombank');
  const [accountNumber, setAccountNumber] = useState(profile.accountNumber || '');
  const [accountHolder, setAccountHolder] = useState(profile.accountHolder || profile.name);

  const myOrders = orders.filter((o) => o.studentId === profile.studentId);

  const activeOrders = myOrders.filter(
    (o) =>
      o.status === 'placed' ||
      o.status === 'paid' ||
      o.status === 'preparing' ||
      o.status === 'ready' ||
      o.status === 'refund_requested'
  );

  const historyOrders = myOrders.filter(
    (o) => o.status === 'completed' || o.status === 'cancelled' || o.status === 'refunded' || o.status === 'no_show'
  );

  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  const handleOpenCancelModal = (order: Order) => {
    feedback.tap();
    setCancellingOrder(order);
  };

  const handleConfirmCancel = () => {
    if (!cancellingOrder) return;

    if (cancellingOrder.isPaid) {
      if (!accountNumber.trim()) {
        alert('Vui lòng nhập số tài khoản ngân hàng để nhận tiền hoàn.');
        return;
      }
      cancelOrder(cancellingOrder.id, cancelReason, {
        bankName,
        accountNumber,
        accountHolder,
      });
    } else {
      cancelOrder(cancellingOrder.id, cancelReason);
    }

    setCancellingOrder(null);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'ready':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-stone-100 font-semibold text-[10px]">
            Sẵn sàng nhận
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200 font-semibold text-[10px]">
            Đang nấu
          </span>
        );
      case 'paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-medium text-[10px]">
            Đã thanh toán
          </span>
        );
      case 'placed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium text-[10px]">
            Chờ thanh toán
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-stone-50 text-stone-500 font-medium text-[10px]">
            Đã nhận món
          </span>
        );
      case 'refund_requested':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-medium text-[10px]">
            Chờ hoàn tiền
          </span>
        );
      case 'refunded':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium text-[10px]">
            Đã hoàn tiền
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium text-[10px]">
            Đã hủy
          </span>
        );
      case 'no_show':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-medium text-[10px]">
            Không đến lấy
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 px-4 pt-3 pb-32 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-bold text-stone-900 tracking-tight">Đơn hàng của tôi</h2>
        <p className="text-xs text-stone-500">Mã QR nhận món & lịch sử đơn</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-stone-200/60 rounded-2xl">
        <button
          onClick={() => {
            feedback.tap();
            setActiveTab('active');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-white text-stone-950 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Đang xử lý</span>
          {activeOrders.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-stone-900 text-white text-[9px] font-mono">
              {activeOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            feedback.tap();
            setActiveTab('history');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-white text-stone-950 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Lịch sử ({historyOrders.length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {displayedOrders.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <ShoppingBag className="w-8 h-8 mx-auto text-stone-300 mb-2 stroke-1" />
            <p className="text-xs font-medium">
              {activeTab === 'active' ? 'Không có đơn nào đang chờ' : 'Chưa có lịch sử đơn hàng'}
            </p>
          </div>
        ) : (
          displayedOrders.map((order) => {
            const isCanCancel =
              order.status === 'placed' || order.status === 'paid' || order.status === 'preparing';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.015)] space-y-3"
              >
                {/* Header card */}
                <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-stone-900 block">
                      {order.id}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {order.orderDate} · {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Slot info */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50 border border-stone-200/60 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-600" />
                    <div>
                      <span className="text-[10px] text-stone-400 block leading-tight">Khung nhận:</span>
                      <strong className="font-mono text-stone-900 text-xs">{order.slotLabel}</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-500">
                    {order.paymentMethod === 'pay_at_counter' ? 'Trả tại quầy' : 'Đã thanh toán'}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-stone-100 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="font-bold text-stone-900 font-mono">{item.quantity}x</span>
                        <span className="text-stone-800 truncate">{item.product.name}</span>
                      </div>
                      <span className="font-mono text-stone-600 shrink-0">
                        {(item.product.price * item.quantity).toLocaleString()}đ
                      </span>
                    </div>
                  ))}

                  {order.note && (
                    <p className="pt-1.5 text-[11px] text-stone-500 italic">
                      "{order.note}"
                    </p>
                  )}

                  <div className="pt-2 flex justify-between font-bold text-xs text-stone-900">
                    <span>Tổng đơn:</span>
                    <span className="font-mono text-sm">{order.total.toLocaleString()}đ</span>
                  </div>
                </div>

                {/* Refund info */}
                {order.refundInfo && (
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Thông tin hoàn tiền:</span>
                      <span className="text-[10px] uppercase font-mono text-stone-500">
                        {order.status === 'refunded' ? 'Đã hoàn tất' : 'Đang xử lý'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      {order.refundInfo.bankName} · STK: <strong className="font-mono">{order.refundInfo.accountNumber}</strong>
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="pt-1 flex items-center justify-end gap-2">
                  {(order.status === 'completed' || order.status === 'cancelled') && (
                    <button
                      onClick={() => reorder(order)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
                    </button>
                  )}

                  {isCanCancel && (
                    <button
                      onClick={() => handleOpenCancelModal(order)}
                      className="px-3 py-1.5 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-medium underline"
                    >
                      Hủy đơn
                    </button>
                  )}

                  {(order.status === 'placed' ||
                    order.status === 'paid' ||
                    order.status === 'preparing' ||
                    order.status === 'ready') && (
                    <button
                      onClick={() => {
                        feedback.tap();
                        setSelectedQRModalOrder(order);
                      }}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Mã QR
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancel Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-bold text-sm text-stone-900">
                {cancellingOrder.isPaid ? 'Yêu cầu hoàn tiền' : 'Hủy đơn hàng'}
              </h3>
              <button
                onClick={() => setCancellingOrder(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Bạn có chắc muốn hủy đơn <strong>{cancellingOrder.id}</strong>?
            </p>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">Lý do hủy:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
              >
                <option value="Bận lịch học đột xuất">Bận lịch học đột xuất</option>
                <option value="Đặt nhầm món / khung giờ">Đặt nhầm món / khung giờ</option>
                <option value="Đổi ý sang ăn cùng bạn">Đổi ý sang ăn cùng bạn</option>
                <option value="Khác">Lý do khác</option>
              </select>
            </div>

            {cancellingOrder.isPaid && (
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <span className="font-semibold text-stone-900 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-stone-600" /> Tài khoản nhận hoàn tiền:
                </span>

                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  placeholder="Ngân hàng (Vietcombank, MB...)"
                />

                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-mono"
                  placeholder="Số tài khoản"
                />

                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white uppercase"
                  placeholder="Tên chủ tài khoản"
                />
              </div>
            )}

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => setCancellingOrder(null)}
                className="py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200"
              >
                Giữ đơn lại
              </button>
              <button
                onClick={handleConfirmCancel}
                className="py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
              >
                {cancellingOrder.isPaid ? 'Gửi yêu cầu' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      <QRCodeModal
        order={selectedQRModalOrder}
        isOpen={!!selectedQRModalOrder}
        onClose={() => setSelectedQRModalOrder(null)}
      />
    </div>
  );
};
