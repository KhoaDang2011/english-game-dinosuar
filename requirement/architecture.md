# KIẾN TRÚC HỆ THỐNG — ENGLISH GAME DINOSAUR

## 1. Cấu trúc Thư mục Phân tách Trách nhiệm

- `/data/`
  - `config/game-config.ts`: Toàn bộ thông số chế độ chơi (`BASIC`, `MEDIUM`, `HARDCORE`), cấu hình cột mốc thưởng (100, 500, 1000, 2000+) và điều kiện cấp chứng chỉ.
  - `gameplay/gameplay-questions.ts`: Ngân hàng câu hỏi Tiếng Anh 10 Global Success dùng trong khi vượt chướng ngại vật.
  - `milestones/`: Ngân hàng câu hỏi phụ tách riêng cho từng mốc (`milestone-100.ts`, `milestone-500.ts`, `milestone-1000.ts`, `milestone-2000.ts`).
  - `future-question-bank/`: 5 file cấu trúc mở rộng (`questions-01.ts` đến `questions-05.ts`) dành cho 500 câu hỏi phụ tương lai.
  - `skins/skins.ts`: Dữ liệu 7 skin thuộc 5 cấp độ (`Basic`, `Rare`, `Legendary`, `God`, `Secret`) cùng cấu hình vẽ trực quan.
- `/src/`
  - `core/state-manager.ts`: Quản lý trạng thái màn hình và kiểm tra chuyển đổi hợp lệ.
  - `auth/`: Tách biệt `auth-service.ts` (xử lý hồ sơ Họ tên + Lớp) và `LoginScreen.tsx` (giao diện đăng nhập 2 trường).
  - `game/`: Engine chạy Canvas (`GameplayScreen.tsx`, `canvas-renderer.ts`), bộ điều khiển câu hỏi (`question-controller.ts`) và bộ quản lý cột mốc (`milestone-manager.ts`).
  - `skins/`: Quản lý mở khóa/trang bị (`skin-manager.ts`), vẽ nhân vật (`DinoAvatar.tsx`) và giao diện bộ sưu tập (`SkinCollectionScreen.tsx`).
  - `leaderboard/`: Xử lý sắp xếp thứ hạng (`leaderboard-service.ts`) và giao diện (`LeaderboardScreen.tsx`).
  - `certificate/`: Kiểm tra điều kiện cấp chứng chỉ, sinh mã chứng chỉ (`certificate-manager.ts`) và giao diện in ấn (`CertificateScreen.tsx`).
  - `services/`: Lớp giao tiếp trung gian (`api-client.ts`, `score-service.ts`, `storage-service.ts`).
  - `utils/`: Kiểm tra dữ liệu (`validators.ts`), trộn ngẫu nhiên (`random.ts`) và âm thanh Web Audio API (`sound.ts`).
- `/backend/`: Tài liệu hướng dẫn triển khai Backend Python ở giai đoạn tiếp theo.
- `/requirement/`: Tài liệu logic, kiến trúc và hợp đồng API (`api-contract.md`).
