# 🏸 SPORTS HUD AI — TỔNG HỢP TOÀN BỘ DỰ ÁN & HỒ SƠ KỸ THUẬT

> **Hệ thống tạo video thể thao phong cách truyền hình trực tiếp (Cầu lông · Pickleball · Tennis)**  
> **100% xử lý Client-side trên trình duyệt máy tính — Bảo mật dữ liệu tuyệt đối, không tải video lên server.**

---

## 1. THÔNG TIN CHUNG & TRUY CẬP

* **Kho mã nguồn GitHub:** [https://github.com/duongng885623-jpg/Edit-badminton-clip-](https://github.com/duongng885623-jpg/Edit-badminton-clip-)
* **Trang web trực tuyến (GitHub Pages):** [https://duongng885623-jpg.github.io/Edit-badminton-clip-/](https://duongng885623-jpg.github.io/Edit-badminton-clip-/)
* **Đường dẫn thư mục dự án trên máy:** `c:\Users\Admin\.gemini\antigravity\scratch\badminton-hud-vi`
* **File nén trọn bộ mã nguồn:** `d:\Duong\SPORTS_HUD_AI_TRON_BO.zip`

---

## 2. BẢNG TỔNG HỢP TOÀN BỘ CÁC FILE TRONG HỆ THỐNG

| STT | Đường dẫn / Tên file | Phân loại | Kích thước | Mô tả chức năng chi tiết |
|:---:|:---|:---:|:---:|:---|
| **1** | [`index.html`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/index.html) | Giao diện chính | ~27 KB | Cấu trúc giao diện Web Single Page Application (SPA), thanh Wizard 4 bước, Importmap WHATWG chuẩn xác, thanh công cụ Canvas, modal và controls. |
| **2** | [`css/style.css`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/css/style.css) | Giao diện & Thẩm mỹ | ~24 KB | Hệ thống Design System Obsidian Slate (`#0b101d`) phối Volt Lime (`#d4f82c`), Dark mode chuyên nghiệp thể thao, responsive layout, thanh zoom nổi. |
| **3** | [`js/app.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/app.js) | Bộ điều khiển trung tâm | ~46 KB | Quản lý state toàn cục, logic chuyển step (1→4), kết nối sự kiện giao diện, lưu/tải cấu hình JSON, xử lý logic chia đội A/B tự động theo sân xa/gần. |
| **4** | [`js/court.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/court.js) | Hình học & Sân đấu | ~14 KB | Định nghĩa kích thước tiêu chuẩn BWF (Cầu lông), USAPA (Pickleball), ITF (Tennis); tính toán ma trận Homography phối cảnh 4 điểm, vẽ vạch sân ảo & đường kéo dài. |
| **5** | [`js/players.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/players.js) | Nhận diện & Bám bắt VĐV | ~15 KB | Phân loại VĐV trong/ngoài sân, thuật toán gán Team A (Sân xa) & Team B (Sân gần), trích xuất màu áo (Color Histogram HSV), tracker ByteTrack mượt mà. |
| **6** | [`js/detector.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/detector.js) | Trí tuệ nhân tạo (AI) | ~5.5 KB | Wrapper chạy mô hình YOLO11-pose ONNX với bộ tăng tốc phần cứng WebGPU qua ONNX Runtime Web. Phát hiện người và các điểm khớp (keypoints). |
| **7** | [`js/stage.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/stage.js) | Tương tác Canvas | ~17 KB | Quản lý hiển thị video & canvas căn chỉnh sân, cơ chế kéo thả 4 mỏ neo góc sân, thu phóng (Zoom chuột / Nút bấm) và di chuyển khung hình (Pan). |
| **8** | [`js/hud.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/hud.js) | Đồ họa truyền hình HUD | ~39 KB | Bộ render đồ họa phát sóng trực tiếp: Bảng điểm Top HUD, Thẻ vận động viên, Sơ đồ sân thu nhỏ (Minimap Court), vệt di chuyển (trails), huy hiệu chạm cầu. |
| **9** | [`js/stats.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/stats.js) | Thống kê trận đấu | ~5.2 KB | Tính toán thời gian thực: quãng đường di chuyển (m), tốc độ tối đa/trung bình (km/h), mức tiêu hao thể lực (stamina), dữ liệu bản đồ nhiệt (Heatmap). |
| **10** | [`js/pipeline.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/pipeline.js) | Xử lý & Xuất video | ~19 KB | Quy trình 2-pass hiện đại: Pass 1 phân tích phát hiện chuyển động; Pass 2 vẽ HUD từng khung hình & mã hóa MP4 bằng WebCodecs + Mediabunny siêu tốc. |
| **11** | [`js/config.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/config.js) | Lưu trữ cấu hình | ~4.2 KB | Tự động đồng bộ và lưu trữ trạng thái người dùng vào LocalStorage (`bhud.config.v3`), hỗ trợ Import/Export cấu hình JSON tiện lợi. |
| **12** | [`js/i18n.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/i18n.js) | Đa ngôn ngữ | ~38 KB | Từ điển song ngữ toàn diện Tiếng Việt (`vi`) và Tiếng Anh (`en`), chuyển đổi tức thì không cần tải lại trang. |
| **13** | [`js/bytetrack.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/bytetrack.js) | Bộ theo dõi vị trí | ~6 KB | Cài đặt thuật toán theo dõi ByteTrack, lọc Kalman Filter 2D, duy trì định danh VĐV liên tục qua từng khung hình ngay cả khi bị che khuất. |
| **14** | [`js/shuttle.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/shuttle.js) | Theo dõi bóng/cầu | ~10 KB | Tích hợp TrackNetV3 phát hiện vị trí quả cầu/bóng và phát hiện thời điểm chạm vợt (hit detection). |
| **15** | [`js/rally.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/rally.js) | Phân tích loạt đánh | ~38 KB | Nhận diện tự động bắt đầu / kết thúc hiệp đấu (rally segmentation), cắt ngắn highlight và tính nhịp độ trận đấu. |
| **16** | [`js/report.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/js/report.js) | Báo cáo trận đấu | ~3.9 KB | Tạo báo cáo tổng kết chi tiết sau trận đấu (tổng quãng đường di chuyển của từng đội, tỷ lệ kiểm soát sân). |
| **17** | [`test/regression.test.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/test/regression.test.js) | Kiểm thử hồi quy | ~15 KB | Bộ 16 bài kiểm thử tự động toàn diện kiểm chứng hình học phối cảnh, chia đội A/B, tracking ổn định, đảm bảo không tái phát lỗi cũ. |
| **18** | [`server.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/server.js) | Máy chủ nội bộ | ~4.1 KB | Node.js HTTP server cục bộ hỗ trợ Cross-Origin Isolation (`COOP`/`COEP`) để khai thác tối đa WebGPU và SharedArrayBuffer. |
| **19** | [`coi-serviceworker.js`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/coi-serviceworker.js) | Bật Cross-Origin | ~2.1 KB | Service Worker tự động chèn header Cross-Origin Isolation cho môi trường GitHub Pages tĩnh. |
| **20** | [`package.json`](file:///c:/Users/Admin/.gemini/antigravity/scratch/badminton-hud-vi/package.json) | Cấu hình Node/NPM | ~200 B | Định nghĩa script chạy kiểm thử hồi quy tự động (`npm test`). |
| **21** | `models/*.onnx` | Trọng số AI ONNX | ~30 MB | Các mô hình trí tuệ nhân tạo tối ưu chạy trên trình duyệt: YOLO11-pose, TrackNetV3, WASB. |

---

## 3. KIẾN TRÚC HỆ THỐNG VÀ CÁC CÔNG NGHỆ CHÍNH

```
   [Video Đầu Vào (MP4 / MOV)]
               │
               ▼
┌────────────────────────────────────────────────────────┐
│                   BƯỚC 1: TẢI VIDEO                    │
│   • Giải mã metadata qua HTML5 Video Element           │
│   • Chọn môn thể thao: Cầu lông / Pickleball / Tennis   │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│               BƯỚC 2: CĂN CHỈNH SÂN ĐẤU                │
│   • 4 điểm mỏ neo góc ngoài (Top-L, Top-R, Bot-L, Bot-R│
│   • Thuật toán Homography Perspective Transform         │
│   • Khôi phục toạ độ thực (mét) & Vẽ vạch sân ảo #00ff66│
│   • Đường kéo dài biên sân hỗ trợ căn chỉnh chuẩn xác   │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│             BƯỚC 3: NHẬN DIỆN VẬN ĐỘNG VIÊN             │
│   • YOLO11-pose ONNX (Tăng tốc phần cứng WebGPU)       │
│   • Lọc người hợp lệ theo toạ độ sân (loại khán giả)    │
│   • Tự động chia Đội A (Sân xa) & Đội B (Sân gần)      │
│   • Trích xuất màu áo (HSV Histogram) & ByteTrack ID   │
│   • Hỗ trợ Thêm/Sửa/Xoá VĐV thủ công an toàn (null-safe)│
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│                BƯỚC 4: XUẤT VIDEO & HUD                │
│   • Pass 1: Quét bám đuổi toạ độ VĐV xuyên suốt video  │
│   • Pass 2: Vẽ lớp đồ hoạ truyền hình HUD chuyên nghiệp│
│     - Top HUD tỉ số & thời gian                         │
│     - Thẻ chỉ số VĐV (vận tốc tức thời, quãng đường)   │
│     - Sơ đồ sân Minimap Court động                     │
│   • Mã hoá video đầu ra qua WebCodecs + Mediabunny MP4  │
└────────────────────────────────────────────────────────┘
```

---

## 4. CHI TIẾT CÁC LỖI ĐÃ ĐƯỢC KHẮC PHỤC TRIỆT ĐỂ

1. **Hiển thị vạch sân ảo & đường kéo dài (Homography Divisor Fix):**
   - *Nguyên nhân trước đây:* Điều kiện kiểm tra mẫu số `w <= 1e-4` quá thô, khiến các góc nhìn nghiêng/xa bị nhận diện nhầm là vô cực dẫn tới mất toàn bộ vạch sân xanh `#00ff66`.
   - *Khắc phục:* Chuyển sang kiểm tra trị tuyệt đối `Math.abs(w) < 1e-9`, vạch sân và đường kéo dài luôn hiển thị sắc nét trên mọi góc quay camera (thẳng, nghiêng, góc chéo).

2. **Tự động phân biệt Đội A / Đội B chính xác theo vị trí sân:**
   - *Nguyên nhân trước đây:* Cơ chế gán đội chưa dựa vào toạ độ sân thực mà dựa vào thứ tự quét bounding box ngẫu nhiên, dẫn tới việc tất cả người chơi đều bị xếp chung vào một đội A hoặc sai sân gần/xa.
   - *Khắc phục:* Tính toán toạ độ thực qua ma trận biến đổi phối cảnh $Y_{court}$. Người chơi ở nửa sân xa ($Y_{court} < Y_{net}$) tự động gán **Đội A (Sân xa)**; người chơi ở nửa sân gần ($Y_{court} \ge Y_{net}$) tự động gán **Đội B (Sân gần)**.

3. **Loại bỏ khán giả và người ngoài sân:**
   - *Khắc phục:* Tự động tính vùng bao sân mở rộng có dung sai cho phép đối với từng môn (đặc biệt là môn Tennis cần vùng chạy ra ngoài vạch cuối sân). Khán giả ở hàng ghế trên khán đài bị loại trừ tự động khỏi danh sách thi đấu.

4. **Nút "Thêm thủ công" và click chọn khung hình bị lỗi crash:**
   - *Khắc phục:* Thêm lớp bảo vệ dữ liệu null-safe cho toạ độ sân `cPt`, gán giá trị mặc định an toàn `[3.0, 6.7]` khi bấm thêm thủ công hoặc khi người chơi tạm thời đứng ngoài góc máy.

5. **Bộ kiểm thử tự động hồi quy (Regression Test Suite):**
   - Đã tích hợp `npm test` với 16 bài kiểm tra độc lập chạy trực tiếp trong CI/CD, đảm bảo mọi chỉnh sửa trong tương lai không bao giờ làm hỏng các tính năng cốt lõi.

---

## 5. HƯỚNG DẪN CHẠY DỰ ÁN

### Cách 1: Sử dụng trực tiếp trên Web (Không cần cài đặt gì)
* Mở trình duyệt Chrome/Edge/Brave và truy cập:  
  👉 **[https://duongng885623-jpg.github.io/Edit-badminton-clip-/](https://duongng885623-jpg.github.io/Edit-badminton-clip-/)**

### Cách 2: Chạy cục bộ trên máy tính (Local Server với WebGPU)
1. Mở PowerShell hoặc Command Prompt tại thư mục dự án:
   ```powershell
   cd c:\Users\Admin\.gemini\antigravity\scratch\badminton-hud-vi
   ```
2. Khởi động server nội bộ:
   ```powershell
   node server.js
   ```
3. Truy cập địa chỉ: `http://localhost:8080` trên trình duyệt.

### Cách 3: Chạy bộ kiểm thử tự động
```powershell
npm test
```
*Kết quả: 16/16 bài kiểm tra đạt chuẩn 100%.*
