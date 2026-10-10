import React, { useCallback, useEffect, useState } from 'react';
import {
  GAME_MODES,
  MILESTONE_CONFIGS,
} from '../data/config/game-config';
import { SKIN_DEFINITIONS } from '../data/skins/skins';
import { AuthService } from './auth/auth-service';
import { LoginScreen } from './auth/LoginScreen';
import { CertificateScreen } from './certificate/CertificateScreen';
import { canTransitionScreen } from './core/state-manager';
import { GameplayScreen } from './game/GameplayScreen';
import { MilestoneManager } from './game/milestone-manager';
import { QuestionController } from './game/question-controller';
import { LeaderboardScreen } from './leaderboard/LeaderboardScreen';
import { ApiClient } from './services/api-client';
import { ScoreService } from './services/score-service';
import { DinoAvatar } from './skins/DinoAvatar';
import { SkinManager } from './skins/skin-manager';
import { SkinCollectionScreen } from './skins/SkinCollectionScreen';
import { soundFX } from './utils/sound';

export default function App() {
  const [screen, setScreen] = useState('INTRO');
  const [profile, setProfile] = useState(() =>
    AuthService.getCurrentProfile()
  );
  const [progress, setProgress] = useState(() =>
    ScoreService.getPlayerProgress(AuthService.getCurrentProfile())
  );
  const [selectedMode, setSelectedMode] = useState('BASIC');
  const [equippedSkin, setEquippedSkin] = useState(() => {
    const initialProf = AuthService.getCurrentProfile();
    const initialProg = ScoreService.getPlayerProgress(initialProf);
    return SkinManager.getEquippedSkin(initialProf, initialProg);
  });
  const [lastRunSummary, setLastRunSummary] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() =>
    soundFX.isEnabled()
  );
  const [bgmEnabled, setBgmEnabled] = useState(() =>
    soundFX.isBgmEnabled()
  );
  const [toastMessage, setToastMessage] = useState(null);
  const [showMilestoneProgressToast, setShowMilestoneProgressToast] =
    useState(true);

  // Sync progress and equipped skin whenever profile changes
  useEffect(() => {
    const updatedProg = ScoreService.getPlayerProgress(profile);
    setProgress(updatedProg);
    setEquippedSkin(SkinManager.getEquippedSkin(profile, updatedProg));
  }, [profile]);

  // Sync local audio state and re-enable milestone progress toast when returning to MAIN_MENU
  useEffect(() => {
    setSoundEnabled(soundFX.isEnabled());
    setBgmEnabled(soundFX.isBgmEnabled());
    if (screen === 'MAIN_MENU') {
      setShowMilestoneProgressToast(true);
    }
  }, [screen]);

  const navigateTo = useCallback(
    (target) => {
      if (soundFX.isBgmEnabled()) {
        soundFX.startBgm();
      }
      if (canTransitionScreen(screen, target)) {
        setScreen(target);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setScreen(target);
      }
    },
    [screen]
  );

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4200);
  }, []);

  const handleLoginSuccess = (loggedInProfile) => {
    setProfile(loggedInProfile);
    const loadedProgress = ScoreService.getPlayerProgress(loggedInProfile);
    const { updatedProgress } = SkinManager.evaluateAndUnlockSkins(
      loggedInProfile,
      loadedProgress
    );
    setProgress(updatedProgress);
    setEquippedSkin(SkinManager.getEquippedSkin(loggedInProfile, updatedProgress));
    navigateTo('MAIN_MENU');
  };

  const handleLogout = () => {
    soundFX.playClick();
    AuthService.logout();
    setScreen('LOGIN');
  };

  const handleGameOver = async (runResult) => {
    if (!profile) {
      navigateTo('LOGIN');
      return;
    }

    const submission = await ApiClient.submitScore(profile, runResult);
    setProgress(submission.updatedProgress);
    setEquippedSkin(
      SkinManager.getEquippedSkin(profile, submission.updatedProgress)
    );
    setLastRunSummary({ run: runResult, submission });

    if (submission.enteredTop3 && submission.playerRank !== null) {
      showToast(
        `Chúc mừng ${profile.fullName} (Lớp ${profile.className}) đã vươn lên Top ${submission.playerRank} Bảng xếp hạng cục bộ!`
      );
    } else if (submission.newlyUnlockedSkins.length > 0) {
      showToast(
        `Mở khóa thành công ${submission.newlyUnlockedSkins.length} skin mới: ${submission.newlyUnlockedSkins
          .map((s) => s.name)
          .join(', ')}!`
      );
    }

    navigateTo('GAME_OVER');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    soundFX.setEnabled(next);
    setSoundEnabled(next);
    if (next) {
      soundFX.playClick();
    }
  };

  const toggleBgm = () => {
    const next = !bgmEnabled;
    soundFX.setBgmEnabled(next);
    setBgmEnabled(next);
    soundFX.playClick();
  };

  const allSkinsStatus = SkinManager.getAllSkinsWithStatus(profile, progress);
  const unlockedSkinCount = allSkinsStatus.filter((s) => s.isUnlocked).length;
  const nextLockedSkin = allSkinsStatus.find((s) => !s.isUnlocked);
  const bankDiagnostics = QuestionController.getBankDiagnostics();
  const menuMilestoneProgress = MilestoneManager.getNextMilestoneProgress(
    progress.highScore
  );

  const showTopHeader =
    profile !== null &&
    screen !== 'INTRO' &&
    screen !== 'LOGIN' &&
    screen !== 'PLAYING';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar Contract (3 zones separated by gap-8: Brand wordmark — Nav links — 1 Primary Action) */}
      {showTopHeader && (
        <header className="no-print flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800/90 bg-slate-950/95 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              navigateTo('MAIN_MENU');
            }}
            className="text-lg font-display font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            English Game Dinosaur
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                navigateTo('MAIN_MENU');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                screen === 'MAIN_MENU' ? 'text-white underline underline-offset-4' : ''
              }`}
            >
              Menu chính
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                navigateTo('MODE_SELECT');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                screen === 'MODE_SELECT' || screen === 'HOW_TO_PLAY'
                  ? 'text-white underline underline-offset-4'
                  : ''
              }`}
            >
              Chế độ chơi
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                navigateTo('SKIN_COLLECTION');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                screen === 'SKIN_COLLECTION'
                  ? 'text-white underline underline-offset-4'
                  : ''
              }`}
            >
              Bộ sưu tập Skin
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                navigateTo('LEADERBOARD');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                screen === 'LEADERBOARD' ? 'text-white underline underline-offset-4' : ''
              }`}
            >
              Bảng xếp hạng
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                navigateTo('CERTIFICATE');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                screen === 'CERTIFICATE' ? 'text-white underline underline-offset-4' : ''
              }`}
            >
              Chứng chỉ
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                navigateTo('MODE_SELECT');
              }}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Bắt đầu chơi
            </button>
          </div>
        </header>
      )}

      {/* Non-blocking Achievement Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 border border-emerald-500 text-slate-100 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center justify-between gap-3">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Milestone Progress Toast on Main Screen */}
      {screen === 'MAIN_MENU' &&
        profile &&
        showMilestoneProgressToast &&
        !toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-40 w-[calc(100%-2.5rem)] max-w-md bg-slate-900/95 border border-amber-400/80 rounded-2xl p-4 shadow-2xl space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono-num font-bold uppercase tracking-wider text-amber-400">
                {menuMilestoneProgress.isApproaching
                  ? `Sắp đạt Cột mốc ${menuMilestoneProgress.nextThreshold} Điểm!`
                  : `Tiến độ Cột mốc ${menuMilestoneProgress.nextThreshold} Điểm`}
              </span>
              <button
                type="button"
                onClick={() => setShowMilestoneProgressToast(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Ẩn
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {menuMilestoneProgress.motivationMessage}
            </p>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono-num">
                <span className="text-slate-400">
                  Kỷ lục: {menuMilestoneProgress.currentScore} /{' '}
                  {menuMilestoneProgress.nextThreshold} điểm
                </span>
                <span className="text-emerald-400 font-bold">
                  {menuMilestoneProgress.progressPercent}% · Thưởng +
                  {menuMilestoneProgress.config.bonusPoints} đ
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{
                    width: `${Math.max(6, menuMilestoneProgress.progressPercent)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">
                Thử thách: {menuMilestoneProgress.config.questionCount} câu Tiếng Anh 10
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowMilestoneProgressToast(false);
                  navigateTo('HOW_TO_PLAY');
                }}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Ôn luyện ngay
              </button>
            </div>
          </div>
        )}

      {/* MAIN CONTENT VIEWPORT */}
      <main className="flex-1 flex flex-col justify-center">
        {/* 1. INTRO SCREEN */}
        {screen === 'INTRO' && (
          <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center space-y-8">
            <div className="mx-auto w-fit bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <DinoAvatar skin={equippedSkin || SKIN_DEFINITIONS[0]} size={120} animated />
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <p className="text-xs font-mono-num uppercase tracking-widest text-emerald-400">
                WEB GAME HỌC TẬP TƯƠNG TÁC · TIẾNG ANH 10 GLOBAL SUCCESS
              </p>
              <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
                English Game Dinosaur
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                Điều khiển chú khủng long vượt qua chướng ngại vật, chinh phục câu hỏi ngữ pháp & từ vựng Tiếng Anh lớp 10, vượt qua các cột mốc 100 · 500 · 1.000 · 2.000+ điểm và mở khóa bộ sưu tập Skin huyền thoại.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="text-sm font-display font-bold text-white">
                  01. Vượt chướng ngại vật
                </div>
                <p className="text-xs text-slate-400">
                  Kết hợp phản xạ nhảy qua xương rồng, đá nhọn, thằn lằn bay và giải nhanh câu hỏi Tiếng Anh 10.
                </p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="text-sm font-display font-bold text-white">
                  02. Thử thách Cột mốc
                </div>
                <p className="text-xs text-slate-400">
                  Nhận điểm thưởng lớn (+20 đến +500 điểm) khi hoàn thành ít nhất 80% câu hỏi phụ tại các mốc điểm.
                </p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="text-sm font-display font-bold text-white">
                  03. Mở khóa & Trang bị Skin
                </div>
                <p className="text-xs text-slate-400">
                  Sưu tầm 5 cấp độ Skin (Basic, Rare, Legendary, God, Secret) và nhận Chứng chỉ học tập.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  navigateTo('LOGIN');
                }}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-lg rounded-2xl shadow-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>
        )}

        {/* 2. LOGIN SCREEN (Strictly 2 fields: Họ và tên + Lớp) */}
        {screen === 'LOGIN' && (
          <LoginScreen
            initialProfile={profile}
            onLoginSuccess={handleLoginSuccess}
            onBackToIntro={() => navigateTo('INTRO')}
          />
        )}

        {/* 3. MAIN MENU SCREEN */}
        {screen === 'MAIN_MENU' && profile && (
          <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Hero Player Profile & Equipped Skin Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Player Dashboard Card */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">
                    Hồ sơ người chơi đang hoạt động · Lớp{' '}
                    <span className="text-emerald-400 font-semibold">
                      {profile.className}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-display font-bold text-white">
                    Xin chào, {profile.fullName}!
                  </h1>
                  <p className="text-sm text-slate-300">
                    Sẵn sàng bước vào đường chạy khủng long và ôn luyện Tiếng Anh lớp 10 Global Success.
                  </p>
                </div>

                {/* Key Personal Stats */}
                <div className="grid grid-cols-3 gap-3 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono-num">
                  <div>
                    <div className="text-xs text-slate-400">Điểm kỷ lục</div>
                    <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">
                      {progress.highScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Lượt gần nhất</div>
                    <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                      {progress.lastScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Câu đúng tích lũy</div>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">
                      {progress.totalCorrectAnswers}
                    </div>
                  </div>
                </div>

                {/* Next Milestone Motivation Progress Bar inside Main Menu Dashboard */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-num">
                    <span className="text-slate-300 font-semibold">
                      Mục tiêu tiếp theo: {menuMilestoneProgress.config.title} (
                      {menuMilestoneProgress.nextThreshold} điểm)
                    </span>
                    <span className="text-amber-400 font-bold">
                      Còn {menuMilestoneProgress.pointsRemaining} điểm · Thưởng +
                      {menuMilestoneProgress.config.bonusPoints} đ
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{
                        width: `${Math.max(4, menuMilestoneProgress.progressPercent)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    {menuMilestoneProgress.motivationMessage}
                  </p>
                </div>

                {/* Primary CTA Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      navigateTo('MODE_SELECT');
                    }}
                    className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-base rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Chơi Game ({GAME_MODES[selectedMode].name})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      navigateTo('HOW_TO_PLAY');
                    }}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Chơi nhanh chế độ {GAME_MODES[selectedMode].name}
                  </button>
                </div>
              </div>

              {/* Right Equipped Skin & Progress Card */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Skin đang trang bị</span>
                  <span className="font-mono-num text-emerald-400 font-semibold">
                    Đã mở khóa {unlockedSkinCount}/{allSkinsStatus.length} Skin
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                  <DinoAvatar skin={equippedSkin} size={84} animated />
                  <div className="space-y-1">
                    <div className="text-xs text-amber-400 font-semibold">
                      Cấp độ {equippedSkin.tier}
                    </div>
                    <div className="text-lg font-display font-bold text-white">
                      {equippedSkin.name}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {equippedSkin.description}
                    </p>
                  </div>
                </div>

                {nextLockedSkin ? (
                  <div className="space-y-1.5 text-xs bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>
                        Tiếp theo: <strong>{nextLockedSkin.skin.name}</strong> ({nextLockedSkin.skin.tier})
                      </span>
                      <span className="font-mono-num text-amber-400">
                        {nextLockedSkin.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${nextLockedSkin.progressPercent}%` }}
                      />
                    </div>
                    <div className="text-slate-400">
                      {nextLockedSkin.skin.unlockCondition.description}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3">
                    Bạn đã mở khóa toàn bộ tất cả các Skin trong bộ sưu tập!
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    navigateTo('SKIN_COLLECTION');
                  }}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                  Mở Bộ sưu tập & Trang bị Skin
                </button>
              </div>
            </div>

            {/* Menu Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  navigateTo('MODE_SELECT');
                }}
                className="text-left bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-5 space-y-2 transition-colors cursor-pointer"
              >
                <div className="text-xs font-mono-num text-emerald-400">
                  01 · CHẾ ĐỘ CHƠI
                </div>
                <h2 className="text-lg font-display font-bold text-white">
                  Chọn Chế độ ({GAME_MODES[selectedMode].name})
                </h2>
                <p className="text-xs text-slate-400">
                  Chuyển đổi giữa Basic, Medium và HardCore với tốc độ và áp lực thời gian khác biệt.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  navigateTo('SKIN_COLLECTION');
                }}
                className="text-left bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-5 space-y-2 transition-colors cursor-pointer"
              >
                <div className="text-xs font-mono-num text-amber-400">
                  02 · SKIN ({unlockedSkinCount}/{allSkinsStatus.length})
                </div>
                <h2 className="text-lg font-display font-bold text-white">
                  Skin & Bộ sưu tập
                </h2>
                <p className="text-xs text-slate-400">
                  Xem trước, mở khóa và trang bị 5 cấp độ Skin: Basic, Rare, Legendary, God và Secret.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  navigateTo('LEADERBOARD');
                }}
                className="text-left bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-5 space-y-2 transition-colors cursor-pointer"
              >
                <div className="text-xs font-mono-num text-sky-400">
                  03 · XẾP HẠNG
                </div>
                <h2 className="text-lg font-display font-bold text-white">
                  Bảng Xếp Hạng
                </h2>
                <p className="text-xs text-slate-400">
                  Theo dõi vị trí Top 1, Top 2, Top 3 và so tài điểm kỷ lục cùng các bạn học sinh khối 10.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  navigateTo('CERTIFICATE');
                }}
                className="text-left bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-5 space-y-2 transition-colors cursor-pointer"
              >
                <div className="text-xs font-mono-num text-violet-400">
                  04 · THÀNH TÍCH & CHỨNG CHỈ
                </div>
                <h2 className="text-lg font-display font-bold text-white">
                  Chứng chỉ Học tập
                </h2>
                <p className="text-xs text-slate-400">
                  Xem thống kê cá nhân chi tiết và nhận Chứng chỉ Tiếng Anh 10 khi đạt mốc điểm.
                </p>
              </button>
            </div>

            {/* Settings & Account Footer Strip */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
              <div className="space-y-0.5">
                <div className="text-slate-300 font-medium">
                  Ngân hàng câu hỏi Tiếng Anh 10 Global Success đã nạp:{' '}
                  <span className="font-mono-num text-emerald-400">
                    {bankDiagnostics.gameplayValidCount} câu Gameplay ·{' '}
                    {bankDiagnostics.milestoneCounts.MILESTONE_100 +
                      bankDiagnostics.milestoneCounts.MILESTONE_500 +
                      bankDiagnostics.milestoneCounts.MILESTONE_1000 +
                      bankDiagnostics.milestoneCounts.MILESTONE_2000_PLUS}{' '}
                    câu Cột mốc
                  </span>
                </div>
                <div>
                  5 tệp mở rộng tương lai (questions-01..05) đã sẵn sàng cấu trúc kiểm tra dữ liệu tự động.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={toggleBgm}
                  className={`px-3.5 py-2 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
                    bgmEnabled
                      ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-600/60'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                >
                  Nhạc nền: {bgmEnabled ? 'Đang Bật' : 'Đang Tắt'}
                </button>
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`px-3.5 py-2 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
                    soundEnabled
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                >
                  Hiệu ứng: {soundEnabled ? 'Đang Bật' : 'Đang Tắt'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-slate-800 font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Đổi Hồ sơ / Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. MODE SELECT SCREEN */}
        {screen === 'MODE_SELECT' && profile && (
          <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                  Chọn Chế độ Chơi
                </h1>
                <p className="text-sm text-slate-400">
                  Mỗi chế độ có tốc độ chạy, tần suất chướng ngại vật, giới hạn thời gian câu hỏi và mức điểm thưởng khác nhau.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  navigateTo('MAIN_MENU');
                }}
                className="px-4 py-2.5 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Quay lại Menu chính
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {['BASIC', 'MEDIUM', 'HARDCORE'].map((mId) => {
                const cfg = GAME_MODES[mId];
                const isSelected = selectedMode === mId;
                const modeBest = progress.modeHighScores[mId] || 0;

                return (
                  <div
                    key={mId}
                    className={`bg-slate-900 rounded-2xl p-6 flex flex-col justify-between gap-5 border transition-colors ${
                      isSelected
                        ? 'border-emerald-500'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-mono-num text-emerald-400 uppercase">
                          {cfg.tagline}
                        </div>
                        <h2 className="text-2xl font-display font-bold text-white mt-0.5">
                          {cfg.name}
                        </h2>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        {cfg.description}
                      </p>

                      <div className="space-y-2 pt-3 border-t border-slate-800 text-xs font-mono-num text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tốc độ chạy:</span>
                          <span>
                            {cfg.baseSpeed} → {cfg.maxSpeed} px/s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Thời gian trả lời:</span>
                          <span className="text-amber-400 font-semibold">
                            {cfg.questionTimeLimitSec} giây / câu
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Điểm mỗi câu đúng:</span>
                          <span className="text-emerald-400 font-semibold">
                            +{cfg.pointsPerCorrectAnswer} điểm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Kỷ lục chế độ này:</span>
                          <span className="text-white font-bold">
                            {modeBest} điểm
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setSelectedMode(mId);
                        navigateTo('HOW_TO_PLAY');
                      }}
                      className={`w-full py-3 px-4 rounded-xl font-display font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      Chọn {cfg.name} & Xem Hướng dẫn
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. HOW TO PLAY SCREEN */}
        {screen === 'HOW_TO_PLAY' && profile && (
          <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono-num text-emerald-400 uppercase">
                    CHUẨN BỊ XUẤT PHÁT · CHẾ ĐỘ {GAME_MODES[selectedMode].name.toUpperCase()}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-0.5">
                    Hướng dẫn Luật chơi & Cột mốc Thưởng
                  </h1>
                </div>
                <DinoAvatar skin={equippedSkin} size={68} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <h2 className="text-base font-display font-bold text-white">
                    1. Cơ chế điều khiển & Vượt chướng ngại vật
                  </h2>
                  <ul className="space-y-2 text-slate-300 list-disc list-inside">
                    <li>
                      Khủng long chạy tự động và điểm số tăng liên tục theo thời gian sống sót.
                    </li>
                    <li>
                      Nhấn phím <strong>Space</strong>, phím <strong>Mũi tên lên (↑)</strong> hoặc nút <strong>NHẢY LÊN</strong> trên màn hình để nhảy.
                    </li>
                    <li>
                      Khi tiếp cận chướng ngại vật, trò chơi tạm dừng chuyển động chướng ngại vật và hiển thị <strong>Câu hỏi Tiếng Anh 10</strong> ({GAME_MODES[selectedMode].questionTimeLimitSec} giây suy nghĩ).
                    </li>
                    <li>
                      <strong>Trả lời đúng:</strong> Cộng +{GAME_MODES[selectedMode].pointsPerCorrectAnswer} điểm và khủng long tự động phóng vọt qua chướng ngại vật.
                    </li>
                    <li>
                      <strong>Trả lời sai hoặc hết giờ:</strong> Khủng long va vào chướng ngại vật và kết thúc lượt chơi.
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h2 className="text-base font-display font-bold text-white">
                    2. Hệ thống Thử thách Cột mốc Điểm
                  </h2>
                  <p className="text-xs text-slate-400">
                    Khi chạm các cột mốc điểm dưới đây, trò chơi tạm dừng để mở bộ câu hỏi phụ:
                  </p>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-xs font-mono-num text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2 px-3">Mốc điểm</th>
                          <th className="py-2 px-3">Số câu phụ</th>
                          <th className="py-2 px-3">Điều kiện</th>
                          <th className="py-2 px-3 text-right">Thưởng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 text-slate-200">
                        {MILESTONE_CONFIGS.map((m) => (
                          <tr key={m.id}>
                            <td className="py-2 px-3 font-semibold">
                              {m.isRecurringFromThreshold
                                ? `${m.scoreThreshold}+`
                                : m.scoreThreshold}
                            </td>
                            <td className="py-2 px-3">{m.questionCount} câu</td>
                            <td className="py-2 px-3 text-emerald-400">
                              {m.minCorrectOverride
                                ? `≥ ${m.minCorrectOverride}/${m.questionCount}`
                                : `≥ ${Math.round(m.passRatio * 100)}%`}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-amber-400">
                              +{m.bonusPoints}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    navigateTo('MODE_SELECT');
                  }}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Đổi chế độ khác
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    navigateTo('PLAYING');
                  }}
                  className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-base rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  Bắt đầu Chạy Ngay ({GAME_MODES[selectedMode].name})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. PLAYING SCREEN */}
        {screen === 'PLAYING' && profile && (
          <GameplayScreen
            modeId={selectedMode}
            skin={equippedSkin}
            profile={profile}
            onGameOver={handleGameOver}
            onExitToMenu={() => navigateTo('MAIN_MENU')}
          />
        )}

        {/* 7. GAME OVER / RUN RESULT SCREEN */}
        {screen === 'GAME_OVER' && profile && lastRunSummary && (
          <div className="w-full max-w-3xl mx-auto px-4 py-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5 text-center sm:text-left">
                <div className="space-y-1">
                  <div className="text-xs font-mono-num uppercase text-amber-400">
                    KẾT QUẢ LƯỢT CHƠI · CHẾ ĐỘ {GAME_MODES[lastRunSummary.run.mode].name.toUpperCase()}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                    {lastRunSummary.submission.isNewHighScore
                      ? 'Kỷ lục Điểm Mới Xuất Sắc!'
                      : 'Hoàn thành Lượt Chơi'}
                  </h1>
                  <p className="text-sm text-slate-400">
                    Người chơi: <strong className="text-white">{profile.fullName}</strong> · Lớp{' '}
                    <strong className="text-emerald-400">{profile.className}</strong>
                  </p>
                </div>

                <DinoAvatar skin={equippedSkin} size={80} />
              </div>

              {/* Run Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-num">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-xs text-slate-400">Điểm đạt được</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    {lastRunSummary.run.finalScore}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-xs text-slate-400">Kỷ lục cá nhân</div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {lastRunSummary.submission.updatedProgress.highScore}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-xs text-slate-400">Câu trả lời đúng</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {lastRunSummary.run.correctAnswers}/{lastRunSummary.run.totalQuestions}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-xs text-slate-400">Hạng hiện tại</div>
                  <div className="text-2xl font-bold text-sky-400 mt-1">
                    {lastRunSummary.submission.playerRank
                      ? `Top ${lastRunSummary.submission.playerRank}`
                      : '--'}
                  </div>
                </div>
              </div>

              {/* Newly Unlocked Skins Banner if any */}
              {lastRunSummary.submission.newlyUnlockedSkins.length > 0 && (
                <div className="bg-emerald-950/50 border border-emerald-500/60 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold uppercase text-emerald-300">
                    Chúc mừng! Bạn vừa mở khóa Skin mới:
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">
                      {lastRunSummary.submission.newlyUnlockedSkins
                        .map((s) => `${s.name} (${s.tier})`)
                        .join(', ')}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        navigateTo('SKIN_COLLECTION');
                      }}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Đến Trang bị ngay
                    </button>
                  </div>
                </div>
              )}

              {/* Sync Notice */}
              <div className="text-xs text-slate-400 bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5">
                {lastRunSummary.submission.statusMessage}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      navigateTo('MAIN_MENU');
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Về Menu chính
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      navigateTo('MODE_SELECT');
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Chọn lại chế độ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      navigateTo('LEADERBOARD');
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Xem Bảng xếp hạng
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    navigateTo('PLAYING');
                  }}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Chơi lại ngay ({GAME_MODES[selectedMode].name})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. SKIN COLLECTION SCREEN */}
        {screen === 'SKIN_COLLECTION' && profile && (
          <SkinCollectionScreen
            profile={profile}
            progress={progress}
            equippedSkin={equippedSkin}
            onSkinEquipped={(newSkin) => setEquippedSkin(newSkin)}
            onProgressUpdated={(updatedProg) => setProgress(updatedProg)}
            onBackToMenu={() => navigateTo('MAIN_MENU')}
          />
        )}

        {/* 9. LEADERBOARD SCREEN */}
        {screen === 'LEADERBOARD' && profile && (
          <LeaderboardScreen
            profile={profile}
            onBackToMenu={() => navigateTo('MAIN_MENU')}
          />
        )}

        {/* 10. CERTIFICATE & ACHIEVEMENTS SCREEN */}
        {screen === 'CERTIFICATE' && profile && (
          <CertificateScreen
            profile={profile}
            progress={progress}
            equippedSkin={equippedSkin}
            onBackToMenu={() => navigateTo('MAIN_MENU')}
          />
        )}
      </main>
    </div>
  );
}
