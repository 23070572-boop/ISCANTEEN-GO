import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationDrawer } from './NotificationDrawer';
import { Utensils, Bell, Shield, Clock, Crown, LogIn, User, Smartphone } from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    profile,
    unreadNotificationCount,
    slotHolding,
    holdTimeRemaining,
    releaseSlotHolding,
    currentUser,
    openAuthModal,
    openAppStoreModal,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const formatHoldTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRoleToggle = (targetRole: 'student' | 'admin') => {
    feedback.tap();
    setRole(targetRole);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-stone-200/70 transition-colors">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between gap-2.5">
        {/* Brand & Identity */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs shrink-0">
            <Utensils className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-stone-900">
                ISCanteen <span className="font-serif italic font-normal text-stone-600">Go</span>
              </span>
              {role === 'student' && profile.hasGoPass && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-800 text-[9px] font-semibold border border-amber-200">
                  <Crown className="w-2.5 h-2.5 text-amber-600" /> Pass
                </span>
              )}
            </div>
            <p className="text-[10px] text-stone-500 font-medium">M-Commerce · 24 đơn/khung</p>
          </div>
        </div>

        {/* Right Section: Role Switcher & Auth Trigger & Bell */}
        <div className="flex items-center gap-1.5">
          {/* Segmented Role Switcher */}
          <div className="bg-stone-200/70 p-0.5 rounded-full flex items-center border border-stone-300/40">
            <button
              onClick={() => handleRoleToggle('student')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                role === 'student'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sinh viên
            </button>
            <button
              onClick={() => handleRoleToggle('admin')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${
                role === 'admin'
                  ? 'bg-stone-900 text-stone-100 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Shield className="w-3 h-3" /> Căn tin
            </button>
          </div>

          {/* User Account / Auth Modal Trigger */}
          <button
            onClick={() => openAuthModal(role)}
            className="p-1 px-2 rounded-full border border-stone-200 hover:border-stone-300 bg-white text-stone-800 text-[10px] font-semibold flex items-center gap-1 shadow-2xs transition-colors"
            title="Đăng nhập / Đổi tài khoản"
          >
            {currentUser ? (
              <>
                <User className="w-3 h-3 text-stone-600" />
                <span className="max-w-[45px] truncate">{currentUser.name.split(' ').pop()}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3 h-3 text-stone-600" />
                <span>Đăng nhập</span>
              </>
            )}
          </button>

          {/* App Store / Tải App Modal Trigger */}
          <button
            onClick={() => {
              feedback.tap();
              openAppStoreModal();
            }}
            className="p-1 px-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-100 text-[10px] font-semibold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
            title="Cài đặt App / Hướng dẫn App Store"
          >
            <Smartphone className="w-3 h-3 text-stone-300" />
            <span>Tải App</span>
          </button>

          {/* Notification Button */}
          <button
            onClick={() => {
              feedback.tap();
              setShowNotifications(true);
            }}
            className="relative p-1.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors shrink-0"
            aria-label="Thông báo"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-stone-900 text-stone-100 text-[8px] font-bold flex items-center justify-center">
                {unreadNotificationCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Temporary Holding Countdown - Refined subtle bar */}
      {role === 'student' && slotHolding && (
        <div className="bg-stone-900 text-stone-100 px-4 py-1.5 text-xs flex items-center justify-between border-t border-stone-800">
          <div className="flex items-center gap-2 text-stone-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Giữ chỗ tạm thời khung: <strong className="text-white font-mono">{slotHolding.slotId}</strong></span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-semibold text-amber-300 text-xs">
              {formatHoldTime(holdTimeRemaining)}
            </span>
            <button
              onClick={releaseSlotHolding}
              className="text-[10px] text-stone-400 hover:text-stone-200 underline"
            >
              Nhả chỗ
            </button>
          </div>
        </div>
      )}

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
};
