import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Persistent Shared Store for Multi-User Live Demo
const STORE_PATH = path.resolve(__dirname, 'server_store.json');

const DEFAULT_REGISTERED_STUDENTS = [
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

let storeData: { students: any[]; orders: any[] } = {
  students: DEFAULT_REGISTERED_STUDENTS,
  orders: [],
};

try {
  if (fs.existsSync(STORE_PATH)) {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.students) && parsed.students.length > 0) {
      storeData.students = parsed.students;
    }
    if (Array.isArray(parsed.orders)) {
      storeData.orders = parsed.orders;
    }
  }
} catch (e) {
  console.warn('Failed to load server_store.json, using defaults', e);
}

function saveStore() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(storeData, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save server_store.json', e);
  }
}

// Shared Live Data Endpoints
app.get('/api/shared/data', (_req, res) => {
  res.json({
    students: storeData.students,
    orders: storeData.orders,
  });
});

app.post('/api/shared/register', (req, res) => {
  try {
    const { studentId, name, email, phone, password, bankName, accountNumber, accountHolder } = req.body;
    if (!studentId || !name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đủ họ tên, MSSV, email và mật khẩu' });
    }

    const cleanStudentId = String(studentId).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    const existing = storeData.students.find(
      (s: any) => s.studentId === cleanStudentId || s.email.toLowerCase() === cleanEmail
    );
    if (existing) {
      return res.status(400).json({ error: 'Mã số sinh viên hoặc Email đã được đăng ký trên hệ thống.' });
    }

    const newStudent = {
      studentId: cleanStudentId,
      name: String(name).trim(),
      email: cleanEmail,
      phone: String(phone || '').trim(),
      password: String(password).trim(),
      bankName: bankName || 'Vietcombank',
      accountNumber: accountNumber || '',
      accountHolder: String(accountHolder || name).toUpperCase(),
      hasGoPass: false,
    };

    storeData.students.push(newStudent);
    saveStore();
    return res.json({ success: true, student: newStudent });
  } catch (err: any) {
    return res.status(500).json({ error: 'Lỗi máy chủ khi đăng ký tài khoản', details: err?.message });
  }
});

app.post('/api/shared/orders', (req, res) => {
  try {
    const order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ error: 'Đơn hàng không hợp lệ' });
    }

    const idx = storeData.orders.findIndex((o: any) => o.id === order.id);
    if (idx >= 0) {
      storeData.orders[idx] = order;
    } else {
      storeData.orders.unshift(order);
    }
    saveStore();
    return res.json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ error: 'Lỗi khi lưu đơn hàng', details: err?.message });
  }
});

