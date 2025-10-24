# Coolify Deployment Anleitung

Diese Anleitung beschreibt, wie Mini-QR auf Coolify deployed wird.

## Wichtige Änderungen für Coolify

Die `docker-compose.yml` wurde für Coolify optimiert:

### 1. Nginx-Proxy entfernt
- **Grund**: Coolify verwendet bereits Traefik als Reverse Proxy
- Der separate `nginx-proxy` Service ist nicht mehr notwendig
- Das Routing wird direkt durch Coolify/Traefik übernommen

### 2. Healthcheck hinzugefügt
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 3. Port-Exposition
- Port 8080 wird direkt exponiert
- Coolify leitet den Traffic über seinen Reverse Proxy weiter

### 4. Curl installiert
- Das Dockerfile installiert nun `curl` für den Healthcheck
- Coolify benötigt curl oder wget für Container-Healthchecks

## Deployment in Coolify

### Voraussetzungen
- Coolify-Installation
- Git-Repository mit diesem Code
- Docker Compose Build Pack aktiviert

### Deployment-Schritte

1. **Neues Projekt in Coolify erstellen**
   - Wähle "Docker Compose" als Deployment-Typ
   - Verbinde dein Git-Repository

2. **Umgebungsvariablen konfigurieren** (optional)
   ```bash
   BASE_PATH=/                    # Standard: /
   HIDE_CREDITS=false            # Credits anzeigen
   DEFAULT_PRESET=               # Standard-Preset
   DEFAULT_DATA=                 # Standard-Daten für QR-Code
   PRESETS=                      # QR-Code-Presets (JSON)
   FRAME_PRESET=                 # Frame-Preset
   FRAME_PRESETS=                # Frame-Presets (JSON)
   DISABLE_LOCAL_STORAGE=false   # LocalStorage deaktivieren
   ```

3. **Domain konfigurieren**
   - Setze deine gewünschte Domain in Coolify
   - Coolify konfiguriert automatisch SSL/TLS mit Let's Encrypt

4. **Deploy starten**
   - Coolify baut das Image und startet den Container
   - Der Healthcheck überwacht die Container-Gesundheit
   - Bei erfolgreicher Healthcheck wird Traffic weitergeleitet

## BASE_PATH Konfiguration

**Wichtig**: Der `BASE_PATH` wurde von `/mini-qr/` auf `/` geändert.

- **Grund**: Coolify's Traefik übernimmt das Routing
- Falls ein Subpath gewünscht ist, kann dieser über Coolify's Routing-Konfiguration gesetzt werden
- Alternativ: `BASE_PATH` Umgebungsvariable in Coolify anpassen

## Healthcheck-Details

Der Healthcheck:
- Prüft alle 30 Sekunden, ob die Anwendung antwortet
- Wartet 40 Sekunden nach Container-Start (start_period)
- Gibt dem Container 10 Sekunden Zeit zum Antworten
- Nach 3 fehlgeschlagenen Versuchen gilt der Container als unhealthy

## Troubleshooting

### Container startet nicht
- Prüfe die Build-Logs in Coolify
- Stelle sicher, dass alle Build-Args korrekt gesetzt sind

### Healthcheck schlägt fehl
- Überprüfe, ob der Container auf Port 8080 lauscht
- Prüfe die Container-Logs für Fehler
- Stelle sicher, dass `serve` korrekt startet

### Routing-Probleme
- Prüfe die Coolify Domain-Konfiguration
- Stelle sicher, dass der richtige Port (8080) konfiguriert ist
- Überprüfe die Traefik-Labels in Coolify

## Netzwerk

- Das separate Docker-Netzwerk wurde entfernt
- Coolify verwaltet das Netzwerk automatisch
- Services können über Container-Namen kommunizieren (falls weitere Services hinzugefügt werden)

## Rolling Updates

**Hinweis**: Rolling Updates werden bei Docker Compose Deployments in Coolify nicht unterstützt.
- Bei Updates wird der alte Container gestoppt, bevor der neue startet
- Kurze Downtime während des Updates ist zu erwarten
