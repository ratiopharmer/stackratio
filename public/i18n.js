/* German / English for the public site. The pages stay English in the source; with German chosen this script
   swaps visible texts, placeholders, titles and meta texts by exact match (dictionary below), translates whole
   paragraphs where a sentence contains bold words or links (H), formats numbers the German way and watches the page
   for texts added later (chat hints, results, panels). Text written by users or by the AI is never touched: only
   exact dictionary matches change. Toggle: DE / EN button in the nav, choice kept in localStorage + cookie cc_lang. */
(() => {
  'use strict';
  const KEY = 'cc_lang';
  let lang = null;
  try { lang = localStorage.getItem(KEY); } catch { /* storage blocked */ }
  if (!lang) { const m = document.cookie.match(/(?:^|; )cc_lang=(de|en)/); lang = m ? m[1] : ((navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'en'); }
  const DE = lang === 'de';
  const setLang = (l) => {
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
    document.cookie = `cc_lang=${l}; path=/; max-age=31536000; samesite=lax; secure`;
    location.reload();
  };

  // ---------- dictionary: exact English text -> German ----------
  const T = {
    "This copy does not include the AI chat.": "Diese Kopie enthält den AI-Chat nicht.",
    "The original server only sends that page to members, and it is not in the public files. Your stack, the database and the calculator work here.": "Der Original-Server schickt diese Seite nur an Mitglieder, und sie liegt nicht in den öffentlichen Dateien. Dein Stack, die Datenbank und der Rechner laufen hier.",
    "This copy does not include the bloodwork reader.": "Diese Kopie enthält die Blutbild-Auswertung nicht.",
    "The public marker guide is still here.": "Der öffentliche Marker-Überblick ist weiterhin hier.",
    "The bodybuilding database.": "Die Bodybuilding-Datenbank.",
    "Browse connected topics on training, compounds and bloodwork.": "Entdecke vernetzte Themen zu Training, Wirkstoffen und Blutwerten.",
    "3-day free trial on Discord": "3 Tage kostenlos testen auf Discord",
    "Try it free for 3 days. Open a ticket on Discord to get your trial key.": "Teste die Seite 3 Tage kostenlos. Öffne ein Ticket auf Discord, um deinen Test-Key zu erhalten.",
    "Trial and paid keys are sent in the ticket. Paid plans: crypto only.": "Test-Keys und bezahlte Keys bekommst du im Ticket. Bezahlung der Tarife nur in Krypto.",
    "Current Cycle database shown as a particle brain": "Die Current-Cycle-Datenbank als Partikelgehirn",

    'General': 'Allgemein',
    'Show more topics': 'Weitere Themen anzeigen',
    // Body atlas and camera controls
    "Explore": "Erkunden",
    "Body atlas": "Körperatlas",
    "Systems": "Systeme",
    "All systems": "Alle Systeme",
    "Clear body filter": "Körperfilter aufheben",
    "No topics match these filters.": "Keine Themen für diese Filter.",
    "Structure": "Struktur",
    "Body & systems": "Körper & Systeme",
    "Nerve pathways": "Nervenbahnen",
    "Spine only": "Nur Wirbelsäule",
    "Brain only": "Nur Gehirn",
    "Framing": "Ausschnitt",
    "Camera framing": "Kameraausschnitt",
    "Brain close-up": "Gehirn im Detail",
    "Upper body": "Oberkörper",
    "Whole anatomy": "Gesamte Anatomie",
    "Angle": "Blickwinkel",
    "Camera angle": "Kamerawinkel",
    "Three-quarter": "Dreiviertel",
    "Front": "Vorne",
    "Side": "Seite",
    "Back": "Hinten",
    "Body structure": "Körperstruktur",
    "Current Cycle | Bodybuilding Knowledge & AI": "Current Cycle | Bodybuilding-Wissen & KI",
    "Bodybuilding knowledge. Connected.": "Bodybuilding-Wissen. Vernetzt.",
    "Explore the knowledge brain": "Wissensgehirn entdecken",
    "Ask the AI a question": "Stelle der KI eine Frage",
    "Ask about training, compounds and bloodwork with your stack in context.": "Frage zu Training, Wirkstoffen und Blutwerten – mit deinem Stack als Kontext.",
    "Inside the knowledge brain": "Im Wissensgehirn",
    "Explore posts, topics and their connections. Browse by body system or follow a subject deeper into the database.": "Entdecke Beiträge, Themen und ihre Verbindungen. Wähle ein Körpersystem oder folge einem Thema tiefer in die Datenbank.",
    "Explore & layout": "Entdecken & Aufbau",
    "Explore connected bodybuilding knowledge, compounds and physiology. Browse the knowledge brain, ask the AI, and use tools for your stack and bloodwork.": "Entdecke vernetztes Wissen zu Bodybuilding, Wirkstoffen und Physiologie. Erkunde das Wissensgehirn, frage die KI und nutze Werkzeuge für deinen Stack und deine Blutwerte.",
    'See the database grow': 'Sieh die Datenbank wachsen',
    'Unlock': 'Entdecke', 'the knowledge': 'das ganze Wissen',
    'Full knowledge entries, AI chat, your stack and bloodwork in one place.': 'Alle Wissenseinträge, KI-Chat, dein Stack und Blutbild an einem Ort.',
    "Brain": "Gehirn",
    "Brain regions": "Themenbereiche",
    "Show regions": "Bereiche einfärben",
    "Region colour": "Bereichsfarbe",
    "All regions": "Alle Bereiche",
    "Clear region filter": "Bereichsfilter aufheben",
    "Loading the database …": "Datenbank wird geladen …",
    "Brain | Current Cycle": "Gehirn | Current Cycle",
    "Brain – Current Cycle": "Gehirn – Current Cycle",
    "CurrentCycle | Bodybuilding Database": "CurrentCycle | Bodybuilding-Datenbank",
    "Connected topics": "Vernetzte Themen",
    "Explore connected bodybuilding knowledge, compounds and physiology. Browse the interactive database, ask the AI, and use tools for your stack and bloodwork.": "Entdecke vernetztes Wissen zu Bodybuilding, Wirkstoffen und Physiologie. Erkunde die interaktive Datenbank, frage die KI und nutze Werkzeuge für deinen Stack und deine Blutwerte.",
    "Explore the Current Cycle database as a brain: connected topics, coloured regions and a body atlas.": "Erkunde die Current-Cycle-Datenbank als Gehirn: vernetzte Themen, farbige Bereiche und ein Körperatlas.",
    "Explore connected bodybuilding topics in a live, interactive database.": "Entdecke vernetzte Bodybuilding-Themen in einer lebenden, interaktiven Datenbank.",
    // nav + shared
    'home': 'home', 'database': 'datenbank', 'calculator': 'rechner', 'ai chat': 'ki-chat', 'bloodwork': 'blutbild', 'account': 'konto', 'admin': 'admin',
    'Menu': 'Menü', 'scroll': 'scrollen', 'image': 'bild', 'send': 'senden', 'new': 'neu', 'save': 'speichern', 'mg': 'mg', 'ml': 'ml',
    'No connection to the server – internet down, server off or connection dropped.': 'Keine Verbindung zum Server – Internet weg, Server aus oder Verbindung abgebrochen.',
    'This page does not exist.': 'Diese Seite gibt es nicht.', 'back to the start': 'zurück zur Startseite',
    // home
    'Largest compound & bodybuilding database powered by AI': 'Die größte Wirkstoff- und Bodybuilding-Datenbank mit KI',
    'Try it for free – no account': 'Kostenlos testen – ohne Konto',
    'Largest compound & bodybuilding database': 'Die größte Wirkstoff- und Bodybuilding-Datenbank', 'Ask anything – free, no account': 'Frag alles – kostenlos, ohne Konto', 'Ask': 'Fragen', 'posts': 'Beiträge', 'Explore the database': 'Datenbank erkunden',
    'Type your question': 'Stell deine Frage', 'Your question': 'Deine Frage', 'Ask the AI for free': 'Frag die KI kostenlos', 'Ask free': 'Gratis fragen',
    'posts analysed, more every day': 'Beiträge ausgewertet, täglich mehr',
    'Stack configurator': 'Stack-Konfigurator', 'Your compounds, goal and notes in one place.': 'Deine Wirkstoffe, dein Ziel und deine Notizen an einem Ort.',
    'weekly': 'wöchentlich', '+ entry': '+ eintrag', 'goal': 'ziel', 'weight kg': 'gewicht kg', 'note': 'notiz',
    'Build your stack': 'Stack anlegen', 'AI chat': 'KI-Chat', 'Ask anything without restrictions about your cycle.': 'Frag alles zu deiner Kur, ohne Einschränkungen.',
    'waiting for your stack …': 'wartet auf deinen Stack …', 'Open the chat': 'Chat öffnen',
    'Bloodwork': 'Blutbild',
    'Upload a photo or PDF of your lab report. You get every value with its range and what it means on cycle.': 'Lade ein Foto oder PDF deines Laborbefunds hoch. Du bekommst jeden Wert mit Referenzbereich und dazu, was er während einer Kur bedeutet.',
    'Check your bloodwork': 'Blutbild auswerten', 'Which markers users track on cycle': 'Welche Werte Nutzer während einer Kur prüfen',
    'uploading': 'lädt hoch', 'in range': 'im Bereich', 'slightly high': 'leicht erhöht', 'slightly low': 'leicht erniedrigt', 'high': 'erhöht', 'low': 'erniedrigt',
    'reading report …': 'Befund wird gelesen …', 'reading report': 'Befund wird gelesen', 'Hematocrit': 'Hämatokrit', 'LDL': 'LDL',
    'Replace your': 'Ersetzt deinen', 'coach': 'Coach', 'Stack, chat and bloodwork. Cheaper than one coaching call.': 'Stack, Chat und Blutbild. Günstiger als ein einziges Coaching-Gespräch.',
    'Brain, chat, stack and bloodwork. Cheaper than one coaching call.': 'Gehirn, Chat, Stack und Blutbild. Günstiger als ein einziges Coaching-Gespräch.',
    'Knowledge brain': 'Wissensgehirn', 'Every forum post we read, condensed and sorted into topics. New topics appear on their own.': 'Jeder gelesene Forenbeitrag, verdichtet und nach Themen sortiert. Neue Themen entstehen von selbst.',
    'Open the brain': 'Gehirn öffnen', 'Database': 'Datenbank', 'Explore the database': 'Datenbank erkunden', 'explore the database': 'Datenbank erkunden',
    'Every dot is a real user post, condensed by AI and sorted into topics. New topics appear on their own.': 'Jeder Punkt ist ein echter Beitrag, von KI verdichtet und nach Themen sortiert. Neue Themen entstehen von selbst.', 'topics': 'Themen', 'words read': 'Wörter gelesen', 'newest topics': 'neueste Themen',
    '1 month': '1 Monat', 'lifetime': 'dauerhaft', 'Open a ticket on Discord': 'Ticket auf Discord öffnen',
    'Pay in crypto. You get your key in the ticket.': 'Bezahlt wird in Krypto. Deinen Key bekommst du im Ticket.',
    'Get full access →': 'Vollen Zugang holen →', 'Get full access': 'Vollen Zugang holen', 'Thinking…': 'Denkt nach …',
    'That was your last free question today.': 'Das war deine letzte kostenlose Frage für heute.',
    'Your free questions for today are used up.': 'Deine kostenlosen Fragen für heute sind aufgebraucht.',
    'AI not reachable right now. Please try again.': 'Die KI ist gerade nicht erreichbar. Bitte versuch es noch einmal.',
    'Connection lost – please try again.': 'Verbindung unterbrochen – bitte versuch es noch einmal.',
    'Testosterone Enanthate': 'Testosteron Enanthat', 'Masteron (Drostanolone)': 'Masteron (Drostanolon)', 'bloodwork in 8 weeks': 'Blutbild in 8 Wochen',
    'saved – the chat can see it now': 'gespeichert – der Chat sieht es jetzt', 'your stack: Testosterone Enanthate · Masteron': 'dein Stack: Testosteron Enanthat · Masteron',
    'Is estrogen still a problem with my current stack?': 'Ist Östrogen mit meinem aktuellen Stack noch ein Problem?',
    'Masteron itself does not turn into estrogen, and many users notice less water and fewer estrogen sides with it. The test in your stack still converts though, so estradiol can still climb. Most check E2 on bloodwork after a few weeks instead of guessing.':
      'Masteron selbst wird nicht zu Östrogen, und viele merken damit weniger Wasser und weniger Östrogen-Nebenwirkungen. Das Testosteron in deinem Stack aromatisiert aber weiter, Estradiol kann also trotzdem steigen. Die meisten lassen E2 nach ein paar Wochen im Blutbild prüfen, statt zu raten.',
    'based on your saved stack': 'auf Basis deines gespeicherten Stacks',
    // calculator
    'Peptide & Testosterone Calculator': 'Rechner für Peptide und Testosteron', 'Units on a U-100 syringe, ml per shot, concentration and how long a vial lasts.': 'Einheiten auf einer U-100-Spritze, ml pro Injektion, Konzentration und wie lange ein Vial reicht.',
    'Dosing': 'Dosierung', 'peptide': 'peptid', 'testosterone': 'testosteron', 'draw up to': 'aufziehen bis', 'volume': 'volumen', 'concentration': 'konzentration',
    'doses': 'dosen', 'compound': 'wirkstoff', 'other': 'andere', 'water': 'wasser', 'dose': 'dosis', 'per injection': 'pro injektion', 'vial lasts': 'vial reicht',
    'per week': 'pro woche', 'frequency': 'rhythmus', 'vial': 'vial', 'unit': 'Einheit', 'units': 'Einheiten', 'ed': 'täglich',
    'More than one 1.0 ml syringe – split it across several draws or injections.': 'Mehr als eine 1,0-ml-Spritze – auf mehrere Aufzüge oder Injektionen aufteilen.',
    'Below 2 units is hard to read accurately – use more water.': 'Unter 2 Einheiten lässt sich kaum genau ablesen – nimm mehr Wasser.',
    // chat
    'access code': 'zugangscode', 'Access code': 'Zugangscode', 'Attached image': 'Angehängtes Bild', 'Remove image': 'Bild entfernen', 'Attach image': 'Bild anhängen',
    'ask …': 'frage …', 'Question': 'Frage',
    'Look at my stack – which ancillaries fit with it?': 'Schau dir meinen Stack an – welche Ancillaries passen dazu?',
    'Bulk on 500 mg test – what is typically combined with it?': 'Aufbau mit 500 mg Testo – was wird typischerweise dazu kombiniert?',
    'Which blood markers to check on tren?': 'Welche Blutwerte sollte man bei Tren prüfen?',
    'Masteron to test – usual ratio?': 'Masteron zu Testo – übliches Verhältnis?',
    'Could not read the image.': 'Das Bild konnte nicht gelesen werden.', 'What do you see in this image?': 'Was siehst du auf diesem Bild?',
    // bloodwork page
    'Upload lab report': 'Befund hochladen', 'upload lab report': 'befund hochladen', 'male': 'mann', 'female': 'frau', 'analyse': 'auswerten', 'loading': 'lädt',
    'server restarting – waiting': 'Server startet neu – bitte warten',
    // bloodwork results (names + groups from blood_refs.json)
    'blood count': 'Blutbild', 'liver': 'Leber', 'kidneys & salts': 'Nieren & Salze', 'blood lipids': 'Blutfette', 'sugar': 'Zucker', 'hormones': 'Hormone', 'thyroid': 'Schilddrüse',
    'lab': 'Labor', 'typical reference ranges': 'übliche Referenzbereiche', 'amount': 'menge',
    'Alkaline phosphatase': 'Alkalische Phosphatase', 'Bilirubin total': 'Bilirubin gesamt', 'Cholesterol total': 'Gesamtcholesterin', 'Cortisol (morning)': 'Cortisol (morgens)',
    'Creatinine': 'Kreatinin', 'Free testosterone': 'Freies Testosteron', 'Glucose fasting': 'Nüchternglukose', 'HDL cholesterol': 'HDL-Cholesterin', 'Hemoglobin': 'Hämoglobin',
    'Insulin fasting': 'Nüchterninsulin', 'LDL cholesterol': 'LDL-Cholesterin', 'Platelets': 'Thrombozyten', 'Potassium': 'Kalium', 'Red blood cells': 'Erythrozyten',
    'Sodium': 'Natrium', 'Testosterone total': 'Testosteron gesamt', 'Total protein': 'Gesamteiweiß', 'Triglycerides': 'Triglyceride', 'Urea': 'Harnstoff', 'Uric acid': 'Harnsäure',
    'White blood cells': 'Leukozyten',
    // account
    'Account': 'Konto', 'log in': 'anmelden', 'register': 'registrieren', 'name': 'name', 'password': 'passwort', 'key': 'key',
    'forgot your password?': 'passwort vergessen?', 'open a ticket on discord': 'öffne ein Ticket auf Discord', '– you get a new one there.': '– dort bekommst du ein neues.',
    'Key': 'Key', 'redeem': 'einlösen', 'entry': 'eintrag', 'note (experience, bloodwork, side effects …)': 'notiz (erfahrung, blutwerte, nebenwirkungen …)',
    'change password': 'passwort ändern', 'log out': 'abmelden', 'delete account': 'konto löschen',
    'You logged in with a temporary password – set your own now.': 'Du hast dich mit einem vorläufigen Passwort angemeldet – leg jetzt dein eigenes fest.',
    'current password': 'aktuelles passwort', 'new password': 'neues passwort', 'at least 8 characters': 'mindestens 8 Zeichen', 'save password': 'passwort speichern',
    '2× weekly': '2× pro Woche', '3× weekly': '3× pro Woche', 'every 2 days': 'alle 2 Tage', 'every 3 days': 'alle 3 Tage', 'as needed': 'bei Bedarf',
    'create account': 'konto erstellen', '$10 / month · $30 lifetime · crypto': '$10 / Monat · $30 dauerhaft · Krypto', 'get a key on discord': 'key auf Discord holen',
    'access revoked': 'Zugang entzogen', 'no active key': 'kein aktiver Key', 'My stack': 'Mein Stack', 'log in with an active key to use this.': 'Melde dich mit einem aktiven Key an, um das zu nutzen.',
    'ask the chat →': 'den Chat fragen →', 'password changed – other devices have to log in again.': 'Passwort geändert – andere Geräte müssen sich neu anmelden.',
    'Delete account and stack permanently? Enter your password to confirm:': 'Konto und Stack endgültig löschen? Zur Bestätigung dein Passwort eingeben:',
    'account deleted.': 'Konto gelöscht.',
    // server messages
    'AI answer was not a valid result': 'Die KI-Antwort war kein gültiges Ergebnis', 'AI not reachable right now.': 'Die KI ist gerade nicht erreichbar.',
    'Analysis no longer available – the server restarted or it is older than 30 min. Please analyse again.': 'Die Auswertung ist nicht mehr verfügbar – der Server wurde neu gestartet oder sie ist älter als 30 Minuten. Bitte erneut auswerten.',
    'Another account is logged in – reload the page.': 'Ein anderes Konto ist angemeldet – lade die Seite neu.',
    'Answer no longer available – please ask again.': 'Die Antwort ist nicht mehr verfügbar – bitte frag noch einmal.',
    'Bad request.': 'Ungültige Anfrage.', 'Current password is wrong.': 'Das aktuelle Passwort ist falsch.',
    'File did not arrive completely (parts missing or older than 30 min) – please upload again.': 'Die Datei ist nicht vollständig angekommen (Teile fehlen oder älter als 30 Minuten) – bitte erneut hochladen.',
    'Image parts do not match.': 'Die Bildteile passen nicht zusammen.', 'Image too large.': 'Das Bild ist zu groß.', 'Invalid image part.': 'Ungültiger Bildteil.', 'Invalid message.': 'Ungültige Nachricht.',
    'Limit reached – please try again later.': 'Limit erreicht – bitte später noch einmal versuchen.', 'Name is already taken.': 'Der Name ist schon vergeben.',
    'Name: 3–24 characters, only a–z, 0–9, dot, dash, underscore.': 'Name: 3–24 Zeichen, nur a–z, 0–9, Punkt, Bindestrich, Unterstrich.',
    'New password: at least 8 characters.': 'Neues Passwort: mindestens 8 Zeichen.', 'Password: at least 8 characters.': 'Passwort: mindestens 8 Zeichen.',
    'No access – log in with an account that has an active key.': 'Kein Zugang – melde dich mit einem Konto mit aktivem Key an.',
    'No answer received – please rephrase the question.': 'Keine Antwort erhalten – bitte formuliere die Frage anders.', 'No question.': 'Keine Frage.', 'No report attached.': 'Kein Befund angehängt.',
    'No values recognised – upload the report with results and reference ranges, not the invoice.': 'Keine Werte erkannt – lade den Befund mit Ergebnissen und Referenzbereichen hoch, nicht die Rechnung.',
    'Not logged in – please log in again.': 'Nicht angemeldet – bitte melde dich erneut an.', 'Not logged in.': 'Nicht angemeldet.',
    'The new password is the same as the current one.': 'Das neue Passwort ist dasselbe wie das aktuelle.',
    'Too many attempts – try again in 10 minutes.': 'Zu viele Versuche – versuch es in 10 Minuten noch einmal.', 'Too many failed attempts – try again in 15 minutes.': 'Zu viele Fehlversuche – versuch es in 15 Minuten noch einmal.',
    'Unknown account.': 'Unbekanntes Konto.', 'Unknown key.': 'Unbekannter Key.', 'Wrong name or password.': 'Name oder Passwort falsch.', 'Wrong password.': 'Falsches Passwort.',
    // database (brain) page
    'knowledge brain': 'wissensgehirn', 'Thought path': 'Gedankengang', 'THOUGHT PATH': 'GEDANKENGANG',
    'drag to turn · shift + drag to move · scroll to zoom in · click a topic or fibre · esc for overview': 'ziehen zum Drehen · Shift + Ziehen zum Verschieben · scrollen zum Zoomen · Thema anklicken · Esc für Übersicht',
    'drag to turn · shift + drag to move · scroll to zoom in · click a topic or use the arrow keys · esc for overview': 'ziehen zum Drehen · Shift + Ziehen zum Verschieben · scrollen zum Zoomen · Thema anklicken oder Pfeiltasten · Esc für Übersicht',
    'overview': 'übersicht', 'loading the knowledge base …': 'Wissensdatenbank wird geladen …', 'Crawler · live': 'Crawler · live', 'Crawler log': 'Crawler-Log',
    'uploads, notes, dropped – live': 'Uploads, Notizen, verworfen – live', 'Activity': 'Aktivität', 'threads read': 'gelesene Threads', 'new notes': 'neue Notizen', 'answers': 'Antworten',
    'Most discussed': 'Meistdiskutiert', 'posts, estimated': 'Beiträge, geschätzt', 'Focus': 'Fokus', 'Relations': 'Beziehungen', 'Matrix': 'Matrix', 'overlap': 'Überschneidung',
    'Today': 'Heute', 'since 00:00': 'seit 00:00', 'posts': 'Beiträge', 'uploaded': 'hochgeladen', 'notes': 'Notizen', 'dropped': 'verworfen', 'threads': 'Threads',
    'posts counted': 'gezählte Beiträge', 'posts est.': 'Beiträge geschätzt', 'shared notes': 'gemeinsame Notizen', 'Often together with': 'Oft zusammen mit',
    'collecting': 'sammelt', 'collecting data': 'sammelt Daten', 'AI condensing': 'KI verdichtet', 'every useful post becomes knowledge': 'jeder brauchbare Beitrag wird zu Wissen',
    'UPLOAD': 'UPLOAD', 'NOTE': 'NOTIZ', 'DROPPED': 'VERWORFEN', 'Upload': 'Upload', 'Note': 'Notiz', 'Dropped': 'Verworfen', 'nothing yet': 'noch nichts', 'Questions': 'Fragen', 'More questions': 'Weitere Fragen', 'loading …': 'lädt …',
    'Get access to read the answers': 'Zugang holen, um die Antworten zu lesen', 'Nothing here yet.': 'Hier ist noch nichts.', 'Click a node.': 'Klick auf einen Knoten.',
    'no strong connection': 'keine starke Verbindung', 'chain': 'Kette', 'Back': 'Zurück', 'Topic': 'Thema',
    'done': 'fertig', 'posts read ·': 'Beiträge gelesen ·', 'posts read': 'Beiträge gelesen', 'kept ·': 'übernommen ·', 'kept': 'übernommen',
    'words read': 'Wörter gelesen', 'words kept': 'Wörter übernommen', 'BLOOD': 'BLUT',
    'notes today': 'Notizen heute', 'posts today': 'Beiträge heute', 'words today': 'Wörter heute', 'Size by': 'Größe nach', 'Order': 'Reihenfolge', 'Biggest first': 'Größte zuerst', 'Active now': 'Gerade aktiv', 'New this week': 'Neu diese Woche', 'Source quality': 'Quellqualität', 'Same size': 'Gleich groß', 'Filter': 'Filter', 'Sources': 'Quellen', 'All sources': 'Alle Quellen', 'Good sources only': 'Nur gute Quellen', 'Talked about': 'Besprochen', 'All time': 'Gesamte Zeit', 'Last 7 days': 'Letzte 7 Tage', 'Last 24 h': 'Letzte 24 h', 'Activity this week': 'Aktivität diese Woche', 'New today': 'Neu heute', 'Best sources': 'Beste Quellen', 'Most certain': 'Am sichersten', 'Top sources only': 'Nur Top-Quellen', 'Any certainty': 'Jede Sicherheit', 'Half the threads read': 'Hälfte der Threads gelesen', 'Most threads read': 'Meiste Threads gelesen', 'Hide': 'Ausblenden', 'Dim': 'Abdunkeln', 'Biggest only': 'Nur die größten', 'Filtered topics': 'Gefilterte Themen', 'Sources & time': 'Quellen & Zeit', 'Certainty': 'Sicherheit', 'Limits': 'Grenzen', 'Lines & numbers': 'Linien & Zahlen', 'quiet': 'ruhig', 'busy this week': 'viel los diese Woche', 'weak sources': 'schwache Quellen', 'top sources': 'Top-Quellen', 'Save picture': 'Bild speichern', 'Combined': 'Kombiniert', 'waiting': 'wartend', 'crawler paused': 'Crawler pausiert', 'crawler off': 'Crawler aus',
    'Arrangement': 'Anordnung', 'Anatomy': 'Anatomie', 'Spheres': 'Kugeln', 'Wheel': 'Rad', 'Table': 'Tabelle', 'Clusters': 'Gruppen', 'unsorted': 'ohne Thema', 'Arrange': 'Anordnen', 'Data': 'Daten', 'Form': 'Form', 'Groups': 'Gruppierung', 'Counts': 'Zahlen', 'Hide unsorted': 'Ohne Thema ausblenden', 'Show': 'Anzeigen', 'Topics': 'Themen', 'Posts': 'Beiträge', 'Labels': 'Beschriftungen', 'Limit rotation': 'Drehung begrenzen', 'Look': 'Aussehen', 'Reset': 'Zurücksetzen', 'Overview': 'Übersicht', 'threads read per day': 'Threads pro Tag gelesen', 'more': 'weitere', 'fewer': 'weniger', 'Close': 'Schließen', 'Anatomy to data': 'Anatomie bis Daten',
    'Search topics': 'Themen suchen', 'View': 'Ansicht', 'Colour theme': 'Farbthema', 'Motion': 'Bewegung', 'Turning': 'Drehen', 'Speed': 'Tempo',
    'Drawn': 'Darstellung', 'Links': 'Linien', 'Point size': 'Punktgröße', 'By topic': 'Nach Thema',
    'Name matches': 'Treffer beschriften', 'Galaxy': 'Galaxie', 'Web': 'Netz', 'One spiral arm per group, its biggest topics close to the core.': 'Ein Spiralarm pro Gruppe, die größten Themen nah am Kern.', 'Topics that come up in the same notes pull each other close.': 'Themen, die in denselben Notizen vorkommen, ziehen sich an.', 'Every topic a tower as high as its posts, one district per group.': 'Jedes Thema ein Turm, so hoch wie seine Beiträge, ein Viertel pro Gruppe.', 'View presets': 'Ansichten', 'From above': 'Von oben', 'From below': 'Von unten', "Bird's eye": "Vogelperspektive", 'Looking up': 'Blick nach oben', 'Portrait': 'Porträt', 'Whole body': 'Ganzer Körper', 'Network': 'Netzwerk', 'City': 'Stadt', 'Phases': 'Phasen', 'Skyline': 'Skyline', 'Cycle': 'Zyklus', 'Find': 'Finden', 'Search options': 'Suchoptionen', 'Search in': 'Suchen in', 'Allow typos': 'Tippfehler erlauben', 'Light up matches': 'Treffer aufleuchten lassen', 'Only shown topics': 'Nur sichtbare Themen', 'Results': 'Ergebnisse', 'Sort hits': 'Treffer sortieren',
    'Statistics': 'Statistik', 'Share by group': 'Anteil nach Gruppe', 'Measure': 'Messgröße', 'Top lists': 'Bestenlisten', 'Strongest links': 'Stärkste Verbindungen', 'Data quality': 'Datenqualität', 'Threads read per topic': 'Gelesene Threads pro Thema', 'Source score': 'Quellenwert',
    'Names & definitions': 'Namen & Definitionen', 'Names only': 'Nur Namen', 'Best match': 'Beste Übereinstimmung', 'Most posts': 'Meiste Beiträge', 'Active today': 'Heute aktiv', 'Posts (est.)': 'Beiträge (geschätzt)', 'Threads': 'Threads', 'Threads read': 'Gelesene Threads', 'Connections': 'Verbindungen',
    'Topics shown': 'Sichtbare Themen', 'Posts counted': 'Gezählte Beiträge', 'Average source score': 'Durchschnittlicher Quellenwert', 'Topic pairs talked about together': 'Gemeinsam besprochene Themenpaare', 'Data from': 'Datenstand',
    'match': 'Treffer', 'matches': 'Treffer', 'shown': 'angezeigt', 'filtered': 'gefiltert', 'topic group': 'Themengruppe', 'No topic found. Try fewer letters.': 'Kein Thema gefunden. Versuch weniger Buchstaben.', 'No topic matches the filter.': 'Kein Thema passt zum Filter.', 'Share by': 'Anteil nach', 'Rank by': 'Sortieren nach',
    'Body markers': 'Körper-Marker', 'Readout': 'Werte im Tooltip', 'Fine motion': 'Feinbewegung', 'Drift': 'Schweben', 'Pulse': 'Pulsieren', 'Dots': 'Punkte', 'Fibres': 'Fasern', 'Fibre glow': 'Faserleuchten', 'Organ glow': 'Organleuchten', 'Labelled topics': 'Beschriftete Themen', 'Camera': 'Kamera', 'Field of view': 'Blickwinkel', 'Quality': 'Qualität', 'Interface': 'Oberfläche', 'Threads chart': 'Thread-Diagramm', 'Hint': 'Hinweis', 'Background glow': 'Hintergrundleuchten',
    'Hormone axis': 'Hormonachse', 'Sex drive & fertility': 'Libido & Fruchtbarkeit', 'Heart & blood': 'Herz & Blut', 'Kidneys': 'Nieren', 'Metabolism & weight': 'Stoffwechsel & Gewicht', 'Muscle & joints': 'Muskeln & Gelenke', 'Skin & hair': 'Haut & Haare', 'Sleep & mind': 'Schlaf & Psyche',
    'Brightness': 'Helligkeit', 'Colour': 'Farbe', 'Label size': 'Schriftgröße', 'Saturation': 'Sättigung', 'Body': 'Körper', 'Brain colour': 'Gehirnfarbe', 'Panel colour': 'Panelfarbe', 'Teal': 'Petrol', 'Blue': 'Blau', 'Green': 'Grün', 'Violet': 'Violett', 'Red': 'Rot', 'Sand': 'Sand', 'Setups': 'Setups', 'Save': 'Speichern', 'Copy link': 'Link kopieren', 'Copied': 'Kopiert', 'None': 'Keine', 'saved': 'gespeichert',
    'Layout': 'Aufbau', 'Quick views': 'Schnellansichten', 'Visible': 'Sichtbar', 'Off': 'Aus', 'Background': 'Hintergrund', 'Own colour': 'Eigene Farbe', 'Night': 'Nacht', 'Graphite': 'Graphit', 'Navy': 'Marine', 'Moss': 'Moos', 'Plum': 'Pflaume', 'Rust': 'Rost', 'Shape': 'Form', 'Sort into': 'Sortieren nach', 'Tint by': 'Färben nach', 'Hide below': 'Ausblenden unter',
    'One group': 'Nur eine Gruppe', 'Lines': 'Linien', 'Numbers': 'Zahlen', 'Keep': 'Behalten', 'Keep this view as …': 'Ansicht behalten als …',
    'The whole brain': 'Das ganze Gehirn', 'What gets stacked together?': 'Was wird kombiniert?', 'Which sides come up?': 'Welche Nebenwirkungen kommen vor?',
    'When in a cycle?': 'Wann im Zyklus?', 'Where is data thin?': 'Wo sind die Daten dünn?', 'What is new?': 'Was ist neu?',
    'Default': 'Standard', 'Steel': 'Stahl', 'Sage': 'Salbei', 'Ember': 'Glut', 'Ocean': 'Ozean', 'Sunset': 'Abendrot', 'Toxic': 'Gift', 'Ice': 'Eis', 'Mint': 'Minze', 'Rose': 'Rosé', 'Chalk': 'Kreide',
    'CRAWLER / DAY': 'CRAWLER / TAG', 'AI ANSWERS / DAY': 'KI-ANTWORTEN / TAG', 'reading forum threads': 'sammelt Daten',
    // topics + clusters
    'Frontal lobe': 'Frontallappen', 'Parietal lobe': 'Scheitellappen', 'Temporal lobe': 'Schläfenlappen', 'Occipital lobe': 'Hinterhauptslappen', 'Cerebellum': 'Kleinhirn', 'Brainstem & hypothalamus': 'Hirnstamm & Hypothalamus', 'Androgen base': 'Androgen-Basis', 'Anabolics': 'Anabolika', 'Estrogen & PCT': 'Östrogen & PCT', 'GH & peptides': 'GH & Peptide', 'Goals & sides': 'Ziele & Nebenwirkungen',
    'Testosterone': 'Testosteron', 'Nandrolone': 'Nandrolon', 'Trenbolone': 'Trenbolon', 'Anastrozole': 'Anastrozol', 'Prolactin': 'Prolaktin', 'Cabergoline': 'Cabergolin',
    'Kidney': 'Niere', 'Lipids': 'Blutfette', 'Liver': 'Leber', 'Blood pressure': 'Blutdruck', 'Peptides': 'Peptide', 'Retatrutide': 'Retatrutid', 'Tirzepatide': 'Tirzepatid',
    'Semaglutide': 'Semaglutid', 'Hair loss': 'Haarausfall', 'Sleep': 'Schlaf', 'Acne': 'Akne',
    'Androgen and the base of almost every stack. The reference point of most notes.': 'Androgen und Basis fast jedes Stacks. Der Bezugspunkt der meisten Notizen.',
    'Testosterone replacement: long-term, medically supervised use.': 'Testosteronersatztherapie: langfristig und ärztlich begleitet.',
    'Low maintenance phase between two cycles.': 'Niedrig dosierte Erhaltungsphase zwischen zwei Kuren.',
    "Hormone that keeps the body's own testicular function going.": 'Hormon, das die körpereigene Hodenfunktion aufrechterhält.',
    'DHT-based anabolic, described as mild in the notes.': 'Anabolikum auf DHT-Basis, in den Notizen als mild beschrieben.',
    '19-nor anabolic (Deca, NPP), mostly mentioned for bulking.': '19-Nor-Anabolikum (Deca, NPP), meist im Zusammenhang mit dem Aufbau genannt.',
    'Strong 19-nor anabolic, often tied to side effects in the notes.': 'Starkes 19-Nor-Anabolikum, in den Notizen oft mit Nebenwirkungen verbunden.',
    'DHT derivative (drostanolone), popular when cutting.': 'DHT-Derivat (Drostanolon), beliebt in der Diät.',
    'Oral anabolic (oxandrolone), common in cutting and beginner questions.': 'Orales Anabolikum (Oxandrolon), häufig in Diät- und Einsteigerfragen.',
    'Oral anabolic for bulking, strongly aromatising.': 'Orales Anabolikum für den Aufbau, aromatisiert stark.',
    'DHT derivative (stanozolol), oral or injected.': 'DHT-Derivat (Stanozolol), oral oder injiziert.',
    'The main estrogen and the most frequent companion topic of testosterone.': 'Das wichtigste Östrogen und das häufigste Begleitthema von Testosteron.',
    'Aromatase inhibitor (exemestane).': 'Aromatasehemmer (Exemestan).', 'Aromatase inhibitor (Arimidex).': 'Aromatasehemmer (Arimidex).',
    'Post-cycle therapy: the phase after coming off.': 'Post-Cycle-Therapie: die Phase nach dem Absetzen.', 'SERM (tamoxifen), a PCT topic.': 'SERM (Tamoxifen), ein PCT-Thema.',
    'Hormone discussed mainly with 19-nor compounds.': 'Hormon, das vor allem bei 19-Nor-Wirkstoffen besprochen wird.', 'SERM (clomiphene), a PCT topic.': 'SERM (Clomifen), ein PCT-Thema.',
    'Dopamine agonist (cabergoline).': 'Dopaminagonist (Cabergolin).', 'Labs as the control instrument before, during and after a cycle.': 'Laborwerte als Kontrolle vor, während und nach einer Kur.',
    'Kidney markers such as creatinine and eGFR.': 'Nierenwerte wie Kreatinin und eGFR.', 'HDL, LDL and cholesterol: the cardiovascular markers.': 'HDL, LDL und Cholesterin: die Herz-Kreislauf-Werte.',
    'Liver markers such as ALT and AST, mostly with orals.': 'Leberwerte wie ALT und AST, meist bei Oralia.', 'Share of red blood cells; rises with androgens.': 'Anteil der roten Blutkörperchen, steigt unter Androgenen.',
    'Blood pressure as the everyday marker.': 'Blutdruck als Wert für den Alltag.', 'Growth hormone. The bridge between peptide and steroid topics.': 'Wachstumshormon. Die Brücke zwischen Peptid- und Steroidthemen.',
    'Insulin and insulin sensitivity, often next to HGH.': 'Insulin und Insulinsensitivität, oft zusammen mit HGH.', 'Peptides in general.': 'Peptide allgemein.',
    'GLP-1/GIP/glucagon agonist, a new cutting topic.': 'GLP-1/GIP/Glukagon-Agonist, ein neues Diätthema.', 'Peptide discussed for tendons and healing.': 'Peptid, das für Sehnen und Heilung besprochen wird.',
    'Peptide, almost always mentioned with BPC-157.': 'Peptid, fast immer zusammen mit BPC-157 genannt.', 'GLP-1/GIP agonist.': 'GLP-1/GIP-Agonist.', 'GLP-1 agonist.': 'GLP-1-Agonist.',
    'Cutting phase: lose fat, keep muscle.': 'Diätphase: Fett verlieren, Muskeln halten.', 'Building phase with a calorie surplus.': 'Aufbauphase mit Kalorienüberschuss.',
    'Libido as feedback from the hormone balance.': 'Libido als Rückmeldung des Hormonhaushalts.', 'DHT-driven hair loss.': 'DHT-bedingter Haarausfall.',
    'Sleep quality and sleep problems.': 'Schlafqualität und Schlafprobleme.', 'Acne on androgens.': 'Akne unter Androgenen.',
    // bloodwork article (headings and short lines; paragraphs with bold words are in H below)
    'Bloodwork on cycle': 'Blutbild während der Kur', 'Which values people check on cycle, why they change, when to test and how to read the report.': 'Welche Werte während einer Kur geprüft werden, warum sie sich verändern, wann man testet und wie man den Befund liest.',
    'When users test': 'Wann getestet wird', 'Before': 'Vorher', 'On cycle': 'Während der Kur', 'After': 'Danach',
    'A full baseline panel a few weeks before starting. Without it you cannot tell later what the compounds changed and what was already there.': 'Ein komplettes Ausgangsblutbild ein paar Wochen vor dem Start. Ohne das lässt sich später nicht sagen, was die Wirkstoffe verändert haben und was schon vorher da war.',
    'Around 6–8 weeks in, when most values have settled at their new level – and again on longer runs.': 'Nach etwa 6–8 Wochen, wenn sich die meisten Werte auf ihrem neuen Niveau eingependelt haben – und bei längeren Kuren noch einmal.',
    "A few weeks after stopping, to see whether values come back to baseline and the body's own production restarts.": 'Ein paar Wochen nach dem Absetzen, um zu sehen, ob die Werte zum Ausgangsniveau zurückkehren und die körpereigene Produktion wieder anläuft.',
    'Hematocrit and hemoglobin': 'Hämatokrit und Hämoglobin', 'Lipids: HDL, LDL, triglycerides': 'Blutfette: HDL, LDL, Triglyceride', 'Liver values: ALT, AST, GGT': 'Leberwerte: ALT, AST, GGT',
    'Estradiol': 'Estradiol', 'Testosterone, LH and FSH': 'Testosteron, LH und FSH', 'Kidney values': 'Nierenwerte', 'Not in the blood, but on the list': 'Nicht im Blut, aber auf der Liste',
    'Reading your report': 'Den Befund lesen', 'Check your bloodwork ': 'Blutbild auswerten', 'Ask the AI a free question': 'Der KI eine kostenlose Frage stellen',
    'Got a lab report? Upload a photo or PDF and get every value with its range and what it means on cycle.': 'Du hast einen Laborbefund? Lade ein Foto oder PDF hoch und bekomm jeden Wert mit Referenzbereich und dazu, was er während einer Kur bedeutet.',
    'This page sums up what users commonly track and report. It is not medical advice and does not replace a doctor.': 'Diese Seite fasst zusammen, was Nutzer üblicherweise prüfen und berichten. Sie ist keine medizinische Beratung und ersetzt keinen Arzt.',
    // titles + meta
    'Current Cycle | Stack Builder, AI Chat & Bloodwork': 'Current Cycle | Stack-Builder, KI-Chat & Blutbild',
    'Current Cycle – plan your cycle with an AI that knows your stack. Stack builder, AI chat built on 560,000+ real user posts, bloodwork analysis and dosing calculator.': 'Current Cycle – plane deine Kur mit einer KI, die deinen Stack kennt. Stack-Builder, KI-Chat auf Basis von über 560.000 echten Nutzerbeiträgen, Blutbild-Auswertung und Dosierungsrechner.',
    'Peptide & Testosterone Calculator – Units, ml, Doses | Current Cycle': 'Rechner für Peptide und Testosteron – Einheiten, ml, Dosen | Current Cycle',
    'Free calculator for peptides and testosterone: units on a U-100 syringe from vial size and water, plus ml per shot, concentration and how long a vial lasts.': 'Kostenloser Rechner für Peptide und Testosteron: Einheiten auf einer U-100-Spritze aus Vialgröße und Wasser, dazu ml pro Injektion, Konzentration und wie lange ein Vial reicht.',
    'Chat · Current Cycle': 'Chat · Current Cycle', 'Bloodwork · Current Cycle': 'Blutbild · Current Cycle', 'Account · Current Cycle': 'Konto · Current Cycle', 'Not found · Current Cycle': 'Nicht gefunden · Current Cycle',
    'Knowledge Brain | Current Cycle': 'Wissensgehirn | Current Cycle', 'Knowledge Brain – Current Cycle': 'Wissensgehirn – Current Cycle',
    'The Current Cycle knowledge base as a live brain: every dot is a real user post, sorted by topic and condensed by AI while you watch.': 'Die Wissensdatenbank von Current Cycle als lebendes Gehirn: Jeder Punkt ist ein echter Nutzerbeitrag, nach Thema sortiert und live von der KI verdichtet.',
    'Every dot is a real user post. Watch the knowledge base grow live.': 'Jeder Punkt ist ein echter Nutzerbeitrag. Sieh zu, wie die Wissensdatenbank live wächst.',
    'Bloodwork on Cycle: Which Markers Users Track | Current Cycle': 'Blutbild während der Kur: Welche Werte Nutzer prüfen | Current Cycle',
    'Bloodwork on Cycle: Which Markers Users Track': 'Blutbild während der Kur: Welche Werte Nutzer prüfen',
  };

  // patterns for texts with numbers or names in them
  const P = [
    [/^(\d+) saved$/, (m, n) => `${n} ${T.saved}`],
    [/^(\d+) free questions? left today\.$/, (m, n) => n === '1' ? 'Noch 1 kostenlose Frage für heute.' : `Noch ${n} kostenlose Fragen für heute.`],
    [/^recognised from “(.+)”$/, (m, a) => `erkannt aus „${a}“`],
    [/^knowledge brain · data (.+)$/, (m, a) => `wissensgehirn · stand ${a}`],
    [/^\+([\d.,]+) today · \+([\d.,]+) week$/, (m, a, b) => `+${a} heute · +${b} Woche`],
    [/^([\d.,]+) topics · ~([\d.,]+) posts$/, (m, a, b) => `${a} Themen · ~${b} Beiträge`],
    [/^([\d.,]+) threads · ~([\d.,]+) posts$/, (m, a, b) => `${a} Threads · ~${b} Beiträge`],
    [/^step (\d+) of (\d+)$/, (m, a, b) => `Schritt ${a} von ${b}`],
    [/^Thought path · step (\d+)$/, (m, a) => `Gedankengang · Schritt ${a}`],
    [/^Focus · thought path$/, () => 'Fokus · Gedankengang'],
    [/^Often discussed with$/, () => 'Oft besprochen mit'],
    [/^(\d+) s ago$/, (m, a) => `vor ${a} s`], [/^(\d+) min ago$/, (m, a) => `vor ${a} min`], [/^(\d+) h ago$/, (m, a) => `vor ${a} h`],
    [/^until (.+)$/, (m, a) => `bis ${a}`],
    [/^AI not reachable right now \((.*)\)\.? ?Please try again\.?$/, (m, a) => `Die KI ist gerade nicht erreichbar (${a}). Bitte versuch es noch einmal.`],
    [/^Limit reached \((\d+) analyses per hour\) – try again later\.$/, (m, a) => `Limit erreicht (${a} Auswertungen pro Stunde) – bitte später noch einmal versuchen.`],
    [/^(.*) Please try again\.$/, (m, a) => (T[a] || a) + ' Bitte versuch es noch einmal.'],
    [/^([\d.,]+) weeks$/, (m, a) => `${a} Wochen`],
    [/^lab (.+?) · typical (.+)$/, (m, a, b) => `Labor ${a} · üblich ${b}`], [/^lab (.+)$/, (m, a) => `Labor ${a}`], [/^typical (.+)$/, (m, a) => `üblich ${a}`],
    [/^(\d+(?:\.\d+)?)M$/, (m, a) => `${a.replace('.', ',')} Mio.`],
  ];

  // whole paragraphs (sentences with bold words or links): normalized English innerHTML -> German innerHTML
  const H = {
    'Unlock <em>the database</em>': '<em>Die Datenbank</em> freischalten',
    'Testosterone and most other compounds push red blood cell production. <b>Hematocrit</b> and <b>hemoglobin</b> rise, the blood gets thicker. Users watch it closely: high hematocrit raises blood pressure and the risk of clots. Dehydration on the day of the test makes it look higher than it is.':
      'Testosteron und die meisten anderen Wirkstoffe kurbeln die Bildung roter Blutkörperchen an. <b>Hämatokrit</b> und <b>Hämoglobin</b> steigen, das Blut wird dicker. Nutzer behalten das genau im Blick: Ein hoher Hämatokrit erhöht den Blutdruck und das Thromboserisiko. Wer am Testtag zu wenig getrunken hat, sieht einen höheren Wert, als tatsächlich vorliegt.',
    'Almost every compound lowers <b>HDL</b> – oral ones, trenbolone and some others very strongly – while <b>LDL</b> often goes up. The ratio between the two says more than either number. Lipids change slowly and recover slowly, so many keep cardio, diet and omega-3 going on cycle.':
      'Fast jeder Wirkstoff senkt das <b>HDL</b> – Oralia, Trenbolon und einige andere sehr stark –, während das <b>LDL</b> oft steigt. Das Verhältnis der beiden sagt mehr als jeder Einzelwert. Blutfette verändern sich langsam und erholen sich langsam, deshalb bleiben viele während der Kur bei Cardio, Ernährung und Omega-3.',
    '<b>ALT</b> and <b>AST</b> are the classic liver markers, and orals are the main reason they climb. A catch: hard training raises both too, because muscle releases them as well. Users therefore look at <b>GGT</b> as a cross-check and avoid heavy training in the days before the test.':
      '<b>ALT</b> und <b>AST</b> sind die klassischen Leberwerte, und Oralia sind der Hauptgrund, wenn sie steigen. Der Haken: Hartes Training erhöht beide ebenfalls, weil auch der Muskel sie freisetzt. Nutzer ziehen deshalb das <b>GGT</b> zum Abgleich heran und verzichten in den Tagen vor dem Test auf schweres Training.',
    'Testosterone converts partly into <b>estradiol (E2)</b>. Too high and too low both cause problems – water, mood, libido, joints. Users read the number together with total testosterone and how they feel. Ask the lab for the sensitive assay if possible.':
      'Testosteron wird teilweise zu <b>Estradiol (E2)</b> umgewandelt. Zu hoch und zu niedrig machen beide Probleme – Wasser, Stimmung, Libido, Gelenke. Nutzer lesen den Wert zusammen mit dem Gesamttestosteron und dem eigenen Befinden. Wenn möglich, im Labor nach dem sensitiven Test fragen.',
    "<b>Total</b> and <b>free testosterone</b> show what is in the blood on cycle. <b>LH</b> and <b>FSH</b> show the body's own production – they drop close to zero on cycle and are the key values after stopping, when the question is whether the natural axis comes back.":
      '<b>Gesamt</b>- und <b>freies Testosteron</b> zeigen, was während der Kur im Blut ist. <b>LH</b> und <b>FSH</b> zeigen die körpereigene Produktion – sie fallen während der Kur fast auf null und sind nach dem Absetzen die entscheidenden Werte, wenn es darum geht, ob die natürliche Achse zurückkommt.',
    '<b>Prolactin</b> comes up mostly with the 19-nor compounds such as nandrolone and trenbolone. Elevated values are linked to libido and erection problems and are a common reason users add it to the panel when those compounds are involved.':
      '<b>Prolaktin</b> ist vor allem bei den 19-Nor-Wirkstoffen wie Nandrolon und Trenbolon ein Thema. Erhöhte Werte werden mit Libido- und Erektionsproblemen in Verbindung gebracht und sind ein häufiger Grund, den Wert bei diesen Wirkstoffen mit testen zu lassen.',
    '<b>Creatinine</b> and the <b>eGFR</b> calculated from it estimate kidney function. More muscle mass and creatine both raise creatinine without anything being wrong, so the value can look worse than the kidneys are. <b>Cystatin C</b> is less affected by muscle and gives a clearer picture.':
      '<b>Kreatinin</b> und die daraus berechnete <b>eGFR</b> schätzen die Nierenfunktion. Mehr Muskelmasse und Kreatin erhöhen beide das Kreatinin, ohne dass etwas nicht stimmt, der Wert kann also schlechter aussehen, als die Nieren sind. <b>Cystatin C</b> hängt weniger von der Muskulatur ab und gibt ein klareres Bild.',
    '<b>Blood pressure</b> is measured at home, not in the lab – and it is one of the most important numbers on cycle. A hematocrit or lipid problem often shows up here first.':
      'Der <b>Blutdruck</b> wird zu Hause gemessen, nicht im Labor – und er ist einer der wichtigsten Werte während einer Kur. Ein Problem mit Hämatokrit oder Blutfetten zeigt sich oft zuerst hier.',
    '<b>Reference ranges differ between labs.</b> Always compare a value with the range printed on your own report.':
      '<b>Referenzbereiche unterscheiden sich von Labor zu Labor.</b> Vergleiche einen Wert immer mit dem Bereich auf deinem eigenen Befund.',
    '<b>One value is not a diagnosis.</b> Trends between tests say more than a single result.':
      '<b>Ein Wert ist keine Diagnose.</b> Der Verlauf über mehrere Tests sagt mehr als ein einzelnes Ergebnis.',
    '<b>Context matters.</b> Training, hydration, time since the last injection and time of day all move the numbers.':
      '<b>Der Zusammenhang zählt.</b> Training, Flüssigkeit, Zeit seit der letzten Injektion und Tageszeit verschieben die Werte.',
    '<b>Far outside the range</b> – or symptoms like chest pain, headaches or shortness of breath – is a reason to see a doctor, not to wait for the next panel.':
      '<b>Weit außerhalb des Bereichs</b> – oder Beschwerden wie Brustschmerzen, Kopfschmerzen oder Atemnot – ist ein Grund, zum Arzt zu gehen, statt auf das nächste Blutbild zu warten.',
  };

  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const deNum = (s) => s.replace(/\d[\d,]*(?:\.\d+)?/g, (m) => m.replace(/,/g, '\u0001').replace('.', ',').replace(/\u0001/g, '.'));
  const NUMONLY = /^[~≈+]?\s*\d[\d,]*(?:\.\d+)?\s*(?:\+|%|ml|mg|mcg|mcg\/ml|mg\/ml|kg|IU)?$/;
  function tr(text, numbers = true) {
    const k = norm(text);
    if (!k) return null;
    if (Object.prototype.hasOwnProperty.call(T, k)) return T[k];
    for (const [re, fn] of P) { const m = k.match(re); if (m) return fn(...m); }
    if (numbers && NUMONLY.test(k) && /[,.]\d/.test(k)) return deNum(k);
    return null;
  }
  window.ccT = (s) => (DE ? (tr(s, false) ?? s) : s);   // for texts that pages type out letter by letter
  window.ccLang = lang;

  const SKIP = 'script,style,textarea,input,select option[value=""],code,pre,[data-noi18n]';
  const NO_NUM = '#log, #res, .lc-bot, .lc-me, .answer, .cl-text';   // user/AI text: words only by exact match, numbers untouched
  const mine = new WeakMap();   // text this script wrote itself: never translated again (no ping-pong with the observer)
  function textNode(n) {
    const p = n.parentElement;
    if (!p || p.closest(SKIP) || mine.get(n) === n.data) return;
    const v = n.data, t = tr(v, !p.closest(NO_NUM));
    if (t != null && t !== norm(v)) { n.data = v.match(/^\s*/)[0] + t + v.match(/\s*$/)[0]; mine.set(n, n.data); }   // keep the spaces around the text
  }
  function attrs(el) {
    for (const a of ['placeholder', 'title', 'aria-label', 'alt']) {
      const v = el.getAttribute && el.getAttribute(a);
      if (v) { const t = tr(v, false); if (t != null && t !== v) el.setAttribute(a, t); }
    }
  }
  function html(el) {
    if (!el.children.length) return false;
    const k = norm(el.innerHTML);
    if (Object.prototype.hasOwnProperty.call(H, k)) { el.innerHTML = H[k]; return true; }
    return false;
  }
  function walk(root) {
    if (root.nodeType === 3) { textNode(root); return; }
    if (root.nodeType !== 1 || root.closest?.(SKIP)) return;
    root.querySelectorAll?.('p, li, dd, dt, h1, h2, h3').forEach(html);
    if (root.matches?.('p, li, dd, dt, h1, h2, h3')) html(root);
    attrs(root); root.querySelectorAll?.('[placeholder], [title], [aria-label], [alt]').forEach(attrs);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const list = []; while (w.nextNode()) list.push(w.currentNode);
    list.forEach(textNode);
  }

  function button() {
    const nav = document.querySelector('nav');
    if (!nav || nav.querySelector('.lang')) return;
    const b = document.createElement('a');
    b.href = '#'; b.className = 'lang'; b.textContent = DE ? 'EN' : 'DE';
    b.setAttribute('aria-label', DE ? 'Switch to English' : 'Auf Deutsch umschalten'); b.setAttribute('lang', DE ? 'en' : 'de');
    b.addEventListener('click', (e) => { e.preventDefault(); setLang(DE ? 'en' : 'de'); });
    const before = nav.querySelector('a.dc, .menu-btn');
    before ? nav.insertBefore(b, before) : nav.append(b);
    // stays visible on phones too, where the collapsed nav hides every link but the current page
    const st = document.createElement('style');
    st.textContent = 'nav a.lang.lang { display: inline-flex; align-items: center; font-size: 12.5px; letter-spacing: .06em; } nav.open a.lang.lang { display: flex; }';
    document.head.appendChild(st);
  }

  function start() {
    button();
    if (!DE) return;
    document.documentElement.lang = 'de';
    const t = tr(document.title, false); if (t) document.title = t;
    document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach((m) => { const v = tr(m.content, false); if (v) m.content = v; });
    walk(document.body);
    new MutationObserver((ms) => {
      for (const m of ms) {
        if (m.type === 'characterData') textNode(m.target);
        else m.addedNodes.forEach(walk);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
