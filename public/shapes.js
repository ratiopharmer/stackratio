// The same particle objects as the page backgrounds (field.js): brain (ai chat), capsule (account / stack), blood drop (bloodwork).
// Shape formulas are copied from field.js so the start page shows exactly the graphics of the feature pages.
// Usage: <canvas class="obj" data-shape="brain|capsule|drop|vial|syringe|tablet"></canvas> – each canvas draws its object, only while visible.
(() => {
  const R = Math.random, TAU = Math.PI * 2;
  const WHITE = [246, 252, 255];
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const sphere = () => { const u = R() * 2 - 1, t = R() * TAU, s = Math.sqrt(1 - u * u); return [s * Math.cos(t), u, s * Math.sin(t)]; };
  const rotZ = ([x, y, z], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dirs = Array.from({ length: 9 }, () => { const d = sphere(), f = .8 + R() * 1.6; return [d[0] * f, d[1] * f, d[2] * f, R() * TAU]; });
  function brainFold(x, y, z) {
    let n = 0;
    for (const [a, b, c, ph] of dirs) n += Math.sin(a * x + b * y + c * z + ph);
    n /= 3;
    return .6 - Math.abs(n) * 1.6;
  }
  const SHAPES = {
    capsule() {
      const L = 1.1, r = .44, k = R();
      let p, half;
      if (k < .62) { const u = (R() - .5) * L, t = R() * TAU; p = [u, r * Math.cos(t), r * Math.sin(t)]; half = u; }
      else if (k < .9) { const s = sphere(), side = s[0] < 0 ? -1 : 1; p = [side * L / 2 + s[0] * r, s[1] * r, s[2] * r]; half = side; }
      else { const u = (R() - .5) * L * 1.2, q = sphere(), d = Math.cbrt(R()) * r * .8; return [...rotZ([u, q[1] * d, q[2] * d], .62), mix([235, 225, 200], WHITE, R() * .6)]; }
      return [...rotZ(p, .62), half < 0 ? mix([30, 90, 200], [70, 140, 240], R()) : mix([228, 230, 234], WHITE, R())];
    },
    drop() {
      const Rr = .6, yc = -.3, tan = .52, yt = -.023;
      let y, r;
      for (;;) { y = -.9 + R() * 1.9; r = y > yt ? (1 - y) * tan : Math.sqrt(Math.max(0, Rr * Rr - (y - yc) ** 2)); if (R() * .62 < r) break; }
      const t = R() * TAU, inner = R() < .15 ? Math.cbrt(R()) * .85 : 1;
      const k2 = R(), c = inner < 1 ? mix([150, 10, 30], [220, 30, 55], R())
        : k2 < .1 ? mix([190, 205, 215], WHITE, R()) : k2 < .22 && y > .1 ? mix([255, 140, 150], [255, 200, 205], R()) : mix([200, 20, 45], [255, 60, 80], R());
      return [r * inner * Math.cos(t), y, r * inner * Math.sin(t), c, inner < 1 ? .9 : 1.05];
    },
    brain() {
      const k = R();
      if (k < .12) {
        const q = sphere(), x = -.58 + q[0] * .3, y = -.4 + q[1] * .17, z = q[2] * .42;
        const leaf = .5 + .5 * Math.sin(y * 70);
        return [x, y, z, mix([140, 85, 95], [235, 190, 195], .35 + .55 * leaf), .9];
      }
      if (k < .16) { const t = R() * TAU, y = -.42 - R() * .55; return [-.3 + (y + .42) * .25 + .09 * Math.cos(t), y, .09 * Math.sin(t), mix([170, 110, 120], [220, 170, 175], R()), .9]; }
      let q, g, side, x, y, z;
      for (let tries = 0; ; tries++) {
        q = sphere(); side = q[2] < 0 ? -1 : 1;
        x = q[0] * .98; y = q[1] * .64 + .1; z = side * (.07 + Math.abs(q[2]) * .44);
        g = brainFold(x * 8.5, y * 8.5, z * 8.5);
        if (g > .02 || tries > 25 || Math.abs(q[2]) < .08 && R() < .5) break;
      }
      if (y < -.18) y = -.18 + (y + .18) * .45;
      if (x > .4) { const n = (x - .4) / .6; z *= 1 - .18 * n; y -= .06 * n * n; }
      if (x > -.15 && x < .35 && y < 0) { y -= .1 * Math.sin((x + .15) / .5 * Math.PI) * (-y / .4); }
      const r = 1 + .04 * g, ridge = clamp(.5 + g, 0, 1);
      return [x * r, y * r, z * r, mix([150, 90, 100], [245, 200, 205], .25 + .75 * ridge), .8 + .5 * ridge];
    },
    vial() {
      const k = R(), t = R() * TAU, ring = (r, y) => [r * Math.cos(t), y, r * Math.sin(t)];
      if (k < .45) return [...ring(.42, -.8 + R() * 1.15), mix([190, 205, 215], WHITE, R())];
      if (k < .55) { const y = R() * .2; return [...ring(.42 - y / .2 * .26, .35 + y), mix([190, 205, 215], WHITE, R())]; }
      if (k < .6) return [...ring(.16, .55 + R() * .13), mix([190, 205, 215], WHITE, R())];
      if (k < .75) return [...ring(.23, .68 + R() * .22), mix([150, 155, 165], [225, 228, 232], R())];
      if (k < .78) { const r = Math.sqrt(R()) * .23; return [...ring(r, .9), mix([200, 40, 50], [235, 80, 80], R())]; }
      const r = Math.sqrt(R()) * .4;
      return [...ring(r, -.78 + R() * .7), mix([200, 120, 30], [245, 185, 80], R())];
    },
    syringe() {
      const k = R(), t = R() * TAU, tube = (r, x) => [x, r * Math.cos(t), r * Math.sin(t)];
      let p, c;
      if (k < .42) { p = tube(.21, -.75 + R() * 1.25); c = mix([190, 205, 215], WHITE, R()); }
      else if (k < .6) { const r = Math.sqrt(R()) * .19; p = tube(r, -.1 + R() * .6); c = mix([200, 120, 30], [245, 185, 80], R()); }
      else if (k < .7) { const r = Math.sqrt(R()) * .2; p = tube(r, -.1); c = mix([90, 95, 105], [140, 145, 155], R()); }
      else if (k < .78) { p = tube(.045, -1.35 + R() * .6); c = mix([190, 205, 215], WHITE, R()); }
      else if (k < .86) { const r = Math.sqrt(R()) * .36; p = [-.77 + (R() - .5) * .03, r * Math.cos(t), r * Math.sin(t)]; c = mix([190, 205, 215], WHITE, R()); }
      else if (k < .9) { const r = Math.sqrt(R()) * .2; p = [-1.37, r * Math.cos(t), r * Math.sin(t)]; c = mix([190, 205, 215], WHITE, R()); }
      else if (k < .94) { const u = R(); p = tube(.1 - u * .08, .5 + u * .14); c = mix([170, 175, 185], [220, 225, 230], R()); }
      else { p = tube(.012, .64 + R() * .75); c = mix([210, 215, 222], WHITE, R() * .5); }
      return [...rotZ(p, .5), c];
    },
    tablet() {
      const k = R(), a = R() * TAU, r = .82, h = .16;
      if (k < .3) return [r * Math.cos(a), (R() - .5) * 2 * h, r * Math.sin(a), mix([190, 205, 215], WHITE, R())];
      const rr = Math.sqrt(R()) * r, top = R() < .5 ? 1 : -1, dome = h + .1 * (1 - (rr / r) ** 2);
      let x = rr * Math.cos(a), z = rr * Math.sin(a), y = top * dome;
      if (top > 0 && Math.abs(x) < .035) y -= .05;
      return [x, y, z, Math.abs(x) < .035 && top > 0 ? [170, 175, 180] : mix([190, 205, 215], WHITE, R())];
    },
  };
  // same motion as field.js: the brain sways instead of turning, capsule and drop turn
  const SWAY = { brain: .5 }, TILT = { brain: .12 };
  const small = matchMedia('(max-width: 900px)').matches;
  document.querySelectorAll('canvas.obj').forEach((cv) => {
    const name = cv.dataset.shape, make = SHAPES[name];
    if (!make) return;
    const N = small ? 2600 : 5200, pts = Array.from({ length: N }, () => make());
    const g = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, run = false, raf = 0, rot = Math.random() * 6, last = 0;
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; };
    size(); addEventListener('resize', size);
    function draw(now) {
      raf = 0;
      if (!run) return;
      const dt = last ? Math.min(50, now - last) : 16; last = now;
      rot += dt * .00035;
      const turn = SWAY[name] ? Math.sin(rot * 2.2) * SWAY[name] : rot, tl = TILT[name] || 0;
      const cy = Math.cos(turn), sy = Math.sin(turn), cX = Math.cos(tl), sX = Math.sin(tl);
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      const S = Math.min(W, H) * (name === 'brain' ? .44 : .4), ox = W / 2, oy = H / 2 + Math.sin(now / 1600) * S * .03;
      for (let i = 0; i < N; i++) {
        const [x0, y0, z0, c, s = 1] = pts[i];
        const x1 = x0 * cy + z0 * sy, z1 = -x0 * sy + z0 * cy, y2 = y0 * cX - z1 * sX, z2 = y0 * sX + z1 * cX;
        const f = 3 / (3 + z2), X = ox + x1 * S * f, Y = oy - y2 * S * f;
        const a = clamp(.5 + (1 - z2) * .4, .06, 1), r = Math.min(3, f * s * (small ? 1.5 : 1.8));
        g.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(2)})`;
        g.fillRect(X - r / 2, Y - r / 2, r, r);
      }
      raf = requestAnimationFrame(draw);
    }
    new IntersectionObserver(([e]) => { run = e.isIntersecting; if (run && !raf) { last = 0; raf = requestAnimationFrame(draw); } }).observe(cv);
  });
})();
