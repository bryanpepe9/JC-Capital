/* ============================================================
   Operating Sectors — expanding panels.
   On a pointer device the hovered/focused panel expands and the
   others collapse, keeping exactly one open. Tap also works (touch),
   though on small screens CSS turns the row into a swipe carousel.
   ============================================================ */
export function initSectors() {
  const wrap = document.getElementById('sectorPanels')
  if (!wrap) return
  const panels = [...wrap.querySelectorAll('[data-panel]')]
  if (!panels.length) return

  const open = panel => panels.forEach(p => p.classList.toggle('is-open', p === panel))

  panels.forEach(panel => {
    panel.addEventListener('mouseenter', () => open(panel))
    panel.addEventListener('focus', () => open(panel))
    panel.addEventListener('click', () => open(panel))
    panel.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(panel) }
    })
  })
}
