# Checkin Checker 📊

Công cụ phân tích dữ liệu chấm công mạnh mẽ, riêng tư và hoàn toàn miễn phí.

**Truy cập:**
- [checkin-checker.web.app](https://checkin-checker.web.app) (Firebase)
- [checkin-checker.pages.dev](https://checkin-checker.pages.dev) (Cloudflare - Tốc độ cao)

## ✨ Tính năng chính

- **Phân tích tự động**: Tự động bóc tách dữ liệu từ file log chấm công thô.
- **Phát hiện vi phạm**: Tự động tính toán số phút đi muộn, về sớm.
- **Quy tắc đặc biệt**: 
  - Hỗ trợ quy tắc về sớm 1 tiếng vào ngày Thứ 6.
  - Quản lý hạn mức (quota) về sớm có phép hàng tháng (ví dụ: tối đa 2 lần/tháng, mỗi lần ≤ 90 phút).
- **Phân tích lịch**: Tự động nhận diện cuối tuần và ngày làm việc.
- **Quyền riêng tư tuyệt đối**: 100% logic xử lý tại trình duyệt (Local JS), không gửi dữ liệu lên server hay AI.

## 🛠 Công nghệ sử dụng

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Date Handling**: `date-fns` cho việc xử lý thời gian chính xác.
- **Deployment**: Tự động hóa qua GitHub Actions (Firebase & Cloudflare).

## 🚀 Cài đặt Local

```bash
# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev

# Build sản phẩm
npm run build
```

## 🌐 Triển khai (CI/CD)

Mỗi khi bạn push code lên nhánh `main`, hệ thống sẽ tự động deploy lên cả Firebase và Cloudflare.

### 1. Cấu hình Firebase
- Thêm secret `FIREBASE_SERVICE_ACCOUNT_CHECKIN_CHECKER_8F2B5` vào GitHub Settings.

### 2. Cấu hình Cloudflare Pages (Khắc phục lỗi 404)
Nếu bạn gặp lỗi **"Project not found (8000007)"**, vui lòng kiểm tra kỹ các điểm sau:

1. **Loại Project**: Bạn **PHẢI** chọn loại **Direct Upload** (Upload assets) chứ không phải "Connect to Git" trong Dashboard Cloudflare.
2. **Tên Project**: Kiểm tra xem tên project trên Cloudflare có đúng chính xác là `checkin-checker` hay không (không thừa khoảng trắng).
3. **Account ID**: Đảm bảo mã Account ID trong GitHub Secret là chính xác (Lấy ở trang Overview chính).
4. **API Token**: Đảm bảo Token có quyền "Edit" đối với "Cloudflare Pages" của đúng tài khoản đó.

**Cách tạo lại Project chuẩn:**
- Dashboard > Workers & Pages > Pages > **Create application** > **Pages** > **Upload assets**.
- Đặt tên: `checkin-checker`.
- Nhấn **Create project** xong là dừng lại (không cần upload gì ở web).

---
#   c h e c k i n - c h e c k e r