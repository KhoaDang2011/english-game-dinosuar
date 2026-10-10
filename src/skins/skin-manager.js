import {
  DEFAULT_SKIN_ID,
  FULL_SKIN_COMMAND_CODES,
  RESET_SKIN_COMMAND_CODES,
  SKIN_DEFINITIONS,
} from '../../data/skins/skins.js';
import { ScoreService } from '../services/score-service.js';
import { STORAGE_KEYS, StorageService } from '../services/storage-service.js';

export class SkinManager {
  static checkUnlockCondition(skin, progress) {
    if (progress.unlockedSkinIds.includes(skin.id)) {
      return {
        unlocked: true,
        progressText: 'Đã mở khóa',
        progressPercent: 100,
      };
    }

    const cond = skin.unlockCondition;

    switch (cond.type) {
      case 'DEFAULT':
        return {
          unlocked: true,
          progressText: 'Mặc định',
          progressPercent: 100,
        };

      case 'HIGH_SCORE': {
        const current = progress.highScore;
        const target = cond.targetValue;
        const unlocked = current >= target;
        const pct = Math.min(
          100,
          Math.floor((current / Math.max(1, target)) * 100)
        );
        return {
          unlocked,
          progressText: `${Math.min(current, target)} / ${target} điểm kỷ lục`,
          progressPercent: pct,
        };
      }

      case 'TOTAL_CORRECT': {
        const current = progress.totalCorrectAnswers;
        const target = cond.targetValue;
        const unlocked = current >= target;
        const pct = Math.min(
          100,
          Math.floor((current / Math.max(1, target)) * 100)
        );
        return {
          unlocked,
          progressText: `${Math.min(current, target)} / ${target} câu trả lời đúng`,
          progressPercent: pct,
        };
      }

      case 'MILESTONES_PASSED': {
        const current = progress.milestonesPassedCount;
        const target = cond.targetValue;
        const unlocked = current >= target;
        const pct = Math.min(
          100,
          Math.floor((current / Math.max(1, target)) * 100)
        );
        return {
          unlocked,
          progressText: `${Math.min(current, target)} / ${target} cột mốc vượt qua`,
          progressPercent: pct,
        };
      }

      case 'MODE_HIGH_SCORE': {
        const mode = cond.requiredMode || 'HARDCORE';
        const modeBest = progress.modeHighScores[mode] || 0;
        const overallBest = progress.highScore;
        const secondaryTarget = cond.secondaryValue || 2000;
        const unlocked =
          modeBest >= cond.targetValue || overallBest >= secondaryTarget;
        const pct1 = (modeBest / Math.max(1, cond.targetValue)) * 100;
        const pct2 = (overallBest / Math.max(1, secondaryTarget)) * 100;
        const pct = Math.min(100, Math.floor(Math.max(pct1, pct2)));
        return {
          unlocked,
          progressText: `HardCore: ${modeBest}/${cond.targetValue} đ (hoặc Kỷ lục: ${overallBest}/${secondaryTarget} đ)`,
          progressPercent: pct,
        };
      }

      default:
        return {
          unlocked: false,
          progressText: 'Chưa mở khóa',
          progressPercent: 0,
        };
    }
  }

  static evaluateAndUnlockSkins(profile, progress) {
    const newlyUnlockedSkins = [];
    const unlockedSet = new Set(progress.unlockedSkinIds || [DEFAULT_SKIN_ID]);
    unlockedSet.add(DEFAULT_SKIN_ID);

    for (const skin of SKIN_DEFINITIONS) {
      const check = this.checkUnlockCondition(skin, progress);
      if (check.unlocked && !unlockedSet.has(skin.id)) {
        unlockedSet.add(skin.id);
        newlyUnlockedSkins.push(skin);
      }
    }

    const updatedProgress = {
      ...progress,
      unlockedSkinIds: Array.from(unlockedSet),
    };

    ScoreService.savePlayerProgress(profile, updatedProgress);

    return { updatedProgress, newlyUnlockedSkins };
  }

