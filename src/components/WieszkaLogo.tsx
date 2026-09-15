import React from 'react';

interface WieszkaLogoProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
  customLogoUrl?: string | null;
}

export const WieszkaLogo: React.FC<WieszkaLogoProps> = ({
  className = "w-10 h-10",
  showGlow = true,
  customLogoUrl = null,
}) => {
  if (customLogoUrl) {
    return (
      <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
        {showGlow && (
          <div className="absolute inset-0 rounded-full bg-indigo-600/30 blur-md scale-110 pointer-events-none" />
        )}
        <img
          src={customLogoUrl}
          alt="Custom Logo"
          className="w-full h-full object-contain relative z-10 rounded-lg drop-shadow-md"
        />
      </div>
    );
  }

  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Optional ambient glow */}
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-indigo-600/30 blur-md scale-110 pointer-events-none" />
      )}
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full relative z-10 drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Outer circle rim gradient */}
          <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a5568" />
            <stop offset="50%" stopColor="#1a202c" />
            <stop offset="100%" stopColor="#0d1117" />
          </linearGradient>

          {/* Dark obsidian sphere inner background */}
          <radialGradient id="spaceBg" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#1e2230" />
            <stop offset="60%" stopColor="#0b0d14" />
            <stop offset="100%" stopColor="#050608" />
          </radialGradient>

          {/* Lapis Lazuli Blue Wing Gradient */}
          <linearGradient id="lapisGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="35%" stopColor="#1d4ed8" />
            <stop offset="70%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          <linearGradient id="lapisGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="35%" stopColor="#2563eb" />
            <stop offset="70%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          {/* Gold & Sapphire Shimmer for Lapis texture */}
          <radialGradient id="goldSpecks" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6" />
            <stop offset="20%" stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Glass Glare Overlay */}
          <linearGradient id="glassGlare" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Metallic Ring Frame */}
        <circle cx="250" cy="250" r="242" fill="url(#rimGrad)" stroke="#64748b" strokeWidth="2" />
        <circle cx="250" cy="250" r="236" fill="url(#spaceBg)" stroke="#1e293b" strokeWidth="3" />

        {/* Celestial / Astrological Coordinate Grid lines */}
        <g stroke="#334155" strokeWidth="1" opacity="0.35">
          <circle cx="250" cy="250" r="210" strokeDasharray="3 3" />
          <circle cx="250" cy="250" r="150" strokeDasharray="2 4" />
          <circle cx="250" cy="250" r="90" />
          <line x1="250" y1="40" x2="250" y2="460" strokeDasharray="4 4" />
          <line x1="40" y1="250" x2="460" y2="250" strokeDasharray="4 4" />
          <path d="M 90 120 Q 250 200 410 120" />
          <path d="M 90 380 Q 250 300 410 380" />
          {/* Celestial star specks */}
          <circle cx="160" cy="180" r="1.5" fill="#94a3b8" />
          <circle cx="340" cy="190" r="1.5" fill="#94a3b8" />
          <circle cx="200" cy="320" r="1.2" fill="#94a3b8" />
          <circle cx="300" cy="340" r="1.8" fill="#94a3b8" />
          <circle cx="120" cy="280" r="1.5" fill="#94a3b8" />
          <circle cx="380" cy="260" r="1.5" fill="#94a3b8" />
        </g>

        {/* The Iconic 'W' Lapis Lazuli Wings */}
        <g id="w-wings">
          {/* Left Wing (Left side of the W) */}
          <path
            d="M 140 85 L 252 390 L 202 390 L 140 85 Z"
            fill="url(#lapisGradLeft)"
          />
          <path
            d="M 140 85 L 252 390 L 252 85 Z"
            fill="url(#lapisGradLeft)"
          />

          {/* Right Wing (Right side of the W) */}
          <path
            d="M 360 85 L 248 390 L 298 390 L 360 85 Z"
            fill="url(#lapisGradRight)"
          />
          <path
            d="M 360 85 L 248 390 L 248 85 Z"
            fill="url(#lapisGradRight)"
          />

          {/* Inner sharp black triangle notch forming the sleek W gap */}
          <path
            d="M 250 85 L 202 390 L 298 390 Z"
            fill="#050608"
          />

          {/* Metallic / Gold Fleck Highlights over Lapis Wings */}
          <path
            d="M 140 85 L 250 85 L 202 390 Z"
            fill="url(#goldSpecks)"
            style={{ mixBlendMode: 'overlay' }}
          />
          <path
            d="M 360 85 L 250 85 L 298 390 Z"
            fill="url(#goldSpecks)"
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* Outer edge highlight lines for 3D metallic feel */}
          <path d="M 140 85 L 252 390" stroke="#93c5fd" strokeWidth="2.5" opacity="0.7" />
          <path d="M 360 85 L 248 390" stroke="#93c5fd" strokeWidth="2.5" opacity="0.7" />
          <path d="M 140 85 L 250 85" stroke="#bfdbfe" strokeWidth="3" opacity="0.8" />
          <path d="M 360 85 L 250 85" stroke="#bfdbfe" strokeWidth="3" opacity="0.8" />
        </g>

        {/* Top Glossy Curved Reflection (Lens flare) */}
        <path
          d="M 40 250 A 210 210 0 0 1 460 250 Q 250 160 40 250 Z"
          fill="url(#glassGlare)"
        />
      </svg>
    </div>
  );
};
