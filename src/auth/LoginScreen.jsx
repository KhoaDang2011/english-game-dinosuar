import React, { useState } from 'react';
import { SKIN_DEFINITIONS } from '../../data/skins/skins.js';
import { ApiClient } from '../services/api-client.js';
import { DinoAvatar } from '../skins/DinoAvatar.jsx';
import { soundFX } from '../utils/sound.js';

/**
 * Màn hình Đăng nhập người chơi — Tuân thủ nghiêm ngặt yêu cầu Mục 5:
 * - Chỉ có đúng 2 trường bắt buộc: Họ và tên + Lớp.
 * - Tuyệt đối không có trường ID tài khoản hay OTP.
 */
export function LoginScreen({
  initialProfile,
  onLoginSuccess,
  onBackToIntro,
}) {
  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [className, setClassName] = useState(initialProfile?.className || '');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    soundFX.playClick();

    const result = await ApiClient.login(fullName, className);
    if (!result.success || !result.profile) {
      setErrors(
        result.errors || {
          fullName: 'Vui lòng kiểm tra lại họ tên và lớp.',
        }
      );
      soundFX.playWrong();
      return;
    }

    setErrors({});
    soundFX.playCorrect();
    onLoginSuccess(result.profile);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] w-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <DinoAvatar skin={SKIN_DEFINITIONS[0]} size={72} />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">
            Thông tin Học sinh
          </h1>
          <p className="text-sm text-slate-400">
            Nhập họ tên và lớp của bạn để lưu thành tích, mở khóa skin và ghi danh lên bảng xếp hạng.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Trường 1: Họ và tên (Bắt buộc) */}
          <div className="space-y-1.5">
            <label
              htmlFor="player-full-name"
              className="block text-sm font-semibold text-slate-200"
            >
              1. Họ và tên <span className="text-rose-400">*</span>
            </label>
            <input
              id="player-full-name"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Ví dụ: Nguyễn Văn An"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) {
                  setErrors((prev) => ({ ...prev, fullName: undefined }));
                }
              }}
              className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-base text-white placeholder-slate-500 focus:outline-none transition-colors ${
                errors.fullName
                  ? 'border-rose-500 focus:border-rose-400'
                  : 'border-slate-700 focus:border-emerald-500'
              }`}
            />
            {errors.fullName && (
              <p
                role="alert"
                className="text-xs font-medium text-rose-400 pt-0.5"
              >
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Trường 2: Lớp (Bắt buộc) */}
          <div className="space-y-1.5">
            <label
              htmlFor="player-class-name"
              className="block text-sm font-semibold text-slate-200"
            >
              2. Lớp <span className="text-rose-400">*</span>
            </label>
            <input
              id="player-class-name"
              name="className"
              type="text"
              placeholder="Ví dụ: 10A1"
              value={className}
              onChange={(e) => {
                setClassName(e.target.value);
                if (errors.className) {
                  setErrors((prev) => ({ ...prev, className: undefined }));
                }
              }}
              className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-base text-white placeholder-slate-500 focus:outline-none transition-colors ${
                errors.className
                  ? 'border-rose-500 focus:border-rose-400'
                  : 'border-slate-700 focus:border-emerald-500'
              }`}
            />
            {errors.className && (
              <p
                role="alert"
                className="text-xs font-medium text-rose-400 pt-0.5"
              >
                {errors.className}
              </p>
            )}
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-base transition-colors cursor-pointer whitespace-nowrap"
            >
              Vào Menu Chính
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onBackToIntro();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              Quay lại màn hình giới thiệu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
