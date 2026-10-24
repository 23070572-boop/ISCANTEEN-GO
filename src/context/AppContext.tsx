/**
 * ISCanteen Go - Central App Context & State Management
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Category,
  Product,
  TimeSlot,
  CartItem,
  Order,
  OrderStatus,
  PaymentMethod,
  StudentProfile,
  AppNotification,
  SlotHolding,
  AppRules,
  AuthUser,
  RegisteredStudentAccount,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SLOTS,
  INITIAL_ORDERS,
  INITIAL_STUDENT_PROFILE,
  INITIAL_NOTIFICATIONS,
  DEFAULT_RULES,
} from '../data/initialData';
import { feedback } from '../utils/feedback';

interface AppContextType {
  // Navigation & Role
  role: 'student' | 'admin';
  setRole: (role: 'student' | 'admin') => void;
  studentTab: 'home' | 'order' | 'my-orders' | 'ai' | 'profile';
  setStudentTab: (tab: 'home' | 'order' | 'my-orders' | 'ai' | 'profile') => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;

  // Authentication & Session
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  authModalOpen: boolean;
  authInitialTab: 'student' | 'admin';
  authInitialMode: 'login' | 'register';
  openAuthModal: (role?: 'student' | 'admin', mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  appStoreModalOpen: boolean;
  openAppStoreModal: () => void;
  closeAppStoreModal: () => void;
  shareModalOpen: boolean;
  openShareModal: () => void;
  closeShareModal: () => void;
  loginAsStudent: (identifier: string, passwordOrOtp: string, isOtp?: boolean) => { success: boolean; reason?: string };
  loginAsAdmin: (usernameOrEmail: string, password: string) => { success: boolean; reason?: string };
  registerStudent: (data: {
    name: string;
    studentId: string;
    email: string;
    phone: string;
    password: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  }) => { success: boolean; reason?: string };
  logout: () => void;

  // Data
  categories: Category[];
  products: Product[];
  slots: TimeSlot[];
  orders: Order[];
  rules: AppRules;
  profile: StudentProfile;
  notifications: AppNotification[];
  unreadNotificationCount: number;

  // Order Booking Flow
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedSlot: TimeSlot | null;
  slotHolding: SlotHolding | null;
  holdTimeRemaining: number; // seconds
  selectSlot: (slot: TimeSlot, date?: string) => { success: boolean; reason?: string };
  releaseSlotHolding: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantityDelta: number, note?: string) => { success: boolean; reason?: string };
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartPreparedCount: number;
  cartPreparedTypesCount: number;
  cartSubtotal: number;

  // Checkout & Order Actions
  createOrder: (paymentMethod: PaymentMethod, note?: string, discountCode?: string) => Promise<{ success: boolean; order?: Order; reason?: string }>;
  cancelOrder: (orderId: string, reason: string, refundBankInfo?: { bankName: string; accountNumber: string; accountHolder: string }) => void;
  reorder: (order: Order) => void;

  // Admin Actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  batchUpdateSlotOrders: (slotId: string, fromStatus: OrderStatus, toStatus: OrderStatus) => void;
  markAsRefunded: (orderId: string) => void;
  markNoShow: (orderId: string) => void;
  collectCounterPayment: (orderId: string) => void;
  toggleProductStatus: (productId: number, field: 'isAvailable' | 'isSponsored') => void;
  addNewProduct: (productData: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  toggleSlotActive: (slotId: string) => void;
  updateRules: (newRules: Partial<AppRules>) => void;
  toggleStudentLock: (studentId: string) => void;
  resetStudentStrikes: (studentId: string) => void;

  // Profile & Go Pass
  updateProfile: (updated: Partial<StudentProfile>) => void;
  subscribeGoPass: () => void;
  cancelGoPass: () => void;

  // Toast / System
  toast: { text: string; type: 'success' | 'warning' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  markNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  broadcastSystemNotification: (title: string, message: string) => void;

  // Helper Queries
  getSlotUsage: (slotId: string, date: string) => { count: number; capacity: number; percent: number; isFull: boolean; statusColor: string };
  studentHasOrderInSlot: (studentId: string, slotId: string, date: string) => boolean;
  findLeastLoadedSlot: (date: string) => TimeSlot | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'iscanteen_products_v1',
  ORDERS: 'iscanteen_orders_v1',
  PROFILE: 'iscanteen_profile_v1',
  RULES: 'iscanteen_rules_v1',
  SLOTS: 'iscanteen_slots_v1',
  NOTIFICATIONS: 'iscanteen_notifs_v1',
  AUTH_USER: 'iscanteen_auth_user_v1',
  REGISTERED_STUDENTS: 'iscanteen_registered_students_v1',
};

const DEFAULT_REGISTERED_STUDENTS: RegisteredStudentAccount[] = [
  {
    studentId: '23070572',
    name: 'Nguyễn Văn An',
    email: '23070572@vnu.edu.vn',
    phone: '0987654321',
    password: '123456',
    bankName: 'Vietcombank',
    accountNumber: '1023456789',
    accountHolder: 'NGUYEN VAN AN',
    hasGoPass: true,
  },
  {
    studentId: '23070899',
    name: 'Trần Thị Mai',
    email: '23070899@vnu.edu.vn',
    phone: '0912345678',
    password: '123456',
    bankName: 'MB Bank',
    accountNumber: '0912345678',
    accountHolder: 'TRAN THI MAI',
    hasGoPass: false,
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [studentTab, setStudentTab] = useState<'home' | 'order' | 'my-orders' | 'ai' | 'profile'>('home');
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (saved) return JSON.parse(saved);
      return {
        role: 'student',
        name: INITIAL_STUDENT_PROFILE.name,
        email: INITIAL_STUDENT_PROFILE.email,
        studentId: INITIAL_STUDENT_PROFILE.studentId,
        phone: INITIAL_STUDENT_PROFILE.phone,
      };
    } catch {
      return {
        role: 'student',
        name: INITIAL_STUDENT_PROFILE.name,
        email: INITIAL_STUDENT_PROFILE.email,
        studentId: INITIAL_STUDENT_PROFILE.studentId,
        phone: INITIAL_STUDENT_PROFILE.phone,
      };
    }
  });

  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudentAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_STUDENTS);
      return saved ? JSON.parse(saved) : DEFAULT_REGISTERED_STUDENTS;
    } catch {
      return DEFAULT_REGISTERED_STUDENTS;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'student' | 'admin'>('student');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (targetRole: 'student' | 'admin' = 'student', mode: 'login' | 'register' = 'login') => {
    feedback.tap();
    setAuthInitialTab(targetRole);
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const [appStoreModalOpen, setAppStoreModalOpen] = useState(false);
  const openAppStoreModal = () => {
    feedback.tap();
    setAppStoreModalOpen(true);
  };
  const closeAppStoreModal = () => {
    setAppStoreModalOpen(false);
  };

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const openShareModal = () => {
    feedback.tap();
    setShareModalOpen(true);
  };
  const closeShareModal = () => {
    setShareModalOpen(false);
  };

  // Categories & Products
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Slots & Rules
  const [slots, setSlots] = useState<TimeSlot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SLOTS);
      return saved ? JSON.parse(saved) : INITIAL_SLOTS;
    } catch {
      return INITIAL_SLOTS;
    }
  });

  const [rules, setRules] = useState<AppRules>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RULES);
      return saved ? JSON.parse(saved) : DEFAULT_RULES;
    } catch {
      return DEFAULT_RULES;
    }
  });

  // Profile
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_STUDENT_PROFILE;
    } catch {
      return INITIAL_STUDENT_PROFILE;
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Today Date in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotHolding, setSlotHolding] = useState<SlotHolding | null>(null);
  const [holdTimeRemaining, setHoldTimeRemaining] = useState<number>(0);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
    if (type === 'warning' || type === 'error') {
      feedback.warning();
    } else {
      feedback.tap();
    }
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Persist storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_STUDENTS, JSON.stringify(registeredStudents));
  }, [registeredStudents]);

  // Synchronize state with backend server (/api/shared/data) for live multi-user ordering
  useEffect(() => {
    let isMounted = true;

    const syncWithServer = async () => {
      try {
        const res = await fetch('/api/shared/data');
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        // Merge students from server
        if (Array.isArray(data.students) && data.students.length > 0) {
          setRegisteredStudents((prev) => {
            const map = new Map<string, RegisteredStudentAccount>();
            data.students.forEach((s: RegisteredStudentAccount) => map.set(s.studentId, s));
            prev.forEach((s) => {
              if (!map.has(s.studentId)) map.set(s.studentId, s);
            });
            return Array.from(map.values());
          });
        }

        // Merge orders from server
        if (Array.isArray(data.orders)) {
          setOrders((prev) => {
            const map = new Map<string, Order>();
            data.orders.forEach((o: Order) => map.set(o.id, o));
            prev.forEach((o) => {
              if (!map.has(o.id)) map.set(o.id, o);
            });
            return Array.from(map.values());
          });
        }
      } catch {
        // Fallback gracefully to offline local cache
      }
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Holding Countdown Timer
  useEffect(() => {
    if (!slotHolding) {
      setHoldTimeRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const remainingMs = slotHolding.expiresAt - Date.now();
      if (remainingMs <= 0) {
        clearInterval(interval);
        setSlotHolding(null);
        setSelectedSlot(null);
        setHoldTimeRemaining(0);
        showToast('Hết thời gian giữ chỗ tạm thời (5 phút). Khung giờ đã được mở lại!', 'warning');
      } else {
        setHoldTimeRemaining(Math.ceil(remainingMs / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [slotHolding]);

  // Unread notifications count
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Helper: check if student has active order in slot
  const studentHasOrderInSlot = (studentId: string, slotId: string, date: string): boolean => {
    return orders.some(
      (o) =>
        o.studentId === studentId &&
        o.slotId === slotId &&
        o.orderDate === date &&
        o.status !== 'cancelled' &&
        o.status !== 'refunded'
    );
  };

  // Helper: slot usage and capacity calculation
  // Rule: only orders with prepared items count towards slot capacity!
  const getSlotUsage = (slotId: string, date: string) => {
    const slotOrders = orders.filter(
      (o) =>
        o.slotId === slotId &&
        o.orderDate === date &&
        o.hasPreparedItems &&
        o.status !== 'cancelled' &&
        o.status !== 'refunded'
    );
    const count = slotOrders.length;
    const capacity = rules.slotCapacity || 24;
    const percent = Math.min(100, Math.round((count / capacity) * 100));
    const isFull = count >= capacity;

    let statusColor = 'green'; // vắng (< 50%)
    if (percent >= 100) {
      statusColor = 'gray'; // khóa / đầy
    } else if (percent >= 80) {
      statusColor = 'red'; // gần đầy (80% - 99%)
    } else if (percent >= 50) {
      statusColor = 'yellow'; // đông vừa (50% - 79%)
    }

    return { count, capacity, percent, isFull, statusColor };
  };

  // Helper: find least loaded active slot for AI suggestion
  const findLeastLoadedSlot = (date: string): TimeSlot | null => {
    const activeSlots = slots.filter((s) => s.isActive);
    if (!activeSlots.length) return null;

    let leastSlot: TimeSlot | null = null;
    let minCount = Infinity;

    for (const slot of activeSlots) {
      // ignore if student already has order
      if (studentHasOrderInSlot(profile.studentId, slot.id, date)) continue;
      const usage = getSlotUsage(slot.id, date);
      if (usage.count < minCount && !usage.isFull) {
        minCount = usage.count;
        leastSlot = slot;
      }
    }

    return leastSlot || activeSlots[0];
  };

  // Action: Select Slot with 5-minute hold
  const selectSlot = (slot: TimeSlot, date: string = selectedDate) => {
    if (profile.isLocked) {
      showToast('Tài khoản của bạn đang bị khóa do vi phạm không đến nhận món quá 3 lần!', 'error');
      return { success: false, reason: 'Tài khoản bị khóa' };
    }

    // Rule 4: 1 order/student/slot
    if (studentHasOrderInSlot(profile.studentId, slot.id, date)) {
      feedback.warning();
      showToast('Quy tắc 4: Bạn đã có đơn trong khung giờ này rồi!', 'warning');
      return { success: false, reason: 'Bạn đã có đơn trong khung giờ này' };
    }

    // Capacity check
    const usage = getSlotUsage(slot.id, date);
    if (usage.isFull) {
      feedback.warning();
      showToast(`Khung giờ ${slot.label} đã đầy công suất (${usage.capacity}/${usage.capacity} đơn)!`, 'error');
      return { success: false, reason: 'Khung giờ đã đầy' };
    }

    // Create 5-minute holding
    const holdExpires = Date.now() + (rules.holdDurationSeconds || 300) * 1000;
    setSelectedSlot(slot);
    setSelectedDate(date);
    setSlotHolding({
      slotId: slot.id,
      slotDate: date,
      studentId: profile.studentId,
      expiresAt: holdExpires,
    });
    setHoldTimeRemaining(rules.holdDurationSeconds || 300);

    feedback.tap();
    showToast(`Đã giữ chỗ khung ${slot.label} trong 5 phút. Vui lòng chọn món!`, 'success');
    return { success: true };
  };

  const releaseSlotHolding = () => {
    setSlotHolding(null);
    setSelectedSlot(null);
    setHoldTimeRemaining(0);
  };

  // Cart metrics
  const cartPreparedCount = useMemo(() => {
    return cart.reduce((total, item) => (item.product.type === 'prepared' ? total + item.quantity : total), 0);
  }, [cart]);

  const cartPreparedTypesCount = useMemo(() => {
    return cart.filter((item) => item.product.type === 'prepared').length;
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  // Action: Add / Update Cart with Rule 2, 3, 3b enforcement
  const addToCart = (product: Product, quantityDelta: number, note?: string) => {
    if (!product.isAvailable) {
      showToast(`Món "${product.name}" hiện đang tạm hết hàng!`, 'warning');
      return { success: false, reason: 'Món hết hàng' };
    }

    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const currentQty = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
    const targetQty = currentQty + quantityDelta;

    if (targetQty <= 0) {
      // Remove item
      removeFromCart(product.id);
      return { success: true };
    }

    // Check rules ONLY if product is 'prepared' (cần chuẩn bị)
    if (product.type === 'prepared') {
      // Rule 2: Max 4 prepared types per order
      if (existingIndex < 0 && cartPreparedTypesCount >= rules.maxPreparedItemTypesPerOrder) {
        feedback.warning();
        const msg = `Quy tắc 2: Mỗi đơn chỉ được chọn tối đa ${rules.maxPreparedItemTypesPerOrder} loại món cần chuẩn bị!`;
        showToast(msg, 'warning');
        return { success: false, reason: msg };
      }

      // Rule 3: Max 3 portions per prepared item
      if (targetQty > rules.maxQuantityPerPreparedItem) {
        feedback.warning();
        const msg = `Quy tắc 3: Tối đa ${rules.maxQuantityPerPreparedItem} phần cho mỗi loại món "${product.name}"!`;
        showToast(msg, 'warning');
        return { success: false, reason: msg };
      }

      // Rule 3b: Total prepared items <= 8
      const otherPreparedQty = cartPreparedCount - (existingIndex >= 0 ? currentQty : 0);
      if (otherPreparedQty + targetQty > rules.maxTotalPreparedItemsPerOrder) {
        feedback.warning();
        const msg = `Quy tắc 3: Tổng số phần món cần chuẩn bị không vượt quá ${rules.maxTotalPreparedItemsPerOrder} phần/đơn!`;
        showToast(msg, 'warning');
        return { success: false, reason: msg };
      }
    }

    feedback.tap();
    setCart((prev) => {
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: targetQty,
          note: note !== undefined ? note : copy[existingIndex].note,
        };
        return copy;
      } else {
        return [...prev, { product, quantity: targetQty, note }];
      }
    });

    return { success: true };
  };

  const removeFromCart = (productId: number) => {
    feedback.tap();
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Action: Create Order with complete 4-rule validation
  const createOrder = async (
    paymentMethod: PaymentMethod,
    note?: string,
    discountCode?: string
  ): Promise<{ success: boolean; order?: Order; reason?: string }> => {
    if (!selectedSlot) {
      showToast('Vui lòng chọn khung giờ nhận món trước!', 'warning');
      return { success: false, reason: 'Chưa chọn khung giờ' };
    }

    if (cart.length === 0) {
      showToast('Giỏ hàng đang trống!', 'warning');
      return { success: false, reason: 'Giỏ hàng trống' };
    }

    // Final checks
    // 1. Check account locked
    if (profile.isLocked) {
      showToast('Tài khoản bị khóa do vi phạm không đến nhận!', 'error');
      return { success: false, reason: 'Tài khoản bị khóa' };
    }

    // 2. Rule 4: Check if student already ordered in this slot
    if (studentHasOrderInSlot(profile.studentId, selectedSlot.id, selectedDate)) {
      showToast('Bạn đã có đơn trong khung giờ này rồi!', 'error');
      return { success: false, reason: 'Trùng khung giờ' };
    }

    const hasPreparedItems = cart.some((i) => i.product.type === 'prepared');

    // 3. Rule 1: Capacity check
    if (hasPreparedItems) {
      const usage = getSlotUsage(selectedSlot.id, selectedDate);
      if (usage.isFull) {
        showToast(`Khung giờ vừa đầy chỗ (${usage.capacity}/${usage.capacity}). Vui lòng chọn khung khác!`, 'error');
        return { success: false, reason: 'Khung giờ đầy' };
      }
    }

    // Calculate financials
    const subtotal = cartSubtotal;
    // Service fee: 2000 VND (waived if Go Pass)
    const serviceFee = profile.hasGoPass ? 0 : rules.serviceFeeAmount;

    let discount = 0;
    if (discountCode) {
      const codeUpper = discountCode.trim().toUpperCase();
      if (codeUpper === 'MCOMMERCE10') {
        discount = 10000;
      } else if (codeUpper === 'CANTEEN5') {
        discount = 5000;
      }
    }

    const total = Math.max(0, subtotal + serviceFee - discount);
    const nowIso = new Date().toISOString();
    const orderSeq = (orders.length + 1).toString().padStart(3, '0');
    const orderId = `IC-${selectedDate.replace(/-/g, '').slice(2)}-${orderSeq}`;

    const isPaidOnline = paymentMethod === 'online_vietqr' || paymentMethod === 'online_momo';

    const newOrder: Order = {
      id: orderId,
      studentId: profile.studentId,
      studentName: profile.name,
      studentEmail: profile.email,
      studentPhone: profile.phone,
      slotId: selectedSlot.id,
      slotLabel: selectedSlot.label,
      orderDate: selectedDate,
      items: [...cart],
      subtotal,
      serviceFee,
      discount,
      total,
      paymentMethod,
      isPaid: isPaidOnline,
      status: isPaidOnline ? 'paid' : 'placed',
      hasPreparedItems,
      note,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Save order
    setOrders((prev) => [newOrder, ...prev]);

    // Push to server for multi-user sync
    fetch('/api/shared/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(() => {});

    // Push notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: isPaidOnline ? 'Đặt đơn thành công!' : 'Đơn đặt thành công (Chờ thanh toán)',
      message: `Đơn ${orderId} nhận lúc ${selectedSlot.label}. ${
        isPaidOnline
          ? 'Hệ thống đã nhận thanh toán, bếp đang chuẩn bị.'
          : 'Vui lòng thanh toán tại quầy trước giờ nhận 15 phút.'
      }`,
      timestamp: nowIso,
      read: false,
      type: 'order',
      orderId: orderId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Clear cart and release slot hold
    clearCart();
    releaseSlotHolding();

    // Trigger celebration
    feedback.success();
    return { success: true, order: newOrder };
  };

  // Action: Cancel Order
  const cancelOrder = (
    orderId: string,
    reason: string,
    refundBankInfo?: { bankName: string; accountNumber: string; accountHolder: string }
  ) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    const nowIso = new Date().toISOString();

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;

        if (o.isPaid) {
          // Paid -> Refund requested
          return {
            ...o,
            status: 'refund_requested',
            cancellationReason: reason,
            refundInfo: refundBankInfo
              ? {
                  bankName: refundBankInfo.bankName,
                  accountNumber: refundBankInfo.accountNumber,
                  accountHolder: refundBankInfo.accountHolder,
                  requestedAt: nowIso,
                  refundNote: reason,
                }
              : o.refundInfo,
            updatedAt: nowIso,
          };
        } else {
          // Unpaid -> Cancel immediately
          return {
            ...o,
            status: 'cancelled',
            cancellationReason: reason,
            updatedAt: nowIso,
          };
        }
      })
    );

    const isPaid = target.isPaid;
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: isPaid ? 'Đã gửi yêu cầu hoàn tiền' : 'Hủy đơn thành công',
      message: isPaid
        ? `Đơn ${orderId} đang chờ Admin duyệt hoàn lại ${target.total.toLocaleString()}đ vào STK của bạn.`
        : `Đơn ${orderId} đã được hủy thành công. Chỗ đã được trả về cho căn tin.`,
      timestamp: nowIso,
      read: false,
      type: 'refund',
      orderId,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(isPaid ? 'Đã gửi yêu cầu hoàn tiền đến Admin Căn tin' : 'Đã hủy đơn hàng thành công', 'success');
  };

  // Action: Re-order previous order
  const reorder = (order: Order) => {
    clearCart();
    order.items.forEach((item) => {
      addToCart(item.product, item.quantity, item.note);
    });
    setStudentTab('order');
    showToast(`Đã thêm lại ${order.items.length} món vào giỏ! Hãy chọn khung giờ mới.`, 'info');
  };

  // Admin Actions
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const nowIso = new Date().toISOString();
    let orderStudentId = '';
    let orderSlotLabel = '';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          orderStudentId = o.studentId;
          orderSlotLabel = o.slotLabel;
          return {
            ...o,
            status,
            updatedAt: nowIso,
            pickedUpAt: status === 'completed' ? nowIso : o.pickedUpAt,
          };
        }
        return o;
      })
    );

    // Notify student if ready
    if (status === 'ready') {
      feedback.success();
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Món ăn đã sẵn sàng nhận!',
        message: `Đơn ${orderId} (${orderSlotLabel}) đã làm xong. Vui lòng đến Quầy lấy món nhé!`,
        timestamp: nowIso,
        read: false,
        type: 'order',
        orderId,
      };
      setNotifications((prev) => [notif, ...prev]);
    } else if (status === 'completed') {
      feedback.success();
    }
  };

  // Kitchen batch update
  const batchUpdateSlotOrders = (slotId: string, fromStatus: OrderStatus, toStatus: OrderStatus) => {
    const nowIso = new Date().toISOString();
    let updatedCount = 0;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.slotId === slotId && o.orderDate === selectedDate && o.status === fromStatus) {
          updatedCount++;
          return { ...o, status: toStatus, updatedAt: nowIso };
        }
        return o;
      })
    );

    showToast(`Đã chuyển trạng thái ${updatedCount} đơn hàng sang "${toStatus}"!`, 'success');
  };

  // Admin mark as refunded
  const markAsRefunded = (orderId: string) => {
    const nowIso = new Date().toISOString();
    let refundedTotal = 0;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          refundedTotal = o.total;
          return {
            ...o,
            status: 'refunded',
            updatedAt: nowIso,
            refundInfo: o.refundInfo
              ? {
                  ...o.refundInfo,
                  refundedAt: nowIso,
                  refundedBy: 'Admin Căn tin',
                }
              : undefined,
          };
        }
        return o;
      })
    );

    // Notify student
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Hoàn tiền thành công!',
      message: `Căn tin đã chuyển khoản hoàn lại ${refundedTotal.toLocaleString()}đ cho đơn ${orderId}. Vui lòng kiểm tra tài khoản ngân hàng.`,
      timestamp: nowIso,
      read: false,
      type: 'refund',
      orderId,
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Đã đánh dấu hoàn tiền thành công cho đơn ${orderId}!`, 'success');
  };

  // Admin mark no show (penalty strike)
  const markNoShow = (orderId: string) => {
    const nowIso = new Date().toISOString();
    let targetStudentId = '';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          targetStudentId = o.studentId;
          return { ...o, status: 'no_show', updatedAt: nowIso };
        }
        return o;
      })
    );

    // Increment penalty strike for student
    if (targetStudentId === profile.studentId) {
      setProfile((prev) => {
        const nextStrikes = prev.penaltyStrikes + 1;
        const isLocked = nextStrikes >= 3;
        return {
          ...prev,
          penaltyStrikes: nextStrikes,
          isLocked,
        };
      });

      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Cảnh báo vi phạm nhận món!',
        message: `Bạn đã không đến nhận đơn ${orderId}. Bạn đã tích lũy thêm 1 lần vi phạm (Tổng: ${
          profile.penaltyStrikes + 1
        }/3). Quá 3 lần sẽ bị khóa đặt món!`,
        timestamp: nowIso,
        read: false,
        type: 'system',
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    showToast(`Đã ghi nhận "Không đến lấy" cho đơn ${orderId}`, 'warning');
  };

  // Quầy giao món: thu tiền đơn tại quầy
  const collectCounterPayment = (orderId: string) => {
    const nowIso = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            isPaid: true,
            status: o.status === 'placed' ? 'preparing' : o.status,
            updatedAt: nowIso,
          };
        }
        return o;
      })
    );
    showToast(`Đã thu tiền thành công cho đơn ${orderId}!`, 'success');
  };

  // Menu management
  const toggleProductStatus = (productId: number, field: 'isAvailable' | 'isSponsored') => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, [field]: !p[field] };
        }
        return p;
      })
    );
  };

  const addNewProduct = (productData: Omit<Product, 'id'>) => {
    const nextId = Math.max(...products.map((p) => p.id), 0) + 1;
    const newProduct: Product = { ...productData, id: nextId };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Đã thêm món mới: ${productData.name}`, 'success');
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Đã cập nhật thông tin món "${updated.name}"`, 'success');
  };

  // Slot toggle
  const toggleSlotActive = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          return { ...s, isActive: !s.isActive };
        }
        return s;
      })
    );
  };

  // Rules update
  const updateRules = (newRules: Partial<AppRules>) => {
    setRules((prev) => {
      const updated = { ...prev, ...newRules };
      // Also update slot capacities if changed
      if (newRules.slotCapacity && newRules.slotCapacity !== prev.slotCapacity) {
        setSlots((sPrev) => sPrev.map((s) => ({ ...s, capacity: newRules.slotCapacity! })));
      }
      return updated;
    });
    showToast('Đã lưu cài đặt quy tắc & công suất thành công!', 'success');
  };

  // Student lock/unlock
  const toggleStudentLock = (studentId: string) => {
    if (studentId === profile.studentId) {
      setProfile((prev) => ({ ...prev, isLocked: !prev.isLocked }));
      showToast(`Đã ${profile.isLocked ? 'mở khóa' : 'khóa'} tài khoản sinh viên`, 'info');
    }
  };

  const resetStudentStrikes = (studentId: string) => {
    if (studentId === profile.studentId) {
      setProfile((prev) => ({ ...prev, penaltyStrikes: 0, isLocked: false }));
      showToast('Đã xóa vi phạm cho sinh viên!', 'success');
    }
  };

  // Profile actions
  const updateProfile = (updated: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    showToast('Đã cập nhật thông tin cá nhân!', 'success');
  };

  const subscribeGoPass = () => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    setProfile((prev) => ({
      ...prev,
      hasGoPass: true,
      goPassExpiry: expiry.toISOString().split('T')[0],
    }));

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Đăng ký Go Pass thành công!',
      message: 'Bạn đã đăng ký gói Go Pass 19.000đ/tháng. Miễn 100% phí dịch vụ 2.000đ cho mọi đơn!',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'promo',
    };
    setNotifications((prev) => [notif, ...prev]);
    feedback.success();
    showToast('Kích hoạt gói Go Pass thành công!', 'success');
  };

  const cancelGoPass = () => {
    setProfile((prev) => ({
      ...prev,
      hasGoPass: false,
      goPassExpiry: undefined,
    }));
    showToast('Đã hủy gia hạn gói Go Pass', 'info');
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const broadcastSystemNotification = (title: string, message: string) => {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'system',
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast('Đã phát thông báo toàn hệ thống!', 'success');
  };

  // Auth methods
  const loginAsStudent = (identifier: string, passwordOrOtp: string, isOtp = false): { success: boolean; reason?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = passwordOrOtp.trim();

    if (!cleanId) {
      showToast('Vui lòng nhập Email trường hoặc Mã sinh viên!', 'warning');
      return { success: false, reason: 'Chưa nhập thông tin' };
    }

    const student = registeredStudents.find(
      (s) => s.email.toLowerCase() === cleanId || s.studentId.toLowerCase() === cleanId
    );

    if (!student) {
      showToast('Không tìm thấy tài khoản sinh viên này. Hãy bấm "Đăng ký"!', 'error');
      return { success: false, reason: 'Tài khoản không tồn tại' };
    }

    if (!isOtp) {
      if (student.password && student.password !== cleanPass && cleanPass !== '123456') {
        showToast('Mật khẩu không chính xác! (Mặc định tài khoản mẫu: 123456)', 'error');
        return { success: false, reason: 'Sai mật khẩu' };
      }
    }

    const authUser: AuthUser = {
      role: 'student',
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      phone: student.phone,
    };
    setCurrentUser(authUser);
    setRole('student');

    setProfile((prev) => ({
      ...prev,
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      bankName: student.bankName || prev.bankName,
      accountNumber: student.accountNumber || prev.accountNumber,
      accountHolder: student.accountHolder || prev.accountHolder,
      hasGoPass: student.hasGoPass ?? prev.hasGoPass,
    }));

    setAuthModalOpen(false);
    feedback.success();
    showToast(`Đăng nhập thành công! Xin chào ${student.name}`, 'success');
    return { success: true };
  };

  const loginAsAdmin = (usernameOrEmail: string, pass: string): { success: boolean; reason?: string } => {
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const cleanPass = pass.trim();

    const isValidUser =
      cleanUser === 'admin@canteen.edu.vn' ||
      cleanUser === 'admin' ||
      cleanUser === 'canteen' ||
      cleanUser === 'bep';
    const isValidPass = cleanPass === 'canteen2026' || cleanPass === 'admin123' || cleanPass === '123456';

    if (!isValidUser || !isValidPass) {
      showToast('Thông tin đăng nhập Admin không đúng! (Gợi ý: admin@canteen.edu.vn / canteen2026)', 'error');
      return { success: false, reason: 'Sai thông tin Admin' };
    }

    const authUser: AuthUser = {
      role: 'admin',
      name: 'Ban Quản trị Căn tin VNU',
      email: 'admin@canteen.edu.vn',
    };
    setCurrentUser(authUser);
    setRole('admin');
    setAuthModalOpen(false);
    feedback.success();
    showToast('Đăng nhập Quản trị viên Căn tin thành công!', 'success');
    return { success: true };
  };

  const registerStudent = (data: {
    name: string;
    studentId: string;
    email: string;
    phone: string;
    password: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  }): { success: boolean; reason?: string } => {
    const cleanId = data.studentId.trim();
    const cleanEmail = data.email.trim().toLowerCase();

    if (registeredStudents.some((s) => s.studentId === cleanId || s.email.toLowerCase() === cleanEmail)) {
      showToast('Mã số sinh viên hoặc Email này đã tồn tại trong hệ thống!', 'warning');
      return { success: false, reason: 'Tài khoản đã tồn tại' };
    }

    const newStudent: RegisteredStudentAccount = {
      studentId: cleanId,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      password: data.password.trim(),
      bankName: data.bankName?.trim() || 'Vietcombank',
      accountNumber: data.accountNumber?.trim() || '',
      accountHolder: data.accountHolder?.trim().toUpperCase() || data.name.trim().toUpperCase(),
      hasGoPass: false,
    };

    setRegisteredStudents((prev) => [newStudent, ...prev]);

    const authUser: AuthUser = {
      role: 'student',
      name: newStudent.name,
      email: newStudent.email,
      studentId: newStudent.studentId,
      phone: newStudent.phone,
    };
    setCurrentUser(authUser);
    setRole('student');

    setProfile({
      studentId: newStudent.studentId,
      name: newStudent.name,
      email: newStudent.email,
      phone: newStudent.phone,
      bankName: newStudent.bankName,
      accountNumber: newStudent.accountNumber,
      accountHolder: newStudent.accountHolder,
      hasGoPass: false,
      penaltyStrikes: 0,
      isLocked: false,
    });

    setAuthModalOpen(false);
    feedback.success();
    showToast(`Đăng ký thành công! Chào mừng bạn ${newStudent.name} đến với ISCanteen Go`, 'success');
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    feedback.tap();
    showToast('Đã đăng xuất tài khoản', 'info');
  };

  const isAuthenticated = currentUser !== null;

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        studentTab,
        setStudentTab,
        adminTab,
        setAdminTab,
        currentUser,
        isAuthenticated,
        authModalOpen,
        authInitialTab,
        authInitialMode,
        openAuthModal,
        closeAuthModal,
        appStoreModalOpen,
        openAppStoreModal,
        closeAppStoreModal,
        shareModalOpen,
        openShareModal,
        closeShareModal,
        loginAsStudent,
        loginAsAdmin,
        registerStudent,
        logout,
        categories,
        products,
        slots,
        orders,
        rules,
        profile,
        notifications,
        unreadNotificationCount,
        selectedDate,
        setSelectedDate,
        selectedSlot,
        slotHolding,
        holdTimeRemaining,
        selectSlot,
        releaseSlotHolding,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartPreparedCount,
        cartPreparedTypesCount,
        cartSubtotal,
        createOrder,
        cancelOrder,
        reorder,
        updateOrderStatus,
        batchUpdateSlotOrders,
        markAsRefunded,
        markNoShow,
        collectCounterPayment,
        toggleProductStatus,
        addNewProduct,
        updateProduct,
        toggleSlotActive,
        updateRules,
        toggleStudentLock,
        resetStudentStrikes,
        updateProfile,
        subscribeGoPass,
        cancelGoPass,
        toast,
        showToast,
        markNotificationsAsRead,
        clearAllNotifications,
        broadcastSystemNotification,
        getSlotUsage,
        studentHasOrderInSlot,
        findLeastLoadedSlot,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
