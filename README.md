# 🏸 🏓 🎾 Sports HUD AI (Edit-badminton-clip-)

> **Tạo video thể thao phong cách truyền hình trực tiếp chuyên nghiệp (Cầu lông · Pickleball · Tennis).**  
> Chạy trực tiếp 100% trên trình duyệt với **WebGPU & WebCodecs**, bảo mật tối đa — video không bao giờ tải lên bất kỳ máy chủ nào.

🌐 **Trải nghiệm trực tiếp trên web (Live Demo):**  
👉 **[https://duongng885623-jpg.github.io/Edit-badminton-clip-/](https://duongng885623-jpg.github.io/Edit-badminton-clip-/)**

---

## 🌟 Điểm nổi bật & Tính năng mới

- **Hỗ trợ 3 môn thể thao:**
  - 🏸 **Cầu lông (Badminton):** Kích thước chuẩn 13.4m × 6.1m, tính toán điểm đập cầu, tốc độ smash, vùng bao quát sân.
  - 🏓 **Pickleball:** Kích thước chuẩn 13.41m × 6.10m, vạch bếp (Non-volley Kitchen 2.13m), góc baseline và đường dóng chuẩn xác.
  - 🎾 **Quần vợt (Tennis):** Kích thước 23.77m × 10.97m, vạch giao bóng và hành lang đánh đôi/đơn.
- **Căn chỉnh sân thông minh (Step 2):**
  - Tự động nhận diện 4 góc sân đánh đôi.
  - **Đường dóng mô phỏng (Extended Perspective Guidelines):** Vẽ các tia phối cảnh kéo dài ra ngoài góc quay camera giúp dễ dàng căn chỉnh vạch sân ngay cả khi góc sân bị che khuất hoặc nằm ngoài khung hình.
  - Khôi phục góc thứ 4 tự động khi đã chọn 2 hoặc 3 góc.
- **Thêm & Ghim vận động viên thủ công (Manual Pinning & Assignment):**
  - Kéo thả chuột khoanh vùng trực tiếp (rubber-band selection) hoặc nhấp chọn để ghim vận động viên.
  - Nút 📍 Ghim lại vị trí trực quan ngay trên từng thẻ vận động viên.
  - Tự động trích xuất histogram màu áo, nhận diện pose YOLO11n/s và khóa tracklet.
- **Giao diện hiện đại & Glassmorphism:**
  - Dark mode cao cấp, bảng điều khiển phát sáng neon, trực quan và mượt mà.
  - Thẻ vận động viên hiển thị chỉ số Real-time: Tốc độ hiện tại, Tốc độ đỉnh (Peak), Thể lực (Stamina) và Quãng đường di chuyển.
- **Hiệu năng cực nhanh với WebGPU:**
  - Tăng tốc phần cứng trực tiếp bằng GPU qua ONNX Runtime WebGPU.
  - Giải mã và mã hóa video tốc độ cao bằng WebCodecs API phần cứng.

---

## 🚀 Trải nghiệm trên máy tính khác (Truy cập từ xa)

### Cách 1: Truy cập qua GitHub Pages (Được triển khai tự động)
Truy cập trực tiếp đường link:
```text
https://duongng885623-jpg.github.io/Edit-badminton-clip-/
```
*Lưu ý:* Vui lòng sử dụng trình duyệt hỗ trợ WebGPU (Google Chrome, Microsoft Edge, Brave hoặc Opera phiên bản mới nhất).

---

### Cách 2: Chạy cục bộ (Local Server)
Nếu muốn chạy trực tiếp trên máy nội bộ hoặc mạng LAN:

1. Clone repository:
```bash
git clone https://github.com/duongng885623-jpg/Edit-badminton-clip-.git
cd Edit-badminton-clip-
```

2. Khởi chạy server nội bộ (yêu cầu Node.js):
```bash
node server.js
```

3. Mở trình duyệt và truy cập:
```text
http://localhost:8080/#/app
```

---

## 🛠️ Cấu trúc thư mục

```text
├── .github/workflows/deploy.yml # Tự động deploy GitHub Pages
├── coi-serviceworker.js         # Service Worker hỗ trợ Cross-Origin Isolation
├── css/
│   └── style.css                # Giao diện Glassmorphism hiện đại
├── js/
│   ├── app.js                   # Logic chính và điều phối wizard 4 bước
│   ├── court.js                 # Hình học sân & extended guidelines
│   ├── stage.js                 # Canvas tương tác (căn sân, khoanh VĐV)
│   ├── config.js                # Tọa độ mặc định và cấu hình môn thể thao
│   ├── detect.js                # AI YOLO Pose & Tracking
│   ├── hud.js                   # Đồ họa phát sóng (Broadcast HUD)
│   └── render.js                # WebCodecs Renderer
├── models/                      # Mô hình AI ONNX (YOLO11, TrackNetV3, WASB)
├── samples/                     # Clip mẫu thử nghiệm Pickleball & Tennis
└── index.html                   # Giao diện chính Single-page App
```

---

## 📜 Bản quyền & Giấy phép
Dự án được xây dựng dưới giấy phép MIT License.
Toàn bộ mã nguồn chạy 100% Client-side.
