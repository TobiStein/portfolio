/** Page background (`--paper` in src/assets/styles/tokens.css) for each mode, as hex:
 *  painted before the CSS loads and used as the browser chrome color (kept in sync manually). */
export const THEME_COLORS = { light: '#f4f6fb', dark: '#0b0f1e' } as const

/** Browser chrome color (theme-color meta) for a mode. */
export function themeColorHex(dark: boolean): string {
  return THEME_COLORS[dark ? 'dark' : 'light']
}
