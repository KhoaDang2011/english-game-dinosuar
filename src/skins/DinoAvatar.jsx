import React from 'react';

/**
 * Hiển thị hình ảnh xem trước trực quan của Khủng Long theo đúng cấu hình Skin.
 */
export function DinoAvatar({
  skin,
  size = 96,
  animated = false,
  className = '',
}) {
  const { visual } = skin;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className={animated ? 'transition-transform duration-200' : ''}
        aria-label={skin.name}
      >
        {visual.auraColor && (
          <circle cx="60" cy="64" r="46" fill={visual.auraColor} />
        )}

        <ellipse
          cx="60"
          cy="108"
          rx="34"
          ry="6"
          fill="rgba(15, 23, 42, 0.55)"
        />

        {/* Dorsal Spikes */}
        <polygon
          points="36,44 26,38 34,52"
          fill={visual.spikeColor}
          stroke={visual.outlineColor}
          strokeWidth="2"
        />
        <polygon
          points="32,58 21,54 30,66"
          fill={visual.spikeColor}
          stroke={visual.outlineColor}
          strokeWidth="2"
        />
        <polygon
          points="30,72 20,70 29,80"
          fill={visual.spikeColor}
          stroke={visual.outlineColor}
          strokeWidth="2"
        />

        {/* Tail */}
        <path
          d="M 32 76 L 14 68 L 18 86 L 38 88 Z"
          fill={visual.secondaryColor}
          stroke={visual.outlineColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Back Leg */}
        <rect
          x="42"
          y="86"
          width="11"
          height="18"
          rx="3"
          fill={visual.secondaryColor}
          stroke={visual.outlineColor}
          strokeWidth="2.5"
        />

        {/* Main Body */}
        <rect
          x="32"
          y="48"
          width="42"
          height="42"
          rx="10"
          fill={visual.primaryColor}
          stroke={visual.outlineColor}
          strokeWidth="2.5"
        />

        {/* Belly Patch */}
        <path
          d="M 56 54 L 72 54 L 72 84 L 56 84 C 50 84 48 76 48 69 C 48 62 50 54 56 54 Z"
          fill={visual.bellyColor}
        />

        {/* Head & Snout */}
        <rect
          x="44"
          y="22"
          width="52"
          height="34"
          rx="8"
          fill={visual.primaryColor}
          stroke={visual.outlineColor}
          strokeWidth="2.5"
        />

        {/* Jaw smile line */}
        <path
          d="M 74 46 L 94 46"
          stroke={visual.outlineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Nostril */}
        <circle cx="88" cy="32" r="2" fill={visual.outlineColor} />

        {/* Eye or Cyber Visor */}
        {visual.accessory === 'CYBER_VISOR' ? (
          <g>
            <rect
              x="54"
              y="28"
              width="38"
              height="10"
              rx="3"
              fill="#0f172a"
              stroke="#22d3ee"
              strokeWidth="2"
            />
            <line
              x1="58"
              y1="33"
              x2="88"
              y2="33"
              stroke="#22d3ee"
              strokeWidth="2.5"
            />
          </g>
        ) : (
          <g>
            <circle cx="64" cy="33" r="5.5" fill="#ffffff" />
            <circle cx="65.5" cy="33" r="3" fill={visual.eyeColor} />
            <circle cx="66.5" cy="31.5" r="1.2" fill="#ffffff" />
          </g>
        )}

        {/* Short Dino Arm */}
        <path
          d="M 72 64 L 84 64 L 84 71 L 78 71"
          fill="none"
          stroke={visual.outlineColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Front Leg */}
        <rect
          x="58"
          y="86"
          width="12"
          height="19"
          rx="3"
          fill={visual.primaryColor}
          stroke={visual.outlineColor}
          strokeWidth="2.5"
        />

        {/* Accessories */}
        {visual.accessory === 'HEADBAND' && (
          <g>
            <rect
              x="43"
              y="24"
              width="53"
              height="6"
              rx="2"
              fill="#dc2626"
              stroke="#7f1d1d"
              strokeWidth="1.5"
            />
            <path d="M 43 26 L 30 22 L 33 29 Z" fill="#ef4444" />
          </g>
        )}

        {visual.accessory === 'SCHOLAR_HAT' && (
          <g>
            <polygon
              points="64,8 38,18 64,26 90,18"
              fill="#1e293b"
              stroke="#fbbf24"
              strokeWidth="1.8"
            />
            <rect x="50" y="21" width="28" height="5" fill="#334155" />
            <path
              d="M 84 19 L 88 29"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="88" cy="30" r="2.5" fill="#fbbf24" />
          </g>
        )}

        {visual.accessory === 'CROWN' && (
          <polygon
            points="48,22 48,9 58,16 66,7 74,16 84,9 84,22"
            fill="#facc15"
            stroke="#854d0e"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {visual.accessory === 'HALO' && (
          <ellipse
            cx="68"
            cy="11"
            rx="22"
            ry="5"
            fill="none"
            stroke="#fef08a"
            strokeWidth="3.5"
          />
        )}

        {visual.accessory === 'HEADPHONES' && (
          <g>
            <path
              d="M 52 38 C 48 14, 72 14, 72 34"
              fill="none"
              stroke="#0f172a"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <rect
              x="46"
              y="30"
              width="11"
              height="15"
              rx="4"
              fill="#38bdf8"
              stroke="#0f172a"
              strokeWidth="2"
            />
          </g>
        )}

        {visual.accessory === 'HORNS' && (
          <g>
            <polygon
              points="52,22 44,7 60,22"
              fill="#e0f2fe"
              stroke="#0284c7"
              strokeWidth="2"
            />
            <polygon
              points="66,22 64,6 76,22"
              fill="#bae6fd"
              stroke="#0284c7"
              strokeWidth="2"
            />
          </g>
        )}

        {visual.accessory === 'WIZARD_HAT' && (
          <g>
            <ellipse
              cx="64"
              cy="22"
              rx="26"
              ry="5"
              fill="#312e81"
              stroke="#facc15"
              strokeWidth="2"
            />
            <polygon
              points="46,21 62,3 80,21"
              fill="#4338ca"
              stroke="#facc15"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="63" cy="14" r="2.5" fill="#fde047" />
          </g>
        )}

        {visual.accessory === 'DRAGON_CREST' && (
          <g>
            <polygon
              points="44,24 34,9 54,19 64,5 72,19 86,10 82,24"
              fill="#ef4444"
              stroke="#fef08a"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </g>
        )}

        {visual.accessory === 'ASTRONAUT_HELMET' && (
          <g>
            <rect
              x="40"
              y="16"
              width="60"
              height="44"
              rx="16"
              fill="rgba(186, 230, 253, 0.25)"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            <path
              d="M 48 24 C 58 20, 76 20, 88 25"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
