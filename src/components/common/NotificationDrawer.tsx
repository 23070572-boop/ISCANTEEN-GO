import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, Trash2, X, Clock, ShoppingBag, ShieldAlert, Sparkles } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationsAsRead, clearAllNotifications, setStudentTab, role } = useApp();

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-3.5 h-3.5 text-stone-700" />;
      case 'refund':
        return <Clock className="w-3.5 h-3.5 text-emerald-700" />;
      case 'system':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-700" />;
    }
  };

  const handleOpenOrder = () => {
    onClose();
    if (role === 'student') {
      setStudentTab('my-orders');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-[#faf9f6] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-stone-800" />
            <h2 className="font-bold text-sm text-stone-900">Thông báo ({notifications.length})</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-2.5 bg-stone-100/70 border-b border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
          <button
            onClick={markNotificationsAsRead}
            className="flex items-center gap-1 hover:text-stone-900 font-medium transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Đã đọc
          </button>
          <button
            onClick={clearAllNotifications}
            className="flex items-center gap-1 hover:text-rose-700 font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa hết
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-200/60">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-stone-400 p-6 text-center">
              <Bell className="w-10 h-10 stroke-1 text-stone-300 mb-2" />
              <p className="text-xs font-medium text-stone-600">Không có thông báo mới</p>
              <p className="text-[11px] text-stone-400 mt-1">Thông tin nhận món và trạng thái đơn sẽ xuất hiện tại đây</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={handleOpenOrder}
                className={`p-4 cursor-pointer transition-colors hover:bg-stone-100/70 ${
                  !item.read ? 'bg-white' : 'bg-transparent opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-stone-100 border border-stone-200/80 mt-0.5 shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${!item.read ? 'text-stone-950 font-bold' : 'text-stone-700'}`}>
                        {item.title}
                      </p>
                      {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-stone-900 shrink-0" />}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-stone-400 mt-1.5 block font-mono">
                      {new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
