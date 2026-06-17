/* ============================================================
   i18n — Portuguese (default) / English.

   • Default language resolution order:
       1. The visitor's saved choice (localStorage).
       2. The browser language — pt* → Portuguese, anything else → English.
          (This is the "render in PT from Brazil, EN from outside" behaviour,
           done via the browser locale so there is no network call, no flash
           and no third-party geo-IP dependency.)
       3. Portuguese, as the site default.

     ── To make Portuguese the default for EVERYONE (ignore step 2), replace
        the body of detectLang() with:  return 'pt'
   • Switching language persists the choice and reloads the page, which is the
     simplest way to cleanly re-run the GSAP headline splits and animations.
   ============================================================ */
import { translations } from './translations.js'

const STORAGE_KEY = 'jc-lang'

export function detectLang() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'pt' || saved === 'en') return saved

  const nav = (navigator.languages && navigator.languages[0]) || navigator.language || ''
  if (nav.toLowerCase().startsWith('pt')) return 'pt'
  return nav ? 'en' : 'pt'
}

/* Apply a language to the whole document. Run this BEFORE the headline
   splitting / animation setup in main.js. */
export function applyLang(lang) {
  const dict = translations[lang] || translations.pt
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'

  // innerHTML content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = dict[el.getAttribute('data-i18n')]
    if (v != null) el.innerHTML = v
  })
  // attribute translations
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const v = dict[el.getAttribute('data-i18n-aria')]
    if (v != null) el.setAttribute('aria-label', v)
  })
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const v = dict[el.getAttribute('data-i18n-alt')]
    if (v != null) el.setAttribute('alt', v)
  })

  // <title> + meta description
  if (dict['meta.title']) document.title = dict['meta.title']
  const md = document.querySelector('meta[name="description"]')
  if (md && dict['meta.desc']) md.setAttribute('content', dict['meta.desc'])
}

/* Convenience accessor for JS-side strings (e.g. form messages). */
export function t(lang, key) {
  return (translations[lang] && translations[lang][key]) || (translations.pt[key]) || key
}

/* Wire up the PT/EN toggle(s). Clicking the inactive language stores the
   choice and reloads. */
export function initLangToggle(currentLang) {
  document.querySelectorAll('[data-lang-toggle] [data-lang]').forEach(opt => {
    const lang = opt.getAttribute('data-lang')
    opt.classList.toggle('is-active', lang === currentLang)
    opt.addEventListener('click', () => {
      if (lang === currentLang) return
      localStorage.setItem(STORAGE_KEY, lang)
      location.reload()
    })
  })
}
