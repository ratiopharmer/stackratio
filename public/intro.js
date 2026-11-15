// Opening animation (start page, once per visit): the two Cs draw themselves, a light runs once around them,
// then the mark pulls together and the page comes through. Never longer than ~2 s. Shown even with Windows'
// "reduce motion" on (short, no flashing) – that setting is on by default on many PCs.
(() => {
  try { if (sessionStorage.getItem('cc-intro')) return; sessionStorage.setItem('cc-intro', '1'); } catch { /* storage blocked: still show it */ }
  const css = `
  #cc-intro { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; background: #020506; pointer-events: none;
    animation: ccOut .55s cubic-bezier(.7,0,.3,1) 1.55s forwards; }
  #cc-intro::before { content: ''; position: absolute; width: 60vmin; height: 60vmin; border-radius: 50%;
    background: radial-gradient(closest-side, rgba(94,234,212,.12), transparent); animation: ccGlow 1.6s ease-out forwards; }
  #cc-intro svg { width: 112px; height: 112px; overflow: visible; animation: ccMark .55s cubic-bezier(.7,0,.3,1) 1.5s forwards; }
  #cc-intro .o, #cc-intro .i { fill: none; stroke-linecap: round; }
  #cc-intro .o { stroke: #90d5ff; stroke-width: 4; stroke-dasharray: 60; stroke-dashoffset: 60; animation: ccDraw .7s cubic-bezier(.65,0,.35,1) .1s forwards; }
  #cc-intro .i { stroke: #5eead4; stroke-width: 3.6; stroke-dasharray: 32; stroke-dashoffset: 32; animation: ccDraw .55s cubic-bezier(.65,0,.35,1) .45s forwards; }
  #cc-intro .ring { fill: none; stroke: rgba(255,255,255,.07); stroke-width: .6; }
  #cc-intro .orbit { transform-origin: 16px 16px; animation: ccSpin 1.05s cubic-bezier(.45,0,.2,1) .35s both; opacity: 0; }
  #cc-intro .orbit circle { fill: #e8fbff; filter: drop-shadow(0 0 2px #5eead4) drop-shadow(0 0 5px #5eead4); }
  @keyframes ccDraw { to { stroke-dashoffset: 0; } }
  @keyframes ccSpin { 0% { opacity: 0; transform: rotate(-90deg); } 12% { opacity: 1; } 88% { opacity: 1; } 100% { opacity: 0; transform: rotate(270deg); } }
  @keyframes ccGlow { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: scale(1); } }
  @keyframes ccMark { to { transform: scale(.82); opacity: 0; filter: blur(2px); } }
  @keyframes ccOut { to { opacity: 0; visibility: hidden; } }`;
  const box = document.createElement('div');
  box.id = 'cc-intro';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = `<style>${css}</style><svg viewBox="0 0 32 32">
    <circle class="ring" cx="16" cy="16" r="15"/>
    <path class="o" d="M24.5 7.5A12 12 0 1 0 24.5 24.5"/>
    <path class="i" d="M20.2 11A6.5 6.5 0 1 0 20.2 21"/>
    <g class="orbit"><circle cx="16" cy="1" r=".9"/></g></svg>`;
  document.documentElement.append(box);
  setTimeout(() => box.remove(), 2300);   // gone for good, whatever happens
})();
