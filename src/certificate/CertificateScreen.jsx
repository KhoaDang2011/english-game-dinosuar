import React, { useState } from 'react';
import { DinoAvatar } from '../skins/DinoAvatar.jsx';
import { soundFX } from '../utils/sound.js';
import { CertificateManager } from './certificate-manager.js';

export function CertificateScreen({
  profile,
  progress,
  equippedSkin,
  onBackToMenu,
}) {
  const certificates = CertificateManager.syncAndGetCertificates(
    profile,
    progress
  );

  const firstEarned = certificates.find((c) => c.isEarned) || certificates[0];
  const [selectedCertId, setSelectedCertId] = useState(
    firstEarned.requirement.id
  );

  const activeCert =
    certificates.find((c) => c.requirement.id === selectedCertId) ||
    certificates[0];

  const accuracyPercent =
    progress.totalQuestionsAnswered > 0
      ? Math.round(
          (progress.totalCorrectAnswers / progress.totalQuestionsAnswered) * 100
        )
      : 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Thành tích Cá nhân & Chứng chỉ Học tập
          </h1>
          <p className="text-sm text-slate-400">
            Hồ sơ học sinh:{' '}
            <strong className="text-white">{profile.fullName}</strong> · Lớp{' '}
            <strong className="text-emerald-400">{profile.className}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onBackToMenu();
          }}
          className="px-4 py-2.5 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Quay lại Menu chính
        </button>
      </div>

      {/* Personal Achievement Stats Strip (Hidden when printing) */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono-num">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Điểm kỷ lục cao nhất</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {progress.highScore}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Gần nhất: {progress.lastScore} điểm ({progress.lastMode})
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Tổng câu trả lời đúng</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {progress.totalCorrectAnswers}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Độ chính xác: {accuracyPercent}% ({progress.totalQuestionsAnswered}{' '}
            câu)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Cột mốc đã chinh phục</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">
            {progress.milestonesPassedCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Số lượt đã chơi: {progress.gamesPlayed} lượt
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Điểm theo chế độ</div>
          <div className="text-xs text-slate-300 space-y-1 mt-1.5">
            <div>Basic: {progress.modeHighScores.BASIC} đ</div>
            <div>Medium: {progress.modeHighScores.MEDIUM} đ</div>
            <div>HardCore: {progress.modeHighScores.HARDCORE} đ</div>
          </div>
        </div>
      </div>

      {/* Certificate Selector List & Certificate Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="no-print lg:col-span-5 space-y-3">
          <h2 className="text-base font-display font-bold text-slate-200">
            Danh mục Chứng chỉ Tiếng Anh 10
          </h2>
          {certificates.map((cert) => {
            const isSelected =
              cert.requirement.id === activeCert.requirement.id;
            return (
              <button
                key={cert.requirement.id}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setSelectedCertId(cert.requirement.id);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-num text-slate-400">
                    Hạng {cert.requirement.badgeLevel}
                  </span>
                  <span
                    className={
                      cert.isEarned
                        ? 'text-emerald-400 font-semibold'
                        : 'text-slate-500'
                    }
                  >
                    {cert.isEarned ? 'Đã đạt chứng chỉ' : 'Chưa đủ điều kiện'}
                  </span>
                </div>
                <div className="text-base font-display font-bold text-white">
                  {cert.requirement.title}
                </div>
                <p className="text-xs text-slate-400">
                  {cert.requirement.description}
                </p>
                <div className="text-xs font-mono-num text-slate-300 pt-1">
                  {cert.progressSummary}
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-7">
          {activeCert.isEarned && activeCert.record ? (
            <div className="space-y-4">
              <div className="print-certificate bg-slate-900 border-2 border-amber-400/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-mono-num uppercase tracking-widest text-amber-400">
                      ENGLISH GAME DINOSAUR · GLOBAL SUCCESS GRADE 10
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                      {activeCert.requirement.title}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {activeCert.requirement.englishTitle}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <DinoAvatar skin={equippedSkin} size={68} />
                  </div>
                </div>

                <div className="space-y-2 py-2">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Chứng nhận học sinh:
                  </p>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">
                    {activeCert.record.fullName}
                  </div>
                  <p className="text-sm text-slate-200 font-medium">
                    Lớp:{' '}
                    <span className="font-mono-num">
                      {activeCert.record.className}
                    </span>
                  </p>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Đã hoàn thành xuất sắc yêu cầu học tập và phản xạ Tiếng Anh lớp 10 trong trò chơi{' '}
                  <strong>English Game Dinosaur</strong>:{' '}
                  {activeCert.requirement.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/90 border border-slate-800 rounded-xl p-4 font-mono-num text-xs">
                  <div>
                    <div className="text-slate-400">Điểm kỷ lục ghi nhận</div>
                    <div className="text-base font-bold text-amber-400 mt-0.5">
                      {activeCert.record.achievedScore} điểm
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Ngày cấp chứng chỉ</div>
                    <div className="text-sm font-semibold text-slate-200 mt-0.5">
                      {new Date(activeCert.record.issuedAt).toLocaleDateString(
                        'vi-VN'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Mã chứng chỉ duy nhất</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {activeCert.record.certificateCode}
                    </div>
                  </div>
                </div>
              </div>

              <div className="no-print flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    window.print();
                  }}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  In hoặc Lưu PDF Chứng chỉ
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <div className="mx-auto w-fit opacity-60">
                <DinoAvatar skin={equippedSkin} size={80} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-display font-bold text-white">
                  Chưa mở khóa &ldquo;{activeCert.requirement.title}&rdquo;
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Chứng chỉ chỉ được cấp khi người chơi thực sự hoàn thành đủ điều kiện trong quá trình chơi.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-w-md mx-auto text-xs font-mono-num text-slate-300 space-y-1">
                <div className="text-slate-400">
                  Tiến trình hiện tại của bạn:
                </div>
                <div className="text-amber-400 font-semibold">
                  {activeCert.progressSummary}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
