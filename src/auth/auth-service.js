import { STORAGE_KEYS, StorageService } from '../services/storage-service.js';
import { generateInternalId } from '../utils/random.js';
import { validatePlayerLogin } from '../utils/validators.js';

/**
 * Module xử lý hồ sơ người chơi độc lập với giao diện đăng nhập.
 * Chỉ nhận Họ và tên + Lớp. Tự động ánh xạ hoặc sinh mã người chơi nội bộ.
 */
export class AuthService {
  static getCurrentProfile() {
    const saved = StorageService.get(STORAGE_KEYS.PLAYER_PROFILE, null);
    if (!saved || typeof saved !== 'object') return null;

    const check = validatePlayerLogin(saved.fullName, saved.className);
    if (!check.valid) {
      StorageService.remove(STORAGE_KEYS.PLAYER_PROFILE);
      return null;
    }

    return {
      internalPlayerId:
        typeof saved.internalPlayerId === 'string' &&
        saved.internalPlayerId.length > 0
          ? saved.internalPlayerId
          : generateInternalId('PLR'),
      fullName: check.fullName,
      className: check.className,
      createdAt: saved.createdAt || new Date().toISOString(),
      lastLoginAt: saved.lastLoginAt || new Date().toISOString(),
    };
  }

  static login(fullNameInput, classNameInput) {
    const validation = validatePlayerLogin(fullNameInput, classNameInput);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const existing = this.getCurrentProfile();
    const nowIso = new Date().toISOString();

    const isSamePlayer =
      existing &&
      existing.fullName.toLowerCase() === validation.fullName.toLowerCase() &&
      existing.className.toLowerCase() === validation.className.toLowerCase();

    const profile = {
      internalPlayerId: isSamePlayer
        ? existing.internalPlayerId
        : generateInternalId('PLR'),
      fullName: validation.fullName,
      className: validation.className,
      createdAt: isSamePlayer ? existing.createdAt : nowIso,
      lastLoginAt: nowIso,
    };

    StorageService.set(STORAGE_KEYS.PLAYER_PROFILE, profile);

    return {
      success: true,
      profile,
    };
  }

  static logout() {
    StorageService.remove(STORAGE_KEYS.PLAYER_PROFILE);
  }
}
