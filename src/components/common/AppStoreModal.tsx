import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Smartphone,
  Download,
  Share,
  PlusSquare,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Star,
  Layers,
  ChevronRight,
  Info,
  QrCode,
  Flame,
  Clock,
  Compass,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const AppStoreModal: React.FC = () => {
  const { appStoreModalOpen, closeAppStoreModal, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'install' | 'appstore' | 'googleplay' | 'developer'>('install');
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSimulatingDownload, setIsSimulatingDownload] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  if (!appStoreModalOpen) return null;

  const handleNativeInstall = async () => {
    feedback.tap();
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        showToast('Đã bắt đầu cài đặt ứng dụng vào điện thoại!', 'success');
      }
    } else {
      showToast('Đang ở chế độ trình duyệt. Vui lòng làm theo hướng dẫn 2 bước!', 'info');
    }
  };

  const handleSimulateAppStoreGet = () => {
    feedback.tap();
    setIsSimulatingDownload(true);
    setSimulatedProgress(10);
    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulatingDownload(false);
          showToast('Đã tải gói ứng dụng ISCanteen Go! Chuyển sang hướng dẫn cài đặt màn hình chính.', 'success');
          setActiveTab('install');
          return 100;
        }
        return prev + 30;
      });
    }, 280);
  };

  const handleCopyCapacitorConfig = () => {
    feedback.tap();
    const config = JSON.stringify(
      {
        appId: 'vn.edu.canteen.iscanteengo',
        appName: 'ISCanteen Go',
        webDir: 'dist',
        bundledWebRuntime: false,
        server: {
          androidScheme: 'https',
          cleartext: true,
        },
        plugins: {
          SplashScreen: {
            launchShowDuration: 1500,
            backgroundColor: '#1c1917',
          },
        },
      },
      null,
      2
    );
    navigator.clipboard.writeText(config);
    setCopiedCode(true);
    showToast('Đã sao chép cấu hình capacitor.config.json!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Generate current app URL for the QR code
  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : 'https://canteen.edu.vn';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    currentAppUrl
  )}&bgcolor=faf9f6&color=1c1917&margin=0`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#faf9f6] text-stone-900 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-stone-200/80 overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:px-5 border-b border-stone-200/80 flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-stone-900 leading-tight">Trung Tâm Cài Đặt & App Store</h2>
              <p className="text-[11px] text-stone-500 font-medium">Tải ứng dụng cho iPhone, iPad & Android</p>
            </div>
          </div>
          <button
            onClick={closeAppStoreModal}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="px-4 pt-3 pb-1 border-b border-stone-200/60 bg-stone-100/60">
          <div className="grid grid-cols-4 gap-1 p-1 bg-stone-200/70 rounded-2xl text-[11px] font-semibold text-stone-600">
            <button
              onClick={() => {
                feedback.tap();
                setActiveTab('install');
              }}
              className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'install'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cài ngay</span>
            </button>
            <button
              onClick={() => {
                feedback.tap();
                setActiveTab('appstore');
              }}
              className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'appstore'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              <span>🍏 App Store</span>
            </button>
            <button
              onClick={() => {
                feedback.tap();
                setActiveTab('googleplay');
              }}
              className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'googleplay'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              <span>🤖 Google Play</span>
            </button>
            <button
              onClick={() => {
                feedback.tap();
                setActiveTab('developer');
              }}
              className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'developer'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              <span>🚀 Xuất bản</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: Cài đặt ngay (PWA Native) */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              {/* Highlight Status */}
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-stone-900 text-xs">PWA Sẵn Sàng Cài Đặt Không Cần Đợi Duyệt</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                    {isInstalled ? 'Đã cài đặt' : isIOS ? 'Thiết bị iOS' : 'Android / Desktop'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  Công nghệ <strong>Progressive Web App (PWA)</strong> cho phép bạn cài đặt ứng dụng trực tiếp lên màn hình chính điện thoại, mở toàn màn hình độc lập, hoạt động ngoại tuyến khi mất mạng và có icon như tải từ App Store.
                </p>
              </div>

              {/* iOS Safari Installation Steps */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🍏</span>
                  <h4 className="font-bold text-stone-900 text-xs">Hướng Dẫn Cài Đặt Trên iPhone & iPad (Safari)</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-stone-200/60 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div className="leading-snug">
                      <p className="font-semibold text-stone-900">Mở Safari & Nhấn nút Chia sẻ</p>
                      <p className="text-[11px] text-stone-500">
                        Bấm vào biểu tượng <Share className="w-3.5 h-3.5 inline text-blue-600 mx-0.5 -mt-0.5" /> (hình vuông có mũi tên trỏ lên) ở thanh dưới cùng Safari.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-stone-200/60 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div className="leading-snug">
                      <p className="font-semibold text-stone-900">Chọn "Thêm vào MH chính" (Add to Home Screen)</p>
                      <p className="text-[11px] text-stone-500">
                        Cuộn xuống danh sách hành động và chọn <PlusSquare className="w-3.5 h-3.5 inline text-stone-800 mx-0.5 -mt-0.5" /> <strong>Thêm vào MH chính</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-stone-200/60 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div className="leading-snug">
                      <p className="font-semibold text-stone-900">Nhấn "Thêm" (Add)</p>
                      <p className="text-[11px] text-stone-500">
                        Icon <strong>ISCanteen Go</strong> sẽ xuất hiện cạnh các app khác. Khởi chạy toàn màn hình không có thanh URL.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Android / Chrome One-Tap Install */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🤖</span>
                  <h4 className="font-bold text-stone-900 text-xs">Cài Đặt Trên Android & Trình Duyệt Chrome</h4>
                </div>
                {deferredPrompt ? (
                  <button
                    onClick={handleNativeInstall}
                    className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Cài Đặt Ngay Vào Điện Thoại (1 Chạm)
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Trên Android Chrome, bấm vào biểu tượng <strong>Menu 3 chấm (⋮)</strong> ở góc trên bên phải ➔ Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.
                    </p>
                    <button
                      onClick={handleNativeInstall}
                      className="w-full py-2.5 rounded-xl bg-stone-200 text-stone-800 font-semibold text-xs hover:bg-stone-300 transition-colors"
                    >
                      Kiểm tra khả năng cài đặt tự động
                    </button>
                  </div>
                )}
              </div>

              {/* QR Code to Open directly on Mobile Device */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 flex items-center gap-4">
                <div className="p-1.5 bg-white rounded-xl border border-stone-200 shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="Quét QR Cài App"
                    className="w-20 h-20 rounded-lg object-contain"
                    onError={(e) => {
                      // Fallback if image proxy is offline
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 hidden">
                    <QrCode className="w-8 h-8" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-xs text-stone-900">Mở nhanh trên điện thoại</h5>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Dùng Camera iPhone/Android quét mã QR này để mở ứng dụng ngay trên điện thoại và làm theo các bước cài đặt.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-stone-400 font-mono">
                    <Compass className="w-3 h-3" /> Safari hoặc Chrome
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Apple App Store Simulated Listing */}
          {activeTab === 'appstore' && (
            <div className="space-y-4">
              {/* App Store Card Header */}
              <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                <div className="flex items-start gap-3.5">
                  <img
                    src="/pwa-192x192.png"
                    alt="ISCanteen Go"
                    className="w-16 h-16 rounded-2xl shadow-md border border-stone-200/50 object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-stone-900 truncate">ISCanteen Go</h3>
                    <p className="text-[11px] text-stone-500 font-medium">Đặt Căn Tin & Khung Giờ</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Khoa Hệ thống Thông tin (VNU)</p>

                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        onClick={handleSimulateAppStoreGet}
                        disabled={isSimulatingDownload}
                        className="px-5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs transition-all disabled:opacity-70 active:scale-95"
                      >
                        {isSimulatingDownload ? `Đang tải ${simulatedProgress}%` : 'NHẬN'}
                      </button>
                      <span className="text-[10px] text-stone-400 font-medium">Giao dịch trong ứng dụng</span>
                    </div>
                  </div>
                </div>

                {/* Ratings & Metadata Bar (Apple style) */}
                <div className="grid grid-cols-4 divide-x divide-stone-200 text-center pt-3 border-t border-stone-100">
                  <div className="px-1">
                    <p className="text-[10px] text-stone-400 font-medium uppercase">1.2K Xếp Hạng</p>
                    <p className="font-bold text-stone-900 text-sm flex items-center justify-center gap-0.5 mt-0.5">
                      4.9 <Star className="w-3 h-3 fill-stone-900 text-stone-900" />
                    </p>
                  </div>
                  <div className="px-1">
                    <p className="text-[10px] text-stone-400 font-medium uppercase">Tuổi</p>
                    <p className="font-bold text-stone-900 text-sm mt-0.5">12+</p>
                  </div>
                  <div className="px-1">
                    <p className="text-[10px] text-stone-400 font-medium uppercase">Bảng Xếp Hạng</p>
                    <p className="font-bold text-stone-900 text-sm mt-0.5">#1</p>
                    <p className="text-[9px] text-stone-400">Tiện ích</p>
                  </div>
                  <div className="px-1">
                    <p className="text-[10px] text-stone-400 font-medium uppercase">Kích Thước</p>
                    <p className="font-bold text-stone-900 text-sm mt-0.5">12.4 MB</p>
                  </div>
                </div>
              </div>

              {/* What's New */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs">Có gì mới</span>
                  <span className="text-[10px] text-stone-400">Phiên bản 2.4.0</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  • Ra mắt thuật toán AI gợi ý món ăn dinh dưỡng & combo tiết kiệm sinh viên.<br />
                  • Cơ chế giữ chỗ tạm thời (Soft-lock 5 phút) chống trùng khung giờ cao điểm.<br />
                  • Mã vé QR Code ngoại tuyến nhận đồ ăn tức thì tại quầy.
                </p>
              </div>

              {/* App Screenshots Preview Carousel */}
              <div className="space-y-1.5">
                <span className="font-bold text-stone-900 text-xs">Bản xem trước tính năng</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 text-center space-y-1.5">
                    <div className="w-8 h-8 mx-auto rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className="font-bold text-[10px] text-stone-900">Đặt Khung Giờ</p>
                    <p className="text-[9px] text-stone-400">Tránh xếp hàng đông đúc 11:30</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 text-center space-y-1.5">
                    <div className="w-8 h-8 mx-auto rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="font-bold text-[10px] text-stone-900">Trợ Lý AI</p>
                    <p className="text-[9px] text-stone-400">Gợi ý món theo calo & ví tiền</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 text-center space-y-1.5">
                    <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <p className="font-bold text-[10px] text-stone-900">Vé QR Offline</p>
                    <p className="text-[9px] text-stone-400">Lấy cơm không cần có internet</p>
                  </div>
                </div>
              </div>

              {/* Information Table */}
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 space-y-2 text-[11px]">
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-400">Nhà phát triển</span>
                  <span className="font-medium text-stone-800">Căn tin Trường & Nhóm Đồ án VNU</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-400">Khả năng tương thích</span>
                  <span className="font-medium text-stone-800">iOS 15.0 trở lên</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Ngôn ngữ</span>
                  <span className="font-medium text-stone-800">Tiếng Việt, Tiếng Anh</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Google Play Store Simulated Listing */}
          {activeTab === 'googleplay' && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3.5">
                <div className="flex items-start gap-3.5">
                  <img
                    src="/pwa-192x192.png"
                    alt="ISCanteen Go"
                    className="w-16 h-16 rounded-2xl shadow-md border border-stone-200/50 object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-stone-900 truncate">ISCanteen Go - Căn Tin Số</h3>
                    <p className="text-[11px] text-emerald-700 font-semibold">VNU Smart University Solutions</p>
                    <p className="text-[10px] text-stone-400">Chứa quảng cáo · Mua hàng trong ứng dụng</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-stone-100 text-center">
                  <div className="flex-1">
                    <div className="font-bold text-stone-900 text-xs flex items-center justify-center gap-0.5">
                      4.9 <Star className="w-3 h-3 fill-stone-900 text-stone-900" />
                    </div>
                    <span className="text-[10px] text-stone-400">12 nghìn bài đánh giá</span>
                  </div>
                  <div className="h-6 w-px bg-stone-200"></div>
                  <div className="flex-1">
                    <div className="font-bold text-stone-900 text-xs">10 N+</div>
                    <span className="text-[10px] text-stone-400">Lượt tải xuống</span>
                  </div>
                  <div className="h-6 w-px bg-stone-200"></div>
                  <div className="flex-1">
                    <div className="font-bold text-stone-900 text-xs">Mọi lứa tuổi</div>
                    <span className="text-[10px] text-stone-400">Được xếp hạng 3+</span>
                  </div>
                </div>

                <button
                  onClick={handleSimulateAppStoreGet}
                  disabled={isSimulatingDownload}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Download className="w-4 h-4" />
                  {isSimulatingDownload ? `Đang cài đặt (${simulatedProgress}%)` : 'Cài đặt (Miễn phí)'}
                </button>
              </div>

              {/* Play Protect Badge */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="text-[11px] leading-snug">
                  <strong>Đã xác minh bởi Google Play Protect</strong>
                  <p className="text-emerald-700/80 text-[10px]">Ứng dụng an toàn và không chứa phần mềm độc hại.</p>
                </div>
              </div>

              {/* Student Reviews */}
              <div className="space-y-2">
                <span className="font-bold text-stone-900 text-xs">Đánh giá từ người dùng thực tế</span>
                <div className="p-3 rounded-xl bg-white border border-stone-200/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800 text-xs">Lê Hoàng Nam (SV K67)</span>
                    <span className="text-[10px] text-stone-400">Hôm qua</span>
                  </div>
                  <div className="flex text-amber-500">★★★★★</div>
                  <p className="text-[11px] text-stone-600">
                    "App siêu tiện, từ ngày đặt khung giờ 11:45 không bao giờ phải chen lấn xếp hàng 20 phút như trước nữa. Gợi ý combo cơm trưa cũng rất hợp túi tiền sinh viên."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Lộ trình Đưa Lên Store Thực Tế (Dành cho Đồ án & Triển khai) */}
          {activeTab === 'developer' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Tại sao hiện tại chưa tìm thấy trên App Store quốc tế?</span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Để một ứng dụng xuất hiện trên thanh tìm kiếm của <strong>Apple App Store</strong> và <strong>Google Play</strong>, Apple yêu cầu tài khoản nhà phát triển (<strong>$99/năm</strong>) và Google yêu cầu phí kích hoạt (<strong>$25</strong>), cùng thời gian duyệt mã nguồn 24–48h.
                </p>
              </div>

              {/* Method 1: PWABuilder (Easiest) */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-stone-900 text-white flex items-center justify-center text-[10px]">1</span>
                    Cách 1: PWABuilder (Chính thức từ Microsoft - 3 Phút)
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Khuyên dùng
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Ứng dụng ISCanteen Go đã được cấu hình chuẩn 100% PWA (Manifest, Service Worker, Icon 512x512 maskable, Apple Touch Icon).
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-600 pl-1">
                  <li>Truy cập website miễn phí: <strong className="text-stone-900">pwabuilder.com</strong></li>
                  <li>Dán đường dẫn URL của ứng dụng này vào ô kiểm tra.</li>
                  <li>Bấm <strong>"Package for Stores"</strong> ➔ Tải về file dự án Xcode cho iOS và Android Studio package sẵn sàng nộp lên Store.</li>
                </ol>
              </div>

              {/* Method 2: Capacitor Native Wrapper */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-stone-900 text-white flex items-center justify-center text-[10px]">2</span>
                    Cách 2: Đóng gói bằng Capacitor (Native App)
                  </h4>
                  <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                    Dự án chuyên nghiệp
                  </span>
                </div>
                <div className="bg-stone-900 text-stone-200 rounded-xl p-3 font-mono text-[10px] space-y-1 overflow-x-auto">
                  <p className="text-stone-400"># 1. Cài đặt Capacitor</p>
                  <p>npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android</p>
                  <p className="text-stone-400 mt-1"># 2. Khởi tạo dự án Native</p>
                  <p>npx cap init "ISCanteen Go" "vn.edu.canteen.app"</p>
                  <p className="text-stone-400 mt-1"># 3. Đồng bộ & Mở trong Xcode</p>
                  <p>npm run build && npx cap add ios && npx cap open ios</p>
                </div>
                <button
                  onClick={handleCopyCapacitorConfig}
                  className="w-full py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Đã sao chép cấu hình capacitor.config.json!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-stone-600" />
                      Sao chép file cấu hình capacitor.config.json mẫu
                    </>
                  )}
                </button>
              </div>

              {/* Submission Process Summary */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                <span className="font-bold text-stone-900 text-xs">Các bước nộp lên App Store Connect & Play Console</span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 bg-white rounded-xl border border-stone-200/70">
                    <strong className="block text-stone-900">1. Tạo App ID</strong>
                    <span className="text-stone-500">Trên developer.apple.com</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-stone-200/70">
                    <strong className="block text-stone-900">2. Đẩy TestFlight</strong>
                    <span className="text-stone-500">Cho sinh viên test nội bộ</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-stone-200/70">
                    <strong className="block text-stone-900">3. Duyệt & Lên Store</strong>
                    <span className="text-stone-500">Apple duyệt 24h - 48h</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-3 sm:px-5 border-t border-stone-200/80 bg-white/70 flex items-center justify-between">
          <div className="text-[11px] text-stone-500">
            {activeTab === 'install' && 'Khuyên dùng: Cài đặt ngay vào máy để dùng offline.'}
            {activeTab === 'appstore' && 'Trang mô phỏng giao diện Apple App Store.'}
            {activeTab === 'googleplay' && 'Trang mô phỏng giao diện Google Play Store.'}
            {activeTab === 'developer' && 'Hướng dẫn đóng gói cho đồ án & thực tế.'}
          </div>
          <button
            onClick={closeAppStoreModal}
            className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs active:scale-95 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
