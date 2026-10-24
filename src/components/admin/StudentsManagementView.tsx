import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, ShieldAlert, Lock, Unlock, RotateCcw, Crown } from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const StudentsManagementView: React.FC = () => {
  const { profile, toggleStudentLock, resetStudentStrikes } = useApp();

  // Synthetic list including current active student plus sample campus accounts
  const students = [
    profile,
    {
      studentId: '23070899',
      name: 'Trần Thị Mai',
      email: '23070899@vnu.edu.vn',
      phone: '0912345678',
      hasGoPass: false,
      penaltyStrikes: 1,
      isLocked: false,
    },
    {
      studentId: '23070112',
      name: 'Lê Hoàng Nam',
      email: '23070112@vnu.edu.vn',
      phone: '0933221144',
      hasGoPass: true,
      penaltyStrikes: 2,
      isLocked: false,
    },
    {
      studentId: '22070334',
      name: 'Phạm Quỳnh Anh',
      email: '22070334@vnu.edu.vn',
      phone: '0977665544',
      hasGoPass: false,
      penaltyStrikes: 3,
      isLocked: true,
    },
  ];

  return (
    <div className="p-3.5 space-y-4 pb-20 animate-in fade-in duration-200">
      <div>
        <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
          Quản lý tài khoản Sinh viên ({students.length})
        </h2>
        <p className="text-xs text-gray-500">Theo dõi số lần vi phạm không lấy món & gói Go Pass</p>
      </div>

      <div className="space-y-3">
        {students.map((st) => (
          <div
            key={st.studentId}
            className={`p-3.5 rounded-3xl bg-white border transition-all space-y-2 ${
              st.isLocked ? 'border-rose-300 bg-rose-50/20 shadow-xs' : 'border-gray-100 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-gray-900">{st.name}</span>
                  {st.hasGoPass && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-300 flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5 text-amber-600" /> Go Pass
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500 font-mono">
                  MSSV: {st.studentId} • {st.email}
                </span>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  st.isLocked
                    ? 'bg-rose-600 text-white'
                    : st.penaltyStrikes >= 2
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {st.isLocked ? 'Bị khóa' : `${st.penaltyStrikes}/3 Vi phạm`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
              <span className="text-[11px]">SĐT: {st.phone}</span>

              {/* Action buttons (functional for current active student) */}
              {st.studentId === profile.studentId ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      feedback.tap();
                      resetStudentStrikes(st.studentId);
                    }}
                    className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-[10px] font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset vi phạm
                  </button>

                  <button
                    onClick={() => {
                      feedback.tap();
                      toggleStudentLock(st.studentId);
                    }}
                    className={`px-2 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 ${
                      st.isLocked
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    }`}
                  >
                    {st.isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span>{st.isLocked ? 'Mở khóa' : 'Khóa'}</span>
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-gray-400 italic">Tài khoản sinh viên khác</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
