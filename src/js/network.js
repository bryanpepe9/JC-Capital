/* ============================================================
   Global Network — lightweight 2D canvas constellation.
   An abstract orbital network: nodes on concentric rings linked
   by hairlines, with a pulse travelling between key nodes.
   Pure canvas (no Three.js) to keep this section feather-light.
   ============================================================ */
export function initNetwork() {
  const canvas = document.getElementById('networkCanvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const GOLD = '201, 169, 106'
  const IVORY = '244, 241, 234'

  let w, h, cx, cy, R, dpr
  let nodes = []
  let links = []

  function build() {
    dpr = Math.min(window.devicePixelRatio, 2)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    cx = w / 2; cy = h / 2
    R = Math.min(w, h) * 0.42

    // Nodes distributed on three rings + a centre hub
    nodes = [{ x: cx, y: cy, r: 3.4, hub: true, a: 0 }]
    const rings = [
      { count: 6, rad: R * 0.55, size: 2.2 },
      { count: 9, rad: R * 0.82, size: 1.8 },
      { count: 7, rad: R * 1.05, size: 2.4 },
    ]
    rings.forEach((ring, ri) => {
      for (let i = 0; i < ring.count; i++) {
        const a = (i / ring.count) * Math.PI * 2 + ri * 0.5
        nodes.push({
          baseA: a, rad: ring.rad, r: ring.size,
          speed: (0.02 + ri * 0.012) * (ri % 2 ? -1 : 1),
          x: 0, y: 0, ri,
        })
      }
    })

    // Links: connect hub to inner ring + neighbours on outer rings
    links = []
    nodes.forEach((n, i) => {
      if (i === 0) return
      if (n.ri === 0) links.push([0, i])
      // link to a node on the next ring for a web feel
      const next = nodes.findIndex((m, j) => j > i && m.ri === n.ri + 1)
      if (next > -1) links.push([i, next])
    })
  }

  // Travelling pulses along a subset of links
  const pulses = []
  function seedPulses() {
    pulses.length = 0
    for (let i = 0; i < 5; i++) {
      pulses.push({ link: Math.floor(Math.random() * links.length), t: Math.random(), speed: 0.004 + Math.random() * 0.004 })
    }
  }

  let t = 0
  function frame() {
    ctx.clearRect(0, 0, w, h)
    t += 1

    // position orbiting nodes
    nodes.forEach(n => {
      if (n.hub) { n.x = cx; n.y = cy; return }
      const a = n.baseA + (reduceMotion ? 0 : t * n.speed * 0.01)
      n.x = cx + Math.cos(a) * n.rad
      n.y = cy + Math.sin(a) * n.rad
    })

    // outer guide ring
    ctx.beginPath()
    ctx.arc(cx, cy, R * 1.05, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${GOLD}, 0.10)`
    ctx.lineWidth = 1
    ctx.stroke()

    // links
    ctx.lineWidth = 1
    links.forEach(([a, b]) => {
      const na = nodes[a], nb = nodes[b]
      const d = Math.hypot(na.x - nb.x, na.y - nb.y)
      const alpha = Math.max(0, 0.18 - d / (R * 14))
      ctx.beginPath()
      ctx.moveTo(na.x, na.y)
      ctx.lineTo(nb.x, nb.y)
      ctx.strokeStyle = `rgba(${GOLD}, ${alpha})`
      ctx.stroke()
    })

    // pulses
    if (!reduceMotion) {
      pulses.forEach(p => {
        const lk = links[p.link]
        if (!lk) return
        const na = nodes[lk[0]], nb = nodes[lk[1]]
        p.t += p.speed
        if (p.t > 1) { p.t = 0; p.link = Math.floor(Math.random() * links.length) }
        const x = na.x + (nb.x - na.x) * p.t
        const y = na.y + (nb.y - na.y) * p.t
        ctx.beginPath()
        ctx.arc(x, y, 1.6, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${IVORY}, ${0.5 + Math.sin(p.t * Math.PI) * 0.5})`
        ctx.fill()
      })
    }

    // nodes
    nodes.forEach(n => {
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      ctx.fillStyle = n.hub ? `rgba(${IVORY}, 0.95)` : `rgba(${GOLD}, 0.85)`
      ctx.fill()
      if (n.hub) {
        const pr = R * (0.12 + (Math.sin(t * 0.03) * 0.5 + 0.5) * 0.5)
        ctx.beginPath()
        ctx.arc(cx, cy, pr, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${IVORY}, ${0.25 * (1 - pr / (R * 0.62))})`
        ctx.stroke()
      }
    })

    raf = requestAnimationFrame(frame)
  }

  let raf
  function start() {
    build(); seedPulses()
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(frame)
  }

  start()
  window.addEventListener('resize', () => { build(); seedPulses() })

  // pause offscreen
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting && !raf) raf = requestAnimationFrame(frame)
      else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null }
    })
  }, { threshold: 0 })
  io.observe(canvas)
}
