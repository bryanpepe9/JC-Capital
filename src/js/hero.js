/* ============================================================
   Hero — Three.js global network globe.
   A slowly rotating point-cloud sphere with luminous arcs that
   connect São Paulo to key international markets. Designed to be
   minimal, luxurious and light on the GPU.

   To tune the look: adjust GOLD, POINT_COUNT, or the CITIES list.
   ============================================================ */
import * as THREE from 'three'

const GOLD = 0xc9a96a
const IVORY = 0xf4f1ea

// lat, lng — São Paulo is the hub; arcs radiate to these markets.
const HUB = { lat: -23.55, lng: -46.63 } // São Paulo
const CITIES = [
  { lat: -34.6, lng: -58.38 },  // Buenos Aires
  { lat: 25.76, lng: -80.19 },  // Miami
  { lat: 40.71, lng: -74.0 },   // New York
  { lat: 51.5, lng: -0.12 },    // London
  { lat: 25.2, lng: 55.27 },    // Dubai
  { lat: 1.35, lng: 103.8 },    // Singapore
  { lat: 13.75, lng: 100.5 },   // Bangkok
]

function latLngToVec3(lat, lng, r) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

export function initHero() {
  const canvas = document.getElementById('heroCanvas')
  if (!canvas || !window.WebGLRenderingContext) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.matchMedia('(max-width: 720px)').matches
  const POINT_COUNT = isMobile ? 1100 : 2600
  const RADIUS = 1.7

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x0a0a09, 0.085)

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0, 5.2)

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const group = new THREE.Group()
  // Offset to the right so the globe sits behind the headline's negative space
  group.position.x = isMobile ? 0 : 1.0
  group.position.y = isMobile ? 0.6 : 0
  scene.add(group)

  /* —— Point-cloud sphere (Fibonacci distribution) —— */
  const positions = new Float32Array(POINT_COUNT * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < POINT_COUNT; i++) {
    const y = 1 - (i / (POINT_COUNT - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const t = golden * i
    positions[i * 3] = Math.cos(t) * r * RADIUS
    positions[i * 3 + 1] = y * RADIUS
    positions[i * 3 + 2] = Math.sin(t) * r * RADIUS
  }
  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const pMat = new THREE.PointsMaterial({
    color: GOLD, size: 0.021, sizeAttenuation: true, transparent: true, opacity: 0.92,
  })
  group.add(new THREE.Points(pGeo, pMat))

  /* —— Faint wireframe shell for structure —— */
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(RADIUS * 0.995, 2),
    new THREE.MeshBasicMaterial({ color: GOLD, wireframe: true, transparent: true, opacity: 0.08 })
  )
  group.add(shell)

  /* —— City markers + connecting arcs —— */
  const hubVec = latLngToVec3(HUB.lat, HUB.lng, RADIUS)
  const travellers = []

  const markerGeo = new THREE.SphereGeometry(0.022, 12, 12)
  const markerMat = new THREE.MeshBasicMaterial({ color: IVORY })
  const addMarker = v => { const m = new THREE.Mesh(markerGeo, markerMat); m.position.copy(v); group.add(m) }
  addMarker(hubVec)

  CITIES.forEach((c, idx) => {
    const cityVec = latLngToVec3(c.lat, c.lng, RADIUS)
    addMarker(cityVec)

    // Build a lifted great-circle-ish arc between hub and city
    const pts = []
    const STEPS = 60
    const mid = hubVec.clone().add(cityVec).multiplyScalar(0.5)
    const lift = 1 + hubVec.distanceTo(cityVec) * 0.32
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS
      const v = new THREE.Vector3().copy(hubVec).lerp(cityVec, t)
      // push outward, strongest at the midpoint
      const bulge = Math.sin(t * Math.PI) * (lift - 1)
      v.normalize().multiplyScalar(RADIUS + bulge)
      pts.push(v)
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    const arcGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80))
    const arc = new THREE.Line(
      arcGeo,
      new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.4 })
    )
    group.add(arc)

    // travelling pulse along the arc
    const dotGeo = new THREE.BufferGeometry()
    dotGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3))
    const dot = new THREE.Points(dotGeo, new THREE.PointsMaterial({
      color: IVORY, size: 0.055, transparent: true, opacity: 0.95, sizeAttenuation: true,
    }))
    group.add(dot)
    travellers.push({ curve, dot, offset: idx / CITIES.length, speed: 0.12 + Math.random() * 0.06 })
  })

  /* —— Sizing —— */
  function resize() {
    const w = canvas.clientWidth || canvas.offsetWidth
    const h = canvas.clientHeight || canvas.offsetHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener('resize', resize)

  /* —— Mouse parallax (tilt vertically, drift horizontally) —— */
  let tiltX = 0, driftX = 0
  const baseX = group.position.x
  if (!isMobile) {
    window.addEventListener('mousemove', e => {
      driftX = (e.clientX / window.innerWidth - 0.5) * 0.4
      tiltX = (e.clientY / window.innerHeight - 0.5) * 0.3
    }, { passive: true })
  }

  /* —— Render loop —— */
  const tmp = new THREE.Vector3()
  let t = 0
  let raf
  function render() {
    t += 0.0009
    group.rotation.y += 0.0012                              // continuous slow spin
    group.rotation.x += (tiltX - group.rotation.x) * 0.04   // ease toward mouse tilt
    group.position.x += (baseX + driftX - group.position.x) * 0.04

    travellers.forEach(tr => {
      const u = (t * tr.speed + tr.offset) % 1
      tr.curve.getPointAt(u, tmp)
      tr.dot.geometry.attributes.position.setXYZ(0, tmp.x, tmp.y, tmp.z)
      tr.dot.geometry.attributes.position.needsUpdate = true
      tr.dot.material.opacity = 0.4 + Math.sin(u * Math.PI) * 0.6
    })

    renderer.render(scene, camera)
    raf = requestAnimationFrame(render)
  }

  if (reduceMotion) {
    resize()
    renderer.render(scene, camera)
  } else {
    raf = requestAnimationFrame(render)
    // Pause when hero is offscreen to save battery
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting && !raf) raf = requestAnimationFrame(render)
        else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null }
      })
    }, { threshold: 0 })
    io.observe(canvas)
  }
}
