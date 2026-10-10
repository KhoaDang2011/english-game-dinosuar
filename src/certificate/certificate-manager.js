import { CERTIFICATE_REQUIREMENTS } from '../../data/config/game-config.js';
import { STORAGE_KEYS, StorageService } from '../services/storage-service.js';
import { generateInternalId } from '../utils/random.js';

export class CertificateManager {
  static checkEligibility(req, progress) {
    const scoreOk = progress.highScore >= req.minHighScore;
    const milestoneOk =
      progress.milestonesPassedCount >= req.minMilestoneCleared;
    const correctOk = progress.totalCorrectAnswers >= req.minTotalCorrect;

    const eligible = scoreOk && milestoneOk && correctOk;

    const parts = [
      `Điểm kỷ lục: ${Math.min(progress.highScore, req.minHighScore)}/${req.minHighScore}`,
    ];
    if (req.minMilestoneCleared > 0) {
      parts.push(
        `Cột mốc: ${Math.min(progress.milestonesPassedCount, req.minMilestoneCleared)}/${req.minMilestoneCleared}`
      );
    }
    if (req.minTotalCorrect > 0) {
      parts.push(
        `Câu đúng: ${Math.min(progress.totalCorrectAnswers, req.minTotalCorrect)}/${req.minTotalCorrect}`
      );
    }

    return {
      eligible,
      progressSummary: parts.join(' · '),
    };
  }

  static syncAndGetCertificates(profile, progress) {
    const allStored = StorageService.get(STORAGE_KEYS.CERTIFICATES, {});

    const playerKey = profile
      ? `${profile.fullName.toLowerCase()}__${profile.className.toLowerCase()}`
      : 'guest';

    const playerRecords = Array.isArray(allStored[playerKey])
      ? [...allStored[playerKey]]
      : [];

    let modified = false;

    const models = CERTIFICATE_REQUIREMENTS.map((req) => {
      const check = this.checkEligibility(req, progress);
      let existingRecord =
        playerRecords.find((r) => r.requirementId === req.id) || null;

      if (check.eligible && !existingRecord && profile) {
        existingRecord = {
          requirementId: req.id,
          certificateCode: generateInternalId('CERT10'),
          issuedAt: new Date().toISOString(),
          achievedScore: progress.highScore,
          fullName: profile.fullName,
          className: profile.className,
        };
        playerRecords.push(existingRecord);
        modified = true;
      } else if (
        existingRecord &&
        progress.highScore > existingRecord.achievedScore
      ) {
        existingRecord.achievedScore = progress.highScore;
        modified = true;
      }

      return {
        requirement: req,
        isEarned: Boolean(check.eligible || existingRecord),
        record: existingRecord,
        progressSummary: check.progressSummary,
      };
    });

    if (modified && profile) {
      allStored[playerKey] = playerRecords;
      StorageService.set(STORAGE_KEYS.CERTIFICATES, allStored);
    }

    return models;
  }
}
