# Coolify Umgebungsvariablen Konfiguration

Diese Datei beschreibt, welche Umgebungsvariablen Du in der Coolify-Oberfläche eintragen musst.

## Wichtig zu Wissen

- Diese Variablen werden **in Coolify** eingetragen, nicht in der docker-compose.yml
- Die meisten Variablen sind **optional** und haben sinnvolle Defaults
- Alle Variablen sind **Build-Args**, d.h. sie werden beim Build des Docker-Images verwendet

## Umgebungsvariablen Übersicht

### 1. BASE_PATH
**Beschreibung:** Der Basispfad, unter dem die Anwendung erreichbar ist

**Werte:**
- `BASE_PATH=/` (Standard - für Root-Deployment)
- `BASE_PATH=/mini-qr` (für Subpath-Deployment)

**Wann anpassen:**
- Nur wenn Du die App unter einem Subpath deployen möchtest
- In den meisten Fällen kannst Du dies leer lassen oder `/` verwenden

**Beispiel für Coolify:**
```
BASE_PATH=/
```

---

### 2. HIDE_CREDITS
**Beschreibung:** Blendet die Credits/Fußzeile aus

**Werte:**
- `HIDE_CREDITS=false` (Standard - Credits werden angezeigt)
- `HIDE_CREDITS=true` (Credits werden ausgeblendet)

**Beispiel für Coolify:**
```
HIDE_CREDITS=false
```

---

### 3. DEFAULT_PRESET
**Beschreibung:** Welcher QR-Code-Preset beim Start der App standardmäßig geladen wird

**Verfügbare Built-in Presets:**
- `plain` - Einfacher schwarzer QR-Code
- `lyqht` - Standard-Design (türkis/grau)
- `Padlet` - Padlet-Branding
- `VueJS` - Vue.js-Design
- `Vercel Light` - Vercel helles Design
- `Vercel Dark` - Vercel dunkles Design
- `Supabase Green` - Supabase grünes Design
- `UIlicious` - UIlicious-Design
- `Vite Conf 2023` - Vite Conference Design
- Und weitere...

**Beispiel für Coolify:**
```
DEFAULT_PRESET=plain
```

**Hinweis:** Wenn nicht gesetzt, wird der erste Preset aus der Liste verwendet.

---

### 4. DEFAULT_DATA
**Beschreibung:** Standard-Text/URL, der beim ersten Laden in den QR-Code encodiert wird

**Beispiele:**
```
DEFAULT_DATA=https://deine-website.de
```
oder
```
DEFAULT_DATA=Willkommen bei unserem QR-Code-Generator!
```

**Hinweis:** Wenn nicht gesetzt, ist das Feld beim Start leer.

---

### 5. PRESETS
**Beschreibung:** Eigene QR-Code-Presets als JSON definieren (überschreibt Built-in-Presets)

**Format:** JSON-Array mit Preset-Objekten

**Beispiel für Coolify:**
```json
PRESETS=[{"name":"Mein Preset","data":"https://example.com","dotsOptions":{"color":"#ff0000","type":"rounded"},"cornersSquareOptions":{"color":"#0000ff","type":"square"},"cornersDotOptions":{"color":"#0000ff","type":"square"},"style":{"borderRadius":"12px","background":"#ffffff"}}]
```

**Hinweis:**
- Dies ist ein **komplexes JSON-Format**
- Nur verwenden, wenn Du custom Presets benötigst
- Leer lassen für Standard-Presets

**Struktur eines Preset-Objekts:**
```json
{
  "name": "Preset Name",
  "data": "https://example.com",
  "dotsOptions": {
    "color": "#000000",
    "type": "rounded"
  },
  "cornersSquareOptions": {
    "color": "#000000",
    "type": "square"
  },
  "cornersDotOptions": {
    "color": "#000000",
    "type": "square"
  },
  "style": {
    "borderRadius": "12px",
    "background": "#ffffff"
  }
}
```

---

### 6. FRAME_PRESET
**Beschreibung:** Welcher Frame-Preset (Rahmen) standardmäßig verwendet wird

**Verfügbare Built-in Frame Presets:**
- `Default Frame` - Standard-Rahmen (weiß mit schwarzem Border)
- `Dark Frame` - Dunkler Rahmen (schwarz mit weißem Border)
- `Borderless Frame` - Randloser Rahmen

**Beispiel für Coolify:**
```
FRAME_PRESET=Default Frame
```

**Hinweis:** Wenn nicht gesetzt, wird der erste Frame-Preset verwendet.

---

### 7. FRAME_PRESETS
**Beschreibung:** Eigene Frame-Presets als JSON definieren (überschreibt Built-in-Frame-Presets)

**Format:** JSON-Array mit Frame-Preset-Objekten

**Beispiel für Coolify:**
```json
FRAME_PRESETS=[{"name":"Mein Frame","style":{"textColor":"#ffffff","backgroundColor":"#000000","borderColor":"#ff0000","borderWidth":"2px","borderRadius":"16px","padding":"20px"},"text":"Scan mich!","position":"bottom"}]
```

**Struktur eines Frame-Preset-Objekts:**
```json
{
  "name": "Frame Name",
  "style": {
    "textColor": "#000000",
    "backgroundColor": "#ffffff",
    "borderColor": "#000000",
    "borderWidth": "1px",
    "borderRadius": "8px",
    "padding": "16px"
  },
  "text": "Optional: Text im Frame",
  "position": "top"
}
```

