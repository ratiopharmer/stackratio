// Full-screen scene behind every page: realistic capsules, tablets and test vials plus fine dust,
// flying towards the camera (scrolling pushes it forward through them), and one glowing particle object above it that morphs between shapes
// (testosterone molecule, ring, vial, syringe, blood drop, brain, capsule, tablet). Pages pick the shape with
// <canvas class="field" data-shape="…">; the stack page switches it per scroll section via
// window.field.shape(name, {x}). The pointer ripples the field and pushes particles aside,
// a click bursts the object, and when left alone the scene calms down.
(() => {
  const cv = document.querySelector('canvas.field');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const small = matchMedia('(max-width: 900px)').matches;
  const N = small ? 3200 : 8000;
  const R = Math.random, TAU = Math.PI * 2;
  // clinical palette: mint, ice, frost, deep blue, white, and a soft violet for oxygen atoms
  const AMBER = [94, 234, 212], GOLD = [125, 211, 252], CREAM = [214, 244, 255], EMBER = [56, 189, 248], WHITE = [246, 252, 255], ROSE = [196, 181, 253];
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const sphere = () => { const u = R() * 2 - 1, t = R() * TAU, s = Math.sqrt(1 - u * u); return [s * Math.cos(t), u, s * Math.sin(t)]; };
  const rotZ = ([x, y, z], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (v) => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
  const warm = () => mix(AMBER, R() < .5 ? GOLD : CREAM, R());

  // ── Skeleton formulas: atoms [x, y, element] and bonds [a, b, double] ──
  function molecule(kind) {
    const atoms = [], bonds = [], at = new Map();
    const add = (x, y, el = 'C') => { const k = Math.round(x * 20) + ',' + Math.round(y * 20); if (!at.has(k)) { at.set(k, atoms.length); atoms.push([x, y, el]); } return at.get(k); };
    const bond = (a, b, d = false) => { const old = bonds.find(([p, q]) => (p === a && q === b) || (p === b && q === a)); if (old) old[2] = old[2] || d; else bonds.push([a, b, d]); };
    const ring = (cx, cy, n, start, side = 1) => {
      const r = side / (2 * Math.sin(Math.PI / n)), ids = [];
      for (let i = 0; i < n; i++) { const a = start + i * TAU / n; ids.push(add(cx + r * Math.cos(a), cy + r * Math.sin(a))); }
      ids.forEach((id, i) => bond(id, ids[(i + 1) % n]));
      return ids;
    };
    const sub = (from, dx, dy, el = 'C', d = false) => { const [x, y] = atoms[from]; const id = add(x + dx, y + dy, el); bond(from, id, d); return id; };
    const r3 = Math.sqrt(3);
    if (kind === 'steroid') {   // testosterone: rings A, B, C and the five-ring D, keto at C3, OH at C17, two methyls
      const A = ring(0, 0, 6, Math.PI / 6), B = ring(r3, 0, 6, Math.PI / 6), C = ring(r3 * 1.5, 1.5, 6, Math.PI / 6);
      const ap = 1 / (2 * Math.tan(Math.PI / 5)), D = ring(r3 * 1.5 + r3 / 2 + ap, 1.5, 5, Math.PI * .8);   // shares the right edge of C
      bond(A[4], A[5], true);                                   // C4=C5
      sub(A[3], -r3 / 2, -.5, 'O', true);                       // C3=O
      sub(B[2], 0, 1);                                          // C19 methyl
      sub(C[0], 0, 1);                                          // C18 methyl on C13
      sub(D[4], .31, .95, 'O');                                 // C17-OH
    } else if (kind === 'benzene') {
      const P = ring(0, 0, 6, Math.PI / 6); bond(P[0], P[1], true); bond(P[2], P[3], true); bond(P[4], P[5], true);
      sub(P[1], 0, 1, 'O');
    } else {   // two fused rings with a side chain
      const P = ring(0, 0, 6, Math.PI / 6), Q = ring(r3, 0, 6, Math.PI / 6);
      bond(P[2], P[3], true); const n = sub(Q[0], r3 / 2, -.5, 'N'); sub(n, r3 / 2, .5); sub(Q[1], 0, 1, 'O', true);
    }
    const xs = atoms.map((a) => a[0]), ys = atoms.map((a) => a[1]);
    const mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2;
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    atoms.forEach((a) => { a[0] = (a[0] - mx) / span; a[1] = (a[1] - my) / span; });
    return { atoms, bonds };
  }
  const STEROID = molecule('steroid');

  // ── Shapes: one point each call, [x, y, z, colour]; y up, roughly within ±1.2 ──
  const SHAPES = {
    steroid() {
      const { atoms, bonds } = STEROID, sc = 1.85, k = R();
      if (k < .22) {   // atoms
        const [x, y, el] = atoms[Math.floor(R() * atoms.length)], q = sphere(), d = Math.cbrt(R()) * (el === 'O' ? .07 : .045);
        return [x * sc + q[0] * d, y * sc + q[1] * d, q[2] * d, el === 'O' ? mix([235, 50, 50], [255, 120, 110], R() * .4) : mix([200, 205, 210], WHITE, R() * .5), el === 'O' ? 1.3 : 1.1];
      }
      const [a, b, dbl] = bonds[Math.floor(R() * bonds.length)], t = R(), A = atoms[a], B = atoms[b];
      let x = A[0] + (B[0] - A[0]) * t, y = A[1] + (B[1] - A[1]) * t;
      const j = (R() - .5) * .012, line = dbl && R() < .5 ? .035 : 0;    // second line of a double bond
      const nx = -(B[1] - A[1]), ny = B[0] - A[0], nl = Math.hypot(nx, ny) || 1;
      x += (nx / nl) * (line + j); y += (ny / nl) * (line + j);
      return [x * sc, y * sc, (R() - .5) * .05, mix([170, 178, 186], [225, 230, 235], R()), .9];
    },
    logo() {   // the CurrentCycle mark: an outer and an inner open ring (opening to the right), solid tubes, mint to sky blue
      const outer = R() < .7, rad = outer ? .95 : .47, tube = outer ? .15 : .1, gap = outer ? .8 : 1;
      const a = gap + R() * (TAU - 2 * gap), t = R() * TAU, rr = tube * Math.sqrt(R());
      const x = (rad + rr * Math.cos(t)) * Math.cos(a), y = (rad + rr * Math.cos(t)) * Math.sin(a), z = rr * Math.sin(t) * 1.6;
      return [x, -y, z, mix([94, 234, 212], [56, 189, 248], clamp((x - y + 1.1) / 2.2, 0, 1)), 1.1];
    },
    ring() {   // flat glowing disc with a hole, like a seed ring
      const a = R() * TAU, r = .55 + Math.sqrt(R()) * .75;
      return [r * Math.cos(a), (R() - .5) * .07 * (1.4 - r), r * Math.sin(a), mix(GOLD, CREAM, R() * (r - .55))];
    },
    capsule() {
      const L = 1.1, r = .44, k = R();
      let p, half;
      if (k < .62) { const u = (R() - .5) * L, t = R() * TAU; p = [u, r * Math.cos(t), r * Math.sin(t)]; half = u; }
      else if (k < .9) { const s = sphere(), side = s[0] < 0 ? -1 : 1; p = [side * L / 2 + s[0] * r, s[1] * r, s[2] * r]; half = side; }
      else { const u = (R() - .5) * L * 1.2, q = sphere(), d = Math.cbrt(R()) * r * .8; return [...rotZ([u, q[1] * d, q[2] * d], .62), mix([235, 225, 200], WHITE, R() * .6)]; }
      return [...rotZ(p, .62), half < 0 ? mix([30, 90, 200], [70, 140, 240], R()) : mix([228, 230, 234], WHITE, R())];
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
      if (k < .42) { p = tube(.21, -.75 + R() * 1.25); c = mix([190, 205, 215], WHITE, R()); }                    // barrel
      else if (k < .6) { const r = Math.sqrt(R()) * .19; p = tube(r, -.1 + R() * .6); c = mix([200, 120, 30], [245, 185, 80], R()); }   // liquid
      else if (k < .7) { const r = Math.sqrt(R()) * .2; p = tube(r, -.1); c = mix([90, 95, 105], [140, 145, 155], R()); }         // plunger stopper
      else if (k < .78) { p = tube(.045, -1.35 + R() * .6); c = mix([190, 205, 215], WHITE, R()); }                    // rod
      else if (k < .86) { const r = Math.sqrt(R()) * .36; p = [-.77 + (R() - .5) * .03, r * Math.cos(t), r * Math.sin(t)]; c = mix([190, 205, 215], WHITE, R()); }   // flange
      else if (k < .9) { const r = Math.sqrt(R()) * .2; p = [-1.37, r * Math.cos(t), r * Math.sin(t)]; c = mix([190, 205, 215], WHITE, R()); }   // thumb rest
      else if (k < .94) { const u = R(); p = tube(.1 - u * .08, .5 + u * .14); c = mix([170, 175, 185], [220, 225, 230], R()); }  // hub
      else { p = tube(.012, .64 + R() * .75); c = mix([210, 215, 222], WHITE, R() * .5); }                             // needle
      return [...rotZ(p, .5), c];
    },
    drop() {
      const Rr = .6, yc = -.3, tan = .52, yt = -.023;
      let y, r;
      for (;;) { y = -.9 + R() * 1.9; r = y > yt ? (1 - y) * tan : Math.sqrt(Math.max(0, Rr * Rr - (y - yc) ** 2)); if (R() * .62 < r) break; }
      const t = R() * TAU, inner = R() < .15 ? Math.cbrt(R()) * .85 : 1;
      // blood red body, darker inside, a few light highlights near the tip and a thin ice rim of reflections
      const k2 = R(), c = inner < 1 ? mix([150, 10, 30], [220, 30, 55], R())
        : k2 < .1 ? mix([190, 205, 215], WHITE, R()) : k2 < .22 && y > .1 ? mix([255, 140, 150], [255, 200, 205], R()) : mix([200, 20, 45], [255, 60, 80], R());
      return [r * inner * Math.cos(t), y, r * inner * Math.sin(t), c, inner < 1 ? .9 : 1.05];
    },
    brain() {
      const k = R();
      if (k < .12) {   // cerebellum: low at the back, fine horizontal leaves
        const q = sphere(), x = -.58 + q[0] * .3, y = -.4 + q[1] * .17, z = q[2] * .42;
        const leaf = .5 + .5 * Math.sin(y * 70);
        return [x, y, z, mix([140, 85, 95], [235, 190, 195], .35 + .55 * leaf), .9];
      }
      if (k < .16) { const t = R() * TAU, y = -.42 - R() * .55; return [-.3 + (y + .42) * .25 + .09 * Math.cos(t), y, .09 * Math.sin(t), mix([170, 110, 120], [220, 170, 175], R()), .9]; }   // stem
      // cerebrum: long axis front (+x) to back, flatter underneath, a gap between the halves
      // only points on the gyri survive, so the sulci stay as dark grooves
      let q, g, side, x, y, z;
      for (let tries = 0; ; tries++) {
        q = sphere(); side = q[2] < 0 ? -1 : 1;
        x = q[0] * .98; y = q[1] * .64 + .1; z = side * (.07 + Math.abs(q[2]) * .44);
        g = brainFold(x * 8.5, y * 8.5, z * 8.5);
        if (g > .02 || tries > 25 || Math.abs(q[2]) < .08 && R() < .5) break;
      }
      if (y < -.18) y = -.18 + (y + .18) * .45;                       // flat base
      if (x > .4) { const n = (x - .4) / .6; z *= 1 - .18 * n; y -= .06 * n * n; }   // narrower frontal lobe
      if (x > -.15 && x < .35 && y < 0) { y -= .1 * Math.sin((x + .15) / .5 * Math.PI) * (-y / .4); }   // temporal lobe bulge
      const r = 1 + .04 * g;                                          // folds push the surface in and out
      const ridge = clamp(.5 + g, 0, 1);
      return [x * r, y * r, z * r, mix([150, 90, 100], [245, 200, 205], .25 + .75 * ridge), .8 + .5 * ridge];
    },
    user() {   // account: the classic person icon: a round head, a small gap, shoulders as a dome with a flat bottom edge
      const k = R(), tint = (y) => mix([94, 234, 212], [56, 189, 248], clamp((.9 - y) / 2, 0, 1));
      if (k < .36) {   // head: sphere, a few dots inside
        const q = sphere(), d = R() < .12 ? Math.cbrt(R()) : 1, x = q[0] * .4 * d, y = .5 + q[1] * .4 * d, z = q[2] * .4 * d;
        return [x, y, z, R() < .25 ? mix(tint(y), WHITE, .6) : tint(y), d < 1 ? .8 : 1.1];
      }
      if (k < .44) {   // flat bottom edge of the shoulders (a filled ellipse)
        const t = R() * TAU, r = Math.sqrt(R());
        return [Math.cos(t) * r * .98, -1.02, Math.sin(t) * r * .46, tint(-1.02), .9];
      }
      const q = sphere(), d = R() < .1 ? Math.cbrt(R()) : 1, up = Math.abs(q[1]);   // shoulders: upper half of a wide ellipsoid
      const y = -1.02 + up * .97 * d;   // top at -.05: a small gap below the head (bottom at .1), like the icon
      return [q[0] * .98 * d, y, q[2] * .46 * d, R() < .2 ? mix(tint(y), WHITE, .5) : tint(y), d < 1 ? .8 : 1.05];
    },
    tablet() {   // round pill with a score line across the top
      const k = R(), a = R() * TAU, r = .82, h = .16;
      if (k < .3) return [r * Math.cos(a), (R() - .5) * 2 * h, r * Math.sin(a), mix([190, 205, 215], WHITE, R())];
      const rr = Math.sqrt(R()) * r, top = R() < .5 ? 1 : -1, dome = h + .1 * (1 - (rr / r) ** 2);
      let x = rr * Math.cos(a), z = rr * Math.sin(a), y = top * dome;
      if (top > 0 && Math.abs(x) < .035) y -= .05;
      return [x, y, z, Math.abs(x) < .035 && top > 0 ? [170, 175, 180] : mix([190, 205, 215], WHITE, R())];
    },
  };
  const dirs = Array.from({ length: 9 }, () => { const d = sphere(), f = .8 + R() * 1.6; return [d[0] * f, d[1] * f, d[2] * f, R() * TAU]; });
  function brainFold(x, y, z) {
    let n = 0;
    for (const [a, b, c, ph] of dirs) n += Math.sin(a * x + b * y + c * z + ph);
    n /= 3;
    return .6 - Math.abs(n) * 1.6;   // ridged: thin dark grooves between round gyri
  }
  const cache = {};
  // Glowing-scan colouring: gold rim, violet/pink middle, white core (the blood drop keeps its red)
  const VIV_RIM = [[255, 196, 70], [255, 168, 50], [255, 214, 120]], VIV_MID = [[170, 120, 255], [232, 112, 200], [130, 140, 255]], VIV_CORE = [[255, 255, 255], [255, 245, 230]];
  const pick = (list) => list[Math.floor(R() * list.length)];
  function clinical(pts2) {
    const maxR = Math.max(...pts2.map((q) => Math.hypot(q[0], q[1], q[2]))) || 1;
    for (const q of pts2) {
      const t2 = Math.hypot(q[0], q[1], q[2]) / maxR + (R() - .5) * .18;
      q[3] = t2 > .82 ? pick(VIV_RIM) : t2 > .55 ? pick(VIV_MID) : pick(VIV_CORE);
    }
    return pts2;
  }
  const target = (name) => cache[name] ||= ((x) => x)(Array.from({ length: N }, () => (SHAPES[name] || SHAPES.ring)()));

  // Particles carry their own position and ease toward the current target
  const pts = Array.from({ length: N }, () => {
    const a = sphere(), far = 2.4 + R() * 2;
    const len = 1;
    return { x: a[0] * far, y: a[1] * far, z: a[2] * far, c: [...AMBER], s: 1, ph: R() * TAU, d: R(), bx: a[0], by: a[1], bz: a[2], bk: .6 + R() * .9, X: 0, Y: 0, len };
  });
  let cur = cv.dataset.shape || 'ring', switched = performance.now(), cx = cv.dataset.x === 'auto' || !cv.dataset.x ? 'auto' : +cv.dataset.x, cxNow = .66, cyF = +cv.dataset.y || .42, cyNow = cyF, sizeF = 1, sizeNow = 1;
  // Journey mode (canvas data-journey="logo,syringe,…"): all tab graphics stand one behind the other in depth;
  // the page sets the flight position with field.journey(f) (f = slide index, fractional while scrolling)
  const JOUR = cv.dataset.journey ? cv.dataset.journey.split(',').filter((n) => SHAPES[n]).map((name, k) => ({
    name, anchor: { logo: 'chest', syringe: 'tip', drop: 'cap', brain: 'head', capsule: 'belly' }[name] || 'shoulder',
    r: { logo: .075, brain: .07, capsule: .06 }[name] || .06, inScene: name === 'syringe' || name === 'drop',   // those two are the scene itself
    px: [0, 1.15, -1.05, .95, -.85, .8][k] || 0, py: [0, -.32, .26, -.22, .2, -.2][k] || 0,
    pts: Array.from({ length: small ? 1500 : 2600 }, () => { const q = SHAPES[name](); return [q[0], q[1], q[2], `rgb(${q[3].map((v) => v | 0).join(',')})`, q[4] || 1]; }),
  })) : null;
  let jTarget = 0, jNow = 0;
  const jPath = (f, key) => { const i = clamp(Math.floor(f), 0, JOUR.length - 1), j = Math.min(JOUR.length - 1, i + 1), k = smooth(clamp(f - i, 0, 1)); return JOUR[i][key] + (JOUR[j][key] - JOUR[i][key]) * k; };
  function drawJourney(now, dt) {
    if (window.anatomy?.p) jNow = window.anatomy.p() * (JOUR.length - 1);   // in step with the anatomy scene
    else jNow += (jTarget - jNow) * Math.min(1, dt / 420);
    const camX = jPath(jNow, 'px'), camY = jPath(jNow, 'py'), n = JOUR.length;
    // scroll zoom: scrolling punches the lens in (stronger the faster you scroll), it eases back when you stop
    zoomFly += (clamp(Math.abs(flyV), 0, .6) * 1.1 - zoomFly) * Math.min(1, dt / 140);
    const S0 = Math.min(W, H) * (small ? .24 : .25) * (1 + zoomFly * .55);
    const endShift = small ? 0 : smooth(clamp(jNow - (n - 2), 0, 1)) * .26;   // last slide (stack list on the left): object moves right
    const cxS = W * (.5 + endShift), cyS = H * (small ? .3 : .34) + endShift * H * .12;
    const anat = window.anatomy;
    const order = anat ? [...JOUR.keys()].sort((p, q) => Math.abs(q - jNow) - Math.abs(p - jNow)) : [...JOUR.keys()].reverse();
    for (const k of order) {   // far / waiting ones first, the active one last
      let Z, fade, sc, ox, oy, rot2 = 0, spinK = 1;   // rot2: extra screen rotation, spinK: how much it spins
      const J = JOUR[k];
      if (anat) {
        // anatomy mode: the scene shows the real thing first (syringe in the shoulder, blood in the capillary, the
        // glowing head, …); on the way to its tab the graphic lifts off exactly there and flies into the centre,
        // and when you scroll on it rises up and fades while the next scene begins
        const arrive = smooth(clamp((jNow - (k - .32)) / .32, 0, 1)), leave = smooth(clamp((jNow - k) / .4, 0, 1));
        if (J.name === 'capsule' || leave >= 1) continue;   // stack view: the body itself is the picture
        const an = anat.at(J.anchor) || [cxS, cyS], ax = clamp(an[0], 24, W - 24), ay = clamp(an[1], 24, H - 24);
        if (J.name === 'syringe') {   // the syringe in the scene turns into the graphic: same place, angle and length, then it flies in
          // first half: fades in exactly over the real syringe (which fades out), second half: flies to the centre
          const a = clamp((jNow - (k - .32)) / .32, 0, 1), inn = smooth(clamp(a / .45, 0, 1)), a2 = smooth(clamp((a - .4) / .6, 0, 1));
          const st = anat.at('syrmid'), axs = anat.axis?.();
          if (a <= 0 || !st) continue;
          const sc0 = axs ? axs.len / 2.76 : S0 * .2;
          ox = st[0] + (cxS - st[0]) * a2; oy = st[1] + (cyS - st[1]) * a2 - leave * H * .3;
          sc = sc0 + (S0 - sc0) * a2; Z = a2 > .5 ? 1 : 9; fade = inn * (1 - leave);
          rot2 = axs ? (axs.ang + .5) * (1 - a2) : 0; spinK = a2;
        } else if (J.name === 'drop') {   // the drop that formed in the capillary turns into the graphic, then flies in
          const a = clamp((jNow - (k - .24)) / .24, 0, 1), inn = smooth(clamp(a / .45, 0, 1)), a2 = smooth(clamp((a - .4) / .6, 0, 1));
          const st = anat.at('drop'), axd = anat.dropAxis?.();
          if (a <= 0 || !st) continue;
          const sc0 = axd ? axd.len / 1.9 : S0 * .15;
          ox = st[0] + (cxS - st[0]) * a2; oy = st[1] + (cyS - st[1]) * a2 - leave * H * .3;
          sc = sc0 + (S0 - sc0) * a2; Z = a2 > .5 ? 1 : 9; fade = inn * (1 - leave);
          rot2 = axd ? (axd.ang + Math.PI / 2) * (1 - a2) : 0; spinK = a2;
        } else if (J.name === 'brain') {   // the brain stays inside the head at head size and fades in smoothly on the way up
          const inn = smooth(clamp((jNow - (k - .7)) / .7, 0, 1));
          if (inn <= 0) continue;
          ox = ax; oy = ay; sc = anat.size(J.anchor, .05) || S0 * .2; Z = 9; fade = inn * (1 - leave);
        } else {
          if (arrive <= 0) continue;
          const r0 = Math.min(S0, anat.size(J.anchor, J.r) || S0 * .15);
          ox = ax + (cxS - ax) * arrive; oy = ay + (cyS - ay) * arrive - leave * H * .3;
          sc = r0 + (S0 - r0) * arrive; Z = arrive > .5 ? 1 : 9; fade = Math.min(1, arrive * 1.6) * (1 - leave);
        }
      } else {
        Z = 1 + (k - jNow) * 3.2;
        if (Z < .32 || Z > 14) continue;
        fade = clamp((Z - .32) / .55, 0, 1) * clamp((14 - Z) / 7, 0, 1);
        sc = S0 / Z;
        ox = cxS + (J.px - camX) * S0 * 1.7 / Z; oy = cyS + (J.py - camY) * S0 * 1.7 / Z;
      }
      if (fade < .02 || !Number.isFinite(ox + oy + sc + Z)) continue;   // (anchors can be missing for a frame)
      if (Z < 3.5) {   // dark halo behind the nearer graphics, so the background never runs through them
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fade;
        const halo = ctx.createRadialGradient(ox, oy, sc * .25, ox, oy, sc * 1.85);
        halo.addColorStop(0, 'rgba(2,5,6,.92)'); halo.addColorStop(.5, 'rgba(2,5,6,.68)'); halo.addColorStop(1, 'rgba(2,5,6,0)');
        ctx.fillStyle = halo; ctx.fillRect(ox - sc * 1.9, oy - sc * 1.9, sc * 3.8, sc * 3.8);
        ctx.globalCompositeOperation = 'lighter';
      }
      const turn = (now / 1000 * .32 + k * 1.3) * spinK, cR = Math.cos(turn), sR = Math.sin(turn), tl = (tilts[J.name] ?? 0) + tiltX, cT = Math.cos(tl), sT = Math.sin(tl);
      const big = Math.max(.7, Math.min(2.4, 1 / Z)), streak = zoomFly * 26 / Math.max(.6, Z);   // motion streaks while zooming
      for (const q of J.pts) {
        const x1 = q[0] * cR + q[2] * sR, z1 = -q[0] * sR + q[2] * cR, y2 = q[1] * cT - z1 * sT, z2 = q[1] * sT + z1 * cT;
        const f = 3 / (3 + z2), r = Math.min(5, f * q[4] * (small ? 1.6 : 2) * big);
        let X = x1 * sc * f, Y = -y2 * sc * f;
        if (rot2) { const c2 = Math.cos(rot2), s2 = Math.sin(rot2), xr = X * c2 - Y * s2; Y = X * s2 + Y * c2; X = xr; }
        X += ox; Y += oy;
        ctx.globalAlpha = clamp(.5 + (1 - z2) * .4, .06, 1) * fade;
        ctx.fillStyle = q[3];
        if (streak > 1.5) {   // stretched away from the centre of view, like flying fast
          const dx = X - cxS, dy = Y - cyS, d = Math.hypot(dx, dy) || 1, L = streak * Math.min(1, d / (S0 * 2));
          ctx.save(); ctx.translate(X, Y); ctx.rotate(Math.atan2(dy, dx)); ctx.fillRect(-L, -r / 2, L + r, r); ctx.restore();
        } else ctx.fillRect(X - r / 2, Y - r / 2, r, r);
      }
    }
    ctx.globalAlpha = 1;
  }
  const SWAY = { steroid: .55, brain: .5, drop: 0, ring: 0, user: .45 };   // radians of sway instead of a full turn (0 = turn)
  const tilts = { ring: .5, tablet: .55, brain: .12 };

  // Realistic pills drifting towards the camera: glossy two-tone capsules, scored tablets and test vials
  // with label and crimp cap (painted once as sprites, then only stamped), plus a little fine dust.
  const FAR = 7, NEAR = .15;
  const spawn = (P, d) => Object.assign(P, { x: (R() - .5) * 7, y: (R() - .5) * 4.5, d });
  const pills = Array.from({ length: small ? 45 : 95 }, () => spawn({ c: R() < .22 ? [255, 90, 100] : [[94, 234, 212], [125, 211, 252], [255, 255, 255]][Math.floor(R() * 3)], ph: R() * TAU, s: .6 + R() * .9, a: R() * TAU, va: (R() - .5) * .6, cross: R() < .55 }, NEAR + R() * (FAR - NEAR)));
  const tint = (c, t, k) => c.map((v, i) => Math.round(v + (t[i] - v) * k)).join(',');
  const lin = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => gr.addColorStop(o, col)); return gr; };
  const PAINT = {
    vial(g, c, label) {
      g.fillStyle = lin(g, -10, 0, 10, 0, [[0, 'rgba(150,85,15,.85)'], [.35, 'rgba(235,165,60,.8)'], [.6, 'rgba(250,195,95,.75)'], [1, 'rgba(140,80,15,.85)']]);
      g.beginPath(); g.roundRect(-10, 3, 20, 20, [0, 0, 4, 4]); g.fill();
      g.fillStyle = 'rgba(255,225,150,.55)'; g.beginPath(); g.ellipse(0, 3, 10, 1.4, 0, 0, TAU); g.fill();
      g.fillStyle = lin(g, -11, 0, 11, 0, [[0, 'rgba(255,255,255,.22)'], [.12, 'rgba(255,255,255,.05)'], [.5, 'rgba(255,255,255,.02)'], [.85, 'rgba(255,255,255,.08)'], [1, 'rgba(255,255,255,.28)']]);
      g.beginPath(); g.roundRect(-11, -14, 22, 38, 4); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = .6; g.stroke();
      g.fillStyle = 'rgba(255,255,255,.12)';
      g.beginPath(); g.moveTo(-11, -12); g.quadraticCurveTo(-11, -16, -6, -17); g.lineTo(6, -17); g.quadraticCurveTo(11, -16, 11, -12); g.closePath(); g.fill();
      g.fillRect(-6, -20, 12, 3);
      g.fillStyle = lin(g, -11, 0, 11, 0, [[0, 'rgba(170,170,165,.95)'], [.3, 'rgba(240,240,235,.95)'], [.7, 'rgba(232,232,226,.95)'], [1, 'rgba(150,150,145,.95)']]);
      g.fillRect(-11, -9, 22, 11);
      g.fillStyle = `rgba(${c},.9)`; g.fillRect(-11, -9, 22, 3);
      g.fillStyle = 'rgba(25,25,30,.85)'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '600 3.3px system-ui, sans-serif'; g.fillText(label, 0, -3.2);
      g.font = '2.4px system-ui, sans-serif'; g.fillText('250 mg/ml', 0, .1);
      g.fillStyle = lin(g, -8, 0, 8, 0, [[0, '#6d7076'], [.3, '#e9ecef'], [.55, '#b9bdc3'], [1, '#5c5f64']]);
      g.beginPath(); g.roundRect(-8, -25, 16, 6, 1); g.fill();
      g.fillStyle = lin(g, -8, 0, 8, 0, [[0, `rgb(${tint(c, [0, 0, 0], .45)})`], [.35, `rgb(${tint(c, [255, 255, 255], .3)})`], [1, `rgb(${tint(c, [0, 0, 0], .5)})`]]);
      g.beginPath(); g.roundRect(-8, -29, 16, 4.5, [2, 2, 0, 0]); g.fill();
      g.fillStyle = lin(g, 0, -12, 0, 22, [[0, 'rgba(255,255,255,0)'], [.3, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']]);
      g.fillRect(-8, -12, 1.4, 33);
    },
    cap(g, c, c2) {
      const half = (x, col, flip) => {
        g.save(); g.beginPath(); g.roundRect(x, -6.5, 19, 13, flip ? [0, 6.5, 6.5, 0] : [6.5, 0, 0, 6.5]); g.clip();
        g.fillStyle = lin(g, 0, -6.5, 0, 6.5, [[0, `rgb(${tint(col, [255, 255, 255], .35)})`], [.45, `rgb(${col.join(',')})`], [1, `rgb(${tint(col, [0, 0, 0], .55)})`]]);
        g.fillRect(x, -6.5, 19, 13); g.restore();
      };
      half(-19, c, false); half(0, c2, true);
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-.6, -6.5, 1.2, 13);
      g.fillStyle = lin(g, -15, 0, 15, 0, [[0, 'rgba(255,255,255,0)'], [.25, 'rgba(255,255,255,.7)'], [.75, 'rgba(255,255,255,.5)'], [1, 'rgba(255,255,255,0)']]);
      g.beginPath(); g.roundRect(-15, -4.6, 30, 1.8, .9); g.fill();
    },
    tab(g, c) {
      const base = c.map((v) => Math.round(v + (243 - v) * .75));
      const gr = g.createRadialGradient(-3, -3, 1, 0, 0, 10);
      gr.addColorStop(0, `rgb(${tint(base, [255, 255, 255], .6)})`); gr.addColorStop(.7, `rgb(${base.join(',')})`); gr.addColorStop(1, `rgb(${tint(base, [0, 0, 0], .45)})`);
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 9.5, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .8; g.beginPath(); g.arc(0, 0, 7.6, 0, TAU); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = .9; g.beginPath(); g.moveTo(-6, 0); g.lineTo(6, 0); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = .5; g.beginPath(); g.moveTo(-6, .8); g.lineTo(6, .8); g.stroke();
    },
  };
  const SIZE = { vial: [26, 58], cap: [40, 16], tab: [22, 22] }, RES = 6;
  const sprite = (kind, ...args) => {
    const [sw, sh] = SIZE[kind], c2 = document.createElement('canvas');
    c2.width = sw * RES; c2.height = sh * RES;
    const g = c2.getContext('2d'); g.scale(RES, RES); g.translate(sw / 2, sh / 2);
    PAINT[kind](g, ...args);
    return c2;
  };
  const CAPCOL = [[120, 170, 160], [130, 160, 180], [170, 130, 140], [150, 140, 175], [175, 160, 130], [205, 208, 210]];   // muted on purpose
  const VIALS = [[[170, 120, 130], 'TEST E'], [[110, 165, 155], 'TEST C'], [[120, 150, 175], 'TEST P'], [[140, 130, 170], 'TREN A'], [[170, 150, 115], 'NPP']];
  const SPRITES = {
    cap: Array.from({ length: 8 }, () => { const a1 = CAPCOL[Math.floor(R() * CAPCOL.length)]; let a2 = CAPCOL[Math.floor(R() * CAPCOL.length)]; if (a2 === a1) a2 = [238, 238, 232]; return sprite('cap', a1, a2); }),
    tab: CAPCOL.map((c) => sprite('tab', c)),
    vial: VIALS.map(([c, l]) => sprite('vial', c, l)),
  };
  const cells = Array.from({ length: 0 },   // pills switched off: the background stays clean so the object stands out
    () => {
    const r = R(), kind = r < .5 ? 'cap' : r < .8 ? 'tab' : 'vial', list = SPRITES[kind];
    return spawn({ kind, img: list[Math.floor(R() * list.length)], a: R() * TAU, va: (R() - .5) * .5, tum: R() * TAU, vt: .25 + R() * .7,
                   size: kind === 'vial' ? 1.1 : kind === 'cap' ? 1 : .7, ph: R() * TAU }, NEAR + R() * (FAR - NEAR));
  });
  let flyV = 0, zoomFly = 0;
  const CLOUDS = [
    { x: .78, y: .28, r: .62, c: [56, 189, 248], a: .09, ph: 0, sp: .05 },
    { x: .18, y: .82, r: .7, c: [94, 234, 212], a: .07, ph: 2, sp: .04 },
    { x: .55, y: .55, r: .5, c: [139, 92, 246], a: .05, ph: 4, sp: .06 },
    { x: .05, y: .12, r: .45, c: [125, 211, 252], a: .08, ph: 1, sp: .07 },
    { x: .95, y: .9, r: .5, c: [45, 212, 191], a: .09, ph: 3, sp: .05 },
  ];
  let swell = 0;   // extra speed from scrolling, eases out

  // ── State ──
  let W = 0, H = 0, raf = 0, last = 0, rot = 0, tiltX = 0, tiltY = 0, aimX = 0, aimY = 0;
  let px = -1e4, py = -1e4, spin = 0, lastScroll = scrollY, blastAt = -1e9, blastPow = 1, lastInput = performance.now(), sleep = 0;
  // 'auto': the middle between the text column and the right edge of the page frame (phones: centred)
  function freeX() {
    if (small) return .5;
    const r = document.querySelector('.wrap')?.getBoundingClientRect();
    if (!r) return .66;
    const right = Math.min(r.right, r.left + 660), edge = W - Math.max(20, W / 2 - 600);   // right edge of the page frame (where the nav ends)
    return (right + edge) / 2 / W;
  }
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const wake = (now) => { if (sleep > .6) { blastAt = now; blastPow = .25; } lastInput = now; };
  addEventListener('pointermove', (e) => {
    aimY = (e.clientX / innerWidth - .5) * .5; aimX = (e.clientY / innerHeight - .5) * .3; px = e.clientX; py = e.clientY;
    const card = e.target.closest?.('.glass');
    if (card) { const r = card.getBoundingClientRect(); card.style.setProperty('--mx', (e.clientX - r.left) + 'px'); card.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    wake(performance.now()); go();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { px = py = -1e4; });
  addEventListener('scroll', () => { const d = scrollY - lastScroll; spin += d * .0009; flyV += d * .0016; lastScroll = scrollY; wake(performance.now()); go(); }, { passive: true });
  addEventListener('keydown', () => wake(performance.now()));
  addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button, input, textarea, select, label, [role=button], .row, .eb, .drop, .chat, .glass')) return;
    const now = performance.now(); wake(now); blastAt = now; blastPow = 1; go();
  });

  function draw(now) {
    const dt = Math.min(50, now - (last || now)); last = now;
    const idle = (now - lastInput) / 1000;
    sleep += ((idle > 9 ? 1 : 0) - sleep) * Math.min(1, dt / (idle > 9 ? 1800 : 250));
    const calm = smooth(sleep), t = now / 1000;
    spin *= .93;
    rot += dt * .00025 * (1 - .8 * calm) + spin;
    tiltX += (aimX * (1 - calm) - tiltX) * .04; tiltY += (aimY * (1 - calm) - tiltY) * .04;
    cxNow += ((cx === 'auto' ? freeX() : cx) - cxNow) * Math.min(1, dt / 500); cyNow += (cyF - cyNow) * Math.min(1, dt / 500); sizeNow += (sizeF - sizeNow) * Math.min(1, dt / 500);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    // The ambient light (horizon arc, haze, grain) is plain CSS now (theme.css, "Ambient"); the canvas only draws the object.
    swell += (Math.min(1, Math.abs(flyV) * 3) - swell) * Math.min(1, dt / 400);

    // Pills
    {
      const fv2 = clamp(flyV, -.6, .6), step2 = dt / 1000 * .16 * (1 - .75 * calm) + fv2 * dt / 16.7 * .5;
      cells.sort((p, q) => q.d - p.d);
      ctx.globalCompositeOperation = 'source-over';
      for (const P of cells) {
        P.d -= step2; P.a += P.va * dt / 1000; P.tum += P.vt * dt / 1000;
        if (P.d < NEAR) spawn(P, P.d + FAR - NEAR); else if (P.d > FAR) spawn(P, P.d - (FAR - NEAR));
        const k = 1 / P.d, X = W / 2 + P.x * k * W * .3 + Math.sin(t * .25 + P.ph) * 10 * k, Y = H / 2 + P.y * k * H * .38 + Math.cos(t * .2 + P.ph) * 8 * k;
        const sz = Math.min(520, 165 * k * P.size), ar = P.img.height / P.img.width;
        const w2 = P.kind === 'vial' ? sz * .45 : sz, h2 = w2 * ar;
        if (X < -sz || X > W + sz || Y < -sz || Y > H + sz) continue;
        const near = clamp((P.d - NEAR) / .6, 0, 1), far = clamp((FAR - P.d) / 2.4, 0, 1);
        const al = Math.min(near, far) * clamp(.35 + k * .25, 0, .7) * (1 - .4 * calm);
        const behindText = !small && X < W * .46 ? .4 : small ? .55 : 1;   // keep the text side calm and readable
        if (al < .02) continue;
        const squash = .3 + .7 * Math.abs(Math.cos(P.tum));
        ctx.save(); ctx.translate(X, Y); ctx.rotate(P.a); ctx.scale(P.kind === 'vial' ? squash : 1, P.kind === 'vial' ? 1 : squash);
        if (P.d < 1.2) ctx.filter = `blur(${((1.2 - P.d) * 7).toFixed(1)}px)`;      // close: out of focus
        else if (P.d > 5) ctx.filter = `blur(${((P.d - 5) * 1.1).toFixed(1)}px)`;   // far: slightly soft
        ctx.globalAlpha = al * behindText;
        ctx.drawImage(P.img, -w2 / 2, -h2 / 2, w2, h2);
        ctx.restore(); ctx.filter = 'none'; ctx.globalAlpha = 1;
      }
    }

    // (floating crosses and capsules removed: one calm object on a quiet ambient, motionsites style)
    flyV *= Math.pow(.9, dt / 16.7);
    ctx.globalCompositeOperation = 'lighter';

    if (JOUR) { drawJourney(now, dt); raf = document.hidden ? 0 : requestAnimationFrame(draw); return; }
    // Object
    const tg = target(cur), since = (now - switched) / 1000;
    const bt = (now - blastAt) / 1000, blast = bt < 4 ? blastPow * 1.3 * (1 - Math.exp(-14 * bt)) * Math.exp(-2.4 * bt) : 0;
    const turn = SWAY[cur] ? Math.sin(rot * 2.2) * SWAY[cur] : rot;
    const tl = tilts[cur] ?? 0, cyR = Math.cos(turn + tiltY), syR = Math.sin(turn + tiltY), cX = Math.cos(tiltX + tl), sX = Math.sin(tiltX + tl);
    const zoomIn = 1 - .12 * Math.pow(1 - clamp(since / 1.4, 0, 1), 3);   // new shape grows in
    zoomFly += (clamp(Math.abs(flyV), 0, .6) * .35 - zoomFly) * Math.min(1, dt / 180);   // scrolling: object comes closer
    const S = Math.min(W, H) * (small ? .26 : .29) * sizeNow * zoomIn * (1 + zoomFly) * (1 + Math.sin(now / 2400) * .02 - .03 * calm);
    const top = (small ? 70 : 84) + S * 1.15, bottom = H - S * 1.15;   // never under the nav, never off the bottom
    const ox = W * cxNow, oy = clamp(H * cyNow, top, Math.max(top, bottom)) + Math.sin(now / 1600) * S * .03 * (1 - calm), reach = S * .35;
    // a soft dark halo behind the object: the busy background stays fully visible, but never runs through the object
    ctx.globalCompositeOperation = 'source-over';
    const halo = ctx.createRadialGradient(ox, oy, S * .25, ox, oy, S * 1.85);
    halo.addColorStop(0, 'rgba(2,5,6,.94)'); halo.addColorStop(.5, 'rgba(2,5,6,.72)'); halo.addColorStop(1, 'rgba(2,5,6,0)');
    ctx.fillStyle = halo; ctx.fillRect(ox - S * 1.9, oy - S * 1.9, S * 3.8, S * 3.8);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < N; i++) {
      const p = pts[i], q = tg[i];
      if (since > p.d * .35) {   // each particle sets off a little later: the shape dissolves into the next
        const k = 1 - Math.pow(.955, dt / 16.7);
        p.x += (q[0] - p.x) * k; p.y += (q[1] - p.y) * k; p.z += (q[2] - p.z) * k;
        p.c[0] += (q[3][0] - p.c[0]) * k; p.c[1] += (q[3][1] - p.c[1]) * k; p.c[2] += (q[3][2] - p.c[2]) * k;
        p.s += ((q[4] || 1) - p.s) * k;
      }
      const sw = since < 2 ? Math.sin(Math.PI * clamp((since - p.d * .35) / 1.4, 0, 1)) * .15 : 0;   // swirl while morphing
      const b = blast * p.bk;
      const x0 = p.x + p.bx * (b + sw), y0 = p.y + p.by * (b + sw * .5), z0 = p.z + p.bz * (b + sw);
      const x1 = x0 * cyR + z0 * syR, z1 = -x0 * syR + z0 * cyR, y2 = y0 * cX - z1 * sX, z2 = y0 * sX + z1 * cX;
      if (3 + z2 < 1.4) continue;   // too close to the camera (still flying in)
      const f = 3 / (3 + z2);
      let X = ox + x1 * S * f, Y = oy - y2 * S * f;
      const dx = X - px, dy = Y - py, d2 = dx * dx + dy * dy;
      if (d2 < reach * reach) { const d = Math.sqrt(d2) || 1, push = (1 - d / reach) ** 2 * reach * .5; X += dx / d * push; Y += dy / d * push; }
      const tw = 1 - (1 - .7 * calm) * (.45 - .45 * Math.sin(now / 520 + p.ph));
      const a = clamp((.5 + (1 - z2) * .4) * tw * (1 - .4 * calm), .06, 1);
      const r = Math.min(3.4, f * p.s * (small ? 1.6 : 2));
      ctx.fillStyle = `rgba(${p.c[0] | 0},${p.c[1] | 0},${p.c[2] | 0},${a.toFixed(2)})`;
      ctx.fillRect(X - r / 2, Y - r / 2, r, r);
    }
    raf = document.hidden ? 0 : requestAnimationFrame(draw);
  }
  function go() { if (!raf && !document.hidden) { last = 0; raf = requestAnimationFrame(draw); } }

  window.field = {
    journey(f) { jTarget = f; go(); },
    shape(name, opt = {}) {
      if (opt.x != null) cx = opt.x;
      if (opt.y != null) cyF = opt.y;
      if (opt.s != null) sizeF = opt.s;   // object size factor (1 = default)
      if (name === cur || !SHAPES[name]) return;
      cur = name; switched = performance.now();
      pts.forEach((p) => { p.d = R(); });
    },
  };
  // Headline comes in line by line, sliding up out of a mask
  document.querySelectorAll('h1.hero, .story h2').forEach((h) => {
    h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i)
      .map((line, i) => `<span class="ln"><span style="animation-delay:${(.12 + i * .11).toFixed(2)}s">${line}</span></span>`).join('');
  });
  size();
  addEventListener('resize', size);
  document.addEventListener('visibilitychange', go);
  go();
})();
