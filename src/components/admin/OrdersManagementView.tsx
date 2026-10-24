import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  UserX,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const OrdersManagementView: React.FC = () => {
  const { orders, updateOrderStatus, markNoShow, cancelOrder } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesStudent = o.studentId.toLowerCase().includes(q) || o.studentName.toLowerCase().includes(q);
        if (!matchesId && !matchesStudent) return false;
      }
      return true;
    });
  }, [orders, filterStatus, search]);

  const handleMarkNoShow = (orderId: string) => {
    if (confirm(`Đánh dấu sinh viên KHÔNG ĐẾN LẤY cho đơn ${orderId}? Sinh viên sẽ bị cộng 1 lần vi phạm theo chính sách căn tin.`)) {
      feedback.warning();
      markNoShow(orderId);
    }
  };

  const handleCancel = (orderId: string) => {
    const reason = prompt('Nhập lý do hủy đơn:', 'Hết nguyên liệu / Bếp quá tải');
    if (reason) {
      feedback.tap();
      cancelOrder(orderId, reason);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'ready':
        return (
          <span className="px-2 py-0.5 rounded-md font-medium text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            Sẵn sàng nhận
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2 py-0.5 rounded-md font-medium text-[10px] bg-amber-50 text-amber-800 border border-amber-200/60">
            Đang chuẩn bị
          </span>
        );
      case 'paid':
        return (
          <span className="px-2 py-0.5 rounded-md font-medium text-[10px] bg-stone-100 text-stone-700 border border-stone-200">
            Đã thanh toán
          </span>
        );
      case 'placed':
        return (
          <span className="px-2 py-0.5 rounded-md font-medium text-[10px] bg-stone-100 text-stone-700 border border-stone-200">
            Chờ thanh toán
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-md font-medium text-[10px] bg-stone-50 text-stone-500 border border-stone-200/50">
            Đã hoàn thành
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 rounded-md font-medium text-[10px] bg-rose-50 text-rose-700 border border-rose-200/60">
            Đã hủy
          </span>
        );
      case 'refund_requested':
        return (
          <span className="px-2 py-0.5 rounded-md font-medium text-[10px] bg-purple-50 text-purple-800 border border-purple-200/60">
            Chờ hoàn tiền
          </span>
        );
      case 'no_show':
        return (
          <span className="px-2 py-0.5 rounded-md font-medium text-[10px] bg-rose-900 text-rose-100">
            Vi phạm / Không lấy
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md font-medium text-[10px] bg-stone-100 text-stone-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-3.5 space-y-4 pb-20 animate-in fade-in duration-200">
      <div>
        <h2 className="text-base font-semibold text-stone-900 tracking-tight">
          Quản lý toàn bộ đơn hàng ({orders.length})
        </h2>
        <p className="text-xs text-stone-500">Tra cứu nhanh theo mã đơn, mã sinh viên và trạng thái</p>
      </div>

      {/* Filters & Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn (IC-...), MSSV (23070572), Tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all placeholder:text-stone-400"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {['all', 'placed', 'paid', 'preparing', 'ready', 'completed', 'cancelled', 'refund_requested', 'no_show'].map(
            (st) => {
              const label =
                st === 'all'
                  ? 'Tất cả'
                  : st === 'placed'
                  ? 'Chờ thanh toán'
                  : st === 'paid'
                  ? 'Đã trả'
                  : st === 'preparing'
                  ? 'Đang nấu'
                  : st === 'ready'
                  ? 'Sẵn sàng'
                  : st === 'completed'
                  ? 'Đã giao'
                  : st === 'cancelled'
                  ? 'Đã hủy'
                  : st === 'refund_requested'
                  ? 'Chờ hoàn tiền'
                  : 'Không lấy';

              const isSelected = filterStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => {
                    feedback.tap();
                    setFilterStatus(st);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-stone-100 shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900 border border-transparent'
                  }`}
                >
                  {label}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-2.5">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200/70">
            <Clock className="w-8 h-8 mx-auto text-stone-300 mb-2 stroke-1" />
            <p className="text-xs">Không tìm thấy đơn hàng nào trong bộ lọc</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-3.5 rounded-2xl bg-white border border-stone-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-semibold text-stone-900 block">
                    {order.id}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {order.studentName} · {order.studentId} · {order.slotLabel}
                  </span>
                </div>

                {getStatusBadge(order.status)}
              </div>

              <div className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex items-center justify-between">
                <span className="text-stone-600">{order.items.length} món đã đặt</span>
                <span className="font-medium text-stone-900 font-mono">
                  {order.total.toLocaleString()}đ <span className="text-[10px] text-stone-400 font-sans">({order.paymentMethod})</span>
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-0.5">
                {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'no_show' && (
                  <button
                    onClick={() => handleMarkNoShow(order.id)}
                    className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-medium flex items-center gap-1 transition-all"
                  >
                    <UserX className="w-3 h-3" /> Vi phạm nhận món
                  </button>
                )}

                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-[11px] font-medium transition-all"
                  >
                    Hủy đơn
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
