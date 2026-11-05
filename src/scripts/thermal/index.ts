import { ThermalScene } from './engine'

/** Start the thermal ASCII background on `#thermal-field`, if the browser can draw it. */
export function mountThermal(): void {
  const canvas = document.getElementById('thermal-field')
  if (!(canvas instanceof HTMLCanvasElement)) return
  try {
    const scene = new ThermalScene(canvas)
    // Handy for profiling in development: `window.__thermal`
    if (import.meta.env.DEV) Object.assign(window, { __thermal: scene })
  } catch (error) {
    // The site stays fully usable without its background.
    canvas.remove()
    console.warn('[thermal] background disabled:', error)
  }
}
