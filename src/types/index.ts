/**
 * ISCanteen Go - Types Definitions
 * Mobile Commerce Canteen Management System
 */

export interface Category {
  id: number;
  name: string;
  description: string;
  icon?: string;
}

export type ProductType = 'prepared' | 'ready'; // 'prepared' = Cần chuẩn bị, 'ready' = Có sẵn

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  price: number;
  image: string;
  type: ProductType;
  description?: string;
  isAvailable: boolean;
  isSponsored?: boolean;
  sponsorName?: string;
  tags?: string[];
}

export interface TimeSlot {
  id: string; // e.g. '07:45-08:00'
  label: string; // '07:45 - 08:00'
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  capacity: number; // default 24
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
}

export type OrderStatus =
  | 'placed' // Đã đặt
  | 'paid' // Đã thanh toán
  | 'preparing' // Đang chuẩn bị (Bếp đang làm)
  | 'ready' // Sẵn sàng nhận (Đã xong, chờ đến lấy)
  | 'completed' // Đã nhận món thành công
  | 'cancelled' // Đã hủy
  | 'refund_requested' // Yêu cầu hoàn tiền (Đã thanh toán trước đó)
  | 'refunded' // Đã hoàn tiền thành công
  | 'no_show'; // Không đến lấy quá giờ

export type PaymentMethod = 'online_vietqr' | 'online_momo' | 'pay_at_counter';

export interface RefundInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  requestedAt: string;
  refundedAt?: string;
  refundedBy?: string;
  refundNote?: string;
}

export interface Order {
  id: string; // e.g. 'IC-241024-001'
  studentId: string; // Mã SV, e.g. '23070572'
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  slotId: string; // '07:45-08:00'
  slotLabel: string;
  orderDate: string; // YYYY-MM-DD
  items: CartItem[];
  subtotal: number;
  serviceFee: number; // 2,000 VND (0 if Go Pass)
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  status: OrderStatus;
  hasPreparedItems: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
  refundInfo?: RefundInfo;
  cancellationReason?: string;
  pickedUpAt?: string;
}

export interface StudentProfile {
  studentId: string;
  name: string;
  email: string;
  phone: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  hasGoPass: boolean;
  goPassExpiry?: string;
  penaltyStrikes: number; // vi phạm không đến lấy
  isLocked: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'order' | 'refund' | 'system' | 'reminder' | 'promo';
  orderId?: string;
}

export interface SlotHolding {
  slotId: string;
  slotDate: string;
  studentId: string;
  expiresAt: number; // timestamp ms
}

export interface AppRules {
  slotCapacity: number; // default 24
  maxPreparedItemTypesPerOrder: number; // Rule 2: max 4 types
  maxQuantityPerPreparedItem: number; // Rule 3: max 3 portions per item
  maxTotalPreparedItemsPerOrder: number; // Rule 3b: max 8 portions total
  maxOrdersPerStudentPerSlot: number; // Rule 4: 1 order per student per slot
  serviceFeeAmount: number; // 2000 VND
  goPassMonthlyPrice: number; // 19000 VND
  cancellationCutoffMinutes: number; // 30 minutes before slot
  counterPaymentCutoffMinutes: number; // 15 minutes before slot
  holdDurationSeconds: number; // 300 seconds (5 mins)
}

export interface AuthUser {
  role: 'student' | 'admin';
  name: string;
  email: string;
  studentId?: string;
  phone?: string;
}

export interface RegisteredStudentAccount {
  studentId: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  hasGoPass?: boolean;
}
