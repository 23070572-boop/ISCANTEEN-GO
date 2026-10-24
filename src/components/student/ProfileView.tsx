import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Crown,
  CreditCard,
  ShieldAlert,
  Trash2,
  Save,
  CheckCircle2,
  LogIn,
  LogOut,
  UserPlus,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const ProfileView: React.FC = () => {
  const {
    profile,
    updateProfile,
    subscribeGoPass,
    cancelGoPass,
    resetStudentStrikes,
    openAuthModal,
    logout,
    openAppStoreModal,
  } = useApp();

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [bankName, setBankName] = useState(profile.bankName || 'Vietcombank');
  const [accountNumber, setAccountNumber] = useState(profile.accountNumber || '');
  const [accountHolder, setAccountHolder] = useState(profile.accountHolder || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    feedback.tap();
    updateProfile({
      name,
      phone,
      bankName,
      accountNumber,
      accountHolder: accountHolder.toUpperCase(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('Khôi phục dữ liệu ban đầu cho bản mẫu Mobile Commerce?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 px-4 pt-3 pb-32 animate-in fade-in duration-200">
      {/* Profile Card */}
      <div className="p-5 rounded-3xl bg-stone-900 text-stone-100 shadow-xl flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-200 flex items-center justify-center font-bold text-lg border border-stone-700">
          {profile.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base tracking-tight truncate">{profile.name}</h2>
            {profile.hasGoPass && (
              <span className="px-2 py-0.2 rounded-full bg-amber-200/20 text-amber-300 font-semibold text-[9px] border border-amber-300/30">
                VIP
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 font-mono mt-0.5">MSSV: {profile.studentId}</p>
          <p className="text-[11px] text-stone-400 truncate">{profile.email}</p>
        </div>
      </div>

      {/* Lock status banner if any */}
      {profile.isLocked ? (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-semibold">Tài khoản bị khóa đặt món</strong>
            <span className="text-[11px]">Đã tích lũy đủ 3 lần không đến lấy món đúng giờ.</span>
            <button
              onClick={() => resetStudentStrikes(profile.studentId)}
              className="mt-2 px-3 py-1 rounded-lg bg-stone-900 text-white font-medium text-[10px] block"
            >
              Mở khóa thử nghiệm (Reset vi phạm)
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 text-xs text-stone-700 flex items-center justify-between">
          <span className="text-stone-600">Số lần vi phạm không nhận:</span>
          <span className="font-bold font-mono text-stone-900">
            {profile.penaltyStrikes}/3 lần
          </span>
        </div>
      )}

      {/* Go Pass Membership Card */}
      <div className="p-5 rounded-3xl bg-[#f5f1eb] border border-stone-300/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-bold text-xs text-stone-900">Gói hội viên Go Pass</h3>
              <p className="text-[11px] text-stone-500 font-mono">19.000đ / tháng</p>
            </div>
          </div>
          {profile.hasGoPass ? (
            <span className="px-2.5 py-1 rounded-full bg-stone-200 text-stone-800 font-medium text-xs">
              Đang hoạt động
            </span>
          ) : (
            <button
              onClick={subscribeGoPass}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs active:scale-95 transition-all"
            >
              Đăng ký
            </button>
          )}
        </div>

        <div className="text-xs text-stone-600 space-y-1 leading-relaxed">
          <p>✓ Miễn 100% phí dịch vụ 2.000đ cho mọi đơn đặt</p>
          <p>✓ Ưu tiên đặt sớm các khung giờ cao điểm</p>
          {profile.hasGoPass && profile.goPassExpiry && (
            <p className="pt-2 text-[11px] text-stone-500 border-t border-stone-200">
              Thời hạn đến: {profile.goPassExpiry}
            </p>
          )}
        </div>

        {profile.hasGoPass && (
          <button
            onClick={cancelGoPass}
            className="text-[10px] text-stone-500 underline hover:text-stone-800"
          >
            Hủy gia hạn gói
          </button>
        )}
      </div>

      {/* Form: Bank and contact */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
          Thông tin nhận tiền hoàn & liên lạc
        </h3>

        <div>
          <label className="text-[11px] font-semibold text-stone-700 block mb-1">Họ và tên:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-stone-700 block mb-1">Số điện thoại:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400"
          />
        </div>

        <div className="pt-2 border-t border-stone-100 space-y-2.5">
          <span className="text-[11px] font-semibold text-stone-800 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-stone-600" />
            <span>Tài khoản ngân hàng hoàn tiền:</span>
          </span>

          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Tên ngân hàng (Vietcombank, MB...)"
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400"
          />

          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Số tài khoản"
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 font-mono"
          />

          <input
            type="text"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            placeholder="Tên chủ tài khoản"
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 uppercase"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Đã lưu thay đổi' : 'Lưu thông tin hồ sơ'}</span>
        </button>
      </form>

      {/* Account Switching & Auth Actions */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-2.5">
        <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
          Quản lý đăng nhập & Tài khoản
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => openAuthModal('student', 'login')}
            className="py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-stone-600" />
            <span>Đổi tài khoản SV</span>
          </button>

          <button
            onClick={() => openAuthModal('student', 'register')}
            className="py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-stone-600" />
            <span>Đăng ký mới</span>
          </button>
        </div>

        <button
          onClick={logout}
          className="w-full py-2 px-3 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-stone-400" />
          <span>Đăng xuất khỏi thiết bị này</span>
        </button>
      </div>

      {/* App Store & Mobile App Installation Hub */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-2">
        <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
          Ứng dụng di động & App Store
        </h3>
        <p className="text-[11px] text-stone-500">
          Cài đặt app trực tiếp lên iPhone/Android hoặc xem hướng dẫn xuất bản lên Apple App Store & Google Play.
        </p>
        <button
          onClick={() => {
            feedback.tap();
            openAppStoreModal();
          }}
          className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-bold text-xs text-stone-900">Mở Trung Tâm App Store & Cài Đặt</p>
              <p className="text-[10px] text-stone-500">PWA, Hướng dẫn iOS/Android, Lộ trình đưa lên Store</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* Reset Data for Demo */}
      <div>
        <button
          onClick={handleResetData}
          className="w-full py-2.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-500 border border-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-stone-400" />
          <span>Khôi phục dữ liệu ban đầu</span>
        </button>
      </div>
    </div>
  );
};
