import React, { useState } from 'react';
import { DEFAULT_SKIN_ID } from '../../data/skins/skins.js';
import { ApiClient } from '../services/api-client.js';
import { soundFX } from '../utils/sound.js';
import { DinoAvatar } from './DinoAvatar.jsx';
import { SkinManager } from './skin-manager.js';

const TIER_FILTERS = ['ALL', 'Basic', 'Rare', 'Legendary', 'God', 'Secret'];

const TIER_TEXT_COLOR = {
  Basic: 'text-emerald-400',
  Rare: 'text-sky-400',
  Legendary: 'text-violet-400',
  God: 'text-amber-400',
  Secret: 'text-teal-300',
};

export function SkinCollectionScreen({
  profile,
  progress,
  equippedSkin,
  onSkinEquipped,
  onProgressUpdated,
  onBackToMenu,
}) {
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [feedbackBanner, setFeedbackBanner] = useState(null);
  const [commandCode, setCommandCode] = useState('');

  const skinItems = SkinManager.getAllSkinsWithStatus(profile, progress);

  const filteredItems =
    selectedTier === 'ALL'
      ? skinItems
      : skinItems.filter((item) => item.skin.tier === selectedTier);

  const unlockedCount = skinItems.filter((i) => i.isUnlocked).length;

  const handleEquip = async (skinId) => {
    soundFX.playClick();
    const res = await ApiClient.saveEquippedSkin(profile, progress, skinId);
    setFeedbackBanner({ text: res.message, isError: !res.success });
    if (res.success) {
      onSkinEquipped(res.equippedSkin);
    }
  };

  const handleRedeemCode = (e) => {
    e.preventDefault();
    const res = SkinManager.redeemCommandCode(profile, progress, commandCode);
    if (res.success) {
      soundFX.playMilestonePass();
      onProgressUpdated(res.updatedProgress);
      const validEquipped = SkinManager.getEquippedSkin(
        profile,
        res.updatedProgress
      );
      onSkinEquipped(validEquipped);
      setFeedbackBanner({ text: res.message, isError: false });
      setCommandCode('');
    } else {
      soundFX.playWrong();
      setFeedbackBanner({ text: res.message, isError: true });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Currently Equipped Showcase */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Bộ sưu tập Skin Khủng Long
          </h1>
          <p className="text-sm text-slate-400">
            Đã mở khóa{' '}
            <strong className="text-emerald-400 font-mono-num">
              {unlockedCount}/{skinItems.length}
            </strong>{' '}
            skin · Người chơi:{' '}
            <strong className="text-slate-200">{profile.fullName}</strong> (Lớp{' '}
            {profile.className})
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

      {/* Currently Equipped Skin & Command Code Box Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Currently Equipped Skin Banner */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 shrink-0">
              <DinoAvatar skin={equippedSkin} size={92} animated />
            </div>
            <div className="space-y-1.5">
              <div className="text-xs text-slate-400">
                Skin đang trang bị · Cấp độ{' '}
                <span
                  className={`font-semibold ${TIER_TEXT_COLOR[equippedSkin.tier]}`}
                >
                  {equippedSkin.tier}
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-white">
                {equippedSkin.name}
              </h2>
              <p className="text-sm text-slate-300">
                {equippedSkin.description}
              </p>
            </div>
          </div>

          {equippedSkin.id !== DEFAULT_SKIN_ID && (
            <button
              type="button"
              onClick={() => handleEquip(DEFAULT_SKIN_ID)}
              className="px-4 py-2 text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Về mặc định
            </button>
          )}
        </div>

        {/* Right: Dedicated Command Code Input Box to Unlock Full Skins */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono-num uppercase text-amber-400 font-semibold">
                Khu vực Nhập Mã Lệnh Riêng
              </span>
              <span className="text-slate-400 font-mono-num">
                {unlockedCount === skinItems.length
                  ? 'Đã mở Full 100% Skin'
                  : `Còn ${skinItems.length - unlockedCount} skin khóa`}
              </span>
            </div>
            <h3 className="text-base font-display font-bold text-white">
              Mở khóa Full Skin bằng Mã Lệnh
            </h3>
            <p className="text-xs text-slate-400">
              Nhập mã lệnh đặc biệt để mở khóa ngay toàn bộ {skinItems.length}{' '}
              Skin (từ Basic đến God & Secret).
            </p>
          </div>

          <form onSubmit={handleRedeemCode} className="flex items-center gap-2">
            <input
              type="text"
              value={commandCode}
              onChange={(e) => setCommandCode(e.target.value)}
              placeholder="Nhập mã lệnh (VD: FULLSKIN)..."
              aria-label="Mã lệnh mở khóa skin"
              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:outline-none text-sm font-mono-num text-white placeholder-slate-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Kích hoạt mã
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
            <span>
              Mã hỗ trợ:{' '}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setCommandCode('FULLSKIN');
                }}
                className="font-mono-num text-emerald-400 hover:underline cursor-pointer"
              >
                FULLSKIN
              </button>
              {' · '}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setCommandCode('DINO10');
                }}
                className="font-mono-num text-emerald-400 hover:underline cursor-pointer"
              >
                DINO10
              </button>
            </span>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setCommandCode('RESETSKIN');
              }}
              className="font-mono-num text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
            >
              Mã đặt lại: RESETSKIN
            </button>
          </div>
        </div>
      </div>

      {feedbackBanner && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between border ${
            feedbackBanner.isError
              ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
              : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
          }`}
        >
          <span>{feedbackBanner.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-xs underline ml-4 cursor-pointer opacity-80 hover:opacity-100"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Interactive Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        {TIER_FILTERS.map((tier) => {
          const active = selectedTier === tier;
          const countInTier =
            tier === 'ALL'
              ? skinItems.length
              : skinItems.filter((s) => s.skin.tier === tier).length;

          return (
            <button
              key={tier}
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSelectedTier(tier);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tier === 'ALL'
                ? `Tất cả (${countInTier})`
                : `${tier} (${countInTier})`}
            </button>
          );
        })}
      </div>

      {/* Skin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const {
            skin,
            isUnlocked,
            isEquipped,
            progressText,
            progressPercent,
          } = item;

          return (
            <div
              key={skin.id}
              className={`bg-slate-900 rounded-2xl p-5 flex flex-col justify-between gap-4 border transition-colors ${
                isEquipped
                  ? 'border-emerald-500'
                  : isUnlocked
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/60 opacity-85'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-400">
                      Cấp độ{' '}
                      <span
                        className={`font-semibold ${TIER_TEXT_COLOR[skin.tier]}`}
                      >
                        {skin.tier}
                      </span>
                      <span className="mx-1.5">·</span>
                      <span>
                        {isEquipped
                          ? 'Đang sử dụng'
                          : isUnlocked
                          ? 'Đã sở hữu'
                          : 'Đang khóa'}
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-white mt-0.5">
                      {skin.name}
                    </h3>
                  </div>
                </div>

                {/* Visual Preview Box */}
                <div className="bg-slate-950 border border-slate-800/90 rounded-xl py-4 flex items-center justify-center">
                  <DinoAvatar skin={skin} size={88} />
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {skin.description}
                </p>

                {/* Unlock Condition & Progress */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Điều kiện mở khóa:</span>
                    <span className="font-mono-num text-slate-300 font-medium">
                      {progressText}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {skin.unlockCondition.description}
                  </p>
                  {!isUnlocked && (
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {!isUnlocked ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed whitespace-nowrap"
                  >
                    Chưa mở khóa ({progressPercent}%)
                  </button>
                ) : isEquipped ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold cursor-default whitespace-nowrap"
                  >
                    Đang sử dụng
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleEquip(skin.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Trang bị
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
