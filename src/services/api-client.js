import { AuthService } from '../auth/auth-service.js';
import { CertificateManager } from '../certificate/certificate-manager.js';
import { LeaderboardService } from '../leaderboard/leaderboard-service.js';
import { SkinManager } from '../skins/skin-manager.js';
import { ScoreService } from './score-service.js';

/**
 * Lớp dịch vụ giao tiếp trung gian giữa Frontend và Backend Python (tương lai).
 * Cung cấp đầy đủ 7 phương thức chuẩn:
 * - login()
 * - submitScore()
 * - getLeaderboard()
 * - getPlayerProfile()
 * - getPlayerProgress()
 * - saveEquippedSkin()
 * - getCertificates()
 */
export class ApiClient {
  static async login(fullName, className) {
    return AuthService.login(fullName, className);
  }

  static async getPlayerProfile() {
    return AuthService.getCurrentProfile();
  }

  static async getPlayerProgress(profile) {
    const activeProfile = profile ?? AuthService.getCurrentProfile();
    return ScoreService.getPlayerProgress(activeProfile);
  }

  static async submitScore(profile, runInput) {
    const { updatedProgress, isNewHighScore } = ScoreService.recordRunResult(
      profile,
      runInput
    );

    const {
      updatedProgress: progressWithSkins,
      newlyUnlockedSkins,
    } = SkinManager.evaluateAndUnlockSkins(profile, updatedProgress);

    const { leaderboard, playerRank, enteredTop3 } =
      LeaderboardService.upsertPlayerScore(profile, progressWithSkins);

    CertificateManager.syncAndGetCertificates(profile, progressWithSkins);

    return {
      syncMode: 'LOCAL_STORAGE_MOCK',
      syncedToServer: false,
      statusMessage:
        'Đã ghi nhận điểm vào bộ nhớ cục bộ (Chế độ Frontend thử nghiệm — sẵn sàng kết nối API Backend Python).',
      updatedProgress: progressWithSkins,
      isNewHighScore,
      newlyUnlockedSkins,
      leaderboard,
      playerRank,
      enteredTop3,
    };
  }

  static async getLeaderboard(profile) {
    const activeProfile = profile ?? AuthService.getCurrentProfile();
    return {
      syncMode: 'LOCAL_STORAGE_MOCK',
      entries: LeaderboardService.getLeaderboard(activeProfile),
    };
  }

  static async saveEquippedSkin(profile, progress, skinId) {
    return SkinManager.equipSkin(profile, progress, skinId);
  }

  static async getCertificates(profile) {
    const activeProfile = profile ?? AuthService.getCurrentProfile();
    const progress = ScoreService.getPlayerProgress(activeProfile);
    return CertificateManager.syncAndGetCertificates(activeProfile, progress);
  }
}
