# HỢP ĐỒNG GIAO TIẾP API (FRONTEND ↔ PYTHON BACKEND)

Tài liệu này quy định các endpoint HTTP RESTful dự kiến khi kết nối lớp `src/services/api-client.ts` với máy chủ Backend Python (FastAPI / Flask).

---

## 1. Đăng nhập / Khởi tạo Hồ sơ Học sinh

- **Endpoint:** `POST /api/v1/auth/login`
- **Mô tả:** Nhận Họ và tên + Lớp của học sinh, trả về hồ sơ kèm mã định danh nội bộ `internalPlayerId`. Không sử dụng ID tài khoản nhập tay hay OTP.
- **Request Body:**
```json
{
  "fullName": "Nguyễn Văn An",
  "className": "10A1"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "profile": {
    "internalPlayerId": "PLR-9X2K1-A8B4",
    "fullName": "Nguyễn Văn An",
    "className": "10A1",
    "createdAt": "2026-10-09T10:00:00Z",
    "lastLoginAt": "2026-10-09T10:00:00Z"
  }
}
```
- **Response `400 Bad Request`:**
```json
{
  "success": false,
  "errors": {
    "fullName": "Vui lòng nhập đầy đủ họ và tên của bạn.",
    "className": "Vui lòng nhập tên lớp (ví dụ: 10A1)."
  }
}
```

---

## 2. Lấy Tiến trình & Thành tích Người chơi

- **Endpoint:** `GET /api/v1/players/{internalPlayerId}/progress`
- **Response `200 OK`:**
```json
{
  "internalPlayerId": "PLR-9X2K1-A8B4",
  "fullName": "Nguyễn Văn An",
  "className": "10A1",
  "highScore": 620,
  "lastScore": 410,
  "lastMode": "MEDIUM",
  "gamesPlayed": 5,
  "totalCorrectAnswers": 34,
  "totalQuestionsAnswered": 40,
  "milestonesPassedCount": 2,
  "passedMilestoneIds": ["MILESTONE_100", "MILESTONE_500"],
  "modeHighScores": {
    "BASIC": 310,
    "MEDIUM": 620,
    "HARDCORE": 180
  },
  "unlockedSkinIds": ["skin_emerald_rookie", "skin_cobalt_sprinter", "skin_amber_scholar"],
  "equippedSkinId": "skin_amber_scholar"
}
```

---

## 3. Gửi Kết quả Lượt chơi (`submitScore`)

- **Endpoint:** `POST /api/v1/scores/submit`
- **Request Body:**
```json
{
  "internalPlayerId": "PLR-9X2K1-A8B4",
  "fullName": "Nguyễn Văn An",
  "className": "10A1",
  "mode": "MEDIUM",
  "finalScore": 650,
  "correctAnswers": 18,
  "totalQuestions": 21,
  "milestonesPassedInRun": ["MILESTONE_100", "MILESTONE_500"],
  "survivalSeconds": 75
}
```
- **Response `200 OK`:**
```json
{
  "syncedToServer": true,
  "isNewHighScore": true,
  "playerRank": 3,
  "enteredTop3": true,
  "newlyUnlockedSkinIds": ["skin_royal_sovereign"]
}
```

---

## 4. Lấy Bảng xếp hạng (`getLeaderboard`)

- **Endpoint:** `GET /api/v1/leaderboard?limit=50`
- **Response `200 OK`:**
```json
{
  "entries": [
    {
      "rank": 1,
      "fullName": "Nguyễn Minh Khôi",
      "className": "10A1",
      "highScore": 1420,
      "bestMode": "HARDCORE",
      "milestonesPassed": 3,
      "correctAnswers": 64,
      "achievedAt": "2026-10-01T08:30:00.000Z"
    }
  ]
}
```

---

## 5. Lưu Skin đang trang bị (`saveEquippedSkin`)

- **Endpoint:** `PUT /api/v1/players/{internalPlayerId}/equipped-skin`
- **Request Body:**
```json
{
  "skinId": "skin_royal_sovereign"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "equippedSkinId": "skin_royal_sovereign"
}
```

---

## 6. Lấy Danh sách Chứng chỉ (`getCertificates`)

- **Endpoint:** `GET /api/v1/players/{internalPlayerId}/certificates`
- **Response `200 OK`:**
```json
{
  "certificates": [
    {
      "requirementId": "CERT_STARTER_100",
      "certificateCode": "CERT10-89AB2-77CX",
      "issuedAt": "2026-10-09T10:15:00Z",
      "achievedScore": 650
    }
  ]
}
```
