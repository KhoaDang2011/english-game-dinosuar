import React from 'react';
import { soundFX } from '../utils/sound.js';
import { LeaderboardService } from './leaderboard-service.js';

export function LeaderboardScreen({ profile, onBackToMenu }) {
  const entries = LeaderboardService.getLeaderboard(profile);
  const currentPlayerEntry = entries.find((e) => e.isCurrentPlayer);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Bảng xếp hạng Học sinh Lớp 10
          </h1>
          <p className="text-sm text-slate-400">
            Xếp hạng theo Điểm kỷ lục cao nhất · Ưu tiên số Cột mốc vượt qua và Tổng câu trả lời đúng khi bằng điểm.
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

      {/* Transparency Notice for Frontend Stage */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span>
          Trạng thái dữ liệu: Đang hiển thị kết quả lưu cục bộ trên trình duyệt kết hợp danh sách học sinh mẫu thử nghiệm (chưa đồng bộ máy chủ Python).
        </span>
        {currentPlayerEntry ? (
          <span className="font-mono-num text-emerald-400 font-semibold whitespace-nowrap">
            Hạng hiện tại của bạn: Top {currentPlayerEntry.rank} (
            {currentPlayerEntry.highScore} điểm)
          </span>
        ) : (
          <span className="text-amber-400 whitespace-nowrap">
            Hãy hoàn thành 1 lượt chơi để ghi tên lên bảng xếp hạng!
          </span>
        )}
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {entries.slice(0, 3).map((item) => {
          const rankLabels = {
            1: {
              title: 'TOP 1 · QUÁN QUÂN',
              accent: 'border-amber-400/80 text-amber-300',
            },
            2: {
              title: 'TOP 2 · Á QUÂN',
              accent: 'border-slate-400/80 text-slate-200',
            },
            3: {
              title: 'TOP 3 · QUÝ QUÂN',
              accent: 'border-amber-700/80 text-amber-500',
            },
          };
          const meta = rankLabels[item.rank] || {
            title: `TOP ${item.rank}`,
            accent: 'border-slate-800 text-slate-300',
          };

          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-5 space-y-3 ${meta.accent}`}
            >
              <div className="flex items-center justify-between text-xs font-mono-num">
                <span className="font-bold">{meta.title}</span>
                <span className="text-slate-400">
                  {item.isCurrentPlayer
                    ? 'Hồ sơ của bạn'
                    : item.isSampleData
                    ? 'Dữ liệu mẫu'
                    : 'Người chơi cục bộ'}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-display font-bold text-white">
                  {item.fullName}
                </h2>
                <p className="text-xs text-slate-400">
                  Lớp {item.className} · Chế độ tốt nhất: {item.bestMode}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between font-mono-num">
                <div>
                  <span className="text-2xl font-bold text-white">
                    {item.highScore}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">điểm</span>
                </div>
                <div className="text-xs text-slate-400">
                  {item.milestonesPassed} mốc · {item.correctAnswers} câu đúng
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                <th className="py-3.5 px-4 font-semibold">Thứ hạng</th>
                <th className="py-3.5 px-4 font-semibold">Họ và tên</th>
                <th className="py-3.5 px-4 font-semibold">Lớp</th>
                <th className="py-3.5 px-4 font-semibold">Chế độ</th>
                <th className="py-3.5 px-4 font-semibold text-right">
                  Cột mốc
                </th>
                <th className="py-3.5 px-4 font-semibold text-right">
                  Câu đúng
                </th>
                <th className="py-3.5 px-4 font-semibold text-right">
                  Điểm cao nhất
                </th>
                <th className="py-3.5 px-4 font-semibold text-right">
                  Nguồn dữ liệu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className={
                    entry.isCurrentPlayer
                      ? 'bg-emerald-950/30 text-white'
                      : 'hover:bg-slate-800/40 text-slate-200'
                  }
                >
                  <td className="py-3.5 px-4 font-mono-num font-bold">
                    Top {entry.rank}
                  </td>
                  <td className="py-3.5 px-4 font-semibold">
                    {entry.fullName}
                    {entry.isCurrentPlayer && (
                      <span className="ml-2 text-xs text-emerald-400 font-normal">
                        (Bạn)
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono-num text-slate-300">
                    {entry.className}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300">
                    {entry.bestMode}
                  </td>
                  <td className="py-3.5 px-4 font-mono-num text-right text-slate-300">
                    {entry.milestonesPassed}
                  </td>
                  <td className="py-3.5 px-4 font-mono-num text-right text-slate-300">
                    {entry.correctAnswers}
                  </td>
                  <td className="py-3.5 px-4 font-mono-num font-bold text-right text-amber-400">
                    {entry.highScore}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-right text-slate-400">
                    {entry.isCurrentPlayer
                      ? 'Trình duyệt này'
                      : entry.isSampleData
                      ? 'Mẫu thử nghiệm'
                      : 'Người chơi cục bộ'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
