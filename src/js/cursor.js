/* ============================================================
   Custom cursor — dot + trailing ring, with hover states.
   Disabled automatically on touch / coarse-pointer devices.
   ============================================================ */
export function initCursor() {
  const cursor = document.getElementById('cursor')
  if (!cursor) return
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!fine) return

  const dot = cursor.querySelector('.cursor__dot')
  const ring = cursor.querySelector('.cursor__ring')

  let mx = window.innerWidth / 2, my = window.innerHeight / 2
  let rx = mx, ry = my

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`
  }, { passive: true })

  const loop = () => {
    rx += (mx - rx) * 0.16
    ry += (my - ry) * 0.16
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)

  // Hover affordances
  document.querySelectorAll('[data-cursor]').forEach(el => {
    const type = el.getAttribute('data-cursor')
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-active')
      if (type === 'view') cursor.classList.add('is-view')
    })
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-active')
      cursor.classList.remove('is-view')
    })
  })
}
