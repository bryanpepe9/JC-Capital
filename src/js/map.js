/* ============================================================
   Global Network — interactive world map.

   Accurate country geometry (Natural Earth, via TopoJSON) projected
   with d3-geo and rendered as inline SVG so it stays crisp and fully
   styleable for the dark luxury theme. JC Capital's presence countries
   are highlighted in gold; pulsing city markers are linked by animated
   arcs radiating from the São Paulo hub. Hovering a marker — or a row in
   the region list beside it — highlights the matching location both ways.

   Geometry file: /public/data/countries-110m.json (Natural Earth 110m).
   To extend coverage, add country ids to ACTIVE and cities to CITIES.
   ============================================================ */
import { geoNaturalEarth1, geoPath, geoInterpolate } from 'd3-geo'
import { feature } from 'topojson-client'

const SVGNS = 'http://www.w3.org/2000/svg'
const NW = 1000   // nominal projection width; viewBox is cropped to the land below
const PADX = 6
const PADY = 12

// Country ids (Natural Earth / UN M49, zero-padded) to highlight.
// 156 = China.
const ACTIVE = new Set(['076', '032', '840', '826', '250', '276', '784', '764', '156'])
const ANTARCTICA = '010'

// Cities. `ri` is the 0-based index into the .region-list <li> below the map.
const HUB = { name: 'São Paulo', lat: -23.55, lng: -46.63, ri: 0, hub: true }
const CITIES = [
  HUB,
  { name: 'Buenos Aires', lat: -34.6, lng: -58.38, ri: 1 },
  { name: 'Miami', lat: 25.76, lng: -80.19, ri: 2 },
  { name: 'New York', lat: 40.71, lng: -74.0, ri: 2 },
  { name: 'London', lat: 51.5, lng: -0.12, ri: 3 },
  { name: 'Dubai', lat: 25.2, lng: 55.27, ri: 4 },
  { name: 'Shanghai', lat: 31.23, lng: 121.47, ri: 5 },
  { name: 'Singapore', lat: 1.35, lng: 103.8, ri: 5 },
  { name: 'Bangkok', lat: 13.75, lng: 100.5, ri: 5 },
]

const el = (name, attrs = {}) => {
  const node = document.createElementNS(SVGNS, name)
  for (const k in attrs) node.setAttribute(k, attrs[k])
  return node
}

