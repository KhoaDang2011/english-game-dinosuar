import { MILESTONE_CONFIGS } from '../../data/config/game-config.js';
import { QuestionController } from './question-controller.js';

export class MilestoneManager {
  constructor() {
    this.processedTriggerKeys = new Set();
    this.notifiedApproachingThresholds = new Set();
  }

  reset() {
    this.processedTriggerKeys.clear();
    this.notifiedApproachingThresholds.clear();
  }

  getProcessedKeys() {
    return Array.from(this.processedTriggerKeys);
  }

  static getNextMilestoneProgress(rawScore) {
    const currentScore = Math.max(0, Math.floor(rawScore));

    const fixedMilestones = MILESTONE_CONFIGS.filter(
      (m) => !m.isRecurringFromThreshold
    ).sort((a, b) => a.scoreThreshold - b.scoreThreshold);

    let prevThreshold = 0;

    for (const cfg of fixedMilestones) {
      if (currentScore < cfg.scoreThreshold) {
        const span = Math.max(1, cfg.scoreThreshold - prevThreshold);
        const gainedInSpan = Math.max(0, currentScore - prevThreshold);
        const progressPercent = Math.min(
          99,
          Math.floor((gainedInSpan / span) * 100)
        );
        const pointsRemaining = cfg.scoreThreshold - currentScore;
        const isApproaching = progressPercent >= 65 || pointsRemaining <= 35;

        return {
          config: cfg,
          prevThreshold,
          nextThreshold: cfg.scoreThreshold,
          currentScore,
          pointsRemaining,
          progressPercent,
          isApproaching,
          motivationMessage:
            pointsRemaining <= 35
              ? `Chỉ còn ${pointsRemaining} điểm nữa là chạm mốc ${cfg.scoreThreshold} điểm (+${cfg.bonusPoints} điểm thưởng)! Hãy tiếp tục ôn luyện nhé!`
              : `Đã đạt ${progressPercent}% chặng đường tới mốc ${cfg.scoreThreshold} điểm (còn ${pointsRemaining} điểm để mở thử thách +${cfg.bonusPoints} điểm).`,
        };
      }
      prevThreshold = cfg.scoreThreshold;
    }

    const recurringCfg =
      MILESTONE_CONFIGS.find((m) => m.isRecurringFromThreshold) ||
      MILESTONE_CONFIGS[MILESTONE_CONFIGS.length - 1];
    const step = recurringCfg.recurringStep || 1000;

    let nextThreshold = recurringCfg.scoreThreshold;
    if (currentScore >= recurringCfg.scoreThreshold) {
      const stepsPassed = Math.floor(
        (currentScore - recurringCfg.scoreThreshold) / step
      );
      prevThreshold = recurringCfg.scoreThreshold + stepsPassed * step;
      nextThreshold = prevThreshold + step;
    }

    const span = Math.max(1, nextThreshold - prevThreshold);
    const gainedInSpan = Math.max(0, currentScore - prevThreshold);
    const progressPercent = Math.min(
      99,
      Math.floor((gainedInSpan / span) * 100)
    );
    const pointsRemaining = nextThreshold - currentScore;
    const isApproaching = progressPercent >= 70 || pointsRemaining <= 120;

    return {
      config: recurringCfg,
      prevThreshold,
      nextThreshold,
      currentScore,
      pointsRemaining,
      progressPercent,
      isApproaching,
      motivationMessage: `Còn ${pointsRemaining} điểm nữa là chinh phục Đại Cột mốc ${nextThreshold} điểm (+${recurringCfg.bonusPoints} điểm thưởng)!`,
    };
  }

  checkApproachingMilestoneToast(currentScore) {
    const info = MilestoneManager.getNextMilestoneProgress(currentScore);
    if (
      info.currentScore > 0 &&
      info.isApproaching &&
      !this.notifiedApproachingThresholds.has(info.nextThreshold)
    ) {
      this.notifiedApproachingThresholds.add(info.nextThreshold);
      return info;
    }
    return null;
  }

  checkPendingMilestone(currentScore) {
    const cleanScore = Math.floor(currentScore);

    for (const cfg of MILESTONE_CONFIGS) {
      if (!cfg.isRecurringFromThreshold) {
        if (cleanScore >= cfg.scoreThreshold) {
          const triggerKey = `${cfg.id}@${cfg.scoreThreshold}`;
          if (!this.processedTriggerKeys.has(triggerKey)) {
            this.processedTriggerKeys.add(triggerKey);
            return this.buildTriggerInstance(
              cfg,
              cfg.scoreThreshold,
              triggerKey
            );
          }
        }
      } else {
        const step = cfg.recurringStep || 1000;
        if (cleanScore >= cfg.scoreThreshold) {
          const highestReachedStep =
            cfg.scoreThreshold +
            Math.floor((cleanScore - cfg.scoreThreshold) / step) * step;

          for (
            let threshold = cfg.scoreThreshold;
            threshold <= highestReachedStep;
            threshold += step
          ) {
            const triggerKey = `${cfg.id}@${threshold}`;
            if (!this.processedTriggerKeys.has(triggerKey)) {
              this.processedTriggerKeys.add(triggerKey);
              return this.buildTriggerInstance(cfg, threshold, triggerKey);
            }
          }
        }
      }
    }

    return null;
  }

  buildTriggerInstance(config, exactThresholdScore, triggerKey) {
    const batch = QuestionController.getMilestoneQuestionBatch(
      config.id,
      config.questionCount
    );
    const totalActualQuestions = batch.questions.length;

    let requiredCorrectCount = 0;
    if (
      config.minCorrectOverride !== undefined &&
      totalActualQuestions === config.questionCount
    ) {
      requiredCorrectCount = config.minCorrectOverride;
    } else {
      requiredCorrectCount = Math.ceil(totalActualQuestions * config.passRatio);
    }

    return {
      triggerKey,
      config,
      exactThresholdScore,
      questions: batch.questions,
      requiredCorrectCount,
      warningMessage: batch.warningMessage,
      bonusClaimed: false,
    };
  }
}
