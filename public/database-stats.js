/* One public counter snapshot shared by the homepage, Brain and same-origin tabs. */
(() => {
  'use strict';
  let latest=null, timer=0, pending=false, paintFrame=0, received=0;
  let channel=null;
  try { channel=new BroadcastChannel('cc-database-stats'); } catch { /* polling still works */ }
  const valid=n=>Number.isSafeInteger(n) && n>=0;
  const full=n=>n.toLocaleString(document.documentElement.lang==='de'?'de-DE':'en-US');
  function paint() {
    paintFrame=0;if(!latest) return;
    for(const [key,attr] of [['words_read','data-live-words'],['read','data-live-read']]) {
      if(!valid(latest.totals[key])) continue;
      document.querySelectorAll('['+attr+']').forEach(el=>{el.setAttribute('data-noi18n','');const text=full(latest.totals[key]);if(el.textContent!==text) el.textContent=text;});
    }
  }
  const schedule=()=>{if(!paintFrame) paintFrame=requestAnimationFrame(paint);};
  function accept(data,broadcast=true) {
    if(!data || !Number.isFinite(data.now) || data.now<=0 || !data.totals || !valid(data.totals.words_read)) return false;
    if(latest && data.now<=latest.now) return false;
    latest={now:data.now,totals:{words_read:data.totals.words_read,...(valid(data.totals.read)?{read:data.totals.read}:{})}};
    received=Math.min(Date.now(),data.now*1000);schedule();
    if(broadcast && channel) channel.postMessage({type:'snapshot',data:latest});
    return true;
  }
  if(channel) {
    channel.onmessage=event=>{const m=event.data;if(m?.type==='snapshot') accept(m.data,false);else if(m?.type==='request' && latest && Date.now()-received<15000) channel.postMessage({type:'snapshot',data:latest});};
    channel.postMessage({type:'request'});
  }
  window.ccDatabaseStats={accept};
  const poll=!!document.querySelector('script[data-stats-poll]');
  async function refresh() {
    clearTimeout(timer);
    if(!poll || document.hidden) return;
    if(!pending && Date.now()-received>=12000) {
      pending=true;
      try {const r=await fetch('/api/public/live',{cache:'no-store'});if(r.ok) accept(await r.json());} catch { /* retain last real value */ }
      finally {pending=false;}
    }
    if(!document.hidden) timer=setTimeout(refresh,15000);
  }
  function start() {
    new MutationObserver(changes=>{for(const change of changes) for(const node of change.addedNodes) if(node.nodeType===1 && (node.matches('[data-live-words],[data-live-read]') || node.querySelector('[data-live-words],[data-live-read]'))) {schedule();return;}}).observe(document.body,{subtree:true,childList:true});schedule();refresh();
  }
  document.addEventListener('visibilitychange',()=>{clearTimeout(timer);if(!document.hidden){received=0;schedule();refresh();}});
  addEventListener('pageshow',refresh);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
