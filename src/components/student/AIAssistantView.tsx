import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Clock,
  ArrowRight,
  Plus,
  ShoppingBag,
  Check,
  RefreshCw,
  Utensils,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { feedback } from '../../utils/feedback';
import { Product } from '../../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  recommendedProductIds?: number[];
  recommendedSlotId?: string;
  totalBudget?: number;
}

export const AIAssistantView: React.FC = () => {
  const {
    products,
    slots,
    selectedDate,
    getSlotUsage,
    findLeastLoadedSlot,
    selectSlot,
    addToCart,
    setStudentTab,
    rules,
    showToast,
  } = useApp();

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'Xin chào! Mình là Trợ lý AI Dinh dưỡng của ISCanteen Go 🤖✨\n\nBạn có thể nhờ mình gợi ý combo món ăn theo ngân sách, mục tiêu sức khỏe (no lâu, giảm cân, thanh mát), thực đơn học thi tỉnh táo, hoặc tìm khung giờ ít khách nhất hôm nay!',
      recommendedProductIds: [29, 1], // Combo Bánh mì + Nước & Kimbap
      totalBudget: 60000,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const quickPrompts = [
    { label: '🍱 Bữa trưa no lâu đủ chất', text: 'Gợi ý cho mình bữa trưa no lâu, đầy đủ đạm và tinh bột để học ca chiều' },
    { label: '⚡ Bữa sáng dưới 25k', text: 'Gợi ý bữa sáng nhanh gọn, tiết kiệm dưới 25k cho sinh viên' },
    { label: '🥗 Ăn kiêng Healthy', text: 'Mình đang ăn kiêng, gợi ý món nhẹ bụng, nhiều rau và ít dầu mỡ' },
    { label: '☕ Tỉnh táo ôn thi', text: 'Mình sắp thi ca chiều, cần món nhẹ và thức uống giúp tỉnh táo tập trung' },
    { label: '🕒 Khung giờ vắng nhất', text: 'Khung giờ nào hôm nay đang vắng khách nhất để mình xuống nhận món?' },
    { label: '🎯 Combo tiết kiệm', text: 'Có combo nào vừa ăn vừa uống giá sinh viên được tài trợ không?' },
  ];

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isThinking) return;

    feedback.tap();
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      // Call server Gemini API endpoint
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            type: p.type,
            categoryId: p.categoryId,
            isAvailable: p.isAvailable,
          })),
          slots: slots.map((s) => ({
            id: s.id,
            label: s.label,
            capacity: s.capacity,
          })),
          rules,
        }),
      });

      if (!response.ok) {
        throw new Error('API server error');
      }

      const data = await response.json();
      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Dưới đây là một số món gợi ý phù hợp dành cho bạn:',
        recommendedProductIds: data.recommendedProductIds || [],
        recommendedSlotId: data.recommendedSlotId,
        totalBudget: data.totalBudget,
      };

      setMessages((prev) => [...prev, aiReply]);
      feedback.tap();
    } catch (err) {
      // Intelligent local fallback if server connection fails
      const q = userText.toLowerCase();
      let replyText = 'Gợi ý món ăn ngon & giàu năng lượng cho bạn:';
      let recIds: number[] = [1, 15]; // Kimbap + Trà sữa
      let slotId = '09:45-10:00';
      let total = 55000;

      if (q.includes('khung') || q.includes('vắng') || q.includes('giờ')) {
        const least = findLeastLoadedSlot(selectedDate);
        if (least) {
          const usage = getSlotUsage(least.id, selectedDate);
          replyText = `Khung **${least.label}** hiện là khung thông thoáng nhất hôm nay với **${usage.count}/${usage.capacity} đơn** (${usage.capacity - usage.count} chỗ còn lại). Bạn nên đặt khung này để không phải chờ đợi!`;
          slotId = least.id;
          recIds = [];
        }
      } else if (q.includes('sáng') || q.includes('25k') || q.includes('rẻ')) {
        replyText = 'Bữa sáng nhanh & tiết kiệm cho sinh viên:\n• Bánh mì thịt giòn (20.000đ) hoặc Bánh mì ốp la (18.000đ) kết hợp Cà phê đen (20.000đ) giúp bạn tỉnh táo suốt buổi học!';
        recIds = [7, 17];
        total = 40000;
        slotId = '07:45-08:00';
      } else if (q.includes('healthy') || q.includes('rau') || q.includes('kiêng')) {
        replyText = 'Thực đơn Eat Clean thanh mát:\n• Salad tươi sốt mè (30.000đ) cung cấp chất xơ, đi kèm Nước cam tươi giàu vitamin C (25.000đ).';
        recIds = [27, 19];
        total = 55000;
        slotId = '11:45-12:00';
      } else if (q.includes('tỉnh táo') || q.includes('ôn thi') || q.includes('học')) {
        replyText = 'Combo nạp năng lượng & tỉnh táo ôn thi:\n• Bánh bao xá xíu trứng muối (25.000đ) nhẹ bụng nhưng đủ no, kèm Cappuccino thơm béo (25.000đ).';
        recIds = [4, 18];
        total = 50000;
        slotId = '13:45-14:00';
      } else if (q.includes('trưa') || q.includes('no')) {
        replyText = 'Bữa trưa no lâu đạm cao:\n• Mì xào bò đậm đà (40.000đ) ăn kèm Cơm cuộn rong biển (30.000đ) và Trà trái cây nhiệt đới mát lạnh (25.000đ).';
        recIds = [6, 22];
        total = 65000;
        slotId = '11:45-12:00';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          recommendedProductIds: recIds,
          recommendedSlotId: slotId,
          totalBudget: total,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAddAllToCart = (productIds: number[]) => {
    feedback.tap();
    let count = 0;
    productIds.forEach((id) => {
      const p = products.find((prod) => prod.id === id);
      if (p) {
        const res = addToCart(p, 1);
        if (res.success) count++;
      }
    });
    if (count > 0) {
      showToast(`Đã thêm ${count} món gợi ý vào giỏ hàng!`, 'success');
    }
  };

  const handleSelectSlotFromAI = (slotId: string) => {
    feedback.tap();
    const target = slots.find((s) => s.id === slotId);
    if (target) {
      const res = selectSlot(target);
      if (res.success) {
        setStudentTab('order');
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] pb-14 animate-in fade-in duration-200">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-stone-200/80 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
              <span>Trợ lý AI Căn tin</span>
              <span className="px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600 text-[9px] font-semibold">
                Gemini 3.8
              </span>
            </h2>
            <p className="text-[10px] text-stone-400">
              Gợi ý món ăn thông minh & tối ưu khung giờ nhận
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            feedback.tap();
            setMessages([
              {
                id: `init-${Date.now()}`,
                sender: 'ai',
                text: 'Trợ lý đã sẵn sàng! Bạn muốn ăn món gì hôm nay hoặc cần tìm khung giờ vắng nhất?',
              },
            ]);
          }}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title="Làm mới đoạn hội thoại"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => {
          const isAI = m.sender === 'ai';
          const recProducts = m.recommendedProductIds
            ? products.filter((p) => m.recommendedProductIds!.includes(p.id))
            : [];

          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-7 h-7 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4 text-stone-200" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2.5 ${
                  isAI
                    ? 'bg-white border border-stone-200/90 text-stone-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
                    : 'bg-stone-900 text-stone-100 font-medium'
                }`}
              >
                <div className="whitespace-pre-line text-stone-800 font-normal">{m.text}</div>

                {/* Recommended Dishes Card List */}
                {recProducts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-stone-500" />
                        <span>Món đề xuất ({recProducts.length} món)</span>
                      </span>
                      {m.totalBudget && (
                        <span className="text-[11px] font-mono font-bold text-stone-900">
                          ~{m.totalBudget.toLocaleString()}đ
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {recProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-2"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-lg shrink-0"
                            loading="lazy"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-xs text-stone-900 truncate">
                              {prod.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono font-bold text-[11px] text-stone-900">
                                {prod.price.toLocaleString()}đ
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-stone-200 text-stone-700">
                                {prod.type === 'prepared' ? 'Làm tươi' : 'Có sẵn'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              feedback.tap();
                              addToCart(prod, 1);
                              showToast(`Đã thêm ${prod.name} vào giỏ!`, 'success');
                            }}
                            className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center shrink-0 active:scale-90 transition-all"
                            title={`Thêm ${prod.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add all button */}
                    <button
                      onClick={() => handleAddAllToCart(m.recommendedProductIds!)}
                      className="w-full py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-stone-300" />
                      <span>Thêm cả {recProducts.length} món vào giỏ hàng</span>
                    </button>
                  </div>
                )}

                {/* Recommended Slot Action */}
                {m.recommendedSlotId && (
                  <div className="pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleSelectSlotFromAI(m.recommendedSlotId!)}
                      className="w-full py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Giữ chỗ ngay khung {m.recommendedSlotId} (5 phút)</span>
                      <ArrowRight className="w-3 h-3 text-amber-700" />
                    </button>
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="w-7 h-7 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-stone-700" />
                </div>
              )}
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-start gap-2.5 justify-start animate-in fade-in">
            <div className="w-7 h-7 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-amber-300 animate-spin" />
            </div>
            <div className="rounded-2xl p-3 bg-white border border-stone-200/90 text-xs text-stone-600 shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-400 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-stone-500 animate-pulse delay-100" />
              <span className="w-2 h-2 rounded-full bg-stone-600 animate-pulse delay-200" />
              <span className="text-stone-500 italic ml-1">AI đang phân tích thực đơn 30 món...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-3.5 py-2 bg-stone-100/70 border-t border-stone-200/80 flex gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            disabled={isThinking}
            onClick={() => handleSend(item.text)}
            className="px-3 py-1.5 rounded-xl bg-white border border-stone-200/90 text-stone-800 text-[11px] font-medium whitespace-nowrap hover:border-stone-400 active:scale-95 transition-all shadow-2xs disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-white border-t border-stone-200/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Hỏi AI: 'Ăn gì dưới 35k no lâu?', 'Món ít calo'..."
            value={input}
            disabled={isThinking}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-stone-400 focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-white active:scale-95 transition-all shadow-2xs"
            aria-label="Gửi câu hỏi"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
