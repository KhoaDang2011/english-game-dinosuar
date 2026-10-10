import { DEFAULT_SKIN_ID } from '../../data/skins/skins.js';
import { STORAGE_KEYS, StorageService } from './storage-service.js';

export class ScoreService {
  static getDefaultProgress(profile) {
    return {
      internalPlayerId: profile?.internalPlayerId || 'GUEST',
      fullName: profile?.fullName || 'Học sinh',
      className: profile?.className || '10A1',
      highScore: 0,
      lastScore: 0,
      lastMode: 'BASIC',
      gamesPlayed: 0,
      totalCorrectAnswers: 0,
      totalQuestionsAnswered: 0,
      milestonesPassedCount: 0,
      passedMilestoneIds: [],
      modeHighScores: {
        BASIC: 0,
        MEDIUM: 0,
        HARDCORE: 0,
      },
      unlockedSkinIds: [DEFAULT_SKIN_ID],
      updatedAt: new Date().toISOString(),
    };
  }

  static getPlayerProgress(profile) {
    const fallback = this.getDefaultProgress(profile);
    if (!profile) return fallback;

    const allSaved = StorageService.get(STORAGE_KEYS.PLAYER_PROGRESS, {});
    const key = `${profile.fullName.toLowerCase()}__${profile.className.toLowerCase()}`;
    const existing = allSaved[key];

    if (!existing || typeof existing !== 'object') {
      return fallback;
    }

    return {
      internalPlayerId: profile.internalPlayerId,
      fullName: profile.fullName,
      className: profile.className,
      highScore: Number.isFinite(existing.highScore)
        ? Math.max(0, existing.highScore)
        : 0,
      lastScore: Number.isFinite(existing.lastScore)
        ? Math.max(0, existing.lastScore)
        : 0,
      lastMode: existing.lastMode || 'BASIC',
      gamesPlayed: Number.isFinite(existing.gamesPlayed)
        ? Math.max(0, existing.gamesPlayed)
        : 0,
      totalCorrectAnswers: Number.isFinite(existing.totalCorrectAnswers)
        ? Math.max(0, existing.totalCorrectAnswers)
        : 0,
      totalQuestionsAnswered: Number.isFinite(existing.totalQuestionsAnswered)
        ? Math.max(0, existing.totalQuestionsAnswered)
        : 0,
      milestonesPassedCount: Number.isFinite(existing.milestonesPassedCount)
        ? Math.max(0, existing.milestonesPassedCount)
        : 0,
      passedMilestoneIds: Array.isArray(existing.passedMilestoneIds)
        ? existing.passedMilestoneIds
        : [],
      modeHighScores: {
        BASIC: Number(existing.modeHighScores?.BASIC) || 0,
        MEDIUM: Number(existing.modeHighScores?.MEDIUM) || 0,
        HARDCORE: Number(existing.modeHighScores?.HARDCORE) || 0,
      },
      unlockedSkinIds: Array.isArray(existing.unlockedSkinIds)
        ? Array.from(new Set([DEFAULT_SKIN_ID, ...existing.unlockedSkinIds]))
        : [DEFAULT_SKIN_ID],
      updatedAt: existing.updatedAt || new Date().toISOString(),
    };
  }

  static savePlayerProgress(profile, progress) {
    const allSaved = StorageService.get(STORAGE_KEYS.PLAYER_PROGRESS, {});
    const key = `${profile.fullName.toLowerCase()}__${profile.className.toLowerCase()}`;
    allSaved[key] = {
      ...progress,
      fullName: profile.fullName,
      className: profile.className,
      internalPlayerId: profile.internalPlayerId,
      updatedAt: new Date().toISOString(),
    };
    StorageService.set(STORAGE_KEYS.PLAYER_PROGRESS, allSaved);
  }

  static recordRunResult(profile, run) {
    const current = this.getPlayerProgress(profile);
    const previousHighScore = current.highScore;
    const cleanScore = Math.max(0, Math.floor(run.finalScore));
    const isNewHighScore = cleanScore > previousHighScore;

    const mergedMilestones = Array.from(
      new Set([...current.passedMilestoneIds, ...run.milestonesPassedInRun])
    );

    const updatedModeHighScores = {
      ...current.modeHighScores,
      [run.mode]: Math.max(current.modeHighScores[run.mode] || 0, cleanScore),
    };

    const updatedProgress = {
      ...current,
      highScore: Math.max(current.highScore, cleanScore),
      lastScore: cleanScore,
      lastMode: run.mode,
      gamesPlayed: current.gamesPlayed + 1,
      totalCorrectAnswers:
        current.totalCorrectAnswers + Math.max(0, run.correctAnswers),
      totalQuestionsAnswered:
        current.totalQuestionsAnswered + Math.max(0, run.totalQuestions),
      milestonesPassedCount:
        current.milestonesPassedCount + run.milestonesPassedInRun.length,
      passedMilestoneIds: mergedMilestones,
      modeHighScores: updatedModeHighScores,
      updatedAt: new Date().toISOString(),
    };

    this.savePlayerProgress(profile, updatedProgress);

    return {
      updatedProgress,
      isNewHighScore,
      previousHighScore,
    };
  }
}
