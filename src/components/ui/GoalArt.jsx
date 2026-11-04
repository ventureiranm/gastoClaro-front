// Ilustración de una meta: montaña, mar o casa. Son escenas simples y livianas (SVG), decorativas.
const SCENES = {
  mountain: (
    <>
      <rect width="200" height="110" fill="#cfe3d8" />
      <circle cx="158" cy="30" r="14" fill="#f3d79a" />
      <path d="M0 110 62 34l32 40 24-26 82 62Z" fill="#789889" />
      <path d="M62 34l-14 17 14-5 12 8Z" fill="#ffffff" opacity="0.85" />
      <path d="M0 110l50-30 40 30 40-22 70 22Z" fill="#3f7d68" />
      <path d="M0 110h200v10H0Z" fill="#1f5b4a" />
    </>
  ),
  sea: (
    <>
      <rect width="200" height="110" fill="#f6e7c4" />
      <circle cx="150" cy="34" r="16" fill="#e8b04f" />
      <path d="M0 66c25-8 50 8 75 0s50 8 75 0 35 4 50 0v54H0Z" fill="#7bbf94" />
      <path d="M0 82c25-8 50 8 75 0s50 8 75 0 35 4 50 0v38H0Z" fill="#3f7d68" />
      <path d="M0 100c30-6 60 6 90 0s70 6 110 0v20H0Z" fill="#e8d3a1" />
      <path d="M44 100c2-26 4-44 6-60" fill="none" stroke="#174738" strokeWidth="3" />
      <path
        d="M50 40c-14-2-24 6-28 16 12-8 20-10 28-16ZM50 40c12-6 22-4 30 4-10-4-20-4-30-4Z"
        fill="#2d6a56"
      />
    </>
  ),
  house: (
    <>
      <rect width="200" height="110" fill="#e6f0ea" />
      <path d="M0 96c40-10 80 4 120-4s60 0 80-2v30H0Z" fill="#a9d3b8" />
      <rect x="62" y="56" width="76" height="52" fill="#fbf3dd" />
      <path d="M54 58 100 22l46 36Z" fill="#b86b2b" />
      <rect x="90" y="76" width="20" height="32" rx="2" fill="#1f5b4a" />
      <rect x="70" y="68" width="14" height="14" rx="2" fill="#a9d3b8" />
      <rect x="116" y="68" width="14" height="14" rx="2" fill="#a9d3b8" />
      <circle cx="30" cy="84" r="14" fill="#3f7d68" />
      <rect x="28" y="92" width="4" height="16" fill="#174738" />
    </>
  ),
};

export default function GoalArt({ scene, className = 'goal-art' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 110"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {SCENES[scene] ?? SCENES.mountain}
    </svg>
  );
}
