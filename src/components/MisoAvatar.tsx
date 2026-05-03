"use client";

interface MisoAvatarProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

export default function MisoAvatar({
  size = 32,
  animate = true,
  className = "",
}: MisoAvatarProps) {
  const scale = size / 32;

  return (
    <div
      className={`inline-block pixel-art ${animate ? "miso-float" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Antenna */}
        <rect x="15" y="1" width="2" height="4" fill="#fb923c" />
        <rect x="13" y="0" width="6" height="2" fill="#fb923c" />
        <rect x="14" y="0" width="4" height="1" fill="#fdba74" />
        {/* Antenna tip glow */}
        <rect x="15" y="0" width="2" height="1" fill="#fef3c7" />

        {/* Head */}
        <rect x="8" y="5" width="16" height="12" fill="#f97316" />
        <rect x="7" y="6" width="18" height="10" fill="#f97316" />
        {/* Head highlight */}
        <rect x="9" y="6" width="6" height="2" fill="#fb923c" />

        {/* Eyes */}
        <rect x="10" y="9" width="4" height="4" fill="#1a0f08" />
        <rect x="18" y="9" width="4" height="4" fill="#1a0f08" />
        {/* Eye whites / shine */}
        <rect x="11" y="10" width="2" height="2" fill="#e2e8f0" />
        <rect x="19" y="10" width="2" height="2" fill="#e2e8f0" />
        {/* Pupil */}
        <rect x="12" y="11" width="1" height="1" fill="#080a12" />
        <rect x="20" y="11" width="1" height="1" fill="#080a12" />
        {/* Eye shine dot */}
        <rect x="11" y="10" width="1" height="1" fill="#ffffff" />
        <rect x="19" y="10" width="1" height="1" fill="#ffffff" />

        {/* Mouth */}
        <rect x="12" y="14" width="8" height="1" fill="#c2410c" />
        <rect x="13" y="15" width="6" height="1" fill="#c2410c" />

        {/* Body */}
        <rect x="9" y="17" width="14" height="9" fill="#ea580c" />
        <rect x="8" y="18" width="16" height="7" fill="#ea580c" />
        {/* Body panel lines */}
        <rect x="10" y="19" width="12" height="1" fill="#c2410c" />
        <rect x="11" y="21" width="4" height="3" fill="#f97316" />
        <rect x="17" y="21" width="4" height="3" fill="#f97316" />
        {/* Chest detail */}
        <rect x="14" y="20" width="4" height="4" fill="#c2410c" />
        <rect x="15" y="21" width="2" height="2" fill="#fef3c7" />

        {/* Left arm */}
        <rect x="4" y="18" width="4" height="6" fill="#f97316" />
        <rect x="3" y="19" width="2" height="4" fill="#ea580c" />
        {/* Right arm */}
        <rect x="24" y="18" width="4" height="6" fill="#f97316" />
        <rect x="27" y="19" width="2" height="4" fill="#ea580c" />

        {/* Left hand */}
        <rect x="3" y="23" width="4" height="3" fill="#fb923c" />
        {/* Right hand */}
        <rect x="25" y="23" width="4" height="3" fill="#fb923c" />

        {/* Legs */}
        <rect x="10" y="26" width="5" height="4" fill="#ea580c" />
        <rect x="17" y="26" width="5" height="4" fill="#ea580c" />

        {/* Feet */}
        <rect x="9" y="29" width="7" height="2" fill="#c2410c" />
        <rect x="16" y="29" width="7" height="2" fill="#c2410c" />
      </svg>
    </div>
  );
}
