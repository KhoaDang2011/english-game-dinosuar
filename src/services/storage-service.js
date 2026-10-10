const STORAGE_PREFIX = 'english_game_dinosaur_v1_';

export const STORAGE_KEYS = {
  PLAYER_PROFILE: `${STORAGE_PREFIX}player_profile`,
  PLAYER_PROGRESS: `${STORAGE_PREFIX}player_progress`,
  EQUIPPED_SKIN: `${STORAGE_PREFIX}equipped_skin`,
  LEADERBOARD: `${STORAGE_PREFIX}leaderboard`,
  CERTIFICATES: `${STORAGE_PREFIX}certificates`,
};

export class StorageService {
  static get(key, fallback) {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (err) {
      console.warn(
        `[StorageService] Dữ liệu tại khóa "${key}" không hợp lệ, khôi phục mặc định.`,
        err
      );
      return fallback;
    }
  }

  static set(key, value) {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`[StorageService] Không thể lưu khóa "${key}".`, err);
      return false;
    }
  }

  static remove(key) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore error
    }
  }
}
