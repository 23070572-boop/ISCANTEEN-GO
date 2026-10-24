import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calculator,
  TrendingUp,
  Percent,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const RevenueSimulatorView: React.FC = () => {
  const { rules } = useApp();

  // Baseline capacity: toggleable between 24 (default as user instructed) and 16 (old M3 draft)
  const [capacityPerSlot, setCapacityPerSlot] = useState<number>(rules.slotCapacity || 24);
  const [utilizationPercent, setUtilizationPercent] = useState<number>(80); // 50%, 80%, 100%
  const [averageOrderValue, setAverageOrderValue] = useState<number>(45000); // 45.000 VND
  const [workingDays, setWorkingDays] = useState<number>(22); // 22 working days / month
  const [goPassSubscribers, setGoPassSubscribers] = useState<number>(150); // subscribers
  const [sponsoredAdsMonthly, setSponsoredAdsMonthly] = useState<number>(2000000); // 2 triệu / tháng

  // Computations
  const slotsPerDay = 10;
  const maxCapacityPerDay = slotsPerDay * capacityPerSlot; // 240 (at 24) or 160 (at 16)
  const actualOrdersPerDay = Math.round(maxCapacityPerDay * (utilizationPercent / 100));
  const monthlyOrders = actualOrdersPerDay * workingDays;

  // Financials
  const monthlyGMV = monthlyOrders * averageOrderValue; // Tổng giá trị đơn hàng
  const commissionRevenue = Math.round(monthlyGMV * 0.07); // 7% hoa hồng

  // Service fee: 2.000đ/order (estimate 80% non-pass, 20% pass)
  const convenienceFeeRevenue = Math.round(monthlyOrders * 0.8 * 2000);

  // Go pass
  const goPassRevenue = goPassSubscribers * 19000;

  // Total Platform Revenue
  const totalPlatformRevenue =
    commissionRevenue + convenienceFeeRevenue + goPassRevenue + sponsoredAdsMonthly;

  const handlePresetUtilization = (pct: number) => {
    feedback.tap();
    setUtilizationPercent(pct);
  };

  return (
    <div className="p-3.5 space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
              Mô phỏng Doanh thu M-Commerce (M3)
            </h2>
            <p className="text-xs text-gray-500">
              Công cụ tự động tính toán số liệu thuyết trình cho giảng viên
            </p>
          </div>
        </div>
      </div>

      {/* Baseline Capacity Selector: 24 vs 16 */}
      <div className="bg-white rounded-3xl p-3.5 border border-gray-100 shadow-sm space-y-2">
        <label className="text-[11px] font-bold text-gray-700 block">
          Chọn cấu hình sức chứa mỗi khung giờ:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              feedback.tap();
              setCapacityPerSlot(24);
            }}
            className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all ${
              capacityPerSlot === 24
                ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-400'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            <span className="block font-black text-sm">24 đơn / khung</span>
            <span className="text-[10px] text-orange-700 font-medium">Khuyên dùng (240 đơn/ngày)</span>
          </button>

          <button
            onClick={() => {
              feedback.tap();
              setCapacityPerSlot(16);
            }}
            className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all ${
              capacityPerSlot === 16
                ? 'border-purple-500 bg-purple-50 text-purple-950 ring-2 ring-purple-400'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            <span className="block font-black text-sm">16 đơn / khung</span>
            <span className="text-[10px] text-purple-700 font-medium">Bản thảo M3 cũ (160 đơn/ngày)</span>
          </button>
        </div>

        {capacityPerSlot === 24 ? (
          <p className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
            ✓ <strong>Cấu hình 24 đơn/khung:</strong> Ở mức 80% công suất sẽ đạt <strong>4.224 đơn/tháng</strong> (192 đơn/ngày × 22 ngày). Doanh thu hoa hồng & phí đạt ~21,75 triệu/tháng.
          </p>
        ) : (
          <p className="text-[10px] text-purple-700 bg-purple-50 p-2 rounded-xl border border-purple-200">
            ℹ️ <strong>Cấu hình 16 đơn/khung (M3 cũ):</strong> Ở mức 80% công suất sẽ đạt đúng <strong>2.816 đơn/tháng</strong> (128 đơn/ngày × 22 ngày) và <strong>14.502.400đ/tháng</strong> từ hoa hồng + phí tiện ích.
          </p>
        )}
      </div>

      {/* Presets and Sliders */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-4">
        {/* Preset Utilization */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-gray-800">Mức sử dụng công suất:</span>
            <span className="font-mono font-black text-orange-600 text-sm">
              {utilizationPercent}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            {[50, 80, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePresetUtilization(pct)}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                  utilizationPercent === pct
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pct}% công suất
              </button>
            ))}
          </div>

          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={utilizationPercent}
            onChange={(e) => setUtilizationPercent(Number(e.target.value))}
            className="w-full accent-orange-600 cursor-pointer"
          />
        </div>

        {/* Average Order Value (AOV) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-gray-800">Giá trị đơn trung bình (AOV):</span>
            <span className="font-mono font-black text-emerald-600 text-sm">
              {averageOrderValue.toLocaleString()}đ / đơn
            </span>
          </div>
          <input
            type="range"
            min="25000"
            max="70000"
            step="2000"
            value={averageOrderValue}
            onChange={(e) => setAverageOrderValue(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>25.000đ (Bữa sáng)</span>
            <span>45.000đ (Bữa trưa + Nước)</span>
            <span>70.000đ (Combo)</span>
          </div>
        </div>

        {/* Go Pass Subscribers Slider */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-gray-800">Số sinh viên mua Go Pass (19k/tháng):</span>
            <span className="font-mono font-black text-amber-600 text-sm">
              {goPassSubscribers} thành viên
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={goPassSubscribers}
            onChange={(e) => setGoPassSubscribers(Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Simulated Results Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700">
          <span className="text-[10px] uppercase font-black tracking-widest text-orange-400">
            Kết quả tính toán hàng tháng ({workingDays} ngày)
          </span>
          <span className="font-mono text-xs text-slate-300 font-bold">
            {capacityPerSlot} đơn/khung @ {utilizationPercent}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 py-1">
          <div>
            <span className="text-[11px] text-slate-400 block">Số đơn / ngày:</span>
            <span className="text-xl font-black text-white font-mono">
              {actualOrdersPerDay} đơn
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Tổng đơn / tháng:</span>
            <span className="text-xl font-black text-amber-400 font-mono">
              {monthlyOrders.toLocaleString()} đơn
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700">
          <span className="text-[11px] text-slate-400 block">
            Tổng doanh thu nền tảng (4 nguồn thu):
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {totalPlatformRevenue.toLocaleString()} VND / tháng
          </span>
        </div>
      </div>

      {/* Detailed Breakdown for the Report */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2 text-xs">
        <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider mb-2">
          Bảng phân rã chi tiết để đưa vào bài thuyết trình:
        </h4>

        <div className="flex justify-between py-1 border-b border-gray-100">
          <span className="text-gray-600">Tổng giá trị giao dịch (GMV):</span>
          <span className="font-mono font-bold text-gray-900">{monthlyGMV.toLocaleString()}đ</span>
        </div>

        <div className="flex justify-between py-1 border-b border-gray-100">
          <span className="text-gray-600">1. Hoa hồng Căn tin (7% × GMV):</span>
          <span className="font-mono font-bold text-orange-600">
            {commissionRevenue.toLocaleString()}đ
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-gray-100">
          <span className="text-gray-600">2. Phí tiện ích (2.000đ × 80% đơn):</span>
          <span className="font-mono font-bold text-blue-600">
            {convenienceFeeRevenue.toLocaleString()}đ
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-gray-100">
          <span className="text-gray-600">3. Gói thành viên Go Pass (19.000đ × {goPassSubscribers}):</span>
          <span className="font-mono font-bold text-amber-600">
            {goPassRevenue.toLocaleString()}đ
          </span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-gray-600">4. Doanh thu Quảng cáo & Tài trợ cố định:</span>
          <span className="font-mono font-bold text-purple-600">
            {sponsoredAdsMonthly.toLocaleString()}đ
          </span>
        </div>
      </div>
    </div>
  );
};
