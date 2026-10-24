import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ChefHat,
  QrCode,
  ListOrdered,
  RotateCcw,
  UtensilsCrossed,
  Clock,
  Users,
  DollarSign,
  Calculator,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const AdminNav: React.FC = () => {
  const { adminTab, setAdminTab, orders } = useApp();

  const refundRequestsCount = orders.filter((o) => o.status === 'refund_requested').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    {
      id: 'kitchen',
      label: 'Bếp KDS',
      icon: <ChefHat className="w-3.5 h-3.5" />,
      badge: preparingCount > 0 ? preparingCount : null,
      badgeColor: 'bg-stone-700',
    },
    { id: 'pickup', label: 'Quầy giao món', icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: 'orders', label: 'Đơn hàng', icon: <ListOrdered className="w-3.5 h-3.5" /> },
    {
      id: 'refunds',
      label: 'Hoàn tiền',
      icon: <RotateCcw className="w-3.5 h-3.5" />,
      badge: refundRequestsCount > 0 ? refundRequestsCount : null,
      badgeColor: 'bg-rose-600',
    },
    { id: 'menu', label: 'Thực đơn', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
    { id: 'slots', label: 'Khung giờ & Rules', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'students', label: 'Sinh viên', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'revenue', label: 'Báo cáo nguồn thu', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'simulator', label: 'Mô phỏng M3', icon: <Calculator className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="bg-stone-900 border-b border-stone-800 text-stone-100 px-3 py-2 sticky top-12 z-30 shadow-sm">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                feedback.tap();
                setAdminTab(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-white text-[9px] font-bold ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
