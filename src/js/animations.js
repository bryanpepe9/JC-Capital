/* ============================================================
   GSAP scroll animations — reveals, headline splits, counters
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Split [data-reveal-words] headings into animatable word spans. */
export function initHeadlines(gsap) {
  document.querySelectorAll('[data-reveal-words]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/)
    el.innerHTML = words
      .map(w => `<span class="reveal-word-wrap"><span class="reveal-word">${w}</span></span>`)
      .join(' ')
  })

  // Style the wrappers (kept here so markup stays clean)
  const style = document.createElement('style')
  style.textContent =
    '.reveal-word-wrap{display:inline-block;overflow:hidden;vertical-align:top;}' +
    '.reveal-word{display:inline-block;transform:translateY(110%);}'
  document.head.appendChild(style)

  if (reduceMotion) {
    document.querySelectorAll('.reveal-word').forEach(w => (w.style.transform = 'none'))
  }
}

/* Generic fade/slide-in reveals + headline word staggers. */
export function initReveals(gsap, ScrollTrigger) {
  if (reduceMotion) {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'))
    return
  }

  // Simple element reveals (skip hero — handled by the intro timeline)
  document.querySelectorAll('[data-reveal]').forEach(el => {
    if (el.closest('.hero')) return
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => el.classList.add('is-in'),
    })
  })

  // Headline word reveals
  document.querySelectorAll('[data-reveal-words]').forEach(el => {
    if (el.closest('.hero')) return
    const words = el.querySelectorAll('.reveal-word')
    gsap.fromTo(words,
      { yPercent: 110, y: 0 },
      {
        yPercent: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }
    )
  })
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
