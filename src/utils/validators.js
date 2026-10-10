/**
 * Kiểm tra thông tin đăng nhập của người chơi.
 * Chỉ gồm đúng 2 trường bắt buộc: Họ và tên + Lớp.
 * Tuyệt đối không yêu cầu ID tài khoản hay OTP.
 */
export function validatePlayerLogin(fullNameRaw, classNameRaw) {
  const fullName =
    typeof fullNameRaw === 'string'
      ? fullNameRaw.trim().replace(/\s+/g, ' ')
      : '';
  const className =
    typeof classNameRaw === 'string'
      ? classNameRaw.trim().toUpperCase().replace(/\s+/g, '')
      : '';

  const errors = {};

  if (!fullName) {
    errors.fullName = 'Vui lòng nhập đầy đủ họ và tên của bạn.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự.';
  } else if (fullName.length > 60) {
    errors.fullName = 'Họ và tên không được vượt quá 60 ký tự.';
  }

  if (!className) {
    errors.className = 'Vui lòng nhập tên lớp (ví dụ: 10A1, 10C2).';
  } else if (className.length < 2 || className.length > 15) {
    errors.className = 'Tên lớp phải từ 2 đến 15 ký tự (ví dụ: 10A1).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    fullName,
    className,
    errors,
  };
}

/**
 * Kiểm tra cấu trúc câu hỏi bắt buộc: { q: string, a: string[], c: number }
 */
export function isValidQuestion(item) {
  if (!item || typeof item !== 'object') return false;

  if (typeof item.q !== 'string' || item.q.trim().length === 0) {
    return false;
  }

  if (!Array.isArray(item.a) || item.a.length !== 4) {
    return false;
  }

  const allOptionsValid = item.a.every(
    (opt) => typeof opt === 'string' && opt.trim().length > 0
  );
  if (!allOptionsValid) {
    return false;
  }

  if (
    typeof item.c !== 'number' ||
    !Number.isInteger(item.c) ||
    item.c < 0 ||
    item.c > 3
  ) {
    return false;
  }

  return true;
}

/**
 * Lọc và kiểm tra danh sách câu hỏi từ bất kỳ nguồn dữ liệu nào để tránh lỗi runtime.
 */
export function validateQuestionList(list, sourceName = 'UnknownSource') {
  if (!Array.isArray(list)) {
    return {
      validQuestions: [],
      invalidCount: 1,
      errors: [`[${sourceName}] Dữ liệu không phải là một mảng.`],
    };
  }

  const validQuestions = [];
  const errors = [];
  let invalidCount = 0;

  list.forEach((item, index) => {
    if (isValidQuestion(item)) {
      validQuestions.push({
        q: item.q.trim(),
        a: item.a.map((opt) => opt.trim()),
        c: item.c,
      });
    } else {
      invalidCount += 1;
      errors.push(
        `[${sourceName}] Câu hỏi tại vị trí #${index} sai cấu trúc { q, a[4], c(0..3) }.`
      );
    }
  });

  return { validQuestions, invalidCount, errors };
}
