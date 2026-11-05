// Inlined in <head>: one controller for first paint, controls and OS changes.
// Mode (system / light / dark) -> `dark` class, palette (fire / abyss) -> `data-palette`;
// page colors in `data-bg-<palette>-<scheme>`, read from tokens.css by BaseLayout.
;(() => {
  const root = document.documentElement
  const systemTheme = matchMedia('(prefers-color-scheme: dark)')
  const read = (key) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }
  const save = (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Switching still works when storage is unavailable.
    }
  }
  const modes = ['system', 'light', 'dark']
  const palettes = ['fire', 'abyss']
  const storedTheme = read('ink-theme')
  const storedPalette = read('ink-palette')
  let theme = modes.includes(storedTheme) ? storedTheme : root.dataset.defaultTheme
  let palette = palettes.includes(storedPalette) ? storedPalette : root.dataset.defaultPalette
  if (!modes.includes(theme)) theme = 'system'
  if (!palettes.includes(palette)) palette = palettes[0]

  const apply = () => {
    const dark = theme === 'dark' || (theme === 'system' && systemTheme.matches)
    root.classList.toggle('dark', dark)
    root.dataset.theme = theme
    root.dataset.palette = palette
    const background = root.getAttribute(`data-bg-${palette}-${dark ? 'dark' : 'light'}`)
    if (background) {
      root.style.backgroundColor = background
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background)
    }
  }
  let transitionTimer
  const transition = () => {
    root.classList.add('theme-switching')
    clearTimeout(transitionTimer)
    transitionTimer = setTimeout(() => root.classList.remove('theme-switching'), 300)
    apply()
  }
  apply()

  // Delegation binds before the header exists, keeping the first click responsive.
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return
    if (event.target.closest('#theme-toggle')) {
      theme = modes[(modes.indexOf(theme) + 1) % modes.length]
      save('ink-theme', theme)
      transition()
    } else if (event.target.closest('#palette-toggle')) {
      palette = palettes[(palettes.indexOf(palette) + 1) % palettes.length]
      save('ink-palette', palette)
      transition()
    }
  })
  systemTheme.addEventListener('change', () => {
    if (theme === 'system') apply()
  })
})()
