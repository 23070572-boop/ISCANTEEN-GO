import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Flame,
  Send,
  Lock,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    slots,
    selectedDate,
    getSlotUsage,
    rules,
    setAdminTab,
    broadcastSystemNotification,
  } = useApp();

  const [announcementText, setAnnouncementText] = useState('');

  // Orders today
  const todayOrders = orders.filter((o) => o.orderDate === selectedDate);
  const totalRevenue = todayOrders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => sum + o.total, 0);

  const preparingCount = todayOrders.filter((o) => o.status === 'preparing' || o.status === 'paid').length;
  const readyCount = todayOrders.filter((o) => o.status === 'ready').length;
  const completedCount = todayOrders.filter((o) => o.status === 'completed').length;
  const cancelledCount = todayOrders.filter((o) => o.status === 'cancelled' || o.status === 'no_show').length;
  const refundReqCount = todayOrders.filter((o) => o.status === 'refund_requested').length;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    feedback.tap();
    broadcastSystemNotification('Thông báo từ Căn tin:', announcementText);
    setAnnouncementText('');
  };

  return (
    <div className="p-3.5 space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Overview Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
            Bảng điều khiển Căn tin hôm nay
          </h2>
          <p className="text-xs text-gray-500">
            Ngày: {selectedDate} • Giới hạn cấu hình: <strong>{rules.slotCapacity} đơn/khung</strong>
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-semibold">Tổng đơn</span>
            <ShoppingBag className="w-4 h-4 text-stone-600" />
          </div>
          <p className="text-xl font-bold text-stone-900 font-mono">{todayOrders.length}</p>
          <span className="text-[10px] text-stone-400">Tất cả trạng thái</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-semibold">Doanh thu bán</span>
            <DollarSign className="w-4 h-4 text-stone-600" />
          </div>
          <p className="text-lg font-bold text-stone-900 font-mono">
            {totalRevenue.toLocaleString()}đ
          </p>
          <span className="text-[10px] text-stone-400">Hôm nay</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-semibold">Bếp đang nấu</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-xl font-bold text-stone-900 font-mono">{preparingCount}</p>
          <span className="text-[10px] text-stone-400">Đang chuẩn bị</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-semibold">Chờ giao tại quầy</span>
            <CheckCircle2 className="w-4 h-4 text-stone-600" />
          </div>
          <p className="text-xl font-bold text-stone-900 font-mono">{readyCount}</p>
          <span className="text-[10px] text-stone-400">Đã xong món</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-semibold">Đã hoàn thành</span>
            <CheckCircle2 className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-xl font-bold text-stone-700 font-mono">{completedCount}</p>
          <span className="text-[10px] text-stone-400">Đã nhận</span>
        </div>

        <div
          onClick={() => {
            if (refundReqCount > 0) setAdminTab('refunds');
          }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            refundReqCount > 0
              ? 'bg-rose-50/70 border-rose-200'
              : 'bg-white border-stone-200/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-semibold text-rose-800">Chờ hoàn tiền</span>
            <RotateCcw className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold text-rose-700 font-mono">{refundReqCount}</p>
          <span className="text-[10px] text-rose-600">
            {refundReqCount > 0 ? 'Xử lý ngay' : '0 yêu cầu'}
          </span>
        </div>
      </div>

      {/* 10-Slot Load Capacity Chart */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">
              Biểu đồ mức tải 10 khung giờ ({selectedDate})
            </h3>
            <p className="text-[11px] text-gray-500">
              Chỉ tính các đơn có món làm tươi (Cần chuẩn bị)
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-gray-600">
            Max: {rules.slotCapacity} đơn/khung
          </span>
        </div>

        <div className="space-y-2">
          {slots.map((slot) => {
            const usage = getSlotUsage(slot.id, selectedDate);
            const barBg =
              usage.statusColor === 'green'
                ? 'bg-emerald-500'
                : usage.statusColor === 'yellow'
                ? 'bg-amber-500'
                : usage.statusColor === 'red'
                ? 'bg-rose-500'
                : 'bg-gray-500';

            return (
              <div key={slot.id} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-gray-800">{slot.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500">
                      <strong>{usage.count}</strong> / {usage.capacity} đơn
                    </span>
                    <span
                      className={`font-mono font-extrabold text-[10px] px-1.5 py-0.2 rounded ${
                        usage.isFull
                          ? 'bg-rose-100 text-rose-700'
                          : usage.percent >= 70
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {usage.percent}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${barBg}`}
                    style={{ width: `${Math.max(4, usage.percent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Broadcast Announcement Bar */}
      <form onSubmit={handleBroadcast} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2">
        <h3 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
          <Send className="w-3.5 h-3.5 text-orange-500" />
          <span>Gửi thông báo toàn hệ thống đến sinh viên:</span>
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ví dụ: Căn tin mở thêm quầy nước giải nhiệt hôm nay..."
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            disabled={!announcementText.trim()}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs disabled:opacity-30 transition-all"
          >
            Gửi
          </button>
        </div>
      </form>
    </div>
  );
};
