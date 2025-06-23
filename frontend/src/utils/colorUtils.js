// utils/colorUtils.js

/**
 * Returns a predefined color palette or a generated one if count > palette size.
 * Useful for pie, doughnut, polarArea charts where each segment needs its own color.
 */
export const getDynamicColors = (count) => {
  const palette = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899",
    "#14b8a6", "#f43f5e", "#eab308", "#6366f1", "#06b6d4", "#d946ef",
    "#84cc16", "#f97316", "#0ea5e9", "#a855f7", "#22d3ee", "#e11d48",
  ];

  // If count is more than palette, repeat with transparency
  const base = palette.length;
  if (count <= base) return palette.slice(0, count);

  const colors = [];
  for (let i = 0; i < count; i++) {
    const baseColor = palette[i % base];
    const alpha = 1 - (Math.floor(i / base) * 0.1);
    colors.push(applyAlpha(baseColor, Math.max(alpha, 0.4)));
  }
  return colors;
};

/**
 * Utility: Converts a hex color to rgba with alpha.
 */
const applyAlpha = (hex, alpha = 1) => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