  static redeemCommandCode(profile, progress, rawCode) {
    const normalized =
      typeof rawCode === 'string' ? rawCode.trim().toUpperCase() : '';

    if (!normalized) {
      return {
        success: false,
        message: 'Vui lòng nhập mã lệnh trước khi kích hoạt.',
        updatedProgress: progress,
      };
    }

    if (FULL_SKIN_COMMAND_CODES.includes(normalized)) {
      const allIds = SKIN_DEFINITIONS.map((s) => s.id);
      const updatedProgress = {
        ...progress,
        unlockedSkinIds: allIds,
        updatedAt: new Date().toISOString(),
      };
      ScoreService.savePlayerProgress(profile, updatedProgress);

      return {
        success: true,
        message: `Mã lệnh "${normalized}" hợp lệ! Đã mở khóa toàn bộ ${allIds.length}/${allIds.length} Skin (bao gồm cả cấp God & Secret).`,
        updatedProgress,
      };
    }

    if (RESET_SKIN_COMMAND_CODES.includes(normalized)) {
      const baseProgress = {
        ...progress,
        unlockedSkinIds: [DEFAULT_SKIN_ID],
      };
      const { updatedProgress } = this.evaluateAndUnlockSkins(
        profile,
        baseProgress
      );
      return {
        success: true,
        message:
          'Đã đặt lại danh sách Skin theo đúng tiến trình điểm số thực tế của bạn.',
        updatedProgress,
      };
    }

    return {
      success: false,
      message: `Mã lệnh "${rawCode.trim()}" không hợp lệ. Gợi ý mã mở khóa full skin: FULLSKIN hoặc DINO10.`,
      updatedProgress: progress,
    };
  }

  static getEquippedSkinId(profile, progress) {
    const savedMap = StorageService.get(STORAGE_KEYS.EQUIPPED_SKIN, {});
    const key = profile
      ? `${profile.fullName.toLowerCase()}__${profile.className.toLowerCase()}`
      : 'default_guest';

    const candidateId = savedMap[key];
    if (!candidateId) return DEFAULT_SKIN_ID;

    const skinDef = SKIN_DEFINITIONS.find((s) => s.id === candidateId);
    if (!skinDef) {
      savedMap[key] = DEFAULT_SKIN_ID;
      StorageService.set(STORAGE_KEYS.EQUIPPED_SKIN, savedMap);
      return DEFAULT_SKIN_ID;
    }

    const check = this.checkUnlockCondition(skinDef, progress);
    if (!check.unlocked) {
      savedMap[key] = DEFAULT_SKIN_ID;
      StorageService.set(STORAGE_KEYS.EQUIPPED_SKIN, savedMap);
      return DEFAULT_SKIN_ID;
    }

    return candidateId;
  }

  static getEquippedSkin(profile, progress) {
    const equippedId = this.getEquippedSkinId(profile, progress);
    return (
      SKIN_DEFINITIONS.find((s) => s.id === equippedId) || SKIN_DEFINITIONS[0]
    );
  }

  static equipSkin(profile, progress, skinId) {
    const targetSkin = SKIN_DEFINITIONS.find((s) => s.id === skinId);
    if (!targetSkin) {
      return {
        success: false,
        message: 'Skin không tồn tại trong hệ thống.',
        equippedSkin: this.getEquippedSkin(profile, progress),
      };
    }

    const check = this.checkUnlockCondition(targetSkin, progress);
    if (!check.unlocked) {
      return {
        success: false,
        message: `Chưa đủ điều kiện mở khóa "${targetSkin.name}".`,
        equippedSkin: this.getEquippedSkin(profile, progress),
      };
    }

    const savedMap = StorageService.get(STORAGE_KEYS.EQUIPPED_SKIN, {});
    const key = `${profile.fullName.toLowerCase()}__${profile.className.toLowerCase()}`;
    savedMap[key] = targetSkin.id;
    StorageService.set(STORAGE_KEYS.EQUIPPED_SKIN, savedMap);

    return {
      success: true,
      message: `Đã trang bị thành công skin "${targetSkin.name}".`,
      equippedSkin: targetSkin,
    };
  }

  static getAllSkinsWithStatus(profile, progress) {
    const equippedId = this.getEquippedSkinId(profile, progress);

    return SKIN_DEFINITIONS.map((skin) => {
      const check = this.checkUnlockCondition(skin, progress);
      return {
        skin,
        isUnlocked: check.unlocked,
        isEquipped: check.unlocked && skin.id === equippedId,
        progressText: check.progressText,
        progressPercent: check.progressPercent,
      };
    });
  }
}
