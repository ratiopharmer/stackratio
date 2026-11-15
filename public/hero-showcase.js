// The second view starts only when reached and stops when it leaves the screen.
(() => {
  const frame=document.querySelector('.kb2-win iframe');
  if(!frame) return;
  let visible=false;
  const sync=()=>{
    const on=visible && !document.hidden;
    if(on && !frame.hasAttribute('src')) frame.src=frame.dataset.src;
    const w=frame.contentWindow;
    if(!w?.ccCloud) return;
    on ? w.ccCloud.open(w.document.getElementById('brain')) : w.ccCloud.close();
  };
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0}).observe(frame);
  frame.addEventListener('load',sync);
  document.addEventListener('visibilitychange',sync);
})();