export async function initMap() {
  const mount = document.getElementById('worldMap')
  if (!mount) return
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let topo
  try {
    const res = await fetch('/data/countries-110m.json')
    topo = await res.json()
  } catch (e) {
    console.warn('World map data failed to load:', e)
    return
  }

  const all = feature(topo, topo.objects.countries).features
  const land = all.filter(f => f.id !== ANTARCTICA)
  const fc = { type: 'FeatureCollection', features: land }

  // Fit to width, then crop the viewBox tightly to the drawn land so the map
  // fills the full horizontal space with no wasted ocean margins.
  const projection = geoNaturalEarth1().fitWidth(NW - PADX * 2, fc)
  const path = geoPath(projection)
  const [[bx0, by0], [bx1, by1]] = path.bounds(fc)
  const vbX = bx0 - PADX
  const vbY = by0 - PADY
  const vbW = bx1 - bx0 + PADX * 2
  const vbH = by1 - by0 + PADY * 2

  const svg = el('svg', {
    class: 'map__svg', viewBox: `${vbX.toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`,
    preserveAspectRatio: 'xMidYMid meet', role: 'img',
    'aria-label': 'Mapa-múndi com a presença internacional da JC Capital',
  })

  // —— Land ——
  const gLand = el('g', { class: 'map__land' })
  land.forEach(f => {
    const p = el('path', { d: path(f) || '' })
    p.setAttribute('class', ACTIVE.has(f.id) ? 'map__country map__country--active' : 'map__country')
    gLand.appendChild(p)
  })
  svg.appendChild(gLand)

  // —— Arcs (hub → each city) ——
  const gArcs = el('g', { class: 'map__arcs' })
  const hubPt = projection([HUB.lng, HUB.lat])
  const arcs = []
  CITIES.filter(c => !c.hub).forEach(c => {
    const interp = geoInterpolate([HUB.lng, HUB.lat], [c.lng, c.lat])
    const STEPS = 64
    let d = ''
    let prevX = null
    for (let i = 0; i <= STEPS; i++) {
      const pt = projection(interp(i / STEPS))
      if (!pt) continue
      const cmd = prevX === null || Math.abs(pt[0] - prevX) > NW * 0.5 ? 'M' : 'L'
      d += `${cmd}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`
      prevX = pt[0]
    }
    const arc = el('path', { class: 'map__arc', d })
    arc.dataset.ri = c.ri
    gArcs.appendChild(arc)

    // travelling pulse
    const pulse = el('circle', { class: 'map__pulse', r: 2.4, cx: hubPt[0], cy: hubPt[1] })
    pulse.dataset.ri = c.ri
    gArcs.appendChild(pulse)
    arcs.push({ arc, pulse, len: 0, offset: Math.random(), speed: 0.10 + Math.random() * 0.05 })
  })
  svg.appendChild(gArcs)

  // —— Markers ——
  const gMarks = el('g', { class: 'map__marks' })
  const markersByRi = new Map()
  CITIES.forEach(c => {
    const pt = projection([c.lng, c.lat])
    if (!pt) return
    const g = el('g', { class: 'map__mk' + (c.hub ? ' map__mk--hub' : ''), transform: `translate(${pt[0].toFixed(1)} ${pt[1].toFixed(1)})` })
    g.dataset.ri = c.ri
    g.appendChild(el('circle', { class: 'map__ring', r: c.hub ? 7 : 5 }))
    g.appendChild(el('circle', { class: 'map__dot', r: c.hub ? 4 : 2.8 }))
    // Only the São Paulo hub is labelled — other markers are anonymous points of
    // reach, so the map never reads as a list of offices in those cities.
    if (c.hub) {
      const label = el('text', { class: 'map__label', x: 0, y: -14, 'text-anchor': 'middle' })
      label.textContent = c.name
      g.appendChild(label)
    }
    gMarks.appendChild(g)

    if (!markersByRi.has(c.ri)) markersByRi.set(c.ri, [])
    markersByRi.get(c.ri).push(g)
  })
  svg.appendChild(gMarks)

  mount.innerHTML = ''
  mount.appendChild(svg)

  /* —— Two-way hover linkage with the region list —— */
  const regionItems = [...document.querySelectorAll('.region-list li')]
  const arcEls = [...gArcs.querySelectorAll('.map__arc, .map__pulse')]

  function highlight(ri, on) {
    if (ri == null) return
    ;(markersByRi.get(ri) || []).forEach(m => m.classList.toggle('is-active', on))
    arcEls.filter(a => +a.dataset.ri === ri).forEach(a => a.classList.toggle('is-active', on))
    regionItems[ri]?.classList.toggle('is-active', on)
  }

  CITIES.forEach(c => {
    ;(markersByRi.get(c.ri) || []).forEach(m => {
      m.addEventListener('mouseenter', () => highlight(c.ri, true))
      m.addEventListener('mouseleave', () => highlight(c.ri, false))
    })
  })
  regionItems.forEach((li, i) => {
    li.classList.add('is-linked')
    li.addEventListener('mouseenter', () => highlight(i, true))
    li.addEventListener('mouseleave', () => highlight(i, false))
  })

  /* —— Animate travelling pulses along the arcs —— */
  if (reduceMotion) return
  arcs.forEach(a => { try { a.len = a.arc.getTotalLength() } catch { a.len = 0 } })

  let raf = null
  let t = 0
  function frame() {
    t += 0.004
    arcs.forEach(a => {
      if (!a.len) return
      const u = (t * a.speed * 6 + a.offset) % 1
      const pt = a.arc.getPointAtLength(u * a.len)
      a.pulse.setAttribute('cx', pt.x.toFixed(1))
      a.pulse.setAttribute('cy', pt.y.toFixed(1))
      a.pulse.style.opacity = (0.25 + Math.sin(u * Math.PI) * 0.75).toFixed(2)
    })
    raf = requestAnimationFrame(frame)
  }
  // measure once layout is ready, then run
  requestAnimationFrame(() => {
    arcs.forEach(a => { try { a.len = a.arc.getTotalLength() } catch { a.len = 0 } })
    raf = requestAnimationFrame(frame)
  })

  // Pause when the map is off-screen
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting && !raf) raf = requestAnimationFrame(frame)
      else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null }
    })
  }, { threshold: 0 })
  io.observe(mount)
}
