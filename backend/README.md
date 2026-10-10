# BACKEND PYTHON — ENGLISH GAME DINOSAUR (GIAI ĐOẠN TIẾP THEO)

Thư mục này dành cho phần triển khai Backend Python (FastAPI / Flask + SQLite/PostgreSQL) ở giai đoạn sau.

## Kiến trúc Kết nối Sẵn sàng

Hiện tại, toàn bộ Frontend đã được tách lớp dịch vụ tại `src/services/api-client.ts` với 7 hàm chuẩn:

1. `ApiClient.login(fullName, className)`
2. `ApiClient.getPlayerProfile()`
3. `ApiClient.getPlayerProgress(profile)`
4. `ApiClient.submitScore(profile, runInput)`
5. `ApiClient.getLeaderboard(profile)`
6. `ApiClient.saveEquippedSkin(profile, progress, skinId)`
7. `ApiClient.getCertificates(profile)`

Khi triển khai máy chủ Python theo đúng đặc tả trong `/requirement/api-contract.md`, chỉ cần thay đổi phần gọi HTTP `fetch()` bên trong `src/services/api-client.ts` mà không phải sửa lại bất kỳ màn hình giao diện hay logic game nào.
