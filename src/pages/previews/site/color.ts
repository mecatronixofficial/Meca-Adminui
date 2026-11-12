/** Brand colour helpers for the website templates. */

export const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

/** Black or white, whichever reads better on `hex` (WCAG relative luminance). */
export function onColor(hex: string): string {
  if (!isHex(hex)) return "#ffffff";
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  // Contrast against white vs. against near-black ink
  return (1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.055 ? "#ffffff" : "#0b0d12");
}

/** Brand colours offered as one-tap swatches. */
export const SWATCHES = ["#e10600", "#2563eb", "#0f9f9a", "#7c3aed", "#15803d", "#ea580c", "#db2777", "#0b0d12"];
