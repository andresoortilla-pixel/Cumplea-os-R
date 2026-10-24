(() => {
let cv = document.getElementById('warp');
if (!cv) { cv = document.createElement('canvas'); cv.id = 'warp'; document.body.prepend(cv); }
const c = cv.getContext('2d');
let W, H;
const rs = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
rs(); addEventListener('resize', rs);

// ===== Túnel a velocidad luz (estrellas + anillos de agujero de gusano) =====
window.startWarp = (swap) => {
  cv.classList.add('on');
  const S = Array.from({ length: 450 }, () => ({ a: Math.random() * 6.283, z: Math.random(), r: Math.random() }));
  const t0 = performance.now(), D = 4600; let swapped = false;
  (function f(now) {
    const t = Math.max(0, (now - t0) / D);
    if (t >= 1) { cv.classList.remove('on'); cv.style.opacity = ''; return; }
    const sp = t < .7 ? Math.pow(t / .7, 2.3) : Math.max(.15, 1 - (t - .7) / .3);
    const cx = W / 2, cy = H / 2, M = Math.hypot(W, H) / 2;
    c.fillStyle = `rgba(3,2,12,${.35 - sp * .2})`; c.fillRect(0, 0, W, H);
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, M * .6);
    g.addColorStop(0, `rgba(255,214,150,${.12 + sp * .6})`); g.addColorStop(.35, `rgba(255,90,140,${sp * .22})`); g.addColorStop(1, 'transparent');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // anillos ondulantes del túnel
    for (let k = 0; k < 16; k++) {
      const ph = (k / 16 + now * .0003 * (1 + sp * 9)) % 1, R = Math.pow(ph, 3) * M * 1.1;
      c.beginPath();
      for (let i = 0; i <= 80; i++) {
        const a = i / 80 * 6.283, w = 1 + .05 * Math.sin(a * 5 + now * .004 + k) * (.4 + sp);
        i ? c.lineTo(cx + Math.cos(a) * R * w, cy + Math.sin(a) * R * w * .92) : c.moveTo(cx + R * w, cy);
      }
      c.strokeStyle = `rgba(255,${170 + k * 4},${200 - k * 6},${(1 - ph) * .4 * sp})`; c.lineWidth = 1 + ph * 5; c.stroke();
    }
    // estrellas convertidas en estelas
    const m = Math.min(W, H) * .5;
    for (const s of S) {
      const z0 = s.z; s.z -= .004 + sp * .03;
      if (s.z <= .02) { s.z = 1; s.a = Math.random() * 6.283; }
      const q = z => (.04 + s.r) * m * 2.2 / (z * 3 + .3), z1 = s.z + .01 + sp * .22;
      const r0 = q(Math.min(z1, 1)), r1 = q(s.z);
      c.strokeStyle = `hsla(${s.r > .7 ? 42 : 215},90%,${72 + 28 * (1 - s.z)}%,${Math.min(1, 1.1 - s.z)})`;
      c.lineWidth = .6 + (1 - s.z) * 2.2;
      c.beginPath(); c.moveTo(cx + Math.cos(s.a) * r0, cy + Math.sin(s.a) * r0); c.lineTo(cx + Math.cos(s.a) * r1, cy + Math.sin(s.a) * r1); c.stroke();
    }
    // destello de salto y cambio de escena oculto tras él
    const fl = Math.max(0, 1 - Math.abs(t - .72) / .1);
    if (fl) { c.fillStyle = `rgba(255,244,232,${fl})`; c.fillRect(0, 0, W, H); }
    if (!swapped && t > .72) { swapped = true; swap(); }
    cv.style.opacity = Math.min(1, t / .06) * (t > .8 ? 1 - (t - .8) / .2 : 1);
    requestAnimationFrame(f);
  })(t0);
};

// ===== Regalo 3D real: caja de satén con tapa y lazo =====
const cg = document.getElementById('custom-gift');
if (cg) {
  const faces = (...n) => n.map(x => `<i class="f ${x}"></i>`).join('');
  cg.innerHTML = `<div class="g3d"><div class="box">${faces('fr', 'bk', 'lf', 'rt', 'bt')}</div>
    <div class="lid" id="lid">${faces('fr', 'bk', 'lf', 'rt', 'tp')}<div class="bow"><b></b><b></b><b></b><b></b><u></u></div></div>
    <div class="glow"></div></div><div class="gshadow"></div>`;
  const lid = cg.querySelector('#lid'); let go = false;
  // Física de la tapa: gravedad, rebote con pérdida de energía y giro libre
  new MutationObserver(() => {
    if (go || !cg.classList.contains('detonate')) return; go = true;
    let x = 0, y = 0, vx = 170, vy = -1250, rz = 0, vz = 420, rx = 0, vrx = 300, last = performance.now();
    const start = last;
    (function f(n) {
      const dt = Math.min((n - last) / 1000, .03); last = n;
      vy += 2800 * dt; x += vx * dt; y += vy * dt; rz += vz * dt; rx += vrx * dt;
      if (y > 150) { y = 150; vy *= -.42; vx *= .65; vz *= .55; vrx *= .5; }
      lid.style.transform = `translate3d(${x}px,${y}px,0) rotateZ(${rz}deg) rotateX(${rx}deg)`;
      if (n - start < 3000) requestAnimationFrame(f);
    })(start);
  }).observe(cg, { attributes: true, attributeFilter: ['class'] });
}
})();