app.patch('/api/shared/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const target = storeData.orders.find((o: any) => o.id === id);
    if (target) {
      target.status = status;
      target.updatedAt = new Date().toISOString();
      if (status === 'picked_up') {
        target.pickedUpAt = new Date().toISOString();
      }
      saveStore();
      return res.json({ success: true, order: target });
    }
    return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái đơn', details: err?.message });
  }
});

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Recommendation Endpoint
app.post('/api/ai/recommend', async (req, res) => {
  try {
    const { prompt, history, products, slots, rules } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const availableProducts = Array.isArray(products) ? products : [];
    const productsContext = availableProducts
      .slice(0, 30)
      .map(
        (p: any) =>
          `ID: ${p.id} | Tên: ${p.name} | Giá: ${p.price}đ | Loại: ${
            p.type === 'prepared' ? 'Món tươi (chế biến)' : 'Có sẵn'
          } | Danh mục: ${p.categoryId}`
      )
      .join('\n');

    const slotsContext = Array.isArray(slots)
      ? slots.map((s: any) => `Khung ${s.label} (${s.id})`).join(', ')
      : '';

    const systemInstruction = `Bạn là Trợ lý AI Thông minh của ISCanteen Go tại Căn tin trường Đại học (VNU).
Bạn am hiểu sâu sắc về ẩm thực sinh viên, dinh dưỡng, học tập và lịch học của sinh viên.
Danh sách 30 món ăn thực tế của căn tin:
${productsContext}

Các khung giờ nhận món: ${slotsContext}
4 Quy tắc căn tin:
- Rule 1: Tối đa 24 đơn chế biến tươi mỗi khung giờ.
- Rule 2: Tối đa 4 loại món làm tươi trong 1 đơn.
- Rule 3: Tối đa 3 phần/món, không quá 8 phần tươi/đơn.
- Rule 4: Mỗi sinh viên 1 đơn/khung giờ.

Yêu cầu:
1. Phân tích chính xác nhu cầu của sinh viên (ngân sách, no lâu, ôn thi, giảm cân/healthy, ăn sáng nhanh, giải nhiệt, combo tiết kiệm...).
2. Đề xuất cụ thể món ăn từ danh sách trên với tên món, giá tiền và lý do dinh dưỡng/tiện lợi.
3. Luôn đính kèm mảng productIds (ID số của các món bạn gợi ý) và suggestedSlotId (nếu có đề xuất khung giờ) để giao diện cho phép sinh viên bấm 1-click thêm vào giỏ.
4. Trả lời bằng tiếng Việt thân thiện, súc tích, văn phong hiện đại, lịch thiệp.`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'Nội dung phản hồi chi tiết, phân tích dinh dưỡng và lý do chọn món.',
              },
              recommendedProductIds: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER },
                description: 'Danh sách ID món ăn được đề xuất trong thực đơn căn tin.',
              },
              recommendedSlotId: {
                type: Type.STRING,
                description: 'ID khung giờ nhận món được khuyên dùng (ví dụ: 09:45-10:00).',
              },
              totalBudget: {
                type: Type.INTEGER,
                description: 'Tổng tiền ước tính của các món được gợi ý.',
              },
            },
            required: ['reply', 'recommendedProductIds'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        reply: parsed.reply,
        recommendedProductIds: parsed.recommendedProductIds || [],
        recommendedSlotId: parsed.recommendedSlotId,
        totalBudget: parsed.totalBudget,
      });
    } else {
      // Fallback smart heuristic if API key is not yet set
      const q = prompt.toLowerCase();
      let reply = 'Chào bạn! Mình gợi ý bạn thử combo cân bằng dinh dưỡng: ';
      let recommendedProductIds = [1, 15]; // Kimbap + Trà sữa
      let recommendedSlotId = '09:45-10:00';
      let totalBudget = 55000;

      if (q.includes('sáng') || q.includes('rẻ') || q.includes('25k') || q.includes('20k')) {
        reply = 'Bữa sáng nhanh & tiết kiệm năng lượng: Bánh mì thịt giòn rụm (20.000đ) kết hợp Cà phê đen tỉnh táo (20.000đ) giúp bạn nạp năng lượng cho ca học sáng!';
        recommendedProductIds = [7, 17];
        totalBudget = 40000;
        recommendedSlotId = '07:45-08:00';
      } else if (q.includes('healthy') || q.includes('giảm cân') || q.includes('rau') || q.includes('thanh')) {
        reply = 'Thực đơn Eat Clean thanh mát cho hôm nay: Salad tươi giòn (30.000đ) kết hợp Nước cam vắt bổ sung vitamin C (25.000đ) hoặc Nước khoáng Aquafina (7.000đ).';
        recommendedProductIds = [27, 19];
        totalBudget = 55000;
        recommendedSlotId = '11:45-12:00';
      } else if (q.includes('trưa') || q.includes('no') || q.includes('đói')) {
        reply = 'Bữa trưa no lâu đủ chất: Mì xào bò đậm đà (40.000đ) hoặc Cơm cuộn Kimbap chiên giòn (35.000đ) kèm Trà trái cây nhiệt đới (25.000đ).';
        recommendedProductIds = [6, 22];
        totalBudget = 65000;
        recommendedSlotId = '12:45-13:00';
      } else if (q.includes('combo') || q.includes('tiết kiệm')) {
        reply = 'Gợi ý Combo siêu tiết kiệm được tài trợ: Combo Bánh mì + Nước chỉ 30.000đ (tiết kiệm 5.000đ) hoặc Combo Kimbap + Trà sữa 55.000đ!';
        recommendedProductIds = [29];
        totalBudget = 30000;
        recommendedSlotId = '08:45-09:00';
      }

      return res.json({
        reply,
        recommendedProductIds,
        recommendedSlotId,
        totalBudget,
      });
    }
  } catch (error: any) {
    console.error('Gemini Recommendation Error:', error);
    return res.status(500).json({
      error: 'Không thể xử lý yêu cầu AI lúc này',
      details: error?.message || 'Unknown error',
    });
  }
});

// Vite Middleware for Full-Stack dev mode
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ISCanteen Go server running on port ${PORT}`);
  });
}

startServer();
