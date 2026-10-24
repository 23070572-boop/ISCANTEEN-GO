import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Shield,
  KeyRound,
  Mail,
  Smartphone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Send,
  Lock,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authInitialTab,
    authInitialMode,
    closeAuthModal,
    loginAsStudent,
    loginAsAdmin,
    registerStudent,
    showToast,
  } = useApp();

  const [activeRole, setActiveRole] = useState<'student' | 'admin'>('student');
  const [studentMode, setStudentMode] = useState<'login' | 'register'>('login');
  const [studentAuthMethod, setStudentAuthMethod] = useState<'password' | 'otp'>('password');

  // Student Login fields
  const [studentIdentifier, setStudentIdentifier] = useState('23070572@vnu.edu.vn');
  const [studentPassword, setStudentPassword] = useState('123456');
  const [studentOtp, setStudentOtp] = useState('');
  const [simulatedOtpSent, setSimulatedOtpSent] = useState<string | null>(null);

  // Student Register fields
  const [regName, setRegName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regBankName, setRegBankName] = useState('Vietcombank');
  const [regAccountNumber, setRegAccountNumber] = useState('');

  // Admin fields
  const [adminUsername, setAdminUsername] = useState('admin@canteen.edu.vn');
  const [adminPassword, setAdminPassword] = useState('canteen2026');

  // UI state
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authModalOpen) {
      setActiveRole(authInitialTab);
      setStudentMode(authInitialMode);
      setSimulatedOtpSent(null);
    }
  }, [authModalOpen, authInitialTab, authInitialMode]);

  if (!authModalOpen) return null;

  // 1-Click Fast Fill for Demo
  const handleFillStudentDemo = () => {
    feedback.tap();
    setStudentIdentifier('23070572@vnu.edu.vn');
    setStudentPassword('123456');
    setStudentAuthMethod('password');
    showToast('Đã điền sẵn tài khoản SV mẫu: 23070572@vnu.edu.vn', 'info');
  };

  const handleFillAdminDemo = () => {
    feedback.tap();
    setAdminUsername('admin@canteen.edu.vn');
    setAdminPassword('canteen2026');
    showToast('Đã điền sẵn tài khoản Admin: admin@canteen.edu.vn', 'info');
  };

  // Student Login Submit
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentAuthMethod === 'otp') {
      if (!simulatedOtpSent) {
        showToast('Vui lòng bấm "Gửi mã OTP" trước!', 'warning');
        return;
      }
      if (studentOtp.trim() !== simulatedOtpSent) {
        showToast(`Mã OTP không đúng! Mã vừa gửi là: ${simulatedOtpSent}`, 'error');
        return;
      }
      loginAsStudent(studentIdentifier, studentOtp, true);
    } else {
      loginAsStudent(studentIdentifier, studentPassword, false);
    }
  };

  // Student Send OTP simulation
  const handleSendOtp = () => {
    if (!studentIdentifier.trim()) {
      showToast('Vui lòng nhập Email trường hoặc Mã sinh viên!', 'warning');
      return;
    }
    feedback.tap();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtpSent(generatedOtp);
    showToast(`Mã OTP gửi đến ${studentIdentifier}: ${generatedOtp}`, 'success');
  };

  // Student Register Submit
  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regStudentId.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 'warning');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    if (regPassword.length < 6) {
      showToast('Mật khẩu cần tối thiểu 6 ký tự!', 'warning');
      return;
    }

    feedback.tap();
    registerStudent({
      name: regName,
      studentId: regStudentId,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      bankName: regBankName,
      accountNumber: regAccountNumber,
      accountHolder: regName.toUpperCase(),
    });
  };

  // Admin Login Submit
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    feedback.tap();
    loginAsAdmin(adminUsername, adminPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#faf9f6] rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-white border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center">
              {activeRole === 'student' ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 tracking-tight">
                {activeRole === 'student' ? 'Tài khoản Sinh viên' : 'Quản trị Căn tin (Admin)'}
              </h2>
              <p className="text-[10px] text-stone-500">
                {activeRole === 'student' ? 'Đặt món & giữ chỗ khung giờ' : 'Bếp nấu, quầy nhận & báo cáo'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              feedback.tap();
              closeAuthModal();
            }}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Switcher Pill */}
        <div className="p-3 bg-stone-100/60 border-b border-stone-200/60">
          <div className="grid grid-cols-2 p-1 bg-stone-200/70 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                feedback.tap();
                setActiveRole('student');
              }}
              className={`py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeRole === 'student'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Sinh viên</span>
            </button>

            <button
              type="button"
              onClick={() => {
                feedback.tap();
                setActiveRole('admin');
              }}
              className={`py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeRole === 'admin'
                  ? 'bg-stone-900 text-stone-100 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Căn tin (Admin)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* ==================== STUDENT TAB ==================== */}
          {activeRole === 'student' && (
            <div className="space-y-4">
              {/* Student Mode Switcher: Đăng nhập vs Đăng ký */}
              <div className="flex items-center justify-center border-b border-stone-200 pb-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    feedback.tap();
                    setStudentMode('login');
                  }}
                  className={`text-xs font-bold pb-1 transition-all border-b-2 ${
                    studentMode === 'login'
                      ? 'text-stone-900 border-stone-900'
                      : 'text-stone-400 border-transparent hover:text-stone-600'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    feedback.tap();
                    setStudentMode('register');
                  }}
                  className={`text-xs font-bold pb-1 transition-all border-b-2 ${
                    studentMode === 'register'
                      ? 'text-stone-900 border-stone-900'
                      : 'text-stone-400 border-transparent hover:text-stone-600'
                  }`}
                >
                  Đăng ký tài khoản mới
                </button>
              </div>

              {/* STUDENT LOGIN FORM */}
              {studentMode === 'login' && (
                <form onSubmit={handleStudentLogin} className="space-y-3.5 animate-in fade-in duration-150">
                  {/* Demo Credentials Helper Box */}
                  <div className="p-3 rounded-2xl bg-stone-100/80 border border-stone-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        <span>Tài khoản SV mẫu (chấm đồ án):</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleFillStudentDemo}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
                      >
                        Điền nhanh
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-600 font-mono">
                      Email / MSSV: <strong>23070572@vnu.edu.vn</strong> (hoặc <strong>23070572</strong>)
                    </p>
                    <p className="text-[11px] text-stone-600 font-mono">
                      Mật khẩu: <strong>123456</strong>
                    </p>
                  </div>

                  {/* Auth method segmented: Mật khẩu vs OTP */}
                  <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl text-[11px]">
                    <button
                      type="button"
                      onClick={() => setStudentAuthMethod('password')}
                      className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                        studentAuthMethod === 'password'
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      Dùng Mật khẩu
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentAuthMethod('otp')}
                      className={`flex-1 py-1 rounded-lg font-medium transition-all ${
                        studentAuthMethod === 'otp'
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      Mã OTP qua Email
                    </button>
                  </div>

                  {/* Identifier */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Email trường hoặc Mã sinh viên:
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={studentIdentifier}
                        onChange={(e) => setStudentIdentifier(e.target.value)}
                        placeholder="23070572@vnu.edu.vn hoặc 23070572"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Password or OTP */}
                  {studentAuthMethod === 'password' ? (
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                        Mật khẩu:
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          placeholder="Mật khẩu (mặc định: 123456)"
                          className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-stone-700">
                          Mã xác thực OTP (6 chữ số):
                        </label>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-[10px] text-stone-800 font-bold hover:underline flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Gửi mã OTP
                        </button>
                      </div>

                      {simulatedOtpSent && (
                        <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                          <span>Mã OTP vừa gửi: <strong className="font-mono text-xs">{simulatedOtpSent}</strong></span>
                          <button
                            type="button"
                            onClick={() => setStudentOtp(simulatedOtpSent)}
                            className="text-[10px] underline text-amber-800 font-bold"
                          >
                            Tự điền
                          </button>
                        </div>
                      )}

                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={studentOtp}
                        onChange={(e) => setStudentOtp(e.target.value)}
                        placeholder="Nhập 6 số OTP..."
                        className="w-full px-3 py-2 text-center text-sm font-mono tracking-widest rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.99] transition-all"
                  >
                    <span>Đăng nhập ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Explicit CTA: Muốn đăng ký thì click gì */}
                  <div className="pt-2 border-t border-stone-200/70 text-center">
                    <p className="text-xs text-stone-500 mb-1.5">Chưa có tài khoản sinh viên?</p>
                    <button
                      type="button"
                      onClick={() => {
                        feedback.tap();
                        setStudentMode('register');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold border border-stone-300/80 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>👉 Bấm vào đây để Đăng ký mới</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STUDENT REGISTER FORM */}
              {studentMode === 'register' && (
                <form onSubmit={handleStudentRegister} className="space-y-3 animate-in fade-in duration-150">
                  <div className="p-2.5 rounded-xl bg-stone-100/70 border border-stone-200 text-[11px] text-stone-600 leading-relaxed">
                    Đăng ký tài khoản để đặt món trước theo khung giờ và tích hợp nhận hoàn tiền tự động khi cần hủy đơn.
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-0.5">
                      Họ và tên sinh viên *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Lê Thị Mai"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-0.5">
                        Mã sinh viên (MSSV) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="23070999"
                        value={regStudentId}
                        onChange={(e) => setRegStudentId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-0.5">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0912345678"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-0.5">
                      Email trường đại học *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="23070999@vnu.edu.vn"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-0.5">
                        Mật khẩu tạo mới *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Tối thiểu 6 ký tự"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-0.5">
                        Nhập lại mật khẩu *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Nhập lại mật khẩu"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                    </div>
                  </div>

                  {/* Optional Refund Bank info */}
                  <div className="pt-2 border-t border-stone-100 space-y-1.5">
                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                      Tài khoản nhận tiền hoàn (Không bắt buộc)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Ngân hàng (Vietcombank, MB...)"
                        value={regBankName}
                        onChange={(e) => setRegBankName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                      <input
                        type="text"
                        placeholder="Số tài khoản ngân hàng"
                        value={regAccountNumber}
                        onChange={(e) => setRegAccountNumber(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Register Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.99] transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hoàn tất Đăng ký & Đăng nhập</span>
                  </button>

                  <div className="text-center pt-1">
                    <p className="text-xs text-stone-500">
                      Đã có tài khoản?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          feedback.tap();
                          setStudentMode('login');
                        }}
                        className="font-bold text-stone-900 underline hover:text-stone-700"
                      >
                        Bấm vào đây để Đăng nhập
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ==================== ADMIN TAB ==================== */}
          {activeRole === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in duration-150">
              {/* Demo Credentials Helper Box */}
              <div className="p-3.5 rounded-2xl bg-stone-100/80 border border-stone-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-stone-700" />
                    <span>Thông tin đăng nhập Admin:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleFillAdminDemo}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
                  >
                    Điền nhanh 1-Click
                  </button>
                </div>
                <div className="space-y-0.5 text-[11px] text-stone-700 font-mono">
                  <p>
                    Tài khoản: <strong>admin@canteen.edu.vn</strong> (hoặc <strong>admin</strong>)
                  </p>
                  <p>
                    Mật khẩu: <strong>canteen2026</strong> (hoặc <strong>admin123</strong>)
                  </p>
                </div>
                <p className="text-[10px] text-stone-500 pt-1 border-t border-stone-200/60">
                  Quyền hạn: Điều phối Bếp nấu (KDS), Quầy giao món quét QR, Cấu hình 10 khung giờ và Báo cáo doanh thu M3.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Email hoặc Tên đăng nhập Admin:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin@canteen.edu.vn"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Mật khẩu Admin:
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="canteen2026"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Admin Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.99] transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-stone-300" />
                <span>Đăng nhập Quản trị viên Căn tin</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
