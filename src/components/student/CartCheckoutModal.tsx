import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Order } from '../../types';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Clock,
  Crown,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  CreditCard,
  Banknote,
  Ticket,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';
import confetti from 'canvas-confetti';

interface CartCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CartCheckoutModal: React.FC<CartCheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cart,
    addToCart,
    removeFromCart,
    cartSubtotal,
    selectedSlot,
    selectedDate,
    profile,
    rules,
    createOrder,
    cartPreparedCount,
    cartPreparedTypesCount,
    isAuthenticated,
    openAuthModal,
    showToast,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online_vietqr');
  const [kitchenNote, setKitchenNote] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [agreePolicy, setAgreePolicy] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRTransferView, setShowQRTransferView] = useState(false);

  if (!isOpen) return null;

  const serviceFee = profile.hasGoPass ? 0 : rules.serviceFeeAmount;
  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const grandTotal = Math.max(0, cartSubtotal + serviceFee - discountAmount);

  const handleApplyVoucher = () => {
    feedback.tap();
    const code = voucherCode.trim().toUpperCase();
    if (code === 'MCOMMERCE10') {
      setAppliedVoucher({ code: 'MCOMMERCE10', discount: 10000 });
    } else if (code === 'CANTEEN5') {
      setAppliedVoucher({ code: 'CANTEEN5', discount: 5000 });
    } else {
      alert('Mã không hợp lệ. Bạn có thể thử mã: MCOMMERCE10 hoặc CANTEEN5');
    }
  };

  const handleConfirmOrder = async () => {
    if (!isAuthenticated) {
      feedback.warning();
      showToast('Vui lòng đăng nhập tài khoản sinh viên trước khi đặt đơn!', 'warning');
      openAuthModal('student', 'login');
      return;
    }

    if (!agreePolicy) {
      feedback.warning();
      alert('Vui lòng đồng ý với chính sách nhận món của Căn tin.');
      return;
    }

    if ((paymentMethod === 'online_vietqr' || paymentMethod === 'online_momo') && !showQRTransferView) {
      setShowQRTransferView(true);
      return;
    }

    setIsSubmitting(true);
    feedback.tap();

    try {
      const res = await createOrder(paymentMethod, kitchenNote, appliedVoucher?.code);
      if (res.success && res.order) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
        onClose();
        onOrderSuccess(res.order);
      } else {
        alert(res.reason || 'Không thể tạo đơn hàng.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#faf9f6] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200/80 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="font-bold text-sm text-stone-900">
              {showQRTransferView ? 'Thanh toán trực tuyến' : 'Chi tiết đơn hàng'}
            </h3>
            <p className="text-[11px] text-stone-500 font-mono mt-0.5">
              Khung hẹn: {selectedSlot?.label} · {selectedDate}
            </p>
          </div>
          <button
            onClick={() => {
              if (showQRTransferView) {
                setShowQRTransferView(false);
              } else {
                onClose();
              }
            }}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {showQRTransferView ? (
            /* SIMULATED PAYMENT VIEW */
            <div className="space-y-4 text-center py-2 animate-in fade-in duration-200">
              <div className="p-4 rounded-3xl bg-white border border-stone-200 inline-block mx-auto shadow-xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIETQR|ISCanteen|${grandTotal}|${profile.studentId}&margin=6`}
                  alt="VietQR Payment"
                  className="w-44 h-44 mx-auto rounded-xl"
                />
                <p className="mt-2 text-xs font-mono font-bold text-stone-900">
                  Vietcombank: 1023456789
                </p>
                <p className="text-[11px] text-stone-500">
                  CAN TIN TRUONG DAI HOC
                </p>
              </div>

              <div>
                <span className="text-[11px] text-stone-500 block">Số tiền thanh toán:</span>
                <span className="text-2xl font-bold text-stone-950 font-mono tracking-tight">
                  {grandTotal.toLocaleString()} VND
                </span>
                <p className="text-[11px] text-stone-500 mt-1">
                  Nội dung: <strong className="font-mono text-stone-800">ISC {profile.studentId}</strong>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200/80 text-xs text-stone-600 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-700 shrink-0" />
                <span>Mô phỏng thanh toán nhanh cho môn Mobile Commerce</span>
              </div>
            </div>
          ) : (
            /* SUMMARY VIEW */
            <>
              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                  <span>Món đã chọn ({cart.length})</span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Làm tươi: {cartPreparedTypesCount}/4 loại · {cartPreparedCount}/8 phần
                  </span>
                </div>

                <div className="divide-y divide-stone-100 bg-white rounded-2xl p-2.5 border border-stone-200/70 max-h-48 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product.id} className="py-2 flex items-center justify-between gap-2.5">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-stone-500 font-mono">
                          {item.product.price.toLocaleString()}đ × {item.quantity} ={' '}
                          <span className="font-bold text-stone-900">
                            {(item.product.price * item.quantity).toLocaleString()}đ
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200 shrink-0">
                        <button
                          onClick={() => addToCart(item.product, -1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-stone-600 hover:bg-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center font-bold text-xs font-mono text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item.product, 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-stone-900 hover:bg-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Ghi chú cho bếp (tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ít đá, không cay..."
                  value={kitchenNote}
                  onChange={(e) => setKitchenNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-stone-400"
                />
              </div>

              {/* Voucher */}
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Mã giảm giá:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="MCOMMERCE10 hoặc CANTEEN5"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-stone-400 uppercase font-mono"
                    />
                  </div>
                  <button
                    onClick={handleApplyVoucher}
                    className="px-3.5 py-1.5 bg-stone-900 text-stone-100 rounded-xl text-xs font-medium hover:bg-stone-800"
                  >
                    Áp dụng
                  </button>
                </div>
                {appliedVoucher && (
                  <p className="text-[10px] text-stone-600 font-medium mt-1">
                    ✓ Đã áp dụng mã {appliedVoucher.code} (-{appliedVoucher.discount.toLocaleString()}đ)
                  </p>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-700 block">
                  Phương thức thanh toán:
                </label>

                <div className="space-y-1.5">
                  <label
                    onClick={() => {
                      feedback.tap();
                      setPaymentMethod('online_vietqr');
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'online_vietqr'
                        ? 'border-stone-900 bg-white ring-1 ring-stone-900 shadow-2xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-4 h-4 text-stone-700" />
                      <div>
                        <p className="text-xs font-semibold text-stone-900">VietQR / Chuyển khoản ngân hàng</p>
                        <p className="text-[10px] text-stone-500">Mã QR tự động, bếp nấu trước</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'online_vietqr'}
                      onChange={() => setPaymentMethod('online_vietqr')}
                      className="text-stone-900"
                    />
                  </label>

                  <label
                    onClick={() => {
                      feedback.tap();
                      setPaymentMethod('online_momo');
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'online_momo'
                        ? 'border-stone-900 bg-white ring-1 ring-stone-900 shadow-2xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-stone-700" />
                      <div>
                        <p className="text-xs font-semibold text-stone-900">Ví MoMo / VNPay</p>
                        <p className="text-[10px] text-stone-500">Thanh toán ví điện tử</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'online_momo'}
                      onChange={() => setPaymentMethod('online_momo')}
                      className="text-stone-900"
                    />
                  </label>

                  <label
                    onClick={() => {
                      feedback.tap();
                      setPaymentMethod('pay_at_counter');
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'pay_at_counter'
                        ? 'border-stone-900 bg-white ring-1 ring-stone-900 shadow-2xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote className="w-4 h-4 text-stone-700" />
                      <div>
                        <p className="text-xs font-semibold text-stone-900">Trả tại quầy (Pay at counter)</p>
                        <p className="text-[10px] text-stone-500">Thanh toán trước giờ hẹn 15 phút</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'pay_at_counter'}
                      onChange={() => setPaymentMethod('pay_at_counter')}
                      className="text-stone-900"
                    />
                  </label>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Tiền món:</span>
                  <span className="font-mono text-stone-900">{cartSubtotal.toLocaleString()}đ</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Phí dịch vụ:</span>
                  <span className="font-mono">
                    {profile.hasGoPass ? (
                      <span className="text-stone-500 font-medium">Miễn phí (Go Pass)</span>
                    ) : (
                      '2.000đ'
                    )}
                  </span>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-stone-700">
                    <span>Giảm giá ({appliedVoucher.code}):</span>
                    <span className="font-mono">-{appliedVoucher.discount.toLocaleString()}đ</span>
                  </div>
                )}

                <div className="pt-2 border-t border-stone-100 flex justify-between font-bold text-sm text-stone-950">
                  <span>Tổng cộng:</span>
                  <span className="font-mono text-base">{grandTotal.toLocaleString()} VND</span>
                </div>
              </div>

              {/* Policy Checkbox */}
              <label className="flex items-start gap-2 text-[11px] text-stone-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePolicy}
                  onChange={(e) => setAgreePolicy(e.target.checked)}
                  className="mt-0.5 rounded text-stone-900"
                />
                <span>
                  Tôi xác nhận đến nhận món đúng khung {selectedSlot?.label} và tuân thủ chính sách hủy/giữ món của Căn tin.
                </span>
              </label>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/80 bg-white shrink-0">
          <button
            disabled={isSubmitting}
            onClick={handleConfirmOrder}
            className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
          >
            {isSubmitting ? (
              <span>Đang xử lý đơn...</span>
            ) : showQRTransferView ? (
              <span>Tôi đã hoàn tất chuyển khoản</span>
            ) : (
              <>
                <span>
                  {paymentMethod === 'pay_at_counter' ? 'Xác nhận đặt đơn' : 'Tiếp tục thanh toán'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
