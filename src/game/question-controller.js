import { FUTURE_QUESTIONS_01 } from '../../data/future-question-bank/questions-01.js';
import { FUTURE_QUESTIONS_02 } from '../../data/future-question-bank/questions-02.js';
import { FUTURE_QUESTIONS_03 } from '../../data/future-question-bank/questions-03.js';
import { FUTURE_QUESTIONS_04 } from '../../data/future-question-bank/questions-04.js';
import { FUTURE_QUESTIONS_05 } from '../../data/future-question-bank/questions-05.js';
import { GAMEPLAY_QUESTIONS } from '../../data/gameplay/gameplay-questions.js';
import { MILESTONE_100_QUESTIONS } from '../../data/milestones/milestone-100.js';
import { MILESTONE_500_QUESTIONS } from '../../data/milestones/milestone-500.js';
import { MILESTONE_1000_QUESTIONS } from '../../data/milestones/milestone-1000.js';
import { MILESTONE_2000_QUESTIONS } from '../../data/milestones/milestone-2000.js';
import { shuffleArray } from '../utils/random.js';
import { validateQuestionList } from '../utils/validators.js';

export class QuestionController {
  constructor() {
    this.gameplayPool = [];
    this.usedGameplayIndices = new Set();
    this.reloadGameplayPool();
  }

  reloadGameplayPool() {
    const mainReport = validateQuestionList(
      GAMEPLAY_QUESTIONS,
      'GAMEPLAY_QUESTIONS'
    );
    const futureReports = [
      validateQuestionList(FUTURE_QUESTIONS_01, 'questions-01'),
      validateQuestionList(FUTURE_QUESTIONS_02, 'questions-02'),
      validateQuestionList(FUTURE_QUESTIONS_03, 'questions-03'),
      validateQuestionList(FUTURE_QUESTIONS_04, 'questions-04'),
      validateQuestionList(FUTURE_QUESTIONS_05, 'questions-05'),
    ];

    const extraValid = futureReports.flatMap((r) => r.validQuestions);
    this.gameplayPool = shuffleArray([
      ...mainReport.validQuestions,
      ...extraValid,
    ]);
    this.usedGameplayIndices.clear();
  }

  getNextGameplayQuestion() {
    if (this.gameplayPool.length === 0) {
      return null;
    }

    if (this.usedGameplayIndices.size >= this.gameplayPool.length) {
      this.usedGameplayIndices.clear();
      this.gameplayPool = shuffleArray(this.gameplayPool);
    }

    let chosenIdx = 0;
    for (let i = 0; i < this.gameplayPool.length; i += 1) {
      if (!this.usedGameplayIndices.has(i)) {
        chosenIdx = i;
        break;
      }
    }

    this.usedGameplayIndices.add(chosenIdx);
    const raw = this.gameplayPool[chosenIdx];

    return {
      instanceId: `gq_${Date.now()}_${chosenIdx}`,
      question: raw,
      answered: false,
    };
  }

  static getMilestoneQuestionBatch(milestoneId, requestedCount) {
    let rawSource = [];
    let sourceLabel = milestoneId;

    switch (milestoneId) {
      case 'MILESTONE_100':
        rawSource = MILESTONE_100_QUESTIONS;
        sourceLabel = 'milestone-100';
        break;
      case 'MILESTONE_500':
        rawSource = MILESTONE_500_QUESTIONS;
        sourceLabel = 'milestone-500';
        break;
      case 'MILESTONE_1000':
        rawSource = MILESTONE_1000_QUESTIONS;
        sourceLabel = 'milestone-1000';
        break;
      case 'MILESTONE_2000_PLUS':
      default:
        rawSource = MILESTONE_2000_QUESTIONS;
        sourceLabel = 'milestone-2000';
        break;
    }

    const report = validateQuestionList(rawSource, sourceLabel);
    const shuffled = shuffleArray(report.validQuestions);

    if (shuffled.length === 0) {
      return {
        questions: [],
        warningMessage: `Ngân hàng câu hỏi phụ (${sourceLabel}) hiện chưa có dữ liệu hợp lệ.`,
      };
    }

    if (shuffled.length < requestedCount) {
      return {
        questions: shuffled,
        warningMessage: `Ngân hàng ${sourceLabel} hiện có ${shuffled.length}/${requestedCount} câu hỏi hợp lệ. Hệ thống tự động điều chỉnh theo số câu thực tế.`,
      };
    }

    return {
      questions: shuffled.slice(0, requestedCount),
      warningMessage: null,
    };
  }

  static getBankDiagnostics() {
    const gp = validateQuestionList(GAMEPLAY_QUESTIONS, 'gameplay');
    const m100 = validateQuestionList(MILESTONE_100_QUESTIONS, 'milestone-100');
    const m500 = validateQuestionList(MILESTONE_500_QUESTIONS, 'milestone-500');
    const m1000 = validateQuestionList(
      MILESTONE_1000_QUESTIONS,
      'milestone-1000'
    );
    const m2000 = validateQuestionList(
      MILESTONE_2000_QUESTIONS,
      'milestone-2000'
    );

    const futureFiles = [
      { file: 'questions-01.js', data: FUTURE_QUESTIONS_01 },
      { file: 'questions-02.js', data: FUTURE_QUESTIONS_02 },
      { file: 'questions-03.js', data: FUTURE_QUESTIONS_03 },
      { file: 'questions-04.js', data: FUTURE_QUESTIONS_04 },
      { file: 'questions-05.js', data: FUTURE_QUESTIONS_05 },
    ];

    return {
      gameplayValidCount: gp.validQuestions.length,
      milestoneCounts: {
        MILESTONE_100: m100.validQuestions.length,
        MILESTONE_500: m500.validQuestions.length,
        MILESTONE_1000: m1000.validQuestions.length,
        MILESTONE_2000_PLUS: m2000.validQuestions.length,
      },
      futureBankCounts: futureFiles.map((item) => {
        const rep = validateQuestionList(item.data, item.file);
        return {
          file: item.file,
          validCount: rep.validQuestions.length,
          invalidCount: rep.invalidCount,
        };
      }),
    };
  }
}
