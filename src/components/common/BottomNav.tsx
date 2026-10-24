import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, UtensilsCrossed, ReceiptText, Sparkles, User } from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const BottomNav: React.FC = () => {
  const { studentTab, setStudentTab, cart, orders, profile } = useApp();

  const cartTotalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const activeOrdersCount = orders.filter(
    (o) =>
      o.studentId === profile.studentId &&
      (o.status === 'placed' || o.status === 'paid' || o.status === 'preparing' || o.status === 'ready')
  ).length;

  const tabs = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: <Home className="w-5 h-5" />,
      badge: null,
    },
    {
      id: 'order',
      label: 'Đặt món',
      icon: <UtensilsCrossed className="w-5 h-5" />,
      badge: cartTotalItems > 0 ? cartTotalItems : null,
      badgeColor: 'bg-stone-900',
    },
    {
      id: 'my-orders',
      label: 'Đơn của tôi',
      icon: <ReceiptText className="w-5 h-5" />,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      badgeColor: 'bg-stone-800',
    },
    {
      id: 'ai',
      label: 'Trợ lý AI',
      icon: <Sparkles className="w-5 h-5" />,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'profile',
      label: 'Tài khoản',
      icon: <User className="w-5 h-5" />,
      badge: profile.isLocked ? '!' : null,
      badgeColor: 'bg-rose-500',
    },
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-t border-stone-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-14">
        {tabs.map((tab) => {
          const isActive = studentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                feedback.tap();
                setStudentTab(tab.id as 'home' | 'order' | 'my-orders' | 'ai' | 'profile');
              }}
              className="relative flex flex-col items-center justify-center gap-0.5 text-stone-500 hover:text-stone-900 transition-colors"
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'text-stone-950 font-bold scale-105' : 'text-stone-400'
                  }`}
                >
                  {tab.icon}
                </div>

                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full text-white font-bold flex items-center justify-center text-[9px] shadow-xs ${
                      tab.badgeColor || 'bg-stone-900'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-medium tracking-tight transition-colors ${
                  isActive ? 'text-stone-950 font-bold' : 'text-stone-500'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute bottom-1 w-5 h-0.5 bg-stone-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
