/* ============================================================
   GSAP scroll animations — reveals, headline splits, counters
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Split [data-reveal-words] headings into masked, staggered word spans.
   The reveal itself is pure CSS: each word sits below its overflow-hidden
   wrapper and slides up when the heading gains .is-in (toggled on scroll by
   initReveals, the same mechanism the body text uses). Opacity is never
   touched — the mask does the hiding — so a word can never get stuck invisible. */
export function initHeadlines(gsap) {
  document.querySelectorAll('[data-reveal-words]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/)
    el.innerHTML = words
      .map((w, i) => `<span class="reveal-word-wrap"><span class="reveal-word" style="transition-delay:${(i * 0.045).toFixed(3)}s">${w}</span></span>`)
      .join(' ')
  })

  // padding-bottom (+ equal negative margin) extends the overflow mask below the
  // baseline so serif descenders (g, p, ç) aren't clipped; the word starts at
  // 135% so it stays fully hidden behind the taller mask before revealing.
  const style = document.createElement('style')
  style.textContent =
    '.reveal-word-wrap{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.2em;margin-bottom:-0.2em;}' +
    '.reveal-word{display:inline-block;transform:translateY(135%);transition:transform .9s var(--ease);}' +
    '[data-reveal-words].is-in .reveal-word{transform:translateY(0);}'
  document.head.appendChild(style)

  if (reduceMotion) {
    document.querySelectorAll('[data-reveal-words]').forEach(el => el.classList.add('is-in'))
  }
}

/* Scroll-triggered reveals for body elements and headings alike. */
export function initReveals(gsap, ScrollTrigger) {
  if (reduceMotion) {
    document.querySelectorAll('[data-reveal], [data-reveal-words]').forEach(el => el.classList.add('is-in'))
    return
  }

  const reveal = (el, start) => {
    if (el.closest('.hero')) return
    ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => el.classList.add('is-in'),
    })
  }

  document.querySelectorAll('[data-reveal]').forEach(el => reveal(el, 'top 88%'))
  document.querySelectorAll('[data-reveal-words]').forEach(el => reveal(el, 'top 85%'))
}

/* Animated number counters for the BPA stats. */
export function initCounters(gsap, ScrollTrigger) {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count)
    const suffix = el.dataset.suffix || ''
    if (reduceMotion) { el.textContent = target + suffix; return }

    const obj = { v: 0 }
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.v) + suffix },
        })
      },
    })
  })
}
