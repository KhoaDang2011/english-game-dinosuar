# TÀI LIỆU LOGIC VẬN HÀNH — ENGLISH GAME DINOSAUR

## 1. Luồng trạng thái tổng thể (State Machine)

Ứng dụng vận hành theo State Machine tập trung (`src/core/state-manager.ts`), đảm bảo tại mỗi thời điểm chỉ có duy nhất một màn hình hiển thị:

`INTRO` → `LOGIN` → `MAIN_MENU` → (`MODE_SELECT` → `HOW_TO_PLAY` → `PLAYING` → `GAME_OVER`) / `SKIN_COLLECTION` / `LEADERBOARD` / `CERTIFICATE`.

## 2. Quy tắc Đăng nhập & Hồ sơ Người chơi

- Màn hình đăng nhập chỉ yêu cầu đúng **2 trường bắt buộc**:
  1. **Họ và tên** (`fullName`)
  2. **Lớp** (`className`)
- Tuyệt đối không có trường ID tài khoản và không có trường OTP.
- Định danh nội bộ (`internalPlayerId`) được tự động sinh hoặc ánh xạ bởi `AuthService` phía ứng dụng mà không yêu cầu người chơi nhập.

## 3. Logic Gameplay & Câu hỏi Chướng ngại vật

- Khủng long chạy liên tục trên HTML5 Canvas (`requestAnimationFrame` kết hợp `delta time`).
- Ba chế độ chơi (`BASIC`, `MEDIUM`, `HARDCORE`) có thông số riêng biệt trong `data/config/game-config.ts`:
  - `BASIC`: Tốc độ 260→420 px/s, thời gian trả lời 15s, +15 điểm/câu đúng.
  - `MEDIUM`: Tốc độ 350→580 px/s, có thêm thằn lằn bay (`PTERODACTYL`), thời gian trả lời 10s, +20 điểm/câu đúng.
  - `HARDCORE`: Tốc độ 460→760 px/s, chướng ngại vật dày, thời gian trả lời 7s, +30 điểm/câu đúng.
- Khi chướng ngại vật tiến vào vùng kích hoạt (`QUESTION_TRIGGER_DISTANCE`), chuyển động chướng ngại vật tạm dừng để hiển thị câu hỏi Tiếng Anh 10 (`{ q: string, a: string[], c: number }`).
  - **Trả lời đúng**: Cộng điểm thưởng, đánh dấu chướng ngại vật đã vượt qua (`cleared = true`) và kích hoạt khủng long nhảy vọt qua chướng ngại vật.
  - **Trả lời sai hoặc hết thời gian**: Hiển thị đáp án đúng, sau đó khủng long va vào chướng ngại vật và kết thúc lượt chơi (`GAME_OVER`).

## 4. Hệ thống Điểm & Thử thách Cột mốc (Milestones)

| Cột mốc | Số câu hỏi phụ | Ngưỡng đạt thưởng | Điểm thưởng |
|---|---:|---:|---:|
| 100 điểm | 5 câu | Tối thiểu 4/5 câu đúng (80%) | +20 điểm |
| 500 điểm | 20 câu | Tối thiểu 16/20 câu đúng (80%) | +100 điểm |
| 1.000 điểm | 30 câu | Tối thiểu 24/30 câu đúng (80%) | +250 điểm |
| Từ 2.000 điểm trở lên (mỗi nấc +1.000) | 50 câu | Tối thiểu 40/50 câu đúng (80%) | +500 điểm |

- Mỗi cột mốc sử dụng khóa định danh duy nhất (`triggerKey`, ví dụ `MILESTONE_100@100`, `MILESTONE_2000_PLUS@2000`, `MILESTONE_2000_PLUS@3000`) và cờ `bonusClaimed` để chống mở lặp hoặc cộng điểm thưởng nhiều lần.

## 5. Hệ thống Skin & Bộ sưu tập

- Gồm 5 cấp độ: `Basic`, `Rare`, `Legendary`, `God`, `Secret`.
- Chỉ những skin đã thỏa mãn điều kiện mở khóa mới hiển thị nút **Trang bị**.
- Khi nhấn **Trang bị**, skin được lưu ngay vào `localStorage` và cập nhật trực tiếp lên hình ảnh nhân vật ở cả Menu, Chứng chỉ và trong Canvas khi chạy.
