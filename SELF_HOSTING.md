# Self-Hosting

This document covers all the ways to self-host MiniQR.

## With Docker 🐋

### Quick Start (prebuilt image)

Pull the prebuilt image from GitHub Container Registry and start the app:

```bash
wget https://github.com/lyqht/mini-qr/raw/main/docker-compose.yml
docker compose up -d
```

The app will be available at [http://localhost](http://localhost) (port 80, proxied by Nginx).

> **Note:** The `docker-compose.yml` embeds its own Nginx config — you only need this one file for the Quick Start. No other files are required.

### Build Locally

To build from source, clone the repository and replace the `image:` line in `docker-compose.yml` with a `build:` section pointing to the local Dockerfile. Then run:

```bash
docker compose up -d --build
```

Or build and run manually:

```bash
docker build -t mini-qr .
docker run -d -p 80:8080 mini-qr
```

## Without Docker 🌐

Compile the application directly using NPM and Vite:

```bash
git clone https://github.com/lyqht/mini-qr.git
cd mini-qr
npm install
npm run build
```

The application builds into the `dist` folder, which can be served from any web server.

Example using PHP's built-in web server:

```bash
cd dist
php -S localhost:8080
```

## Environment Variables

Except for `BASE_PATH`, every setting below works with the prebuilt image. Set it when the container starts and no rebuild is needed. The container writes these values to `dist/config.js` on start, and the app loads that file before it starts.

You can use either the full `VITE_*` name or the short name. If you build the image yourself, you can still pass the `VITE_*` names as `--build-arg` instead. A value set when the container starts wins over one built into the image.

| Variable                                 | Short name                          | Description                                                                                                                                                                               | Default   |
| ---------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `VITE_HIDE_CREDITS`                      | `HIDE_CREDITS`                      | Set to `"true"` to hide the footer credits                                                                                                                                                | `"false"` |
| `VITE_DEFAULT_PRESET`                    | `DEFAULT_PRESET`                    | Name of the default QR code style preset (e.g., `"plain"`, `"lyqht"`)                                                                                                                     | `""`      |
| `VITE_DEFAULT_DATA_TO_ENCODE`            | `DEFAULT_DATA`                      | Default text/URL pre-filled in the QR code input field when the app loads                                                                                                                 | `""`      |
| `VITE_QR_CODE_PRESETS`                   | `PRESETS`                           | JSON array of custom QR code presets. See [Custom Presets](#custom-presets) below                                                                                                         | `"[]"`    |
| `VITE_FRAME_PRESET`                      | `FRAME_PRESET`                      | Name of the default frame preset to apply (e.g., `"Default Frame"`)                                                                                                                       | `""`      |
| `VITE_FRAME_PRESETS`                     | `FRAME_PRESETS`                     | JSON array of custom frame presets. See [Custom Presets](#custom-presets) below                                                                                                           | `"[]"`    |
| `VITE_DISABLE_LOCAL_STORAGE`             | `DISABLE_LOCAL_STORAGE`             | Set to `"true"` to prevent the app from loading previously saved settings on startup                                                                                                      | `"false"` |
| `VITE_QR_CREATE_SIMPLE_FULL_MODE_TOGGLE` | `QR_CREATE_SIMPLE_FULL_MODE_TOGGLE` | Set to `"true"` to show the Simple/Full view toggle and the "Customize fields" button                                                                                                     | `"false"` |
| `VITE_FIELDS_VISIBLE`                    | `FIELDS_VISIBLE`                    | Comma-separated field keys. When set, the app starts in Simple mode showing only the data field plus these fields (see [Fixing the visible fields](#fixing-the-visible-fields))           | `""`      |
| `VITE_DISABLE_COLOR_CONTRAST_WARNING`    | `DISABLE_COLOR_CONTRAST_WARNING`    | Set to `"false"` to show the background/dots color contrast warning. Defaults to hidden in the Docker image (unattended/kiosk deployments), unlike other deployment methods               | `"true"`  |
| `DEFAULT_LOGO`                           | `DEFAULT_LOGO`                      | Logo placed in the centre of the default preset's QR code. Accepts an `http(s)` URL, a same-origin path (e.g. a mounted file) or a `data:image/...` URI. Overrides the preset's own image | `""`      |

### Build-time only: `BASE_PATH`

`BASE_PATH` sets the URL sub-path the app is served from (e.g. `/mini-qr` for `domain.com/mini-qr`). It is built into the asset URLs, so it only works when you build the image yourself (see [Build Locally](#build-locally)):

```bash
docker build --build-arg BASE_PATH=/mini-qr -t mini-qr .
```

### Passing Variables via docker-compose

`docker-compose.yml` passes the short names through to the container. Set them in your shell:

```bash
QR_CREATE_SIMPLE_FULL_MODE_TOGGLE=true FIELDS_VISIBLE=dotsColor,frameText docker compose up -d
```

Or create a `.env` file alongside `docker-compose.yml`:

```dotenv
DEFAULT_PRESET=plain
HIDE_CREDITS=true
DISABLE_LOCAL_STORAGE=true
```

Then run `docker compose up -d`. If you write your own compose file, set them under the service's `environment:` key:

```yaml
services:
  mini-qr:
    image: ghcr.io/lyqht/mini-qr:latest
    environment:
      QR_CREATE_SIMPLE_FULL_MODE_TOGGLE: 'true'
      FIELDS_VISIBLE: dotsColor,frameText
      DEFAULT_LOGO: /logo.svg
    volumes:
      - ./logo.svg:/app/dist/logo.svg:ro
```

After changing a value, recreate the container (`docker compose up -d` does this) and reload the page.

### Notes on `DEFAULT_LOGO`

If the image was built with a `BASE_PATH`, include it in a same-origin logo path. For example, with `BASE_PATH=/mini-qr`, mount the file as above and set `DEFAULT_LOGO: /mini-qr/logo.svg`.

`DEFAULT_LOGO` only changes the default preset. Returning users whose design is saved in local storage keep their saved design, so they see the logo once they select the default preset again.

### Passing Variables via `docker build`

When building the image yourself, you can also build settings into it with `--build-arg`:

```bash
docker build \
  --build-arg BASE_PATH=/mini-qr \
  --build-arg VITE_DEFAULT_PRESET=plain \
  --build-arg VITE_DISABLE_LOCAL_STORAGE=true \
  -t mini-qr .
```

## Fixing the visible fields

By default the app shows the full QR code configuration UI. The Simple/Full
view toggle and the "Customize fields" button are hidden unless you set
`QR_CREATE_SIMPLE_FULL_MODE_TOGGLE=true`.

To ship a fixed, simplified generator (e.g. a kiosk where users only change a
couple of things), set `FIELDS_VISIBLE` to the field keys you want shown. The
app then starts in Simple mode showing only the data field plus those fields,
and — with the toggle hidden — users cannot switch away from it.

```bash
# Only let users edit the dots color and the frame caption
FIELDS_VISIBLE=dotsColor,frameText docker compose up -d
```

Valid field keys:

- **QR code:** `preset`, `logoImage`, `logoBackground`, `backgroundColor`,
  `dotsColor`, `cornersSquareColor`, `cornersDotColor`, `width`, `height`,
  `borderRadius`, `margin`, `imageMargin`, `imageSize`, `dotsType`,
  `cornersSquareType`, `cornersDotType`, `errorCorrectionLevel`
- **Frame** (the frame is enabled automatically when any of these is listed):
  `framePreset`, `frameText`, `framePosition`, `frameWidth`, `frameTextColor`,
  `frameBackground`, `frameBorderColor`, `frameBorderWidth`, `frameBorderRadius`,
  `framePadding`, `frameFontFamily`

Unknown keys are ignored. The data field is always shown.

## Custom Presets

### QR Code Presets (`VITE_QR_CODE_PRESETS`)

A JSON array of preset objects. Each preset overrides the visual style of the QR code. Required fields: `name`. All standard `qr-code-styling` options are supported.

```json
[
  {
    "name": "My Brand",
    "dotsOptions": { "color": "#ff0000", "type": "rounded" },
    "cornersSquareOptions": { "color": "#ff0000", "type": "extra-rounded" },
    "cornersDotOptions": { "color": "#ff0000" },
    "backgroundOptions": { "color": "#ffffff" }
  }
]
```

Pass it like any other setting (escape the JSON or use a `.env` file):

```bash
PRESETS='[{"name":"My Brand","dotsOptions":{"color":"#ff0000","type":"rounded"}}]' docker compose up -d
```

### Frame Presets (`VITE_FRAME_PRESETS`)

A JSON array of frame preset objects. Each preset defines the style and optional default text for the frame surrounding the QR code.

```json
[
  {
    "name": "Red Frame",
    "text": "Scan me",
    "position": "bottom",
    "style": {
      "textColor": "#ffffff",
      "backgroundColor": "#cc0000",
      "borderColor": "#cc0000",
      "borderWidth": "2px",
      "borderRadius": "8px",
      "padding": "12px"
    }
  }
]
```

## Deployment Scenarios

### Deploy at root path (default)

```bash
docker compose up -d
```

### Deploy at a subdirectory

`BASE_PATH` needs a local build. Replace the `image:` line in `docker-compose.yml` with:

```yaml
build:
  context: .
  args:
    BASE_PATH: /mini-qr
```

Then run `docker compose up -d --build`.

### Fixed preset with localStorage disabled

Useful when embedding MiniQR in a branded context where users should always see the configured preset:

```bash
DEFAULT_PRESET=plain DISABLE_LOCAL_STORAGE=true docker compose up -d
```

### Hide footer credits

```bash
HIDE_CREDITS=true docker compose up -d
```

## Nginx Proxy

The `docker-compose.yml` includes an `nginx-proxy` service that proxies traffic to the MiniQR app container. The Nginx configuration is embedded inline in `docker-compose.yml` under the `configs:` key, so no extra files are needed for the Quick Start.

To override the Nginx config (e.g. for subdirectory deployment or custom headers), replace the `configs.nginx-proxy-conf.content` block in `docker-compose.yml` with your own configuration, or switch to a file-based mount:

```yaml
volumes:
  - ./nginx-proxy.conf:/etc/nginx/nginx.conf:ro
```

## Customization Example

An example of a self-hosted website with a modified MiniQR app with specific language and preset: https://qrcode.outils.restosducoeur.org/
