# Google Stitch UI/UX Export & Design Specification

Dưới đây là toàn bộ thông tin **UI/UX Design System**, **Bảng màu Tokens**, **Bố cục 3 Cột (Full-Width)** và **Mã nguồn Components** của dự án **Sound It Out** được đóng gói chuẩn định dạng dành cho Google Stitch Studio & Google Stitch MCP Server.

---

## 🎨 1. Design System & Design Tokens

### ✍️ Typography (Hỗ trợ 100% Tiếng Việt)
- **Body & Controls**: `Inter, system-ui, sans-serif`
- **Headings (h1 - h6)**: `Be Vietnam Pro, sans-serif`
- **Subsets**: `latin, vietnamese`

### 🌈 Color Palette & Gradients
- **Primary Colors**: Emerald (`#10b981`), Teal (`#0d9488`), Cyan (`#06b6d4`)
- **Accent Colors**: Amber (`#f59e0b`), Rose (`#f43f5e`), Purple (`#9333ea`)
- **Dark Mode Surface**: Slate 950 (`#020617`), Slate 900 (`#0f172a`), Glassmorphism `bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl`

---

## 📐 2. Bố Cục Layout Cân Đối (3-Column Full-Width Edge-to-Edge)

- **Container Wrapper**: `w-full max-w-[1700px] mx-auto px-4 lg:px-8 py-6` (Đồng bộ lề 100% với Top Navbar).
- **Grid Breakdown**:
  - **Aside Left (`lg:col-span-3`)**: Danh sách bài học được assign.
  - **Center Main (`lg:col-span-6`)**: Sân khấu luyện Dictation (Progress bar, Web Speech TTS player, Textbox nghĩa Tiếng Việt, Ô nhập chính tả, Nút SRS SM-2).
  - **Aside Right (`lg:col-span-3`)**: ⭐ Kho từ cần ôn tập Spaced Repetition (SRS SM-2) & Danh sách từ khó đến hạn.

---

## 🧩 3. Danh Sách Component UI Trên Stitch

### 1. `LoginPage.tsx` (Trang Đăng Nhập Bảo Mật)
- **Background**: `url('/metta-portal-bg.jpg')` với `opacity-80` và lớp phủ Gradient mượt.
- **Tính năng**: Nút bật/tắt mắt xem mật khẩu (`Eye`/`EyeOff`), không lưu tài khoản mặc định, nhãn bảo mật `ShieldCheck`.

### 2. `Navbar.tsx` (Thanh Điều Hướng Top Bar)
- **Thương hiệu**: Logo `/logo-icon.png`, Khẩu hiệu **"May all beings be happy"**.
- **Role Tabs**: Tự động chuyển đổi các Tab (`practice`, `composer`, `assigned`, `reports`, `admin`) theo quyền hạn người dùng.

### 3. `DictationPractice.tsx` (Dictation Engine & SRS SM-2)
- **Trình phát âm thanh**: Web Speech API với nút chọn tốc độ `1.0x`, `0.75x`, `0.5x`.
- **Nghĩa Tiếng Việt**: Textbox bo tròn gradient hiển thị trực quan nghĩa Tiếng Việt.
- **SRS SM-2 Buttons**: `Chưa thuộc (Again)`, `Hơi khó (Hard)`, `Khá tốt (Good)`, `Rất dễ (Easy)`.

### 4. `LessonComposer.tsx` (Soạn & Giao Bài Học)
- **Tự động hóa**: NLP Text Segmenter + MyMemory API auto-translation + Phân công cho học sinh cụ thể (`learner`).

### 5. `AdminPortal.tsx` (Admin 4 Tab)
- **Tab 1**: Thành viên & Phân quyền RBAC.
- **Tab 2**: Cấu hình Hệ thống (Domain sound-it-out.metta.family, Voice accent).
- **Tab 3**: Danh mục bài học Master.
- **Tab 4**: Báo cáo tiến độ học tập gia đình.

---

## 🔗 4. Cấu Hình Google Stitch MCP Server

Tệp `mcp_config.json` và `.agents/mcp_config.json` đã được tạo để kết nối IDE với Stitch:

```json
{
  "mcpServers": {
    "stitch": {
      "serverUrl": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "${STITCH_API_KEY}"
      }
    }
  }
}
```