**Position-Optionen:** `top`, `bottom`, `left`, `right`

---

### 8. DISABLE_LOCAL_STORAGE
**Beschreibung:** Deaktiviert das Speichern von Einstellungen im Browser

**Werte:**
- `DISABLE_LOCAL_STORAGE=false` (Standard - LocalStorage wird verwendet)
- `DISABLE_LOCAL_STORAGE=true` (LocalStorage wird deaktiviert)

**Beispiel für Coolify:**
```
DISABLE_LOCAL_STORAGE=false
```

**Wann verwenden:**
- `true` setzen, wenn Du aus Datenschutzgründen keine lokale Speicherung möchtest
- `false` (Standard) für bessere Benutzererfahrung (Einstellungen bleiben erhalten)

---

## Minimale Konfiguration für Coolify

Für ein **Standard-Deployment** brauchst Du **KEINE** Umgebungsvariablen zu setzen. Die App funktioniert mit allen Defaults.

### Beispiel: Einfaches Deployment

Keine ENV-Variablen notwendig! Die App wird mit folgenden Defaults laufen:
- `BASE_PATH=/`
- `HIDE_CREDITS=false`
- Standard-Presets verfügbar
- Leeres Eingabefeld beim Start

---

## Empfohlene Konfiguration für Coolify

Falls Du die App anpassen möchtest:

```bash
# Basis-Konfiguration
BASE_PATH=/

# Welcher Preset soll beim Start geladen sein?
DEFAULT_PRESET=plain

# Welche URL/Text soll vorausgefüllt sein?
DEFAULT_DATA=https://deine-website.de

# Credits ausblenden?
HIDE_CREDITS=false

# LocalStorage erlauben?
DISABLE_LOCAL_STORAGE=false
```

---

## Erweiterte Konfiguration mit Custom Presets

Falls Du eigene Presets benötigst:

```bash
BASE_PATH=/
DEFAULT_PRESET=Firmen Preset
HIDE_CREDITS=true
DISABLE_LOCAL_STORAGE=false

# Custom QR-Code Preset
PRESETS=[{"name":"Firmen Preset","data":"https://firma.de","dotsOptions":{"color":"#003366","type":"rounded"},"cornersSquareOptions":{"color":"#ff6600","type":"extra-rounded"},"cornersDotOptions":{"color":"#ff6600","type":"dot"},"imageOptions":{"margin":8},"style":{"borderRadius":"24px","background":"#ffffff"}}]

# Custom Frame Preset
FRAME_PRESETS=[{"name":"Firmen Frame","style":{"textColor":"#ffffff","backgroundColor":"#003366","borderColor":"#ff6600","borderWidth":"3px","borderRadius":"12px","padding":"24px"},"text":"Unsere Website","position":"bottom"}]
FRAME_PRESET=Firmen Frame
```

---

## Testen der Konfiguration

Nach dem Deployment kannst Du testen, ob die Variablen korrekt übernommen wurden:

1. **BASE_PATH:** Öffne die URL - sollte unter dem konfigurierten Pfad erreichbar sein
2. **DEFAULT_PRESET:** Überprüfe, welcher Preset beim Laden vorausgewählt ist
3. **DEFAULT_DATA:** Überprüfe, ob das Eingabefeld vorausgefüllt ist
4. **HIDE_CREDITS:** Schaue nach unten - Credits sollten sichtbar/unsichtbar sein
5. **Custom Presets:** Öffne die Preset-Auswahl und prüfe, ob deine Presets vorhanden sind

---

## Troubleshooting

### JSON-Parse-Fehler bei PRESETS/FRAME_PRESETS

**Problem:** Die App startet nicht oder zeigt Fehler in der Console

**Lösung:**
1. Validiere dein JSON mit einem JSON-Validator (z.B. jsonlint.com)
2. Stelle sicher, dass alle Quotes richtig escaped sind
3. Teste das JSON lokal, bevor Du es in Coolify einträgst

### Preset nicht gefunden

**Problem:** `DEFAULT_PRESET` oder `FRAME_PRESET` wird nicht geladen

**Lösung:**
1. Überprüfe die exakte Schreibweise (Case-sensitive!)
2. Bei Custom Presets: Stelle sicher, dass der Name im `PRESETS`/`FRAME_PRESETS` JSON existiert

### Änderungen werden nicht übernommen

**Problem:** ENV-Variablen Änderungen sind nicht sichtbar

**Lösung:**
1. **Rebuild erforderlich:** ENV-Variablen sind Build-Args
2. In Coolify: Projekt neu bauen (Redeploy)
3. Browser-Cache leeren
4. Hard-Reload (Ctrl+Shift+R / Cmd+Shift+R)

### BASE_PATH funktioniert nicht

**Problem:** Assets werden nicht geladen oder Routing funktioniert nicht

**Lösung:**
1. Stelle sicher, dass `BASE_PATH` mit `/` endet (wird automatisch ergänzt)
2. Coolify's Routing muss mit dem `BASE_PATH` übereinstimmen
3. Besser: `BASE_PATH=/` verwenden und Routing über Coolify steuern
