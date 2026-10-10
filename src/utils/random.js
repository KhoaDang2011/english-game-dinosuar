/**
 * Trộn ngẫu nhiên mảng theo thuật toán Fisher-Yates, trả về mảng mới.
 */
export function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Sinh số thực ngẫu nhiên trong khoảng [min, max].
 */
export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Sinh mã định danh nội bộ ngắn gọn (dùng cho mã người chơi nội bộ hoặc mã chứng chỉ).
 */
export function generateInternalId(prefix) {
  const timePart = Date.now().toString(36).toUpperCase().slice(-5);
  const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timePart}-${randPart}`;
}
