// Phones: the menu shows only the current page plus a menu button; the button opens the full list
// (links added later, like the admin links on the account page, are part of it too)
(() => {
  const nav = document.querySelector('nav');
  if (!nav) return;
  // focus on the database: "database" stays the one word in the bar; the other tools become icons whose name shows on hover
  // (the name stays in the link as text, so screen readers and the German translation of i18n.js still get it);
  // the account turns into a person icon at the very right, next to Discord
  const ICON = {
    '/chat.html': '<path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/>',
    '/blut.html': '<path d="M12 3.5c3.4 4.4 5.8 7.6 5.8 10.6a5.8 5.8 0 0 1-11.6 0c0-3 2.4-6.2 5.8-10.6z"/><path d="M9.6 14.6a2.6 2.6 0 0 0 2.4 2.2"/>',

    '/konto.html': '<circle cx="12" cy="8.4" r="3.9"/><path d="M4.6 20.3c.6-3.9 3.6-6.3 7.4-6.3s6.8 2.4 7.4 6.3"/>',
  };
  if (!document.getElementById('nav-ic-css')) {
    const st = document.createElement('style'); st.id = 'nav-ic-css';
    st.textContent = `nav a.ic { position: relative; display: inline-flex; align-items: center; justify-content: center; padding: 6px 9px; }
      nav a.ic svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
      nav a.ic .tip { position: absolute; top: calc(100% + 9px); left: 50%; transform: translate(-50%, -3px); padding: 5px 9px; border-radius: 7px; background: rgba(10,14,16,.96);
        box-shadow: 0 0 0 1px rgba(255,255,255,.09), 0 8px 20px rgba(0,0,0,.45); color: var(--fg); font-size: 12px; line-height: 1.2; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .15s, transform .15s; }
      nav a.ic:hover .tip, nav a.ic:focus-visible .tip { opacity: 1; transform: translate(-50%, 0); }
      nav a[href="/konto.html"].ic .tip { left: auto; right: 0; transform: translate(0, -3px); } nav a[href="/konto.html"].ic:hover .tip, nav a[href="/konto.html"].ic:focus-visible .tip { transform: none; }
      nav a.db:not(.on) { color: var(--fg); box-shadow: inset 0 0 0 1px rgba(94,234,212,.45); }`;
    document.head.appendChild(st);
  }
  nav.querySelector('a[href="/brain.html"]')?.classList.add('db');
  for (const a of nav.querySelectorAll('a[href]')) {
    const svg = ICON[a.getAttribute('href')];
    if (!svg || a.classList.contains('ic')) continue;
    const label = a.textContent.trim();
    a.classList.add('ic');
    a.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${svg}</svg><span class="tip">${label}</span>`;
  }
  const acc = nav.querySelector('a[href="/konto.html"]'), dcl = nav.querySelector('a.dc');
  if (acc && dcl) dcl.after(acc);
  // admin button: only when logged in with an admin account (marker cookie set by the server at login)
  if (/(?:^|; )cc_adm=1(?:;|$)/.test(document.cookie) && !nav.querySelector('a[href="/admin"]')) {
    const adm = document.createElement('a');
    adm.href = '/admin'; adm.textContent = 'admin';
    adm.style.cssText = 'color:var(--pill);padding:2px 12px;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(94,234,212,.5)';
    const dc = nav.querySelector('a.dc');
    dc ? nav.insertBefore(adm, dc) : nav.append(adm);
  }
  // phones: the tabs scroll sideways (theme.css) instead of hiding in a menu; the current page is brought into view
  const cur = nav.querySelector('a.on');
  if (cur && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = Math.max(0, cur.offsetLeft - nav.clientWidth / 2 + cur.offsetWidth / 2);
})();

// Funnel for the admin (keys → funnel): one anonymous ping per step and day – no cookies, nothing stored in the browser,
// the server keeps only a daily-salted hash of the IP
window.ccHit = (e) => { try { navigator.sendBeacon('/api/hit', new Blob([JSON.stringify({ e })], { type: 'application/json' })); } catch { /* no beacon: not counted */ } };
(() => {
  const p = location.pathname;
  if (p === '/' || p === '/index.html') ccHit('home');
  else if (p === '/konto.html') ccHit('account');
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a'); if (!a) return;
    const h = a.getAttribute('href') || '';
    if (h === '/discord' || h.includes('discord.gg')) ccHit('discord');
    else if (h === '#access') ccHit('access');
  }, true);
})();
