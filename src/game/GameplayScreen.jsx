import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_MODES } from '../../data/config/game-config';
import { randomRange } from '../utils/random';
import { soundFX } from '../utils/sound';
import { CanvasRenderer } from './canvas-renderer';
import { MilestoneManager } from './milestone-manager';
import { QuestionController } from './question-controller';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 280;
const GROUND_Y = 232;
const DINO_X = 88;
const DINO_WIDTH = 52;
const DINO_HEIGHT = 56;
const QUESTION_TRIGGER_DISTANCE = 175;

export const GameplayScreen = ({
  modeId,
  skin,
  profile,
  onGameOver,
  onExitToMenu,
}) => {
  const modeConfig = GAME_MODES[modeId];
  const canvasRef = useRef(null);

  // React UI state synced from game engine
  const [subState, setSubState] = useState('RUNNING');
  const [displayScore, setDisplayScore] = useState(0);
  const [displaySpeed, setDisplaySpeed] = useState(modeConfig.baseSpeed);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [milestoneSession, setMilestoneSession] = useState(null);
  const [bannerNotice, setBannerNotice] = useState(null);
  const [milestoneProgressToast, setMilestoneProgressToast] = useState(null);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(() => soundFX.isEnabled());
  const [bgmEnabled, setBgmEnabled] = useState(() => soundFX.isBgmEnabled());

  useEffect(() => {
    if (soundFX.isBgmEnabled()) {
      soundFX.startBgm();
    }
  }, []);

  const handleToggleBgm = () => {
    const next = !bgmEnabled;
    soundFX.setBgmEnabled(next);
    setBgmEnabled(next);
    soundFX.playClick();
  };

  const handleToggleSfx = () => {
    const next = !sfxEnabled;
    soundFX.setEnabled(next);
    setSfxEnabled(next);
    if (next) {
      soundFX.playClick();
    }
  };

  // Mutable engine refs to avoid multiple RAF loops or stale closures
  const subStateRef = useRef('RUNNING');
  const scoreRef = useRef(0);
  const speedRef = useRef(modeConfig.baseSpeed);
  const survivalSecondsRef = useRef(0);
  const correctAnswersRef = useRef(0);
  const totalQuestionsRef = useRef(0);
  const passedMilestonesInRunRef = useRef([]);
  const gameEndedRef = useRef(false);

  const dinoYRef = useRef(GROUND_Y - DINO_HEIGHT);
  const dinoVyRef = useRef(0);
  const isJumpingRef = useRef(false);
  const isCollidedRef = useRef(false);
  const legPhaseRef = useRef(0);
  const groundOffsetRef = useRef(0);

  const obstaclesRef = useRef([]);
  const nextObstacleDistanceRef = useRef(360);
  const cloudsRef = useRef([
    { x: 140, y: 42, width: 68, speedFactor: 0.18 },
    { x: 420, y: 68, width: 88, speedFactor: 0.14 },
    { x: 720, y: 36, width: 60, speedFactor: 0.22 },
  ]);
  const particlesRef = useRef([]);

  const questionControllerRef = useRef(new QuestionController());
  const milestoneManagerRef = useRef(new MilestoneManager());
  const activeQuestionRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const crashTimerRef = useRef(null);
  const progressToastTimerRef = useRef(null);

  const triggerApproachingToastIfAny = useCallback((currentScoreVal) => {
    const approaching =
      milestoneManagerRef.current.checkApproachingMilestoneToast(
        currentScoreVal
      );
    if (approaching) {
      setMilestoneProgressToast(approaching);
      if (progressToastTimerRef.current !== null) {
        window.clearTimeout(progressToastTimerRef.current);
      }
      progressToastTimerRef.current = window.setTimeout(() => {
        setMilestoneProgressToast(null);
      }, 4500);
    }
  }, []);

  const updateSubState = useCallback((next) => {
    subStateRef.current = next;
    setSubState(next);
  }, []);

  const clearTimers = useCallback(() => {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    if (crashTimerRef.current !== null) {
      window.clearTimeout(crashTimerRef.current);
      crashTimerRef.current = null;
    }
    if (progressToastTimerRef.current !== null) {
      window.clearTimeout(progressToastTimerRef.current);
      progressToastTimerRef.current = null;
    }
  }, []);

  const finishGameRun = useCallback(() => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;
    clearTimers();
    onGameOver({
      mode: modeId,
      finalScore: Math.floor(scoreRef.current),
      correctAnswers: correctAnswersRef.current,
      totalQuestions: totalQuestionsRef.current,
      milestonesPassedInRun: [...passedMilestonesInRunRef.current],
      survivalSeconds: Math.floor(survivalSecondsRef.current),
    });
  }, [clearTimers, modeId, onGameOver]);

  /**
   * Thực hiện nhảy tự do khi đang chạy (không nhảy kép khi đang ở trên không).
   */
  const triggerJump = useCallback(
    (boostFactor = 1) => {
      if (subStateRef.current !== 'RUNNING') return;
      if (isJumpingRef.current) return;

      isJumpingRef.current = true;
      dinoVyRef.current = modeConfig.jumpVelocity * boostFactor;
      soundFX.playJump();
    },
    [modeConfig.jumpVelocity]
  );

  /**
   * Kiểm tra xem điểm hiện tại có kích hoạt thử thách cột mốc (100, 500, 1000, 2000+) hay không.
   */
  const checkAndOpenMilestoneIfAny = useCallback(() => {
    if (gameEndedRef.current) return false;
    const pending = milestoneManagerRef.current.checkPendingMilestone(
      scoreRef.current
    );
    if (!pending) return false;

    setMilestoneSession({
      instance: pending,
      currentIndex: 0,
      correctCount: 0,
      wrongCount: 0,
      selectedOption: null,
      lastAnswerCorrect: null,
      bonusAwarded: false,
      passed: false,
    });
    updateSubState('MILESTONE_INTRO');
    return true;
  }, [updateSubState]);

  /**
   * Xử lý khi người chơi chọn đáp án cho câu hỏi vượt chướng ngại vật.
   */
  const handleObstacleAnswer = useCallback(
    (optionIndex) => {
      if (subStateRef.current !== 'QUESTION_ACTIVE') return;
      const currentQ = activeQuestionRef.current;
      if (!currentQ || currentQ.selectedOption !== null) return;

      const isCorrect = optionIndex === currentQ.question.c;
      totalQuestionsRef.current += 1;
      setTotalQuestionsCount(totalQuestionsRef.current);

      const updatedQ = {
        ...currentQ,
        selectedOption: optionIndex,
        isCorrect,
      };
      activeQuestionRef.current = updatedQ;
      setActiveQuestion(updatedQ);
      updateSubState('QUESTION_FEEDBACK');

      if (isCorrect) {
        soundFX.playCorrect();
        correctAnswersRef.current += 1;
        setCorrectCount(correctAnswersRef.current);

        // Cộng điểm trả lời đúng
        scoreRef.current += modeConfig.pointsPerCorrectAnswer;
        setDisplayScore(Math.floor(scoreRef.current));
        setBannerNotice(`+${modeConfig.pointsPerCorrectAnswer} điểm · Chính xác!`);

        feedbackTimerRef.current = window.setTimeout(() => {
          setBannerNotice(null);
          // Đánh dấu chướng ngại vật đã được vượt qua và kích hoạt khủng long nhảy vọt qua
          obstaclesRef.current = obstaclesRef.current.map((obs) =>
            obs.id === currentQ.obstacleId ? { ...obs, cleared: true } : obs
          );
          activeQuestionRef.current = null;
          setActiveQuestion(null);

          // Khủng long nhảy vượt chướng ngại vật
          isJumpingRef.current = true;
          dinoVyRef.current = modeConfig.jumpVelocity * 1.04;
          soundFX.playJump();

          // Kiểm tra nếu điểm mới cộng vừa chạm cột mốc hoặc sắp chạm cột mốc
          const openedMilestone = checkAndOpenMilestoneIfAny();
          if (!openedMilestone) {
            triggerApproachingToastIfAny(scoreRef.current);
            updateSubState('RUNNING');
          }
        }, 550);
      } else {
        soundFX.playWrong();
        setBannerNotice('Trả lời sai! Khủng long va vào chướng ngại vật.');

        feedbackTimerRef.current = window.setTimeout(() => {
          activeQuestionRef.current = null;
          setActiveQuestion(null);
          isCollidedRef.current = true;
          updateSubState('CRASHING');

          // Đưa chướng ngại vật sát vị trí va chạm để hiển thị trực quan trên Canvas
          obstaclesRef.current = obstaclesRef.current.map((obs) =>
            obs.id === currentQ.obstacleId
              ? { ...obs, x: DINO_X + DINO_WIDTH - 10 }
              : obs
          );

          crashTimerRef.current = window.setTimeout(() => {
            finishGameRun();
          }, 900);
        }, 1100);
      }
    },
    [
      checkAndOpenMilestoneIfAny,
      finishGameRun,
      modeConfig.jumpVelocity,
      modeConfig.pointsPerCorrectAnswer,
      triggerApproachingToastIfAny,
      updateSubState,
    ]
  );

  // Keyboard shortcuts for Jumping (Space / ArrowUp) and Answering (1, 2, 3, 4 / A, B, C, D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;

      if (subStateRef.current === 'RUNNING') {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          triggerJump();
        } else if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          updateSubState('PAUSED');
        }
      } else if (subStateRef.current === 'QUESTION_ACTIVE') {
        const keyMap = {
          Digit1: 0,
          Numpad1: 0,
          KeyA: 0,
          Digit2: 1,
          Numpad2: 1,
          KeyB: 1,
          Digit3: 2,
          Numpad3: 2,
          KeyC: 2,
          Digit4: 3,
          Numpad4: 3,
          KeyD: 3,
        };
        if (keyMap[e.code] !== undefined) {
          e.preventDefault();
          handleObstacleAnswer(keyMap[e.code]);
        }
      } else if (subStateRef.current === 'PAUSED') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          updateSubState('RUNNING');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleObstacleAnswer, triggerJump, updateSubState]);

  // Main requestAnimationFrame loop with strict cleanup
  useEffect(() => {
    let animationFrameId = null;
    let lastTimestamp = performance.now();

    const spawnObstacle = () => {
      const allowed = modeConfig.allowedObstacleTypes;
      const chosenType = allowed[Math.floor(Math.random() * allowed.length)];

      let width = 34;
      let height = 46;
      let y = GROUND_Y - height;

      if (chosenType === 'CACTUS_CLUSTER') {
        width = 54;
        height = 50;
        y = GROUND_Y - height;
      } else if (chosenType === 'ROCK_SPIKE') {
        width = 44;
        height = 40;
        y = GROUND_Y - height;
      } else if (chosenType === 'PTERODACTYL') {
        width = 48;
        height = 30;
        y = GROUND_Y - 58; // Bay ở tầm trung để bắt buộc phải nhảy/trả lời
      }

      const newObs = {
        id: `obs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: chosenType,
        x: CANVAS_WIDTH + 40,
        y,
        width,
        height,
        questionTriggered: false,
        cleared: false,
        wingPhase: 0,
      };

      obstaclesRef.current.push(newObs);
      nextObstacleDistanceRef.current = randomRange(
        modeConfig.obstacleMinGap,
        modeConfig.obstacleMaxGap
      );
    };

    const spawnTrailParticle = () => {
      if (skin.visual.trailStyle === 'NONE') return;
      if (Math.random() > 0.35) return;

      const colorMap = {
        DUST: '#64748b',
        SPARKS: '#f59e0b',
        SOLAR: '#fef08a',
        MATRIX: '#2dd4bf',
        ICE: '#7dd3fc',
        FLAME: '#fb923c',
        GALAXY: '#c084fc',
      };

      particlesRef.current.push({
        x: DINO_X + 6,
        y: dinoYRef.current + DINO_HEIGHT - 8,
        vx: -randomRange(60, 140),
        vy: -randomRange(10, 45),
        size:
          skin.visual.trailStyle === 'SOLAR' ||
          skin.visual.trailStyle === 'GALAXY'
            ? 5
            : 4,
        alpha: 0.85,
        color: colorMap[skin.visual.trailStyle] || '#94a3b8',
      });
    };

    const step = (now) => {
      const rawDt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;
      const dt = Math.min(rawDt, 0.05); // Clamp delta time when tab switches

      if (subStateRef.current === 'RUNNING' && !gameEndedRef.current) {
        // 1. Update survival time, speed & score
        survivalSecondsRef.current += dt;
        speedRef.current = Math.min(
          modeConfig.maxSpeed,
          speedRef.current + modeConfig.speedAcceleration * dt
        );
        scoreRef.current += modeConfig.pointsPerSecond * dt;

        setDisplayScore(Math.floor(scoreRef.current));
        setDisplaySpeed(Math.round(speedRef.current));

        // 2. Check Milestone Thresholds & Approaching Progress Toast
        const milestoneTriggered = checkAndOpenMilestoneIfAny();
        if (!milestoneTriggered) {
          triggerApproachingToastIfAny(scoreRef.current);
          // 3. Update Ground & Leg Animation
          groundOffsetRef.current += speedRef.current * dt;
          legPhaseRef.current += dt * (speedRef.current * 0.045);

          // 4. Update Dino Jump Physics
          if (isJumpingRef.current) {
            dinoYRef.current += dinoVyRef.current * dt;
            dinoVyRef.current += modeConfig.gravity * dt;

            if (dinoYRef.current >= GROUND_Y - DINO_HEIGHT) {
              dinoYRef.current = GROUND_Y - DINO_HEIGHT;
              dinoVyRef.current = 0;
              isJumpingRef.current = false;
            }
          } else {
            spawnTrailParticle();
          }

          // 5. Update Clouds
          cloudsRef.current.forEach((cloud) => {
            cloud.x -= speedRef.current * cloud.speedFactor * dt;
            if (cloud.x + cloud.width < 0) {
              cloud.x = CANVAS_WIDTH + randomRange(20, 100);
              cloud.y = randomRange(28, 84);
            }
          });

          // 6. Update Trail Particles
          particlesRef.current = particlesRef.current
            .map((p) => ({
              ...p,
              x: p.x + p.vx * dt,
              y: p.y + p.vy * dt,
              alpha: p.alpha - dt * 1.8,
            }))
            .filter((p) => p.alpha > 0.02);

          // 7. Spawn and Move Obstacles
          nextObstacleDistanceRef.current -= speedRef.current * dt;
          if (nextObstacleDistanceRef.current <= 0) {
            spawnObstacle();
          }

          for (const obs of obstaclesRef.current) {
            obs.x -= speedRef.current * dt;
            obs.wingPhase += dt * 10;

            // Khi chướng ngại vật tiến đến khoảng cách kích hoạt câu hỏi
            const distToDino = obs.x - (DINO_X + DINO_WIDTH);
            if (
              !obs.questionTriggered &&
              !obs.cleared &&
              distToDino <= QUESTION_TRIGGER_DISTANCE &&
              distToDino > -10
            ) {
              obs.questionTriggered = true;
              const qInstance =
                questionControllerRef.current.getNextGameplayQuestion();

              if (qInstance) {
                const newActiveQ = {
                  obstacleId: obs.id,
                  question: qInstance.question,
                  selectedOption: null,
                  isCorrect: null,
                  timeRemaining: modeConfig.questionTimeLimitSec,
                };
                activeQuestionRef.current = newActiveQ;
                setActiveQuestion(newActiveQ);
                updateSubState('QUESTION_ACTIVE');
                break;
              } else {
                // Nếu ngân hàng câu hỏi trống, cho phép nhảy tự động an toàn
                obs.cleared = true;
                triggerJump();
              }
            }

            // Kiểm tra va chạm vật lý nếu chướng ngại vật chưa cleared
            if (!obs.cleared) {
              const hitboxPadding = 8;
              const overlapX =
                DINO_X + DINO_WIDTH - hitboxPadding > obs.x + hitboxPadding &&
                DINO_X + hitboxPadding < obs.x + obs.width - hitboxPadding;
              const overlapY =
                dinoYRef.current + DINO_HEIGHT - hitboxPadding >
                  obs.y + hitboxPadding &&
                dinoYRef.current + hitboxPadding <
                  obs.y + obs.height - hitboxPadding;

              if (overlapX && overlapY) {
                isCollidedRef.current = true;
                soundFX.playWrong();
                updateSubState('CRASHING');
                crashTimerRef.current = window.setTimeout(() => {
                  finishGameRun();
                }, 800);
                break;
              }
            }
          }

          // Remove off-screen obstacles
          obstaclesRef.current = obstaclesRef.current.filter(
            (obs) => obs.x + obs.width > -40
          );
        }
      } else if (
        subStateRef.current === 'QUESTION_ACTIVE' &&
        activeQuestionRef.current &&
        !gameEndedRef.current
      ) {
        // Countdown timer for active obstacle question
        const nextTime = activeQuestionRef.current.timeRemaining - dt;
        if (nextTime <= 0) {
          // Hết thời gian trả lời -> tính như trả lời sai (-1)
          handleObstacleAnswer(-1);
        } else {
          activeQuestionRef.current = {
            ...activeQuestionRef.current,
            timeRemaining: nextTime,
          };
          setActiveQuestion({ ...activeQuestionRef.current });
        }
      }

      // Draw current frame on Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          CanvasRenderer.drawScene(ctx, {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            groundY: GROUND_Y,
            groundOffset: groundOffsetRef.current,
            dinoX: DINO_X,
            dinoY: dinoYRef.current,
            dinoWidth: DINO_WIDTH,
            dinoHeight: DINO_HEIGHT,
            isJumping: isJumpingRef.current,
            isCollided: isCollidedRef.current,
            legPhase: legPhaseRef.current,
            skin,
            obstacles: obstaclesRef.current,
            clouds: cloudsRef.current,
            particles: particlesRef.current,
            questionTargetObstacleId:
              activeQuestionRef.current?.obstacleId || null,
          });
        }
      }

      animationFrameId = window.requestAnimationFrame(step);
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      clearTimers();
    };
  }, [
    checkAndOpenMilestoneIfAny,
    clearTimers,
    finishGameRun,
    handleObstacleAnswer,
    modeConfig,
    skin,
    triggerApproachingToastIfAny,
    triggerJump,
    updateSubState,
  ]);

  /**
   * Xử lý trả lời từng câu hỏi phụ trong Thử thách Cột mốc.
   */
  const handleMilestoneAnswer = (optionIndex) => {
    if (!milestoneSession || subState !== 'MILESTONE_QUIZ') return;
    if (milestoneSession.selectedOption !== null) return;

    const currentQ =
      milestoneSession.instance.questions[milestoneSession.currentIndex];
    if (!currentQ) return;

    const isCorrect = optionIndex === currentQ.c;
    if (isCorrect) {
      soundFX.playCorrect();
    } else {
      soundFX.playWrong();
    }

    totalQuestionsRef.current += 1;
    setTotalQuestionsCount(totalQuestionsRef.current);
    if (isCorrect) {
      correctAnswersRef.current += 1;
      setCorrectCount(correctAnswersRef.current);
    }

    const updatedCorrect = milestoneSession.correctCount + (isCorrect ? 1 : 0);
    const updatedWrong = milestoneSession.wrongCount + (isCorrect ? 0 : 1);

    setMilestoneSession({
      ...milestoneSession,
      correctCount: updatedCorrect,
      wrongCount: updatedWrong,
      selectedOption: optionIndex,
      lastAnswerCorrect: isCorrect,
    });
  };

  const handleNextMilestoneQuestion = () => {
    if (!milestoneSession) return;
    const totalQ = milestoneSession.instance.questions.length;
    const nextIdx = milestoneSession.currentIndex + 1;

    if (nextIdx < totalQ) {
      setMilestoneSession({
        ...milestoneSession,
        currentIndex: nextIdx,
        selectedOption: null,
        lastAnswerCorrect: null,
      });
    } else {
      // Đã hoàn thành tất cả câu hỏi phụ của cột mốc -> kiểm tra điều kiện nhận thưởng
      const passed =
        milestoneSession.correctCount >=
        milestoneSession.instance.requiredCorrectCount;

      let bonusAwarded = false;
      if (
        passed &&
        !milestoneSession.bonusAwarded &&
        !milestoneSession.instance.bonusClaimed
      ) {
        milestoneSession.instance.bonusClaimed = true;
        bonusAwarded = true;
        scoreRef.current += milestoneSession.instance.config.bonusPoints;
        setDisplayScore(Math.floor(scoreRef.current));
        passedMilestonesInRunRef.current.push(
          milestoneSession.instance.config.id
        );
        soundFX.playMilestonePass();
      }

      setMilestoneSession({
        ...milestoneSession,
        passed,
        bonusAwarded,
      });
      updateSubState('MILESTONE_SUMMARY');
    }
  };

  const handleResumeFromMilestone = () => {
    setMilestoneSession(null);
    // Sau khi cộng thưởng cột mốc, kiểm tra xem điểm thưởng có kích hoạt mốc tiếp theo không
    const nextMilestoneOpened = checkAndOpenMilestoneIfAny();
    if (!nextMilestoneOpened) {
      updateSubState('RUNNING');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4">
      {/* Top Gameplay HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-slate-400">Người chơi: </span>
            <span className="font-semibold text-white">{profile.fullName}</span>
            <span className="text-slate-500 mx-1.5">·</span>
            <span className="text-emerald-400 font-medium">
              Lớp {profile.className}
            </span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="hidden sm:block text-slate-300">
            Chế độ:{' '}
            <span className="font-semibold text-white">{modeConfig.name}</span>
            <span className="text-slate-500 mx-1.5">·</span>
            Skin: <span className="text-amber-400 font-medium">{skin.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm font-mono-num">
            <div>
              <span className="text-slate-400 text-xs uppercase mr-1.5">
                Câu đúng
              </span>
              <span className="text-emerald-400 font-bold">
                {correctCount}/{totalQuestionsCount}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs uppercase mr-1.5">
                Tốc độ
              </span>
              <span className="text-slate-200 font-semibold">
                {displaySpeed}
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
              <span className="text-slate-400 text-xs uppercase mr-2">
                Điểm
              </span>
              <span className="text-xl font-bold text-amber-400">
                {displayScore}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleBgm}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                bgmEnabled
                  ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Bật/tắt Nhạc nền độc lập"
            >
              Nhạc nền: {bgmEnabled ? 'Bật' : 'Tắt'}
            </button>
            <button
              type="button"
              onClick={handleToggleSfx}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                sfxEnabled
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Bật/tắt Hiệu ứng âm thanh độc lập"
            >
              Hiệu ứng: {sfxEnabled ? 'Bật' : 'Tắt'}
            </button>
            {subState === 'RUNNING' && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  updateSubState('PAUSED');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Tạm dừng
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                if (subState === 'RUNNING') {
                  updateSubState('PAUSED');
                }
                setConfirmExitOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-950 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Thoát lượt
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport Container */}
      <div className="relative w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={() => {
            if (subState === 'RUNNING') {
              triggerJump();
            }
          }}
          className="w-full h-auto block cursor-pointer touch-manipulation"
        />

        {/* Non-blocking status notice inside top-left of canvas */}
        {bannerNotice && (
          <div className="absolute top-3 left-4 bg-slate-900/95 border border-slate-700 text-slate-100 px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-md pointer-events-none">
            {bannerNotice}
          </div>
        )}

        {/* Approaching Milestone Progress Toast inside Canvas top-center */}
        {milestoneProgressToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-md bg-slate-900/95 border border-amber-400/80 rounded-xl px-4 py-2.5 shadow-xl pointer-events-none space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-num">
              <span className="font-bold text-amber-300 uppercase">
                Sắp đạt mốc {milestoneProgressToast.nextThreshold} điểm!
              </span>
              <span className="text-emerald-400 font-semibold">
                Thưởng +{milestoneProgressToast.config.bonusPoints} đ
              </span>
            </div>
            <p className="text-xs text-slate-200">
              Chỉ còn{' '}
              <strong className="text-amber-300 font-mono-num">
                {Math.max(
                  1,
                  milestoneProgressToast.nextThreshold - displayScore
                )}{' '}
                điểm
              </strong>{' '}
              nữa là mở khóa thử thách cột mốc. Cố lên!
            </p>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-200"
                style={{
                  width: `${
                    MilestoneManager.getNextMilestoneProgress(displayScore)
                      .progressPercent
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Next Milestone Live Progress Indicator */}
        {(() => {
          const liveMilestone =
            MilestoneManager.getNextMilestoneProgress(displayScore);
          return (
            <div className="absolute top-3 right-4 bg-slate-900/85 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono-num pointer-events-none space-y-1">
              <div className="flex items-center gap-2">
                <span>Mốc tiếp: {liveMilestone.nextThreshold} đ</span>
                <span className="text-amber-400 font-bold">
                  ({liveMilestone.progressPercent}%)
                </span>
              </div>
              <div className="w-28 h-1 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-200"
                  style={{ width: `${liveMilestone.progressPercent}%` }}
                />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Interactive Controls / Active Obstacle Question Panel Below Canvas (Never blocks Dino character!) */}
      <div className="min-h-[210px] flex flex-col justify-center">
        {subState === 'RUNNING' && (
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-slate-200">
                Đang chạy vượt chướng ngại vật — Hãy sẵn sàng trả lời câu hỏi
                Tiếng Anh 10!
              </p>
              <p className="text-xs text-slate-400">
                Nhấn phím{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">
                  Space
                </kbd>
                ,{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">
                  ↑
                </kbd>{' '}
                hoặc chạm nút Nhảy bên phải. Khi câu hỏi xuất hiện, chọn đáp án
                đúng để khủng long phóng qua chướng ngại vật.
              </p>
            </div>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                triggerJump();
              }}
              className="w-full sm:w-auto min-w-[160px] py-4 px-8 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-display font-bold text-base rounded-xl shadow-lg transition-transform whitespace-nowrap shrink-0 cursor-pointer"
            >
              NHẢY LÊN (SPACE)
            </button>
          </div>
        )}

        {(subState === 'QUESTION_ACTIVE' || subState === 'QUESTION_FEEDBACK') &&
          activeQuestion && (
            <div className="bg-slate-900 border-2 border-amber-500/70 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Chướng ngại vật phía trước — Trả lời để nhảy qua
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono-num text-sm">
                  <span className="text-slate-400">Thời gian:</span>
                  <span
                    className={`font-bold ${
                      activeQuestion.timeRemaining <= 3
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {Math.ceil(activeQuestion.timeRemaining)}s
                  </span>
                </div>
              </div>

              <p className="text-base sm:text-lg font-semibold text-white leading-snug">
                {activeQuestion.question.q}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeQuestion.question.a.map((opt, idx) => {
                  const labels = ['A', 'B', 'C', 'D'];
                  const isSelected = activeQuestion.selectedOption === idx;
                  const isCorrectOption = idx === activeQuestion.question.c;
                  const showFeedback = subState === 'QUESTION_FEEDBACK';

                  let btnClass =
                    'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-100';
                  if (showFeedback) {
                    if (isCorrectOption) {
                      btnClass =
                        'bg-emerald-950/90 border-emerald-500 text-emerald-200';
                    } else if (isSelected && !isCorrectOption) {
                      btnClass = 'bg-rose-950/90 border-rose-500 text-rose-200';
                    } else {
                      btnClass =
                        'bg-slate-950/50 border-slate-800 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={showFeedback}
                      onClick={() => handleObstacleAnswer(idx)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm sm:text-base font-medium transition-colors flex items-center justify-between gap-3 cursor-pointer ${btnClass}`}
                    >
                      <span>
                        <strong className="font-mono-num mr-2 text-amber-400">
                          {labels[idx]}.
                        </strong>
                        {opt}
                      </span>
                      {showFeedback && isCorrectOption && (
                        <span className="text-xs font-bold text-emerald-400 whitespace-nowrap shrink-0">
                          Đáp án đúng
                        </span>
                      )}
                      {showFeedback && isSelected && !isCorrectOption && (
                        <span className="text-xs font-bold text-rose-400 whitespace-nowrap shrink-0">
                          Đã chọn sai
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {subState === 'CRASHING' && (
          <div className="bg-rose-950/50 border border-rose-500/60 rounded-2xl p-5 text-center space-y-1">
            <p className="text-base font-bold text-rose-300">
              Khủng long đã va vào chướng ngại vật!
            </p>
            <p className="text-xs text-rose-200/80">
              Đang tổng hợp kết quả lượt chơi và cập nhật bảng xếp hạng...
            </p>
          </div>
        )}
      </div>

      {/* Milestone Challenge Modal (100 / 500 / 1000 / 2000+ points) */}
      {(subState === 'MILESTONE_INTRO' ||
        subState === 'MILESTONE_QUIZ' ||
        subState === 'MILESTONE_SUMMARY') &&
        milestoneSession && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
              {subState === 'MILESTONE_INTRO' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Cột mốc điểm{' '}
                      {milestoneSession.instance.exactThresholdScore}
                    </p>
                    <h2 className="text-2xl font-display font-bold text-white">
                      {milestoneSession.instance.config.title}
                    </h2>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {milestoneSession.instance.config.description}
                  </p>

                  {milestoneSession.instance.warningMessage && (
                    <p className="text-xs text-amber-300 bg-amber-950/50 border border-amber-700/50 rounded-lg px-3 py-2">
                      {milestoneSession.instance.warningMessage}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-3 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono-num text-center">
                    <div>
                      <div className="text-xs text-slate-400">
                        Số câu hỏi phụ
                      </div>
                      <div className="text-lg font-bold text-white">
                        {milestoneSession.instance.questions.length} câu
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Yêu cầu đạt</div>
                      <div className="text-lg font-bold text-emerald-400">
                        {milestoneSession.instance.requiredCorrectCount}/
                        {milestoneSession.instance.questions.length} câu đúng
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Phần thưởng</div>
                      <div className="text-lg font-bold text-amber-400">
                        +{milestoneSession.instance.config.bonusPoints} điểm
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        if (milestoneSession.instance.questions.length === 0) {
                          handleResumeFromMilestone();
                        } else {
                          updateSubState('MILESTONE_QUIZ');
                        }
                      }}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                    >
                      Bắt đầu Thử thách Cột mốc
                    </button>
                  </div>
                </div>
              )}

              {subState === 'MILESTONE_QUIZ' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono-num text-slate-400 border-b border-slate-800 pb-3">
                    <span>
                      {milestoneSession.instance.config.title} · Câu{' '}
                      <strong className="text-white">
                        {milestoneSession.currentIndex + 1}/
                        {milestoneSession.instance.questions.length}
                      </strong>
                    </span>
                    <span>
                      Đúng:{' '}
                      <strong className="text-emerald-400">
                        {milestoneSession.correctCount}
                      </strong>{' '}
                      · Sai:{' '}
                      <strong className="text-rose-400">
                        {milestoneSession.wrongCount}
                      </strong>{' '}
                      · Cần đạt:{' '}
                      <strong className="text-amber-400">
                        {milestoneSession.instance.requiredCorrectCount}
                      </strong>
                    </span>
                  </div>

                  <p className="text-base sm:text-lg font-semibold text-white">
                    {
                      milestoneSession.instance.questions[
                        milestoneSession.currentIndex
                      ]?.q
                    }
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {milestoneSession.instance.questions[
                      milestoneSession.currentIndex
                    ]?.a.map((opt, idx) => {
                      const labels = ['A', 'B', 'C', 'D'];
                      const answered =
                        milestoneSession.selectedOption !== null;
                      const isCorrectOpt =
                        idx ===
                        milestoneSession.instance.questions[
                          milestoneSession.currentIndex
                        ]?.c;
                      const isPicked = milestoneSession.selectedOption === idx;

                      let style =
                        'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-100';
                      if (answered) {
                        if (isCorrectOpt) {
                          style =
                            'bg-emerald-950/90 border-emerald-500 text-emerald-200';
                        } else if (isPicked) {
                          style =
                            'bg-rose-950/90 border-rose-500 text-rose-200';
                        } else {
                          style =
                            'bg-slate-950/40 border-slate-800 text-slate-500';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={answered}
                          onClick={() => handleMilestoneAnswer(idx)}
                          className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-between gap-2 cursor-pointer ${style}`}
                        >
                          <span>
                            <strong className="font-mono-num mr-2 text-amber-400">
                              {labels[idx]}.
                            </strong>
                            {opt}
                          </span>
                          {answered && isCorrectOpt && (
                            <span className="text-xs font-bold text-emerald-400">
                              Đúng
                            </span>
                          )}
                          {answered && isPicked && !isCorrectOpt && (
                            <span className="text-xs font-bold text-rose-400">
                              Sai
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {milestoneSession.selectedOption !== null && (
                    <div className="flex items-center justify-between pt-2">
                      <span
                        className={`text-sm font-semibold ${
                          milestoneSession.lastAnswerCorrect
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {milestoneSession.lastAnswerCorrect
                          ? 'Chính xác! Tiếp tục phát huy.'
                          : 'Chưa chính xác. Hãy lưu ý cấu trúc câu này nhé.'}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextMilestoneQuestion}
                        className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                      >
                        {milestoneSession.currentIndex + 1 <
                        milestoneSession.instance.questions.length
                          ? 'Câu tiếp theo'
                          : 'Xem kết quả cột mốc'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {subState === 'MILESTONE_SUMMARY' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Kết quả Thử thách Cột mốc
                    </p>
                    <h3 className="text-2xl font-display font-bold text-white">
                      {milestoneSession.passed
                        ? `Chúc mừng! Bạn nhận được +${milestoneSession.instance.config.bonusPoints} điểm thưởng`
                        : 'Hoàn thành thử thách cột mốc'}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300">
                    {milestoneSession.passed
                      ? `Bạn đã trả lời đúng ${milestoneSession.correctCount}/${milestoneSession.instance.questions.length} câu (đạt chuẩn yêu cầu ${milestoneSession.instance.requiredCorrectCount} câu đúng). Điểm thưởng đã được cộng vào lượt chơi.`
                      : `Bạn trả lời đúng ${milestoneSession.correctCount}/${milestoneSession.instance.questions.length} câu (cần tối thiểu ${milestoneSession.instance.requiredCorrectCount} câu đúng để nhận thưởng). Không sao cả, cuộc đua của bạn vẫn tiếp tục!`}
                  </p>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleResumeFromMilestone}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                    >
                      Tiếp tục cuộc đua
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Pause Modal */}
      {subState === 'PAUSED' && !confirmExitOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-center">
            <h3 className="text-xl font-display font-bold text-white">
              Trò chơi đang tạm dừng
            </h3>
            <p className="text-sm text-slate-400">
              Điểm hiện tại của bạn:{' '}
              <strong className="text-amber-400 font-mono-num">
                {displayScore}
              </strong>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 py-1">
              <button
                type="button"
                onClick={handleToggleBgm}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Nhạc nền: {bgmEnabled ? 'Đang Bật' : 'Đang Tắt'}
              </button>
              <button
                type="button"
                onClick={handleToggleSfx}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Hiệu ứng: {sfxEnabled ? 'Đang Bật' : 'Đang Tắt'}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  updateSubState('RUNNING');
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Tiếp tục chơi
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setConfirmExitOpen(true);
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Kết thúc & Lưu điểm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Exit Modal */}
      {confirmExitOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-display font-bold text-white">
              Xác nhận dừng lượt chơi?
            </h3>
            <p className="text-sm text-slate-300">
              Bạn có muốn ghi nhận điểm số hiện tại ({displayScore} điểm) hay
              thoát trực tiếp về Menu chính?
            </p>
            <div className="flex flex-wrap justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmExitOpen(false);
                  updateSubState('RUNNING');
                }}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
              >
                Chơi tiếp
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmExitOpen(false);
                  finishGameRun();
                }}
                className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer"
              >
                Lưu điểm & Kết thúc
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmExitOpen(false);
                  clearTimers();
                  onExitToMenu();
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-lg cursor-pointer"
              >
                Về Menu chính
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
