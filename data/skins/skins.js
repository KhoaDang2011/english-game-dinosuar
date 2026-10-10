export const SKIN_DEFINITIONS = [
  // --- BASIC TIER ---
  {
    id: 'skin_emerald_rookie',
    name: 'Emerald Rookie Rex',
    tier: 'Basic',
    description:
      'Chú khủng long xanh ngọc lục bảo tiêu chuẩn của học sinh lớp 10, nhanh nhẹn và tràn đầy năng lượng khởi đầu.',
    unlockCondition: {
      type: 'DEFAULT',
      targetValue: 0,
      description: 'Mở khóa mặc định cho mọi người chơi.',
    },
    visual: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      bellyColor: '#a7f3d0',
      eyeColor: '#020617',
      spikeColor: '#34d399',
      outlineColor: '#064e3b',
      accessory: 'NONE',
      trailStyle: 'DUST',
    },
  },
  {
    id: 'skin_sakura_breeze',
    name: 'Sakura Melody Dino',
    tier: 'Basic',
    description:
      'Khủng long hồng anh đào đeo tai nghe âm nhạc lấy cảm hứng từ Unit 3 (Music), bước chạy êm ái và nhịp nhàng.',
    unlockCondition: {
      type: 'TOTAL_CORRECT',
      targetValue: 5,
      description: 'Trả lời đúng tích lũy ít nhất 5 câu hỏi Tiếng Anh 10.',
    },
    visual: {
      primaryColor: '#ec4899',
      secondaryColor: '#be185d',
      bellyColor: '#fbcfe8',
      eyeColor: '#1e1b4b',
      spikeColor: '#f472b6',
      outlineColor: '#831843',
      accessory: 'HEADPHONES',
      trailStyle: 'DUST',
    },
  },
  {
    id: 'skin_cobalt_sprinter',
    name: 'Cobalt Sprinter Dino',
    tier: 'Basic',
    description:
      'Khoác sắc xanh dương năng động cùng băng đô thể thao, dành cho người chơi vượt qua cột mốc điểm đầu tiên.',
    unlockCondition: {
      type: 'HIGH_SCORE',
      targetValue: 100,
      description: 'Đạt điểm cao nhất từ 100 điểm trở lên trong một lượt chơi.',
    },
    visual: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1d4ed8',
      bellyColor: '#bfdbfe',
      eyeColor: '#0f172a',
      spikeColor: '#60a5fa',
      outlineColor: '#1e3a8a',
      accessory: 'HEADBAND',
      trailStyle: 'DUST',
    },
  },

  // --- RARE TIER ---
  {
    id: 'skin_amber_scholar',
    name: 'Amber Scholar Rex',
    tier: 'Rare',
    description:
      'Khủng long học giả đội mũ cử nhân vàng hổ phách, biểu tượng của sự chăm chỉ rèn luyện từ vựng Global Success.',
    unlockCondition: {
      type: 'TOTAL_CORRECT',
      targetValue: 15,
      description: 'Tích lũy tổng cộng ít nhất 15 câu trả lời Tiếng Anh đúng.',
    },
    visual: {
      primaryColor: '#f59e0b',
      secondaryColor: '#b45309',
      bellyColor: '#fde68a',
      eyeColor: '#1e293b',
      spikeColor: '#fbbf24',
      outlineColor: '#78350f',
      auraColor: 'rgba(245, 158, 11, 0.18)',
      accessory: 'SCHOLAR_HAT',
      trailStyle: 'SPARKS',
    },
  },
  {
    id: 'skin_crimson_vanguard',
    name: 'Crimson Vanguard',
    tier: 'Rare',
    description:
      'Chiến binh khủng long đỏ thẫm rực lửa, mở khóa khi người chơi chinh phục thành công thử thách cột mốc.',
    unlockCondition: {
      type: 'MILESTONES_PASSED',
      targetValue: 1,
      description: 'Vượt qua thành công ít nhất 1 Thử thách Cột mốc (đạt chuẩn điểm thưởng).',
    },
    visual: {
      primaryColor: '#ef4444',
      secondaryColor: '#b91c1c',
      bellyColor: '#fecaca',
      eyeColor: '#fef08a',
      spikeColor: '#f87171',
      outlineColor: '#7f1d1d',
      auraColor: 'rgba(239, 68, 68, 0.2)',
      accessory: 'HEADBAND',
      trailStyle: 'SPARKS',
    },
  },
  {
    id: 'skin_arctic_glacier',
    name: 'Arctic Glacier Rex',
    tier: 'Rare',
    description:
      'Khủng long băng giá vùng cực với cặp sừng tinh thể tuyết và hiệu ứng hạt băng lấp lánh sau mỗi bước nhảy.',
    unlockCondition: {
      type: 'HIGH_SCORE',
      targetValue: 300,
      description: 'Đạt điểm cao nhất từ 300 điểm trở lên trong một lượt chơi.',
    },
    visual: {
      primaryColor: '#38bdf8',
      secondaryColor: '#0284c7',
      bellyColor: '#e0f2fe',
      eyeColor: '#082f49',
      spikeColor: '#bae6fd',
      outlineColor: '#0c4a6e',
      auraColor: 'rgba(56, 189, 248, 0.22)',
      accessory: 'HORNS',
      trailStyle: 'ICE',
    },
  },
  {
    id: 'skin_neon_pulse',
    name: 'Neon Pulse Runner',
    tier: 'Rare',
    description:
      'Phong cách kỹ thuật số hiện đại lấy cảm hứng từ Unit 8 (New Ways to Learn) với tai nghe phát sáng và bước chạy tia chớp.',
    unlockCondition: {
      type: 'TOTAL_CORRECT',
      targetValue: 30,
      description: 'Tích lũy tổng cộng ít nhất 30 câu trả lời Tiếng Anh đúng.',
    },
    visual: {
      primaryColor: '#6366f1',
      secondaryColor: '#4338ca',
      bellyColor: '#c7d2fe',
      eyeColor: '#22d3ee',
      spikeColor: '#38bdf8',
      outlineColor: '#312e81',
      auraColor: 'rgba(99, 102, 241, 0.24)',
      accessory: 'HEADPHONES',
      trailStyle: 'SPARKS',
    },
  },

  // --- LEGENDARY TIER ---
  {
    id: 'skin_royal_sovereign',
    name: 'Royal Sovereign Rex',
    tier: 'Legendary',
    description:
      'Khủng long hoàng gia mang vương miện vàng ròng và giáp tím huyền thoại, dành cho cao thủ đạt mốc 500 điểm.',
    unlockCondition: {
      type: 'HIGH_SCORE',
      targetValue: 500,
      description: 'Đạt điểm cao nhất từ 500 điểm trở lên trong một lượt chơi.',
    },
    visual: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#6d28d9',
      bellyColor: '#ddd6fe',
      eyeColor: '#fde047',
      spikeColor: '#facc15',
      outlineColor: '#4c1d95',
      auraColor: 'rgba(139, 92, 246, 0.28)',
      accessory: 'CROWN',
      trailStyle: 'SPARKS',
    },
  },
  {
    id: 'skin_inferno_drake',
    name: 'Inferno Dragonlord',
    tier: 'Legendary',
    description:
      'Hậu duệ rồng lửa cổ đại với mào rồng rực cháy và vệt lửa hồng ngọc, mở khóa khi vượt qua 2 thử thách cột mốc.',
    unlockCondition: {
      type: 'MILESTONES_PASSED',
      targetValue: 2,
      description: 'Vượt qua thành công ít nhất 2 Thử thách Cột mốc.',
    },
    visual: {
      primaryColor: '#f97316',
      secondaryColor: '#c2410c',
      bellyColor: '#fed7aa',
      eyeColor: '#fef08a',
      spikeColor: '#fde047',
      outlineColor: '#7c2d12',
      auraColor: 'rgba(249, 115, 22, 0.3)',
      accessory: 'DRAGON_CREST',
      trailStyle: 'FLAME',
    },
  },
  {
    id: 'skin_arcane_archmage',
    name: 'Arcane Archmage Dino',
    tier: 'Legendary',
    description:
      'Đại pháp sư ngôn ngữ đội mũ phù thủy sao vàng, bậc thầy nắm vững toàn bộ cấu trúc ngữ pháp Tiếng Anh lớp 10.',
    unlockCondition: {
      type: 'TOTAL_CORRECT',
      targetValue: 60,
      description: 'Tích lũy tổng cộng ít nhất 60 câu trả lời Tiếng Anh đúng.',
    },
    visual: {
      primaryColor: '#3b0764',
      secondaryColor: '#581c87',
      bellyColor: '#e9d5ff',
      eyeColor: '#38bdf8',
      spikeColor: '#facc15',
      outlineColor: '#1e1b4b',
      auraColor: 'rgba(168, 85, 247, 0.3)',
      accessory: 'WIZARD_HAT',
      trailStyle: 'GALAXY',
    },
  },

  // --- GOD TIER ---
  {
    id: 'skin_solaris_deity',
    name: 'Solaris Zenith Titan',
    tier: 'God',
    description:
      'Hóa thân thần mặt trời rực sáng với vòng hào quang vàng kim và hiệu ứng bước chạy ánh sáng khi đạt 1.000 điểm.',
    unlockCondition: {
      type: 'HIGH_SCORE',
      targetValue: 1000,
      description: 'Đạt điểm cao nhất từ 1.000 điểm trở lên trong một lượt chơi.',
    },
    visual: {
      primaryColor: '#eab308',
      secondaryColor: '#ca8a04',
      bellyColor: '#fef9c3',
      eyeColor: '#ffffff',
      spikeColor: '#ffffff',
      outlineColor: '#713f12',
      auraColor: 'rgba(250, 204, 21, 0.38)',
      accessory: 'HALO',
      trailStyle: 'SOLAR',
    },
  },
  {
    id: 'skin_celestial_astronaut',
    name: 'Celestial Starfarer',
    tier: 'God',
    description:
      'Khủng long du hành vũ trụ trang bị mũ phi hành gia tinh vân và bước chạy bụi sao ngân hà.',
    unlockCondition: {
      type: 'HIGH_SCORE',
      targetValue: 1500,
      description: 'Đạt điểm cao nhất từ 1.500 điểm trở lên trong một lượt chơi.',
    },
    visual: {
      primaryColor: '#e2e8f0',
      secondaryColor: '#64748b',
      bellyColor: '#38bdf8',
      eyeColor: '#0284c7',
      spikeColor: '#38bdf8',
      outlineColor: '#1e293b',
      auraColor: 'rgba(56, 189, 248, 0.35)',
      accessory: 'ASTRONAUT_HELMET',
      trailStyle: 'GALAXY',
    },
  },

  // --- SECRET TIER ---
  {
    id: 'skin_cyber_omega',
    name: 'Cyber-Omega Zero',
    tier: 'Secret',
    description:
      'Khủng long công nghệ bí mật trang bị kính quang học Cyber Visor, chỉ mở khóa khi chinh phục chế độ HardCore hoặc mốc 2.000 điểm.',
    unlockCondition: {
      type: 'MODE_HIGH_SCORE',
      targetValue: 350,
      requiredMode: 'HARDCORE',
      secondaryValue: 2000,
      description: 'Đạt ít nhất 350 điểm ở chế độ HardCore HOẶC đạt tổng điểm kỷ lục 2.000 điểm.',
    },
    visual: {
      primaryColor: '#14b8a6',
      secondaryColor: '#0f766e',
      bellyColor: '#99f6e4',
      eyeColor: '#22d3ee',
      spikeColor: '#2dd4bf',
      outlineColor: '#134e4a',
      auraColor: 'rgba(20, 184, 166, 0.35)',
      accessory: 'CYBER_VISOR',
      trailStyle: 'MATRIX',
    },
  },
  {
    id: 'skin_phantom_eclipse',
    name: 'Phantom Void Emperor',
    tier: 'Secret',
    description:
      'Thực thể khủng long Hắc Ám Tối Thượng với sừng rồng đỏ thẫm và hào quang tinh vân, mở khóa ở đỉnh cao HardCore hoặc bằng Mã Lệnh Bí Mật.',
    unlockCondition: {
      type: 'MODE_HIGH_SCORE',
      targetValue: 600,
      requiredMode: 'HARDCORE',
      secondaryValue: 2500,
      description: 'Đạt 600 điểm chế độ HardCore, đạt 2.500 điểm kỷ lục HOẶC nhập Mã Lệnh mở khóa Full Skin.',
    },
    visual: {
      primaryColor: '#18181b',
      secondaryColor: '#dc2626',
      bellyColor: '#fda4af',
      eyeColor: '#f43f5e',
      spikeColor: '#ef4444',
      outlineColor: '#991b1b',
      auraColor: 'rgba(225, 29, 72, 0.38)',
      accessory: 'DRAGON_CREST',
      trailStyle: 'GALAXY',
    },
  },
];

export const DEFAULT_SKIN_ID = 'skin_emerald_rookie';

export const FULL_SKIN_COMMAND_CODES = [
  'FULLSKIN',
  'UNLOCKALL',
  'DINO10',
  'GLOBALSUCCESS',
  '/UNLOCK_ALL_SKINS',
];

export const RESET_SKIN_COMMAND_CODES = [
  'RESETSKIN',
  '/RESET_SKINS',
];
