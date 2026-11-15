# Current Cycle

Persönliche Cycle-Seite. Das Design bleibt das der Vorlage. Inhalt ist der eigene Cycle, plus der Dosierer.

Zwei Seiten:

- `/` — der laufende Cycle
- `/rechner.html` — Dosierer (Peptid und Testosteron, U-100)

Kein Shop, kein Discord, kein Konto, kein KI-Chat. Alte Pfade (`/discord`, `/chat.html`, `/blut.html`, `/konto.html`, `/brain.html`, `/admin`, `/bloodwork-on-cycle.html`) leiten auf `/` um.

## Starten

Node.js 20 oder neuer. Keine npm-Pakete.

```bash
npm start
```

Die Seite läuft auf http://localhost:4173

- `PORT` — Port, Standard 4173
- `SITE_URL` — öffentliche Adresse, zum Beispiel `https://deine-domain.tld`. Leer lassen, dann nimmt der Server die Domain aus dem Request.

## Deployen

```bash
npm start
```

Domain per DNS auf den Rechner zeigen und einen Reverse-Proxy mit HTTPS davor setzen (Caddy, nginx). Beispiel für Caddy:

```
deine-domain.tld {
  reverse_proxy localhost:4173
}
```
