/* ============================================================
   JC Capital — application entry
   Wires together preloader, navigation, scroll animations,
   the Three.js hero and the global-network canvas.
   ============================================================ */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { initCursor } from './cursor.js'
import { initNav } from './nav.js'
import { initReveals, initHeadlines, initCounters } from './animations.js'
import { initHero } from './hero.js'
import { initNetwork } from './network.js'
import { initForm } from './form.js'
import { detectLang, applyLang, initLangToggle } from './i18n.js'

gsap.registerPlugin(ScrollTrigger)

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const lang = detectLang()

/* —— Preloader ————————————————————————————————————————— */
function runPreloader(onDone) {
  const el = document.getElementById('preloader')
  const fill = document.getElementById('preloaderFill')
  const count = document.getElementById('preloaderCount')
  if (!el) return onDone()

  if (reduceMotion) {
    el.classList.add('is-done')
    document.body.classList.remove('is-loading')
    return onDone()
  }

  let p = 0
  const tick = () => {
    p += Math.max(1, (100 - p) * 0.06)
    if (p >= 100) p = 100
    fill.style.width = p + '%'
    count.textContent = String(Math.floor(p)).padStart(2, '0')
    if (p < 100) {
      requestAnimationFrame(tick)
    } else {
      setTimeout(() => {
        el.classList.add('is-done')
        document.body.classList.remove('is-loading')
        onDone()
      }, 350)
    }
  }
  requestAnimationFrame(tick)
}

/* —— Boot ——————————————————————————————————————————————— */
function boot() {
  // Footer year
  const yr = document.getElementById('year')
  if (yr) yr.textContent = new Date().getFullYear()

  initCursor()
  initNav(lang)
  initForm(lang)

  // Visual layers — wrapped so a failure never blocks the page
  try { initHero() } catch (e) { console.warn('Hero canvas disabled:', e) }
  try { initNetwork() } catch (e) { console.warn('Network canvas disabled:', e) }

  // Scroll-driven reveals
  initHeadlines(gsap)
  initReveals(gsap, ScrollTrigger)
  initCounters(gsap, ScrollTrigger)

  // Intro animation for the hero once everything is ready
  playHeroIntro()

  ScrollTrigger.refresh()
}

function playHeroIntro() {
  if (reduceMotion) {
    document.querySelectorAll('.hero [data-reveal], .hero [data-reveal-line] .line-inner')
      .forEach(el => { el.style.opacity = 1; el.style.transform = 'none' })
    return
  }
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.to('.hero__eyebrow', { opacity: 1, y: 0, duration: 0.8 }, 0.1)
    .fromTo('.hero__title .line-inner', { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.2)
    .to('.hero__sub', { opacity: 1, y: 0, duration: 0.9 }, 0.7)
    .to('.hero__actions', { opacity: 1, y: 0, duration: 0.9 }, 0.85)
}

document.body.classList.add('is-loading')
window.addEventListener('DOMContentLoaded', () => {
  // Apply the active language FIRST, before any text is split for animation
  applyLang(lang)
  initLangToggle(lang)

  // Wrap hero headline lines so they can slide up from a mask
  document.querySelectorAll('.hero__title .line').forEach(line => {
    line.innerHTML = `<span class="line-inner">${line.innerHTML}</span>`
  })
  runPreloader(boot)
})
