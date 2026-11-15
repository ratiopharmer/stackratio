/* Knowledge cloud for the admin panel (tab "cloud").
   window.ccCloud.open(container) mounts it on first use, then resumes; close() pauses rendering.
   Labels, clusters and texts live in STATIC below; every number comes from GET /api/admin/cloud (cloud.py),
   (cached 10 min); the public page (brain.html) uses /api/public/*. Three.js r128 is self-hosted. */
(() => {
  'use strict';
  const STATIC = {
    palette: { dust: ['#5eead4', '#7dd3fc', '#2f8f86', '#a7f3e4', '#90d5ff'], veil: ['#0f4c47', '#145a63', '#0b3a3a'], core: '#effffb', line: '#5eead4', pulse: '#e8fbff' },
    clusters: [
      { id: 'base', label: 'Androgen base', color: '#5eead4', center: [-0.4, 0.12, 0.0], spread: 0.55, lobe: 'stem', lobeName: 'Brainstem & hypothalamus' },
      { id: 'anabolic', label: 'Anabolics', color: '#7dd3fc', center: [-1.2, 2.1, 0.0], spread: 0.85, lobe: 'par', lobeName: 'Parietal lobe' },
      { id: 'estrogen', label: 'Estrogen & PCT', color: '#f5b8c4', center: [0.5, -0.75, 2.0], spread: 0.75, lobe: 'tmp', lobeName: 'Temporal lobe' },
      { id: 'blood', label: 'Bloodwork', color: '#f2727f', center: [-3.1, 0.7, 0.0], spread: 0.7, lobe: 'occ', lobeName: 'Occipital lobe' },
      { id: 'peptide', label: 'GH & peptides', color: '#f5b84b', center: [-2.05, -1.25, 0.0], spread: 0.85, lobe: 'cb', lobeName: 'Cerebellum' },
      { id: 'goals', label: 'Goals & sides', color: '#ece6da', center: [2.1, 1.3, 0.0], spread: 0.8, lobe: 'fr', lobeName: 'Frontal lobe' },
      { id: 'thought', label: 'Thought path', color: '#ffffff', center: [0.4, -3.2, 2.4], spread: 0 }
    ],
    nodes: [
      ['testosterone', 'Testosterone', 'base', 'Androgen and the base of almost every stack. The reference point of most notes.'],
      ['trt', 'TRT', 'base', 'Testosterone replacement: long-term, medically supervised use.'],
      ['cruise', 'Cruise', 'base', 'Low maintenance phase between two cycles.'],
      ['hcg', 'hCG', 'base', 'Hormone that keeps the body\'s own testicular function going.'],
      ['primobolan', 'Primobolan', 'anabolic', 'DHT-based anabolic, described as mild in the notes.'],
      ['nandrolone', 'Nandrolone', 'anabolic', '19-nor anabolic (Deca, NPP), mostly mentioned for bulking.'],
      ['trenbolone', 'Trenbolone', 'anabolic', 'Strong 19-nor anabolic, often tied to side effects in the notes.'],
      ['masteron', 'Masteron', 'anabolic', 'DHT derivative (drostanolone), popular when cutting.'],
      ['anavar', 'Anavar', 'anabolic', 'Oral anabolic (oxandrolone), common in cutting and beginner questions.'],
      ['dianabol', 'Dianabol', 'anabolic', 'Oral anabolic for bulking, strongly aromatising.'],
      ['winstrol', 'Winstrol', 'anabolic', 'DHT derivative (stanozolol), oral or injected.'],
      ['estradiol', 'Estradiol (E2)', 'estrogen', 'The main estrogen and the most frequent companion topic of testosterone.'],
      ['aromasin', 'Aromasin', 'estrogen', 'Aromatase inhibitor (exemestane).'],
      ['anastrozole', 'Anastrozole', 'estrogen', 'Aromatase inhibitor (Arimidex).'],
      ['pct', 'PCT', 'estrogen', 'Post-cycle therapy: the phase after coming off.'],
      ['nolvadex', 'Nolvadex', 'estrogen', 'SERM (tamoxifen), a PCT topic.'],
      ['prolactin', 'Prolactin', 'estrogen', 'Hormone discussed mainly with 19-nor compounds.'],
      ['clomid', 'Clomid', 'estrogen', 'SERM (clomiphene), a PCT topic.'],
      ['cabergoline', 'Cabergoline', 'estrogen', 'Dopamine agonist (cabergoline).'],
      ['bloodwork', 'Bloodwork', 'blood', 'Labs as the control instrument before, during and after a cycle.'],
      ['kidney', 'Kidney', 'blood', 'Kidney markers such as creatinine and eGFR.'],
      ['lipids', 'Lipids', 'blood', 'HDL, LDL and cholesterol: the cardiovascular markers.'],
      ['liver', 'Liver', 'blood', 'Liver markers such as ALT and AST, mostly with orals.'],
      ['hematocrit', 'Hematocrit', 'blood', 'Share of red blood cells; rises with androgens.'],
      ['bloodpressure', 'Blood pressure', 'blood', 'Blood pressure as the everyday marker.'],
      ['hgh', 'HGH', 'peptide', 'Growth hormone. The bridge between peptide and steroid topics.'],
      ['insulin', 'Insulin', 'peptide', 'Insulin and insulin sensitivity, often next to HGH.'],
      ['peptide', 'Peptides', 'peptide', 'Peptides in general.'],
      ['retatrutide', 'Retatrutide', 'peptide', 'GLP-1/GIP/glucagon agonist, a new cutting topic.'],
      ['bpc157', 'BPC-157', 'peptide', 'Peptide discussed for tendons and healing.'],
      ['tb500', 'TB-500', 'peptide', 'Peptide, almost always mentioned with BPC-157.'],
      ['tirzepatide', 'Tirzepatide', 'peptide', 'GLP-1/GIP agonist.'],
      ['semaglutide', 'Semaglutide', 'peptide', 'GLP-1 agonist.'],
      ['cut', 'Cut', 'goals', 'Cutting phase: lose fat, keep muscle.'],
      ['bulk', 'Bulk', 'goals', 'Building phase with a calorie surplus.'],
      ['libido', 'Libido', 'goals', 'Libido as feedback from the hormone balance.'],
      ['hairloss', 'Hair loss', 'goals', 'DHT-driven hair loss.'],
      ['sleep', 'Sleep', 'goals', 'Sleep quality and sleep problems.'],
      ['acne', 'Acne', 'goals', 'Acne on androgens.']
    ],
    thought: [],   // filled from the data (cloud.py THOUGHT): admins get names, texts and metrics, the public page only lengths
    bridges: [[2, 'testosterone'], [2, 'estradiol'], [2, 'bloodwork'], [3, 'hgh']],   // [step index of the thought path, term]
    linkMinForLine: 40,
    matrix: ['testosterone', 'estradiol', 'hgh', 'primobolan', 'nandrolone', 'trt', 'bloodwork', 'trenbolone'],
    matrixShort: ['TEST', 'E2', 'HGH', 'PRIM', 'NAND', 'TRT', 'BLOOD', 'TREN'],
    start: 'testosterone'
  };

  const CORE_IDS = new Set(STATIC.nodes.map((x) => x[0]));   // topics of the fixed list; auto_terms.py adds the rest at runtime

  const CSS = `
  #t-cloud { width: 100vw; margin-left: calc(50% - 50vw); margin-top: 0; }
  /* cloud tab: slim admin bar with the same space above and below, the brain starts right under it */
  .adm:has(#t-cloud:not([hidden])) { padding-top: calc(12px + env(safe-area-inset-top)); }
  .adm:has(#t-cloud:not([hidden])) .top { margin-bottom: 12px; }
  .adm:has(#t-cloud:not([hidden])) .msg:empty { display: none; }
  .cl { --void:#030607; --gold:#5eead4; --amber:#7dd3fc; --copper:#2f8f86; --ivory:#ece6da; --cdim:#8a979e; --cfaint:#7d8a90; --rule:rgba(94,234,212,.13);
    --mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; background: var(--void); color: var(--ivory); border-top: 1px solid var(--rule); }
  .cl button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
  /* clean: the brain is the page; the old panel rows below are gone (their content lives in the stage: legend, side panel, log stack) */
  .cl-live, .cl-dash { display: none !important; }
  .cl-livel { margin-top: 6px; font: 400 12px/1.5 var(--f, system-ui); color: var(--cdim); pointer-events: none; } .cl-livel b { font-weight: 500; color: var(--ivory); }
  .cl-livel i { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #5eead4; margin-right: 7px; vertical-align: 1px; opacity: .8; }
  .cl-stage { position: relative; height: max(460px, calc(100vh - 70px)); overflow: hidden; touch-action: none; cursor: grab;
    background: var(--void); }
  .cl-stage.drag { cursor: grabbing; }
  .cl-stage canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .cl-stage::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(130% 100% at 45% 45%, transparent 55%, rgba(1,4,5,.85) 100%); }
  .cl-ov { position: absolute; inset: 0; z-index: 2; pointer-events: none; } .cl-ov svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .cl-head { position: absolute; z-index: 3; top: 66px; left: max(20px, env(safe-area-inset-left)); pointer-events: none; max-width: 70%; }
  /* reference GUI (mindcorpus): search top left, View panel top right, topic legend bottom left; flat, thin, no glow */
  .cl-top { position: absolute; z-index: 5; top: 16px; left: max(20px, env(safe-area-inset-left)); right: max(20px, env(safe-area-inset-right)); display: flex; justify-content: space-between; align-items: start; pointer-events: none; }
  .cl-top > * { pointer-events: auto; }
  .cl-search { position: relative; width: min(280px, 60vw); }
  .cl-search input { width: 100%; box-sizing: border-box; height: 34px; padding: 0 12px; background: rgba(3,8,10,.75); border: 1px solid rgba(236,230,218,.12); border-radius: 4px; color: var(--ivory); font: 400 13px/1 var(--f, system-ui); outline: none; }
  .cl-search input:focus { border-color: rgba(236,230,218,.3); } .cl-search input::placeholder { color: var(--cfaint); }
  .cl-search ul { position: absolute; top: 38px; left: 0; right: 0; margin: 0; padding: 4px 0; list-style: none; background: rgba(3,8,10,.95); border: 1px solid rgba(236,230,218,.12); border-radius: 4px; }
  .cl-search li button { display: flex; justify-content: space-between; gap: 10px; width: 100%; padding: 6px 12px !important; font: 400 13px/1.3 var(--f, system-ui) !important; color: #dfe7ea !important; text-align: left; }
  .cl-search li button:hover, .cl-search li.on button { background: rgba(236,230,218,.06) !important; } .cl-search li small { color: var(--cfaint); font-size: 11px; }
  .cl-vbtn { height: 34px; padding: 0 14px !important; border: 1px solid rgba(236,230,218,.12) !important; border-radius: 4px; background: rgba(3,8,10,.75) !important; font: 400 13px/1 var(--f, system-ui) !important; color: var(--cdim) !important; }
  .cl-vbtn:hover, .cl-vbtn[aria-expanded="true"] { color: var(--ivory) !important; border-color: rgba(236,230,218,.3) !important; }
  .cl-view { position: absolute; z-index: 5; top: 58px; right: max(20px, env(safe-area-inset-right)); width: 240px; max-height: calc(100% - 120px); overflow-y: auto; padding: 14px 16px 16px; background: rgba(3,8,10,.92); border: 1px solid rgba(236,230,218,.12); border-radius: 4px; display: grid; gap: 8px; touch-action: pan-y; cursor: auto; }
  .cl-view[hidden] { display: none; }
  .cl-vh { margin: 6px 0 0; font: 500 11px/1 var(--f, system-ui); letter-spacing: .04em; color: var(--cdim); } .cl-vh:first-child { margin-top: 0; }
  .cl-themes { display: grid; gap: 3px; }
  .cl-themes button { display: grid; grid-template-columns: 64px 1fr; align-items: center; gap: 10px; padding: 5px 6px !important; border-radius: 3px; font: 400 12.5px/1 var(--f, system-ui) !important; color: #c3ccd1 !important; text-align: left; }
  .cl-themes button.on { color: var(--ivory) !important; box-shadow: inset 0 0 0 1px rgba(236,230,218,.25); } .cl-themes button:hover { background: rgba(236,230,218,.05) !important; }
  .cl-themes i { height: 6px; border-radius: 3px; }
  .cl-arrs { grid-template-columns: 1fr 1fr 1fr; } .cl-arrs button { grid-template-columns: 1fr !important; justify-items: center; }
  .cl-labels.arr .cl-clbl { display: none; }
  .cl-albl::before { display: none; } .cl-albl { color: rgba(236,240,242,.5); letter-spacing: .22em; }
  .cl-vrow { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 8px; font: 400 12.5px/1.2 var(--f, system-ui); color: #c3ccd1; }
  .cl-vrow input[type=range] { width: 96px; accent-color: #c3ccd1; } .cl-vrow input[type=checkbox] { accent-color: #c3ccd1; grid-column: 3; } .cl-vrow output { font: 400 11px/1 var(--mono); color: var(--cdim); min-width: 34px; text-align: right; }
  .cl-lf { display: grid; gap: 8px; min-width: 0; }
  .cl-legend { pointer-events: auto; display: grid; gap: 5px; max-width: min(760px, 70vw); }
  .cl-lh { font: 500 10.5px/1 var(--f, system-ui); letter-spacing: .06em; text-transform: uppercase; color: var(--cfaint); }
  #clLegend { display: flex; flex-wrap: wrap; gap: 0 12px; max-height: 56px; overflow: hidden; }
  #clLegend button { display: inline-flex; align-items: center; gap: 6px; min-height: 28px; font: 400 12px/1.3 var(--f, system-ui) !important; color: #c3ccd1 !important; white-space: nowrap; }
  #clLegend button:hover, #clLegend button.on { color: var(--ivory) !important; } #clLegend i { width: 7px; height: 7px; border-radius: 50%; background: var(--c); } #clLegend small { color: var(--cfaint); font: 400 11px/1 var(--mono); }
  @media (max-width: 760px) { .cl-legend { display: none; } .cl-head { top: 60px; } .cl-view { width: calc(100% - 40px); } }
  .cl-eye { font: 400 11px/1 var(--mono); letter-spacing: .22em; text-transform: uppercase; color: var(--cdim); }
  .cl-stat { margin-top: 8px; font: 400 11px/1.6 var(--mono); color: var(--cdim); font-variant-numeric: tabular-nums; } .cl-stat b { font-weight: 400; color: var(--gold); }
  .cl-leg { display: none !important; position: absolute; z-index: 3; top: 18px; right: max(20px, env(safe-area-inset-right)); left: auto; width: auto; height: auto; padding: 0; background: none; border: 0; display: grid; gap: 3px; justify-items: end; }   /* it is a <nav>: the site's nav bar style (full width + dark gradient) must not apply */
  .cl-leg button { display: flex; align-items: center; gap: 8px; font: 400 10.5px/1.5 var(--mono); letter-spacing: .06em; color: var(--cdim); transition: color .2s; }
  .cl-leg button:hover, .cl-leg button.on { color: var(--ivory); } .cl-leg i { width: 6px; height: 6px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px var(--c); }
  .cl-foot { position: absolute; z-index: 3; left: max(20px, env(safe-area-inset-left)); right: max(20px, env(safe-area-inset-right)); bottom: 14px; display: flex; justify-content: space-between; align-items: end; gap: 16px; pointer-events: none; }
  .cl-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  @media (max-width: 760px) { .cl-livel { display: none; } .cl-stat { margin-top: 6px; } .cl-lbl { font-size: 12px; } .cl-lbl small { font-size: 11px; } }
  .cl-hint { font: 400 11px/1.5 var(--mono); letter-spacing: .1em; color: var(--cfaint); text-transform: uppercase; transition: opacity 1.2s; } .cl-hint.gone { opacity: 0; }
  .cl-read { font: 400 10px/1.5 var(--mono); color: var(--cdim); text-align: right; font-variant-numeric: tabular-nums; }
  .cl-btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 6px; }
  .cl-btn { pointer-events: auto; font: 400 10px/1 var(--mono) !important; letter-spacing: .16em; text-transform: uppercase; color: var(--gold) !important; border: 1px solid var(--rule) !important; padding: 7px 10px !important; border-radius: 2px; transition: border-color .2s, background .2s; }
  .cl-btn:hover { border-color: rgba(94,234,212,.45) !important; background: rgba(94,234,212,.06) !important; }
  .cl-labels { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
  .cl-tm { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; margin-top: 5px; max-width: 260px; font-size: .9em; }
  .cl-tm .q { display: inline-flex; gap: 2px; } .cl-tm .q i { width: 5px; height: 5px; border-radius: 50%; background: rgba(214,224,228,.18); } .cl-tm .q i.on { background: var(--ui-tint, #5eead4); }
  .cl-tm .w { width: 44px; height: 3px; border-radius: 2px; background: rgba(214,224,228,.14); overflow: hidden; } .cl-tm .w u { display: block; height: 100%; background: var(--ui-tint, #5eead4); }
  .cl-tm .sy { display: inline-flex; align-items: center; gap: 5px; } .cl-tm .sy i { width: 6px; height: 6px; border-radius: 50%; background: var(--c); }
  .cl-blbl { position: absolute; left: 0; top: 0; margin: 0; padding: 0; border: 0; background: none; display: flex; align-items: center; gap: 6px; white-space: nowrap; pointer-events: auto; cursor: pointer; font: 500 calc(10.5px * var(--label-size, 1))/1 var(--sf, system-ui); letter-spacing: .04em; color: rgba(214,224,228,.62); text-shadow: 0 0 8px #000; opacity: 0; will-change: transform, opacity; transition: color .2s; }
  .cl-blbl i { width: 7px; height: 7px; border-radius: 50%; background: var(--c); box-shadow: 0 0 calc(4px + var(--g, 0) * 12px) var(--c); flex: none; }
  .cl-blbl small { color: rgba(214,224,228,.4); font-size: .9em; } .cl-blbl:hover, .cl-blbl.on { color: var(--ivory, #f4f1ea); } .cl-blbl.on small { color: var(--c); }
  .cl-blbl.live i { animation: clBeat 1.6s ease-in-out infinite; } @keyframes clBeat { 50% { transform: scale(1.7); opacity: .55; } }
  .cl-blbl.ping i { animation: clPing 1.2s ease-out; } @keyframes clPing { 0% { box-shadow: 0 0 0 0 var(--c); } 100% { box-shadow: 0 0 0 12px transparent; } }
  @media (prefers-reduced-motion: reduce) { .cl-blbl.live i, .cl-blbl.ping i { animation: none; } }
  .cl-labels.arr .cl-blbl, html.embed .cl-blbl, .cl-labels.nomarks .cl-blbl, .cl-labels.nolabels > :not(.cl-blbl) { display: none; }
  .cl-fly details.cl-sec { margin: 2px 0; } .cl-fly details.cl-sec > summary { font-size: 12px; } .cl-fly details.cl-sec .cl-vrow { padding-left: 10px; }
  .cl-lbl { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 6px; white-space: nowrap; will-change: transform, opacity; font: 400 11px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: rgba(236,240,242,.78); text-shadow: 0 0 6px #000, 0 0 2px #000; opacity: 0; }
  .cl-lbl::before { content: ''; width: 14px; height: 1px; background: rgba(94,234,212,.45); }
  .cl-lbl.hot { color: var(--gold); } .cl-lbl.sel { color: #effffb; } .cl-lbl small { font-size: 10px; letter-spacing: .04em; color: var(--cdim); text-transform: none; }
  .cl-clbl { position: absolute; left: 0; top: 0; white-space: nowrap; will-change: transform, opacity; font: 400 15px/1 var(--f, system-ui); letter-spacing: -.01em; color: rgba(94,234,212,.8); text-shadow: 0 0 10px #000; opacity: 0; }
  .cl-tip { position: absolute; z-index: 4; left: 0; top: 0; pointer-events: none; padding: 7px 9px 6px; border: 1px solid rgba(94,234,212,.25); background: rgba(3,8,10,.88); font: 400 10.5px/1.45 var(--mono); color: var(--ivory); opacity: 0; transition: opacity .15s; white-space: nowrap; }
  .cl-tip b { font-weight: 500; color: var(--gold); letter-spacing: .06em; } .cl-tip span { color: var(--cdim); }
  .cl-side { position: absolute; z-index: 4; top: 60px; right: max(20px, env(safe-area-inset-right)); bottom: 64px; width: min(360px, 42vw); overflow-y: auto; scrollbar-width: thin;
    padding: 16px 18px 18px; background: rgba(3,8,10,.9); border: 1px solid var(--rule); display: flex; flex-direction: column; gap: 10px; }
  .cl-side[hidden] { display: none; } .cl-side { touch-action: pan-y; overscroll-behavior: contain; cursor: auto; } .cl-side .cl-x { position: absolute; top: 8px; right: 10px; font: 400 16px/1 var(--mono); color: var(--cdim); } .cl-side .cl-x:hover { color: var(--ivory); }
  .cl-side .cl-threads button { text-align: left; color: #dfe7ea; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .cl-side .cl-threads button:hover, .cl-side .cl-threads li.on button { color: var(--gold); }
  .cl-fib { padding: 10px 12px; border: 1px solid rgba(94,234,212,.35); background: rgba(94,234,212,.05); display: grid; gap: 6px; }
  .cl-fib b { font: 400 13px/1.4 var(--f, system-ui); color: var(--ivory); } .cl-fib a { color: var(--gold); font: 400 10.5px/1.4 var(--mono); text-decoration: none; }
  .cl-state { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; font: 400 11px/1.5 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--cdim); pointer-events: none; }
  .cl-dash { border-top: 1px solid var(--rule); background: linear-gradient(180deg,#061012,var(--void) 40%); display: grid; grid-template-columns: 1fr 1.3fr 1fr .9fr .75fr 1.15fr; padding: 0 max(16px, env(safe-area-inset-right)) 18px max(16px, env(safe-area-inset-left)); }
  .cl-p { min-width: 0; padding: 14px 16px 12px; border-right: 1px solid var(--rule); display: flex; flex-direction: column; gap: 10px; } .cl-p:last-child { border-right: 0; }
  .cl-ph { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font: 400 9.5px/1 var(--mono); letter-spacing: .2em; text-transform: uppercase; color: var(--cdim); padding-bottom: 8px; border-bottom: 1px solid var(--rule); }
  .cl-ph span:last-child { letter-spacing: .06em; text-transform: none; color: var(--cfaint); }
  .cl-kick { font: 400 10px/1 var(--mono); letter-spacing: .16em; text-transform: uppercase; color: var(--c, var(--gold)); }
  .cl-name { margin: 3px 0 0; font: 400 28px/1 var(--f, system-ui); letter-spacing: -.02em; color: var(--ivory); }
  .cl-def { margin: 0; color: #c3ccd1; font-size: 13px; line-height: 1.5; max-width: 48ch; }
  .cl-stats { display: grid; grid-template-columns: repeat(3, auto); justify-content: start; gap: 4px 22px; margin: 0; font-variant-numeric: tabular-nums; }
  .cl-stats div { display: grid; gap: 3px; } .cl-stats dt { font: 400 10px/1 var(--mono); letter-spacing: .16em; text-transform: uppercase; color: var(--cfaint); } .cl-stats dd { margin: 0; font: 400 15px/1 var(--mono); color: var(--gold); }
  .cl-muted { margin: 0; font: 400 10.5px/1.5 var(--mono); color: var(--cfaint); }
  .cl-rows, .cl-threads { display: grid; gap: 3px; margin: 0; padding: 0; list-style: none; }
  .cl-row { display: grid; grid-template-columns: minmax(0,1fr) 70px 44px; align-items: center; gap: 10px; font: 400 10.5px/1.6 var(--mono); color: #c3ccd1; font-variant-numeric: tabular-nums; }
  .cl-row button { text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color .2s; } .cl-row button:hover { color: var(--gold); }
  .cl-bar { height: 2px; background: rgba(94,234,212,.1); position: relative; } .cl-bar i { position: absolute; inset: 0 auto 0 0; background: linear-gradient(90deg, var(--copper), var(--gold)); }
  .cl-n { text-align: right; color: var(--cdim); } .cl-row.on button, .cl-row.on .cl-n { color: var(--gold); }
  .cl-threads li { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 10px; align-items: baseline; font: 400 10.5px/1.55 var(--mono); font-variant-numeric: tabular-nums; }
  .cl-threads a { color: #dfe7ea; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color .2s; }
  .cl-threads a::after { content: ' ↗'; color: var(--cfaint); } .cl-threads a:hover { color: var(--gold); } .cl-threads span { color: var(--cdim); }
  .cl-steps { display: flex; flex-wrap: wrap; gap: 4px 6px; font: 400 9.5px/1.4 var(--mono); color: var(--cfaint); }
  .cl-steps button { color: var(--cdim); } .cl-steps button.on { color: var(--gold); } .cl-steps button:hover { color: var(--ivory); }
  .cl-chart { width: 100%; height: auto; display: block; } .cl-chart text { font-family: var(--mono); }
  .cl-key { display: flex; flex-wrap: wrap; gap: 4px 14px; font: 400 9.5px/1.3 var(--mono); color: var(--cdim); }
  .cl-key i { display: inline-block; width: 10px; height: 2px; margin-right: 6px; vertical-align: middle; background: var(--c); }
  /* crawler log as a card stack on the left of the brain (reference: "verdict stack"); newest on top, a beam into the brain per new note */
  .cl-stack { position: absolute; z-index: 3; left: max(20px, env(safe-area-inset-left)); top: 146px; bottom: 96px; width: 300px; display: flex; flex-direction: column; gap: 8px; overflow: hidden; pointer-events: none;
    -webkit-mask-image: linear-gradient(180deg, #000 78%, transparent); mask-image: linear-gradient(180deg, #000 78%, transparent); }
  .cl-sth { display: flex; justify-content: space-between; font: 500 11px/1 var(--f, system-ui); letter-spacing: .06em; text-transform: uppercase; color: var(--cfaint); }
  #clStackList { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
  #clStackList li { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 38px; gap: 2px 10px; padding: 8px 10px 8px 12px; background: rgba(8,14,17,.82); border: 1px solid rgba(236,230,218,.07); border-left: 2px solid var(--c); border-radius: 3px; }
  #clStackList li.fresh { animation: clCard .5s ease-out; } @keyframes clCard { from { transform: translateY(-14px); opacity: 0; } }
  #clStackList .tg { display: flex; align-items: center; gap: 8px; min-width: 0; font: 400 10px/1.2 var(--mono); color: var(--cfaint); }
  #clStackList .tg b { font-weight: 500; letter-spacing: .06em; color: #04090b; background: var(--c); padding: 2px 5px; border-radius: 2px; }
  #clStackList .tt { grid-column: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 400 12.5px/1.35 var(--f, system-ui); color: #dfe7ea; }
  #clStackList em { grid-column: 2; grid-row: 1 / span 2; align-self: center; justify-self: end; font: 500 22px/1 var(--mono); font-style: normal; color: var(--q); }
  #clBeams { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  @media (min-width: 761px) { .cl-live .cl-logp { display: none; } .cl-live { grid-template-columns: 1fr 1.5fr !important; } }
  @media (max-width: 760px) { .cl-stack { display: none; } }
  .cl-live { display: grid; grid-template-columns: .9fr 2.4fr 1.3fr; padding: 0 max(16px, env(safe-area-inset-right)) 4px max(16px, env(safe-area-inset-left)); border-top: 1px solid var(--rule); }
  .cl-live .cl-p:last-child { border-right: 0; }
  /* compact data rows: the brain gets the screen */
  .cl-live .cl-p, .cl-dash .cl-p { padding: 8px 14px 8px; gap: 6px; height: 158px; overflow: hidden; }
  .cl-live .cl-ph, .cl-dash .cl-ph { padding-bottom: 6px; }
  .cl-live .cl-chart, .cl-dash .cl-chart { height: 100px; }
  .cl-dash { padding-bottom: 10px; } .cl-dash .cl-name { font-size: 20px; } .cl-dash .cl-def { font-size: 12px; }
  .cl-feed li { line-height: 1.45; }
  .cl-chips { display: flex; flex-wrap: wrap; gap: 5px; }
  .cl-chips button { font: 400 10px/1 var(--mono) !important; letter-spacing: .06em; color: var(--cdim) !important; border: 1px solid var(--rule) !important; padding: 5px 7px !important; border-radius: 2px; }
  .cl-chips button:hover { color: var(--gold) !important; border-color: rgba(94,234,212,.45) !important; }
  .cl-lex { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
  .cl-lex button { display: grid; gap: 3px; width: 100%; text-align: left; padding: 7px 0 !important; border-bottom: 1px solid rgba(94,234,212,.07) !important; }
  .cl-lex b { font: 400 12.5px/1.4 var(--f, system-ui); color: #dfe7ea; transition: color .2s; } .cl-lex span { font-size: 11.5px; line-height: 1.45; color: var(--cdim); }
  .cl-lex button:hover b { color: var(--gold); }
  .cl-back { align-self: start; font: 400 13px/1.3 var(--f, system-ui) !important; color: var(--cdim) !important; } .cl-back:hover { color: var(--ivory) !important; }
  /* side panel: plain reading text, no tags or chips */
  .cl-sec { margin: 0; font: 400 13px/1.3 var(--f, system-ui); color: var(--c); }
  .cl-also { margin: 0; font-size: 13px; line-height: 1.55; color: var(--cdim); }
  .cl-also button, .cl-text .cl-term { color: var(--ivory) !important; border-bottom: 1px solid rgba(236,230,218,.25) !important; font: inherit !important; }
  .cl-also button:hover, .cl-text .cl-term:hover { border-color: var(--ivory) !important; }
  .cl-faqh { margin: 8px 0 0; font: 500 13px/1.3 var(--f, system-ui); color: var(--ivory); }
  .cl-faq { margin: 0; padding: 0; list-style: none; }
  .cl-faq li { border-top: 1px solid rgba(236,230,218,.08); }
  .cl-faq button, .cl-faq span { display: block; width: 100%; text-align: left; padding: 9px 0 !important; font: 400 13.5px/1.4 var(--f, system-ui) !important; color: #dfe7ea !important; }
  .cl-faq button:hover { color: #fff !important; }
  .cl-q { margin: 0; font: 400 18px/1.3 var(--f, system-ui); color: var(--ivory); letter-spacing: -.01em; }
  .cl-text { margin: 0; font-size: 13px; line-height: 1.6; color: #c3ccd1; }
  .cl-term { color: var(--gold) !important; border-bottom: 1px solid rgba(94,234,212,.35) !important; } .cl-term:hover { color: #effffb !important; }
  .cl-src { font: 400 10.5px/1.4 var(--mono); color: var(--gold); text-decoration: none; }
  #clLvToday { grid-template-columns: repeat(2, auto); }
  .cl-state[hidden] { display: none; }
  /* public page */
  .cl, .cl * { -webkit-user-select: none; user-select: none; } .cl input { -webkit-user-select: text; user-select: text; }   /* no text selection on the brain, the search field stays editable */
  .cl-blur { filter: blur(4px); user-select: none; pointer-events: none; overflow: hidden; text-overflow: clip; white-space: nowrap; }
  .cl-lexp { display: grid; gap: 3px; padding: 7px 0; border-bottom: 1px solid rgba(94,234,212,.07); white-space: normal; }
  .cl-lexp b { font: 400 12.5px/1.4 var(--f, system-ui); color: #dfe7ea; } .cl-lexp span { font-size: 11.5px; line-height: 1.45; color: var(--cdim); }
  .cl-unlock { align-self: start; font: 400 13px/1.3 var(--f, system-ui); color: var(--ivory); text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(236,230,218,.35); }
  .cl-unlock:hover { text-decoration-color: var(--ivory); }
  .cl.pub #clTerms, .cl.pub #clAct, .cl.pub #clAct + .cl-key, .cl.pub #clLvToday { filter: blur(4px); user-select: none; pointer-events: none; }
  @media (min-width: 1181px) { .cl.pub .cl-dash { grid-template-columns: 1fr 1.3fr 1fr .9fr .9fr; } }
  .cl.pub .cl-feed li { grid-template-columns: 58px 62px minmax(0,1fr) 28px; }
  .cl-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; vertical-align: 1px; background: var(--cfaint); }
  .cl-dot.on { background: var(--gold); box-shadow: 0 0 10px var(--gold); animation: clBlink 1.6s ease-in-out infinite; } .cl-dot.idle { background: #f5b84b; }
  @keyframes clBlink { 50% { opacity: .35; } }
  .cl-big { font: 400 15px/1.3 var(--mono); color: var(--ivory); } .cl-sub { font: 400 10.5px/1.5 var(--mono); color: var(--cdim); }
  .cl-feed { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
  .cl-feed li { display: grid; grid-template-columns: 58px 62px minmax(0,1fr) auto; gap: 10px; align-items: baseline; font: 400 10.5px/1.6 var(--mono); color: #c3ccd1; }
  .cl-feed li.fresh { animation: clIn .6s ease-out; } @keyframes clIn { from { background: rgba(94,234,212,.12); } }
  .cl-feed time, .cl-feed em { color: var(--cfaint); font-style: normal; } .cl-feed b { font-weight: 400; color: var(--c); }
  .cl-feed a { color: inherit; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .cl-feed a:hover { color: var(--gold); }
  @media (max-width: 1180px) { .cl-live { grid-template-columns: 1fr 1fr; } .cl-live .cl-p:nth-child(2) { grid-column: 1 / -1; order: -1; } }
  @media (max-width: 760px) { .cl-live { grid-template-columns: 1fr; } .cl-feed li { grid-template-columns: 48px 56px minmax(0,1fr); } .cl-feed em { display: none; } }
  @media (max-width: 1180px) { .cl-dash { grid-template-columns: 1.3fr 1fr 1fr; } .cl-p:nth-child(3) { border-right: 0; } .cl-p:nth-child(n+4) { border-top: 1px solid var(--rule); } }
  @media (max-width: 760px) { .cl-stage { height: 72vh; } .cl-live .cl-p, .cl-dash .cl-p { height: auto; max-height: 220px; } .cl-dash { grid-template-columns: 1fr; } .cl-p { border-right: 0; border-top: 1px solid var(--rule); padding-inline: 0; } .cl-p:first-child { border-top: 0; } .cl-leg, .cl-hint { display: none; } }
  /* -- Apple look (HIG): system type, Apple's dark label greys, glass only on the floating controls (search, View, panels),
     a segmented control for the arrangement, iOS switches and sliders, inset grouped lists, sentence case instead of spaced capitals -- */
  .cl { --sf: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif;
    --lab: #f5f5f7; --lab2: rgba(235,235,245,.64); --fill: rgba(118,118,128,.24); --fill2: rgba(118,118,128,.16); --sep: rgba(84,84,88,.55);
    --glass: rgba(30,30,32,.62); --tint: #5eead4; --green: #30d158; font-family: var(--sf); -webkit-font-smoothing: antialiased; }
  .cl, .cl button, .cl input { font-family: var(--sf) !important; letter-spacing: 0; }
  .cl-glass { background: var(--glass) !important; -webkit-backdrop-filter: blur(30px) saturate(180%); backdrop-filter: blur(30px) saturate(180%);
    border: .5px solid rgba(255,255,255,.14) !important; box-shadow: 0 10px 40px rgba(0,0,0,.45); }
  @media (prefers-reduced-transparency: reduce) { .cl-glass { background: #1c1c1e !important; -webkit-backdrop-filter: none; backdrop-filter: none; } }
  @media (prefers-contrast: more) { .cl-glass { border-color: rgba(255,255,255,.5) !important; } .cl { --lab2: rgba(235,235,245,.85); } }
  .cl-eye { font: 600 13px/1.2 var(--sf); letter-spacing: 0; text-transform: none; color: var(--lab); }
  .cl-eye::first-letter, .cl-btn::first-letter, .cl-hint::first-letter, .cl-state::first-letter, .cl-vbtn::first-letter { text-transform: uppercase; }
  .cl-stat { margin-top: 6px; font: 400 13px/1.5 var(--sf); color: var(--lab2); } .cl-stat b { font-weight: 600; color: var(--lab); }
  .cl-livel { font: 400 13px/1.5 var(--sf); color: var(--lab2); } .cl-livel b { font-weight: 600; color: var(--lab); }
  .cl-hint { font: 400 12px/1.4 var(--sf); letter-spacing: 0; text-transform: none; color: var(--lab2); }
  .cl-state { font: 400 15px/1.4 var(--sf); letter-spacing: 0; text-transform: none; color: var(--lab2); }
  .cl-lh, .cl-sth { font: 600 13px/1 var(--sf); letter-spacing: 0; text-transform: none; color: var(--lab2); }
  .cl-read { font: 400 12px/1.4 var(--sf); color: var(--lab2); }
  .cl-lbl { font: 500 12px/1 var(--sf); letter-spacing: 0; text-transform: none; color: rgba(245,245,247,.9); text-shadow: 0 1px 6px #000, 0 0 2px #000; }
  .cl-lbl::before { display: none; } .cl-lbl small { font: 400 calc(11px * var(--label-size, 1))/1 var(--sf); color: var(--lab2); }
  .cl-lbl.hot { color: var(--tint); } .cl-lbl.sel { color: #fff; font-weight: 600; }
  .cl-clbl { font: 600 15px/1 var(--sf); color: rgba(94,234,212,.85); }
  .cl-lobe { display: block; margin-top: 3px; font-size: .72em; opacity: .6; text-transform: none; letter-spacing: 0; }
  .cl-albl { font: 600 13px/1 var(--sf) !important; letter-spacing: 0 !important; color: var(--lab2) !important; }
  .cl-search input { height: 36px; padding: 0 12px 0 34px; border-radius: 10px; border: 0; font: 400 15px/1 var(--sf); color: var(--lab);
    background: var(--glass) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23ebebf5' stroke-opacity='.6' stroke-width='1.7' stroke-linecap='round'%3E%3Ccircle cx='7' cy='7' r='5'/%3E%3Cpath d='m11 11 3.5 3.5'/%3E%3C/svg%3E") 11px 50% / 15px no-repeat;
    -webkit-backdrop-filter: blur(30px) saturate(180%); backdrop-filter: blur(30px) saturate(180%); box-shadow: inset 0 0 0 .5px rgba(255,255,255,.14); }
  .cl-search input:focus { box-shadow: inset 0 0 0 .5px rgba(255,255,255,.14), 0 0 0 3px rgba(94,234,212,.45); } .cl-search input::placeholder { color: var(--lab2); }
  .cl-search ul { top: 42px; padding: 6px; border-radius: 14px; border: 0; }
  .cl-search li button { padding: 9px 10px !important; border-radius: 8px; font: 400 15px/1.3 var(--sf) !important; color: var(--lab) !important; }
  .cl-search li button:hover, .cl-search li.on button { background: var(--fill) !important; } .cl-search li small { color: var(--lab2); font-size: 13px; }
  .cl-vbtn { height: 36px; padding: 0 16px !important; border-radius: 999px; border: .5px solid rgba(255,255,255,.14) !important; font: 500 15px/1 var(--sf) !important; color: var(--lab) !important; }
  .cl-vbtn:hover { background: rgba(58,58,60,.75) !important; }
  .cl-vbtn:active, .cl-btn:active, .cl-faq button:active, .cl-themes button:active { transform: scale(.97); }
  .cl-vbtn[aria-expanded="true"] { background: var(--lab) !important; color: #000 !important; }
  .cl-view { top: 62px; width: 340px; padding: 16px; border-radius: 22px; gap: 10px; }
  .cl-vh { margin: 8px 4px 0; font: 600 13px/1.2 var(--sf); letter-spacing: 0; color: var(--lab2); } .cl-vh:first-child { margin-top: 0; }
  .cl-arrs { display: grid !important; grid-template-columns: repeat(5, 1fr) !important; gap: 2px !important; padding: 2px; border-radius: 9px; background: var(--fill); }
  .cl-arrs button { display: block !important; height: 30px; padding: 0 2px !important; border-radius: 7px; font: 500 12px/30px var(--sf) !important; color: var(--lab) !important; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; box-shadow: none !important; }
  .cl-arrs button.on { background: #636366 !important; font-weight: 600 !important; box-shadow: 0 3px 8px rgba(0,0,0,.25) !important; }
  #clThemes { grid-template-columns: repeat(4, 1fr); gap: 10px 4px; padding: 4px 0; }
  #clThemes button { display: grid !important; grid-template-columns: 1fr !important; justify-items: center; gap: 6px; padding: 2px !important; font: 400 11px/1.2 var(--sf) !important; color: var(--lab2) !important; box-shadow: none !important; background: none !important; }
  #clThemes i { width: 32px; height: 32px; border-radius: 50%; box-shadow: inset 0 0 0 .5px rgba(255,255,255,.2); transition: box-shadow .2s; }
  #clThemes button.on { color: var(--lab) !important; font-weight: 600 !important; } #clThemes button.on i { box-shadow: 0 0 0 2px #1c1c1e, 0 0 0 4px var(--lab); }
  .cl-vrow { min-height: 44px; padding: 0 4px; font: 400 15px/1.2 var(--sf); color: var(--lab); border-top: .5px solid var(--sep); }
  .cl-vh + .cl-vrow { border-top: 0; }
  .cl-vrow output { font: 400 13px/1 var(--sf); color: var(--lab2); font-variant-numeric: tabular-nums; }
  .cl-vrow input[type=checkbox] { -webkit-appearance: none; appearance: none; position: relative; width: 46px; height: 28px; margin: 0; border-radius: 14px; background: rgba(120,120,128,.36); cursor: pointer; transition: background .2s; }
  .cl-vrow input[type=checkbox]::before { content: ''; position: absolute; top: 2px; left: 2px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.3); transition: transform .2s; }
  .cl-vrow input[type=checkbox]:checked { background: var(--green); } .cl-vrow input[type=checkbox]:checked::before { transform: translateX(18px); }
  .cl-vrow input[type=range] { -webkit-appearance: none; appearance: none; width: 110px; height: 4px; border-radius: 2px; cursor: pointer;
    background: linear-gradient(90deg, var(--lab) var(--p, 50%), rgba(120,120,128,.36) var(--p, 50%)); }
  .cl-vrow input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.35); }
  .cl-vrow input[type=range]::-moz-range-thumb { width: 22px; height: 22px; border: 0; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.35); }
  #clLegend { gap: 6px; max-height: 64px; }
  #clLegend button { min-height: 28px; padding: 0 11px !important; border-radius: 999px; background: var(--fill2) !important; font: 500 13px/1 var(--sf) !important; color: var(--lab) !important; }
  #clLegend button:hover, #clLegend button.on { background: var(--fill) !important; }
  #clLegend small { font: 400 12px/1 var(--sf); color: var(--lab2); font-variant-numeric: tabular-nums; }
  .cl-btn { padding: 8px 15px !important; border: 0 !important; border-radius: 999px; background: rgba(94,234,212,.16) !important; font: 600 13px/1 var(--sf) !important; letter-spacing: 0; text-transform: none; color: var(--tint) !important; }
  .cl-btn:hover { background: rgba(94,234,212,.26) !important; }
  .cl-tip { padding: 8px 12px; border: .5px solid rgba(255,255,255,.14); border-radius: 12px; background: rgba(36,36,38,.92); font: 400 13px/1.4 var(--sf); box-shadow: 0 8px 30px rgba(0,0,0,.45); }
  .cl-tip b { font-weight: 600; letter-spacing: 0; color: var(--lab); } .cl-tip span { color: var(--lab2); }
  .cl-side { top: 62px; bottom: 68px; width: min(380px, 42vw); padding: 22px 20px; border-radius: 22px; gap: 12px; }
  .cl-side .cl-x { top: 14px; right: 14px; width: 30px; height: 30px; border-radius: 50%; background: var(--fill) !important; font: 500 17px/30px var(--sf) !important; color: var(--lab2) !important; text-align: center; }
  .cl-side .cl-x:hover { color: var(--lab) !important; }
  .cl-sec, .cl-kick { font: 600 13px/1.3 var(--sf); letter-spacing: 0; text-transform: none; }
  .cl-name { margin: 0; padding-right: 36px; font: 700 28px/1.12 var(--sf); letter-spacing: -.02em; color: var(--lab); }
  .cl-def, .cl-also, .cl-text { font-size: 15px; line-height: 1.45; color: var(--lab2); }
  .cl-also button, .cl-text .cl-term { color: var(--tint) !important; border: 0 !important; }
  .cl-faqh { margin: 10px 4px 0; font: 600 13px/1.2 var(--sf); color: var(--lab2); }
  .cl-faq { border-radius: 12px; background: var(--fill2); overflow: hidden; }
  .cl-faq li { border-top: .5px solid var(--sep); margin-left: 14px; } .cl-faq li:first-child { border-top: 0; }
  .cl-faq button, .cl-faq span { position: relative; padding: 12px 30px 12px 0 !important; font: 400 15px/1.35 var(--sf) !important; color: var(--lab) !important; }
  .cl-faq button::after { content: '\\203A'; position: absolute; right: 14px; top: 50%; transform: translateY(-52%); font-size: 20px; color: var(--lab2); }
  .cl-q { font: 700 22px/1.2 var(--sf); letter-spacing: -.01em; color: var(--lab); }
  .cl-back { font: 400 15px/1.3 var(--sf) !important; color: var(--tint) !important; }
  .cl-unlock { display: block; padding: 12px 16px; border-radius: 12px; background: var(--tint); color: #00211c; font: 600 15px/1.2 var(--sf); text-align: center; text-decoration: none; }
  .cl-unlock:hover { background: #8af2e0; }
  .cl-stats dt { font: 400 12px/1 var(--sf); letter-spacing: 0; text-transform: none; color: var(--lab2); }
  .cl-stats dd { font: 600 17px/1 var(--sf); color: var(--lab); font-variant-numeric: tabular-nums; }
  #clStackList li { padding: 10px 12px; border: .5px solid rgba(255,255,255,.08); border-radius: 14px; background: rgba(28,28,30,.78); }
  #clStackList .tg { font: 400 12px/1.2 var(--sf); color: var(--lab2); font-variant-numeric: tabular-nums; }
  #clStackList .tg b { padding: 2px 7px; border-radius: 6px; font: 600 11px/1.3 var(--sf); letter-spacing: 0; color: var(--c); background: color-mix(in srgb, var(--c) 20%, transparent); }
  #clStackList .tt { font: 400 13px/1.35 var(--sf); color: var(--lab); }
  #clStackList em { font: 600 20px/1 var(--sf); font-variant-numeric: tabular-nums; }
  @media (max-width: 760px) { .cl-view { width: calc(100% - 40px); } .cl-side { width: auto; left: 12px; right: 12px; } .cl-lbl { font-size: 13px; } }
  /* -- compact overlay like the reference video: small dense panels, small caps headers, table legend -- */
  .cl { --glass: rgba(12,13,14,.86); }
  .cl-top { top: 12px; } .cl-tl { display: flex; gap: 6px; align-items: start; }
  .cl-search { width: min(220px, 46vw); } .cl-search input { height: 30px; padding-left: 30px; border-radius: 8px; font-size: 13px; background-position: 9px 50%; background-size: 13px; }
  .cl-search ul { top: 34px; } .cl-search li button { padding: 6px 8px !important; font-size: 13px !important; }
  .cl-vbtn { height: 30px; padding: 0 12px !important; font: 500 12.5px/1 var(--sf) !important; border-radius: 8px; }
  .cl-vbtn[aria-expanded="true"] { background: var(--lab) !important; color: #000 !important; }
  .cl-pan { position: absolute; z-index: 6; top: 50px; width: 236px; max-height: calc(100% - 110px); overflow-y: auto; padding: 8px 12px 10px; border-radius: 10px; display: grid; gap: 2px; touch-action: pan-y; cursor: auto; scrollbar-width: thin; }
  .cl-pan[hidden] { display: none; }
  .cl-arrp { left: max(20px, env(safe-area-inset-left)); } .cl-view { right: max(20px, env(safe-area-inset-right)); left: auto; top: 50px; width: 236px; padding: 8px 12px 10px; border-radius: 10px; gap: 2px; }
  .cl-panh { display: flex; justify-content: space-between; align-items: center; padding: 2px 0 6px; font: 600 12.5px/1 var(--sf); color: var(--lab); }
  .cl-px { width: 22px; height: 22px; border-radius: 6px; font: 400 16px/22px var(--sf) !important; color: var(--lab2) !important; text-align: center; } .cl-px:hover { background: var(--fill) !important; color: var(--lab) !important; }
  .cl-pan .cl-vh { margin: 8px 0 2px; font: 600 10.5px/1.2 var(--sf); letter-spacing: .08em; text-transform: uppercase; color: var(--lab2); }
  .cl-pan .cl-vrow { min-height: 30px; padding: 0; font: 400 12.5px/1.2 var(--sf); border-top: 0; }
  .cl-pan .cl-vrow output { font-size: 11.5px; min-width: 34px; }
  .cl-pan .cl-vrow input[type=checkbox] { width: 30px; height: 18px; border-radius: 9px; } .cl-pan .cl-vrow input[type=checkbox]::before { top: 2px; left: 2px; width: 14px; height: 14px; }
  .cl-pan .cl-vrow input[type=checkbox]:checked::before { transform: translateX(12px); }
  .cl-pan input[type=range] { -webkit-appearance: none; appearance: none; width: 84px; height: 3px; border-radius: 2px; cursor: pointer; background: linear-gradient(90deg, var(--lab) var(--p, 50%), rgba(120,120,128,.36) var(--p, 50%)); }
  .cl-pan input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.4); }
  .cl-pan input[type=range]::-moz-range-thumb { width: 14px; height: 14px; border: 0; border-radius: 50%; background: #fff; }
  .cl-blend { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px; padding: 4px 0 2px; font: 400 11.5px/1 var(--sf); color: var(--lab2); }
  .cl-blend input[type=range] { width: 100%; }
  .cl-forms { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; }
  .cl-forms button { height: 26px; border-radius: 6px; background: var(--fill2) !important; font: 500 12px/26px var(--sf) !important; color: var(--lab) !important; text-align: center; }
  .cl-forms button:hover { background: var(--fill) !important; } .cl-forms button.on { background: var(--lab) !important; color: #000 !important; }
  #clThemes { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 0 2px; }
  #clThemes button { display: block !important; padding: 0 !important; font-size: 0 !important; width: 18px; height: 18px; }
  #clThemes i { display: block; width: 18px; height: 18px; } #clThemes button.on i { box-shadow: 0 0 0 1.5px #0c0d0e, 0 0 0 3px var(--lab); }
  .cl-vfoot { display: flex; gap: 14px; margin-top: 8px; padding-top: 8px; border-top: .5px solid var(--sep); }
  .cl-vfoot button { font: 500 12px/1 var(--sf) !important; color: var(--tint) !important; } .cl-vfoot button:hover { color: #9af5e6 !important; }
  .cl-labels.nocount .cl-lbl small, .cl-labels.nocount .cl-blbl small, .cl-labels.nonodes .cl-lbl:not(.cl-albl) { display: none; }
  .cl-head { top: 52px; } .cl-eye { font-size: 12px; } .cl-stat, .cl-livel { font-size: 12px; }
  .cl-stack { top: 128px; width: 248px; gap: 6px; } .cl-sth { font: 600 10.5px/1 var(--sf); letter-spacing: .08em; text-transform: uppercase; }
  #clStackList { gap: 5px; } #clStackList li { padding: 7px 9px; border-radius: 9px; grid-template-columns: minmax(0, 1fr) 30px; }
  #clStackList .tg { font-size: 11px; } #clStackList .tg b { font-size: 10.5px; padding: 1px 6px; } #clStackList .tt { font-size: 12px; } #clStackList em { font-size: 16px; }
  .cl-side { top: 50px; width: min(320px, 40vw); padding: 16px 16px; border-radius: 12px; gap: 10px; }
  .cl-side .cl-x { top: 10px; right: 10px; width: 24px; height: 24px; font: 400 15px/24px var(--sf) !important; }
  .cl-name { font-size: 22px; } .cl-def, .cl-also, .cl-text { font-size: 13px; } .cl-faq button, .cl-faq span { padding: 9px 26px 9px 0 !important; font-size: 13px !important; }
  .cl-faq button::after { right: 10px; font-size: 16px; } .cl-q { font-size: 18px; } .cl-unlock { padding: 9px 12px; border-radius: 8px; font-size: 13px; }
  .cl-tip { padding: 6px 9px; border-radius: 8px; font-size: 12px; }
  .cl-lbl { font-size: calc(11.5px * var(--label-size, 1)); } .cl-clbl { font-size: 13px; }
  .cl-legend { gap: 2px; width: 248px; max-width: none; }
  .cl-lh { display: flex; justify-content: space-between; padding: 0 2px 4px; font: 600 10.5px/1 var(--sf); letter-spacing: .08em; text-transform: uppercase; color: var(--lab2); }
  #clLegend { display: grid; gap: 0; max-height: none; overflow: visible; }
  #clLegend button { display: grid !important; grid-template-columns: 8px minmax(0, 1fr) auto; align-items: center; gap: 8px; min-height: 22px; padding: 0 2px !important; border-radius: 4px; background: none !important; font: 400 12px/1 var(--sf) !important; color: var(--lab) !important; text-align: left; }
  #clLegend button span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } #clLegend button:hover, #clLegend button.on { background: var(--fill2) !important; }
  #clLegend i { width: 7px; height: 7px; } #clLegend small { font-size: 11.5px; }
  .cl-more { justify-self: start; margin-top: 2px; padding: 2px !important; font: 400 11.5px/1.2 var(--sf) !important; color: var(--lab2) !important; } .cl-more:hover { color: var(--lab) !important; }
  .cl-hist { margin: 0 0 6px auto; width: 120px; } .cl-hist svg { display: block; width: 120px; height: 34px; fill: rgba(235,235,245,.5); }
  .cl-hist figcaption { margin-top: 3px; font: 400 10.5px/1 var(--sf); color: var(--lab2); text-align: right; } .cl-hist figcaption::first-letter { text-transform: uppercase; }
  .cl-btn { padding: 6px 11px !important; font-size: 12px !important; border-radius: 7px; }
  .cl-hint { font-size: 11px; }
  @media (max-width: 760px) { .cl-pan { left: 12px !important; right: 12px !important; width: auto !important; } .cl-side { width: auto; left: 12px; right: 12px; } }
  /* menu scheme of the first View panel for every configuration panel: flat list, colour bar + name, outline on the choice, plain checkboxes */
  .cl-pan { background: rgba(3,8,10,.92) !important; -webkit-backdrop-filter: none; backdrop-filter: none; border: 1px solid rgba(236,230,218,.12) !important; border-radius: 4px; box-shadow: none; width: 220px; padding: 10px 12px 12px; gap: 4px; }
  .cl-panh { font: 500 12px/1 var(--sf); color: var(--ivory); }
  .cl-pan .cl-vh { margin: 8px 0 2px; font: 500 11px/1 var(--sf); letter-spacing: .04em; text-transform: none; color: #8a979e; }
  .cl-pan .cl-vrow { min-height: 26px; font: 400 12.5px/1.2 var(--sf); color: #c3ccd1; }
  .cl-pan .cl-vrow input[type=checkbox] { -webkit-appearance: auto; appearance: auto; width: 14px; height: 14px; border-radius: 2px; background: none; accent-color: #c3ccd1; }
  .cl-pan .cl-vrow input[type=checkbox]::before { display: none; }
  .cl-pan input[type=range] { -webkit-appearance: auto; appearance: auto; width: 96px; height: auto; background: none; accent-color: #c3ccd1; }
  .cl-pan .cl-vrow output { font: 400 11px/1 var(--mono); color: #8a979e; }
  .cl-blend { font-size: 11.5px; color: #8a979e; }
  .cl-forms { display: flex; flex-wrap: wrap; gap: 3px; }
  .cl-forms button { height: auto; padding: 5px 8px !important; border-radius: 3px; background: none !important; font: 400 12.5px/1 var(--sf) !important; color: #c3ccd1 !important; }
  .cl-forms button:hover { background: rgba(236,230,218,.05) !important; } .cl-forms button.on { background: none !important; color: var(--ivory) !important; box-shadow: inset 0 0 0 1px rgba(236,230,218,.25); }
  #clThemes { display: grid; grid-template-columns: 1fr; gap: 3px; padding: 4px 0 0; }
  #clThemes button { display: grid !important; grid-template-columns: 64px 1fr !important; align-items: center; gap: 10px; width: auto; height: auto; padding: 5px 6px !important; border-radius: 3px; font: 400 12.5px/1 var(--sf) !important; color: #c3ccd1 !important; text-align: left; }
  #clThemes i { width: 64px; height: 6px; border-radius: 3px; box-shadow: none !important; }
  #clThemes button.on { color: var(--ivory) !important; box-shadow: inset 0 0 0 1px rgba(236,230,218,.25) !important; } #clThemes button:hover { background: rgba(236,230,218,.05) !important; }
  .cl-vfoot { border-top: 1px solid rgba(236,230,218,.08); } .cl-vfoot button { font: 400 12px/1 var(--sf) !important; color: #c3ccd1 !important; } .cl-vfoot button:hover { color: var(--ivory) !important; }
  /* the crawler log ends above the topic table */
  .cl-stack { bottom: 300px; }
  /* Arrange panel: right of the search bar, order like the menu: Form first, then the Anatomy/Data slider, then groups */
  .cl-arrp { left: max(300px, calc(env(safe-area-inset-left) + 300px)) !important; top: 50px; }
  .cl-arrp > * { order: 5; } .cl-arrp .cl-panh { order: 0; } .cl-arrp .cl-vh:first-of-type { order: 1; } .cl-arrp #clArr { order: 2; } .cl-arrp .cl-blend { order: 3; margin-top: 6px; }
  @media (max-width: 760px) { .cl-arrp { left: 12px !important; } }
  /* nested settings (Arrange): foldable sections, indented sub-rows, one sentence of answer, saved views */
  .cl-arrp { width: 248px; } .cl-arrp > *, .cl-arrp .cl-blend { order: 0 !important; }
  .cl-sec { border-top: 1px solid rgba(236,230,218,.08); padding: 4px 0 4px; }
  .cl-sec > summary { list-style: none; cursor: pointer; display: grid; grid-template-columns: 1fr auto; align-items: center; padding: 5px 0; font: 500 11px/1.2 var(--sf); letter-spacing: .04em; color: #8a979e; }
  .cl-sec > summary::-webkit-details-marker { display: none; }
  .cl-sec > summary::after { content: '›'; grid-column: 2; grid-row: 1; font-size: 15px; line-height: 1; transform: rotate(90deg); transition: transform .2s; }
  .cl-sec:not([open]) > summary::after { transform: none; }
  .cl-sec > summary:hover, .cl-sec > summary:focus-visible { color: var(--ivory); }
  .cl-sec > summary small { grid-column: 1; display: block; margin-top: 3px; font-size: 11.5px; letter-spacing: 0; color: #c3ccd1; }
  .cl-sec[open] > summary small { display: none; }
  .cl-pan .cl-sub { padding-left: 2px; } .cl-pan .cl-sub > span::before { content: '↳ '; color: #5c676d; }
  .cl-pan select { max-width: 132px; padding: 4px 6px; border: 1px solid rgba(236,230,218,.14); border-radius: 3px; background: rgba(3,8,10,.9); color: #c3ccd1; font: 400 12px/1.2 var(--sf); color-scheme: dark; cursor: pointer; }
  .cl-pan select:disabled { opacity: .45; cursor: default; }
  .cl-q, .cl-ins, .cl-note { margin: 6px 0 2px; font: 400 12px/1.45 var(--sf); color: #c3ccd1; } .cl-note { color: #8a979e; } .cl-note:empty { display: none; }
  .cl-ins b { color: var(--ivory); font-weight: 500; }
  .cl-ckey { display: flex; flex-wrap: wrap; gap: 3px 10px; padding: 2px 0 6px; font: 400 11px/1.3 var(--sf); color: #a9b4ba; } .cl-ckey:empty { display: none; }
  .cl-ckey span { display: inline-flex; align-items: center; gap: 5px; } .cl-ckey i { width: 7px; height: 7px; border-radius: 50%; background: var(--c); }
  .cl-presets { display: grid; gap: 1px; } .cl-presets div { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 6px; }
  .cl-presets .ap { text-align: left; padding: 5px 6px !important; border-radius: 3px; font: 400 12.5px/1.2 var(--sf) !important; color: #c3ccd1 !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cl-presets .ap:hover { background: rgba(236,230,218,.05) !important; color: var(--ivory) !important; }
  /* hover tip: see-through, no dark shadow – zoomed out the brain is small and an opaque box blacked parts of it out */
  .cl-tip { background: rgba(14,20,22,.42) !important; box-shadow: none !important; border-color: rgba(236,230,218,.14) !important; text-shadow: 0 1px 3px rgba(0,0,0,.8); }
  /* Layout panel: fine control as chips, plain small labels, nothing folds; it opens on the right like View (one at a time) */
  .cl-tr { display: flex; gap: 6px; }
  .cl-arrp.cl-lens { left: auto !important; right: max(20px, env(safe-area-inset-right)); top: 50px; }
  .cl-lens { width: 276px; max-height: calc(100% - 70px); overflow-y: auto; scrollbar-width: none; }
  .cl-lens .cl-lh { margin: 14px 0 7px; font: 500 11.5px/1 var(--sf) !important; letter-spacing: 0 !important; text-transform: none !important; color: #8a979e !important; } .cl-lens .cl-panh + .cl-lh { margin-top: 4px; }
  /* quick views: always in sight, top centre; the one that matches the picture is lit */
  .cl-views { display: flex; gap: 4px; padding: 3px; border-radius: 999px; background: rgba(3,8,10,.72); box-shadow: inset 0 0 0 1px rgba(236,230,218,.1); max-width: calc(100% - 520px); overflow-x: auto; scrollbar-width: none; }
  .cl-views div { display: flex; align-items: center; flex: none; }
  .cl-views .ap { height: 26px; padding: 0 12px !important; border-radius: 999px; white-space: nowrap; font: 400 12px/1 var(--sf) !important; color: #aeb9bf !important; background: none !important; transition: background .15s, color .15s; }
  .cl-views .ap:hover { color: var(--ivory) !important; } .cl-views .ap.on { background: var(--ivory) !important; color: #05090b !important; }
  .cl-views small { display: none; } .cl-views .del { width: 18px; height: 18px; margin-left: -4px; color: #5c676d !important; font-size: 13px !important; } .cl-views .del:hover { color: var(--ivory) !important; }
  @media (max-width: 900px) { .cl-top { flex-wrap: wrap; row-gap: 8px; } .cl-views { order: 3; flex-basis: 100%; max-width: 100%; border-radius: 10px; } }
  .cl-lens .cl-forms, .cl-chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .cl-lens .cl-forms button, .cl-chips button { height: auto; padding: 5px 10px !important; border-radius: 999px; background: none !important; box-shadow: inset 0 0 0 1px rgba(236,230,218,.13);
    font: 400 12px/1.1 var(--sf) !important; color: #c3ccd1 !important; cursor: pointer; transition: background .15s, color .15s; }
  .cl-lens .cl-forms button:hover, .cl-chips button:hover:not(:disabled) { color: var(--ivory) !important; box-shadow: inset 0 0 0 1px rgba(236,230,218,.3); }
  .cl-lens .cl-forms button.on, .cl-chips button[aria-checked=true] { background: var(--ivory) !important; color: #05090b !important; box-shadow: none; }
  .cl-chips button:disabled { opacity: .4; cursor: default; }
  .cl-lens .cl-vrow { min-height: 30px; margin-top: 4px; }
  .cl-tog { display: flex; gap: 4px; margin-top: 10px; }
  .cl-tog label { position: relative; padding: 5px 12px; border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(236,230,218,.13); font: 400 12px/1.1 var(--sf); color: #c3ccd1; cursor: pointer; }
  .cl-tog input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; }
  .cl-tog label:has(input:checked) { background: rgba(94,234,212,.16); box-shadow: inset 0 0 0 1px rgba(94,234,212,.5); color: var(--ivory); }
  .cl-tog label:has(input:focus-visible), .cl-chips button:focus-visible { outline: 2px solid var(--pill, #5eead4); outline-offset: 2px; }
  .cl-lfoot { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: center; margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(236,230,218,.08); }
  .cl-lfoot .cl-save { margin: 0; } .cl-lfoot #clSetReset { font: 400 12px/1 var(--sf) !important; color: #8a979e !important; } .cl-lfoot #clSetReset:hover { color: var(--ivory) !important; }
  .cl-presets small { font: 400 10.5px/1 var(--sf); color: #5c676d; } .cl-presets .del { width: 20px; height: 20px; border-radius: 3px; color: #8a979e !important; font-size: 14px !important; } .cl-presets .del:hover { color: var(--ivory) !important; }
  .cl-save { display: flex; gap: 6px; margin-top: 8px; }
  .cl-save input { flex: 1; min-width: 0; height: 26px; padding: 0 8px; border: 1px solid rgba(236,230,218,.14); border-radius: 3px; background: none; color: var(--ivory); font: 400 12px/1 var(--sf); }
  .cl-save input:focus { outline: none; border-color: rgba(94,234,212,.5); }
  /* group names: small and quiet; bright only for the group in focus (see place / placeArr) */
  .cl-clbl { font: 500 calc(11px * var(--label-size, 1))/1 var(--sf) !important; letter-spacing: .07em !important; text-transform: uppercase; color: rgba(94,234,212,.8) !important; }
  .cl-albl { font: 500 calc(10.5px * var(--label-size, 1))/1 var(--sf) !important; letter-spacing: .08em !important; text-transform: uppercase; color: rgba(236,240,242,.62) !important; }
  .cl-albl.on, .cl-clbl.on { color: var(--ivory) !important; }
  /* ?rec (screen recordings): every term is blurred; the controls stay readable */
  .cl.cl-rec :is(.cl-lbl, .cl-albl, .cl-clbl, .cl-blbl, .cl-tip b, .cl-tip .tn, #clLegend span, .cl-ckey span, #clOnly, #clStackList .tt, #clSideBody, #clIns, #clSearchList, #clRead, #clFocus, #clTerms, .cl-threads) { filter: blur(8px); }
  .cl.cl-rec #clSideBody :is(h1, h2, h3, .cl-name, .cl-q, b, strong) { filter: blur(6px); }   /* big headings need more (on top of the 8 px of the panel) */
  .cl-save button { padding: 0 10px !important; border-radius: 3px; box-shadow: inset 0 0 0 1px rgba(236,230,218,.25); font: 500 12px/26px var(--sf) !important; color: var(--ivory) !important; }
  /* left column: search on top, every setting as one row (name + current value); a row opens its options to the right */
  .cl-menu { position: absolute; z-index: 5; top: 12px; left: max(20px, env(safe-area-inset-left)); bottom: 300px; width: 248px; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
  .cl-menu > :not(.cl-stack) { pointer-events: auto; }
  .cl-menu .cl-search { width: 100%; } .cl-menu .cl-search input { height: 38px; padding-left: 34px; border-radius: 6px; font-size: 14px; background-position: 11px 50%; background-size: 14px; }
  .cl-menu .cl-search ul { top: 42px; }
  .cl-mlist { display: grid; padding: 4px; border-radius: 6px; background: rgba(3,8,10,.72); box-shadow: inset 0 0 0 1px rgba(236,230,218,.1); }
  .cl-mlist[hidden] { display: none !important; }   /* one button first, the setting rows only after a click */
  .cl-mbtn { display: flex; justify-content: space-between; align-items: center; height: 34px; padding: 0 12px !important; border-radius: 6px; background: rgba(3,8,10,.72) !important; box-shadow: inset 0 0 0 1px rgba(236,230,218,.1); font: 400 13px/1 var(--sf) !important; color: #c3ccd1 !important; cursor: pointer; }
  .cl-mbtn::after { content: '›'; font-size: 15px; color: #5c676d; transform: rotate(90deg); transition: transform .15s; }
  .cl-mbtn:hover, .cl-mbtn[aria-expanded=true] { color: var(--ivory) !important; } .cl-mbtn[aria-expanded=true]::after { transform: rotate(-90deg); color: var(--ivory); }
  .cl-mlist hr { margin: 4px 6px; border: 0; border-top: 1px solid rgba(236,230,218,.08); }
  .cl-mlist button { display: grid; grid-template-columns: auto minmax(0, 1fr) 10px; align-items: center; gap: 10px; min-height: 30px; padding: 0 8px !important; border-radius: 4px; background: none !important; text-align: left; font: 400 12.5px/1 var(--sf) !important; color: #c3ccd1 !important; cursor: pointer; }
  .cl-mlist button small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; font: 400 12px/1 var(--sf); color: #7d8a90; }
  .cl-mlist button::after { content: '›'; font-size: 15px; color: #5c676d; transition: transform .15s; }
  .cl-mlist button:hover, .cl-mlist button[aria-expanded=true] { background: rgba(236,230,218,.06) !important; color: var(--ivory) !important; }
  .cl-mlist button[aria-expanded=true]::after { color: var(--ivory); transform: translateX(2px); }
  .cl-mlist button i { display: inline-block; width: 10px; height: 10px; margin-left: 6px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(236,230,218,.3); vertical-align: -1px; }
  .cl-menu .cl-stack { position: static; flex: 0 1 auto; width: auto; min-height: 0; max-height: 190px; }
  .cl-menu #clStackList li:nth-child(n+4) { display: none; }
  .cl-menu #clMList { position: absolute; left: calc(100% + 8px); width: 230px; } .cl-menur #clMListR { position: absolute; left: auto; right: calc(100% + 8px); width: 220px; }   /* the rows open beside their button, not under it */
  .cl-fly { left: max(276px, calc(env(safe-area-inset-left) + 276px)) !important;   /* beside the left column: stats and crawler log stay visible */ right: auto; top: 62px; width: 260px; max-height: calc(100% - 80px); }
  .cl-fly > .cl-vfoot { display: none; } .cl-fly > div > :is(.cl-lh, .cl-vh):first-child { margin-top: 14px; } .cl-fly > div:first-child > :is(.cl-lh, .cl-vh):first-child { margin-top: 0; }
  .cl-fly .cl-lfoot { margin-top: 12px; }
  .cl-tl, .cl-tr { display: none !important; } .cl-top { justify-content: center; } .cl-views { max-width: calc(100% - 600px); }
  .cl-menu .cl-head { position: static; max-width: none; padding: 2px 2px 0; }
  .cl-menur { left: auto; right: max(20px, env(safe-area-inset-right)); bottom: auto; width: 220px; }
  .cl-fly.r { left: auto !important; right: max(20px, env(safe-area-inset-right)); }
  .cl-views { display: none !important; }
  /* admin tab: like the public page, the brain fills the window, no strip under it and no page scroll */
  html:has(#t-cloud:not([hidden])), html:has(#t-cloud:not([hidden])) body { overflow: hidden; overscroll-behavior: none; }
  #t-cloud .cl-live, #t-cloud .cl-dash { display: none !important; }
  .cl-fl { margin: 12px 0 6px; font: 400 11.5px/1 var(--sf); color: #8a979e; } .cl-fly div > .cl-fl:first-child { margin-top: 0; }
  .cl-fly .cl-sub { margin-top: 10px; } .cl-fly .cl-sub[hidden] { display: none; }
  .cl-shot { justify-self: start; margin-top: 10px; padding: 6px 12px !important; border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(236,230,218,.2); font: 400 12px/1 var(--sf) !important; color: #c3ccd1 !important; }
  .cl-shot:hover { color: var(--ivory) !important; box-shadow: inset 0 0 0 1px rgba(236,230,218,.4); }
  #clStage.cl-tintui :is(.cl-mbtn, .cl-mlist, .cl-fly, .cl-subp, .cl-search input, .cl-search ul) { background-color: var(--ui-tint) !important; }
  #clSetupSave { margin: 0 0 8px; } #clSetupSave button { flex: none; font: 400 12px/1 var(--sf) !important; color: #c3ccd1 !important; }
  .cl-side { top: 152px; }   /* lexicon panel starts under the right menu column instead of covering it */
  .cl-bgs { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 4px 0; }
  .cl-bgs button, .cl-bgs label { position: relative; width: 26px; height: 26px; padding: 0 !important; border-radius: 50%; background: var(--c) !important; box-shadow: inset 0 0 0 1px rgba(236,230,218,.22); cursor: pointer; }
  .cl-bgs button[data-u=""] { background: linear-gradient(135deg, transparent 46%, rgba(236,230,218,.45) 47%, rgba(236,230,218,.45) 53%, transparent 54%) !important; }   /* off */
  .cl-bgs .on { box-shadow: 0 0 0 2px #05090b, 0 0 0 3.5px var(--ivory); }
  .cl-bgs label { background: conic-gradient(#f2727f, #f5b84b, #5eead4, #7dd3fc, #c4b5fd, #f2727f) !important; }
  .cl-bgs input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
  @media (max-width: 900px) { .cl-views { max-width: 100%; } .cl-top { left: 290px !important; } }
  @media (max-width: 760px) {
    .cl-menu { left: 12px; right: 12px; bottom: auto; width: auto; gap: 8px; }
    .cl-mlist { display: flex; overflow-x: auto; scrollbar-width: none; padding: 3px; border-radius: 10px; }
    .cl-mlist hr { display: none; } .cl-mlist button { flex: none; grid-template-columns: auto; min-height: 28px; } .cl-mlist button small, .cl-mlist button::after { display: none; }
    .cl-menu .cl-mlist { position: static !important; width: auto !important; }
    .cl-fly { top: 96px !important; left: 12px !important; right: 12px !important; width: auto !important; max-height: 55vh; }
    .cl-menur { top: 96px; left: 12px; right: 12px; width: auto; } .cl-side { top: 140px; } .cl-fly { top: 140px !important; } .cl-menu .cl-head { display: none; }
  }
  /* The atlas is a compact knowledge index inside Layout, not another overlay. */
  .cl-filterpick[hidden] { display:none!important; }
  .cl-filterpick { display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 9px!important;color:var(--ivory);font:400 11px/1.3 var(--sf);border:1px solid rgba(94,234,212,.25);border-radius:4px; }
  .cl-filterpick small { color:var(--cdim);white-space:nowrap; }
  .cl-filterpick:focus-visible { outline:1px solid #7ee8d4;outline-offset:2px; }
  .cl-vrow[hidden] { display:none!important; }
  .cl-blbl[hidden] { display:none!important; }
  .cl-atlas { margin-top:8px; }
  .cl-atabs { display:flex; gap:4px; border-bottom:1px solid rgba(236,230,218,.1); padding-bottom:6px; }
  .cl-atabs button { flex:1; padding:6px!important; border-radius:4px; color:var(--cdim); font:400 12px/1 var(--sf); }
  .cl-atabs button[aria-selected=true] { background:rgba(94,234,212,.09); color:var(--ivory); }
  .cl-astatus { display:flex; justify-content:space-between; gap:8px; padding:9px 2px; font:400 10.5px/1.4 var(--sf); color:var(--cdim); }
  .cl-astatus>span:first-child { color:var(--ivory); }
  .cl-asystem { position:relative; display:grid; grid-template-columns:7px 1fr auto; align-items:center; gap:8px; width:100%; padding:7px 5px!important; text-align:left; color:var(--cdim); font:400 11.5px/1.25 var(--sf); border-radius:3px; }
  .cl-asystem::after { content:''; position:absolute; left:20px; bottom:1px; width:calc(var(--share)*.75); height:1px; background:var(--c); opacity:.23; }
  .cl-asystem i { width:5px; height:5px; border-radius:50%; background:var(--c); }
  .cl-asystem small,.cl-atopic small { font-size:10px; font-variant-numeric:tabular-nums; opacity:.65; }
  .cl-asystem[aria-pressed=true],.cl-asystem:hover,.cl-atopic:hover { background:rgba(236,230,218,.05); color:var(--ivory); }
  .cl-atopic { display:flex; justify-content:space-between; gap:10px; width:100%; text-align:left; padding:7px 5px!important; color:var(--cdim); font:400 11.5px/1.3 var(--sf); }
  .cl-atopic>span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .cl-amore { display:flex;justify-content:space-between;gap:8px;width:100%;padding:9px 5px!important;font:400 11px/1.3 var(--sf);color:#7ee8d4; }
  .cl-amore small { color:var(--cdim);font-variant-numeric:tabular-nums; }
  .cl-aclear { margin-top:8px; color:#7ee8d4; font:400 11px/1.4 var(--sf); }
  .cl-aempty { padding:8px 2px; font:400 11px/1.5 var(--sf); color:var(--cdim); }
  .cl-atlas button:focus-visible { outline:1px solid #7ee8d4; outline-offset:2px; }
  .cl-fly { box-sizing:border-box; grid-template-columns:minmax(0,1fr); overflow-x:hidden; }
  .cl-fly>div,.cl-fly details { min-width:0; }
  .cl-fly .cl-vrow { grid-template-columns:minmax(0,1fr) 86px 34px; min-height:30px; padding:3px 0; gap:6px; }
  .cl-fly .cl-vrow input[type=range] { width:86px; }
  .cl-fly .cl-vrow:has(input[type=checkbox]) { grid-template-columns:minmax(0,1fr) auto; }
  .cl-fly .cl-vrow input[type=checkbox] { grid-column:2; }
  .cl-fly select { max-width:100%; width:100%; }
  @media(max-width:760px) {
    .cl-filterpick { order:3; }
    #clStage:has(.cl-mbtn[aria-expanded=true]) .cl-filterpick { display:none; }
    .cl-filterpick:not([hidden]) { margin-top:44px; }
    .cl-fly { max-height:calc(100% - 170px)!important; }
    .cl-fly:not(.r) { right:calc(50% + 4px)!important; }
    .cl-fly.r { left:calc(50% + 4px)!important; }
    .cl-fly { padding:10px!important; }
    .cl-fly .cl-vrow { grid-template-columns:1fr auto; gap:5px; }
    .cl-fly .cl-vrow input[type=range] { width:70px; }
    .cl-fly .cl-vrow output { grid-column:2; }
    .cl-atopic small { display:none; }
    #clStage:has(#clMBtn[aria-expanded=true]):not(:has(#clMBtnR[aria-expanded=true])) .cl-fly:not(.r) { right:12px!important; }
    #clStage:has(#clMBtnR[aria-expanded=true]):not(:has(#clMBtn[aria-expanded=true])) .cl-fly.r { left:12px!important; }
  }
  .cl-subp { z-index: 8; width: 250px !important; box-sizing: border-box; overflow-x: hidden; }
  .cl-subp .cl-panh { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font: 600 12.5px/1.2 var(--sf); color: var(--ivory); }
  .cl-subp .cl-px { padding: 0 4px !important; font-size: 16px !important; color: #8a979e !important; background: none !important; }
  @media (min-width: 761px) { details.cl-out > summary::after { content: '›' !important; transform: none !important; } details.cl-out[open] > summary { color: var(--ivory); } }
  .cl-labels.nolabels:not(.nonodes) > .cl-lbl.find { display: block; } .cl-lbl.find { color: var(--ivory); text-shadow: 0 0 6px rgba(0,0,0,.9); }
  .cl-search { z-index: 9; } .cl-search ul { max-height: min(62vh, 560px); overflow-y: auto; background: rgba(3,8,10,.97) !important; }
  .cl-search li.cl-hh { padding: 4px 12px 6px; font: 400 11px/1.3 var(--sf); color: var(--cfaint); }
  .cl-search li button { align-items: flex-start; }
  .cl-search li button i { flex: none; width: 7px; height: 7px; margin-top: 6px; border-radius: 50%; background: var(--c); }
  .cl-search li button span { flex: 1; min-width: 0; } .cl-search li button b { font-weight: 500; }
  .cl-search li button em { display: block; overflow: hidden; font: 400 11px/1.3 var(--sf); font-style: normal; color: var(--cfaint); white-space: nowrap; text-overflow: ellipsis; }
  .cl-search li.out button { opacity: .55; }
  .cl-sbars { display: grid; gap: 1px; margin-top: 6px; }
  .cl-sbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 3px 8px; width: 100%; padding: 4px 0 !important; text-align: left; font: 400 12px/1.25 var(--sf) !important; color: #c3ccd1 !important; background: none !important; cursor: pointer; }
  .cl-sbar span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; } .cl-sbar small { color: #8a979e; font-size: 11px; font-variant-numeric: tabular-nums; }
  .cl-sbar b { grid-column: 1 / 3; height: 3px; border-radius: 2px; background: linear-gradient(90deg, var(--c) var(--w), rgba(236,230,218,.08) var(--w)); }
  .cl-sbar:hover span, .cl-sbar[aria-pressed=true] span { color: var(--ivory); } .cl-sbar[aria-pressed=true] small { color: var(--ivory); }
  .cl-kv { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 5px 10px; margin: 0; font: 400 12px/1.3 var(--sf); color: #dfe7ea; }
  .cl-chips button[aria-checked=true]:hover { color: #05090b !important; }
  .cl-kv dt { color: #8a979e; } .cl-kv dd { margin: 0; text-align: right; font-variant-numeric: tabular-nums; }
`;

  const HTML = `
  <div class="cl">
    <div class="cl-stage" id="clStage">
      <canvas id="clGl"></canvas>
      <div class="cl-ov"><svg id="clRet" aria-hidden="true"></svg><svg id="clBeams" aria-hidden="true"></svg></div>
      <h1 class="cl-sr">Brain</h1><div class="cl-sr" id="clSay" aria-live="polite"></div><div class="cl-labels" id="clLabels"></div>
      <div class="cl-tip" id="clTip"></div>
      <div class="cl-menu" id="clMenu"><div class="cl-search"><input id="clSearch" type="search" placeholder="Search topics" autocomplete="off" spellcheck="false" aria-label="Search topics"><ul id="clSearchList" class="cl-glass" hidden></ul></div><button type="button" class="cl-mbtn" id="clMBtn" aria-expanded="false" aria-controls="clFly">Explore & layout</button><div class="cl-mlist" id="clMList" aria-label="Layout" hidden></div><button type="button" class="cl-filterpick" id="clBodyFilter" hidden aria-label="Clear body filter"></button><div class="cl-head" id="clHead"><div class="cl-eye" id="clEye" hidden></div><div class="cl-stat" id="clStat"></div><div class="cl-livel" id="clLiveLine"></div></div><div class="cl-stack" id="clStack"><div class="cl-sth"><span>Crawler log</span><span id="clStackT"></span></div><ol id="clStackList"></ol></div></div>
      <div class="cl-menu cl-menur" id="clMenuR"><button type="button" class="cl-mbtn" id="clMBtnR" aria-expanded="false" aria-controls="clFlyR">View</button><div class="cl-mlist" id="clMListR" aria-label="View" hidden></div></div>
      <aside class="cl-pan cl-lens cl-fly" id="clFly" hidden aria-label="Layout settings"></aside>
      <aside class="cl-pan cl-lens cl-fly r" id="clFlyR" hidden aria-label="View settings"></aside>
      <div class="cl-top">
        <div class="cl-tl"></div>
        <div class="cl-presets cl-views" id="clPresets" role="toolbar" aria-label="Quick views"></div>
        <div class="cl-tr"><button class="cl-vbtn cl-glass" id="clArrBtn" type="button" aria-expanded="false" aria-controls="clArrP">Layout</button>
        <button class="cl-vbtn cl-glass" id="clViewBtn" type="button" aria-expanded="false" aria-controls="clView">View</button></div>
      </div>
      <aside class="cl-pan cl-arrp cl-lens cl-glass" id="clArrP" hidden aria-label="Layout">
        <div class="cl-panh"><b>Layout</b><button class="cl-px" type="button" data-close="clArrP" aria-label="Close">×</button></div>
        <p class="cl-lh">Find</p>
        <details class="cl-sec cl-out"><summary>Search options</summary><div>
          <p class="cl-fl">Search in</p><select id="clFIn" aria-label="Search in"></select>
          <label class="cl-vrow"><span>Allow typos</span><input type="checkbox" id="clFFuzzy"></label>
          <label class="cl-vrow"><span>Light up matches</span><input type="checkbox" id="clFMark"></label>
          <label class="cl-vrow"><span>Name matches</span><input type="checkbox" id="clFLabel"></label>
          <label class="cl-vrow"><span>Only shown topics</span><input type="checkbox" id="clFOnly"></label>
          <label class="cl-vrow"><span>Results</span><select id="clFMax" aria-label="Results"></select></label>
          <p class="cl-fl">Sort hits</p><select id="clFSort" aria-label="Sort hits"></select></div></details>
        <details class="cl-sec cl-out"><summary>Statistics</summary><div>
          <details class="cl-sec cl-out"><summary>Overview</summary><div><dl class="cl-kv" id="clStO"></dl></div></details>
          <details class="cl-sec cl-out"><summary>Share by group</summary><div><select id="clStDim" aria-label="Share by"></select><p class="cl-fl">Measure</p><select id="clStMeas" aria-label="Measure"></select><div class="cl-sbars" id="clStD"></div></div></details>
          <details class="cl-sec cl-out"><summary>Top lists</summary><div><select id="clStTop" aria-label="Rank by"></select><div class="cl-sbars" id="clStT"></div></div></details>
          <details class="cl-sec cl-out"><summary>Strongest links</summary><div><div class="cl-sbars" id="clStL"></div></div></details>
          <details class="cl-sec cl-out"><summary>Data quality</summary><div><p class="cl-fl">Threads read per topic</p><div class="cl-sbars" id="clStC"></div><p class="cl-fl">Source score</p><div class="cl-sbars" id="clStQ"></div></div></details></div></details>
        <p class="cl-lh">Explore</p>
        <details class="cl-sec" open><summary>Brain regions</summary><div id="clBrainRegions" class="cl-atlas"></div></details><details class="cl-sec"><summary>Body atlas</summary><div id="clBodyAtlas" class="cl-atlas"></div></details>
        <p class="cl-lh">Shape</p>
        <div class="cl-forms" id="clArr"></div>
        <p class="cl-lh">Sort into</p>
        <select id="clGroup" aria-label="Sort into"></select>
        <p class="cl-note" id="clGroupNote"></p>
        <p class="cl-ins" id="clIns"></p>
        <label class="cl-vrow cl-sub" id="clOrderRow"><span>Order</span><select id="clOrder" aria-label="Order"></select></label>
        <p class="cl-lh">Tint by</p>
        <select id="clColor" aria-label="Tint by"></select>
        <div class="cl-ckey" id="clCKey"></div>
        <p class="cl-lh">Size by</p>
        <select id="clSizeBy" aria-label="Size by"></select>
        <p class="cl-lh">Filter</p>
        <details class="cl-sec" open><summary>Sources &amp; time</summary><p class="cl-fl">Sources</p><select id="clQual" aria-label="Sources"></select><p class="cl-fl">Talked about</p><select id="clTime" aria-label="Talked about"></select></details>
        <details class="cl-sec"><summary>Certainty</summary><select id="clCert" aria-label="Certainty"></select></details>
        <p class="cl-lh">Show</p>
        <select id="clOrigin" aria-label="Which topics"></select>
        <details class="cl-sec" open><summary>Limits</summary><label class="cl-vrow"><span>Hide below</span><input type="range" id="clMin" min="0" max="8" step="1" aria-label="Minimum posts per topic"><output id="clMinV"></output></label>
        <label class="cl-vrow"><span>Biggest only</span><select id="clTop" aria-label="Only the biggest topics"></select></label>
        <label class="cl-vrow"><span>One group</span><select id="clOnly" aria-label="Only this group"></select></label>
        <p class="cl-fl">Filtered topics</p><select id="clDim" aria-label="Filtered topics"></select></details>
        <details class="cl-sec"><summary>Lines &amp; numbers</summary><div class="cl-tog"><label><input type="checkbox" id="clLinks"><span>Lines</span></label><label><input type="checkbox" id="clCounts"><span>Numbers</span></label></div></details>
        <div class="cl-lfoot"><form class="cl-save" id="clSave"><input id="clSaveName" maxlength="40" placeholder="Keep this view as …" aria-label="Name for the saved view" autocomplete="off"><button type="submit">Keep</button></form><button type="button" id="clSetReset">Reset</button></div>
        <span id="clFormQ" hidden></span><span id="clGroupsSub" hidden></span><span id="clShowsSub" hidden></span><span id="clPresetsSub" hidden></span>
      </aside>
      <nav class="cl-leg" id="clLeg" aria-label="Clusters"></nav>
      <aside class="cl-side cl-glass" id="clSide" hidden><button class="cl-x" id="clSideX" type="button" aria-label="Close">×</button><div id="clSideBody"></div></aside>
      <aside class="cl-pan cl-view cl-glass" id="clView" hidden aria-label="View">
        <div class="cl-panh"><b>View</b><button class="cl-px" type="button" data-close="clView" aria-label="Close">×</button></div>
        <p class="cl-vh">Show</p>
        <label class="cl-vrow"><span>Topics</span><input type="checkbox" id="clShowNodes"></label>
        <label class="cl-vrow"><span>Posts</span><input type="checkbox" id="clShowPosts"></label>
        <label class="cl-vrow"><span>Labels</span><input type="checkbox" id="clShowLabels"></label>
        <label class="cl-vrow"><span>Body markers</span><input type="checkbox" id="clMarks"></label><label class="cl-vrow"><span>Readout</span><input type="checkbox" id="clReadout"></label>
        <p class="cl-vh">Camera</p>
        <details class="cl-sec" open><summary>Framing</summary><select id="clFraming" aria-label="Camera framing"><option value="brain">Brain close-up</option><option value="upper">Upper body</option><option value="whole">Whole anatomy</option></select></details>
        <details class="cl-sec"><summary>Angle</summary><select id="clAngle" aria-label="Camera angle"><option value="quarter">Three-quarter</option><option value="front">Front</option><option value="side">Side</option><option value="back">Back</option><option value="above">From above</option><option value="below">From below</option></select></details>
        <details class="cl-sec cl-out"><summary>View presets</summary><div><div class="cl-chips" id="clVPre"></div></div></details>
        <label class="cl-vrow"><span>Field of view</span><input type="range" id="clFov" min="25" max="75" step="1"><output id="clFovV"></output></label><label class="cl-vrow"><span>Quality</span><input type="range" id="clQuality" min="50" max="150" step="10"><output id="clQualityV"></output></label>
        <p class="cl-vh">Motion</p>
        <label class="cl-vrow"><span>Turning</span><input type="checkbox" id="clTurn"></label>
        <label class="cl-vrow cl-sub"><span>Speed</span><input type="range" id="clSpeed" min="0" max="300" step="10"><output id="clSpeedV"></output></label>
        <details class="cl-sec"><summary>Fine motion</summary><label class="cl-vrow"><span>Drift</span><input type="range" id="clDrift" min="0" max="200" step="10"><output id="clDriftV"></output></label><label class="cl-vrow"><span>Pulse</span><input type="range" id="clPulse" min="0" max="200" step="10"><output id="clPulseV"></output></label></details>
        <p class="cl-vh">Look</p><details class="cl-sec" open><summary>Brain regions</summary><label class="cl-vrow"><span>Show regions</span><input type="checkbox" id="clRegions"></label><label class="cl-vrow"><span>Region colour</span><input type="range" id="clRegionStrength" min="0" max="100" step="1"><output id="clRegionStrengthV"></output></label></details>
        <details class="cl-sec" open><summary>Dots</summary><label class="cl-vrow"><span>Point size</span><input type="range" id="clSize" min="50" max="200" step="10"><output id="clSizeV"></output></label><label class="cl-vrow"><span>Brightness</span><input type="range" id="clBright" min="50" max="160" step="1"><output id="clBrightV"></output></label><label class="cl-vrow"><span>Saturation</span><input type="range" id="clSat" min="0" max="200" step="1"><output id="clSatV"></output></label></details>
        <details class="cl-sec"><summary>Fibres</summary><label class="cl-vrow"><span>Fibre glow</span><input type="range" id="clFib" min="0" max="400" step="10"><output id="clFibV"></output></label></details>
        <details class="cl-sec"><summary>Body</summary><p class="cl-fl">Structure</p><select id="clBodyMode" aria-label="Body structure"><option value="full">Body &amp; systems</option><option value="nerves">Nerve pathways</option><option value="spine">Spine only</option><option value="hidden">Brain only</option></select><label class="cl-vrow"><span>Body</span><input type="range" id="clBody" min="10" max="100" step="5"><output id="clBodyV"></output></label><label class="cl-vrow"><span>Organ glow</span><input type="range" id="clOrgan" min="0" max="200" step="10"><output id="clOrganV"></output></label></details>
        <details class="cl-sec"><summary>Labels</summary><label class="cl-vrow"><span>Label size</span><input type="range" id="clLabelSize" min="80" max="150" step="1"><output id="clLabelSizeV"></output></label><label class="cl-vrow"><span>Labelled topics</span><input type="range" id="clLDense" min="0" max="40" step="1"><output id="clLDenseV"></output></label></details>
        <p class="cl-fl">Brain colour</p>
        <div class="cl-themes" id="clThemes"></div>
        <p class="cl-fl">Panel colour</p>
        <div class="cl-bgs" id="clUiCols"></div>
        <button type="button" class="cl-shot" id="clShot">Save picture</button>
        <p class="cl-vh">Interface</p>
        <label class="cl-vrow"><span>Crawler log</span><input type="checkbox" id="clCLog"></label><label class="cl-vrow"><span>Threads chart</span><input type="checkbox" id="clHistOn"></label><label class="cl-vrow"><span>Hint</span><input type="checkbox" id="clHintOn"></label>
        <p class="cl-vh">Background</p>
        <div class="cl-bgs" id="clBgs"></div>
        <label class="cl-vrow"><span>Background glow</span><input type="range" id="clVign" min="0" max="100" step="5"><output id="clVignV"></output></label>
        <p class="cl-vh">Setups</p>
        <form class="cl-save" id="clSetupSave"><input id="clSetupName" maxlength="24" placeholder="Setups" aria-label="Setups" autocomplete="off"><button type="submit">Save</button></form>
        <div class="cl-presets" id="clSetups"></div>
        <button type="button" class="cl-shot" id="clCopyLink">Copy link</button>
        <div class="cl-vfoot"><button type="button" id="clVReset">Reset</button><button type="button" id="clVOver">Overview</button></div>
      </aside>
      <div class="cl-foot"><div class="cl-lf"><div class="cl-hint">drag to turn · shift + drag to move · scroll to zoom in · click a topic or use the arrow keys · esc for overview</div>
        <div class="cl-legend"><div class="cl-lh"><span>Topics</span><span>Posts</span></div><div id="clLegend"></div><button class="cl-more" id="clLegMore" type="button"></button></div></div>
        <div class="cl-read"><div id="clRead"></div><figure class="cl-hist" id="clHistF" hidden><svg id="clHist" viewBox="0 0 120 34" role="img" aria-label="Threads read per day"></svg><figcaption>threads read per day</figcaption></figure><div class="cl-btns"><button class="cl-btn" id="clFresh" type="button">refresh data</button><button class="cl-btn" id="clReset" type="button">overview</button></div></div></div>
      <div class="cl-state" id="clState">Loading the database …</div>
    </div>
    <div class="cl-live" aria-live="polite">
      <div class="cl-p"><div class="cl-ph"><span>Crawler · live</span><span id="clLvAt"></span></div><div class="cl-big" id="clLvCrawler">–</div><div class="cl-sub" id="clLvCrawlerSub"></div><div class="cl-big" id="clLvCodex" style="margin-top:6px">–</div><div class="cl-sub" id="clLvCodexSub"></div></div>
      <div class="cl-p cl-logp"><div class="cl-ph"><span>Crawler log</span><span>uploads, notes, dropped – live</span></div><ul class="cl-feed" id="clLvFeed"></ul></div>
      <div class="cl-p"><div class="cl-ph"><span>Activity</span><span id="clActNote"></span></div><svg class="cl-chart" id="clAct" viewBox="0 0 320 166" role="img" aria-label="Crawler and chat activity per day"></svg><div class="cl-key"><span><i style="--c:#7dd3fc"></i>threads read</span><span><i style="--c:#5eead4"></i>new notes</span><span><i style="--c:#2f8f86"></i>answers</span></div></div>
    </div>
    <div class="cl-dash">
      <div class="cl-p"><div class="cl-ph"><span>Most discussed</span><span>posts, estimated</span></div><ul class="cl-rows" id="clTerms"></ul></div>
      <div class="cl-p" id="clFocus"></div>
      <div class="cl-p"><div class="cl-ph"><span>Relations</span><span id="clEgoNote"></span></div><svg class="cl-chart" id="clEgo" viewBox="0 0 260 170" role="img" aria-label="Direct connections of the active node"></svg></div>
      <div class="cl-p"><div class="cl-ph"><span>Matrix</span><span>overlap</span></div><svg class="cl-chart" id="clMatrix" viewBox="0 0 196 178" role="img" aria-label="Shared notes of the eight biggest terms"></svg></div>
      <div class="cl-p"><div class="cl-ph"><span>Today</span><span>since 00:00</span></div><dl class="cl-stats" id="clLvToday"></dl><div class="cl-sub" id="clLvQueue"></div></div>
      <div class="cl-p"><div class="cl-ph"><span>Waiting</span><span>inbox, oldest first</span></div><ul class="cl-feed" id="clLvQ"></ul></div>
    </div>
  </div>`;

  const $ = (id) => document.getElementById(id);
  const REC = /[?&]rec\b/.test(location.search);   // screen-recording mode: terms blurred, camera jumps instead of gliding
  const fmt = (n) => Number(n).toLocaleString('en-US');
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const safeUrl = (u) => { try { const x = new URL(u, location.href); return /^https?:$/.test(x.protocol) ? x.href : '#'; } catch { return '#'; } };   // server data: no javascript: links
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let app = null, running = false, mounting = null, wanted = false;
  // public brain page (brain.html sets window.ccCloudPublic): no titles, no links, lexicon / log / ranking blurred
  const PUB = !!window.ccCloudPublic;
  const EMBED = /[?&]embed\b/.test(location.search);
  const CLOSE = EMBED && /[?&]close\b/.test(location.search);   // chat background: camera close on the white threads
  const FILL = ['first', 'cycle', 'results', 'after', 'weeks', 'labs', 'question', 'experience', 'log', 'my', 'and', 'with', 'running', 'advice', 'update', 'blood', 'work', 'how', 'long', 'should', 'the'];
  const filler = (n, k = 0) => { let s = '', i = k * 7; while (s.length < n) { s += (s ? ' ' : '') + FILL[(i * 5 + (i >> 2)) % FILL.length]; i++; } return s.slice(0, Math.max(3, n)); };   // stand-in text of the right length, real text never reaches the page
  const bl = (n) => PUB && n && n.kind === 'thought' ? ' cl-blur' : '';   // thought path texts are censored on the public page
  const pubCleanup = (root) => {
    if (!PUB) return;
    root.querySelector('.cl').classList.add('pub');
    $('clLvQ').closest('.cl-p').remove(); $('clFresh').remove();
  };

  function loadThree() {
    if (window.THREE) return Promise.resolve();
    return new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = '/vendor/three.r128.min.js'; s.onload = ok; s.onerror = () => fail(new Error('3D library could not be loaded.'));
      document.head.appendChild(s);
    });
  }
  async function getData(fresh) {
    if (window.ccGuideData) return window.ccGuideData;
    const r = await fetch(PUB ? '/api/public/brain' : '/api/admin/cloud' + (fresh ? '?fresh=1' : ''), { credentials: 'same-origin', cache: 'no-store' });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || `Server error ${r.status}`);
    return d;
  }

  async function mount(root) {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    root.innerHTML = HTML; pubCleanup(root); if (REC) root.querySelector('.cl').classList.add('cl-rec');
    try {
      const [, data] = await Promise.all([loadThree(), getData(false)]);
      app = build(data);
      $('clState').hidden = true;
    } catch (e) {
      $('clState').textContent = e.message;
      throw e;
    }
  }

  function build(D) {
    const THREE = window.THREE, S = STATIC;
    if (D && D.guide) {
      S.clusters = D.clusters;
      S.nodes = [];
      S.thought = [];
      S.start = D.start || S.start;
      S.linkMinForLine = 1;
    }
    const small = matchMedia('(max-width: 760px)').matches;
    let seed = 20261111;
    const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const col = (h) => new THREE.Color(h);

    // ---------- brain shape (same formula as field.js / shapes.js brain) ----------
    const BS = 3.4, sph = () => { const u = rnd() * 2 - 1, t = rnd() * Math.PI * 2, q = Math.sqrt(1 - u * u); return [q * Math.cos(t), u, q * Math.sin(t)]; };
    const fdirs = Array.from({ length: 9 }, () => { const d = sph(), f = .8 + rnd() * 1.6; return [d[0] * f, d[1] * f, d[2] * f, rnd() * Math.PI * 2]; });
    // lobes in brain units: lateral (Sylvian) fissure, central sulcus (vertex down and forward), parieto-occipital sulcus
    const SYL = (x) => -.03 + (.45 - x) * .26, CEN = (y) => .12 - (y - .05) * .42, POC = (y) => -.58 - (y - .3) * .15;
    const lobeRaw = (x, y, z) => { const az = Math.abs(z);
      if (y < -.2 && x < -.38) return 'cb';
      if (y < -.12 && az < .17 && Math.abs(x + .22 - (y + .27) * .3) < .16) return 'stem';
      if (Math.hypot((x + .12) / .3, (y - .04) / .2, az / .26) < 1) return 'stem';   // thalamus + hypothalamus: the hormone axis
      if (y < SYL(x) && x > -.7 && az > .3) return 'tmp';
      if (x < POC(y)) return 'occ';
      return x > CEN(y) ? 'fr' : 'par'; };
    const lobeOf = (q) => lobeRaw(q[0] / BS, q[1] / BS, q[2] / BS);
    const fold = (X, Y, Z) => {   // called with brain units x 9.5
      let n = 0; for (const [a, b, c, ph] of fdirs) n += Math.sin(a * X + b * Y + c * Z + ph); n /= 3;   // irregular folds (parietal, occipital) and a warp for the rest
      const x = X / 9.5, y = Y / 9.5, az = Math.abs(Z / 9.5), l = lobeRaw(x, y, az), dc = x - CEN(y);
      if ((l === 'fr' || l === 'par') && Math.abs(dc) < .14 && y > SYL(x)) return .6 - Math.abs(Math.cos(dc / .14 * Math.PI + n * .35)) * 1.1;   // precentral + postcentral gyri along the central sulcus
      if (l === 'fr') return .6 - Math.abs(Math.cos(Math.atan2(y + .1, az) * 6 + n * .7)) * 1.1;   // superior, middle, inferior frontal gyri run front to back
      if (l === 'tmp') return .6 - Math.abs(Math.cos((SYL(x) - y) / .12 * Math.PI + n * .6)) * 1.1;   // superior, middle, inferior temporal gyri parallel to the fissure
      return .6 - Math.abs(n) * 1.6; };
    // anatomy in brain units (x front+, y up, z right+), scaled by BS
    function cortexRaw() {
      for (let tries = 0; tries < 60; tries++) {
        const q = sph(), side = q[2] < 0 ? -1 : 1;
        let x = q[0], y = q[1] * .66 + .08, z = side * (.045 + Math.abs(q[2]) * .74);
        if (Math.abs(q[2]) < .06 && rnd() < .8) continue;                        // medial wall: sparse, so the fissure reads
        if (x > .55) { const n = (x - .55) / .45; z *= 1 - .28 * n; y -= .1 * n * n; }   // frontal pole
        if (x < -.6) { const n = (-.6 - x) / .4; z *= 1 - .32 * n; y -= .04 * n; }      // occipital pole
        if (y < -.2) y = -.2 + (y + .2) * .4;                                       // flat base
        if (x > -.38 && x < .5 && Math.abs(z) > .36 && y < .06) { const b = Math.sin((x + .38) / .88 * Math.PI); y -= .22 * b * Math.min(1, (Math.abs(z) - .36) / .38); }   // temporal lobe
        const sy = -.03 + (.45 - x) * .26;                                          // Sylvian fissure above the temporal lobe
        if (Math.abs(z) > .42 && x > -.32 && x < .5 && Math.abs(y - sy) < .03) continue;
        if (y > sy && Math.abs(x - CEN(y)) < .014 && rnd() < .9) continue;                // central sulcus
        if (y > .05 && Math.abs(z) < .45 && Math.abs(x - POC(y)) < .014 && rnd() < .9) continue;   // parieto-occipital sulcus
        const g = fold(x * 9.5, y * 9.5, z * 9.5);                                  // gyri crests dense, sulci almost empty
        if (g < -.05 && rnd() < .88) continue;
        const r = 1 + .03 * Math.max(-.4, g); return [x * r * BS, y * r * BS, z * r * BS];
      }
      return [0, .3 * BS, .5 * BS];
    }
    function cerebellumRaw() {
      for (let tries = 0; tries < 30; tries++) {
        const q = sph(), z = q[2] * .5, x = -.6 + q[0] * .27 + (Math.abs(z) < .08 ? .05 : 0), y = -.36 + q[1] * .17 * (1 - .25 * Math.max(0, .12 - Math.abs(z)) / .12);
        if (Math.abs(Math.sin(q[1] * 16 + q[0] * 3)) < .38) continue;                // folia: fine parallel ridges
        return [x * BS, y * BS, z * BS];
      }
      return [-.6 * BS, -.36 * BS, 0];
    }
    function stemRaw() {
      const y = -.27 - rnd() * .44, t = rnd() * Math.PI * 2, pons = y < -.36 && y > -.56 ? .04 : 0, r = (y > -.36 ? .075 : y > -.56 ? .1 : .07 + (y + .56) * .15) * Math.sqrt(rnd());   // midbrain, pons (bulging forward), medulla tapering to the foramen magnum
      return [(-.22 + (y + .27) * .3 + pons + Math.cos(t) * r * .8) * BS, y * BS, Math.sin(t) * r * BS];
    }
    function deepRaw() {   // corpus callosum (arch, genu to splenium), the two thalami, the insula under the lateral fissure
      const k = rnd(), side = rnd() < .5 ? -1 : 1; let q;
      if (k < .4) { const t = rnd(); q = [.4 - .85 * t, .2 + .13 * Math.sin(Math.PI * t) + gauss() * .015, gauss() * .16]; }
      else if (k < .7) { const d = sph(); q = [-.12 + d[0] * .13, .02 + d[1] * .07, side * (.1 + Math.abs(d[2]) * .07)]; }
      else { const d = sph(); q = [.03 + d[0] * .25, -.02 + d[1] * .1, side * (.5 + d[2] * .03)]; }
      const w = [q[0] * BS, q[1] * BS, q[2] * BS]; w.deep = true; return w;
    }
    function brainPt(cortexOnly) {   // one point of the brain in world units; cerebellum + brainstem + deep structures unless cortexOnly
      const k = cortexOnly ? 1 : rnd();
      return k < .13 ? cerebellumRaw() : k < .21 ? stemRaw() : k < .26 ? deepRaw() : cortexRaw();   // a fuller stem: brain and spinal cord read as one line
    }
    // pull a surface point into the brain volume: f = 1 stays on the cortex, smaller f lies deeper inside
    // (towards the centre of its own hemisphere, so the midline gap stays and the inside is filled, not the walls)
    const inVol = (q, f) => { if (q.deep || q[1] < -.22 * BS) return q;   // cerebellum + stem keep their place
      const cx = -.05 * BS, cy = .1 * BS, cz = Math.sign(q[2] || 1) * .28 * BS;
      return [cx + (q[0] - cx) * f, cy + (q[1] - cy) * f, cz + (q[2] - cz) * f]; };
    const near = (c, rad, lobe) => { let best = null, bd = 1e9; for (let i = 0; i < 400; i++) { const q = brainPt(!lobe || lobe === 'fr' || lobe === 'par' || lobe === 'tmp' || lobe === 'occ'); if (lobe && lobeOf(q) !== lobe) continue; const d = Math.hypot(q[0] - c[0], q[1] - c[1], q[2] - c[2]); if (d < rad) return q; if (d < bd) { bd = d; best = q; } } return best || brainPt(true); };

    // ---------- graph ----------
    const clusters = Object.fromEntries(S.clusters.map((c) => [c.id, c]));
    const meanP = D.mean_posts;
    const estOf = (t) => t ? t.posts_known + (t.threads - t.threads_known) * meanP : 0;
    for (const a of D.auto || []) if (clusters[a[2]] && /^[a-z0-9_.-]{1,80}$/i.test(a[0]) && !S.nodes.some((x) => x[0] === a[0])) S.nodes.push(a);   // topics auto_terms.py added on the server
    const terms = S.nodes.filter(([id]) => D.terms[id]);
    const maxEst = Math.max(1, ...terms.map(([id]) => estOf(D.terms[id])));
    const nodes = [], byId = {}, placed = [];
    const spaced = (c, rad, lobe, f = 1) => { let best = null, bv = null, bs = -1;   // spacing is measured where the topic ends up (after inVol), not on the cortex: hubs pulled inward no longer clump
      for (let i = 0; i < 48; i++) { const q = near(c[2] ? [c[0], c[1], c[2] * (rnd() < .5 ? -1 : 1)] : c, rad, lobe), v = inVol(q, f); let m = 9; for (const o of placed) m = Math.min(m, Math.hypot(v[0] - o[0], v[1] - o[1], v[2] - o[2])); if (m > bs) { bs = m; best = q; bv = v; } }
      placed.push(bv); return best; };
    terms.sort((a, b) => estOf(D.terms[b[0]]) - estOf(D.terms[a[0]]));
    for (const [id, label, cluster, def] of terms) {
      const cl = clusters[cluster], th = D.terms[id], est = estOf(th);
      const pull = 1 - Math.sqrt(est / maxEst) * .55;
      const f = .05 + .72 * pull, surf = spaced(cl.center, id === S.start ? .3 : .9 + cl.spread * pull * 1.1, cl.lobe, f), p = inVol(surf, f);   // surf: its place on the cortex; the topic itself lies underneath (big hubs deep, small topics nearer the cortex)
      const n = { id, label, cluster, def, kind: 'term', surf, th, est: Math.round(est), pos: new THREE.Vector3(...p), weight: Math.sqrt(est / maxEst), color: cl.color, links: [] };
      nodes.push(n); byId[id] = n;
    }
    // thought path from the data: [id, label, text, metrics]; public: [anonymous id, label length, text length, []] -> blurred stand-ins
    S.thought = (D.thought || []).map(([id, l, d, m], i) => PUB ? [id, filler(l, i + 5), filler(d, i + 9), []] : [id, l, d, m || []]);
    S.thought.forEach(([id, label, def, metrics], i) => {
      const t = i / (S.thought.length - 1), arc = [1.6 - 3.4 * t, 2.2 - 5.4 * t, 4.9 + .9 * Math.sin(Math.PI * t)];
      const n = { id, label, def, kind: 'thought', cluster: 'thought', step: i + 1, metrics, pos: new THREE.Vector3(...arc), weight: .42, color: clusters.thought.color, links: [] };
      nodes.push(n); byId[id] = n;
    });
    const edges = [];
    for (const [a, b, k] of D.pairs) {
      if (!byId[a] || !byId[b]) continue;
      byId[a].links.push({ node: byId[b], n: k }); byId[b].links.push({ node: byId[a], n: k });

    }
    // Keep measured weak links for rare topics; never manufacture a shared-note count.
    nodes.forEach((n) => n.links.sort((a, b) => b.n - a.n));
    const topLinks = new Map(nodes.map((n) => [n.id, new Set(n.links.slice(0, 2).map((l) => l.node.id))]));
    for (const [a, b, count] of D.pairs) {
      if (!byId[a] || !byId[b] || count <= 0) continue;
      if (count >= S.linkMinForLine || topLinks.get(a).has(b) || topLinks.get(b).has(a)) {
        edges.push({ a: byId[a], b: byId[b], n: count, kind: 'co' });
      }
    }
    const connected = new Set(edges.flatMap((e) => [e.a.id, e.b.id]));
    const unlinked = new Set(nodes.filter((n) => n.kind === 'term' && !connected.has(n.id)).map((n) => n.id));
    // Catalog groups connect topics lacking shared notes, separately from measured relations.
    const subjects = [
      ['training', 'Training methods', 'goals', ['amap', 'amrap', 'restpause', 'slingshot', 'calisthenics', 'snatch', 'facepull', 'tabata', 'stationarybike', 'airdyne', 'explosiveness', 'hiit', 'bodypart', 'fullbodytraining', 'plateau']],
      ['movement', 'Muscles & movement', 'goals', ['adductor', 'collarbones', 'erectors', 'posture', 'musclecontraction', 'musclefibers', 'hypertrophy', 'deltoid', 'pectoral', 'vastus']],
      ['food', 'Foods & nutrition', 'goals', ['couscous', 'quinoa', 'shrimp', 'mushrooms', 'flax', 'berries', 'calorie', 'intraworkout']],
      ['supplements', 'Supplements & minerals', 'goals', ['turmeric', 'chromium', 'vanadylsulfate', 'dandelion', 'iodine', 'glucosamine', 'multivitamin', 'creatine', 'electrolytes']],
      ['composition', 'Body composition', 'goals', ['skinfoldcalipers', 'bodpod', 'dexa', 'bodyfat', 'bodyrecomposition', 'adiposetissue']],
      ['immunity', 'Immunity & inflammation', 'blood', ['shingles', 'pneumonia', 'flulikesymptoms', 'prednisone', 'immune', 'allergies']],
      ['nerves', 'Nervous system & mood', 'blood', ['neuropathy', 'migraine', 'mania', 'aggressiveness', 'anxiety', 'depression', 'mood']],
      ['recovery', 'Sleep & recovery', 'goals', ['snoring', 'overtraining', 'drowsiness', 'nightmares', 'sleep', 'cpap']],
      ['hormones', 'Hormones & metabolism', 'blood', ['postmenopause', 'glycemicresponse', 'estradiol', 'glucose', 'thyroid']],
      ['circulation', 'Blood & electrolytes', 'blood', ['chloride', 'hematoma', 'bloodwork', 'electrolytes', 'sodium', 'potassium', 'bruising']],
      ['health', 'Health topics', 'blood', ['cataracts', 'bloodwork', 'immune', 'sleep']]
    ];
    const groups = [];
    function subjectGroup(id, label, cluster, ids) {
      const members = [...new Set(ids)].map((k) => byId[k]).filter((n) => n && n.kind === 'term');
      if (!members.some((n) => unlinked.has(n.id))) return;
      const cl = clusters[cluster];
      const centre = members.reduce((v, n) => v.add(n.pos), new THREE.Vector3()).multiplyScalar(1 / members.length);
      const pos = new THREE.Vector3(...inVol(spaced([centre.x, centre.y, centre.z], .8, undefined, .72), .72));
      const n = { id: 'subject-' + id, label, cluster, kind: 'group', def: 'Topics grouped by subject.', members, th: {},
        pos, weight: .3, est: 0, color: cl.color, links: [] };
      nodes.push(n); byId[n.id] = n; groups.push(n);
      members.forEach((m) => {
        edges.push({ a: n, b: m, n: 0, kind: 'subject' });
        n.links.push({ node: m, n: 0, kind: 'subject' });
        m.links.push({ node: n, n: 0, kind: 'subject' });
        unlinked.delete(m.id);
      });
    }
    subjects.forEach((args) => subjectGroup(...args));
    // Future catalog additions still receive an honest category connection.
    S.clusters.filter((c) => c.spread > 0).forEach((c) => {
      const missing = [...unlinked].filter((id) => byId[id].cluster === c.id);
      const anchors = nodes.filter((n) => n.kind === 'term' && n.cluster === c.id && !unlinked.has(n.id))
        .sort((a, b) => b.est - a.est).slice(0, 2).map((n) => n.id);
      if (missing.length) subjectGroup(c.id, c.label + ' topics', c.id, [...missing, ...anchors]);
    });
    for (let i = 0; i < S.thought.length - 1; i++) {
      const a = byId[S.thought[i][0]], b = byId[S.thought[i + 1][0]];
      edges.push({ a, b, n: 0, kind: 'thought' }); a.links.push({ node: b, n: 0 }); b.links.push({ node: a, n: 0 });
    }
    for (const [si, b] of S.bridges) { const a = S.thought[si] && S.thought[si][0]; if (byId[a] && byId[b]) edges.push({ a: byId[a], b: byId[b], n: 0, kind: 'bridge' }); }
    nodes.forEach((n) => n.links.sort((x, y) => y.n - x.n));
    const maxLink = Math.max(1, ...edges.map((e) => e.n));

    // ---------- renderer ----------
    const stage = $('clStage');
    var bowK = 1;   // 1 in the brain (links curve through the white matter), 0 in an arrangement (straight)
    var MX = -1e4, MY = -1e4, arrDim = 'cluster';   // mouse over the stage (group names light up near it); grouping of the current arrangement
    const renderer = new THREE.WebGLRenderer({ canvas: $('clGl'), antialias: false, alpha: true, powerPreference: 'high-performance' });
    const pr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75); var qual = 100;   // qual: View > Camera > Quality
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(42, 1, .1, 80), world = new THREE.Group();
    scene.add(world);
    const U = { uTime: { value: 0 }, uScale: { value: 400 }, uDrift: { value: reduced ? 0 : 1 }, uPulse: { value: reduced ? 0 : 1 }, uWave: { value: new THREE.Vector4(-99, -99, -99, -99) },
      uPal: { value: Array.from({ length: 5 }, () => new THREE.Color()) }, uPalOn: { value: 0 }, uSizeMul: { value: 1 }, uMorph: { value: 0 }, uBright: { value: 1 }, uSat: { value: 1 }, uFocusY: { value: -8 }, uFocusA: { value: 0 }, uFocusK: { value: 2.4 }, uFib: { value: 1 }, uFade: { value: 0 }, uBody: { value: .45 } };

    // aPath: distance from the brain along the cord and nerves (>= 0), -2 = brain dot that sparks when an impulse leaves, -1 = nothing
    const pointVS = `attribute float aSize; attribute float aAlpha; attribute float aPhase; attribute vec3 aColor; attribute float aPath;
      uniform float uTime; uniform float uScale; uniform float uDrift; uniform vec4 uWave; varying vec3 vColor; varying float vAlpha;
      uniform vec3 uPal[5]; uniform float uPalOn; uniform float uSizeMul; uniform float uBody; uniform float uFade; uniform float uFocusY; uniform float uFocusA; uniform float uFocusK;
      attribute vec3 aPos2; attribute float aMorphOn; uniform float uMorph;   // arrangement: data dots flow from the brain to aPos2
      vec3 pal(float t) { t = clamp(t, 0.0, 1.0) * 4.0; float f = fract(t);   // colour theme: brightness of the own colour -> palette
        if (t < 1.0) return mix(uPal[0], uPal[1], f); if (t < 2.0) return mix(uPal[1], uPal[2], f); if (t < 3.0) return mix(uPal[2], uPal[3], f); return mix(uPal[3], uPal[4], t >= 4.0 ? 1.0 : f); }
      float wv(float t0) { float d = uTime - t0; if (d < 0.0 || d > 5.0) return 0.0;
        if (aPath >= 0.0) return exp(-pow((aPath - d * 11.0) / 0.8, 2.0)) * (0.5 + 0.8 * fract(aPhase * 7.7));
        if (aPath < -1.5) return step(0.8, fract(aPhase * 13.0 + t0 * 0.37)) * exp(-pow((d - 0.12) / 0.16, 2.0)) * 1.3;
        return 0.0; }
      void main() { float mk = smoothstep(0.0, 1.0, clamp(uMorph * 1.25 - fract(aPhase * 5.3) * 0.25, 0.0, 1.0)) * aMorphOn;   // staggered per dot
        vec3 p = mix(position, aPos2, mk); float amp = 0.035 + 0.06 * fract(aPhase * 7.13);
        p += uDrift * amp * vec3(sin(uTime * 0.11 + aPhase * 6.2831), cos(uTime * 0.09 + aPhase * 4.1), sin(uTime * 0.07 + aPhase * 9.7));
        float b = wv(uWave.x) + wv(uWave.y) + wv(uWave.z) + wv(uWave.w);
        vec4 mv = modelViewMatrix * vec4(p, 1.0); float depth = -mv.z;
        vec3 base = mix(aColor, pal(dot(aColor, vec3(0.3, 0.59, 0.11)) * 1.15 + (fract(aPhase * 3.7) - 0.5) * 0.25), uPalOn);
        float ps0 = clamp(aSize * uScale * uSizeMul / depth * (1.0 + b * 1.4) * (1.0 + mk * 2.2 * smoothstep(2.0, 9.0, depth)), 0.0, 90.0); gl_PointSize = max(ps0, 1.2); /* sub-pixel dots shimmer while turning */ vColor = mix(base, vec3(0.92, 1.0, 0.98), clamp(b * 0.55, 0.0, 0.85));
        vAlpha = mix(mix(uBody, 1.0, clamp(b, 0.0, 1.0)), 1.0, smoothstep(-3.0, -2.0, position.y)) * aAlpha * (1.0 + b * 1.6) * (1.0 + uFocusA * uFocusK * (1.0 - smoothstep(-3.6, -3.0, position.y)) * exp(-pow((position.y - uFocusY) / 1.1, 2.0))) * (1.0 + mk * 0.6 * smoothstep(2.0, 9.0, depth)) * smoothstep(60.0, 8.0, depth) * (0.55 + 0.45 * smoothstep(1.2, 4.0, depth)) * step(0.0001, aSize);   /* size 0 = filtered out: alpha 0, discarded */ vAlpha *= min(1.0, max(ps0, 1.0) * max(ps0, 1.0) / 1.44) * (1.0 - uFade * 0.4); gl_Position = projectionMatrix * mv; }`;
    // View panel settings (kept per browser)
    const VIEW_DEF = { regions:true, regionStrength:90, framing: 'brain', angle: 'quarter', bodymode: 'full', theme: 'Default', turn: !reduced, speed: 100, links: true, size: 100, bright: 100, body: 45, sat: 100, lsize: 100, drift: 100, pulse: 100, fib: 100, organ: 100, ldense: 10, fov: 42, quality: 100, vign: 0, marks: true, readout: true, clog: true, hist: true, hint: true, ui: '', nodes: true, posts: true, labels: false, counts: true, bg: '#030607' };
    const pickSettings = (v, def) => Object.fromEntries(Object.entries(def).map(([k, d]) => [k,
      v && typeof v === 'object' && !Array.isArray(v) && Object.prototype.hasOwnProperty.call(v, k) && typeof v[k] === typeof d && (typeof d !== 'number' || Number.isFinite(v[k])) ? v[k] : d]));
    const VIEW = pickSettings((() => { try { return JSON.parse(localStorage.getItem('cc_brain_view')); } catch { return null; } })(), VIEW_DEF);
    if(EMBED) Object.assign(VIEW,VIEW_DEF,{marks:false},CLOSE?{bodymode:'hidden'}:{});
    if (!EMBED) try { if (localStorage.getItem('cc_brain_vmig') !== '2') { Object.assign(VIEW, { bright: 100, sat: 100, links: true }); localStorage.setItem('cc_brain_vmig', '2'); } } catch { /* storage blocked */ }   // once: test values from v87-90 washed the brain out
    var syncMenus = null;   // installed after the sections and flyouts exist; early setup must not touch their const/let bindings
    let waveI = 0, dataDots = null, postIds = [];
    const impulse = (delay = 0) => { const k = ['x', 'y', 'z', 'w'][waveI++ % 4]; U.uWave.value[k] = clock() + delay; };
    const pointFS = `uniform float uBright; uniform float uSat; varying vec3 vColor; varying float vAlpha; vec3 sat(vec3 c, float k) { return mix(vec3(dot(c, vec3(0.3, 0.59, 0.11))), c, k); } 
      void main() { float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = (pow(max(0.0, 1.0 - d), 2.4) + 0.25 * exp(-d * d * 3.0) * step(d, 1.0)) * vAlpha;
        if (a < 0.002) discard; gl_FragColor = vec4(sat(vColor, uSat), a * uBright); }`;
    var bodyCapture = null, bodyLayers = null, regionMeshes = [], regionRows = [], chooseRegion = null, syncRegions = null;
    const layer = (count, gen) => {
      const pos = new Float32Array(count * 3), size = new Float32Array(count), alpha = new Float32Array(count), phase = new Float32Array(count), color = new Float32Array(count * 3), path = new Float32Array(count);
      for (let i = 0; i < count; i++) { const o = gen(); pos.set(o.p, i * 3); color.set([o.c.r, o.c.g, o.c.b], i * 3); size[i] = o.s; alpha[i] = o.a; phase[i] = rnd(); path[i] = o.path ?? -1; }
      const g = new THREE.BufferGeometry();
      g.setAttribute('aPath', new THREE.BufferAttribute(path, 1));
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
      g.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1)); g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
      g.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
      const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, vertexShader: pointVS, fragmentShader: pointFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      m.frustumCulled = false; world.add(m); if (bodyCapture) bodyCapture.push(m); return m;
    };
    // fibre layer: short polylines instead of dots (brain, posts, cord, nerves); same impulses, colour themes and size slider
    const fibreVS = `attribute vec3 aColor; attribute float aAlpha; attribute float aPath; attribute float aPhase;
      uniform float uTime; uniform float uDrift; uniform vec4 uWave; uniform vec3 uPal[5]; uniform float uPalOn; uniform float uSizeMul; uniform float uBody;
      varying vec3 vC; varying float vA;
      vec3 pal(float t) { t = clamp(t, 0.0, 1.0) * 4.0; float f = fract(t);
        if (t < 1.0) return mix(uPal[0], uPal[1], f); if (t < 2.0) return mix(uPal[1], uPal[2], f); if (t < 3.0) return mix(uPal[2], uPal[3], f); return mix(uPal[3], uPal[4], t >= 4.0 ? 1.0 : f); }
      float wv(float t0) { float d = uTime - t0; if (d < 0.0 || d > 5.0) return 0.0;
        if (aPath >= 0.0) return exp(-pow((aPath - d * 11.0) / 0.8, 2.0)) * (0.5 + 0.8 * fract(aPhase * 7.7));
        if (aPath < -1.5) return step(0.8, fract(aPhase * 13.0 + t0 * 0.37)) * exp(-pow((d - 0.12) / 0.16, 2.0)) * 1.3;
        return 0.0; }
      void main() { vec3 p = position; float amp = 0.03 * fract(aPhase * 7.13);
        p += uDrift * amp * vec3(sin(uTime * 0.11 + aPhase * 6.2831), cos(uTime * 0.09 + aPhase * 4.1), sin(uTime * 0.07 + aPhase * 9.7));
        float b = wv(uWave.x) + wv(uWave.y) + wv(uWave.z) + wv(uWave.w);
        vec4 mv = modelViewMatrix * vec4(p, 1.0); float depth = -mv.z;
        vec3 base = mix(aColor, pal(dot(aColor, vec3(0.3, 0.59, 0.11)) * 1.15 + (fract(aPhase * 3.7) - 0.5) * 0.25), uPalOn);
        vC = mix(base, vec3(0.92, 1.0, 0.98), clamp(b * 0.55, 0.0, 0.85));
        vA = mix(mix(uBody, 1.0, clamp(b, 0.0, 1.0)), 1.0, smoothstep(-3.0, -2.0, position.y)) * aAlpha * uSizeMul * (1.0 + b * 1.6) * smoothstep(60.0, 8.0, depth); gl_Position = projectionMatrix * mv; }`;
    const fibreFS = 'uniform float uSat; vec3 sat(vec3 c, float k) { return mix(vec3(dot(c, vec3(0.3, 0.59, 0.11))), c, k); } varying vec3 vC; varying float vA; void main() { if (vA < 0.002) discard; gl_FragColor = vec4(sat(vC, uSat), vA); }';
    // strands: [{ pts: [[x,y,z]...], c: THREE.Color, a: alpha, path: (i, n) => impulse coordinate of point i (or a number) }]
    function addFibres(strands) {
      let n = 0; strands.forEach((s) => { n += s.pts.length - 1; });
      const pos = new Float32Array(n * 6), colr = new Float32Array(n * 6), alpha = new Float32Array(n * 2), path = new Float32Array(n * 2), phase = new Float32Array(n * 2);
      let o = 0;
      for (const s of strands) {
        const m = s.pts.length - 1, ph = rnd();
        for (let i = 0; i < m; i++) {
          pos.set(s.pts[i], o * 6); pos.set(s.pts[i + 1], o * 6 + 3); colr.set([s.c.r, s.c.g, s.c.b, s.c.r, s.c.g, s.c.b], o * 6);
          const t0 = i / m, t1 = (i + 1) / m;   // fade towards both ends: reads as a fibre, not a stick
          alpha[o * 2] = s.a * (.25 + .75 * Math.sin(Math.PI * Math.min(1, t0 + .08))); alpha[o * 2 + 1] = s.a * (.25 + .75 * Math.sin(Math.PI * Math.max(0, t1 - .08)));
          path[o * 2] = typeof s.path === 'function' ? s.path(i, m) : (s.path ?? -1); path[o * 2 + 1] = typeof s.path === 'function' ? s.path(i + 1, m) : (s.path ?? -1);
          phase[o * 2] = phase[o * 2 + 1] = ph; o++;
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aColor', new THREE.BufferAttribute(colr, 3)); g.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
      g.setAttribute('aPath', new THREE.BufferAttribute(path, 1)); g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
      const ls = new THREE.LineSegments(g, new THREE.ShaderMaterial({ uniforms: U, vertexShader: fibreVS, fragmentShader: fibreFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      ls.frustumCulled = false; world.add(ls); return ls;
    }
    const nrm3 = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
    const crs3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const hemi = (p) => [-.05 * BS, .1 * BS, Math.sign(p[2] || 1) * .28 * BS];
    // direction along the cortex: tangent to the hemisphere, turning slowly with position (reads like gyri)
    const alongCortex = (p) => {
      const hc = hemi(p), n = nrm3([p[0] - hc[0], p[1] - hc[1], p[2] - hc[2]]);
      const t = nrm3(crs3(n, [Math.sin(p[1] * 1.7 + p[2] * .9), Math.cos(p[0] * 1.3 - p[2] * .6), Math.sin(p[0] * .8 + p[1] * 1.1)]));
      return nrm3([t[0] + gauss() * .12, t[1] + gauss() * .12, t[2] + gauss() * .12]);
    };
    const growStrand = (p, dirFn, len, steps) => { const pts = [p]; let cur = p; for (let i = 0; i < steps; i++) { const d = dirFn(cur); cur = [cur[0] + d[0] * len / steps, cur[1] + d[1] * len / steps, cur[2] + d[2] * len / steps]; pts.push(cur); } return pts; };
    // gyri: a fibre follows the contour line of the fold field over the cortex (along a ridge or a groove) and stays on the
    // surface, so the lines draw the convolutions of a real brain instead of standing off like hair
    const foldW = (p) => fold(p[0] / BS * 9.5, p[1] / BS * 9.5, p[2] / BS * 9.5);
    const gyrusStrand = (q, len, steps) => {
      const hc = hemi(q), r0 = Math.hypot(q[0] - hc[0], q[1] - hc[1], q[2] - hc[2]), e = .01, pts = [q];
      let cur = q, prev = null;
      for (let i = 0; i < steps; i++) {
        const n = nrm3([cur[0] - hc[0], cur[1] - hc[1], cur[2] - hc[2]]), f0 = foldW(cur);
        const gr = [(foldW([cur[0] + e, cur[1], cur[2]]) - f0) / e, (foldW([cur[0], cur[1] + e, cur[2]]) - f0) / e, (foldW([cur[0], cur[1], cur[2] + e]) - f0) / e];
        let d = nrm3(crs3(n, gr));
        if (prev && d[0] * prev[0] + d[1] * prev[1] + d[2] * prev[2] < 0) d = [-d[0], -d[1], -d[2]];   // keep walking the same way
        const s = len / steps, nx = [cur[0] + d[0] * s - hc[0], cur[1] + d[1] * s - hc[1], cur[2] + d[2] * s - hc[2]], l = Math.hypot(...nx) || 1;
        cur = [hc[0] + nx[0] / l * r0, hc[1] + nx[1] / l * r0, hc[2] + nx[2] / l * r0]; prev = d; pts.push(cur);
      }
      return pts;
    };
    // one brain fibre at q: a gyrus line on the cortex; cerebellum and stem keep their own short leaf lines
    const brainStrand = (q, c, a, deep) => {
      if (q[1] < -.22 * BS) return { pts: growStrand(q, () => nrm3([1, gauss() * .15, gauss() * .6]), .2 + rnd() * .25, 3), c, a, path: -2 };   // cerebellum folia: short, horizontal
      if (q.deep) return { pts: growStrand(q, () => nrm3([gauss() * .25, gauss() * .15, 1]), .25 + rnd() * .3, 3), c, a: a * .8, path: -2 };   // deep structures: short commissural lines
      return { pts: gyrusStrand(q, deep ? .45 + rnd() * .4 : .7 + rnd() * .7, deep ? 6 : 12), c, a: deep ? a * .6 : a, path: -2 };
    };
    const k = small ? .5 : 1, dust = S.palette.dust.map(col), veil = S.palette.veil.map(col);
    const termClusters = S.clusters.filter((c) => c.spread > 0);
    const cw = termClusters.map((c) => nodes.filter((n) => n.cluster === c.id).reduce((t, n) => t + n.est, 0));
    const totalW = cw.reduce((a, b) => a + b, 0) || 1;
    const regionOf = (q) => { const l = lobeOf(q); return termClusters.find((c) => c.lobe === l) || termClusters[0]; };
    const REGION_COLOR={base:'#14b8a6',anabolic:'#3b82f6',estrogen:'#ec4899',blood:'#ef4444',peptide:'#f59e0b',goals:'#a78bfa'};
    function trackRegion(mesh) {
      const pos=mesh.geometry.attributes.position, ids=new Uint8Array(pos.count);
      for(let i=0;i<ids.length;i++) ids[i]=termClusters.indexOf(regionOf([pos.array[i*3],pos.array[i*3+1],pos.array[i*3+2]]));
      mesh.userData.regionIds=ids;mesh.userData.regionBase=mesh.geometry.attributes.aColor.array.slice();mesh.userData.regionAlpha=mesh.geometry.attributes.aAlpha.array.slice();
      mesh.geometry.setAttribute('aRegion',new THREE.BufferAttribute(new Float32Array(ids),1));
      mesh.userData.regionOn={value:0};mesh.userData.regionMix={value:0};
      mesh.material.vertexShader='attribute float aRegion; uniform vec3 uRegionColors[6]; varying vec3 vRegion; '+pointVS.replace('void main() {','void main() { vRegion=uRegionColors[0]; for(int r=0;r<6;r++){ if(abs(aRegion-float(r))<.5) vRegion=uRegionColors[r]; }');
      mesh.material.fragmentShader='uniform float uRegionOn; uniform float uRegionMix; varying vec3 vRegion; '+pointFS.replace('vec4(sat(vColor, uSat), a * uBright)','vec4(mix(sat(vColor, uSat), vRegion, uRegionOn*uRegionMix), a * uBright)');
      mesh.material.needsUpdate=true;
      mesh.userData.regionPal={value:0};
      mesh.material.uniforms={...U,uPalOn:mesh.userData.regionPal,uRegionOn:mesh.userData.regionOn,uRegionMix:mesh.userData.regionMix,uRegionColors:{value:termClusters.map(c=>col(REGION_COLOR[c.id] || c.color))}};regionMeshes.push(mesh);
    }
    function applyRegions() {
      const chosen=settingsReady && SET.group==='cluster'?SET.only:'';
      const visible=termClusters.map(c=>!settingsReady || termsOnly.some(n=>n.cluster===c.id && visibleTopic(n)));
      const anatomical=!settingsReady || arrNext==='Anatomy';
      const key=[VIEW.regions,VIEW.regionStrength,chosen,visible.join(''),U.uPalOn.value,VIEW.theme,anatomical].join(':');
      const th=themeOf(VIEW.theme)[1], palette=termClusters.map((c,i)=>th?palAt(th,.3+.55*i/Math.max(1,termClusters.length-1)):col(REGION_COLOR[c.id] || c.color)), strength=VIEW.regionStrength/100;   // a brain colour recolours the regions too: six shades of its gradient
      for(const mesh of regionMeshes) {
        const enabled=VIEW.regions && (!mesh.userData.regionPosts || anatomical);
        mesh.userData.regionPal.value=U.uPalOn.value;mesh.material.uniforms.uRegionColors.value=palette;mesh.userData.regionOn.value=enabled?1:0;mesh.userData.regionMix.value=strength;
        if(mesh.userData.regionKey===key) continue;
        mesh.userData.regionKey=key;
        const a=mesh.geometry.attributes.aColor, alpha=mesh.geometry.attributes.aAlpha, base=mesh.userData.regionBase, ids=mesh.userData.regionIds;
        alpha.array.set(mesh.userData.regionAlpha);
        if(!enabled) a.array.set(base);
        else for(let i=0;i<ids.length;i++) {
          const r=ids[i],c=palette[r],dim=visible[r] && (!chosen || termClusters[r].id===chosen)?1:.24;
          alpha.array[i]*=(1+.8*strength)*dim;
          a.array[i*3]=(base[i*3]*(1-strength)+c.r*strength)*dim;
          a.array[i*3+1]=(base[i*3+1]*(1-strength)+c.g*strength)*dim;
          a.array[i*3+2]=(base[i*3+2]*(1-strength)+c.b*strength)*dim;
        }
        a.needsUpdate=true;alpha.needsUpdate=true;
      }
      $('clGl').dataset.brainRegions=String(termClusters.length);$('clGl').dataset.regionMode=String(VIEW.regions);
    }
    // cortex, cerebellum, brainstem: soft ivory/grey like tissue, a light tint of the topic region
    const tissue = ['#dfe7ea', '#c3ccd1', '#a9b4bc', '#ece6da'].map(col);
    // (mindcorpus look: the brain is made of the data itself, coloured by topic, matte, no glass glow)
    // brain tissue as dots laid along the gyri: the contour lines of the fold field are sampled as dots, so the cortex shows
    // its convolutions (ridges and grooves) without any lines; a share of dots fills the volume underneath
    const gyriDots = [];
    for (let s = 0; s < Math.round(7000 * k); s++) {
      const q = brainPt(false), tint = rnd() < .7 ? col(regionOf(q).color) : pick(tissue);
      const st = brainStrand(inVol(q, rnd() < .45 ? .8 + .17 * rnd() : .97 + .03 * rnd()), tint, 1, false);
      st.pts.forEach((p, i) => { if (i % 2 === 0 || rnd() < .3) gyriDots.push([p, tint]); });
    }
    let gi = 0;
    const cortexMesh=layer(gyriDots.length, () => { const [p, c] = gyriDots[gi++]; return { p: [p[0] + gauss() * .012, p[1] + gauss() * .012, p[2] + gauss() * .012], c, s: .011 + Math.pow(rnd(), 4) * .016, a: .14 + Math.pow(rnd(), 2) * .26, path: -2 }; });
    trackRegion(cortexMesh);
    // live dots: every note stored while the page is open adds a dot at its topic right away (no reload)
    const LIVE_MAX = 20000, lvPos = new Float32Array(LIVE_MAX * 3), lvCol = new Float32Array(LIVE_MAX * 3), lvSize = new Float32Array(LIVE_MAX), lvAlpha = new Float32Array(LIVE_MAX), lvPhase = new Float32Array(LIVE_MAX), lvPath = new Float32Array(LIVE_MAX).fill(-2);
    const lvg = new THREE.BufferGeometry();
    [['position', lvPos, 3], ['aColor', lvCol, 3], ['aSize', lvSize, 1], ['aAlpha', lvAlpha, 1], ['aPhase', lvPhase, 1], ['aPath', lvPath, 1]].forEach(([n, a, s]) => lvg.setAttribute(n, new THREE.BufferAttribute(a, s)));
    lvg.setDrawRange(0, 0);
    { const m = new THREE.Points(lvg, new THREE.ShaderMaterial({ uniforms: U, vertexShader: pointVS, fragmentShader: pointFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.frustumCulled = false; world.add(m); }
    let lvN = 0;
    function addLiveDot(termId) {
      const n = byId[termId], c = n ? col(n.color) : pick(tissue);
      const q = n ? near(n.surf || [n.pos.x, n.pos.y, n.pos.z], .9, clusters[n.cluster] && clusters[n.cluster].lobe) : brainPt(true), p = inVol(q, .78 + .22 * rnd()), i = lvN % LIVE_MAX;
      lvPos.set(p, i * 3); lvCol.set([c.r, c.g, c.b], i * 3); lvSize[i] = .028 + rnd() * .012; lvAlpha[i] = .95; lvPhase[i] = rnd();
      lvN++; lvg.setDrawRange(0, Math.min(lvN, LIVE_MAX));
      ['position', 'aColor', 'aSize', 'aAlpha', 'aPhase'].forEach((a) => { lvg.attributes[a].needsUpdate = true; });
    }
    const volumeMesh=layer(Math.round(5000 * k), () => {   // a little volume underneath the folded surface
      const q = brainPt(false), tint = rnd() < .7 ? col(regionOf(q).color) : pick(tissue);
      return { p: inVol(q, .1 + .8 * Math.pow(rnd(), .7)), c: tint, s: .01 + Math.pow(rnd(), 4) * .014, a: .06 + rnd() * .12, path: -2 };
    });
    trackRegion(volumeMesh);
    // white matter as tractography: fibres coloured by direction (left-right pink, front-back mint, up-down sky)
    const BC = [0, .35, 0]; let fibreMat = null;
    const cub = (a, b, c, d, t) => [0, 1, 2].map((j) => { const u = 1 - t; return u * u * u * a[j] + 3 * u * u * t * b[j] + 3 * u * t * t * c[j] + t * t * t * d[j]; });
    const U2W = (v) => [v[0] * BS, v[1] * BS, v[2] * BS], tractList = [];
    const LR = col('#f5b8c4'), AP = col('#5eead4'), SI = col('#7dd3fc');
    for (let i = 0; i < Math.round(150 * k + 40); i++) {   // corticospinal / corona radiata: fan from the cortex down through the internal capsule into the brainstem
      const side = rnd() < .5 ? -1 : 1, x = -.5 + rnd() * 1.05, top = [x, .3 + rnd() * .3 - Math.abs(x) * .12, side * (.12 + rnd() * .5)];
      tractList.push({ pts: [top, [top[0] * .6, top[1] * .5, side * (.26 + rnd() * .14)], [-.02 + rnd() * .14, -.04 - rnd() * .16, side * (.14 + rnd() * .14)], [-.28 + gauss() * .03, -.5 - rnd() * .2, side * (.02 + rnd() * .05)]], c: SI });
    }
    for (let i = 0; i < Math.round(240 * k + 50); i++) {   // corpus callosum: arch over the midline from hemisphere to hemisphere
      const x = -.55 + rnd() * 1.1, h = .18 + rnd() * .3, w = .28 + rnd() * .44, arch = .34 + (1 - Math.abs(x) / .6) * .08;
      tractList.push({ pts: [[x, h, -w], [x * .9, arch + .06, -.14], [x * .9, arch + .06, .14], [x, h + gauss() * .03, w]], c: LR });
    }
    for (let i = 0; i < Math.round(200 * k + 40); i++) {   // long association fibres: front to back inside each hemisphere
      const side = rnd() < .5 ? -1 : 1, y0 = .0 + rnd() * .32, z0 = side * (.3 + rnd() * .28);
      tractList.push({ pts: [[.62 + rnd() * .22, y0, z0 * .8], [.25, y0 + .12 + rnd() * .08, z0 * 1.12], [-.3, y0 + .1 + rnd() * .08, z0 * 1.1], [-.7 - rnd() * .15, y0 - .05, z0 * .75]], c: AP });
    }
    {   // more named tracts (arcuate around the lateral fissure, cingulum above the callosum, uncinate hook into the temporal pole); own seed so later geometry stays the same
      const seed0 = seed;
      for (let i = 0; i < Math.round(70 * k + 16); i++) { const s = rnd() < .5 ? -1 : 1, j = () => gauss() * .03;
        tractList.push({ pts: [[.45 + j(), .1 + j(), s * (.5 + j())], [-.22 + j(), .4 + j(), s * (.6 + j())], [-.45 + j(), -.14 + j(), s * (.6 + j())], [.02 + j(), -.26 + j(), s * (.58 + j())]], c: AP, x: 1 }); }
      for (let i = 0; i < Math.round(60 * k + 14); i++) { const s = rnd() < .5 ? -1 : 1, z = s * (.09 + rnd() * .05), j = () => gauss() * .025;
        tractList.push({ pts: [[.5 + j(), .14 + j(), z], [.35 + j(), .55 + j(), z], [-.45 + j(), .5 + j(), z], [-.32 + j(), -.1 + j(), z * 2.2]], c: AP, x: 1 }); }
      for (let i = 0; i < Math.round(40 * k + 10); i++) { const s = rnd() < .5 ? -1 : 1, j = () => gauss() * .025;
        tractList.push({ pts: [[.5 + j(), -.04 + j(), s * (.26 + j())], [.14 + j(), -.04 + j(), s * (.36 + j())], [.1 + j(), -.26 + j(), s * (.46 + j())], [.36 + j(), -.28 + j(), s * (.52 + j())]], c: AP, x: 1 }); }
      seed = seed0;
    }
    const SEG = 22, fp2 = [], fc2 = [], fa2 = [];
    tractList.forEach((tr, i) => {
      tr.w = tr.pts.map(U2W); let prev = cub(...tr.w, 0);
      const al = tr.x ? .005 + (i * .618 % 1) * .009 : .005 + rnd() * .009;   // extra tracts take no rnd(): later geometry stays put   // white matter only a faint hint inside, the dots carry the shape
      for (let j = 1; j <= SEG; j++) { const cur = cub(...tr.w, j / SEG); fp2.push(...prev, ...cur); fc2.push(tr.c.r, tr.c.g, tr.c.b, tr.c.r, tr.c.g, tr.c.b); fa2.push(al, al); prev = cur; }
    });
    layer(Math.round(9000 * k), () => {   // dots strung along the white-matter tracts: the inside of the brain shows its fibre bundles
      const tr = pick(tractList), p = cub(...tr.w, rnd()), c = rnd() < .55 ? tr.c : pick(tissue);
      return { p: [p[0] + gauss() * .035, p[1] + gauss() * .035, p[2] + gauss() * .035], c, s: .009 + Math.pow(rnd(), 3) * .012, a: .1 + rnd() * .2, path: -2 };
    });
    {
      const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(fp2), 3)); hg.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(fc2), 3)); hg.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(fa2), 1));
      fibreMat = new THREE.ShaderMaterial({ vertexShader: 'attribute vec3 aColor; attribute float aAlpha; uniform float uFib; uniform vec3 uPal[5]; uniform float uPalOn; varying vec3 vC; varying float vA; vec3 pal(float t) { t = clamp(t, 0.0, 1.0) * 4.0; float f = fract(t); if (t < 1.0) return mix(uPal[0], uPal[1], f); if (t < 2.0) return mix(uPal[1], uPal[2], f); if (t < 3.0) return mix(uPal[2], uPal[3], f); return mix(uPal[3], uPal[4], t >= 4.0 ? 1.0 : f); } void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vC = mix(aColor, pal(dot(aColor, vec3(0.3, 0.59, 0.11)) * 1.15), uPalOn); vA = aAlpha * uFib * smoothstep(48.0, 4.0, -mv.z); gl_Position = projectionMatrix * mv; }',
        uniforms: { uSat: U.uSat, uFib: U.uFib, uPal: U.uPal, uPalOn: U.uPalOn }, fragmentShader: 'uniform float uSat; vec3 sat(vec3 c, float k) { return mix(vec3(dot(c, vec3(0.3, 0.59, 0.11))), c, k); } varying vec3 vC; varying float vA; void main(){ gl_FragColor = vec4(sat(vC, uSat), vA); }', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const wm = new THREE.LineSegments(hg, fibreMat); wm.frustumCulled = false; world.add(wm);
    }
    // a thread's place: p on the cortex, end just under it, ctrl bends the fibre that leads there from the topic inside
    const thrA = new Map(), quad = (a, c, b, t) => { const u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1], u * u * a[2] + 2 * u * t * c[2] + t * t * b[2]]; };
    nodes.forEach((n) => { n.home0 = [n.pos.x, n.pos.y, n.pos.z]; });
    function mkAnchor(n, p) {
      const end = inVol(p, .86 + .1 * rnd()), a = n ? n.home0 : end, hc = hemi(p), mid = [(a[0] + end[0]) / 2, (a[1] + end[1]) / 2, (a[2] + end[2]) / 2];
      return { n, p, end, c: 0, ctrl: [mid[0] + (hc[0] - mid[0]) * .22 + gauss() * .16, mid[1] + (hc[1] - mid[1]) * .22 + gauss() * .16, mid[2] + (hc[2] - mid[2]) * .22 + gauss() * .16] };
    }
    // every stored post is one strand, always visible: it leaves its topic and runs along the cortex to the spot
    // of its thread, so the posts of one thread form a bundle (cloud.py -> D.posts.items = [topic, thread, words])
    {
      const PI = (D.posts && D.posts.items) || [], pool = Array.from({ length: Math.round(7000 * k) + 1500 }, () => brainPt(false));
      const candOf = new Map(), anchorOf = new Map(), PSEG = 5, postDots = [];
      const cand = (n) => { if (!candOf.has(n)) { const o = n && (n.surf || [n.pos.x, n.pos.y, n.pos.z]), lobe = n && clusters[n.cluster] && clusters[n.cluster].lobe, c = n ? pool.filter((q) => Math.hypot(q[0] - o[0], q[1] - o[1], q[2] - o[2]) < 1.9 && (!lobe || lobeOf(q) === lobe)) : pool; candOf.set(n, c.length ? c : pool); } return candOf.get(n); };   // a thread's posts stay in its topic's lobe
      const sp = new Float32Array(PI.length * PSEG * 6), sc = new Float32Array(PI.length * PSEG * 6), sa = new Float32Array(PI.length * PSEG * 2);
      let o = 0;
      PI.forEach(([ti, th, words]) => {
        const n = ti >= 0 ? byId[D.posts.terms[ti]] : null, cs = cand(n);
        const key = (n ? n.id : '-') + ':' + th;
        if (!anchorOf.has(key)) { const rec = mkAnchor(n, cs[Math.floor(rnd() * cs.length)]); anchorOf.set(key, rec); if (n) { if (!thrA.has(n)) thrA.set(n, []); thrA.get(n).push(rec); } }
        const rec = anchorOf.get(key), an = rec.p; rec.c++;
        const start = n ? [n.pos.x, n.pos.y, n.pos.z] : pick(pool);
        const end = [an[0] + gauss() * .08, an[1] + gauss() * .08, an[2] + gauss() * .08];
        const mid = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2], ml = Math.hypot(mid[0] - BC[0] * BS, mid[1] - BC[1] * BS, mid[2]) || 1;
        const lift = .12 + rnd() * .22, ctrl = [mid[0] + (mid[0] - BC[0] * BS) / ml * lift, mid[1] + (mid[1] - BC[1] * BS) / ml * lift, mid[2] + mid[2] / ml * lift];   // bowed outward: strands hug the surface
        const c = n ? col(n.color) : pick(tissue), al = .008 + Math.min(1, words / 300) * .018;
        postDots.push([end, c, words, n ? n.id : '', rec]);
        let prev = start;
        for (let j = 1; j <= PSEG; j++) {
          const t = j / PSEG, u = 1 - t, cur = [u * u * start[0] + 2 * u * t * ctrl[0] + t * t * end[0], u * u * start[1] + 2 * u * t * ctrl[1] + t * t * end[1], u * u * start[2] + 2 * u * t * ctrl[2] + t * t * end[2]];
          sp.set([...prev, ...cur], o * 6); sc.set([c.r, c.g, c.b, c.r, c.g, c.b], o * 6); sa[o * 2] = al * (1 - (j - 1) / PSEG * .6); sa[o * 2 + 1] = al * (1 - j / PSEG * .6); o++; prev = cur;
        }
      });
      if (o) {
        const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.BufferAttribute(sp, 3)); g2.setAttribute('aColor', new THREE.BufferAttribute(sc, 3)); g2.setAttribute('aAlpha', new THREE.BufferAttribute(sa, 1));
        const strands = new THREE.LineSegments(g2, fibreMat); strands.frustumCulled = false; strands.visible = false; world.add(strands);   // (reference look: no starbursts at the topics; the posts show as dots)
      }
      // every post is one fibre of the brain, near its topic, sunk into the volume
      // every post is a dot on a gyrus near its topic (a few steps along the fold from its anchor)
      let pi = 0;
      if (postDots.length) dataDots = layer(postDots.length, () => {
        const [e, c, words, id, rec] = postDots[pi++], r = rnd();
        let p;
        if (rec.n && r < .3) { const q = quad(rec.n.home0, rec.ctrl, rec.end, .12 + .88 * rnd()); p = [q[0] + gauss() * .05, q[1] + gauss() * .05, q[2] + gauss() * .05]; }   // along the thread's fibre
        else p = inVol(e, rec.n ? .76 + .24 * rnd() : r < .35 ? .3 + .45 * rnd() : .78 + .22 * rnd());   // the column of cortex where the thread ends
        return { p, c, s: .015 + Math.min(1, words / 400) * .018, a: .38 + rnd() * .4, path: -2 };
      });
      if (dataDots) {   // these dots can leave the brain for another arrangement (aPos2 is filled when one is chosen)
        dataDots.geometry.setAttribute('aPos2', new THREE.BufferAttribute(new Float32Array(postDots.length * 3), 3));
        dataDots.geometry.setAttribute('aMorphOn', new THREE.BufferAttribute(new Float32Array(postDots.length).fill(1), 1));
        postIds = postDots.map((x) => x[3]);
        trackRegion(dataDots);dataDots.userData.regionPosts=true;
        postIds.forEach((id,i)=>{const n=byId[id],index=n?termClusters.findIndex(c=>c.id===n.cluster):-1;if(index>=0) dataDots.userData.regionIds[i]=index;});
        dataDots.geometry.attributes.aRegion.array.set(dataDots.userData.regionIds);dataDots.geometry.attributes.aRegion.needsUpdate=true;
      }
    }
    {   // outlines: lobe borders and hemisphere rim on the cortex, cerebellum with folia, brainstem segments, corpus callosum, thalami
      const seed0 = seed, ol = [], ink = col('#ece6da'), W = (q) => [q[0] * BS, q[1] * BS, q[2] * BS];
      // shortcut: repeats the deterministic part of cortexRaw (no fold bumps); keep both in step if the cortex shape changes
      const surfRaw = (q) => { const side = q[2] < 0 ? -1 : 1; let x = q[0], y = q[1] * .66 + .08, z = side * (.045 + Math.abs(q[2]) * .74);
        if (x > .55) { const n = (x - .55) / .45; z *= 1 - .28 * n; y -= .1 * n * n; }
        if (x < -.6) { const n = (-.6 - x) / .4; z *= 1 - .32 * n; y -= .04 * n; }
        if (y < -.2) y = -.2 + (y + .2) * .4;
        if (x > -.38 && x < .5 && Math.abs(z) > .36 && y < .06) { const b = Math.sin((x + .38) / .88 * Math.PI); y -= .22 * b * Math.min(1, (Math.abs(z) - .36) / .38); }
        return [x * 1.012, y * 1.012, z * 1.012]; };
      const NU = 150, NT = 300, dir = (i, j) => { const u = -1 + 2 * i / NU, t = (j + .5) / NT * Math.PI * 2, r = Math.sqrt(Math.max(0, 1 - u * u)); return [r * Math.cos(t), u, r * Math.sin(t)]; };
      // borders as smooth level lines (marching squares over the sphere grid): field f changes sign on the border, mask limits it to the right lobes
      const G = []; for (let i = 0; i <= NU; i++) { G.push([]); for (let j = 0; j <= NT; j++) { const q = surfRaw(dir(i, j)); G[i].push({ q, l: lobeRaw(q[0], q[1], q[2]), az: Math.abs(q[2]) }); } }
      const has = (set) => (c) => set.includes(c.l);
      const borders = [
        [(c) => c.q[0] - CEN(c.q[1]), has(['fr', 'par'])],   // central sulcus
        [(c) => c.q[0] - POC(c.q[1]), has(['par', 'occ'])],   // parieto-occipital sulcus
        [(c) => c.q[1] - SYL(c.q[0]), (c) => c.az > .3 && c.q[0] > -.7],   // lateral fissure: temporal lobe below
        [(c) => c.q[0] + .7, (c) => c.az > .3 && c.q[1] < SYL(c.q[0])],   // temporal / occipital
        [(c) => c.q[2], () => true]];   // midline: the two hemispheres
      for (const [f, ok] of borders) for (let i = 0; i < NU; i++) for (let j = 0; j < NT; j++) {
        const cs = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], hit = [];
        for (let e = 0; e < 4; e++) { const [a1, b1] = cs[e], [a2, b2] = cs[(e + 1) % 4], A = G[a1][b1], B = G[a2][b2]; if (!ok(A) || !ok(B)) continue;
          const fa = f(A), fb = f(B); if ((fa < 0) === (fb < 0)) continue; const t = fa / (fa - fb); hit.push(W(surfRaw(dir(a1 + (a2 - a1) * t, b1 + (b2 - b1) * t)))); }
        const seg = (a, b) => { if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < .4) ol.push({ pts: [a, b], c: ink, a: .5, path: -1 }); };   // drop jumps across folds of the mapping
        if (hit.length === 2) seg(hit[0], hit[1]);
        if (hit.length === 4) { seg(hit[0], hit[1]); seg(hit[2], hit[3]); }
      }
      const loop = (f, n = 48, a = .45) => ol.push({ pts: Array.from({ length: n + 1 }, (_, k) => W(f(k / n * Math.PI * 2))), c: ink, a, path: -1 });
      loop((t) => [-.6 + .27 * Math.cos(t), -.36, .5 * Math.sin(t)]);   // cerebellum: horizontal outline
      for (const z of [-.25, .25]) loop((t) => [-.6 + .27 * .87 * Math.cos(t), -.36 + .17 * .87 * Math.sin(t), z]);   // both hemispheres from the side
      loop((t) => [-.55 + .27 * Math.cos(t), -.36 + .17 * .75 * Math.sin(t), 0], 48, .35);   // vermis
      for (const k of [-.55, -.25, .25, .55]) { const r = Math.sqrt(1 - k * k); ol.push({ pts: Array.from({ length: 25 }, (_, m) => { const t = Math.PI * (.5 + m / 24); return W([-.6 + .27 * r * Math.cos(t), -.36 + .17 * k, .5 * r * Math.sin(t)]); }), c: ink, a: .3, path: -1 }); }   // folia on the back
      const stemR = (y) => y > -.36 ? .075 : y > -.56 ? .1 : .07 + (y + .56) * .15, stemX = (y) => -.22 + (y + .27) * .3 + (y < -.36 && y > -.56 ? .04 : 0);
      for (const t of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) ol.push({ pts: Array.from({ length: 31 }, (_, m) => { const y = -.27 - .44 * m / 30; return W([stemX(y) + Math.cos(t) * stemR(y) * .8, y, Math.sin(t) * stemR(y)]); }), c: ink, a: .45, path: -1 });   // brainstem profile
      for (const y of [-.36, -.56]) loop((t) => [stemX(y) + Math.cos(t) * stemR(y) * .8, y, Math.sin(t) * stemR(y)], 32, .4);   // midbrain / pons / medulla borders
      for (const e of [-.045, .045]) ol.push({ pts: Array.from({ length: 31 }, (_, m) => { const t = m / 30; return W([.4 - .85 * t, .2 + e + .13 * Math.sin(Math.PI * t), 0]); }), c: ink, a: .4, path: -1 });   // corpus callosum
      for (const side of [-1, 1]) { loop((t) => [-.12 + .13 * Math.cos(t), .02 + .07 * Math.sin(t), side * .17], 32, .35); loop((t) => [-.12 + .13 * Math.cos(t), .02, side * (.17 + .07 * Math.sin(t))], 32, .35); }   // thalami
      // containment: every brain dot, thread line and fibre built so far is pulled back inside the outline (cortex envelope, cerebellum, brainstem)
      const Cc = [-.05 * BS, .1 * BS, 0], NB = 48, NP = 96, env = new Float32Array(NB * NP);
      const bin = (x, y, z) => Math.min(NB - 1, Math.floor(Math.acos(Math.max(-1, Math.min(1, y))) / Math.PI * NB)) * NP + Math.min(NP - 1, Math.floor((Math.atan2(z, x) + Math.PI) / (2 * Math.PI) * NP));
      for (let i = 0; i <= 240; i++) for (let j = 0; j < 480; j++) {
        const u = -1 + 2 * i / 240, t = (j + .5) / 480 * Math.PI * 2, rr = Math.sqrt(Math.max(0, 1 - u * u)), w = W(surfRaw([rr * Math.cos(t), u, rr * Math.sin(t)]));
        const vx = w[0] - Cc[0], vy = w[1] - Cc[1], vz = w[2] - Cc[2], r = Math.hypot(vx, vy, vz), b = bin(vx / r, vy / r, vz / r); env[b] = Math.max(env[b], r * 1.03);   // 1.03: room for the fold bumps
      }
      for (let pass = 0; pass < 4; pass++) for (let b = 0; b < env.length; b++) if (!env[b]) env[b] = Math.max(env[(b + 1) % env.length], env[(b + env.length - 1) % env.length], env[(b + NP) % env.length]);
      const extra = (x, y, z) => { x /= BS; y /= BS; z /= BS;
        if (((x + .6) / .3) ** 2 + ((y + .36) / .2) ** 2 + (z / .53) ** 2 < 1) return true;   // cerebellum
        return y < -.25 && y > -.75 && Math.hypot((x + .22 - (y + .27) * .3) / .13, z / .14) < 1; };   // brainstem
      var containMesh = (m, skip) => {
        const pa = m.geometry && m.geometry.attributes && m.geometry.attributes.position; if (!pa || !pa.count) return;
        const A = pa.array; let moved = false;
        for (let i = 0; i < A.length; i += 3) {
          if (skip && skip(i / 3)) continue; const vx = A[i] - Cc[0], vy = A[i + 1] - Cc[1], vz = A[i + 2] - Cc[2], r = Math.hypot(vx, vy, vz); if (!r || extra(A[i], A[i + 1], A[i + 2])) continue;
          const e = env[bin(vx / r, vy / r, vz / r)]; if (r <= e) continue;
          const f = e / r * .985; A[i] = Cc[0] + vx * f; A[i + 1] = Cc[1] + vy * f; A[i + 2] = Cc[2] + vz * f; moved = true;
        }
        if (moved) { pa.needsUpdate = true; m.geometry.computeBoundingSphere(); }
      };
      world.children.forEach((m) => containMesh(m));
      ol.forEach((st) => { st.a *= .35; });   // barely visible: the outline only frames the brain
      addFibres(ol);
      seed = seed0;
    }
    bodyCapture = [];
    // spinal cord from the brainstem down, with vertebrae: long parallel fibres from the stem to the tail
    const CORD0 = -2.4, CORD1 = -17.5, cordAt = (y) => { const t = (CORD0 - y) / (CORD0 - CORD1); return [-1.5 - .35 * Math.sin(t * Math.PI * 1.6) - .25 * t, y, 0]; };
    const spineAt = (y) => (y > CORD0 ? [(-.22 + (y / BS + .27) * .3) * BS, y, 0] : cordAt(y));   // brainstem above, cord below
    const spinePath = (y) => (y > CORD0 ? -.8 - y : 2.45 + CORD0 - y);
    // Anatomical spine (adult, cm; regions C 12.5 · T 28 · L 18 · sacrum + coccyx 12.5 = 71), scaled to the cord length.
    // Row: name, body height, disc below, body width, body depth, canal radius, transverse half span, spinous length, spinous slope
    const VERT = [['C1',1,.3,0,1,1,3.8,.5,.1],['C2',1.6,.5,1.8,1.5,.8,2.7,1.6,.35]];
    for (let i=3;i<=7;i++) VERT.push(['C'+i,1.35,.5,1.9+(i-3)*.12,1.5,.75,2.6+(i-3)*.12,i===7?3:1.4+(i-3)*.12,i===7?.45:.35]);
    for (let i=1;i<=12;i++) { const f=(i-1)/11; VERT.push(['T'+i,1.5+f*.7,.4+f*.2,2.6+f*1.6,1.7+f*1.3,.6,3.1-f*.8,3+Math.sin(f*Math.PI)*.9,i<11?1.1:.55]); }
    for (let i=1;i<=5;i++) { const f=(i-1)/4; VERT.push(['L'+i,2.5+f*.2,.9+f*.2,4.4+f*.8,3.1+f*.4,.75,3.2+Math.sin(f*Math.PI*.7)*1.2,2.8-f*.5,.12]); }
    const SACRUM = 10.5, COCCYX = [.7,.6,.5,.4], SPINE_CM = VERT.reduce((t,v)=>t+v[1]+v[2],0)+SACRUM+COCCYX.reduce((t,h)=>t+h+.1,0), SK = (CORD0-CORD1-.05)/SPINE_CM;
    { let y = CORD0; for (const v of VERT) { v.top = y; v.y = y - v[1]*SK/2; y -= (v[1]+v[2])*SK; } VERT.sacTop = y; }
    const CONUS = VERT.find(v=>v[0]==='L1').y - VERT.find(v=>v[0]==='L1')[1]*SK/2;   // the cord ends at L1/L2, below only the thin cauda
    // S-curve (side view, +x = front): cervical lordosis, thoracic kyphosis, lumbar lordosis, sacral kyphosis, coccyx curling forward
    const CURVE = [[0,0],[.09,.3],[.176,.05],[.39,-.55],[.57,-.05],[.70,.42],[.824,.15],[.9,-.42],[.965,-.42],[1,-.2]];
    const curveX = (s) => { s=Math.max(0,Math.min(1,s)); let i=1; while (i<CURVE.length-1 && s>CURVE[i][0]) i++;
      const a=CURVE[Math.max(0,i-2)][1], b=CURVE[i-1][1], c=CURVE[i][1], d=CURVE[Math.min(CURVE.length-1,i+1)][1], t=(s-CURVE[i-1][0])/(CURVE[i][0]-CURVE[i-1][0]);
      return .5*(2*b+(c-a)*t+(2*a-5*b+4*c-d)*t*t+(3*b-a-3*c+d)*t*t*t); };
    const canalAt = (y) => [(-.22 + (CORD0 / BS + .27) * .3) * BS + curveX((CORD0-y)/(CORD0-CORD1)), y, 0];
    layer(Math.round(12000 * k), () => {   // brainstem + spinal cord as dots
      const y = -.8 + (CORD1 + .8) * Math.pow(rnd(), .9), c = spineAt(y), u = y / BS, r = (y <= CORD0 ? (y > CONUS ? 1.5 : .7) : u > -.36 ? 2.2 : u > -.56 ? 3.4 : 3.4 - (u + .56) / (CORD0 / BS + .56) * 1.8) * (.05 + Math.abs(gauss()) * .045), t = rnd() * Math.PI * 2;   // brainstem profile above, cord inside the vertebral canal below
      return { p: [c[0] + Math.cos(t) * r + (u < -.36 && u > -.56 ? .14 : 0), y, c[2] + Math.sin(t) * r], c: rnd() < .45 ? col(S.palette.core) : pick(dust), s: .016 + rnd() * .026, a: (.35 + rnd() * .5) * (y > CORD0 ? 1 : 1.6), path: spinePath(y) };
    });
    const LEVELS = 32, levelY = (i) => CORD0 - .35 - i * (CORD0 - CORD1 - .6) / LEVELS;
    layer(Math.round(LEVELS * 70 * k), () => { const i = Math.floor(rnd() * LEVELS), y = levelY(i) + gauss() * .03, c = cordAt(y), t = rnd() * Math.PI * 2, r = .44 + gauss() * .03;
      return { p: [c[0] + Math.cos(t) * r * .8, y, c[2] + Math.sin(t) * r], c: pick(dust), s: .014 + rnd() * .02, a: (.25 + rnd() * .35) * 1.8, path: 2.45 + CORD0 - y }; });
    // short ribs left and right at every vertebra: the herringbone of the reference spine
    layer(Math.round(LEVELS * 2 * 70 * k), () => { const i = Math.floor(rnd() * LEVELS), side = rnd() < .5 ? -1 : 1, t = rnd(), y0 = levelY(i), c = cordAt(y0), len = .55 + .35 * Math.sin(Math.min(1, i / 6) * Math.PI / 2);
      return { p: [c[0] + gauss() * .02, y0 - t * t * .34 + gauss() * .015, side * (.45 + t * len * 1.3)], c: rnd() < .4 ? col(S.palette.core) : pick(dust), s: .012 + (1 - t) * .014, a: (.2 + rnd() * .3) * (1 - t * .6), path: 2.45 + CORD0 - y0 + t * len };
    });

    // torso: narrow neck, round shoulders, widest at the chest, then tapering to a point (leaf shape, like the reference)
    const TW = [[-3.9, .6], [-4.8, 2.4], [-6.0, 5.0], [-7.8, 6.2], [-10.2, 6.0], [-12.8, 4.7], [-15.4, 2.6], [-17.6, .35]];
    const widthAt = (y) => { if (y >= TW[0][0]) return TW[0][1]; for (let i = 1; i < TW.length; i++) if (y >= TW[i][0]) { const [y0, w0] = TW[i - 1], [y1, w1] = TW[i], t = (y - y0) / (y1 - y0), e = t * t * (3 - 2 * t); return w0 + (w1 - w0) * e; } return TW[TW.length - 1][1]; };
    const inBody = (q) => { const w = widthAt(q[1]), c = cordAt(Math.max(CORD1, Math.min(CORD0, q[1]))), d = w * .52; return [Math.max(c[0] - .25, Math.min(c[0] + d * 1.6, q[0])), q[1], Math.max(-w, Math.min(w, q[2]))]; };
    layer(Math.round(7000 * k), () => { const y = -4 - rnd() * 13.6, w = widthAt(y), d = w * .52, t = rnd() * Math.PI * 2, c = cordAt(Math.max(CORD1, y)), shell = .92 + rnd() * .1;
      return { p: [c[0] + d * .75 + Math.cos(t) * d * shell, y, Math.sin(t) * w * shell], c: pick(rnd() < .15 ? veil : dust), s: 0.018 + rnd() * .022, a: 0.26 + rnd() * 0.416 }; });   // the body's outline: light enough to read as a body, well below the brain

    // nerve tree: a root left and right at every vertebra, branching three times into the torso
    const nerveSegs = [], ncols = termClusters.map((c) => col(c.color));
    const branch = (p0, dir, len, depth, c, s0) => {   // s0: path length from the brain to p0 (for the impulses)
      const p1 = inBody([p0[0] + dir[0] * len, p0[1] + dir[1] * len, p0[2] + dir[2] * len]), L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
      nerveSegs.push({ a: p0, b: p1, w: 1 - depth * .19, c, s0, L });
      if (depth >= 4) return;
      for (let j = 0; j < 2; j++) {
        const sp = (j ? 1 : -1) * (.25 + rnd() * .6), nd = [dir[0] * .75 + gauss() * .4, dir[1] - .1 + sp * .5 + gauss() * .22, dir[2] * 1.05 + gauss() * .25];
        const l = Math.hypot(...nd); branch(p1, nd.map((v) => v / l), len * (.6 + rnd() * .2), depth + 1, c, s0 + L);
      }
    };
    for (let i = 0; i < LEVELS; i++) for (const side of [-1, 1]) {
      const y = levelY(i) + gauss() * .06, c0 = cordAt(y), w = widthAt(y), down = i < 3 ? .15 : -.28 - rnd() * .22;   // nerves leave the cord slanting down, like the real ones
      branch([c0[0], y, c0[2]], [(.12 + rnd() * .3), down, side], w * (.3 + rnd() * .14), 0, pick(ncols), 2.45 + CORD0 - y);
      if (i % 4 === 1) branch([c0[0], y, c0[2]], [(.3 + rnd() * .3), -.75, side * .55], w * .5, 1, pick(ncols), 2.45 + CORD0 - y);   // long plexus strands running down
    }
    const segLen = nerveSegs.map((g) => g.L * g.w), segTot = segLen.reduce((a, b) => a + b, 0);
    layer(Math.round(34000 * k), () => {   // nerves as dots along their branches
      let r = rnd() * segTot, i = 0; while (i < nerveSegs.length - 1 && (r -= segLen[i]) > 0) i++;
      const g = nerveSegs[i], t = rnd(), j = .02 + (1 - g.w) * .02;
      return { p: [g.a[0] + (g.b[0] - g.a[0]) * t + gauss() * j, g.a[1] + (g.b[1] - g.a[1]) * t + gauss() * j, g.a[2] + (g.b[2] - g.a[2]) * t + gauss() * j], c: rnd() < .6 ? g.c : pick(dust), s: .01 + g.w * .018, a: (0.36 + g.w * .38) * 2.0, path: g.s0 + g.L * t };
    });

    // Body atlas: remap the existing body buffers, preserving the complete RNG
    // history used by the brain. x = anterior, y = up, z = left/right.
    const atlasWidth = [[-3.9,.65],[-4.8,.9],[-5.7,4.4],[-7.8,4.5],[-10.5,3.4],[-12.8,2.8],[-15.4,3.6],[-17.6,2.65]];
    const bodyWidthAt = (y) => {
      if (y >= atlasWidth[0][0]) return atlasWidth[0][1];
      for (let i = 1; i < atlasWidth.length; i++) if (y >= atlasWidth[i][0]) {
        const [a,wa] = atlasWidth[i-1], [b,wb] = atlasWidth[i], t = (y-a)/(b-a);
        return wa + (wb-wa)*t*t*(3-2*t);
      }
      return atlasWidth[atlasWidth.length-1][1];
    };
    const bodyCordAt = (y) => (y > CORD0 ? spineAt(y) : canalAt(y));
    const bodyAxisAt = (y) => {
      if (y > CORD0) return spineAt(y);
      const t = Math.max(0, Math.min(1,(CORD0-y)/(CORD0-CORD1)));
      return [-1.5 + .16*Math.sin(t*Math.PI*2) + .08*t, y, 0];
    };
    bodyCapture[1].visible = bodyCapture[2].visible = false;   // old ring/herringbone vertebrae, replaced by the anatomical model (still generated: keeps the RNG)
    bodyLayers = { spine: [bodyCapture[0]], outline: [bodyCapture[3]], nerves: [bodyCapture[4]], regions: [] };
    bodyCapture.forEach((mesh, type) => {
      const a = mesh.geometry.attributes.position.array;
      for (let i=0; i<a.length; i+=3) {
        const x=a[i], y=a[i+1], z=a[i+2], old=spineAt(y), now=type < 3 ? bodyCordAt(y) : bodyAxisAt(y);
        if (type < 3) {
          a[i] = now[0] + (x-old[0])*(type===1 ? 1.35 : 1);
          a[i+2] = z*(type===1 ? 1.35 : 1);
        } else {
          const w=widthAt(y), nw=bodyWidthAt(y), ratio=nw/Math.max(.3,w);
          a[i] = now[0] + (x-old[0])*ratio*.86; a[i+2]=z*ratio;
          if (type===3 && (i/3)%5===0) {
            const t=Math.max(0,Math.min(1,(-4-y)/13.6)), yy=-5.8-t*10.2;
            const side=z<0 ? -1 : 1, elbow=Math.min(1,t*2), wrist=Math.max(0,t*2-1);
            const ang=Math.atan2(z/w,(x-old[0]-w*.39)/(w*.52));
            const radius=.58*(1-t)+.22, lateral=4.25+1.25*elbow-.3*wrist;
            a[i]=bodyAxisAt(yy)[0]+1.4-.45*t+Math.cos(ang)*radius;
            a[i+1]=yy; a[i+2]=side*lateral+Math.sin(ang)*radius;
          }
        }
      }
      mesh.geometry.attributes.position.needsUpdate=true; mesh.geometry.computeBoundingSphere();
    });
    bodyCapture = null;
    // A separate RNG scope for extra body strands; never change the brain seed.
    const brainSeedAfterBody = seed, spineStrands=[], vertStrands=[], regionStrands=[], contourStrands=[];
    {   // the vertebrae, drawn as outline fibres in a local frame that follows the curve: a = forward, u = up, w = sideways
      const frame = (y) => { const c=canalAt(y), d=canalAt(y-.05), dx=d[0]-c[0], dy=d[1]-c[1], l=Math.hypot(dx,dy); const T=[dx/l,dy/l]; return { c, N:[-T[1],T[0]], U:[-T[0],-T[1]] }; };
      const at = (F,a,u,w) => [F.c[0]+F.N[0]*a+F.U[0]*u, F.c[1]+F.N[1]*a+F.U[1]*u, w];
      const bone = col(S.palette.core), add = (F,pts,al=.55) => vertStrands.push({pts,c:bone,a:al*1.8,path:spinePath(F.c[1])});   // x1.8: bright against the default body dimming
      const ring = (F,a0,u,ra,rw,al,from=0,to=Math.PI*2,flat=.75,w0=0) => { const p=[]; for (let j=0;j<=24;j++) { const f=from+(to-from)*j/24, ca=Math.cos(f); p.push(at(F,a0+ca*ra*(ca<0?flat:1),u,w0+Math.sin(f)*rw)); } add(F,p,al); };
      const line = (F,pts,al) => add(F,pts.map(q=>at(F,q[0],q[1],q[2])),al);
      for (const v of VERT) {
        const F = frame(v.y), h=v[1]*SK, disc=v[2]*SK, bw=v[3]*SK, bd=v[4]*SK, cr=v[5]*SK, tp=v[6]*SK, sp=v[7]*SK, sl=v[8], th=.35*SK*(v[0][0]==='L'?1.4:1), arch=cr+th;
        const cerv = v[0][0]==='C', lumb = v[0][0]==='L';
        if (bw) {   // vertebral body: endplates, waist, side walls
          const a0=cr+bd/2;
          ring(F,a0,h/2,bd/2,bw/2,.6); ring(F,a0,-h/2,bd/2,bw/2,.6); ring(F,a0,0,bd/2*.9,bw/2*.9,.35);
          for (let j=0;j<8;j++) { const f=j/8*Math.PI*2, ca=Math.cos(f), r=ca<0?.75:1; line(F,[-1,0,1].map(k=>[a0+ca*bd/2*r*(k?1:.9),k*h/2,Math.sin(f)*bw/2*(k?1:.9)]),.4); }
          if (v[0]==='C2') { const dh=1.5*SK; for (const w of [-1,1]) line(F,[[a0-bd*.1,h/2,w*.3*SK],[a0-bd*.1,h/2+dh*.8,w*.28*SK],[a0-bd*.1,h/2+dh,0]],.55); }   // dens of the axis
          if (disc > .02) { ring(F,a0,-h/2-disc/2,bd/2*1.03,bw/2*1.03,.28); ring(F,a0,-h/2-disc/2,bd/4,bw/4,.2); }   // intervertebral disc with its nucleus
          for (const w of [-1,1]) line(F,[[cr,0,w*bw*.3],[arch*.3,0,w*arch*.95]],.5);   // pedicles
        } else {   // atlas: a ring with an anterior arch and big lateral masses
          ring(F,cr*.35,0,cr*1.45,cr*1.35,.6); ring(F,cr*.35,-h*.3,cr*1.4,cr*1.3,.35);
          for (const w of [-1,1]) ring(F,cr*.35,-h*.15,cr*.35,cr*.3,.45,0,Math.PI*2,1,w*cr*1.1), line(F,[[cr*.3,0,w*cr*1.2],[cr*.3,h*.4,w*cr*1.25],[cr*.3,-h*.5,w*cr*1.25]],.45);
        }
        ring(F,0,0,arch,arch*1.1,.55,Math.PI*.4,Math.PI*1.6,1); ring(F,0,-h*.35,arch,arch*1.1,.35,Math.PI*.45,Math.PI*1.55,1);   // vertebral arch around the canal
        for (const w of [-1,1]) {
          line(F,[[-arch*.25,h*.75,w*arch*1.05],[-arch*.25,-h*.75,w*arch*1.05]],.4);   // articular processes (facets)
          const ta = cerv ? cr*.3 : lumb ? -cr*.4 : -cr*1.3, tu = cerv ? 0 : lumb ? 0 : h*.15;   // transverse process
          line(F,[[-arch*.1,h*.15,w*arch],[ta,tu+h*.1,w*tp],[ta,tu-h*.12,w*tp],[-arch*.1,-h*.2,w*arch]],.5);
        }
        const r0=-arch, tipA=r0-sp*Math.cos(Math.atan(sl)), tipU=-sp*Math.sin(Math.atan(sl)), tall=lumb?h*.3:h*.08;   // spinous process (cervical tips bifid, lumbar hatchet)
        if (cerv && v[0]!=='C7' && v[0]!=='C1') for (const w of [-1,1]) line(F,[[r0,h*.2,0],[tipA,tipU+tall,w*.3*SK],[tipA,tipU-tall,w*.3*SK],[r0,-h*.3,0]],.5);
        else line(F,[[r0,h*.25,0],[tipA,tipU+tall,0],[tipA,tipU-tall,0],[r0,-h*.35,0]],.5);
      }
      // sacrum: five fused segments, wide alae at S1 tapering to the apex, transverse ridges, four pairs of foramina, median crest
      const sh=SACRUM*SK/5; let edge=[];
      for (let j=0;j<=5;j++) {
        const y=VERT.sacTop-j*sh, F=frame(y), f=j/5, half=(5.5-4.3*Math.pow(f,.8))*SK, bd=(3-1.9*f)*SK, cr=(.7-.4*f)*SK;
        ring(F,cr+bd/2,0,bd/2,(4.8-3*f)*SK/2,j?.35:.6);
        line(F,[[cr+bd*.5,0,-half],[cr+bd*.5,0,half]],j?.3:.5);
        ring(F,0,0,cr+.3*SK,(cr+.3*SK)*1.1,.3,Math.PI*.4,Math.PI*1.6,1);
        edge.push([F,half,cr+bd*.5]);
        if (j<5) { const Fm=frame(y-sh/2); for (const w of [-1,1]) ring(Fm,cr+bd*.95,0,.25*SK,.3*SK,.3,0,Math.PI*2,1,w*half*.45);
          line(Fm,[[-cr-.3*SK,sh*.3,0],[-cr-1.1*SK*(1-f),0,0],[-cr-.3*SK,-sh*.3,0]],.4); }   // foramina, crest
      }
      for (const w of [-1,1]) add(edge[0][0],edge.map(([F,half,a])=>at(F,a,0,w*half)),.55);   // lateral borders of the sacrum
      let yc = VERT.sacTop-SACRUM*SK;
      COCCYX.forEach((hh,j) => { const h=hh*SK, F=frame(yc-h/2), r=(1.2-j*.22)*SK; ring(F,r*.6,h/2,r*.6,r,.45); ring(F,r*.6,-h/2,r*.6,r,.45); line(F,[[r*.6+r*.6,h/2,0],[r*.6+r*.6,-h/2,0]],.35); yc -= (hh+.1)*SK; });
    }
    for (let side of [-1,1]) {
      const pts=[];
      for(let j=0;j<=40;j++) { const t=j/40,y=CORD0-.05-t*(CORD0-CORD1-.1),c=bodyCordAt(y);
        pts.push([c[0],y,side*(y>CONUS?.12:.06)]); }
      spineStrands.push({pts,c:col(S.palette.core),a:.28,path:(i,n)=>2.5+i/n*14.2});
    }
    const ORGAN_AT = {
      hormones: {p:[-.05,-4.65,0],r:[.27,.28,.5],c:'#f5b8c4'},
      heart: {p:[.45,-7.9,.9],r:[.55,.8,.6],c:'#f2727f'},
      liver: {p:[.4,-10.2,-1.25],r:[.5,.6,1.15],c:'#f5b84b'},
      kidney: {p:[-1.1,-11.5,-1.55],r:[.3,.6,.38],c:'#fdba74'},
      metabolism: {p:[.5,-12.8,0],r:[.55,.8,1.05],c:'#86efac'},
      sexual: {p:[.1,-15.4,0],r:[.4,.4,.6],c:'#f0abfc'}
    };
    for(const [id,o] of Object.entries(ORGAN_AT)) {
      const centers=id==='kidney' ? [o.p,[o.p[0],o.p[1],-o.p[2]]] : [o.p];
      for(const center of centers) for(let meridian=0;meridian<7;meridian++) {
        const pts=[],theta=meridian/7*Math.PI;
        for(let j=0;j<=28;j++) { const a=j/28*Math.PI*2;
          pts.push([center[0]+Math.cos(a)*Math.cos(theta)*o.r[0],center[1]+Math.sin(a)*o.r[1],center[2]+Math.cos(a)*Math.sin(theta)*o.r[2]]); }
        regionStrands.push({pts,c:col(o.c),a:.22,path:spinePath(o.p[1]),system:id});
      }
    }
    for(let meridian=0;meridian<12;meridian++) {
      const a=meridian/12*Math.PI*2,pts=[];
      for(let j=0;j<=50;j++) {const y=-3.9-j/50*13.6,w=bodyWidthAt(y),c=bodyAxisAt(y);
        pts.push([c[0]+w*.335+Math.cos(a)*w*.447,y,Math.sin(a)*w]);}
      contourStrands.push({pts,c:col(S.palette.core),a:.32,path:(i,n)=>3+i/n*13.6});
    }
    bodyLayers.outline.push(addFibres(contourStrands));
    bodyLayers.spine.push(addFibres(vertStrands));
    {   // bone dust along the vertebra outlines, so the spine reads as particles like the brain
      const segs=[]; vertStrands.forEach(st=>{ if (st.a>0) for (let i=0;i<st.pts.length-1;i++) segs.push([st.pts[i],st.pts[i+1],st.a]); });
      bodyLayers.spine.push(layer(Math.round(16000*k), () => { const [A,B,al]=pick(segs), t=rnd(), j=.012;
        return { p:[A[0]+(B[0]-A[0])*t+gauss()*j, A[1]+(B[1]-A[1])*t+gauss()*j, A[2]+(B[2]-A[2])*t+gauss()*j], c: rnd()<.5?col(S.palette.core):pick(dust), s:.012+rnd()*.02, a:(.4+rnd()*.5)*al*1.6, path:spinePath(A[1]) }; }));
    }
    bodyLayers.spine.push(addFibres(spineStrands));
    const organMesh=addFibres(regionStrands);
    organMesh.userData.bodySystems=regionStrands.flatMap(s=>Array((s.pts.length-1)*2).fill(s.system));
    organMesh.userData.baseAlpha=organMesh.geometry.attributes.aAlpha.array.slice();
    bodyLayers.regions.push(organMesh);
    seed = brainSeedAfterBody;

    const strong = edges.filter((e) => e.kind !== 'bridge');
    const thoughtDust = [];   // the thought path lies outside the brain on purpose
    containMesh(layer(Math.round(1200 * k), () => {
      const e = pick(strong), t = rnd(); thoughtDust.push(e.kind === 'thought'); const j = e.kind === 'thought' ? .06 : .12 * (1 - Math.abs(t - .5));
      const A = e.a.pos, B = e.b.pos, mid = [(A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2], hc = hemi(mid), w = e.kind === 'co' || e.kind === 'subject' ? t * (1 - t) : 0;
      return { p: [A.x + (B.x - A.x) * t + (hc[0] - mid[0]) * w + gauss() * j, A.y + (B.y - A.y) * t + (hc[1] - mid[1]) * w + gauss() * j, A.z + (B.z - A.z) * t + (hc[2] - mid[2]) * w + gauss() * j],
        c: e.kind === 'thought' ? col(S.palette.pulse) : pick(dust), s: .014 + rnd() * .03, a: .12 + rnd() * .35 };
    }), (i) => thoughtDust[i]);
    const pairs = [];
    for (let i = 0; i < termClusters.length; i++) for (let j = i + 1; j < termClusters.length; j++) pairs.push([termClusters[i], termClusters[j]]);
    layer(Math.round(0 * k), () => { const q = brainPt(true), f = .55 + rnd() * .4; return { p: [q[0] * f, q[1] * f + .3 * (1 - f), q[2] * f], c: pick(veil), s: .03 + rnd() * .09, a: .05 + rnd() * .14 }; });
    layer(Math.round(0 * k), () => { const c = pick(termClusters); return { p: [c.center[0] + gauss() * .5, c.center[1] + gauss() * .4, c.center[2] + gauss() * .5], c: pick(rnd() < .6 ? veil : dust), s: .5 + rnd() * 1.1, a: .018 + rnd() * .03 }; });
    layer(Math.round(0 * k), () => { const r = 3.2 + Math.pow(rnd(), .6) * 4.2, th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1); return { p: [Math.sin(ph) * Math.cos(th) * r * 1.25 + .6, Math.cos(ph) * r * .55 + .25, Math.sin(ph) * Math.sin(th) * r * .9], c: pick(dust), s: .012 + rnd() * .025, a: .08 + rnd() * .22 }; });

    // nodes
    const N = nodes.length, npos = new Float32Array(N * 3), nsize = new Float32Array(N), nphase = new Float32Array(N), ncol = new Float32Array(N * 3), nodeHl = new Float32Array(N);
    nodes.forEach((n, i) => { n.index = i; npos.set([n.pos.x, n.pos.y, n.pos.z], i * 3); nsize[i] = n.kind === 'thought' ? .16 : .13 + n.weight * .3; nphase[i] = rnd(); const c = col(n.color); ncol.set([c.r, c.g, c.b], i * 3); });
    const ng = new THREE.BufferGeometry();
    ng.setAttribute('position', new THREE.BufferAttribute(npos, 3)); ng.setAttribute('aSize', new THREE.BufferAttribute(nsize, 1));
    ng.setAttribute('aPhase', new THREE.BufferAttribute(nphase, 1)); ng.setAttribute('aHl', new THREE.BufferAttribute(nodeHl, 1)); ng.setAttribute('aColor', new THREE.BufferAttribute(ncol, 3));
    const nodePts = new THREE.Points(ng, new THREE.ShaderMaterial({ uniforms: { ...U, uCore: { value: col(S.palette.core) } },
      vertexShader: `attribute float aSize; attribute float aPhase; attribute float aHl; attribute vec3 aColor; uniform float uTime; uniform float uScale; uniform float uPulse;
        varying vec3 vColor; varying float vHl; varying float vFade;
        void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); float depth = -mv.z; float pulse = 1.0 + uPulse * 0.12 * sin(uTime * 0.7 + aPhase * 6.2831);
          gl_PointSize = clamp(aSize * pulse * (1.0 + 0.35 * aHl) * uScale / depth, 0.0, 160.0); vColor = aColor; vHl = aHl; vFade = smoothstep(60.0, 5.0, depth); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uCore; uniform float uBright; uniform float uSat; vec3 sat(vec3 c, float k) { return mix(vec3(dot(c, vec3(0.3, 0.59, 0.11))), c, k); } varying vec3 vColor; varying float vHl; varying float vFade;
        void main() { float d = length(gl_PointCoord - 0.5) * 2.0; if (d > 1.0) discard;
          float core = smoothstep(0.16, 0.0, d); float inner = exp(-d * d * 30.0); float halo = exp(-d * d * 7.0);
          vec3 c = mix(vColor, uCore, core * 0.9 + inner * 0.25); float a = (core + inner * 0.7 + halo * (0.07 + 0.16 * vHl)) * vFade * (0.8 + 0.4 * vHl);
          gl_FragColor = vec4(sat(c, uSat), a * uBright); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    nodePts.frustumCulled = false; world.add(nodePts);

    // lines
    const ESEG = 10, E = edges.length, lp = new Float32Array(E * ESEG * 6), lc = new Float32Array(E * ESEG * 6), edgeAlpha = new Float32Array(E * ESEG * 2), edgeBase = new Float32Array(E), edgeCur = new Float32Array(E);
    const lineCol = col(S.palette.line), thoughtCol = col(S.palette.pulse);
    edges.forEach((e, i) => {
      const A = e.a.pos, B = e.b.pos, mid = [(A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2];
      if (e.kind === 'co' || e.kind === 'subject') {
        const across = A.z * B.z < 0 && Math.min(Math.abs(A.z), Math.abs(B.z)) > .12 * BS, hc = hemi(mid);
        e.bow = across ? [mid[0] * .9 - mid[0], .44 * BS - mid[1], -mid[2]] : [(hc[0] - mid[0]) * .5, (hc[1] - mid[1]) * .5, (hc[2] - mid[2]) * .5];
      } else e.bow = [0, 0, 0];
      const c = e.kind === 'subject' ? col('#c3ad8d') : e.kind === 'co' ? lineCol : thoughtCol; for (let j = 0; j < ESEG * 2; j++) lc.set([c.r, c.g, c.b], (i * ESEG * 2 + j) * 3);
      edgeBase[i] = e.kind === 'co' ? .09 + .14 * Math.pow(e.n / maxLink, .8) : e.kind === 'subject' ? .14 : e.kind === 'thought' ? .05 : .04; edgeCur[i] = edgeBase[i];
    });
    const edgePt = (e, t) => { const A = e.a.pos, B = e.b.pos, bow = e.bow || [0, 0, 0], w = 2 * t * (1 - t) * bowK; return [A.x + (B.x - A.x) * t + bow[0] * w, A.y + (B.y - A.y) * t + bow[1] * w, A.z + (B.z - A.z) * t + bow[2] * w]; };
    const writeEdges = () => edges.forEach((e, i) => { let prev = edgePt(e, 0); for (let j = 1; j <= ESEG; j++) { const cur = edgePt(e, j / ESEG); lp.set([...prev, ...cur], (i * ESEG + j - 1) * 6); prev = cur; } });
    writeEdges();
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(lp, 3)); lg.setAttribute('aColor', new THREE.BufferAttribute(lc, 3)); lg.setAttribute('aAlpha', new THREE.BufferAttribute(edgeAlpha, 1));
    const lines = new THREE.LineSegments(lg, new THREE.ShaderMaterial({
      vertexShader: 'attribute vec3 aColor; attribute float aAlpha; varying vec3 vC; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vC = aColor; vA = aAlpha * smoothstep(60.0, 5.0, -mv.z); gl_Position = projectionMatrix * mv; }',
      uniforms: { uSat: U.uSat }, fragmentShader: 'uniform float uSat; vec3 sat(vec3 c, float k) { return mix(vec3(dot(c, vec3(0.3, 0.59, 0.11))), c, k); } varying vec3 vC; varying float vA; void main(){ gl_FragColor = vec4(mix(sat(vC, uSat), vec3(0.95, 1.0, 0.98), smoothstep(0.5, 1.0, vA) * 0.6), vA); }', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    lines.frustumCulled = false; world.add(lines);

    // threads: every topic's threads hang off it as fibres; they show when you zoom in (or the topic is selected)
    const fibres = [];
    const FSEG = 6;
    nodes.filter((n) => n.kind === 'term').forEach((n) => {
      const named = (n.th.links || []).slice(0, 8), total = Math.min(24, Math.max(named.length, n.th.threads || 0));
      const recs = (thrA.get(n) || []).slice().sort((x, y) => y.c - x.c);   // its threads with the most posts first
      for (let j = 0; j < total; j++) {   // one fibre per thread; the named ones (admin) can be opened, the others only show
        const [t, u, pc] = named[j] || ['', '', null], rec = recs[j] || mkAnchor(n, near(n.surf, 1.7, clusters[n.cluster] && clusters[n.cluster].lobe));
        const pts = Array.from({ length: FSEG + 1 }, (_, k) => { const q = quad(n.home0, rec.ctrl, rec.end, k / FSEG); return new THREE.Vector3(q[0] - n.home0[0], q[1] - n.home0[1], q[2] - n.home0[2]); });
        fibres.push({ node: n, title: String(t).split(' | ')[0], url: u, posts: pc, pts, pos: new THREE.Vector3(...rec.end), a: 0 });
      }
    });
    const F = Math.max(1, fibres.length), fp = new Float32Array(F * FSEG * 6), fa = new Float32Array(F * FSEG * 2), fc = new Float32Array(F * FSEG * 6).fill(.9), tp = new Float32Array(F * 3), ta = new Float32Array(F);
    const writeFibres = () => fibres.forEach((f, i) => {
      const o = f.node.pos; f.pos.copy(o).add(f.pts[FSEG]); tp.set([f.pos.x, f.pos.y, f.pos.z], i * 3);
      for (let j = 0; j < FSEG; j++) { const a = f.pts[j], b = f.pts[j + 1]; fp.set([o.x + a.x, o.y + a.y, o.z + a.z, o.x + b.x, o.y + b.y, o.z + b.z], (i * FSEG + j) * 6); }
    });
    writeFibres();
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fp, 3)); fg.setAttribute('aColor', new THREE.BufferAttribute(fc, 3)); fg.setAttribute('aAlpha', new THREE.BufferAttribute(fa, 1));
    const fibreLines = new THREE.LineSegments(fg, lines.material); fibreLines.frustumCulled = false; world.add(fibreLines);
    const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(tp, 3)); tg.setAttribute('aAlpha', new THREE.BufferAttribute(ta, 1));
    const tips = new THREE.Points(tg, new THREE.ShaderMaterial({ uniforms: { ...U, uColor: { value: col(S.palette.core) } },
      vertexShader: 'attribute float aAlpha; uniform float uScale; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = clamp(0.14 * uScale / -mv.z, 0.0, 26.0); vA = aAlpha; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uColor; varying float vA; void main(){ float d = length(gl_PointCoord-0.5)*2.0; float a = (smoothstep(0.35,0.0,d) + exp(-d*d*6.0)*0.45) * vA; if (a < 0.003) discard; gl_FragColor = vec4(uColor, a); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    tips.frustumCulled = false; world.add(tips);
    let selFibre = null, hovFibre = null;

    // pulses
    const PC = reduced ? 0 : (small ? 14 : 26), pulsePos = new Float32Array(Math.max(PC, 1) * 3), pulseAlpha = new Float32Array(Math.max(PC, 1));
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3)); pg.setAttribute('aAlpha', new THREE.BufferAttribute(pulseAlpha, 1));
    const pulses = new THREE.Points(pg, new THREE.ShaderMaterial({ uniforms: { ...U, uColor: { value: col(S.palette.pulse) } },
      vertexShader: 'attribute float aAlpha; uniform float uScale; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = clamp(0.2 * uScale / -mv.z, 0.0, 40.0); vA = aAlpha; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uColor; varying float vA; void main(){ float d = length(gl_PointCoord-0.5)*2.0; float a = (smoothstep(0.3,0.0,d) + exp(-d*d*8.0)*0.5) * vA; if (a < 0.003) discard; gl_FragColor = vec4(uColor, a); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    pulses.frustumCulled = false; world.add(pulses);
    const thoughtEdges = edges.filter((e) => e.kind === 'thought'), coEdges = edges.filter((e) => e.kind === 'co' && e.n > 60);
    const pulseEdges = coEdges.length ? coEdges : edges.filter((e) => (e.kind === 'co' || e.kind === 'subject') && e.a && e.b);
    const newPulse = (thought) => {
      const wantThought = !!(thought && thoughtEdges.length);
      const pool = wantThought ? thoughtEdges : pulseEdges;
      if (!pool.length) return { e: null, t: 0, speed: 0, thought: false, flip: false };
      const e = pool[Math.floor((wantThought ? rnd() : Math.pow(rnd(), 1.6)) * pool.length)] || pool[0];
      return { e, t: -rnd() * 4, speed: wantThought ? .32 + rnd() * .12 : .12 + rnd() * .1, thought: wantThought, flip: !wantThought && rnd() < .5 };
    };
    const plist = Array.from({ length: PC }, (_, i) => newPulse(i < PC * .45));

    // ---------- camera ----------
    const cameraFrames = {
      brain: {radius:small?16:13.2,y:small&&EMBED?0:-1.6}, upper: {radius:small?26:22,y:-5.3}, whole: {radius:small?37:31,y:small?-6:-7.4}
    };
    const cameraAngles = {quarter:1.32,front:Math.PI/2,side:0,back:-Math.PI/2,above:1.32,below:1.32};
    var CAM_PHI = { above: .8, below: 2.15 };   // camera height for the angles that look down or up
    const frameRadius=(name,f)=>Math.max(f.radius,(name==='brain'?4.1:6.3)/(Math.tan(Math.PI*21/180)*Math.max(.3,stage.clientWidth/Math.max(1,stage.clientHeight))));
    const initialFrame = cameraFrames[VIEW.framing] || cameraFrames.brain;
    const home = { theta: cameraAngles[VIEW.angle] ?? 1.32, phi:CAM_PHI[VIEW.angle] ?? 1.5, radius:frameRadius(VIEW.framing,initialFrame)*(CLOSE?.8:1), target:new THREE.Vector3(-.8,CLOSE?1:initialFrame.y,0) };
    var cameraReady = false, cameraKey = '';
    const cam = { theta: home.theta, phi: home.phi, radius: home.radius + 2.5, target: home.target.clone() };
    const goal = { theta: home.theta, phi: home.phi, radius: home.radius, target: home.target.clone() };
    const par = { x: 0, y: 0, tx: 0, ty: 0 };
    const t0 = performance.now(), clock = () => (performance.now() - t0) / 1000;
    let turnPh = 0, lastInput = -10, mouseAt = -10, last = clock(), W = 1, H = 1, selAt = -10;

    // ---------- labels ----------
    const labelBox = $('clLabels'), tip = $('clTip'), ret = $('clRet');
    const estCut = nodes.filter((n) => n.kind === 'term').map((n) => n.est).sort((a, b) => b - a)[9] || 0;
    const labelled = new Set(nodes.filter((n) => (n.kind === 'term' && n.est >= estCut) || n.kind === 'thought' || n.kind === 'group').map((n) => n.id));
    labelBox.innerHTML = '';
    nodes.forEach((n) => { const el = document.createElement('div'); el.className = 'cl-lbl' + bl(n); el.dataset.id = n.id; el.innerHTML = esc(n.label) + (n.kind === 'term' ? ` <small>~${fmt(n.est)}</small>` : ''); labelBox.appendChild(el); n.el = el; });
    const clLabels = termClusters.map((c) => {
      const el = document.createElement('div'); el.className = 'cl-clbl'; el.dataset.c = c.id; el.innerHTML = esc(c.label) + (c.lobeName ? `<small class="cl-lobe">${esc(c.lobeName)}</small>` : ''); labelBox.appendChild(el);
      const ms = nodes.filter((n) => n.cluster === c.id);
      const ctr = ms.reduce((v, n) => v.add(n.pos), new THREE.Vector3()).multiplyScalar(1 / Math.max(1, ms.length));
      return { el, pos: ctr.add(new THREE.Vector3(0, c.spread * 1.15 + .25, 0)) };
    });
    if (clusters.thought && S.thought[0] && byId[S.thought[0][0]]) {
      const el = document.createElement('div'); el.className = 'cl-clbl'; el.textContent = clusters.thought.label; labelBox.appendChild(el); clLabels.push({ el, pos: byId[S.thought[0][0]].pos.clone().add(new THREE.Vector3(.2, .55, 0)) });
    }

    var bodyMarks = [], syncBody = null, tipW = 190;   // body systems pinned to the body (filled once DIMS exists)
    // ---------- state ----------
    let hovered = null, selected = null, selSet = new Set(), hovSet = new Set(), findSet = new Set(), findLbl = new Set();
    const nb = (n) => new Set(n ? [n.id, ...n.links.map((l) => l.node.id)] : []);
    const setHl = () => { nodes.forEach((n, i) => { nodeHl[i] = n === selected ? 1 : n === hovered ? .85 : (selSet.has(n.id) || hovSet.has(n.id)) ? .4 : findSet.has(n.id) ? .55 : 0; }); ng.attributes.aHl.needsUpdate = true; };
    function select(n, move = true) {
      selected = n; selSet = nb(n);
      if (n && move) { goal.target.copy(n.pos).applyMatrix4(world.matrixWorld); goal.radius = Math.min(goal.radius, small ? 7.5 : 5.6); selAt = clock(); }
      if (!selFibre || selFibre.node !== n) selFibre = null;
      setHl(); renderFocus(n); renderTerms(); renderEgo(n); renderMatrix(n); renderLegend(); renderLegendBar(); if (move) { renderSide(n); $('clView').hidden = true; $('clViewBtn').setAttribute('aria-expanded', 'false'); } lastInput = clock();
    }
    const overview = () => { goal.theta = home.theta; goal.phi = home.phi; goal.radius = home.radius; goal.target.copy(home.target); selAt = -10; lastInput = clock(); };
    function updateCamera() {
      const key=VIEW.framing+':'+VIEW.angle+':'+stage.clientWidth+':'+stage.clientHeight;
      if(key===cameraKey) return;
      const f=cameraFrames[VIEW.framing] || cameraFrames.brain;
      home.radius=frameRadius(VIEW.framing,f)*(CLOSE?.8:1); home.target.set(-.8,CLOSE?1:f.y,0); home.theta=cameraAngles[VIEW.angle] ?? 1.32; home.phi=CAM_PHI[VIEW.angle] ?? 1.5;
      cameraKey=key; overview();
    }
    cameraReady = true;
    const tmp = new THREE.Vector3();
    const screenOf = (n) => tmp.copy(n.pos).applyMatrix4(world.matrixWorld).project(camera);
    function pickNode(x, y) {
      let best = null, bd = Infinity;
      for (const n of nodes) {
        const s = screenOf(n); if (s.z > 1 || n.hidden || !VIEW.nodes) continue;
        const d = Math.hypot((s.x + 1) / 2 * W - x, (1 - s.y) / 2 * H - y), r = 12 + (n.kind === 'term' ? n.weight * 12 : 6);
        if (d < r && d < bd) { bd = d; best = n; }
      }
      return best;
    }
    function pickFibre(x, y) {
      let best = null, bd = 11;
      for (const f of fibres) {
        if (f.a < .2 || !f.url) continue;
        const s = tmp.copy(f.pos).applyMatrix4(world.matrixWorld).project(camera); if (s.z > 1) continue;
        const d = Math.hypot((s.x + 1) / 2 * W - x, (1 - s.y) / 2 * H - y); if (d < bd) { bd = d; best = f; }
      }
      return best;
    }
    function hoverFibre(f) {
      if (f === hovFibre) return; hovFibre = f;
      if (f) { tip.innerHTML = `<b>${esc(f.title)}</b><br><span>${f.posts ? fmt(f.posts) + ' posts · ' : ''}<i class="tn">${esc(f.node.label)}</i></span>`; tip.style.opacity = 1; stage.style.cursor = 'pointer'; }
      else if (!hovered) { tip.style.opacity = 0; stage.style.cursor = ''; }
    }
    function renderSide(n, fx) {
      const el = $('clSide'), body = $('clSideBody');
      if (!n) { el.hidden = true; $('clLeg').style.visibility = ''; return; }
      el.hidden = false; $('clLeg').style.visibility = 'hidden';
      const cl = clusters[n.cluster];
      if (n.kind === 'thought') {
        body.innerHTML = `<div class="cl-kick" style="--c:${cl.color}">${esc(cl.label)} · step ${n.step}</div><h2 class="cl-name${bl(n)}">${esc(n.label)}</h2><p class="cl-def${bl(n)}">${esc(n.def)}</p>
          <dl class="cl-stats">${n.metrics.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>`;
        return;
      }
      if (n.kind === 'group') {
        body.innerHTML = `<p class="cl-sec" style="--c:${cl.color}">Topic group</p><h2 class="cl-name">${esc(n.label)}</h2>
          <ol class="cl-faq">${n.members.map((m) => `<li><button type="button" data-id="${m.id}">${esc(m.label)}</button></li>`).join('')}</ol>`;
        return;
      }
      lexTrail = [];
      const also = n.links.filter((l) => l.n > 0).slice(0, 5);
      if (D.guide) {
        body.innerHTML = `<p class="cl-sec" style="--c:${cl.color}">${esc(cl.label)}</p><h2 class="cl-name">${esc(n.label)}</h2><p class="cl-def">${esc(n.def)}</p>
          ${also.length ? `<p class="cl-also">Daneben ${also.map((l) => `<button type="button" data-id="${l.node.id}">${esc(l.node.label)}</button>`).join(', ')}.</p>` : ''}`;
        return;
      }
      body.innerHTML = `<p class="cl-sec" style="--c:${cl.color}">${esc(cl.label)}</p><h2 class="cl-name">${esc(n.label)}</h2><p class="cl-def">${esc(n.def)}</p>
        ${also.length ? `<p class="cl-also">Often discussed with ${also.map((l) => `<button type="button" data-id="${l.node.id}">${esc(l.node.label)}</button>`).join(', ')}.</p>` : ''}
        <h3 class="cl-faqh">Questions</h3><ol class="cl-faq" id="clLex"><li class="cl-muted">loading …</li></ol>`;
      const subjects = n.links.filter((l) => l.kind === 'subject');
      if (subjects.length) body.insertAdjacentHTML('beforeend', `<h3 class="cl-faqh">Topic groups</h3><p class="cl-also">${subjects.map((l) => `<button type="button" data-id="${l.node.id}">${esc(l.node.label)}</button>`).join(' · ')}</p>`);
      lexTerm(n);
    }
    // small lexicon: condensed explanations per topic (/api/admin/lex), every entry opens with its own links, and so on
    const lexCache = new Map(); let lexTrail = [], lexReq = 0;
    const lexGet = (q) => { if (!lexCache.has(q)) lexCache.set(q, fetch((PUB ? '/api/public/lex?' : '/api/admin/lex?') + q, { credentials: 'same-origin', cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null)); return lexCache.get(q); };
    async function lexTerm(n) {
      const id = ++lexReq, d = await lexGet('term=' + encodeURIComponent(n.id));
      if (id !== lexReq || !$('clLex')) return;
      const es = (d && d.entries) || [];
      if (PUB) {   // members only: stand-in text of the real length, blurred, not clickable
        $('clLex').innerHTML = es.map((e, i) => `<li><span class="cl-blur" aria-hidden="true">${esc(filler(e.q, i + 3))}</span></li>`).join('') || '<li class="cl-muted">Nothing here yet.</li>';
        if (es.length) $('clLex').insertAdjacentHTML('afterend', '<a class="cl-unlock" href="/#access">Get access to read the answers</a>');
        return;
      }
      $('clLex').innerHTML = es.map((e) => `<li><button type="button" data-lex="${esc(e.id)}">${esc(e.q)}</button></li>`).join('') || '<li class="cl-muted">Nothing here yet.</li>';
    }
    async function lexEntry(eid, back) {
      const id = ++lexReq, d = await lexGet('id=' + encodeURIComponent(eid));
      if (id !== lexReq || !d) return;
      if (!back) lexTrail.push(eid);
      let t = '', at = 0;
      for (const [a, b, k] of d.spans || []) { t += esc(d.text.slice(at, a)) + (byId[k] ? `<button type="button" class="cl-term" data-id="${k}">${esc(d.text.slice(a, b))}</button>` : esc(d.text.slice(a, b))); at = b; }
      t += esc(d.text.slice(at));
      const n = selected;
      $('clSideBody').innerHTML = `<button type="button" class="cl-back" data-back="1">← ${lexTrail.length > 1 ? 'Back' : esc(n ? n.label : 'Topic')}</button>
        <h3 class="cl-q">${esc(d.q)}</h3><p class="cl-text">${t}</p>
        ${d.related.length ? `<h3 class="cl-faqh">More questions</h3><ol class="cl-faq">${d.related.map((e) => `<li><button type="button" data-lex="${esc(e.id)}">${esc(e.q)}</button></li>`).join('')}</ol>` : ''}`;
      $('clSide').scrollTop = 0;
    }
    $('clSideX').addEventListener('click', () => { selFibre = null; renderSide(null); });
    $('clSideBody').addEventListener('click', (e) => {
      const lx = e.target.closest('button[data-lex]'); if (lx) { lexEntry(lx.dataset.lex); return; }
      if (e.target.closest('button[data-back]')) { lexTrail.pop(); if (lexTrail.length) lexEntry(lexTrail[lexTrail.length - 1], true); else renderSide(selected, selFibre); return; }
      const nb2 = e.target.closest('button[data-id]'); if (nb2) select(byId[nb2.dataset.id]);
    });
    function hover(n) {
      if (n === hovered) return;
      hovered = n; hovSet = nb(n); stage.style.cursor = n ? 'pointer' : ''; setHl();
      if (!n) { tip.style.opacity = 0; return; }
      if (D.guide && n.kind === 'term') {
        tip.innerHTML = `<b>${esc(n.label)}</b><br><span>${esc((clusters[n.cluster] || {}).label || '')}</span>`;
        tip.style.opacity = 1; tipW = tip.offsetWidth;
        return;
      }
      tip.innerHTML = `<b>${PUB && n.kind === 'thought' ? 'Thought path' : esc(n.label)}</b><br><span>${n.kind === 'term' ? fmt(n.th.threads) + ' threads · ~' + fmt(n.est) + ' posts' : n.kind === 'group' ? n.members.length + ' topics · subject group' : 'step ' + n.step + ' of ' + S.thought.length}</span>`;
      if (n.kind === 'term' && VIEW.readout) {   // readout: new posts, quality, body system, share of this week's activity
        const t = n.th, sy = SYSTEM.find((x) => x[0] === sysOf(n)), q = Math.round(thq(n)), w = Math.sqrt(th7(n) / maxN7);
        tip.innerHTML += `<div class="cl-tm">${t.n1 !== undefined ? `<span>+${fmt(t.n1)} today · +${fmt(t.n7 || 0)} week</span>` : ''}`
          + `<span class="q" title="quality">${'<i class="on"></i>'.repeat(Math.max(0, Math.min(5, q)))}${'<i></i>'.repeat(5 - Math.max(0, Math.min(5, q)))}</span>`
          + `<span class="w"><u style="width:${(w * 100).toFixed(0)}%"></u></span>`
          + (sy ? `<span class="sy"><i style="--c:${sy[2]}"></i>${esc(sy[1])}</span>` : '') + '</div>';
      }
      tip.style.opacity = 1; tipW = tip.offsetWidth;
    }

    // ---------- input ----------
    const pointers = new Map(); let dragDist = 0, pinch = 0;
    stage.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, .cl-side')) return;
      stage.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); dragDist = 0; stage.classList.add('drag');
      if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
    });
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      par.tx = ((e.clientX - r.left) / r.width - .5) * 2; par.ty = ((e.clientY - r.top) / r.height - .5) * 2;
      const p = pointers.get(e.pointerId);
      if (p) {
        const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
        if (pointers.size === 2) { const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) goal.radius = THREE.MathUtils.clamp(goal.radius * pinch / d, 2.2, 44); pinch = d; dragDist += 10; }
        else if (e.shiftKey) {   // shift + drag: move the view left/right/up/down instead of turning it
          dragDist += Math.abs(dx) + Math.abs(dy); const m = camera.matrixWorld.elements, kp = cam.radius * .0016;
          goal.target.x += (-m[0] * dx + m[4] * dy) * kp; goal.target.y += (-m[1] * dx + m[5] * dy) * kp; goal.target.z += (-m[2] * dx + m[6] * dy) * kp; selAt = -10;
        }
        else { dragDist += Math.abs(dx) + Math.abs(dy); goal.theta -= dx * .0055; goal.phi = THREE.MathUtils.clamp(goal.phi - dy * .0045, .45, 2.65); }
        lastInput = clock(); hover(null);
      } else { mouseAt = clock(); const fx = pickFibre(e.clientX - r.left, e.clientY - r.top); hoverFibre(fx); hover(fx ? null : pickNode(e.clientX - r.left, e.clientY - r.top)); }
    });
    const end = (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId); if (pointers.size < 2) pinch = 0;
      if (!pointers.size) {
        stage.classList.remove('drag');
        if (dragDist < 6 && e.type === 'pointerup') {
          const r = stage.getBoundingClientRect(), fx = pickFibre(e.clientX - r.left, e.clientY - r.top);
          if (fx) { if (selected !== fx.node) select(fx.node, false); selFibre = fx; renderSide(fx.node, fx); }
          else { const n = pickNode(e.clientX - r.left, e.clientY - r.top); if (n) select(n); }
        }
      }
    };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('pointerleave', () => { if (!pointers.size) { hover(null); par.tx = par.ty = 0; } });
    const ray = new THREE.Raycaster(), plane = new THREE.Plane(), hit = new THREE.Vector3(), viewDir = new THREE.Vector3();
    stage.addEventListener('wheel', (e) => {   // zoom towards the point under the mouse: scroll over the brain and you fly into it
      if (e.target.closest('.cl-side')) return;   // the side panel (lexicon) scrolls itself
      e.preventDefault();
      const f = Math.exp(e.deltaY * .0013), nr = THREE.MathUtils.clamp(goal.radius * f, 2.2, 44), r = stage.getBoundingClientRect();
      if (nr < goal.radius) {
        ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
        camera.getWorldDirection(viewDir); plane.setFromNormalAndCoplanarPoint(viewDir, goal.target);
        if (ray.ray.intersectPlane(plane, hit)) goal.target.lerp(hit, 1 - nr / goal.radius);
      }
      goal.radius = nr; selAt = -10; lastInput = clock();
    }, { passive: false });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && running) overview(); });
    $('clReset').addEventListener('click', overview);
    // video renderer hook (only with ?showcase in the URL): direct camera control for the TikTok showcase
    if (REC) window.__cc = Object.assign(window.__cc || {}, {
      topics: () => nodes.filter((n) => n.kind === 'term' && !n.hidden).sort((a, b) => b.est - a.est).map((n) => n.id),
      at: (id) => { const n = byId[id]; if (!n) return null; const s = screenOf(n), r = stage.getBoundingClientRect(); return [r.left + (s.x + 1) / 2 * W, r.top + (1 - s.y) / 2 * H, s.z]; },
      tip: (id, k = 0) => { const f = fibres.filter((x) => x.node.id === id)[k]; if (!f) return null; const s = tmp.copy(f.pos).applyMatrix4(world.matrixWorld).project(camera), r = stage.getBoundingClientRect(); return [r.left + (s.x + 1) / 2 * W, r.top + (1 - s.y) / 2 * H, s.z]; },
      radius: () => goal.radius,
      focus: (id) => { const n = byId[id]; if (n) { goal.target.copy(n.pos).applyMatrix4(world.matrixWorld); lastInput = clock(); } } });   // camera onto a topic without opening it
    if (/[?&]showcase\b/.test(location.search)) window.__cc = { goal, home, byId, select: (id) => select(byId[id]), hover: (id) => hover(id ? byId[id] : null), overview, idle: () => { lastInput = -1e9; } };
    $('clFresh')?.addEventListener('click', async () => {   // (not on the public page)
      const b = $('clFresh'); b.disabled = true; b.textContent = 'loading …';
      try { const d = await getData(true); window.ccCloud.reload(d); } catch (e) { b.textContent = e.message; }
    });

    // ---------- loop ----------
    function resize() {
      W = stage.clientWidth; H = stage.clientHeight; if (!W || !H) return;
      renderer.setPixelRatio(pr * qual / 100); renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); if(cameraReady) updateCamera();
      U.uScale.value = renderer.getDrawingBufferSize(new THREE.Vector2()).y / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    }
    if (!PUB) { const fit = () => { stage.style.height = Math.max(360, innerHeight - stage.getBoundingClientRect().top) + 'px'; }; fit(); if (window.__ccFit) removeEventListener('resize', window.__ccFit); window.__ccFit = fit; addEventListener('resize', fit); }   // admin tab: down to the window edge
    const ro = new ResizeObserver(resize); ro.observe(stage); resize();
    const R = { x: 0, y: 0, r: 0, a: 0 };
    function frame() {
      if (!running) return;
      requestAnimationFrame(frame);
      const now = clock(), dt = Math.min(.05, now - last); last = now; U.uTime.value = now;
      if (VIEW.turn && !FACE.has(arrCur)) {   // View panel switch decides (also with "reduce motion" in the OS); flat arrangements stand still
        if (!reduced) { world.rotation.y = Math.sin(now * .045) * .09; world.rotation.x = Math.sin(now * .031) * .03; world.position.y = Math.sin(now * .23) * .05; }
        const idle = now - Math.max(lastInput, mouseAt) - 5;   // 5 s without mouse, touch or zoom: the turning fades in
        if (idle > 0 && !pointers.size) {
          const e = Math.min(1, idle / 3), k = dt * .05 * e * e * (3 - 2 * e) * VIEW.speed / 100;
          goal.theta += k;
        }
      }
      if (lastInput > 0) document.querySelector('.cl-hint')?.classList.add('gone');
      world.updateMatrixWorld();
      if (selected && now - selAt < 1.2) goal.target.copy(selected.pos).applyMatrix4(world.matrixWorld);
      const kk = reduced ? 1 : 1 - Math.exp(-dt * (REC ? 10 : 2.6));
      cam.theta += (goal.theta - cam.theta) * kk; cam.phi += (goal.phi - cam.phi) * kk; cam.radius += (goal.radius - cam.radius) * kk; cam.target.lerp(goal.target, kk);
      par.x += (par.tx - par.x) * (1 - Math.exp(-dt * 1.8)); par.y += (par.ty - par.y) * (1 - Math.exp(-dt * 1.8));
      const th = cam.theta + (reduced ? 0 : par.x * .05), ph = cam.phi + (reduced ? 0 : par.y * .035);
      camera.position.set(cam.target.x + cam.radius * Math.sin(ph) * Math.sin(th), cam.target.y + cam.radius * Math.cos(ph), cam.target.z + cam.radius * Math.sin(ph) * Math.cos(th));
      camera.lookAt(cam.target);
      const any = hovered || selected;
      U.uFade.value += ((hovered ? 1 : 0) - U.uFade.value) * (1 - Math.exp(-dt * 6));
      edges.forEach((e, i) => {
        let target = edgeBase[i];
        if (e.a.hidden || e.b.hidden) target = 0; else if (hovered && (e.a === hovered || e.b === hovered)) target = 1; else if (selected && (e.a === selected || e.b === selected)) target = .32; else if (any) target *= .55;
        target *= e.kind === 'co' || e.kind === 'subject' ? 1 + arrM * .25 : 1 - arrM;   // arrangements: topic links a bit stronger, the thought path stays with the body
        edgeCur[i] += (target - edgeCur[i]) * (1 - Math.exp(-dt * 7)); edgeAlpha.fill(edgeCur[i], i * ESEG * 2, (i + 1) * ESEG * 2);
      });
      lg.attributes.aAlpha.needsUpdate = true;
      fibres.forEach((f, i) => {
        const dist = camera.position.distanceTo(tmp.copy(f.node.pos).applyMatrix4(world.matrixWorld));
        const want = f.node.hidden ? 0 : f === selFibre || f === hovFibre ? 1 : f.node === selected ? .75 : f.node === hovered ? .6 : .05 + THREE.MathUtils.clamp((11 - dist) / 6, 0, 1) * .4;   // faint from afar, clear when you zoom in or point at the topic
        f.a += (want * (1 - arrM) - f.a) * (1 - Math.exp(-dt * 6));   /* fibres keep their anatomical paths: they stay with the body */ for (let j = 0; j < FSEG * 2; j++) fa[i * FSEG * 2 + j] = f.a * (.3 + .6 * Math.ceil(j / 2) / FSEG); ta[i] = f.a;
      });
      fg.attributes.aAlpha.needsUpdate = true; tg.attributes.aAlpha.needsUpdate = true;
      plist.forEach((p, i) => {
        if (!p.e || !p.e.a || !p.e.b) { pulseAlpha[i] = 0; return; }
        p.t += dt * p.speed;
        if (p.t >= 1) {
          if (p.thought) { const nx = thoughtEdges.find((e) => e.a === p.e.b); Object.assign(p, nx ? { e: nx, t: 0 } : newPulse(true)); }
          else Object.assign(p, newPulse(false));
        }
        if (!p.e || !p.e.a || !p.e.b) { pulseAlpha[i] = 0; return; }
        const t = Math.max(0, p.t), q = edgePt(p.e, p.flip ? 1 - t : t);   // impulses follow the curved link
        pulsePos[i * 3] = q[0]; pulsePos[i * 3 + 1] = q[1]; pulsePos[i * 3 + 2] = q[2];
        pulseAlpha[i] = p.t < 0 || p.e.a.hidden || p.e.b.hidden ? 0 : Math.sin(Math.PI * t) * (p.thought ? .9 * (1 - arrM) : .6);
      });
      pg.attributes.position.needsUpdate = true; pg.attributes.aAlpha.needsUpdate = true;
      renderer.render(scene, camera);
      place(now); drawBeams(now); stepArr(dt); placeArr();
    }
    function place(now) {
      for (const n of nodes) {
        const s = screenOf(n), show = !n.hidden && (labelled.has(n.id) || findLbl.has(n.id) || n === hovered || n === selected || selSet.has(n.id));
        if (s.z > 1 || !show) { n.el.style.opacity = 0; continue; }
        const sx = (s.x + 1) / 2 * W, sy = (1 - s.y) / 2 * H;
        const depth = camera.position.distanceTo(tmp.copy(n.pos).applyMatrix4(world.matrixWorld)), near = THREE.MathUtils.clamp(1.4 - (depth - 5) / 9, 0, 1);
        const close = THREE.MathUtils.clamp((20 - depth) / 6, 0, 1);
        let o = (n === selected || n === hovered ? 1 : selSet.has(n.id) ? .85 : near * (selected ? .5 : .8)) * (n === hovered ? 1 : close);
        if (arrM > 0) o = n.kind === 'thought' ? 0 : THREE.MathUtils.lerp(o, n === selected || n === hovered ? 1 : selSet.has(n.id) || hovSet.has(n.id) ? .9 : (selected || hovered) ? .3 : .7, arrM);   // arrangements: every topic named at its group
        if (findLbl.has(n.id)) o = Math.max(o, .9);   // search hits stay named
        if (sx < 8 || sx > W - 60 || sy < 8 || sy > H - 20) o = 0;
        n.el.style.opacity = o.toFixed(2); n.el.style.transform = `translate3d(${(sx + 6).toFixed(1)}px, ${(sy - 5).toFixed(1)}px, 0)`;
        n.el.classList.toggle('hot', n === hovered); n.el.classList.toggle('sel', n === selected);
      }
      for (const L of clLabels) {
        tmp.copy(L.pos).applyMatrix4(world.matrixWorld).project(camera);
        if (tmp.z > 1) { L.el.style.opacity = 0; continue; }
        const far = THREE.MathUtils.clamp((24 - camera.position.distanceTo(tmp.set(0, .35, 0).applyMatrix4(world.matrixWorld))) / 8, 0, 1);
        tmp.copy(L.pos).applyMatrix4(world.matrixWorld).project(camera);
        const sx = (tmp.x + 1) / 2 * W, sy = (1 - tmp.y) / 2 * H, act = hovered || selected;
        const on = !!act && !!L.el.dataset.c && act.cluster === L.el.dataset.c, near = Math.hypot(MX - sx, MY - sy) < 130;
        L.el.style.opacity = ((on ? .95 : near ? .8 : act ? .18 : .38) * far).toFixed(2); L.el.classList.toggle('on', on);
        L.el.style.transform = `translate3d(${((tmp.x + 1) / 2 * W).toFixed(1)}px, ${((1 - tmp.y) / 2 * H).toFixed(1)}px, 0) translate(-50%, -50%)`;
      }
      const tc = clock(), fl = (m) => m.flash && tc > m.flash ? tc - m.flash : 99;   // seconds since a live note flashed this organ
      const fPick = bodyMarks.find((m) => m.on && m.anchor), fHov = hovered && hovered.kind === 'term' ? bodyMarks.find((m) => m.anchor && m.id === sysOf(hovered)) : null, fFl = bodyMarks.find((m) => fl(m) < 2.2);
      const fOn = fHov || fPick, fGo = fOn || fFl;   // a hovered topic lights its organ; a live note flashes it when nothing is picked
      U.uFocusA.value += ((fOn ? fHov && !fPick ? .7 : 1 : fFl ? .9 * (1 - fl(fFl) / 2.2) : 0) - U.uFocusA.value) * .08; if (fGo) U.uFocusY.value += (fGo.pos.y - U.uFocusY.value) * (U.uFocusA.value < .05 ? 1 : .15);
      for (const m of bodyMarks) {
        if(!m.anchor) continue;
        if(VIEW.bodymode==='hidden' || VIEW.framing==='brain' && !m.on) {m.el.style.opacity=0;m.el.style.pointerEvents='none';continue;}
        tmp.copy(m.pos).applyMatrix4(world.matrixWorld).project(camera);
        const sx = (tmp.x + 1) / 2 * W, sy = (1 - tmp.y) / 2 * H, near = Math.hypot(MX - sx, MY - sy) < 110;
        const o = tmp.z > 1 || (!m.n && !m.on) || sx < 8 || sx > W - 80 || sy < 8 || sy > H - 14 ? 0 : m.on || m === fHov || fl(m) < 1.6 ? 1 : fOn ? .3 : near ? .95 : .6;
        m.el.classList.toggle('ping', fl(m) < 1.2);
        m.el.style.opacity = o.toFixed(2); m.el.style.pointerEvents = o ? '' : 'none';
        const flip=sx>W*.55; m.el.style.flexDirection=flip?'row-reverse':'row';
        m.el.style.transform = `translate3d(${(sx - 3.5).toFixed(1)}px, ${(sy - 5).toFixed(1)}px, 0)${flip?' translateX(-100%)':''}`;
      }
      if (hovered) { const s = screenOf(hovered), sx = (s.x + 1) / 2 * W, sy = (1 - s.y) / 2 * H; tip.style.transform = `translate3d(${Math.max(6, Math.min(W - tipW - 8, sx + 18)).toFixed(0)}px, ${Math.max(6, sy - 46).toFixed(0)}px, 0)`; }
      if (selected) {
        const s = screenOf(selected), sx = (s.x + 1) / 2 * W, sy = (1 - s.y) / 2 * H;
        const depth = camera.position.distanceTo(tmp.copy(selected.pos).applyMatrix4(world.matrixWorld)), r = THREE.MathUtils.clamp(170 / depth, 14, 46);
        R.x += (sx - R.x) * .35; R.y += (sy - R.y) * .35; R.r += (r - R.r) * .2; R.a = Math.min(1, R.a + .05);
        const rot = reduced ? 0 : now * 9, g = R.r * 1.9 + 8, p = selected.pos;
        ret.innerHTML = `<circle cx="${R.x}" cy="${R.y}" r="${R.r}" fill="none" stroke="rgba(94,234,212,.45)" stroke-width="1" opacity="${R.a.toFixed(2)}"/>`;
        $('clRead').textContent = '';
      } else { ret.innerHTML = ''; $('clRead').textContent = ''; }
    }

    // ---------- dashboard ----------
    $('clEye').textContent = `brain · data ${D.generated}`;
    {
      const v = ((D.activity && D.activity.crawler_read) || []).map((x) => x || 0), mx = Math.max(1, ...v), w = 120 / Math.max(1, v.length);
      if (v.some((x) => x)) { $('clHist').innerHTML = v.map((x, i) => `<rect x="${(i * w + 1).toFixed(1)}" y="${(34 - Math.max(1.5, x / mx * 32)).toFixed(1)}" width="${(w - 2).toFixed(1)}" height="${Math.max(1.5, x / mx * 32).toFixed(1)}" rx="1"/>`).join(''); $('clHistF').hidden = false; }
    }
    const big = (n) => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'k' : fmt(n);
    const statFull=n=>Number(n).toLocaleString(document.documentElement.lang==='de'?'de-DE':'en-US');
    const C = D.crawler && D.crawler.read ? D.crawler : null;   // crawler counters (kb_check.py), missing until the extension ran once
    $('clStat').innerHTML = (C
      ? [[statFull(C.read), 'posts read'],
         ...(C.words_read ? [[statFull(C.words_read), 'words read']] : C.words ? [[fmt(C.words), 'words kept']] : []),   // all words the crawler went through (kept + skipped)
        ]
      : [[fmt(D.posts_known), 'posts counted']]
    ).map(([v, l]) => `<b ${l==='words read'?'data-live-words data-noi18n':l==='posts read'?'data-live-read data-noi18n':''}>${v}</b> <span>${l}</span>`).join(' · ');
    function renderLegend() {
      $('clLeg').innerHTML = S.clusters.map((c) => {
        const first = c.id === 'thought' ? byId[S.thought[0][0]] : nodes.filter((n) => n.cluster === c.id).sort((a, b) => b.est - a.est)[0];
        return first ? `<button type="button" data-id="${first.id}" class="${selected && selected.cluster === c.id ? 'on' : ''}" style="--c:${c.color}">${esc(c.label)}<i></i></button>` : '';
      }).join('');
    }
    $('clLeg').onclick = (e) => { const b = e.target.closest('button'); if (b) select(byId[b.dataset.id]); };
    function renderFocus(n) {
      const el = $('clFocus');
      if (!n) { el.innerHTML = '<div class="cl-ph"><span>Focus</span></div><p class="cl-muted">Click a node.</p>'; return; }
      const cl = clusters[n.cluster];
      if (n.kind === 'thought') {
        el.innerHTML = `<div class="cl-ph"><span>Focus · thought path</span><span>step ${n.step} of ${S.thought.length}</span></div>
          <div><div class="cl-kick" style="--c:${cl.color}">${esc(cl.label)}</div><h2 class="cl-name${bl(n)}">${esc(n.label)}</h2></div><p class="cl-def${bl(n)}">${esc(n.def)}</p>
          <dl class="cl-stats">${n.metrics.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
          <div class="cl-steps${PUB ? ' cl-blur' : ''}">${S.thought.map(([id, label], i) => `<button type="button" data-id="${id}" class="${id === n.id ? 'on' : ''}">${esc(label)}</button>${i < S.thought.length - 1 ? '<span>→</span>' : ''}`).join('')}</div>`;
        return;
      }
      if (n.kind === 'group') { el.innerHTML = `<div class="cl-ph"><span>Topic group</span></div><h2 class="cl-name">${esc(n.label)}</h2><p class="cl-muted">${n.members.length} topics</p>`; return; }
      const top = n.links.filter((l) => l.n > 0).slice(0, 3), max = top[0] ? top[0].n : 1;
      el.innerHTML = `<div class="cl-ph"><span>Focus</span><span>${esc(cl.label)}</span></div>
        <div><div class="cl-kick" style="--c:${cl.color}">${esc(cl.label)}</div><h2 class="cl-name">${esc(n.label)}</h2></div><p class="cl-def">${esc(n.def)}</p>
        <dl class="cl-stats"><div><dt>threads</dt><dd>${fmt(n.th.threads)}</dd></div><div><dt>posts counted</dt><dd>${fmt(n.th.posts_known)}</dd></div><div><dt>posts est.</dt><dd>~${fmt(n.est)}</dd></div></dl>
        ${top.length ? `<div class="cl-ph" style="border:0;padding:0"><span>Often together with</span><span>shared notes</span></div><ul class="cl-rows">${top.map((l) => `<li class="cl-row"><button type="button" data-id="${l.node.id}">${esc(l.node.label)}</button><span class="cl-bar"><i style="width:${(l.n / max * 100).toFixed(1)}%"></i></span><span class="cl-n">${fmt(l.n)}</span></li>`).join('')}</ul>` : ''}`;
    }
    $('clFocus').onclick = (e) => { const b = e.target.closest('button[data-id]'); if (b) select(byId[b.dataset.id]); };
    const sorted = nodes.filter((n) => n.kind === 'term').sort((a, b) => b.est - a.est);
    function renderTerms() {
      const list = sorted.slice(0, small ? 8 : 9);
      if (selected && selected.kind === 'term' && !list.includes(selected)) list[list.length - 1] = selected;
      $('clTerms').innerHTML = list.map((n) => `<li class="cl-row${n === selected ? ' on' : ''}"><button type="button" data-id="${n.id}">${esc(n.label)}</button><span class="cl-bar"><i style="width:${(n.est / maxEst * 100).toFixed(1)}%"></i></span><span class="cl-n">${fmt(n.est)}</span></li>`).join('');
    }
    $('clTerms').onclick = (e) => { const b = e.target.closest('button[data-id]'); if (b) select(byId[b.dataset.id]); };
    function renderEgo(n) {
      const svg = $('clEgo'), cx = 130, cy = 87;
      if (!n) { svg.innerHTML = ''; return; }
      const nb8 = n.links.slice(0, 8), mx = Math.max(1, ...nb8.map((l) => l.n));
      $('clEgoNote').textContent = n.kind === 'group' ? 'topic group' : n.kind === 'term' ? 'shared notes / groups' : 'chain';
      const pts = nb8.map((l, i) => { const a = -Math.PI / 2 + i / nb8.length * Math.PI * 2; return { l, x: cx + Math.cos(a) * 92, y: cy + Math.sin(a) * 58 }; });
      let s = '';
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const lk = pts[i].l.node.links.find((x) => x.node === pts[j].l.node); if (lk) s += `<line x1="${pts[i].x}" y1="${pts[i].y}" x2="${pts[j].x}" y2="${pts[j].y}" stroke="#2f8f86" stroke-opacity="${(.1 + .25 * lk.n / maxLink).toFixed(2)}"/>`; }
      for (const p of pts) { const kk = n.kind === 'term' ? p.l.n / mx : .7; s += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#5eead4" stroke-opacity="${(.2 + .6 * kk).toFixed(2)}" stroke-width="${(.6 + 1.6 * kk).toFixed(2)}"/>`; }
      for (const p of pts) {
        const r = p.l.node.kind === 'term' ? 2.5 + p.l.node.weight * 4 : 3.5, right = p.x >= cx;
        s += `<g class="cl-egon" data-id="${p.l.node.id}" style="cursor:pointer"><circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${p.l.node.color}" fill-opacity=".9"/><circle cx="${p.x}" cy="${p.y}" r="${r + 4}" fill="#5eead4" fill-opacity=".06"/>
          <text x="${p.x + (right ? r + 4 : -r - 4)}" y="${p.y + 3}" font-size="8.5" fill="#c3ccd1" text-anchor="${right ? 'start' : 'end'}">${esc(p.l.node.label)}${n.kind === 'term' && p.l.n ? ` <tspan fill="#8a979e">${p.l.n}</tspan>` : ''}</text></g>`;
      }
      s += `<circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="#5eead4" stroke-opacity=".35" stroke-dasharray="2 3"/><circle cx="${cx}" cy="${cy}" r="5.5" fill="#effffb"/><circle cx="${cx}" cy="${cy}" r="9" fill="#5eead4" fill-opacity=".18"/>`;
      if (!nb8.length) s += `<text x="${cx}" y="${cy + 30}" font-size="9" fill="#56656c" text-anchor="middle">no strong connection</text>`;
      svg.innerHTML = s;
    }
    $('clEgo').onclick = (e) => { const g = e.target.closest('.cl-egon'); if (g) select(byId[g.dataset.id]); };
    function renderActivity() {
      const A = D.activity, svg = $('clAct');
      if (!svg || !A || !Array.isArray(A.days) || !A.days.length || !Array.isArray(A.crawler_read) || !Array.isArray(A.crawler_notes) || !Array.isArray(A.answers)) return;
      const L = 30, Rr = 312, n = A.days.length, x = (i) => L + (Rr - L) * i / (n - 1);
      $('clActNote').textContent = 'until ' + A.until;
      const nice = (v) => { const m = Math.max(1, v); const p = Math.pow(10, Math.floor(Math.log10(m))); return Math.ceil(m / p) * p; };
      let s = '<defs><linearGradient id="clga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc" stop-opacity=".38"/><stop offset="1" stop-color="#7dd3fc" stop-opacity="0"/></linearGradient></defs>';
      const t0y = 12, t1y = 66, maxC = nice(Math.max(...A.crawler_read.filter((v) => v !== null), 1)), yC = (v) => t1y - (t1y - t0y) * v / maxC;
      for (const v of [0, maxC / 2, maxC]) s += `<line x1="${L}" x2="${Rr}" y1="${yC(v)}" y2="${yC(v)}" stroke="rgba(94,234,212,.08)"/><text x="${L - 6}" y="${yC(v) + 3}" font-size="8" fill="#56656c" text-anchor="end">${v}</text>`;
      const idx = A.crawler_read.map((v, i) => v === null ? null : i).filter((v) => v !== null);
      if (idx.length) {
        s += `<path d="M${x(idx[0])},${yC(0)} ${idx.map((i) => `L${x(i)},${yC(A.crawler_read[i])}`).join(' ')} L${x(idx[idx.length - 1])},${yC(0)} Z" fill="url(#clga)"/>`;
        s += `<path d="${idx.map((i, j) => `${j ? 'L' : 'M'}${x(i)},${yC(A.crawler_read[i])}`).join(' ')}" fill="none" stroke="#7dd3fc" stroke-width="1.1"/>`;
        s += `<path d="${idx.map((i, j) => `${j ? 'L' : 'M'}${x(i)},${yC(A.crawler_notes[i])}`).join(' ')}" fill="none" stroke="#5eead4" stroke-width="1.1" stroke-dasharray="3 2"/>`;
        const li = idx[idx.length - 1];
        s += `<circle cx="${x(li)}" cy="${yC(A.crawler_read[li])}" r="2.6" fill="#effffb"/><circle cx="${x(li)}" cy="${yC(A.crawler_read[li])}" r="6" fill="#7dd3fc" fill-opacity=".2"/>`;
      }
      const b0 = 92, b1 = 140, maxA = nice(Math.max(...A.answers, 1)), yA = (v) => b1 - (b1 - b0) * v / maxA;
      for (const v of [0, maxA / 2, maxA]) s += `<line x1="${L}" x2="${Rr}" y1="${yA(v)}" y2="${yA(v)}" stroke="rgba(94,234,212,.08)"/><text x="${L - 6}" y="${yA(v) + 3}" font-size="8" fill="#56656c" text-anchor="end">${v}</text>`;
      A.answers.forEach((v, i) => {
        const lastDay = i === n - 1;
        s += `<rect x="${x(i) - 5}" y="${yA(v)}" width="10" height="${(b1 - yA(v)).toFixed(1)}" fill="${lastDay ? '#1f6f68' : '#2f8f86'}" fill-opacity="${lastDay ? .9 : .75}"><title>${A.days[i]}.${A.month}.: ${v} answers</title></rect>`;
        if (v) s += `<text x="${x(i)}" y="${yA(v) - 3}" font-size="7.5" fill="#8a979e" text-anchor="middle">${v}</text>`;
      });
      A.days.forEach((d, i) => { s += `<text x="${x(i)}" y="${b1 + 13}" font-size="8" fill="#8a979e" text-anchor="middle">${d}.</text>`; });
      s += `<text x="${L}" y="7" font-size="7.5" fill="#8a979e" letter-spacing=".1em">CRAWLER / DAY</text><text x="${L}" y="${b0 - 9}" font-size="7.5" fill="#8a979e" letter-spacing=".1em">AI ANSWERS / DAY</text>`;
      svg.innerHTML = s;
    }
    function renderMatrix(sel) {
      const ids = S.matrix.filter((id) => byId[id]), svg = $('clMatrix'), L = 38, T = 8, cs = 18, si = sel ? ids.indexOf(sel.id) : -1;
      const val = (a, b) => { if (a === b) return null; const l = byId[a].links.find((x) => x.node.id === b); return l ? l.n / Math.min(byId[a].th.notes, byId[b].th.notes) : 0; };
      let s = '';
      ids.forEach((a, i) => {
        const short = S.matrixShort[S.matrix.indexOf(a)];
        s += `<text x="${L - 5}" y="${T + i * cs + cs / 2 + 3}" font-size="7.5" fill="${i === si ? '#5eead4' : '#8a979e'}" text-anchor="end">${short}</text>`;
        s += `<text x="${L + i * cs + cs / 2}" y="${T + ids.length * cs + 11}" font-size="6.5" fill="${i === si ? '#5eead4' : '#8a979e'}" text-anchor="middle">${short}</text>`;
        ids.forEach((b, j) => {
          const v = val(a, b), on = i === si || j === si, x0 = L + j * cs, y0 = T + i * cs;
          if (v === null) s += `<line x1="${x0 + 4}" y1="${y0 + cs - 4}" x2="${x0 + cs - 4}" y2="${y0 + 4}" stroke="rgba(94,234,212,.18)"/>`;
          else s += `<rect x="${x0 + 1}" y="${y0 + 1}" width="${cs - 2}" height="${cs - 2}" fill="#5eead4" fill-opacity="${(.05 + .8 * Math.pow(Math.min(1, v), 1.1)).toFixed(2)}" stroke="${on ? 'rgba(94,234,212,.55)' : 'none'}"><title>${esc(byId[a].label)} × ${esc(byId[b].label)}: ${Math.round(v * 100)} % overlap</title></rect>`;
        });
      });
      svg.innerHTML = s;
    }

    // ---------- reference GUI: View panel (colour theme, motion, links, point size), topic search, topic legend ----------
    const THEMES = [   // own palettes from the world of the data: serum, blood, clinical steel, sage, chalk (Default and Aurora stay)
      ['Default', null], ['Serum', ['#3a2a0a', '#8a6414', '#d6a23a', '#f2cf7a', '#fff1cc']], ['Plasma', ['#3d0a14', '#8f1d2c', '#d2475a', '#f08a8f', '#ffd9d6']],
      ['Steel', ['#0f2333', '#2b5674', '#5d93b5', '#a5cde3', '#eef7fb']], ['Aurora', ['#4c1d95', '#8b5cf6', '#22d3ee', '#34d399', '#f0abfc']],
      ['Sage', ['#1c2a22', '#3f5e4a', '#6f9479', '#a9c7ae', '#e8f1e6']], ['Chalk', ['#3a3733', '#6b665e', '#a19a8e', '#d3ccbf', '#ece6da']],
      ['Ember', ['#2a0a06', '#8a1f0e', '#e2541c', '#f9a23a', '#ffe6a8']], ['Ocean', ['#06142e', '#0f3d7a', '#1f7fc4', '#4fd1e8', '#e0fbff']],
      ['Sunset', ['#2b0f3d', '#7a1f6b', '#e0457b', '#f99a4e', '#ffe08a']], ['Neon', ['#1a0638', '#7c1fd9', '#e040fb', '#22d3ee', '#eafffd']],
      ['Toxic', ['#081a0a', '#1f6b1a', '#5fd12e', '#d4f53a', '#fbffd0']], ['Ice', ['#0b1724', '#2f5f86', '#7fb4d9', '#c9e6f5', '#ffffff']],
      ['Mint', ['#062019', '#0f5c4b', '#2fb89a', '#5eead4', '#ecfdf8']], ['Rose', ['#2a0a16', '#7a2346', '#d0607f', '#f5a8bd', '#fff0f4']],
    ];
    function palAt(pal, t) { const P = pal.map(col); t = Math.min(.999, Math.max(0, t)) * (P.length - 1); const i = Math.floor(t); return P[i].lerp(P[i + 1], t - i); }
    function themeOf(name) { return THEMES.find((t) => t[0] === name) || THEMES[0]; }
    function paintLines(pal) {   // links between topics: mix of both ends' colours (Colour by), mapped onto the theme like the dots
      const P = pal, lum = (c) => c.r * .3 + c.g * .59 + c.b * .11;
      const onPal = (t) => palAt(P, t);
      edges.forEach((e, i) => {
        if (e.kind !== 'co') return;
        let c = !settingsReady || SET.color === 'cluster' ? lineCol.clone() : col(e.a.color || '#5eead4').lerp(col(e.b.color || '#5eead4'), .5);
        if (P) c = onPal(lum(c) * 1.15);
        for (let j = 0; j < ESEG * 2; j++) lc.set([c.r, c.g, c.b], (i * ESEG * 2 + j) * 3);
      });
      lg.attributes.aColor.needsUpdate = true;
    }
    function validateView(v) {
      const s = pickSettings(v, VIEW_DEF);
      [['framing',['brain','upper','whole']],['angle',['quarter','front','side','back','above','below']],['bodymode',['full','nerves','spine','hidden']]].forEach(([k,ok])=>{ if(!ok.includes(s[k])) s[k]=VIEW_DEF[k]; });
      if (!THEMES.some((t) => t[0] === s.theme)) s.theme = VIEW_DEF.theme;
      [['regionStrength',0,100,1], ['speed', 0, 300, 10], ['size', 50, 200, 10], ['bright', 50, 160, 1], ['body', 10, 100, 5], ['sat', 0, 200, 1], ['lsize', 80, 150, 1], ['drift', 0, 200, 10], ['pulse', 0, 200, 10], ['fib', 0, 400, 10], ['organ', 0, 200, 10], ['ldense', 0, 40, 1], ['fov', 25, 75, 1], ['quality', 50, 150, 10], ['vign', 0, 100, 5]]
        .forEach(([k, lo, hi, step]) => { s[k] = lo + Math.round((Math.min(hi, Math.max(lo, s[k])) - lo) / step) * step; });
      if (s.ui !== '' && !/^#[0-9a-f]{6}$/i.test(s.ui)) s.ui = '';   // panel colour: off or a hex colour
      s.bg = s.bg.length === 7 && /^#[0-9a-f]{6}$/i.test(s.bg) ? s.bg.toLowerCase() : VIEW_DEF.bg;
      return s;
    }
    function applyView() {
      Object.assign(VIEW, validateView(VIEW));
      if (bodyLayers) {
        for (const [kind, meshes] of Object.entries(bodyLayers)) meshes.forEach((mesh) => {
          const visible = VIEW.bodymode !== 'hidden' && (kind === 'spine' || VIEW.bodymode === 'full' || VIEW.bodymode === 'nerves' && kind === 'nerves');
          if(mesh.userData.vis !== undefined) {mesh.userData.vis=visible;mesh.visible=false;} else mesh.visible=visible;
        });
      }
      ['clBodyMode','clFraming','clAngle'].forEach((id,i)=>{ $(id).value=VIEW[['bodymode','framing','angle'][i]]; });
      if (cameraReady) updateCamera();
      const th = themeOf(VIEW.theme);
      U.uBright.value = VIEW.bright / 100;   // in the shader: a CSS brightness filter on the transparent WebGL canvas darkened the dots
      U.uSat.value = VIEW.sat / 100; U.uBody.value = VIEW.body / 100;
      U.uDrift.value = reduced ? 0 : VIEW.drift / 100; U.uPulse.value = reduced ? 0 : VIEW.pulse / 100; U.uFib.value = VIEW.fib / 100; U.uFocusK.value = 2.4 * VIEW.organ / 100;
      { const top = nodes.filter((n) => n.kind === 'term').sort((a, b) => b.est - a.est).slice(0, VIEW.ldense); labelled.clear(); nodes.forEach((n) => { if (n.kind !== 'term' || top.includes(n)) labelled.add(n.id); }); }
      if (camera.fov !== VIEW.fov || qual !== VIEW.quality) { camera.fov = VIEW.fov; qual = VIEW.quality; resize(); }
      [['clStack', 'clog'], ['clHistF', 'hist']].forEach(([id, k]) => { if ($(id)) $(id).style.display = VIEW[k] ? '' : 'none'; }); document.querySelectorAll('.cl-hint').forEach((h) => { h.style.display = VIEW.hint ? '' : 'none'; });
      $('clStage').style.backgroundImage = VIEW.vign ? `radial-gradient(ellipse at 50% 38%, rgba(94,234,212,${(VIEW.vign / 100 * .14).toFixed(3)}), transparent 62%)` : '';   // in the shaders: a CSS filter on the transparent WebGL canvas washes the colours out
      labelBox.style.setProperty('--label-size', VIEW.lsize / 100);
      if (VIEW.ui) {   // panels: own colour, independent of the brain colour (theme)
        const rgb = VIEW.ui.match(/[0-9a-f]{2}/gi).map((h, i) => Math.round(parseInt(h, 16) * .55 + [3, 8, 10][i] * .45));
        $('clStage').style.setProperty('--ui-tint', `rgba(${rgb.join(',')},.94)`);
      }
      $('clStage').classList.toggle('cl-tintui', !!VIEW.ui);
      $('clUiCols').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.u === VIEW.ui));
      $('clUiCols').querySelector('label').classList.toggle('on', !!VIEW.ui && !UICOLS.some(([, c]) => c === VIEW.ui)); if (VIEW.ui) $('clUiPick').value = VIEW.ui;
      if (th[1]) { th[1].forEach((h, i) => U.uPal.value[i].set(h)); U.uPalOn.value = 1; } else U.uPalOn.value = 0;
      U.uSizeMul.value = VIEW.size / 100; lines.visible = VIEW.links; paintLines(th[1]); $('clSpeed').closest('label').style.display = VIEW.turn ? '' : 'none';
      nodePts.visible = VIEW.nodes; if (dataDots) dataDots.visible = VIEW.posts;
      labelBox.classList.toggle('nolabels', !VIEW.labels); labelBox.classList.toggle('nomarks', !VIEW.marks); labelBox.classList.toggle('nocount', !VIEW.counts); labelBox.classList.toggle('nonodes', !VIEW.nodes);
      if (dataDots) {   // posts of filtered topics get size 0 (their original sizes are kept)
        const A = dataDots.geometry.attributes.aSize; dataDots.userData.size0 = dataDots.userData.size0 || A.array.slice();
        postIds.forEach((id, i) => { const t = byId[id]; A.array[i] = t && t.hidden ? 0 : dataDots.userData.size0[i]; }); A.needsUpdate = true;
      }
      [['clRegions','regions'], ['clTurn', 'turn'], ['clLinks', 'links'], ['clShowNodes', 'nodes'], ['clShowPosts', 'posts'], ['clShowLabels', 'labels'], ['clCounts', 'counts'], ['clMarks', 'marks'], ['clReadout', 'readout'], ['clCLog', 'clog'], ['clHistOn', 'hist'], ['clHintOn', 'hint']]
        .forEach(([id, k]) => { $(id).checked = VIEW[k]; });
      [['clRegionStrength','regionStrength'], ['clSpeed', 'speed'], ['clSize', 'size'], ['clBright', 'bright'], ['clBody', 'body'], ['clSat', 'sat'], ['clLabelSize', 'lsize'], ['clDrift', 'drift'], ['clPulse', 'pulse'], ['clFib', 'fib'], ['clOrgan', 'organ'], ['clLDense', 'ldense'], ['clFov', 'fov'], ['clQuality', 'quality'], ['clVign', 'vign']].forEach(([id, k]) => {
        const e = $(id); e.value = VIEW[k]; $(id + 'V').textContent = VIEW[k] + ({ ldense: '', fov: '°' }[k] ?? ' %');
        e.style.setProperty('--p', ((e.value - e.min) / (e.max - e.min) * 100).toFixed(1) + '%');
      });
      $('clThemes').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.t === VIEW.theme));
      $('clStage').style.setProperty('--void', VIEW.bg); $('clBgPick').value = VIEW.bg;
      $('clBgs').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.c === VIEW.bg));
      $('clBgs').querySelector('label').classList.toggle('on', !BGS.some(([, c]) => c === VIEW.bg));
      $('clRegionStrength').closest('label').hidden=!VIEW.regions;
      applyRegions();
      if(syncRegions) syncRegions();
      try { if(!EMBED) localStorage.setItem('cc_brain_view', JSON.stringify(VIEW)); } catch { /* storage blocked */ }
      if (syncMenus) syncMenus();
    }
    $('clThemes').innerHTML = THEMES.map(([name, p]) => `<button type="button" data-t="${name}"><i style="background:${p ? `linear-gradient(90deg, ${p.join(', ')})` : 'linear-gradient(90deg, #f2727f, #f5b84b, #5eead4, #7dd3fc, #c4b5fd)'}"></i>${name}</button>`).join('');
    var UICOLS = [['Off', ''], ['Teal', '#0f4a46'], ['Blue', '#1a3a6b'], ['Green', '#1f4d2e'], ['Violet', '#3d2659'], ['Red', '#5a2222'], ['Sand', '#55462c']];
    const BGS = [['Night', '#030607'], ['Graphite', '#141618'], ['Navy', '#07122a'], ['Moss', '#0a1a12'], ['Plum', '#170d1c'], ['Rust', '#1e0e08']];
    $('clBgs').innerHTML = BGS.map(([n, c]) => `<button type="button" data-c="${c}" style="--c:${c}" title="${n}" aria-label="${n}"></button>`).join('') + '<label title="Own colour"><input type="color" id="clBgPick" aria-label="Own background colour"></label>';
    $('clBgs').onclick = (e) => { const b = e.target.closest('button[data-c]'); if (b) { VIEW.bg = b.dataset.c; applyView(); } };
    $('clBgPick').oninput = (e) => { VIEW.bg = e.target.value; applyView(); };
    $('clUiCols').innerHTML = UICOLS.map(([n, c]) => `<button type="button" data-u="${c}" style="--c:${c || 'transparent'}" title="${n}" aria-label="${n}"></button>`).join('') + '<label title="Own colour"><input type="color" id="clUiPick" aria-label="Own panel colour"></label>';
    $('clUiCols').onclick = (e) => { const b = e.target.closest('button[data-u]'); if (b) { VIEW.ui = b.dataset.u; applyView(); } };
    $('clUiPick').oninput = (e) => { VIEW.ui = e.target.value; applyView(); };
    $('clThemes').onclick = (e) => { const b = e.target.closest('button[data-t]'); if (b) { VIEW.theme = b.dataset.t; applyView(); } };
    [['clRegions','regions'], ['clTurn', 'turn'], ['clLinks', 'links'], ['clShowNodes', 'nodes'], ['clShowPosts', 'posts'], ['clShowLabels', 'labels'], ['clCounts', 'counts'], ['clMarks', 'marks'], ['clReadout', 'readout'], ['clCLog', 'clog'], ['clHistOn', 'hist'], ['clHintOn', 'hint']]
      .forEach(([id, k]) => { $(id).onchange = (e) => { VIEW[k] = e.target.checked; applyView(); }; });
    $('clVReset').onclick = () => { Object.assign(VIEW, VIEW_DEF); applyView(); };
    $('clShot').onclick = () => {
      renderer.render(scene, camera);   // read right after a render: the drawing buffer is not kept between frames
      const c = $('clGl'), o = document.createElement('canvas'); o.width = c.width; o.height = c.height;
      const x = o.getContext('2d'); x.fillStyle = VIEW.bg; x.fillRect(0, 0, o.width, o.height); x.drawImage(c, 0, 0);
      o.toBlob((b) => { if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'current-cycle-brain.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, 'image/png');
    };
    $('clVOver').onclick = () => overview();
    [['clRegionStrength','regionStrength'], ['clSpeed', 'speed'], ['clSize', 'size'], ['clBright', 'bright'], ['clBody', 'body'], ['clSat', 'sat'], ['clLabelSize', 'lsize'], ['clDrift', 'drift'], ['clPulse', 'pulse'], ['clFib', 'fib'], ['clOrgan', 'organ'], ['clLDense', 'ldense'], ['clFov', 'fov'], ['clQuality', 'quality'], ['clVign', 'vign']]
      .forEach(([id, k]) => { $(id).oninput = (e) => { VIEW[k] = +e.target.value; applyView(); }; });
    const panel = (id, btn, open) => { $(id).hidden = !open; $(btn).setAttribute('aria-expanded', String(open)); };
    $('clViewBtn').onclick = () => {
      const open = $('clView').hidden; panel('clView', 'clViewBtn', open);
      if (open) { selFibre = null; renderSide(null); }   // one panel on the right at a time
    };
    $('clViewBtn').addEventListener('click', () => { if (!$('clView').hidden) panel('clArrP', 'clArrBtn', false); });   // both open on the right: one at a time
    $('clArrBtn').onclick = () => { const open = $('clArrP').hidden; panel('clArrP', 'clArrBtn', open); if (open) panel('clView', 'clViewBtn', false); $('clStack').style.visibility = open && matchMedia('(max-width: 760px)').matches ? 'hidden' : ''; };   // the crawler log stays; only on phones the full-width panel covers it
    document.querySelectorAll('.cl-px').forEach((b) => { b.onclick = () => { const id = b.dataset.close; panel(id, id === 'clView' ? 'clViewBtn' : 'clArrBtn', false); if (id === 'clArrP') $('clStack').style.visibility = ''; }; });
    ['clView', 'clArrP', 'clArrBtn', 'clSearch', 'clSearchList', 'clViewBtn', 'clPresets'].forEach((id) => ['pointerdown', 'wheel'].forEach((ev) => $(id).addEventListener(ev, (e) => e.stopPropagation(), { passive: true })));
    applyView();
    // search: ranked (whole name, start, word start, part, several words, definition, typo); the translated name counts too; hits light up in the brain
    const termNodes = nodes.filter((n) => n.kind === 'term' || n.kind === 'group');
    const labelOf = (n) => (window.ccT ? window.ccT(n.label) : n.label);
    var FIND_DEF = { scope: 'all', fuzzy: true, mark: true, label: true, only: false, max: 20, sort: 'best' };
    function validateFind(v) {
      const s = pickSettings(v, FIND_DEF);
      if (!['names', 'all'].includes(s.scope)) s.scope = FIND_DEF.scope;
      if (![8, 20, 50, 100].includes(s.max)) s.max = FIND_DEF.max;
      if (!['best', 'posts', 'az', 'new'].includes(s.sort)) s.sort = FIND_DEF.sort;
      return s;
    }
    var FIND = validateFind(EMBED ? null : (() => { try { return JSON.parse(localStorage.getItem('cc_brain_find')); } catch { return null; } })());
    const sfold = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, ' ').trim();
    const lev = (a, b, max) => {   // edit distance, gives up above max
      if (Math.abs(a.length - b.length) > max) return max + 1;
      let p = Array.from({ length: b.length + 1 }, (_, j) => j);
      for (let i = 1; i <= a.length; i++) {
        const c = [i]; let lo = i;
        for (let j = 1; j <= b.length; j++) { c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); lo = Math.min(lo, c[j]); }
        if (lo > max) return max + 1; p = c;
      }
      return p[b.length];
    };
    const akaOf = new Map();   // short names in brackets in the definition, e.g. "(Deca, NPP)"
    const aka = (n) => { if (!akaOf.has(n.id)) akaOf.set(n.id, (String(n.def || '').match(/\(([^()]{1,60})\)/g) || []).flatMap((m) => m.slice(1, -1).split(/,|\/|;| or /)).map(sfold).filter((x) => x && x.split(' ').length <= 3)); return akaOf.get(n.id); };
    function matchOf(n, q, qs, raw) {   // [score, text around the hit in the definition]
      const names = [sfold(n.label), sfold(labelOf(n)), sfold(n.id), ...aka(n)], flat = names.map((x) => x.replace(/ /g, ''));
      if (names.includes(q) || flat.includes(qs)) return [100];
      if (flat.some((x) => x.startsWith(qs))) return [80];
      if (names.some((x) => (' ' + x).includes(' ' + q))) return [65];
      if (flat.some((x) => x.includes(qs))) return [50];
      const tok = q.split(' ');
      if (tok.length > 1 && tok.every((t) => names.some((x) => x.includes(t)))) return [45];
      if (FIND.scope === 'all' && n.def) { const d = String(n.def), i = d.toLowerCase().indexOf(raw); if (i >= 0) return [30, (i > 24 ? '… ' : '') + d.slice(Math.max(0, i - 24), i + raw.length + 34) + ' …']; }
      if (FIND.fuzzy && qs.length >= 4) {
        const m = qs.length >= 8 ? 2 : 1, words = names.flatMap((x) => x.split(' ')).concat(flat);
        const d = Math.min(...words.map((w) => Math.min(lev(qs, w, m), w.length > qs.length ? lev(qs, w.slice(0, qs.length), m) : m + 1)));
        if (d <= m) return [20 - d * 5];
      }
      return [0];
    }
    const HIT_SORT = { best: (a, b) => b.s - a.s || b.n.est - a.n.est, posts: (a, b) => b.n.est - a.n.est, az: (a, b) => labelOf(a.n).localeCompare(labelOf(b.n)), new: (a, b) => (b.n.th.n1 || 0) - (a.n.th.n1 || 0) || b.n.est - a.n.est };
    let findAt = 0;
    function searchList() {
      const raw = $('clSearch').value.trim().slice(0, 80).toLowerCase(), q = sfold(raw), qs = q.replace(/ /g, ''), ul = $('clSearchList'), all = [];
      if (q) for (const n of termNodes) { if (FIND.only && (n.hidden || n.faded)) continue; const [sc, snip] = matchOf(n, q, qs, raw); if (sc) all.push({ n, s: sc, snip }); }
      all.sort(HIT_SORT[FIND.sort]);
      findSet = new Set(FIND.mark ? all.map((h) => h.n.id) : []); setHl();
      findLbl = new Set(FIND.label ? all.filter((h) => h.n.kind === 'term').slice(0, 12).map((h) => h.n.id) : []);
      nodes.forEach((n) => { if (n.el) n.el.classList.toggle('find', findLbl.has(n.id)); });
      const hits = all.slice(0, FIND.max); findAt = 0;
      ul.hidden = !q;
      ul.innerHTML = !q ? '' : `<li class="cl-hh"><span>${fmt(all.length)}</span> <span>${all.length === 1 ? 'match' : 'matches'}</span>${all.length > hits.length ? ` · <span>${hits.length}</span> <span>shown</span>` : ''}</li>`
        + (hits.length ? hits.map((h, i) => `<li class="${i ? '' : 'on'}${h.n.hidden || h.n.faded ? ' out' : ''}"><button type="button" data-id="${esc(h.n.id)}" style="--c:${esc(h.n.color)}"><i></i><span><b>${esc(h.n.label)}</b><em>${esc(h.snip || (clusters[h.n.cluster] || {}).label || '')}</em></span><small>${h.n.kind === 'group' ? 'topic group' : h.n.hidden || h.n.faded ? 'filtered' : '~' + fmt(h.n.est)}</small></button></li>`).join('')
          : '<li class="cl-hh">No topic found. Try fewer letters.</li>');
      return hits.map((h) => h.n);
    }
    const findGo = (n) => { if (!n) return; select(n); $('clSearch').blur(); $('clSearchList').hidden = true; };
    $('clSearch').addEventListener('input', searchList);
    $('clSearch').addEventListener('focus', () => { if ($('clSearch').value.trim()) searchList(); });
    $('clSearch').addEventListener('keydown', (e) => {
      const bs = [...$('clSearchList').querySelectorAll('button[data-id]')];
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && bs.length) {
        e.preventDefault(); findAt = (findAt + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length;
        bs.forEach((b, i) => b.parentElement.classList.toggle('on', i === findAt)); bs[findAt].scrollIntoView({ block: 'nearest' });
      }
      if (e.key === 'Enter') findGo(bs[findAt] ? byId[bs[findAt].dataset.id] : null);
      if (e.key === 'Escape') { e.stopPropagation(); $('clSearch').value = ''; searchList(); }   // clears the search only; the camera stays
    });
    $('clSearchList').addEventListener('click', (e) => { const b = e.target.closest('button[data-id]'); if (b) findGo(byId[b.dataset.id]); });
    $('clSearch').addEventListener('blur', () => setTimeout(() => { $('clSearchList').hidden = true; }, 200));
    // legend: biggest topics with their colour and estimated posts, click to open
    let legAll = false;
    function renderLegendBar() {
      const regional=!!settingsReady && VIEW.regions && arrNext==='Anatomy' && (!SET.only || SET.group==='cluster');
      const headings=$('clLegend').previousElementSibling.children;
      headings[0].textContent=regional?'Brain regions':'Topics';headings[1].textContent=regional?'Topics':'Posts';
      $('clLegMore').hidden=regional;
      if(regional) {
        $('clLegend').innerHTML=regionRows.map(c=>`<button type="button" data-region="${esc(c.id)}" aria-pressed="${SET.group==='cluster' && SET.only===c.id}" style="--c:${c.color}"><i></i><span>${esc(c.label)}</span><small>${c.n}</small></button>`).join('');return;
      }
      const n0 = legAll ? 24 : 8;
      $('clLegend').innerHTML = sorted.filter((n) => !n.hidden).slice(0, n0).map((n) => `<button type="button" data-id="${n.id}" class="${n === selected ? 'on' : ''}" style="--c:${n.color}"><i></i><span>${esc(n.label)}</span><small>${fmt(n.est)}</small></button>`).join('');
      const vis = sorted.filter((n) => !n.hidden).length, extra = Math.min(24, vis) - 8;
      $('clLegMore').hidden = extra <= 0;
      $('clLegMore').textContent = legAll ? (window.ccT ? ccT('fewer') : 'fewer') : `${extra} ${window.ccT ? ccT('more') : 'more'}`;
    }
    $('clLegMore').onclick = () => { legAll = !legAll; renderLegendBar(); };
    // keyboard: arrow keys walk through the topics (biggest first), Enter opens the one in focus (HIG: keyboard alone must work)
    $('clGl').setAttribute('role', 'img');
    $('clGl').setAttribute('aria-label', `Brain: ${sorted.length} topics. Arrow keys move between topics, Enter opens one.`);
    let kbI = -1;
    addEventListener('keydown', (e) => {
      if (!running || e.target.closest?.('input, textarea, select, [contenteditable]') || e.altKey || e.ctrlKey || e.metaKey) return;
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (step) {
        e.preventDefault(); kbI = (kbI + step + sorted.length) % sorted.length; const n = sorted[kbI];
        hover(n); mouseAt = clock(); goal.target.copy(n.pos).applyMatrix4(world.matrixWorld);
        $('clSay').textContent = `${labelOf(n)}, ${fmt(n.est)} posts, ${kbI + 1} of ${sorted.length}`;
      } else if (e.key === 'Enter' && kbI >= 0 && hovered) { e.preventDefault(); select(hovered); }
    });
    $('clLegend').onclick = (e) => { const r=e.target.closest('[data-region]');if(r && chooseRegion) chooseRegion(r.dataset.region);else {const b=e.target.closest('button[data-id]');if(b) select(byId[b.dataset.id]);} };
    renderLegendBar();

    // ---------- arrangements (reference: mindcorpus): the post dots flow out of the brain and gather around their topic.
    // The topics themselves (nodes, links, thread fibres, impulses) travel along, so every arrangement is a graph:
    // hover or click a group like in the brain, the links show which topics are discussed together.
    const ARR = ['Anatomy', 'Spheres', 'Clusters', 'Wheel', 'Table', 'Cycle', 'Ring', 'Galaxy', 'Web', 'Skyline'], arrCache = {}, FACE = new Set(['Clusters', 'Wheel', 'Table', 'Cycle', 'Ring', 'Galaxy', 'Skyline']);
    arrDim = 'cluster';
    stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(); MX = e.clientX - r.left; MY = e.clientY - r.top; }, { passive: true });
    stage.addEventListener('pointerleave', () => { MX = MY = -1e4; });
    let arrCur = 'Anatomy', arrNext = 'Anatomy', arrLabels = [], arrM = 0, spokes = null, spokeSeg = [];
    nodes.forEach((n) => { n.home = n.pos.clone(); n.arr = n.pos.clone(); });
    function layoutOf(name) {
      const cnt = postIds.length, out = new Float32Array(cnt * 3), groups = new Map(), labels = [], at = {}, cy = .1 * BS;
      postIds.forEach((id, i) => { const g = byId[id] ? id : ''; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(i); });
      const dim = name === 'Cycle' ? 'phase' : SET.group, GL = DIMS[dim].list, gOf = DIMS[dim].of;   // Group by (Arrange panel)
      const gIdx = (id) => { const k = GL.findIndex((g) => g.id === gOf(byId[id])); return k < 0 ? GL.length : k; };
      const topics = termNodes.filter((n) => n.kind === 'term' && !n.hidden).map((n) => [n.id, groups.get(n.id) || []])
        .sort((a, b) => gIdx(a[0]) - gIdx(b[0]) || ORDER_FN(a, b));
      const loose = groups.get('') || [], max = Math.max(1, ...topics.map((t) => t[1].length));
      const ball = (idx, c, r) => idx.forEach((i) => { const d = sph(), f = Math.cbrt(Math.random()) * r; out.set([c[0] + d[0] * f, c[1] + d[1] * f, c[2] + d[2] * f], i * 3); });
      const disc = (idx, c, r) => idx.forEach((i) => { const a = Math.random() * Math.PI * 2, f = Math.sqrt(Math.random()) * r; out.set([c[0] + Math.cos(a) * f, c[1] + Math.sin(a) * f, c[2] + gauss() * .06], i * 3); });
      if (name === 'Spheres') {   // one ball per topic on a large shell, neighbours from the same cluster
        topics.forEach(([id, idx], k) => {
          const ph = Math.acos(1 - 2 * (k + .5) / topics.length), th = Math.PI * (1 + Math.sqrt(5)) * k, R = 7.5;
          const c = [R * Math.sin(ph) * Math.cos(th), cy + R * .85 * Math.cos(ph), R * Math.sin(ph) * Math.sin(th)];
          ball(idx, c, .35 + 1.5 * Math.sqrt(idx.length / max)); at[id] = c;
        });
        ball(loose, [0, cy, 0], 2.2);   // posts without a topic: a faint core in the middle
      } else if (name === 'Clusters') {   // nested: one big sphere per cluster in a row, its topics as balls inside
        const cls = GL.map((c) => { const ts = topics.filter(([id]) => gOf(byId[id]) === c.id); return { c, ts, tot: ts.reduce((s, t) => s + t[1].length, 0) }; })
          .filter((g) => g.ts.length).sort((a, b) => b.tot - a.tot);
        const maxTot = Math.max(1, ...cls.map((g) => g.tot), loose.length);
        const rad = (n) => .9 + 2.2 * Math.cbrt(n / maxTot), gap = 1.1;
        const items = [...cls.map((g) => ({ ...g, R: rad(g.tot) })), ...(loose.length ? [{ c: { id: '', label: 'unsorted' }, ts: [], tot: loose.length, R: rad(loose.length) * .8 }] : [])];
        const rows = [[]], maxW = small ? 10 : 21;   // wrap into rows, biggest first
        items.forEach((g) => { const r = rows[rows.length - 1], w = r.reduce((s, o) => s + 2 * o.R + gap, 0); if (r.length && w + 2 * g.R > maxW) rows.push([g]); else r.push(g); });
        const rh = rows.map((r) => 2 * Math.max(...r.map((g) => g.R)) + 1.1);
        let y = cy + rh.reduce((s, h) => s + h, 0) / 2;
        rows.forEach((row, ri) => {
          y -= rh[ri] / 2;
          let x = -(row.reduce((s, g) => s + 2 * g.R, 0) + gap * (row.length - 1)) / 2;
          row.forEach((g) => {
            const C = [x + g.R, y + .3, 0]; x += 2 * g.R + gap;
            if (!g.c.id) ball(loose, C, g.R);
            g.ts.forEach(([id, idx], k) => {   // topic balls fill their cluster by volume
              const m = g.ts.length, ph = Math.acos(1 - 2 * (k + .5) / m), th = Math.PI * (1 + Math.sqrt(5)) * k, d = m === 1 ? 0 : g.R * .58;
              const c = [C[0] + d * Math.sin(ph) * Math.cos(th), C[1] + d * Math.cos(ph), C[2] + d * Math.sin(ph) * Math.sin(th)];
              ball(idx, c, .15 + g.R * .46 * Math.cbrt(idx.length / Math.max(1, g.tot))); at[id] = c;
            });
            labels.push([g.c.label, [C[0], C[1] - g.R - .4, C[2]], 0, g.c.id]);
          });
          y -= rh[ri] / 2;
        });
      } else if (name === 'Ring') {   // the biggest topics evenly on one ring, grouped; the links between them cross it, the rest sits small in the middle
        const top = new Set(topics.slice().sort((a, b) => b[1].length - a[1].length).slice(0, small ? 36 : 56).map((t) => t[0]));
        const ring = topics.filter((t) => top.has(t[0])), rest = topics.filter((t) => !top.has(t[0])), R = 7.2, gA = new Map();
        ring.forEach(([id, idx], k) => {
          const t = Math.PI / 2 - k / ring.length * Math.PI * 2, c = [Math.cos(t) * R, cy + Math.sin(t) * R, 0];
          ball(idx, c, .14 + .55 * Math.sqrt(idx.length / max)); at[id] = c;
          const gk = gOf(byId[id]); gA.set(gk, [...(gA.get(gk) || []), t]);
        });
        rest.forEach(([id, idx], k) => { const ph = k * 2.39996, r = 2.4 * Math.sqrt((k + .5) / rest.length), c = [Math.cos(ph) * r, cy + Math.sin(ph) * r, -.5]; ball(idx, c, .08 + .2 * Math.sqrt(idx.length / max)); at[id] = c; });
        ball(loose, [0, cy, -2], 1);
        gA.forEach((ts, gk) => { const g = GL.find((x) => x.id === gk); if (g && ts.length > 1) { const m = (ts[0] + ts[ts.length - 1]) / 2; labels.push([g.label, [Math.cos(m) * (R + 1.9), cy + Math.sin(m) * (R + 1.9), 0], 0, g.id]); } });
      } else if (name === 'Wheel') {   // one petal per topic (length by its posts), clusters side by side with a gap; the topics sit on the inner ring, links cross it as chords
        const share = topics.map(([, idx]) => .35 + Math.sqrt(idx.length / max)), CG = .5;
        const breaks = topics.filter((t, k) => k && gOf(byId[t[0]]) !== gOf(byId[topics[k - 1][0]])).length + 1, gA = new Map();
        const unit = (Math.PI * 2 - breaks * CG * .25) / share.reduce((s, v) => s + v, 0), r0 = 3.1, r1 = 8.8;
        let a = Math.PI / 2;
        topics.forEach(([id, idx], k) => {
          if (k && gOf(byId[id]) !== gOf(byId[topics[k - 1][0]])) a += CG * .25;
          const w = share[k] * unit, mid = a + w / 2, len = (r1 - r0) * (.3 + .7 * Math.sqrt(idx.length / max));
          const gk = gOf(byId[id]); gA.set(gk, [gA.has(gk) ? gA.get(gk)[0] : a, a + w]);
          idx.forEach((i) => { const f = Math.pow(Math.random(), .7), t = mid + gauss() * w * .2 * (1 - .5 * f), r = r0 + .15 + f * len; out.set([Math.cos(t) * r, cy + Math.sin(t) * r, gauss() * .05], i * 3); });
          at[id] = [Math.cos(mid) * (r0 - .3), cy + Math.sin(mid) * (r0 - .3), 0]; a += w;
        });
        loose.forEach((i) => { const t = Math.random() * Math.PI * 2, r = 9.4 + Math.random() * .35; out.set([Math.cos(t) * r, cy + Math.sin(t) * r, gauss() * .05], i * 3); });
        gA.forEach(([a0, a1], gk) => { const g = GL.find((x) => x.id === gk); if (g && a1 - a0 > .05) { const m = (a0 + a1) / 2; labels.push([g.label, [Math.cos(m) * 10.3, cy + Math.sin(m) * 10.3, 0], 0, g.id]); } });   // group names around the wheel
      } else if (name === 'Cycle') {   // a cycle as a ring: blast, on-cycle care, bloodwork, PCT, cruise & TRT; peptides and goals sit in the middle (any time)
        const ring = GL.filter((g) => g.id !== 'anytime'), mid = topics.filter(([id]) => gOf(byId[id]) === 'anytime');
        const per = ring.map((g) => topics.filter(([id]) => gOf(byId[id]) === g.id)), sum = (ts) => ts.reduce((v, t) => v + t[1].length, 0);
        const big = Math.max(1, ...per.map(sum)), wts = per.map((ts) => (ts.length ? .55 + Math.sqrt(sum(ts) / big) : .25));
        const gap = .14, unit = (Math.PI * 2 - gap * ring.length) / wts.reduce((v, w) => v + w, 0), R = 6.4;
        let a = Math.PI / 2;
        ring.forEach((g, gi) => {
          const span = wts[gi] * unit, ts = per[gi];
          ts.forEach(([id, idx], k) => {   // along its arc, the big topics first; smaller ones on lanes in and out of the ring
            const t = a - span * (k + .5) / ts.length, lane = ts.length > 4 ? (k % 3) - 1 : 0, r = R + lane * 1.05;
            const c = [Math.cos(t) * r, cy + Math.sin(t) * r, 0]; ball(idx, c, .18 + .8 * Math.sqrt(idx.length / max)); at[id] = c;
          });
          const m = a - span / 2; labels.push([g.label, [Math.cos(m) * (R + 2.7), cy + Math.sin(m) * (R + 2.7), 0], 0, g.id]);
          a -= span + gap;
        });
        mid.forEach(([id, idx], k) => { const ph = k * 2.39996, r = 2.7 * Math.sqrt((k + .5) / mid.length), c = [Math.cos(ph) * r, cy + Math.sin(ph) * r, 0]; ball(idx, c, .14 + .55 * Math.sqrt(idx.length / max)); at[id] = c; });
        const any = GL.find((g) => g.id === 'anytime'); if (mid.length && any) labels.push([any.label, [0, cy - 3.4, 0], 0, any.id]);
        ball(loose, [0, cy, -3], 1.4);
      } else if (name === 'Galaxy') {   // one spiral arm per group, its biggest topics near the core; the disc is tilted so it reads while it turns
        const arms = GL.map((g) => topics.filter(([id]) => gOf(byId[id]) === g.id)).filter((ts) => ts.length), G = arms.length || 1, tilt = (x, y) => [x, cy + y * .8, y * .6];   // faces the camera, leaning back a little
        arms.forEach((ts, gi) => {
          ts.forEach(([id, idx], k) => {
            const r = 1.1 + 7.6 * Math.sqrt((k + .5) / ts.length), t = gi / G * Math.PI * 2 + r * .42 + gauss() * .05;
            const c = tilt(Math.cos(t) * r, Math.sin(t) * r); c[1] += gauss() * .12;
            ball(idx, c, .07 + .38 * Math.sqrt(idx.length / max)); at[id] = c;
          });
          const g = GL.find((x) => x.id === gOf(byId[ts[0][0]])), t = gi / G * Math.PI * 2 + 9.6 * .42;
          if (g) labels.push([g.label, tilt(Math.cos(t) * 9.9, Math.sin(t) * 9.9), 0, g.id]);
        });
        loose.forEach((i) => { const r = Math.pow(Math.random(), .6) * 9, t = Math.random() * Math.PI * 2, c = tilt(Math.cos(t) * r, Math.sin(t) * r); out.set([c[0], c[1] + gauss() * .15, c[2]], i * 3); });   // dust between the arms
      } else if (name === 'Web') {   // topics pulled together by how often they come up in the same notes, pushed apart otherwise
        const ids = topics.map((t) => t[0]), ix = new Map(ids.map((id, k) => [id, k])), N = ids.length, P = new Float64Array(N * 3), F = new Float64Array(N * 3);
        ids.forEach((id, k) => { const h = byId[id].home; P.set([h.x * .6, (h.y - cy) * .6, h.z * .6], k * 3); });   // start from the brain: same picture every time
        const L = (D.pairs || []).filter(([a, b, w]) => w > 0 && ix.has(a) && ix.has(b)).map(([a, b, w]) => [ix.get(a), ix.get(b), Math.log1p(w)]);
        const wmax = Math.max(1, ...L.map((l) => l[2]));
        const ITS = Math.max(40, Math.min(160, Math.round(2.4e7 / (N * N)))), COOL = Math.pow(.0175, 1 / ITS);   // big catalogs: fewer rounds, the switch stays under ~150 ms
        for (let it = 0, T = 1; it < ITS; it++, T *= COOL) {   // force layout; the step shrinks so it settles
          F.fill(0);
          for (let a = 0; a < N; a++) for (let b = a + 1; b < N; b++) {
            const dx = P[a * 3] - P[b * 3], dy = P[a * 3 + 1] - P[b * 3 + 1], dz = P[a * 3 + 2] - P[b * 3 + 2], f = .12 / (dx * dx + dy * dy + dz * dz + .02);
            F[a * 3] += dx * f; F[a * 3 + 1] += dy * f; F[a * 3 + 2] += dz * f; F[b * 3] -= dx * f; F[b * 3 + 1] -= dy * f; F[b * 3 + 2] -= dz * f;
          }
          for (const [a, b, w] of L) { const dx = P[b * 3] - P[a * 3], dy = P[b * 3 + 1] - P[a * 3 + 1], dz = P[b * 3 + 2] - P[a * 3 + 2], d = Math.hypot(dx, dy, dz), f = .5 * d * w / wmax; F[a * 3] += dx * f; F[a * 3 + 1] += dy * f; F[a * 3 + 2] += dz * f; F[b * 3] -= dx * f; F[b * 3 + 1] -= dy * f; F[b * 3 + 2] -= dz * f; }
          for (let k = 0; k < N; k++) {
            const o = k * 3, r = Math.hypot(P[o], P[o + 1], P[o + 2]); for (let j = 0; j < 3; j++) F[o + j] -= P[o + j] * .08 * r;   // pull to the middle, stronger far out
            const m = Math.hypot(F[o], F[o + 1], F[o + 2]), st = m > T * .5 ? T * .5 / m : 1; for (let j = 0; j < 3; j++) P[o + j] += F[o + j] * st;   // length-limited step: no box corners
          }
        }
        let R = 1; for (let k = 0; k < N; k++) R = Math.max(R, Math.hypot(P[k * 3], P[k * 3 + 1], P[k * 3 + 2]));
        const sc = 8 / R, gc = new Map();
        topics.forEach(([id, idx], k) => {
          const c = [P[k * 3] * sc, cy + P[k * 3 + 1] * sc * .8, P[k * 3 + 2] * sc]; ball(idx, c, .1 + .6 * Math.sqrt(idx.length / max)); at[id] = c;
          const g = gOf(byId[id]), s0 = gc.get(g) || [0, 0, 0, 0]; gc.set(g, [s0[0] + c[0] * idx.length, s0[1] + c[1] * idx.length, s0[2] + c[2] * idx.length, s0[3] + idx.length]);
        });
        gc.forEach(([x, y, z, w], gk) => { const g = GL.find((q) => q.id === gk); if (g && w) labels.push([g.label, [x / w, y / w + 1.2, z / w], 0, g.id]); });
        ball(loose, [0, cy, 0], 1.2);
      } else if (name === 'Skyline') {   // a city: every topic a tower as high as its posts, one district per group
        const y0 = cy - 5, rows = GL.map((g) => ({ g, ts: topics.filter(([id]) => gOf(byId[id]) === g.id) })).filter((r) => r.ts.length), W0 = 24, sp = .62;
        const depth = rows.reduce((s, r) => s + Math.ceil(r.ts.length / W0) * .72 + .9, 0);
        let z = depth / 2;
        rows.forEach((r) => {
          labels.push([r.g.label, [-W0 * sp / 2 - .6, y0 + (depth / 2 - z) * .42, z - .3], 1, r.g.id]);
          r.ts.forEach(([id, idx], k) => {
            const x = -W0 * sp / 2 + (k % W0) * sp, zz = z - Math.floor(k / W0) * .72, h = .25 + 5.2 * Math.sqrt(idx.length / max), w = .1 + .13 * Math.sqrt(idx.length / max), yb = y0 + (depth / 2 - zz) * .42;   // rows further back stand higher, like a grandstand
            idx.forEach((i) => out.set([x + (Math.random() - .5) * 2 * w, yb + Math.pow(Math.random(), .8) * h, zz + (Math.random() - .5) * 2 * w], i * 3));
            at[id] = [x, yb + h + .25, zz];
          });
          z -= Math.ceil(r.ts.length / W0) * .72 + .9;
        });
        loose.forEach((i) => { const zz = (Math.random() - .5) * (depth + 1); out.set([(Math.random() - .5) * (W0 * sp + 2), y0 - .1 + (depth / 2 - zz) * .42, zz], i * 3); });   // the ground
      } else {   // table: one row per group, its topics as discs from big (left) to small
        const rows = GL.map((c) => ({ c, ts: topics.filter(([id]) => gOf(byId[id]) === c.id) })).filter((r) => r.ts.length);
        if (loose.length) rows.push({ c: { id: '', label: 'unsorted' }, ts: [['', loose]] });
        const rOf = (n) => .22 + .95 * Math.sqrt(n / max), X1 = 7;
        rows.forEach((row) => {   // break a long row into lines, each line as tall as its biggest disc
          row.lines = [[]]; let x = -7;
          row.ts.forEach((t) => { const d = 2 * rOf(t[1].length); if (x + d > X1 && row.lines.at(-1).length) { row.lines.push([]); x = -7; } row.lines.at(-1).push(t); x += d + .35; });
          row.hs = row.lines.map((l) => 2 * Math.max(...l.map((t) => rOf(t[1].length))) + .35);
        });
        let y = cy + rows.reduce((s, r) => s + r.hs.reduce((a, h) => a + h, 0) + .4, 0) / 2;
        rows.forEach((row) => {
          labels.push([row.c.label, [-7.4, y - row.hs[0] / 2, 0], 1, row.c.id]);
          row.lines.forEach((l, li) => {
            y -= row.hs[li] / 2; let x = -7;
            l.forEach(([id, idx]) => { const r = rOf(idx.length), c = [x + r, y, 0]; disc(idx, c, r); if (id) at[id] = c; x += 2 * r + .35; });
            y -= row.hs[li] / 2;
          });
          y -= .4;
        });
      }
      return { out, labels, at, dim };
    }
    function makeArrLabels(list) {
      arrLabels.forEach((L) => L.el.remove());
      arrLabels = list.map(([text, p, right, g]) => {
        const el = document.createElement('div'); el.className = 'cl-lbl cl-albl'; el.textContent = text;
        labelBox.appendChild(el); return { el, pos: new THREE.Vector3(...p), right, g, w: 0 };
      });
    }
    // spokes: every topic reaches out to a sample of its own posts, so a group reads as one connected thing
    function makeSpokes(out) {
      if (spokes) { world.remove(spokes); spokes.geometry.dispose(); }
      const per = new Map(); spokeSeg = [];
      postIds.forEach((id, i) => { const n = byId[id]; if (!n || n.kind !== 'term') return; const c = per.get(n) || 0; if (c < 26 && Math.random() < .5) { per.set(n, c + 1); spokeSeg.push([n, i]); } });
      const P = new Float32Array(spokeSeg.length * 6), C = new Float32Array(spokeSeg.length * 6), A = new Float32Array(spokeSeg.length * 2);
      spokeSeg.forEach(([n, i], j) => { const c = col(n.color); P.set([n.arr.x, n.arr.y, n.arr.z, out[i * 3], out[i * 3 + 1], out[i * 3 + 2]], j * 6); C.set([c.r, c.g, c.b, c.r, c.g, c.b], j * 6); });
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aColor', new THREE.BufferAttribute(C, 3)); g.setAttribute('aAlpha', new THREE.BufferAttribute(A, 1));
      spokes = new THREE.LineSegments(g, lines.material); spokes.frustumCulled = false; world.add(spokes);
    }
    // Structural diagnostics expose counts only, never content or account data.
    const graphDegree = new Map(nodes.map((n) => [n.id, 0]));
    edges.forEach((e) => { graphDegree.set(e.a.id, graphDegree.get(e.a.id) + 1); graphDegree.set(e.b.id, graphDegree.get(e.b.id) + 1); });
    Object.assign($('clGl').dataset, { topicNodes: String(terms.length), subjectGroups: String(groups.length),
      isolatedTopics: String(terms.filter(([id]) => !graphDegree.get(id)).length), threadFibres: String(fibres.length), threadDirection: 'outward', threadsAlwaysVisible: 'false' });
    const KEEP = new Set([dataDots, nodePts, lines, fibreLines, tips, pulses]);
    function moveGraph(m) {   // topics, links and thread fibres between their place in the brain (0) and in the arrangement (1)
      nodes.forEach((n, i) => {
        n.pos.lerpVectors(n.home, n.arr, m); npos.set([n.pos.x, n.pos.y, n.pos.z], i * 3);
        if (n.kind === 'thought') nsize[i] = .16 * (1 - m);   // the thought path stays behind with the body
      });
      ng.attributes.position.needsUpdate = true; ng.attributes.aSize.needsUpdate = true;
      bowK = 1 - m; writeEdges(); lg.attributes.position.needsUpdate = true;
      writeFibres();
      fg.attributes.position.needsUpdate = true; tg.attributes.position.needsUpdate = true;
    }
    function stepArr(dt) {
      if (!dataDots) return;
      const tgt = arrNext !== 'Anatomy' && arrCur === arrNext ? arrBlend : 0;   // the Arrange slider sets how far the data leaves the brain
      U.uMorph.value += (tgt - U.uMorph.value) * Math.min(1, dt * 2.4);
      if (Math.abs(U.uMorph.value - tgt) < .004) U.uMorph.value = tgt;
      if (U.uMorph.value === 0 && arrCur !== arrNext) {   // back in the brain: now flow out into the next arrangement
        arrCur = arrNext;
        if (arrCur !== 'Anatomy') {
          const L = arrCache[arrCur] || (arrCache[arrCur] = layoutOf(arrCur));
          let tf = (x, y, z) => [x, y, z];
          if (FACE.has(arrCur)) {   // row, wheel and table have a front: turn it towards the camera
            const d = nrm3([camera.position.x - cam.target.x, 0, camera.position.z - cam.target.z]), r = nrm3(crs3([0, 1, 0], d));
            tf = (x, y, z) => [r[0] * x + d[0] * z, y, r[2] * x + d[2] * z];
          }
          const out = new Float32Array(L.out.length);
          for (let i = 0; i < out.length; i += 3) out.set(tf(L.out[i], L.out[i + 1], L.out[i + 2]), i);
          nodes.forEach((n) => { const p = L.at[n.id]; if (p) n.arr.set(...tf(...p)); else n.arr.copy(n.home); });
          groups.forEach((n) => { n.arr.set(0, 0, 0); n.members.forEach((m) => n.arr.add(m.arr)); n.arr.multiplyScalar(1 / n.members.length); });
          if (arrCur === 'Ring') { const C = new THREE.Vector3(0, .1 * BS, 0); groups.forEach((n) => { const v = n.arr.clone().sub(C); if (v.length() > .01) n.arr.copy(C).add(v.setLength(5.6)); }); }   // subject names along the inner rim, not piled up in the middle
          dataDots.geometry.attributes.aPos2.array.set(out); dataDots.geometry.attributes.aPos2.needsUpdate = true;
          arrDim = L.dim; makeArrLabels(L.labels.map(([t, p, right, g]) => [t, tf(...p), right, g])); makeSpokes(out);
          selected = null; selSet = new Set(); setHl(); renderSide(null);
          let ex = 1, ey = 1, ez = 0;   // fit the whole arrangement into the stage
          for (let i = 0; i < L.out.length; i += 3) { ex = Math.max(ex, Math.abs(L.out[i])); ey = Math.max(ey, Math.abs(L.out[i + 1] - .1 * BS)); ez = Math.max(ez, Math.abs(L.out[i + 2])); }
          const tn = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), left = ($('clStack') && $('clStack').offsetWidth) ? $('clStack').offsetWidth + 30 : 0, wu = Math.max(.4, (W - left) / W);
          goal.radius = THREE.MathUtils.clamp(Math.max(ex * 1.2 / (tn * camera.aspect * wu), (ey + .6) * 1.3 / tn) + ez, 8, 44);
          const rv = nrm3(crs3([0, 1, 0], [camera.position.x - cam.target.x, 0, camera.position.z - cam.target.z])), sh = left / 2 * 2 * goal.radius * tn / H;   // keep it clear of the log stack on the left
          goal.target.set(0, .1 * BS, 0).applyMatrix4(world.matrixWorld).add(new THREE.Vector3(-rv[0] * sh, 0, -rv[2] * sh));
        } else { makeArrLabels([]); if (spokes) { world.remove(spokes); spokes = null; } overview(); }
      }
      const m = arrCur === 'Anatomy' ? 0 : THREE.MathUtils.smoothstep(U.uMorph.value, .05, .9);
      if (m !== arrM) { arrM = m; moveGraph(m); }
      const on = arrCur !== 'Anatomy' || U.uMorph.value > .001;
      for (const o of world.children) {   // the body fades out of the way while the data has its own shape; the graph stays
        if (KEEP.has(o) || o === spokes) continue;
        if (on) { if (o.userData.vis === undefined) o.userData.vis = o.visible; o.visible = false; }
        else if (o.userData.vis !== undefined) { o.visible = o.userData.vis; delete o.userData.vis; }
      }
      lines.visible = VIEW.links;
      if (spokes) {
        const A = spokes.geometry.attributes.aAlpha.array;
        spokeSeg.forEach(([n], j) => { const w = n === hovered ? .5 : n === selected ? .32 : (hovered || selected) ? (hovSet.has(n.id) || selSet.has(n.id) ? .08 : .015) : .045; A[j * 2] = w * m; A[j * 2 + 1] = w * m * .25; });
        spokes.geometry.attributes.aAlpha.needsUpdate = true; spokes.visible = VIEW.links;
      }
      labelBox.classList.toggle('arr', on);
    }
    function placeArr() {
      const act = hovered || selected, d = typeof DIMS !== 'undefined' && DIMS[arrDim];
      const actG = act && act.kind === 'term' && d ? d.of(act) : null, boxes = [];
      for (const L of arrLabels) {
        tmp.copy(L.pos).applyMatrix4(world.matrixWorld).project(camera);
        if (tmp.z > 1) { L.el.style.opacity = 0; continue; }
        const x = (tmp.x + 1) / 2 * W, y = (1 - tmp.y) / 2 * H;
        if (!L.w) L.w = L.el.offsetWidth || L.el.textContent.length * 7;
        const x0 = L.right ? x - L.w : x - L.w / 2, y0 = y - 8, x1 = x0 + L.w, y1 = y + 8;
        const on = !!actG && L.g === actG, near = Math.hypot(MX - x, MY - y) < 130;
        const hit = boxes.some((b) => x0 < b[2] && x1 > b[0] && y0 < b[3] && y1 > b[1]);
        const o = on ? 1 : near ? .85 : hit ? 0 : act ? .22 : .4;
        if (o > 0) boxes.push([x0 - 8, y0 - 4, x1 + 8, y1 + 4]);
        L.el.style.opacity = (U.uMorph.value * o).toFixed(2); L.el.classList.toggle('on', on);
        L.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(${L.right ? '-100%' : '-50%'}, -50%)`;
      }
    }
    let arrForm = 'Spheres', arrBlend = 1;
    const syncArr = () => { arrNext = arrBlend > .01 ? arrForm : 'Anatomy';
      $('clArr').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.a === (arrNext === 'Anatomy' ? 'Anatomy' : arrForm))); renderSettings(); };
    const setArr = (name) => { if (name === 'Anatomy') arrBlend = 0; else { arrForm = name; if (arrBlend <= .01) arrBlend = 1; } syncArr(); };
    $('clArr').innerHTML = ARR.map((a) => `<button type="button" data-a="${a}">${a === 'Clusters' ? 'Groups' : a === 'Ring' ? 'Combined' : a}</button>`).join('');
    $('clArr').onclick = (e) => { const b = e.target.closest('button[data-a]'); if (b) setArr(b.dataset.a); };
    arrBlend = 0; syncArr();
    // ---------- view presets (View, Camera): camera and shape in one click ----------
    const VPRE = [['Brain close-up', { framing: 'brain', angle: 'quarter', fov: 42 }, 'Anatomy'], ["Bird's eye", { framing: 'brain', angle: 'above', fov: 42 }, 'Anatomy'],
      ['Looking up', { framing: 'upper', angle: 'below', fov: 50 }, 'Anatomy'], ['Portrait', { framing: 'upper', angle: 'front', fov: 32 }, 'Anatomy'], ['Whole body', { framing: 'whole', angle: 'front', fov: 42 }, 'Anatomy'],
      ['Galaxy', { fov: 42 }, 'Galaxy'], ['Network', { fov: 50, links: true }, 'Web'], ['City', { fov: 42 }, 'Skyline'], ['Phases', { fov: 42 }, 'Cycle']];
    $('clVPre').innerHTML = VPRE.map(([n], i) => `<button type="button" data-i="${i}">${esc(n)}</button>`).join('');
    $('clVPre').onclick = (e) => {
      const b = e.target.closest('[data-i]'); if (!b) return; const [, v, shape] = VPRE[+b.dataset.i];
      Object.assign(VIEW, v);
      if (v.angle) { VIEW.turn = v.angle === 'quarter' && !reduced; world.rotation.set(0, 0, 0); world.position.y = 0; }
      setArr(shape); applyView(); overview();
    };
    if (window.__cc) window.__cc.arr = setArr;

    // ---------- our own settings (Arrange panel): group, colour, size and filter the topics by what they mean in a cycle ----------
    // Compound family, body system and cycle phase come from the topic's name (fixed domain rules, the cluster as fallback).
    // Everything is kept per browser.
    var settingsReady = false;
    var ORDER_FN = (a, b) => (SET.order === 'az' ? byId[a[0]].label.localeCompare(byId[b[0]].label)
      : SET.order === 'new' ? ((byId[b[0]].th.n1 || 0) - (byId[a[0]].th.n1 || 0)) || b[1].length - a[1].length
      : SET.order === 'quality' ? thq(byId[b[0]]) - thq(byId[a[0]]) || b[1].length - a[1].length
      : SET.order === 'certain' ? certainty(byId[b[0]]) - certainty(byId[a[0]]) || b[1].length - a[1].length : b[1].length - a[1].length);
    const FAMILY = [
      ['androgens', 'Androgens', '#5eead4'], ['nor19', '19-nor', '#7dd3fc'], ['dht', 'DHT derivatives', '#c4b5fd'], ['orals', 'Orals', '#f5b84b'],
      ['sarms', 'SARMs & prohormones', '#f0abfc'], ['handling', 'Esters & injection', '#94a3b8'], ['peptides', 'GH & peptides', '#fde68a'],
      ['glp1', 'Fat loss & GLP-1', '#86efac'], ['ancillary', 'Ancillaries & PCT', '#f5b8c4'], ['markers', 'Labs & physiology', '#f2727f'],
      ['meds', 'Medication', '#fca5a5'], ['conditions', 'Health conditions', '#fb923c'], ['sides', 'Side effects', '#ece6da'],
      ['supplements', 'Supplements', '#bef264'], ['nutrition', 'Diet & body fat', '#fcd34d'], ['training', 'Training & physique', '#67e8f9'],
      ['recreational', 'Recreational drugs', '#a78bfa'], ['otherc', 'Other compounds', '#8a979e']];
    const SYSTEM = [
      ['hormones', 'Hormone axis', '#f5b8c4'], ['sexual', 'Sex drive & fertility', '#f0abfc'], ['heart', 'Heart & blood', '#f2727f'], ['liver', 'Liver', '#f5b84b'],
      ['kidney', 'Kidneys', '#fdba74'], ['metabolism', 'Metabolism & weight', '#86efac'], ['muscle', 'Muscle & joints', '#7dd3fc'], ['skin', 'Skin & hair', '#c4b5fd'],
      ['mind', 'Sleep & mind', '#a5b4fc'], ['general', 'General', '#8a979e']];
    const PHASE = [
      ['blast', 'Blast', '#5eead4'], ['care', 'On-cycle care', '#f5b8c4'], ['labs', 'Bloodwork & health', '#f2727f'], ['pct', 'PCT', '#f5b84b'],
      ['cruise', 'Cruise & TRT', '#7dd3fc'], ['anytime', 'Any time: peptides, diet, training', '#ece6da']];
    const ORIGIN = [['core', 'Core list', '#5eead4'], ['auto', 'Found by the crawler', '#f5b84b']];
    const RX = (a) => a.map(([k, r]) => [k, new RegExp(r)]);
    // first match wins: specific families before the broad ones (an ester before its compound, a side effect before a body part)
    const FAM_RX = RX([
      ['recreational', 'amphet|cocaine|marijuana|cannabis|nicotine|alcohol|mdma|opioid|kratom'],
      ['handling', '\\bester\\b|half.?life|bacterio|solvent|intramuscular|injection|synthol|\\bpip\\b|needle|syringe'],
      ['sides', 'gyno|trensomnia|insomn|acne|hair ?loss|hairloss|alopec|scalp|water retention|bloat|\\bmood|depress|anxiet|irritab|aggress|nightmare|drows|erectile|libido|voice|dizz|flu.?like|withdraw|cramp|tend[io]n|palpit|edema|sweat|^sleep\\b'],
      ['glp1', 'sema|tirz|retat|glp|ozemp|mounjaro|liraglut|cagri|orforglip|clen|cardarine|gw.?501516|\\bt3\\b|cytomel|liothyron|tiromel|\\bdnp\\b|dinitro|yohimb|ephedr|albuterol|ketotif|thermogen'],
      ['sarms', 'sarm|ostarine|rad.?140|testolone|yk.?11|lgd|ligandrol|andarine|epistane|prohormone|4.?andro|\\bm1t\\b|methyl.?1|superdrol|methasterone'],
      ['meds', 'telmis|metformin|propranolol|lisinopril|statin|ssri|paroxet|valpro|predniso|cortison|diphenhyd|benadryl|pepcid|famotid|\\btums\\b|levothyrox|antihist|beta.?block|metoprolol|amlodip'],
      ['conditions', 'hypertens|diabet|hypoglyc|hypothyr|hypogonad|hernia|fracture|tumou?r|cancer|shingles|pneumon|allerg|immune|constipat|carpal|cataract|dehydrat|jaundice|hepatotox|neuropath|migraine|mania|snor|cpap|apnea|bruis|hematoma|puberty|menopaus|infection'],
      ['markers', 'estradiol|\\be2\\b|estrogen|oestrogen|prolact|shbg|\\blh\\b|\\bfsh\\b|hematocrit|hemoglob|lipid|hdl|ldl|cholest|triglyc|liver|kidney|creatinin|egfr|bloodwork|\\blabs?\\b|pressure|\\bpsa\\b|thyro|\\btsh\\b|ferritin|glucose|glycemic|a1c|pituitar|gonadotropin|leydig|testic|hpta|hypothalam|aromatase|cortisol|progesterone|prostat|plasma|bloodstream|albumin|platelet|sodium|potassium|chloride|electrolyt|molecule|trough|white blood|ultrasound|donat|\\bdht\\b|dihydrotest'],
      ['ancillary', 'hcg|clomi|nolva|tamox|enclom|ralox|toremif|arimidex|anastr|aromasin|exemest|letro|caber|prami|dostinex|\\bpct|serm|cialis|tadalaf|finast|dutast|ru58841|minox|accutane|isotret|ovitrelle|pregnyl|gonadorel|triptorel'],
      ['supplements', 'vitamin|multivit|taurine|berberine|turmeric|curcumin|bcaa|branched|glutamine|carnitine|\\bmaca\\b|chromium|coenzyme|coq10|vanadyl|citrulline|glutathione|probiotic|omega|iodine|glucosamine|aspartic|arginine|inositol|creatine\\b|dandelion|tudca|ursodeox|\\bnac\\b|zinc|magnesium|ashwagandha|tongkat|\\bgaba\\b'],
      ['peptides', 'hgh|somatrop|omnitrope|peptide|bpc|tb.?500|ipamor|cjc|ghrp|mk.?677|igf|tesamor|sermor|hexarel|ghk|melanotan|pt.?141|epital|thymos|selank|semax|aod|insulin|humulin|humalog|novorapid'],
      ['nor19', 'tren|nandrol|deca|npp|19.?nor|mibolerone|trestolone'],
      ['orals', 'dbol|dianabol|anadrol|oxymeth|anavar|oxandr|winstrol|stanoz|turinabol|tbol|halotest|methyltest|\\borals?\\b'],
      ['dht', 'masteron|drostan|primo|methenol|proviron|mesterol|dhb|1.?test'],
      ['androgens', 'testost|\\btrt|cruise|enanth|cypion|propion|sustanon|bolden|equipoise|\\btest\\b|t400|androgen\\b'],
      ['nutrition', 'calor|diet|keto|food|nutri|couscous|quinoa|shrimp|berr|mushroom|flax|grapefruit|protein|carb|energy expenditure|\\btdee|meal|fasting|intra.?workout|body ?fat|visceral|adipose|recomp|obes|dexa|bod ?pod|skinfold|caliper|^cut\\b|^bulk\\b|weight ?loss|waist|hydration|catabol'],
      ['training', 'train|deadlift|amap|amrap|hiit|interval|plateau|drop ?set|snatch|face ?pull|\\brow\\b|slingshot|calisth|tabata|rest.?pause|full.?body|body ?part|bike|airdyne|explosiv|overtrain|muscle|deltoid|pectoral|vastus|erector|adductor|collarbone|\\bshins?\\b|posture|hypertroph|hyperplas|density|sauna']]);
    const SYS_RX = RX([
      ['liver', 'liver|\\balt\\b|\\bast\\b|bilirub|ggt|hepat|tudca|ursodeox|jaundice'],
      ['kidney', 'kidney|creatinin|egfr|cystatin|\\bbun\\b|renal|urea'],
      ['heart', 'lipid|hdl|ldl|cholest|pressure|hypertens|hematocrit|hct|hemoglobin(?! a1c)|\\brbc|cardio|heart|palpit|apob|triglyc|platelet|circulat|electrol|sodium|potass|chloride|bruis|hematoma|telmis|lisinopril|propranolol|statin|metoprolol|amlodip|edema|donat|dizz|water retention|bloat|plasma|bloodstream'],
      ['skin', 'acne|hair|alopec|scalp|finast|minox|\\bskin\\b|dutast|ru58841|isotret|accutane'],
      ['sexual', 'libido|erectile|erection|tadalaf|cialis|viagra|sildenaf|pt.?141|bremelan|fertil|sperm|testicle|leydig|ovitrelle|pregnyl|\\bhcg|prostat'],
      ['mind', 'sleep|insomn|somnia|mood|anxiet|depress|aggress|irritab|mania|migraine|neuro|snor|nightmare|drows|cpap|apnea|nerv|ssri|paroxet|valpro|seroton|withdraw|amphet|cocaine|marijuana|cannabis|nicotine|alcohol|\\bgaba\\b|benadryl|diphenhyd'],
      ['metabolism', 'insulin|humulin|humalog|novorapid|glucose|glyc|a1c|diabet|metformin|thyro|liothyron|tiromel|\\bt3\\b|\\bt4\\b|\\btsh\\b|^cut\\b|^bulk\\b|diet|calor|\\bfat\\b|body ?fat|weight|recomp|glp|sema|tirz|retat|metabol|compos|dexa|bod ?pod|food|nutri|keto|hydration|obes|visceral|adipose|berberine|chromium|vanadyl|carnitine|clen|cardarine|yohimb|albuterol|ketotif|dinitro|\\bdnp\\b|thermogen'],
      ['muscle', 'bpc|tb.?500|tendon|tendin|joint|injur|heal|hypertroph|muscle|strength|train|deltoid|pector|recover|overtrain|movement|calisth|cramp|intramuscular|creatine\\b|glutamine|citrulline|arginine|bcaa|branched|glucosamine|igf|hgh|somatrop|mk.?677|ghrp|ipamor|cjc|fracture|carpal'],
      ['hormones', 'estr|\\be2\\b|prolact|testost|\\btrt|\\bpct|\\blh\\b|fsh|shbg|clomi|nolva|arimidex|aromasin|anastr|exemest|letro|caber|prami|gyno|cruise|hormon|pituitar|gonado|hypothalam|hpta|cortisol|progesterone|androgen|\\bdht\\b|dihydrotest|voice|puberty|menopaus|hypogonad']]);
    const COMPOUND = new Set(['androgens', 'nor19', 'dht', 'orals', 'sarms', 'otherc']);
    const textOf = (n) => (n.id + ' ' + n.label).toLowerCase();
    const famOf = (n) => n._fam || (n._fam = (() => {
      const t = n.label.toLowerCase(), t2 = textOf(n);   // the name decides; the id only as a second chance
      for (const [k, r] of FAM_RX) if (r.test(t)) return k;
      for (const [k, r] of FAM_RX) if (r.test(t2)) return k;
      return { base: 'androgens', anabolic: 'otherc', estrogen: 'ancillary', blood: 'markers', peptide: 'peptides', goals: 'sides' }[n.cluster] || 'sides';
    })());
    const sysMatch = (n) => { const t = n.label.toLowerCase(), t2 = textOf(n); for (const [k, r] of SYS_RX) if (r.test(t)) return k; for (const [k, r] of SYS_RX) if (r.test(t2)) return k; return ''; };
    const sysOf = (n) => n._sys || (n._sys = (() => {
      const f = famOf(n);
      // compounds sit where they hit the body hardest: orals on the liver, DHT derivatives on skin & hair, the rest on the hormone axis
      if (COMPOUND.has(f)) return f === 'orals' ? 'liver' : f === 'dht' ? 'skin' : 'hormones';
      return sysMatch(n) || ({ glp1: 'metabolism', peptides: 'muscle', ancillary: 'hormones', markers: 'general', nutrition: 'metabolism', training: 'muscle', recreational: 'mind', handling: 'muscle' }[f] || 'general');
    })());
    const phaseOf = (n) => {
      const f = famOf(n), t = textOf(n);
      if (f === 'ancillary') return /hcg|clomi|nolva|tamox|enclom|ralox|toremif|ovitrelle|pregnyl|gonadorel|triptorel|\bpct/.test(t) ? 'pct' : 'care';
      if (/\btrt|cruise/.test(t)) return 'cruise';
      if (COMPOUND.has(f) || f === 'handling') return 'blast';
      if (f === 'markers' || f === 'conditions') return 'labs';
      if (f === 'sides' || f === 'meds') return 'care';
      if (f === 'supplements') return ['liver', 'kidney', 'heart'].includes(sysMatch(n)) ? 'care' : 'anytime';
      return 'anytime';
    };
    const asList = (a) => a.map(([id, label, color]) => ({ id, label, color }));
    const DIMS = {
      cluster: { label: 'Topic group', list: S.clusters.filter((c) => c.spread > 0).map((c) => ({ id: c.id, label: c.label, color: c.color })), of: (n) => n.cluster },
      family: { label: 'Compound family', list: asList(FAMILY), of: famOf },
      system: { label: 'Body system', list: asList(SYSTEM), of: sysOf },
      phase: { label: 'Cycle phase', list: asList(PHASE), of: phaseOf },
      origin: { label: 'Origin', list: asList(ORIGIN), of: (n) => (CORE_IDS.has(n.id) ? 'core' : 'auto') }
    };
    const MIN_STEPS = [0, 10, 25, 50, 100, 250, 500, 1000, 2500];
    const TOP_STEPS = [0, 10, 25, 50, 100, 200];
    const SET_DEF = { group: 'cluster', color: 'cluster', min: 0, origin: 'all', only: '', size: 'posts', order: 'size', qual: 'all', time: 'all', cert: 'all', top: 0, dim: 'hide' };
    function validateSettings(v) {
      const s = pickSettings(v, SET_DEF), dims = Object.keys(DIMS);
      if (!dims.includes(s.group)) s.group = SET_DEF.group;
      if (!['certainty', 'heat', 'quality'].includes(s.color) && !dims.includes(s.color)) s.color = SET_DEF.color;
      if (!MIN_STEPS.includes(s.min)) s.min = SET_DEF.min;
      [['origin', ['all', 'core', 'auto']], ['size', ['posts', 'new', 'today', 'quality', 'certainty', 'same']], ['order', ['size', 'az', 'new', 'quality', 'certain']], ['qual', ['all', 'good', 'top']], ['time', ['all', 'week', 'day']],
       ['cert', ['all', 'half', 'most']], ['top', TOP_STEPS], ['dim', ['hide', 'dim']]]
        .forEach(([k, ok]) => { if (!ok.includes(s[k])) s[k] = SET_DEF[k]; });
      if (!DIMS[s.group].list.some((g) => g.id === s.only)) s.only = '';
      return s;
    }
    const SET = validateSettings(EMBED ? null : (() => { try { return JSON.parse(localStorage.getItem('cc_brain_set')); } catch { return null; } })());
    const termsOnly = nodes.filter((n) => n.kind === 'term');
    termsOnly.forEach((n) => { n.color0 = n.color; });
    const dotCol0 = dataDots ? dataDots.geometry.attributes.aColor.array.slice() : null;
    const certainty = (n) => (n.th.threads ? (n.th.threads_known || 0) / n.th.threads : 0);
    const CERT = ['#33434a', '#2f8f86', '#5eead4', '#ecfeff'];
    const ramp = (t) => { const s = Math.min(.999, Math.max(0, t)) * (CERT.length - 1), i = Math.floor(s); return col(CERT[i]).lerp(col(CERT[i + 1]), s - i); };
    const colorOf = (n) => {
      if (SET.color === 'certainty') return ramp(Math.sqrt(certainty(n)));
      if (SET.color === 'heat') return ramp(Math.sqrt(th7(n) / maxN7));
      if (SET.color === 'quality') return ramp((thq(n) - 1) / 4);
      if (SET.color === 'cluster') return col(n.color0);
      const d = DIMS[SET.color], g = d.list.find((x) => x.id === d.of(n)); return col(g ? g.color : n.color0);
    };
    const thq = (n) => n.th.q ?? 3, th7 = (n) => n.th.n7 ?? 1, th1 = (n) => n.th.n1 ?? 1;   // older server data: filters let everything through
    const maxN7 = Math.max(1, ...termsOnly.map(th7)), maxN1 = Math.max(1, ...termsOnly.map(th1));
    let topIds = null;   // ids of the SET.top biggest topics
    const sizeW = (n) => SET.size === 'new' ? Math.sqrt(th7(n) / maxN7) : SET.size === 'today' ? Math.sqrt(th1(n) / maxN1) : SET.size === 'certainty' ? Math.sqrt(certainty(n)) : SET.size === 'quality' ? Math.max(0, thq(n) - 1) / 4 : SET.size === 'same' ? .35 : n.weight;
    const visibleTopic = (n) => (SET.qual === 'all' || thq(n) >= (SET.qual === 'top' ? 4 : 3)) && (SET.cert === 'all' || certainty(n) >= (SET.cert === 'most' ? .8 : .5)) && (!topIds || topIds.has(n.id)) && (SET.time === 'all' || (SET.time === 'week' ? th7(n) : th1(n)) > 0) && n.est >= SET.min && (SET.origin === 'all' || (SET.origin === 'core') === CORE_IDS.has(n.id)) && (!SET.only || DIMS[SET.group].of(n) === SET.only);
    function relayout() { for (const k in arrCache) delete arrCache[k]; if (arrCur !== 'Anatomy') arrCur = ''; }   // the dots flow back into the brain and out into the new layout
    function applySettings(reflow) {
      Object.assign(SET, validateSettings(SET));
      const cc = new Map();
      topIds = SET.top ? new Set(termsOnly.slice().sort((a, b) => b.est - a.est).slice(0, SET.top).map((n) => n.id)) : null;
      termsOnly.forEach((n) => {
        const out = !visibleTopic(n); n.hidden = out && SET.dim === 'hide'; n.faded = out && !n.hidden;   // dim: filtered topics stay as dark small dots
        const c = colorOf(n); if (n.faded) c.multiplyScalar(.3); cc.set(n.id, c); n.color = '#' + c.getHexString();
        ncol.set([c.r, c.g, c.b], n.index * 3); nsize[n.index] = n.hidden ? 0 : n.faded ? .08 : .13 + sizeW(n) * .3;
      });
      ng.attributes.aColor.needsUpdate = true; ng.attributes.aSize.needsUpdate = true;
      if (dataDots) {
        const A = dataDots.geometry.attributes.aColor;
        postIds.forEach((id, i) => { const c = cc.get(id); if (c) A.array.set([c.r, c.g, c.b], i * 3); else A.array.set(dotCol0.subarray(i * 3, i * 3 + 3), i * 3); });
        A.needsUpdate = true;
        dataDots.userData.regionBase=A.array.slice();dataDots.userData.regionKey=null;
      }
      edges.forEach((e, i) => { if (e.base0 === undefined) e.base0 = edgeBase[i]; edgeBase[i] = e.a.hidden || e.b.hidden ? 0 : e.a.faded || e.b.faded ? e.base0 * .25 : e.base0; });
      applyView();   // hides the posts of filtered topics as well
      renderLegendBar(); renderSettings();
      try { if(!EMBED) localStorage.setItem('cc_brain_set', JSON.stringify(SET)); } catch { /* storage blocked */ }
      if (reflow) relayout();
    }
    function insight(dimKey) {   // one sentence with the answer: which group carries the talk
      const d = DIMS[dimKey], tot = new Map(); let all = 0;
      termsOnly.forEach((n) => { if (n.hidden) return; const g = d.of(n); tot.set(g, (tot.get(g) || 0) + n.est); all += n.est; });
      const top = [...tot].sort((a, b) => b[1] - a[1]); if (!top.length || !all) return 'No topic matches the filter.';
      const name = (id) => (d.list.find((x) => x.id === id) || { label: id }).label, pc = (v) => Math.round(v / all * 100);
      return `<b>${esc(name(top[0][0]))}</b> carries ${pc(top[0][1])} % of the posts` + (top[1] ? `, <b>${esc(name(top[1][0]))}</b> follows with ${pc(top[1][1])} %.` : '.');
    }
    const FORM_Q = {
      Anatomy: 'The brain as it grew: every dot is a post, near its topic.', Spheres: 'Every topic as its own ball, sized by its posts.',
      Clusters: 'Topics packed into their groups, biggest group first.', Wheel: 'How the talk splits up, one petal per topic.',
      Table: 'All topics in rows, the biggest on the left.', Cycle: 'Where in a cycle each topic comes up, from blast to cruise.',
      Ring: 'The biggest topics on a ring: a line means two topics come up in the same notes.',
      Galaxy: 'One spiral arm per group, its biggest topics close to the core.', Web: 'Topics that come up in the same notes pull each other close.', Skyline: 'Every topic a tower as high as its posts, one district per group.' };
    function pairInsight() {   // the strongest link among the topics on screen
      const e = edges.filter((x) => x.kind === 'co' && !x.a.hidden && !x.b.hidden).sort((a, b) => b.n - a.n)[0];
      return e ? `<b>${esc(e.a.label)}</b> and <b>${esc(e.b.label)}</b> come up together most often (${fmt(e.n)} notes).` : 'No topic matches the filter.';
    }
    const opt = (o) => Object.entries(o).map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('');
    function chipify(sel) {   // the select stays the source of truth (hidden); a row of chips mirrors it and sets it
      let row = sel.nextElementSibling;
      if (!row || !row.classList.contains('cl-chips')) {
        row = document.createElement('div'); row.className = 'cl-chips'; row.setAttribute('role', 'radiogroup'); row.setAttribute('aria-label', sel.getAttribute('aria-label') || '');
        sel.after(row); sel.hidden = true;
        row.onclick = (e) => { const b = e.target.closest('button'); if (!b || sel.disabled || b.dataset.v === sel.value) return; sel.value = b.dataset.v; sel.dispatchEvent(new Event('change')); };
      }
      row.innerHTML = [...sel.options].map((o) => `<button type="button" role="radio" aria-checked="${o.value === sel.value}" data-v="${esc(o.value)}"${sel.disabled ? ' disabled' : ''}>${esc(o.text)}</button>`).join('');
    }
    const dimOpts = Object.fromEntries(Object.entries(DIMS).map(([k, d]) => [k, d.label]));
    $('clGroup').innerHTML = opt(dimOpts);
    $('clColor').innerHTML = opt({ ...dimOpts, certainty: 'Data certainty', heat: 'Activity this week', quality: 'Source quality' });
    $('clCert').innerHTML = opt({ all: 'Any certainty', half: 'Half the threads read', most: 'Most threads read' });
    $('clTop').innerHTML = TOP_STEPS.map((v) => `<option value="${v}">${v || 'All'}</option>`).join('');
    $('clDim').innerHTML = opt({ hide: 'Hide', dim: 'Dim' });
    $('clOrigin').innerHTML = opt({ all: 'All topics', core: 'Core list', auto: 'Found by the crawler' });
    $('clSizeBy').innerHTML = opt({ posts: 'Posts', new: 'New this week', today: 'New today', quality: 'Source quality', certainty: 'Data certainty', same: 'Same size' });
    $('clOrder').innerHTML = opt({ size: 'Biggest first', az: 'A–Z', new: 'Active now', quality: 'Best sources', certain: 'Most certain' });
    $('clQual').innerHTML = opt({ all: 'All sources', good: 'Good sources only', top: 'Top sources only' });
    $('clTime').innerHTML = opt({ all: 'All time', week: 'Last 7 days', day: 'Last 24 h' });
    function renderSettings() {
      if (!settingsReady) return;
      const form = arrNext === 'Anatomy' ? 'Anatomy' : arrForm, fixed = form === 'Cycle' ? 'phase' : '';
      $('clFormQ').textContent = FORM_Q[form] || '';
      $('clIns').innerHTML = form === 'Ring' ? pairInsight() : insight(fixed || SET.group);
      $('clOrderRow').hidden = form === 'Anatomy';   // order only matters once the topics leave the brain
      $('clOrder').value = SET.order; $('clSizeBy').value = SET.size; $('clQual').value = SET.qual; $('clTime').value = SET.time; $('clCert').value = SET.cert; $('clTop').value = SET.top; $('clDim').value = SET.dim;
      $('clGroup').value = SET.group; $('clGroup').disabled = !!fixed;
      $('clGroupNote').textContent = fixed ? `This form always groups by ${DIMS[fixed].label.toLowerCase()}.` : '';
      $('clGroupsSub').textContent = DIMS[fixed || SET.group].label;
      $('clColor').value = SET.color; $('clOrigin').value = SET.origin;
      const gd = DIMS[SET.group], live = new Set(termsOnly.map((n) => gd.of(n)));
      $('clOnly').innerHTML = '<option value="">All</option>' + gd.list.filter((g) => live.has(g.id)).map((g) => `<option value="${esc(g.id)}">${esc(g.label)}</option>`).join('');
      $('clOnly').value = SET.only;
      const cd = DIMS[SET.color], used = new Set(termsOnly.filter((n) => !n.hidden).map((n) => cd ? cd.of(n) : 0));   // which colour means what
      $('clCKey').innerHTML = cd ? cd.list.filter((g) => used.has(g.id)).map((g) => `<span><i style="--c:${g.color}"></i>${esc(g.label)}</span>`).join('')
        : `<span><i style="--c:${CERT[0]}"></i>${SET.color === 'heat' ? 'quiet' : SET.color === 'quality' ? 'weak sources' : 'few threads read'}</span><span><i style="--c:${CERT[3]}"></i>${SET.color === 'heat' ? 'busy this week' : SET.color === 'quality' ? 'top sources' : 'all read'}</span>`;
      const mi = MIN_STEPS.indexOf(SET.min); $('clMin').value = mi; $('clMin').style.setProperty('--p', (mi / (MIN_STEPS.length - 1) * 100).toFixed(1) + '%');
      $('clMinV').textContent = SET.min ? fmt(SET.min) + ' posts' : 'any';
      const shown = termsOnly.filter((n) => !n.hidden).length;
      $('clShowsSub').textContent = `${shown} of ${termsOnly.length} topics · colour by ${(DIMS[SET.color] ? DIMS[SET.color].label : 'data certainty').toLowerCase()}`;
      ['clGroup', 'clColor', 'clOrigin', 'clSizeBy', 'clQual', 'clTime', 'clCert', 'clDim'].forEach((id) => chipify($(id)));
      renderPresets();
      if (syncMenus) syncMenus();
      if (syncRegions) syncRegions();
      if (syncBody) syncBody();
      if (renderStats) renderStats();
    }
    $('clGroup').onchange = (e) => { SET.group = e.target.value; SET.only = ''; applySettings(true); };
    $('clOnly').onchange = (e) => { SET.only = e.target.value; applySettings(true); };
    {
      chooseRegion=(id)=>{
        if(!termClusters.some(c=>c.id===id)) return;
        const off=SET.group==='cluster' && SET.only===id;
        if(off) SET.only='';
        else {SET.group='cluster';SET.only=id;VIEW.regions=true;VIEW.framing='brain';setArr('Anatomy');}
        applySettings(true);
      };
      syncRegions=()=>{
        const only=SET.only;if(SET.group==='cluster') SET.only='';
        regionRows=termClusters.map(c=>({...c,color:VIEW.regions?REGION_COLOR[c.id]:c.color,n:termsOnly.filter(n=>n.cluster===c.id && visibleTopic(n)).length}));SET.only=only;
        const picked=SET.group==='cluster' && SET.only;
        $('clBrainRegions').innerHTML=regionRows.map(c=>`<button type="button" class="cl-asystem" data-region="${esc(c.id)}" aria-pressed="${picked===c.id}" style="--c:${c.color};--share:0%"><i></i><span>${esc(c.label)}</span><small>${c.n}</small></button>`).join('')+(picked?'<button type="button" class="cl-aclear" data-clear-region>All regions</button>':'');
        applyRegions();renderLegendBar();
      };
      $('clBrainRegions').onclick=e=>{const b=e.target.closest('[data-region]');if(b) chooseRegion(b.dataset.region);else if(e.target.closest('[data-clear-region]') && SET.group==='cluster' && SET.only) chooseRegion(SET.only);};
    }
    {   // Body atlas: systems and topics share the same real filter and marker selection.
      const AT = {mind:[-.8,-2.3,0],hormones:[-.05,-4.65,0],muscle:[.2,-6,3.7],heart:[.45,-7.9,.9],skin:[.4,-9.3,-3.4],liver:[.4,-10.2,-1.25],kidney:[-1.1,-11.5,1.55],metabolism:[.5,-12.8,0],sexual:[.1,-15.4,0]};
      let prev=null, atlasTab='systems', atlasLimit=8;
      const chooseSystem=(id)=>{
        if(!SYSTEM.some(([k])=>k===id)) return;
        const off=SET.group==='system' && SET.only===id;
        if(off) { Object.assign(SET,prev ? {group:prev.group,only:prev.only} : {only:''}); prev=null; }
        else { if(!prev || SET.group!=='system') prev={group:SET.group,only:SET.only}; SET.group='system';SET.only=id; }
        atlasTab=off?'systems':'topics';atlasLimit=8;
        if(!off) { VIEW.framing=['mind','general'].includes(id)?'brain':'upper'; if(VIEW.bodymode==='hidden') VIEW.bodymode='full'; setArr('Anatomy'); }
        applySettings(true);
      };
      const renderAtlas=()=>{
        const picked=SET.group==='system' ? bodyMarks.find(m=>m.id===SET.only) : null;
        const tabs=`<div class="cl-atabs" role="tablist" aria-label="Body atlas"><button type="button" role="tab" id="clAtlasSystems" data-atab="systems" tabindex="${atlasTab==='systems'?0:-1}" aria-selected="${atlasTab==='systems'}" aria-controls="clAtlasPanel">Systems</button><button type="button" role="tab" id="clAtlasTopics" data-atab="topics" tabindex="${atlasTab==='topics'?0:-1}" aria-selected="${atlasTab==='topics'}" aria-controls="clAtlasPanel">Topics</button></div>`;
        const total=termsOnly.filter(visibleTopic).length;
        const status=`<div class="cl-astatus"><span>${picked?esc(picked.label):'All systems'}</span><span>${total} <span>topics</span></span></div>`;
        let content;
        if(atlasTab==='systems') {
          const max=Math.max(1,...bodyMarks.map(m=>m.p));
          content=bodyMarks.map(m=>`<button type="button" class="cl-asystem" data-system="${m.id}" aria-pressed="${m.on}" style="--c:${m.color};--share:${Math.sqrt(m.p/max)*100}%"><i></i><span>${esc(m.label)}</span><small>${m.n}</small></button>`).join('');
        } else {
          const all=termsOnly.filter(visibleTopic).sort((a,b)=>b.est-a.est),list=all.slice(0,atlasLimit);
          content=list.length?list.map(n=>`<button type="button" class="cl-atopic" data-topic="${esc(n.id)}"><span>${esc(n.label)}</span><small>~${big(n.est)}</small></button>`).join(''):'<p class="cl-aempty">No topics match these filters.</p>';
          if(all.length>list.length) content+=`<button type="button" class="cl-amore" data-more><span>Show more topics</span><small>${list.length} / ${all.length}</small></button>`;
        }
        $('clBodyAtlas').innerHTML=tabs+status+`<div id="clAtlasPanel" role="tabpanel" aria-labelledby="${atlasTab==='systems'?'clAtlasSystems':'clAtlasTopics'}">${content}</div>`+(picked?'<button type="button" class="cl-aclear" data-clear>Clear body filter</button>':'');
      };
      bodyMarks=SYSTEM.map(([id,label,color])=>{
        const el=document.createElement('button'),p=AT[id];el.type='button';el.className='cl-blbl';el.style.setProperty('--c',color);
        if(!p) el.hidden=true;labelBox.appendChild(el);el.onclick=()=>chooseSystem(id);
        return {id,label,color,el,anchor:!!p,pos:new THREE.Vector3(...(p||[0,-8,0])),on:false,n:0,p:0};
      });
      $('clBodyAtlas').onclick=(e)=>{
        const tab=e.target.closest('[data-atab]'),system=e.target.closest('[data-system]'),topic=e.target.closest('[data-topic]');
        if(tab) {atlasTab=tab.dataset.atab;renderAtlas();$('clBodyAtlas').querySelector('[data-atab="'+atlasTab+'"]').focus();}
        else if(e.target.closest('[data-more]')) {atlasLimit+=8;renderAtlas();}
        else if(system) chooseSystem(system.dataset.system);
        else if(topic && byId[topic.dataset.topic]) select(byId[topic.dataset.topic]);
        else if(e.target.closest('[data-clear]') && SET.group==='system' && SET.only) chooseSystem(SET.only);
      };
      $('clBodyFilter').onclick=()=>{if(SET.group==='system' && SET.only) chooseSystem(SET.only);else if(SET.group==='cluster' && SET.only) chooseRegion(SET.only);};
      $('clBodyAtlas').onkeydown=(e)=>{
        const tab=e.target.closest('[data-atab]');
        if(!tab || !['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
        e.preventDefault();e.stopPropagation();
        atlasTab=e.key==='Home'?'systems':e.key==='End'?'topics':atlasTab==='systems'?'topics':'systems';
        renderAtlas();$('clBodyAtlas').querySelector('[data-atab="'+atlasTab+'"]').focus();
      };
      syncBody=()=>{
        const only=SET.only;if(SET.group==='system') SET.only='';
        for(const m of bodyMarks) {const ts=termsOnly.filter(n=>sysOf(n)===m.id && visibleTopic(n));m.n=ts.length;m.p=ts.reduce((a,n)=>a+n.est,0);m.d=ts.reduce((a,n)=>a+(n.th.n1||0),0);}
        SET.only=only;
        const mp=Math.max(1,...bodyMarks.map(m=>m.p)),md=Math.max(0,...bodyMarks.map(m=>m.d));
        for(const m of bodyMarks) {
          m.on=SET.group==='system' && SET.only===m.id;m.el.innerHTML=`<i></i>${esc(m.label)} <small>${m.n} · ~${big(m.p)}</small>`;
          m.el.style.setProperty('--g',Math.sqrt(m.p/mp).toFixed(2));m.el.classList.toggle('on',m.on);m.el.setAttribute('aria-pressed',String(m.on));
          m.el.classList.toggle('live',!reduced && md>0 && m.d>=md*.5);m.el.title=`${m.n} topics · ~${fmt(m.p)} posts · +${fmt(m.d)} today`;
        }
        const active=SET.group==='cluster' && SET.only?regionRows.find(c=>c.id===SET.only):bodyMarks.find(m=>m.on);
        $('clBodyFilter').hidden=!active;
        const translated=s=>window.ccT?window.ccT(s):s;
        $('clBodyFilter').setAttribute('aria-label',translated(SET.group==='cluster'?'Clear region filter':'Clear body filter')+(active?': '+translated(active.label):''));
        $('clBodyFilter').innerHTML=active?`<span>${esc(active.label)}</span><small>${active.n} <span>topics</span> ×</small>`:'';
        const picked=bodyMarks.find(m=>m.on && m.anchor);
        for(const mesh of bodyLayers.regions) {
          const a=mesh.geometry.attributes.aAlpha;
          for(let i=0;i<a.array.length;i++) a.array[i]=mesh.userData.baseAlpha[i]*(picked?(mesh.userData.bodySystems[i]===picked.id?5:.35):1);
          a.needsUpdate=true;
        }
        renderAtlas();
      };
      syncBody();
    }
    ['clBodyMode','clFraming','clAngle'].forEach((id,i)=>{
      $(id).onchange=(e)=>{
        VIEW[['bodymode','framing','angle'][i]]=e.target.value;
        if(id==='clAngle') { VIEW.turn=false; world.rotation.set(0,0,0); world.position.y=0; }
        if(id!=='clBodyMode' && arrNext!=='Anatomy') setArr('Anatomy');
        applyView();
      };
    });
    $('clColor').onchange = (e) => { SET.color = e.target.value; applySettings(false); };
    $('clOrigin').onchange = (e) => { SET.origin = e.target.value; applySettings(true); };
    $('clSizeBy').onchange = (e) => { SET.size = e.target.value; applySettings(false); };
    $('clOrder').onchange = (e) => { SET.order = e.target.value; applySettings(true); };
    $('clQual').onchange = (e) => { SET.qual = e.target.value; applySettings(true); };
    $('clTime').onchange = (e) => { SET.time = e.target.value; applySettings(true); };
    $('clCert').onchange = (e) => { SET.cert = e.target.value; applySettings(true); };
    $('clTop').onchange = (e) => { SET.top = +e.target.value; applySettings(true); };
    $('clDim').onchange = (e) => { SET.dim = e.target.value; applySettings(true); };
    $('clMin').oninput = (e) => { SET.min = MIN_STEPS[+e.target.value] || 0; applySettings(false); };
    $('clMin').onchange = () => relayout();
    $('clSetReset').onclick = () => { Object.assign(SET, SET_DEF); applySettings(true); };
    // saved views: a few built in, made for the questions people ask about a cycle; own ones are kept per browser (max 12)
    const BUILTIN = [
      { name: 'The whole brain', form: 'Anatomy', blend: 0, set: {} },
      { name: 'What gets stacked together?', form: 'Clusters', blend: 1, set: { group: 'family', color: 'family' } },
      { name: 'Which sides come up?', form: 'Clusters', blend: 1, set: { group: 'system', color: 'system' } },
      { name: 'When in a cycle?', form: 'Cycle', blend: 1, set: { color: 'phase' } },
      { name: 'Where is data thin?', form: 'Table', blend: 1, set: { color: 'certainty' } },
      { name: 'What is new?', form: 'Spheres', blend: 1, set: { origin: 'auto', color: 'family' } }];
    const loadP = () => { try {
      const l = JSON.parse(localStorage.getItem('cc_brain_presets'));
      return Array.isArray(l) ? l.filter((p) => p && typeof p.name === 'string').slice(-12).map((p) => ({
        name: p.name.slice(0, 40), form: ARR.includes(p.form) ? p.form : 'Anatomy', blend: typeof p.blend === 'number' && Number.isFinite(p.blend) ? Math.min(1, Math.max(0, p.blend)) : 1,
        set: validateSettings(p.set), ...(p.view && typeof p.view === 'object' && !Array.isArray(p.view)
          ? { view: Object.fromEntries(Object.entries(validateView(p.view)).filter(([k]) => Object.prototype.hasOwnProperty.call(p.view, k))) } : {})
      })) : [];
    } catch { return []; } };
    const saveP = (l) => { try { localStorage.setItem('cc_brain_presets', JSON.stringify(l)); } catch { /* storage blocked */ } };
    function applyPreset(p) {
      if (!p) return;
      Object.assign(SET, validateSettings(p.set));
      if (p.view) Object.assign(VIEW, validateView(pickSettings(p.view, VIEW)));
      if (p.form && p.form !== 'Anatomy' && ARR.includes(p.form)) { arrForm = p.form; arrBlend = p.blend ?? 1; } else arrBlend = 0;
      applySettings(true); syncArr();
    }
    function renderPresets() {
      const mine = loadP(), form = arrNext === 'Anatomy' ? 'Anatomy' : arrForm;
      const isOn = (p) => (p.form || 'Anatomy') === form && Object.entries({ ...SET_DEF, ...(p.set || {}) }).every(([k, v]) => SET[k] === v);   // the view that matches the picture
      $('clPresets').innerHTML = [...BUILTIN.map((p, i) => ['b' + i, p, true]), ...mine.map((p, i) => ['u' + i, p, false])].map(([k, p, b]) =>
        `<div><button type="button" class="ap${isOn(p) ? ' on' : ''}" aria-pressed="${isOn(p)}" data-p="${k}">${esc(p.name)}</button>${b ? '<small>built in</small>' : `<button type="button" class="del" data-d="${k}" aria-label="Delete ${esc(p.name)}">×</button>`}</div>`).join('');
      $('clPresetsSub').textContent = `${BUILTIN.length} built in · ${mine.length} saved`;
    }
    $('clPresets').onclick = (e) => {
      const a = e.target.closest('[data-p]'), d = e.target.closest('[data-d]');
      if (d) { const l = loadP(); l.splice(+d.dataset.d.slice(1), 1); saveP(l); renderPresets(); return; }
      if (a) { const k = a.dataset.p; applyPreset(k[0] === 'b' ? BUILTIN[+k.slice(1)] : loadP()[+k.slice(1)]); }
    };
    $('clSave').onsubmit = (e) => {
      e.preventDefault();
      const name = $('clSaveName').value.trim(); if (!name) { $('clSaveName').focus(); return; }
      const l = loadP().filter((p) => p.name !== name);
      l.push({ name, form: arrNext === 'Anatomy' ? 'Anatomy' : arrForm, blend: arrBlend, set: { ...SET },
        view: { theme: VIEW.theme, size: VIEW.size, links: VIEW.links, labels: VIEW.labels, counts: VIEW.counts } });
      saveP(l.slice(-12)); $('clSaveName').value = ''; renderPresets();
    };
    settingsReady = true;
    applySettings(false);

    // complete setups: the existing layout/view settings, without changing the shape or camera
    var setups = (() => { try {
      const l = JSON.parse(localStorage.getItem('cc_brain_setups'));
      return Array.isArray(l) ? l.filter((p) => p && typeof p === 'object' && !Array.isArray(p)).slice(0, 6).map((p, i) => ({
        name: typeof p.name === 'string' && p.name.trim() ? p.name.trim().slice(0, 24) : 'Setup ' + (i + 1), set: validateSettings(p.set), view: validateView(p.view)
      })) : [];
    } catch { return []; } })();
    const renderSetups = () => {
      $('clSetups').innerHTML = setups.map((p, i) => `<div><button type="button" class="ap" data-load="${i}" data-noi18n>${esc(p.name)}</button><button type="button" class="del" data-del="${i}" aria-label="× ${esc(p.name)}" data-noi18n>×</button></div>`).join('');
      if (syncMenus) syncMenus();
    };
    const saveSetups = () => { try { localStorage.setItem('cc_brain_setups', JSON.stringify(setups)); } catch { /* storage blocked */ } renderSetups(); };
    const loadSetup = (p) => { Object.assign(SET, validateSettings(p.set)); Object.assign(VIEW, validateView(p.view)); applySettings(true); applyView(); };
    $('clSetupSave').onsubmit = (e) => {
      e.preventDefault(); let n = 1; while (setups.some((p) => p.name === 'Setup ' + n)) n++;
      const name = $('clSetupName').value.trim().slice(0, 24) || 'Setup ' + n;
      setups.unshift({ name, set: validateSettings(SET), view: validateView(VIEW) }); setups = setups.slice(0, 6);
      $('clSetupName').value = ''; saveSetups();
    };
    $('clSetups').onclick = (e) => {
      const a = e.target.closest('[data-load]'), d = e.target.closest('[data-del]');
      if (d) { setups.splice(+d.dataset.del, 1); saveSetups(); }
      else if (a && setups[+a.dataset.load]) loadSetup(setups[+a.dataset.load]);
    };
    let copyT = 0;
    $('clCopyLink').onclick = async () => {
      try {
        const json = JSON.stringify({ s: validateSettings(SET), v: validateView(VIEW) });
        const code = btoa(String.fromCharCode(...new TextEncoder().encode(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const link = location.origin + location.pathname + '#s=' + code;
        try { await navigator.clipboard.writeText(link); } catch {
          const input = document.createElement('input'), focus = document.activeElement;
          input.value = link; input.readOnly = true; input.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none'; document.body.append(input);
          try { input.select(); input.setSelectionRange(0, link.length); if (!document.execCommand('copy')) return; }
          finally { input.remove(); if (focus) focus.focus({ preventScroll: true }); }
        }
        $('clCopyLink').textContent = 'Copied'; clearTimeout(copyT); copyT = setTimeout(() => { $('clCopyLink').textContent = 'Copy link'; }, 1500);
      } catch { /* invalid data or clipboard unavailable */ }
    };
    renderSetups();
    if (!EMBED && location.hash.startsWith('#s=')) {
      try {
        const code = location.hash.slice(3); if (!/^[A-Za-z0-9_-]{1,16384}$/.test(code)) throw new Error();
        const p = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(code.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))));
        if (p && p.s && p.v && typeof p.s === 'object' && typeof p.v === 'object' && !Array.isArray(p.s) && !Array.isArray(p.v)) loadSetup({ set: p.s, view: p.v });
      } catch { /* ignore malformed setup links */ }
      try { history.replaceState(history.state, '', location.pathname + location.search); } catch { /* history unavailable */ }
    }

    // ---------- left menu: one row per setting (name + current value); a row opens its options in the flyout on the right ----------
    $('clSetReset').addEventListener('click', () => $('clVReset').click());   // one Reset for everything
    const SECS = [];
    let FLY = $('clFly');
    const cut = (box, sel) => {   // split a panel at its small headings: the heading names the row, the rest moves into a flyout section
      let cur = null;
      [...box.children].forEach((el) => {
        if (el.matches(sel)) { cur = document.createElement('div'); cur.dataset.name = el.textContent; cur.hidden = true; SECS.push(cur); FLY.append(cur); cur.append(el); }
        else if (cur && !el.matches('.cl-panh, .cl-lfoot, .cl-vfoot, span[hidden]')) cur.append(el);
      });
    };
    cut($('clArrP'), '.cl-lh'); const nLayout = SECS.length; FLY = $('clFlyR'); cut($('clView'), '.cl-vh');
    if (SECS[nLayout]) SECS[nLayout].dataset.name = 'Visible';   // View's "Show": two rows of the same name otherwise
    $('clFly').append($('clArrP').querySelector('.cl-lfoot'));
    const txt = (el) => el ? el.textContent.trim() : '';
    const valueOf = (sec) => {
      const q = (x) => sec.querySelector(x);
      if (q('#clSetups')) return setups.length ? setups.length + ' saved' : 'None';
      if (q('#clBgs')) { const b = BGS.find(([, c]) => c === VIEW.bg); return b ? b[0] : VIEW.bg; }
      if (q('#clQual')) { const v = [SET.qual !== 'all' && SET.qual + ' sources', SET.time === 'week' && '7 days', SET.time === 'day' && '24 h', SET.cert !== 'all' && 'certain'].filter(Boolean); return v.length ? v.join(', ') : 'Off'; }
      if (q('#clTurn')) return VIEW.turn ? VIEW.speed + ' %' : 'Off';
      if (q('#clFov')) return VIEW.fov + '° · ' + VIEW.quality + ' %';
      if (q('#clThemes')) return VIEW.theme;
      if (q('.cl-forms')) return txt(q('.cl-forms .on'));
      if (q('.cl-chips')) return txt(q('.cl-chips [aria-checked=true]'));
      const on = [...sec.querySelectorAll('input[type=checkbox]')].filter((c) => c.checked).length;
      return on + '/' + sec.querySelectorAll('input[type=checkbox]').length;
    };
    // one flyout per side (Layout left, View right): both may be open, unless they would cover each other
    const open = { L: -1, R: -1 }, sideOf = (i) => (i < nLayout ? 'L' : 'R'), flyOf = (k) => $(k === 'L' ? 'clFly' : 'clFlyR');
    let menuT = 0;
    const row = (sec, i) => `<button type="button" data-i="${i}" aria-expanded="false" aria-controls="${i < nLayout ? 'clFly' : 'clFlyR'}"><span>${esc(sec.dataset.name)}${sec.querySelector('#clBgs') ? '<i></i>' : ''}</span><small></small></button>`;
    $('clMList').innerHTML = SECS.slice(0, nLayout).map(row).join(''); $('clMListR').innerHTML = SECS.slice(nLayout).map((sec, i) => row(sec, i + nLayout)).join('');
    const paintMenu = () => {   // in place: rebuilding the rows between pointerdown and click would swallow the click
      document.querySelectorAll('#clMList button, #clMListR button').forEach((b) => {
        const i = +b.dataset.i, raw = valueOf(SECS[i]), v = window.ccT ? window.ccT(raw) : raw, sw = b.querySelector('i');
        b.setAttribute('aria-expanded', String(open[sideOf(i)] === i)); if (b.lastChild.textContent !== v) b.lastChild.textContent = v; if (sw) sw.style.background = VIEW.bg;
      });
    };
    const refreshMenu = () => { cancelAnimationFrame(menuT); menuT = requestAnimationFrame(syncMenus); };
    const show = (k) => {   // one big menu per side: all its sections one under the other, right under its button
      const f = flyOf(k), on = open[k] >= 0;
      SECS.forEach((sec, j) => { if (sideOf(j) === k) sec.hidden = !on; });
      f.hidden = !on; if (!on) closeSubs(k);
      if (on && innerWidth > 760) {
        const r = $(k === 'L' ? 'clMBtn' : 'clMBtnR').getBoundingClientRect(), st = $('clStage').getBoundingClientRect(), top = k === 'L' ? r.top - st.top : r.bottom - st.top + 6;   // Layout opens beside its button, View under it
        f.style.top = top + 'px'; f.style.maxHeight = (st.height - top - 16) + 'px';
      }
    };
    syncMenus = () => { paintMenu(); show('L'); show('R'); };
    const fly = (i) => {
      const k = sideOf(i), o = k === 'L' ? 'R' : 'L';
      open[k] = open[k] === i ? -1 : i; show(k);
      if (open[k] >= 0 && open[o] >= 0) {   // the other side stays open only if the two do not overlap
        const a = flyOf(k).getBoundingClientRect(), b = flyOf(o).getBoundingClientRect();
        if (a.left < b.right + 12 && b.left < a.right + 12 && a.top < b.bottom && b.top < a.bottom) { open[o] = -1; show(o); }
      }
      paintMenu();
    };
    const foldSide = (k, on) => {   // the button opens the big menu of its side
      open[k] = on ? 0 : -1; show(k); $(k === 'L' ? 'clMBtn' : 'clMBtnR').setAttribute('aria-expanded', String(on));   // menus only close by their own button (owner)
    };
    $('clMBtn').onclick = () => { foldSide('L', open.L < 0); paintMenu(); };
    $('clMBtnR').onclick = () => { foldSide('R', open.R < 0); paintMenu(); };
    $('clMList').onclick = $('clMListR').onclick = (e) => { const b = e.target.closest('button[data-i]'); if (b) fly(+b.dataset.i); };
    ['clFly', 'clFlyR'].forEach((id) => {
      new MutationObserver(refreshMenu).observe($(id), { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'aria-checked'] });
      ['input', 'change', 'click'].forEach((ev) => $(id).addEventListener(ev, refreshMenu));
    });
    $('clPresets').addEventListener('click', () => setTimeout(refreshMenu, 50));
    ['clMenu', 'clMenuR', 'clFly', 'clFlyR'].forEach((id) => ['pointerdown', 'wheel'].forEach((ev) => $(id).addEventListener(ev, (e) => { if (!e.target.closest('.cl-stack')) e.stopPropagation(); }, { passive: true })));
    paintMenu();
    if (window.__cc) window.__cc.settings = { SET, DIMS, applySettings, applyPreset, famOf, sysOf, phaseOf };

    // ---------- side menus: a section marked cl-out opens as its own panel beside its menu (left menu: to the right, View: to the left); they nest ----------
    var subs = { L: [], R: [] };   // open panels per side, innermost first
    function closeSubs(k, from = 0) { const a = subs[k]; while (a.length > from) { const o = a.pop(); o.det.append(o.body); o.det.open = false; o.p.remove(); } }
    function openSub(det) {
      const k = det.closest('#clFlyR, .cl-subp.r') ? 'R' : 'L', a = subs[k], host = det.closest('.cl-subp'), lvl = host ? a.findIndex((o) => o.p === host) + 1 : 0;
      const was = a[lvl] && a[lvl].det === det; closeSubs(k, lvl); if (was) return;
      const body = det.querySelector(':scope > div'), p = document.createElement('aside'), name = det.firstElementChild.textContent;
      if (!body) return;
      p.className = 'cl-pan cl-lens cl-subp' + (k === 'R' ? ' r' : ''); p.setAttribute('aria-label', name);
      p.innerHTML = `<div class="cl-panh"><b>${esc(name)}</b><button type="button" class="cl-px" aria-label="Close">×</button></div>`;
      p.querySelector('.cl-px').onclick = () => closeSubs(k, lvl);
      ['pointerdown', 'wheel'].forEach((ev) => p.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
      p.append(body); $('clStage').append(p); det.open = true; a.push({ det, body, p });
      const st = $('clStage').getBoundingClientRect(), par = (host || flyOf(k)).getBoundingClientRect(), top = Math.max(8, Math.min(det.getBoundingClientRect().top - st.top, st.height - p.offsetHeight - 16));
      p.style.top = top + 'px'; p.style.maxHeight = (st.height - top - 16) + 'px';
      p.style.left = (k === 'L' ? par.right - st.left + 8 : par.left - st.left - 8 - p.offsetWidth) + 'px';
      if (renderStats) renderStats();
    }
    $('clStage').addEventListener('click', (e) => {   // phones: the section folds open in place instead
      const sm = e.target.closest('details.cl-out > summary'); if (!sm || innerWidth <= 760) return;
      e.preventDefault(); openSub(sm.parentElement);
    });
    // ---------- search options (Find) ----------
    $('clFIn').innerHTML = opt({ all: 'Names & definitions', names: 'Names only' });
    $('clFMax').innerHTML = [8, 20, 50, 100].map((v) => `<option value="${v}">${v}</option>`).join('');
    $('clFSort').innerHTML = opt({ best: 'Best match', posts: 'Most posts', az: 'A–Z', new: 'Active today' });
    function syncFind() {
      $('clFIn').value = FIND.scope; $('clFMax').value = FIND.max; $('clFSort').value = FIND.sort;
      $('clFFuzzy').checked = FIND.fuzzy; $('clFMark').checked = FIND.mark; $('clFLabel').checked = FIND.label; $('clFOnly').checked = FIND.only;
      ['clFIn', 'clFSort'].forEach((id) => chipify($(id)));
    }
    const setFind = (k, v) => {
      FIND[k] = v; Object.assign(FIND, validateFind(FIND));
      try { if (!EMBED) localStorage.setItem('cc_brain_find', JSON.stringify(FIND)); } catch { /* storage blocked */ }
      syncFind(); if ($('clSearch').value.trim()) searchList();
    };
    $('clFIn').onchange = (e) => setFind('scope', e.target.value);
    $('clFSort').onchange = (e) => setFind('sort', e.target.value);
    $('clFMax').onchange = (e) => setFind('max', +e.target.value);
    [['clFFuzzy', 'fuzzy'], ['clFMark', 'mark'], ['clFLabel', 'label'], ['clFOnly', 'only']].forEach(([id, k]) => { $(id).onchange = (e) => setFind(k, e.target.checked); });
    $('clSetReset').addEventListener('click', () => { Object.assign(FIND, FIND_DEF); setFind('max', FIND_DEF.max); });
    syncFind();
    // ---------- statistics (Find, Statistics): the topics on screen in numbers; group bars filter, rows open a topic ----------
    var renderStats = null;
    const coDeg = new Map(); for (const [a, b, k] of D.pairs || []) if (k > 0) { coDeg.set(a, (coDeg.get(a) || 0) + 1); coDeg.set(b, (coDeg.get(b) || 0) + 1); }
    const MEAS = { posts: ['Posts (est.)', (n) => n.est], topics: ['Topics', () => 1], threads: ['Threads', (n) => n.th.threads || 0], week: ['New this week', (n) => n.th.n7 || 0], today: ['New today', (n) => n.th.n1 || 0] };
    const RANK = { ...MEAS, quality: ['Source score', (n) => n.th.q || 0], cover: ['Threads read', certainty], links: ['Connections', (n) => coDeg.get(n.id) || 0] };
    delete RANK.topics;
    $('clStDim').innerHTML = opt(dimOpts); $('clStMeas').innerHTML = opt(Object.fromEntries(Object.entries(MEAS).map(([k, v]) => [k, v[0]])));
    $('clStTop').innerHTML = opt(Object.fromEntries(Object.entries(RANK).map(([k, v]) => [k, v[0]])));
    const sbar = (attr, label, val, w, c) => `<button type="button" class="cl-sbar" ${attr} style="--c:${esc(c || '#c3ccd1')};--w:${(Math.max(0, Math.min(1, w)) * 100).toFixed(1)}%"><span>${esc(label)}</span><small>${val}</small><b></b></button>`;
    const sval = (k, v) => (k === 'cover' ? Math.round(v * 100) + ' %' : k === 'quality' ? v.toFixed(1) : fmt(Math.round(v)));
    renderStats = () => {
      const shown = termsOnly.filter((n) => !n.hidden && !n.faded), sum = (f) => shown.reduce((t, n) => t + (f(n) || 0), 0);
      const thr = sum((n) => n.th.threads), thk = sum((n) => n.th.threads_known), qs = shown.filter((n) => n.th.q);
      const vis = new Set(shown.map((n) => n.id)), pairs = (D.pairs || []).filter(([a, b, k]) => k > 0 && vis.has(a) && vis.has(b));
      $('clStO').innerHTML = [['Topics shown', `${fmt(shown.length)} / ${fmt(termsOnly.length)}`], ['Posts (est.)', '~' + fmt(sum((n) => n.est))], ['Posts counted', fmt(sum((n) => n.th.posts_known))],
        ['Threads', fmt(thr)], ['Threads read', fmt(thk) + ' · ' + (thr ? Math.round(thk / thr * 100) : 0) + ' %'], ['New this week', fmt(sum((n) => n.th.n7))], ['New today', fmt(sum((n) => n.th.n1))],
        ['Average source score', qs.length ? (qs.reduce((t, n) => t + n.th.q, 0) / qs.length).toFixed(1) + ' / 5' : '–'], ['Topic pairs talked about together', fmt(pairs.length)], ['Data from', esc(String(D.generated || '–'))]]
        .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
      chipify($('clStDim')); chipify($('clStMeas')); chipify($('clStTop'));
      // shares ignore the one-group filter, so every bar stays clickable
      const keep = SET.only; SET.only = ''; const base = termsOnly.filter(visibleTopic); SET.only = keep;
      const dk = $('clStDim').value, d = DIMS[dk], [, mf] = MEAS[$('clStMeas').value], tot = new Map(); let all = 0;
      base.forEach((n) => { const g = d.of(n), v = mf(n) || 0; tot.set(g, (tot.get(g) || 0) + v); all += v; });
      const rows = [...tot].sort((a, b) => b[1] - a[1]), mx = rows.length ? rows[0][1] : 1;
      $('clStD').innerHTML = rows.map(([g, v]) => { const x = d.list.find((y) => y.id === g) || { label: g }; return sbar(`data-g="${esc(g)}" aria-pressed="${SET.group === dk && SET.only === g}"`, x.label, `${fmt(Math.round(v))} · ${all ? Math.round(v / all * 100) : 0} %`, v / (mx || 1), x.color); }).join('') || '<p class="cl-fl">No topic matches the filter.</p>';
      const rk = $('clStTop').value, [, rf] = RANK[rk], top = shown.slice().sort((a, b) => rf(b) - rf(a) || b.est - a.est).slice(0, 20), rmx = top.length ? rf(top[0]) || 1 : 1;
      $('clStT').innerHTML = top.map((n) => sbar(`data-id="${esc(n.id)}"`, n.label, sval(rk, rf(n)), rf(n) / rmx, n.color)).join('') || '<p class="cl-fl">No topic matches the filter.</p>';
      const pt = pairs.sort((a, b) => b[2] - a[2]).slice(0, 20), pmx = pt.length ? pt[0][2] : 1;
      $('clStL').innerHTML = pt.map(([a, b, k]) => sbar(`data-id="${esc(a)}" data-id2="${esc(b)}"`, byId[a].label + ' + ' + byId[b].label, fmt(k), k / pmx, byId[a].color)).join('') || '<p class="cl-fl">No topic matches the filter.</p>';
      const cb = [0, 0, 0, 0, 0]; shown.forEach((n) => { cb[Math.min(4, Math.floor(certainty(n) * 5))]++; });
      const cmx = Math.max(1, ...cb);
      $('clStC').innerHTML = cb.map((v, i) => sbar(`data-cov="${i}"`, `${i * 20}–${i * 20 + 20} %`, fmt(v), v / cmx, CERT[Math.min(3, i)])).join('');
      const qb = [1, 2, 3, 4, 5].map((q) => shown.filter((n) => Math.round(n.th.q || 0) === q).length), qmx = Math.max(1, ...qb);
      $('clStQ').innerHTML = qb.map((v, i) => sbar(`data-q="${i + 1}"`, `${i + 1} / 5`, fmt(v), v / qmx, CERT[Math.min(3, Math.floor(i * .8))])).join('');
    };
    ['clStDim', 'clStMeas', 'clStTop'].forEach((id) => { $(id).onchange = renderStats; });
    $('clStD').onclick = (e) => {
      const b = e.target.closest('[data-g]'); if (!b) return; const dk = $('clStDim').value;
      if (SET.group === dk && SET.only === b.dataset.g) SET.only = ''; else { SET.group = dk; SET.only = b.dataset.g; }
      applySettings(true);
    };
    ['clStT', 'clStL'].forEach((id) => { $(id).onclick = (e) => { const b = e.target.closest('[data-id]'); if (b && byId[b.dataset.id]) select(byId[b.dataset.id]); }; });
    renderStats();

    // ---------- live crawler strip (GET /api/admin/live: uploads, notes, inbox; refreshed every 4 s while open) ----------
    const ago = (sec) => sec < 60 ? Math.round(sec) + ' s ago' : sec < 3600 ? Math.round(sec / 60) + ' min ago' : sec < 86400 ? Math.round(sec / 3600) + ' h ago' : 'over a day ago';
    const hm = (t) => new Date(t * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const KIND = { in: ['Upload', '#7dd3fc'], note: ['Note', '#5eead4'], empty: ['Dropped', '#f2727f'] };
    let liveT = 0, seenTop = 0, noteSeen = 0;
    // every note Codex stores sends an impulse from the brain down the spinal cord into the nerves (see pointVS uWave)
    // card stack on the left of the brain: newest on top, tag + title + time, quality 1-5 big on the right
    const KC = { in: '#7dd3fc', note: '#5eead4', empty: '#f2727f' }, QC = ['#f2727f', '#f2727f', '#f5b84b', '#7dd3fc', '#a7f3e4', '#5eead4'];
    let stackTop = 0;
    function renderStack(evs) {
      const list = $('clStackList'); if (!list) return;
      list.innerHTML = evs.slice(0, 12).map((e) => {
        const [lab] = KIND[e.k] || [e.k.toUpperCase()], q = +(((PUB ? e.q : (e.info || '').match(/^\d\/5/)?.[0]) || '').split('/')[0]) || 0;
        const title = PUB ? `<span class="cl-blur" aria-hidden="true">${esc(filler(e.n, Math.floor(e.t)))}</span>` : esc(String(e.title).split(' | ')[0]);
        return `<li class="${e.t > stackTop && stackTop ? 'fresh' : ''}" style="--c:${KC[e.k] || '#8a979e'};--q:${QC[q] || '#56656c'}"><span class="tg"><b>${lab}</b><time>${hm(e.t)}</time></span><span class="tt">${title}</span><em>${q || '–'}</em></li>`;
      }).join('');
      $('clStackT').textContent = evs[0] ? hm(evs[0].t) : '';
      stackTop = evs[0] ? evs[0].t : stackTop;
    }
    const beams = [];   // every stored note: a soft ring opens once around its topic and fades (no line: calm, it is a database)
    function drawBeams(now) {
      const svg = $('clBeams'); if (!svg) return;
      for (let i = beams.length - 1; i >= 0; i--) if (now - beams[i].t > 1.8) beams.splice(i, 1);
      if (!beams.length) { if (svg.childElementCount) svg.innerHTML = ''; return; }
      svg.innerHTML = beams.map((b) => {
        const age = now - b.t; if (age < 0) return '';
        const n = byId[b.id]; if (n && n.hidden) return '';
        if (n) tmp.copy(n.pos); else tmp.set(-.05 * BS, .1 * BS, 0);
        tmp.applyMatrix4(world.matrixWorld).project(camera); if (tmp.z > 1) return '';
        const x = (tmp.x + 1) / 2 * W, y = (1 - tmp.y) / 2 * H, p = age / 1.8, e = 1 - (1 - p) * (1 - p);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3 + e * 18).toFixed(1)}" fill="none" stroke="#ece6da" stroke-opacity="${(.45 * (1 - p)).toFixed(2)}" stroke-width="1"/>`
          + `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#ece6da" fill-opacity="${(.8 * (1 - p)).toFixed(2)}"/>`;
      }).join('');
    }
    const noteImpulses = (evs) => {
      const fresh = evs.filter((e) => e.k === 'note' && e.t > noteSeen).length, newest = evs.reduce((m, e) => e.k === 'note' ? Math.max(m, e.t) : m, noteSeen);
      if (noteSeen && fresh) {
        for (let i = 0; i < Math.min(fresh, 4); i++) impulse(i * .45);
        evs.filter((e) => e.k === 'note' && e.t > noteSeen).slice(0, 4).forEach((e, i) => beams.push({ t: clock() + i * .45, id: e.term }));
        evs.filter((e) => e.k === 'note' && e.t > noteSeen).forEach((e) => addLiveDot(e.term));   // a new dot at the note's topic
        evs.filter((e) => e.k === 'note' && e.t > noteSeen).slice(0, 4).forEach((e, i) => { const n = byId[e.term], m = n && bodyMarks.find((x) => x.id === sysOf(n)); if (m) m.flash = clock() + i * .45; });   // its organ flashes
      }
      noteSeen = Math.max(noteSeen, newest) || 1;
    };
    const todayRow = (T) => [['posts', T.posts], ['uploaded', T.in], ['notes', T.note], ['dropped', T.empty]].map(([a, b]) => `<div><dt>${a}</dt><dd>${fmt(b || 0)}</dd></div>`).join('');
    // ?rec: after the first real answer the crawler keeps going on its own, every few seconds at random (uploads, then usually
    // a note with impulse, beam and a new dot, sometimes a dropped thread), so a short screen recording always shows it working
    let recFeedOn = false;
    function recFeed(L) {
      const evs = L.events.slice(0, 30), today = { ...L.today };
      const pool = nodes.filter((n) => n.kind === 'term').sort((a, b) => b.est - a.est).slice(0, 60).map((n) => n.id);
      let lastT = evs[0] ? evs[0].t : Date.now() / 1000, lastC = clock();
      const line = () => { $('clLiveLine').innerHTML = `<i></i><span>collecting data</span> · <b>${big(today.words || 0)}</b> <span>words today</span>`; };
      const push = (k, extra = {}) => {
        lastT += Math.max(1, clock() - lastC); lastC = clock();
        evs.unshift({ t: lastT, k, n: 24 + Math.floor(Math.random() * 40), q: k === 'note' ? (3 + Math.floor(Math.random() * 3)) + '/5' : '', ...extra }); evs.length = Math.min(evs.length, 30);
        if (k === 'in') { today.in = (today.in || 0) + 1; today.posts = (today.posts || 0) + 5 + Math.floor(Math.random() * 30); }
        if (k === 'note') today.note = (today.note || 0) + 1;
        renderStack(evs); noteImpulses(evs); line();
      };
      const step = () => {
        if (running) {
          push('in');
          const r = Math.random();
          if (r < .75) setTimeout(() => push('note', { term: pool[Math.floor(Math.random() * pool.length)] }), 700 + Math.random() * 1300);
          else if (r < .9) setTimeout(() => push('empty'), 900 + Math.random() * 1200);
        }
        setTimeout(step, 2600 + Math.random() * 3800);
      };
      setTimeout(step, 1200);
    }
    async function pollLive() {
      clearTimeout(liveT);
      if (REC && recFeedOn) return;
      if (PUB) {   // public: crawler and Codex always shown live, titles only as blurred stand-ins, no inbox
        try {
          const r = await fetch('/api/public/live', { cache: 'no-store' });
          if (r.ok) {
            const L = await r.json();if(window.ccDatabaseStats) window.ccDatabaseStats.accept(L);
            $('clLvAt').textContent = hm(L.now);
            $('clLvCrawler').innerHTML = '<i class="cl-dot on"></i>collecting'; $('clLvCrawlerSub').textContent = 'collecting data';
            $('clLvCodex').innerHTML = '<i class="cl-dot on"></i>AI condensing'; $('clLvCodexSub').textContent = 'every useful post becomes knowledge';
            $('clLvToday').innerHTML = todayRow(L.today); $('clLvQueue').textContent = '';
            const top = L.events[0] ? L.events[0].t : 0;
            $('clLvFeed').innerHTML = L.events.slice(0, 10).map((e, i) => { const [lab, c] = KIND[e.k] || [e.k.toUpperCase(), '#8a979e'];
              return `<li class="${e.t > seenTop && seenTop ? 'fresh' : ''}"><time>${hm(e.t)}</time><b style="--c:${c}">${lab}</b><span class="cl-blur" aria-hidden="true">${esc(filler(e.n, Math.floor(e.t)))}</span><em>${esc(e.q || '')}</em></li>`; }).join('') || '<li class="cl-muted">nothing yet</li>';
            seenTop = top; renderStack(L.events); noteImpulses(L.events);
            if (REC && !recFeedOn) { recFeedOn = true; recFeed(L); }
            $('clLiveLine').innerHTML = `<i></i><span>collecting data</span> · <b>${big(L.today.words || 0)}</b> <span>words today</span>`;
          }
        } catch (e) { /* try again */ }
        if (running) liveT = setTimeout(pollLive, 4000);
        return;
      }
      try {
        const r = await fetch('/api/admin/live', { cache: 'no-store', credentials: 'same-origin' });
        if (r.ok) {
          const L = await r.json();if(window.ccDatabaseStats) window.ccDatabaseStats.accept(L);const now = L.now, cAgo = L.seen.crawler ? now - L.seen.crawler : Infinity, kAgo = L.seen.codex ? now - L.seen.codex : Infinity;
          renderStack(L.events); noteImpulses(L.events);
          $('clLiveLine').innerHTML = `<i style="${cAgo < 90 ? '' : 'background:#56656c'}"></i><span>${cAgo < 90 ? 'collecting data' : cAgo < 900 ? 'crawler paused' : 'crawler off'}</span> · <b>${big(L.today.words || 0)}</b> <span>words today</span>`;
          const st = (a) => a < 90 ? 'on' : a < 900 ? 'idle' : '';
          $('clLvAt').textContent = hm(now);
          $('clLvCrawler').innerHTML = `<i class="cl-dot ${st(cAgo)}"></i>${cAgo < 90 ? 'collecting' : cAgo < 900 ? 'paused' : 'not running'}`;
          $('clLvCrawlerSub').textContent = L.seen.crawler ? 'last upload ' + ago(cAgo) : 'no upload yet';
          $('clLvCodex').innerHTML = `<i class="cl-dot ${st(kAgo)}"></i>${L.codex_mode ? 'Codex' : 'server worker'} ${kAgo < 900 ? 'condensing' : 'idle'}`;
          $('clLvCodexSub').textContent = L.seen.codex ? 'last note ' + ago(kAgo) : '';
          $('clLvToday').innerHTML = todayRow(L.today);
          $('clLvQueue').textContent = `${fmt(L.queue)} thread${L.queue === 1 ? '' : 's'} waiting to be condensed`;
          const top = L.events[0] ? L.events[0].t : 0;
          $('clLvFeed').innerHTML = L.events.slice(0, 10).map((e) => { const [lab, c] = KIND[e.k] || [e.k.toUpperCase(), '#8a979e'];
            return `<li class="${e.t > seenTop && seenTop ? 'fresh' : ''}"><time>${hm(e.t)}</time><b style="--c:${c}">${lab}</b><a href="${esc(safeUrl(e.url))}" target="_blank" rel="noopener noreferrer">${esc(String(e.title).split(' | ')[0])}</a><em title="${esc(e.info || '')}">${esc(((e.info || '').match(/^\d\/5/) || [String(e.info || '').slice(0, 18)])[0])}</em></li>`; }).join('') || '<li class="cl-muted">nothing yet</li>';
          seenTop = top;
          $('clLvQ').innerHTML = L.queue_items.slice(0, 8).map((q) => `<li style="grid-template-columns:minmax(0,1fr) auto"><a href="${esc(safeUrl(q.url))}" target="_blank" rel="noopener noreferrer">${esc(String(q.title).split(' | ')[0])}</a><em>${ago(q.age)}</em></li>`).join('') || '<li class="cl-muted">inbox empty</li>';
        }
      } catch (e) { /* offline for a moment: try again */ }
      if (running) liveT = setTimeout(pollLive, 4000);
    }

    renderActivity();
    select(byId[S.start] || nodes[0], false);
    selected = null; selSet = new Set(); setHl();   // panels show the start topic, the brain starts without highlighted lines
    return {
      start() { if (running) return; running = true; last = clock(); resize(); requestAnimationFrame(frame); pollLive(); },
      stop() { running = false; clearTimeout(liveT); },
      dispose() { running = false; clearTimeout(liveT); ro.disconnect(); renderer.dispose(); }
    };
  }

  window.ccCloud = {
    async open(root) {
      wanted = true;
      if (!app) { mounting = mounting || mount(root); try { await mounting; } catch { mounting = null; return; } }
      if (wanted) app.start();
    },
    close() { wanted = false; if (app) app.stop(); },
    reload(data) {
      // fresh numbers: rebuild the scene in place (the canvas and panels stay)
      const root = document.getElementById('clStage').closest('.cl').parentElement;
      if (app) app.dispose();
      root.innerHTML = HTML; pubCleanup(root); if (REC) root.querySelector('.cl').classList.add('cl-rec');
      app = build(data); $('clState').hidden = true; app.start();
    }
  };
})();
