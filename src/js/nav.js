/* ============================================================
   Navigation — hide-on-scroll header, scrolled state,
   mobile menu toggle, and smooth anchor scrolling.
   ============================================================ */
import { t } from './i18n.js'

export function initNav(lang = 'pt') {
  const header = document.getElementById('header')
  const toggle = document.getElementById('menuToggle')
  const menu = document.getElementById('mobileMenu')

  /* —— Header scroll behaviour —— */
  let lastY = window.scrollY
  const onScroll = () => {
    const y = window.scrollY
    header.classList.toggle('is-scrolled', y > 40)
    // hide when scrolling down (past hero), show when scrolling up
    if (y > lastY && y > 400 && !document.body.classList.contains('menu-open')) {
      header.classList.add('is-hidden')
    } else {
      header.classList.remove('is-hidden')
    }
    lastY = y
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  /* —— Mobile menu —— */
  const closeMenu = () => {
    document.body.classList.remove('menu-open')
    toggle.setAttribute('aria-expanded', 'false')
    menu.setAttribute('aria-hidden', 'true')
    toggle.setAttribute('aria-label', t(lang, 'aria.menuOpen'))
  }
  const openMenu = () => {
    document.body.classList.add('menu-open')
    toggle.setAttribute('aria-expanded', 'true')
    menu.setAttribute('aria-hidden', 'false')
    toggle.setAttribute('aria-label', t(lang, 'aria.menuClose'))
  }
  toggle?.addEventListener('click', () => {
    document.body.classList.contains('menu-open') ? closeMenu() : openMenu()
  })
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu))
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) closeMenu()
  })

  /* —— Smooth anchor scrolling (accounts for fixed header) —— */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href')
      if (id === '#' || id.length < 2) return
      const target = document.querySelector(id)
      if (!target) return
      e.preventDefault()
      const top = target.getBoundingClientRect().top + window.scrollY - 10
      window.scrollTo({ top, behavior: 'smooth' })
    })
  })
}
