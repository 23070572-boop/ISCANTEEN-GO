import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, Download, PieChart, TrendingUp, Sparkles, Crown } from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const RevenueReportsView: React.FC = () => {
  const { orders, profile } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | 'month'>('today');

  // Completed or non-cancelled orders
  const validOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded');
  const totalGMV = validOrders.reduce((sum, o) => sum + o.subtotal, 0);

  // 1. Commission 7%
  const commissionRevenue = Math.round(totalGMV * 0.07);

  // 2. Convenience Service fee 2.000đ
  const convenienceFeeRevenue = validOrders.filter((o) => o.serviceFee > 0).length * 2000;

  // 3. Go Pass Memberships 19.000đ (sample 42 members active)
  const activeMembersCount = profile.hasGoPass ? 42 : 41;
  const goPassRevenue = activeMembersCount * 19000;

  // 4. Advertising Sponsorship fixed 2.000.000đ/month
  const adsRevenue = 2000000;

  // Total Platform Revenue
  const totalPlatformRevenue =
    commissionRevenue + convenienceFeeRevenue + (dateFilter === 'month' ? goPassRevenue + adsRevenue : Math.round(goPassRevenue / 30 + adsRevenue / 30));

  const handleExportCSV = () => {
    feedback.success();
    const rows = [
      ['Nguon thu', 'Cong thuc / Mo ta', 'Doanh thu (VND)'],
      ['Hoa hong can tin (7%)', `7% x ${totalGMV.toLocaleString()}d`, commissionRevenue],
      ['Phi tien ich dich vu (2.000d/don)', `${validOrders.length} don hang`, convenienceFeeRevenue],
      ['Goi hoi vien Go Pass (19.000d/thang)', `${activeMembersCount} hoi vien`, goPassRevenue],
      ['Quang cao & Tai tro', 'Banner & Mon tai tro (Coca-Cola, Oishi)', adsRevenue],
      ['Tong doanh thu nen tang', 'Tong hop 4 nguon thu M2', totalPlatformRevenue],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_cao_nguon_thu_ISCanteenGo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3.5 space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
            Báo cáo 4 Nguồn thu Nền tảng (M2)
          </h2>
          <p className="text-xs text-gray-500">Mô hình kinh doanh Thương mại Di động</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Xuất CSV
        </button>
      </div>

      {/* Filter range */}
      <div className="flex p-1 bg-stone-200/60 rounded-2xl">
        <button
          onClick={() => setDateFilter('today')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            dateFilter === 'today' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
          }`}
        >
          Hôm nay (Dữ liệu thực tế)
        </button>
        <button
          onClick={() => setDateFilter('month')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            dateFilter === 'month' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
          }`}
        >
          Ước tính cả tháng (Chu kỳ 30 ngày)
        </button>
      </div>

      {/* Hero Revenue Card */}
      <div className="p-5 rounded-3xl bg-stone-900 text-stone-100 shadow-xl border border-stone-800 space-y-1">
        <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
          Tổng doanh thu nền tảng ISCanteen Go
        </span>
        <p className="text-2xl font-bold font-mono tracking-tight text-white">
          {totalPlatformRevenue.toLocaleString()} VND
        </p>
        <p className="text-xs text-stone-400 mt-1">
          Tổng giá trị đơn hàng thực tế (GMV): <strong className="text-stone-200 font-mono">{totalGMV.toLocaleString()}đ</strong>
        </p>
      </div>

      {/* 4 Streams Breakdown Table / Cards */}
      <div className="space-y-2.5">
        <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
          Chi tiết phân bổ 4 nguồn thu
        </h3>

        {/* Stream 1: Hoa hồng 7% */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs">
              7%
            </div>
            <div>
              <h4 className="font-semibold text-xs text-stone-900">1. Hoa hồng Căn tin (7%)</h4>
              <p className="text-[10px] text-stone-500">
                Chiết khấu 7% trên tổng giá trị món ăn chế biến
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-stone-900">
            {commissionRevenue.toLocaleString()}đ
          </span>
        </div>

        {/* Stream 2: Phí dịch vụ 2.000đ/đơn */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs">
              2k
            </div>
            <div>
              <h4 className="font-semibold text-xs text-stone-900">2. Phí tiện ích dịch vụ</h4>
              <p className="text-[10px] text-stone-500">
                2.000đ/đơn (miễn phí đối với hội viên Go Pass)
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-stone-900">
            {convenienceFeeRevenue.toLocaleString()}đ
          </span>
        </div>

        {/* Stream 3: Gói thành viên Go Pass */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              <Crown className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-stone-900">3. Gói thành viên Go Pass</h4>
              <p className="text-[10px] text-stone-500">
                19.000đ/tháng × {activeMembersCount} sinh viên đăng ký
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-stone-900">
            {dateFilter === 'month'
              ? `${goPassRevenue.toLocaleString()}đ`
              : `${Math.round(goPassRevenue / 30).toLocaleString()}đ/ngày`}
          </span>
        </div>

        {/* Stream 4: Quảng cáo tài trợ */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-4 h-4 text-stone-600" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-stone-900">4. Doanh thu Quảng cáo (Ad)</h4>
              <p className="text-[10px] text-stone-500">
                Hợp đồng tài trợ đối tác (Coca-Cola, Oishi, Combo)
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-stone-900">
            {dateFilter === 'month'
              ? `${adsRevenue.toLocaleString()}đ`
              : `${Math.round(adsRevenue / 30).toLocaleString()}đ/ngày`}
          </span>
        </div>
      </div>
    </div>
  );
};
