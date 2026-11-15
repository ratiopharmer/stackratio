/* Guide graph for guide.html. Same brain renderer, only this cycle. */
(() => {
  const T = () => ({ notes: 1, threads: 4, threads_known: 4, posts_known: 4, links: [], q: 3, n7: 0, n1: 0 });
  const nodes = [
    ['retatrutide', 'Retatrutide', 'peptide', 'Peptid, das an GLP-1, GIP und den Glukagon-Rezeptor bindet. In Studien untersucht zur Gewichtsabnahme. Eingetragen mit 5 mg alle 5 Tage, gerade on.'],
    ['semaglutide', 'Semaglutide', 'peptide', 'GLP-1-Rezeptoragonist. Als Arzneimittel bei Diabetes und zur Gewichtsabnahme bekannt. Eingetragen mit 1 mg alle 5 Tage, gerade on.'],
    ['motsc', 'MOTS-c', 'peptide', 'Kurzes mitochondriales Peptid. Wird mit Stoffwechsel und Belastbarkeit in Verbindung gebracht. Eingetragen mit 2 mg Montag bis Freitag, Samstag und Sonntag off, gerade on.'],
    ['ghkcu', 'GHK-Cu', 'peptide', 'Kupferpeptid. Wird mit Haut, Gewebe und Regeneration in Verbindung gebracht. Eingetragen mit 2 mg Montag bis Freitag, Samstag und Sonntag off, gerade off.'],
    ['selank', 'Selank', 'peptide', 'Synthetisches Peptid, verwandt mit einem Fragment von Tuftsin. Wird mit Ruhe und Konzentration in Verbindung gebracht. Eingetragen mit 500 mcg Montag bis Freitag, Samstag und Sonntag off, gerade off.'],
    ['slu', 'SLU-PP-332', 'peptide', 'Experimentelle Substanz, beschrieben als Aktivator von ERR-Rezeptoren und als Nachbau von Ausdauerbelastung. Kein zugelassenes Arzneimittel. Eingetragen mit 5 mg jeden Tag, gerade on. Steht auch bei den Ancillaries.'],
    ['testosterone', 'Testosterone Enanthate', 'steroide', 'Testosteron mit Enanthat-Ester. Androgen und die Basis dieses Cycles. Eingetragen mit 300 mg pro Woche, Injektion alle 2 Tage, dauerhaft, subkutan und intramuskulär, gerade on.'],
    ['primobolan', 'Primobolan Enanthate', 'steroide', 'Methenolon-Enanthat, ein anaboles Steroid aus der DHT-Linie. Eingetragen mit 100 mg pro Woche, Injektion alle 2 Tage, wird gecycled, subkutan und intramuskulär, gerade on.'],
    ['hgh', 'HGH', 'steroide', 'Somatropin, menschliches Wachstumshormon. Eingetragen mit 4 bis 6 Einheiten jeden Tag, dauerhaft, subkutan, gerade on.'],
    ['omega3', 'Omega-3', 'supplements', 'Fischöl mit den Fettsäuren EPA und DHA. Eingetragen jeden Tag mit 3000 mg EPA und 1500 mg DHA, gerade on.'],
    ['bkomplex', 'Vitamin B Komplex', 'supplements', 'Alle acht B-Vitamine plus Myo-Inositol und Cholin: B1 1,1 mg, B2 1,4 mg, B3 16 mg, B5 6 mg, B6 1,4 mg, B7 50 µg, B9 200 µg, B12 2,5 µg, Myo-Inositol 2 mg, Cholin 2 mg. Jeden Tag, gerade on.'],
    ['d3k2', 'Vitamin D3 & K2', 'supplements', 'D3 für den Vitamin-D-Haushalt, K2 als Begleiter für den Calcium-Stoffwechsel. Eingetragen mit 5000 IU jeden Tag, gerade on.'],
    ['zink', 'Zink Bisglycinat', 'supplements', 'Zink, gebunden als Bisglycinat. Spurenelement für Enzyme, Haut und Immunsystem. Eingetragen mit 25 mg jeden Tag, gerade on.'],
    ['nac', 'NAC', 'supplements', 'N-Acetylcystein, eine Form von Cystein und Vorstufe von Glutathion. Eingetragen mit 800 mg jeden Tag, gerade on.'],
    ['tudca', 'TUDCA', 'supplements', 'Gallensalz (Tauroursodeoxycholsäure). Wird mit dem Gallefluss und der Leber in Verbindung gebracht. Eingetragen mit 2000 mg jeden Tag, gerade on.'],
    ['berberin', 'Berberin', 'supplements', 'Pflanzenstoff aus Berberitzen. Wird mit dem Zuckerstoffwechsel in Verbindung gebracht. Eingetragen mit 1040 mg jeden Tag, gerade on.'],
    ['creatine', 'Creatine', 'supplements', 'Creatin-Monohydrat. Füllt die Phosphat-Speicher der Muskelzelle. Eingetragen mit 9 g jeden Tag, gerade on.'],
    ['magbis', 'Magnesium Bisglycinat', 'supplements', 'Magnesium, gebunden an Glycin. Mineral für Muskeln, Nerven und Schlaf. Eingetragen mit 300 bis 500 mg jeden Tag, gerade on.'],
    ['magthr', 'Magnesium L-Threonat', 'supplements', 'Magnesiumsalz der Threonsäure. Eine zweite Magnesiumform neben dem Bisglycinat. Eingetragen mit 2083 mg jeden Tag, gerade on.'],
    ['taurine', 'L-Taurine', 'supplements', 'Aminosulfonsäure. Kommt in Muskel, Herz und Nervensystem vor. Eingetragen mit 1500 mg jeden Tag, gerade on.'],
    ['melatonin', 'Melatonin', 'supplements', 'Hormon der Zirbeldrüse, Taktgeber für den Schlaf. Eingetragen mit 6 mg jeden Tag, gerade on.'],
    ['promethazin', 'Promethazin', 'supplements', 'Älteres Antihistaminikum mit dämpfender Wirkung. Eingetragen mit 10 bis 30 mg zum Schlafen, nur manchmal.'],
    ['clenbuterol', 'Clenbuterol', 'ancillaries', 'Beta-2-Agonist. Wirkt auf die Atemwege und wird außerhalb der Zulassung mit Stoffwechsel in Verbindung gebracht. Eingetragen mit 40 bis 120 mcg, wird gecycled, gerade off.'],
    ['tadalafil', 'Tadalafil', 'ancillaries', 'PDE-5-Hemmer. Arzneimittel für die Erektion, mit langer Wirkdauer. Eingetragen mit 10 mg jeden Tag, gerade on.'],
    ['t3', 'T3', 'ancillaries', 'Trijodthyronin, das aktive Schilddrüsenhormon. Eingetragen mit 25 bis 40 mcg, wird gecycled, gerade off.'],
    ['methylenblau', 'Methylenblau', 'brain', 'Farbstoff und altes Arzneimittel. Kann in der Zelle Elektronen in der Atmungskette weitergeben. Eingetragen mit 20 mg Montag bis Freitag, Samstag und Sonntag off, gerade on.'],
    ['elvanse', 'Elvanse', 'brain', 'Lisdexamfetamin, ein verschreibungspflichtiges Stimulans. Im Körper wird daraus Dexamfetamin. Eingetragen mit 50 bis 70 mg nach Bedarf, zum Lernen.'],
    ['cdp', 'CDP Choline', 'brain', 'Citicolin, eine Cholinquelle für die Zellmembran und den Botenstoff Acetylcholin. Eingetragen mit 300 mg nach Bedarf, zum Lernen.'],
    ['modafinil', 'Modafinil', 'brain', 'Verschreibungspflichtiger Wachmacher. Wird bei Narkolepsie eingesetzt und hält wach, ohne ein klassisches Amphetamin zu sein. Eingetragen mit 100 mg nach Bedarf, zum Lernen.'],
    ['pregabalin', 'Pregabalin', 'brain', 'Gabapentinoid, verschreibungspflichtig. Dämpft übersteigerte Nervensignale. Eingetragen mit 150 bis 300 mg nach Bedarf, für soziale Events.'],
    ['lorazepam', 'Lorazepam', 'brain', 'Benzodiazepin, verschreibungspflichtig. Verstärkt die dämpfende Wirkung von GABA. Eingetragen mit 2,5 mg nach Bedarf, für soziale Events.'],
    ['nebivolol', 'Nebivolol', 'brain', 'Beta-Blocker. Senkt Puls und Blutdruck. Eingetragen mit 5 mg nach Bedarf, für soziale Events.'],
    ['isotretinoin', 'Isotretinoin', 'sicherheit', 'Vitamin-A-Säure, bekannt als Accutane. Arzneimittel gegen schwere Akne. Eingetragen mit 10 bis 20 mg täglich, nur falls Akne.'],
    ['androxal', 'Androxal', 'sicherheit', 'Enclomiphen. Blockiert Östrogenrezeptoren in der Hirnanhangsdrüse und kann die eigene Testosteron-Achse anstoßen. Eingetragen mit 25 mg täglich, nur falls Testosteron abgesetzt wird.'],
    ['nolvadex', 'Nolvadex', 'sicherheit', 'Tamoxifen, ein SERM. Blockiert Östrogen im Brustgewebe. Eingetragen mit 20 mg täglich, nur falls Gyno.'],
    ['aromasin', 'Aromasin', 'sicherheit', 'Exemestan. Hemmt die Aromatase, also die Umwandlung von Androgenen zu Östrogen. Eingetragen mit 6,25 mg zum Anfang, nur falls Aromatase-Probleme.'],
    ['finasterid', 'Finasterid', 'sicherheit', 'Hemmt die 5-Alpha-Reduktase, also die Umwandlung von Testosteron zu DHT. Eingetragen mit 1 mg, nur falls Haarausfall.'],
    ['hcg', 'HCG', 'sicherheit', 'Humanes Choriongonadotropin. Signal an die Hoden, ähnlich wie LH. Eingetragen mit 250 IU wöchentlich, nur falls Absetzen, für die Fruchtbarkeit.']
  ];
  const terms = {};
  nodes.forEach(([id]) => { terms[id] = T(); });
  const by = {};
  nodes.forEach(([id, , cluster]) => { (by[cluster] || (by[cluster] = [])).push(id); });
  const pairs = [];
  Object.values(by).forEach((ids) => {
    ids.forEach((id) => { if (id !== ids[0]) pairs.push([ids[0], id, 2]); });
  });
  [['hgh', 'retatrutide'], ['slu', 'tadalafil'], ['testosterone', 'aromasin'], ['testosterone', 'hcg'], ['elvanse', 'cdp'], ['pregabalin', 'lorazepam']].forEach(([a, b]) => pairs.push([a, b, 2]));
  window.ccGuideData = {
    guide: true,
    start: 'retatrutide',
    notes: nodes.length,
    threads: nodes.length,
    threads_known: nodes.length,
    posts_known: nodes.length,
    mean_posts: 1,
    median_posts: 1,
    max_posts: 1,
    terms,
    pairs,
    auto: nodes,
    thought: [],
    clusters: [
      { id: 'peptide', label: 'Peptide', color: '#f5b84b', center: [-2.05, -1.25, 0.0], spread: 0.85, lobe: 'cb', lobeName: 'Cerebellum' },
      { id: 'steroide', label: 'Steroide', color: '#7dd3fc', center: [-1.2, 2.1, 0.0], spread: 0.85, lobe: 'par', lobeName: 'Parietal lobe' },
      { id: 'supplements', label: 'Supplements', color: '#ece6da', center: [2.1, 1.3, 0.0], spread: 0.9, lobe: 'fr', lobeName: 'Frontal lobe' },
      { id: 'ancillaries', label: 'Ancillaries', color: '#f2727f', center: [-3.1, 0.7, 0.0], spread: 0.7, lobe: 'occ', lobeName: 'Occipital lobe' },
      { id: 'brain', label: 'Brain', color: '#c4b5fd', center: [0.5, -0.75, 2.0], spread: 0.75, lobe: 'tmp', lobeName: 'Temporal lobe' },
      { id: 'sicherheit', label: 'Sicherheit', color: '#5eead4', center: [-0.4, 0.12, 0.0], spread: 0.7, lobe: 'stem', lobeName: 'Brainstem & hypothalamus' }
    ]
  };
})();
