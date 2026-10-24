import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QRCodeModal } from './QRCodeModal';
import {
  Sparkles,
  ArrowRight,
  Clock,
  QrCode,
  Crown,
  AlertCircle,
  Check,
  Plus,
  ShoppingBag,
  Smartphone,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';
import { Order, Product } from '../../types';

export const StudentHome: React.FC = () => {
  const {
    profile,
    orders,
    products,
    setStudentTab,
    selectSlot,
    findLeastLoadedSlot,
    selectedDate,
    addToCart,
    subscribeGoPass,
    isAuthenticated,
    openAuthModal,
    openAppStoreModal,
  } = useApp();

  const [selectedQRModalOrder, setSelectedQRModalOrder] = useState<Order | null>(null);

  // Active waiting orders for current student
  const activeWaitingOrder = orders.find(
    (o) =>
      o.studentId === profile.studentId &&
      (o.status === 'placed' || o.status === 'paid' || o.status === 'preparing' || o.status === 'ready')
  );

  const sponsoredProducts = products.filter((p) => p.isSponsored);
  const aiRecommendedSlot = findLeastLoadedSlot(selectedDate);

  const handleStartOrdering = () => {
    feedback.tap();
    setStudentTab('order');
  };

  const handleSelectAISlot = () => {
    if (aiRecommendedSlot) {
      const res = selectSlot(aiRecommendedSlot);
      if (res.success) {
        setStudentTab('order');
      }
    } else {
      setStudentTab('order');
    }
  };

  const handleAddSponsoredItem = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="space-y-4 px-4 pt-3 pb-24 animate-in fade-in duration-200">
      {/* Greeting & Profile Status */}
      {!isAuthenticated ? (
        <div className="p-4 rounded-3xl bg-stone-900 text-stone-100 flex items-center justify-between gap-3 shadow-md">
          <div>
            <h2 className="font-bold text-sm tracking-tight text-white">Chưa đăng nhập tài khoản</h2>
            <p className="text-[11px] text-stone-400 mt-0.5">Đăng nhập hoặc đăng ký để đặt món & giữ chỗ</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => openAuthModal('student', 'login')}
              className="px-3 py-1.5 rounded-xl bg-white text-stone-900 text-xs font-semibold hover:bg-stone-100 transition-colors"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => openAuthModal('student', 'register')}
              className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-200 border border-stone-700 text-xs font-medium hover:bg-stone-700 transition-colors"
            >
              Đăng ký
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Chào buổi sáng, {profile.name}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              MSSV: <span className="font-mono text-stone-700">{profile.studentId}</span> · Căn tin VNU
            </p>
          </div>

          {profile.hasGoPass ? (
            <div className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200/80 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-700" /> Go Pass
            </div>
          ) : (
            <button
              onClick={subscribeGoPass}
              className="px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200 transition-colors"
            >
              Đăng ký Pass
            </button>
          )}
        </div>
      )}

      {/* Gentle Peak Hour Notice */}
      <div className="p-3.5 rounded-2xl bg-stone-100/80 border border-stone-200/60 text-xs text-stone-700 leading-relaxed flex items-center gap-2.5">
        <Clock className="w-4 h-4 text-stone-500 shrink-0" />
        <span>
          <strong className="font-semibold text-stone-900">Giờ cao điểm:</strong> Khung 11h45 và 12h45 thường đầy chỗ sớm. Khuyến khích đặt trước 30 phút.
        </span>
      </div>

      {/* Hero Active Order Card - Deep Warm Charcoal Minimalist */}
      {activeWaitingOrder && (
        <div className="rounded-3xl bg-stone-900 text-stone-100 p-5 shadow-xl shadow-stone-900/5 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider">
                Đơn đang chờ nhận
              </span>
            </div>
            <span className="font-mono text-xs text-stone-400 font-medium">{activeWaitingOrder.id}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-400 block">Khung giờ nhận món:</span>
              <span className="text-xl font-bold font-mono tracking-tight text-amber-200">
                {activeWaitingOrder.slotLabel}
              </span>
              <p className="text-xs text-stone-300 mt-1">
                {activeWaitingOrder.items.length} món · {activeWaitingOrder.total.toLocaleString()}đ
              </p>
            </div>

            <button
              onClick={() => {
                feedback.tap();
                setSelectedQRModalOrder(activeWaitingOrder);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-950 text-xs font-bold shadow-md flex items-center gap-2 active:scale-95 transition-all"
            >
              <QrCode className="w-4 h-4" />
              Mở mã QR
            </button>
          </div>

          <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
            <span>
              Trạng thái:{' '}
              <strong className="text-stone-200 font-semibold capitalize">
                {activeWaitingOrder.status === 'ready'
                  ? 'Sẵn sàng tại quầy'
                  : activeWaitingOrder.status === 'preparing'
                  ? 'Đang chế biến'
                  : 'Đã xác nhận'}
              </strong>
            </span>
            <span className="text-amber-200 font-medium">Quầy giao món số 2</span>
          </div>
        </div>
      )}

      {/* Primary Clean Booking Card */}
      <div className="rounded-3xl bg-white p-5 border border-stone-200/90 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
            Đặt món thông minh
          </span>
          <h2 className="text-base font-bold text-stone-900 tracking-tight mt-0.5">
            Chọn khung giờ nhận trước
          </h2>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            Hệ thống giữ chỗ 5 phút, kiểm tra công suất 24 đơn/khung để không bao giờ phải xếp hàng chờ đợi.
          </p>
        </div>

        <button
          onClick={handleStartOrdering}
          className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-between shadow-md shadow-stone-900/10 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-stone-300" />
            <span>Xem lịch khung giờ & Đặt món</span>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* AI Smart Slot & Meal Suggestion */}
      <div className="p-4 rounded-3xl bg-stone-100/70 border border-stone-200/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900">
            <div className="w-6 h-6 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-bold block">AI Gợi ý Món & Khung giờ</span>
              <span className="text-[10px] text-stone-500">Phân tích theo ngân sách & dinh dưỡng học tập</span>
            </div>
          </div>

          <button
            onClick={() => {
              feedback.tap();
              setStudentTab('ai');
            }}
            className="px-2.5 py-1 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-medium flex items-center gap-1 shadow-2xs transition-colors"
          >
            <span>Mở chat AI</span>
            <ArrowRight className="w-3 h-3 text-stone-300" />
          </button>
        </div>

        {/* AI Slot Quick Action */}
        {aiRecommendedSlot && (
          <div className="p-2.5 rounded-2xl bg-white border border-stone-200/80 flex items-center justify-between gap-2">
            <div className="text-[11px] text-stone-600 truncate">
              🕒 Khung <strong>{aiRecommendedSlot.label}</strong> đang rất vắng khách
            </div>
            <button
              onClick={handleSelectAISlot}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-900 text-[10px] font-semibold shrink-0 transition-colors"
            >
              Giữ chỗ
            </button>
          </div>
        )}

        {/* AI Meal Quick Combos */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            onClick={() => {
              feedback.tap();
              setStudentTab('ai');
            }}
            className="p-2 rounded-xl bg-white border border-stone-200/80 text-left hover:border-stone-400 transition-colors"
          >
            <span className="font-semibold text-stone-900 block truncate">🍱 Bữa trưa no lâu</span>
            <span className="text-[10px] text-stone-500 block truncate">Mì xào bò + Trà trái cây</span>
          </button>

          <button
            onClick={() => {
              feedback.tap();
              setStudentTab('ai');
            }}
            className="p-2 rounded-xl bg-white border border-stone-200/80 text-left hover:border-stone-400 transition-colors"
          >
            <span className="font-semibold text-stone-900 block truncate">🥗 Eat Clean mát lành</span>
            <span className="text-[10px] text-stone-500 block truncate">Salad tươi + Nước cam</span>
          </button>
        </div>
      </div>

      {/* Sponsored Partner Dishes (Món đối tác tài trợ) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
            Món gợi ý từ đối tác
          </h3>
          <span className="text-[11px] text-stone-400">Tài trợ</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {sponsoredProducts.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3 border border-stone-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div className="relative mb-2.5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-24 object-cover rounded-xl"
                  loading="lazy"
                />
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-stone-900/75 backdrop-blur-xs text-white text-[9px] font-medium">
                  {item.type === 'ready' ? 'Có sẵn' : 'Làm tươi'}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-stone-900 truncate">{item.name}</h4>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-stone-900">
                    {item.price.toLocaleString()}đ
                  </span>
                  <button
                    onClick={(e) => handleAddSponsoredItem(item, e)}
                    className="w-7 h-7 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-xs active:scale-90 transition-all"
                    aria-label={`Thêm ${item.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Go Pass Membership - Refined Champagne/Alabaster Card */}
      <div className="rounded-3xl bg-[#f5f1eb] p-5 border border-stone-300/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-stone-900 text-amber-300 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-stone-900">Gói thành viên Go Pass</h3>
              <p className="text-[11px] text-stone-500 font-mono">19.000đ / tháng</p>
            </div>
          </div>

          {profile.hasGoPass ? (
            <span className="px-2.5 py-1 rounded-full bg-stone-200 text-stone-800 text-[10px] font-semibold">
              Đang hoạt động
            </span>
          ) : (
            <button
              onClick={subscribeGoPass}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs active:scale-95 transition-all"
            >
              Kích hoạt
            </button>
          )}
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          Miễn 100% phí dịch vụ 2.000đ cho mọi đơn đặt và ưu tiên giữ chỗ trong các khung giờ nghỉ trưa.
        </p>
      </div>

      {/* 4 Rules Summary - Architectural Hairline Grid */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200/80 space-y-2.5 text-xs text-stone-600">
        <div className="flex items-center gap-1.5 font-bold text-stone-900">
          <AlertCircle className="w-4 h-4 text-stone-500" />
          <span>4 Quy tắc vận hành chống quá tải</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <strong className="text-stone-900 block font-semibold">Rule 1 · Sức chứa</strong>
            <span className="text-stone-500">24 đơn làm tươi/khung</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <strong className="text-stone-900 block font-semibold">Rule 2 · Loại món</strong>
            <span className="text-stone-500">Tối đa 4 loại tươi/đơn</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <strong className="text-stone-900 block font-semibold">Rule 3 · Số phần</strong>
            <span className="text-stone-500">Max 3 phần/món, 8/đơn</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <strong className="text-stone-900 block font-semibold">Rule 4 · Công bằng</strong>
            <span className="text-stone-500">1 đơn/người/khung giờ</span>
          </div>
        </div>
      </div>

      {/* App Store & Mobile App Banner */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-stone-900 text-stone-100 flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-stone-900 leading-tight">Cài đặt ứng dụng ISCanteen Go</h4>
            <p className="text-[10px] text-stone-500 mt-0.5">Dùng toàn màn hình, vé QR offline & xem trên App Store</p>
          </div>
        </div>
        <button
          onClick={() => {
            feedback.tap();
            openAppStoreModal();
          }}
          className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shrink-0 active:scale-95 transition-all"
        >
          Tải App
        </button>
      </div>

      {/* QR Modal */}
      <QRCodeModal
        order={selectedQRModalOrder}
        isOpen={!!selectedQRModalOrder}
        onClose={() => setSelectedQRModalOrder(null)}
      />
    </div>
  );
};
