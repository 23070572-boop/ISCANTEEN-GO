import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Share2,
  Copy,
  CheckCircle2,
  QrCode,
  Users,
  Shield,
  Smartphone,
  ExternalLink,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const ShareModal: React.FC = () => {
  const { shareModalOpen, closeShareModal, showToast } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  if (!shareModalOpen) return null;

  // Official Shared App URL
  const sharedUrl =
    typeof window !== 'undefined' && window.location.origin.includes('run.app')
      ? window.location.origin
      : 'https://ais-pre-3odash3kvrj4oz5als7dok-707181000583.asia-northeast1.run.app';

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    sharedUrl
  )}&bgcolor=ffffff&color=1c1917&margin=0`;

  const handleCopyLink = () => {
    feedback.tap();
    navigator.clipboard.writeText(sharedUrl);
    setCopiedLink(true);
    showToast('Đã sao chép link chia sẻ! Hãy dán vào Zalo/Messenger.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWebShare = async () => {
    feedback.tap();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ISCanteen Go - Đặt Món Căn Tin Thông Minh',
          text: 'Truy cập ISCanteen Go để đặt món ăn, chọn khung giờ nhận chống ùn tắc và nhận gợi ý thực đơn từ AI:',
          url: sharedUrl,
        });
        showToast('Đã mở bảng chia sẻ thành công!', 'success');
      } catch (e) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyCredentials = (text: string, label: string) => {
    feedback.tap();
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    showToast(`Đã sao chép: ${label}`, 'success');
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#faf9f6] text-stone-900 rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl border border-stone-200/80 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:px-5 border-b border-stone-200/80 flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-stone-900 leading-tight">Gửi Link Cho Mọi Người Dùng Ngay</h2>
              <p className="text-[11px] text-stone-500 font-medium">Bất kỳ ai cũng có thể mở, đăng ký & đặt món</p>
            </div>
          </div>
          <button
            onClick={closeShareModal}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Main Link Box */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2.5">
            <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
              <span>Đường link dùng chung chính thức</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </label>

            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 font-mono text-[11px] break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{sharedUrl}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-300" />
                    <span>Sao chép Link</span>
                  </>
                )}
              </button>

              <button
                onClick={handleWebShare}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-200/80 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-stone-600" />
                <span>Gửi Zalo / Khác</span>
              </button>
            </div>
          </div>

          {/* QR Code Presentation */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 flex items-center gap-4">
            <div className="p-2 bg-white rounded-2xl border border-stone-200 shadow-2xs shrink-0">
              <img
                src={qrCodeUrl}
                alt="Mã QR chia sẻ ứng dụng"
                className="w-24 h-24 rounded-lg object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-stone-900">Quét mã bằng Camera</h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Chiếu lên màn hình hoặc đưa cho bạn bè / thầy cô quét bằng camera điện thoại để mở ngay mà không cần gõ link.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[10px] text-stone-600 font-medium">
                <Smartphone className="w-3.5 h-3.5 text-stone-500" />
                <span>Hỗ trợ cả iPhone, iPad và Android</span>
              </div>
            </div>
          </div>

          {/* Quick Pre-configured Test Accounts */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-600" />
                Tài khoản mẫu có sẵn (Test nhanh không cần đăng ký)
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Bạn có thể gửi kèm thông tin này để người nhận đăng nhập thử ngay:
            </p>

            <div className="space-y-1.5 text-[11px]">
              {/* Student Account */}
              <div
                onClick={() => handleCopyCredentials('23070572 / 123456', 'Sinh viên: 23070572')}
                className="p-2 rounded-xl bg-white border border-stone-200/70 flex items-center justify-between cursor-pointer hover:border-stone-400 transition-colors"
              >
                <div>
                  <span className="font-semibold text-stone-900">Sinh viên (Nguyễn Văn An):</span>
                  <p className="text-[10px] text-stone-500 font-mono">
                    MSSV: <strong className="text-stone-800">23070572</strong> · Mật khẩu:{' '}
                    <strong className="text-stone-800">123456</strong>
                  </p>
                </div>
                <span className="text-[10px] text-stone-400 font-medium">
                  {copiedAccount === 'Sinh viên: 23070572' ? 'Đã copy' : 'Copy'}
                </span>
              </div>

              {/* Admin Account */}
              <div
                onClick={() => handleCopyCredentials('admin@canteen.edu.vn / canteen2026', 'Admin: admin@canteen.edu.vn')}
                className="p-2 rounded-xl bg-white border border-stone-200/70 flex items-center justify-between cursor-pointer hover:border-stone-400 transition-colors"
              >
                <div>
                  <span className="font-semibold text-stone-900">Quản trị Căn tin (Admin):</span>
                  <p className="text-[10px] text-stone-500 font-mono">
                    Email: <strong className="text-stone-800">admin@canteen.edu.vn</strong> · Mật khẩu:{' '}
                    <strong className="text-stone-800">canteen2026</strong>
                  </p>
                </div>
                <span className="text-[10px] text-stone-400 font-medium">
                  {copiedAccount === 'Admin: admin@canteen.edu.vn' ? 'Đã copy' : 'Copy'}
                </span>
              </div>
            </div>
          </div>

          {/* Key Advantages for Everyone Opening Link */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 space-y-2">
            <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-700" />
              Người nhận link có thể làm những gì?
            </span>
            <ul className="space-y-1.5 text-[11px] text-stone-600 list-disc list-inside">
              <li>
                <strong className="text-stone-900">Tự do Đăng ký mới:</strong> Bấm nút "Đăng ký" ➔ Nhập MSSV, họ tên, mật khẩu là có tài khoản riêng ngay lập tức.
              </li>
              <li>
                <strong className="text-stone-900">Đồng bộ Thời gian thực:</strong> Khi bạn bè đặt món trên điện thoại, màn hình Căn tin (Admin) trên máy tính sẽ thấy đơn hàng xuất hiện trực tiếp.
              </li>
              <li>
                <strong className="text-stone-900">Cài đặt thành App:</strong> Chọn "Thêm vào MH chính" (Add to Home Screen) trên Safari hoặc Chrome để dùng toàn màn hình mà không cần App Store.
              </li>
              <li>
                <strong className="text-stone-900">Không cần cài đặt thêm gì:</strong> Chạy mượt mà trực tiếp trên mọi trình duyệt web di động và máy tính.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:px-5 border-t border-stone-200/80 bg-white/70 flex items-center justify-between">
          <p className="text-[11px] text-stone-500">Link có thể gửi cho nhiều người dùng cùng lúc.</p>
          <button
            onClick={closeShareModal}
            className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs active:scale-95 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
