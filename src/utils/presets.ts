import PLACEHOLDER_IMAGE_URL from '@/assets/placeholder_image.png'
import GeeksHackingConfig from '@/assets/presets/geekshacking.json'
import SpDigitalConfig from '@/assets/presets/spdigital.json'
import GovtechStackCommunityConfig from '@/assets/presets/govtech_stack.json'
import Hackomania2025Config from '@/assets/presets/hackomania2025.json'
import PlainConfig from '@/assets/presets/plain.json'
import type { DrawType, Options as StyledQRCodeProps } from 'qr-code-styling'

export interface CustomStyleProps {
  borderRadius?: string
  background?: string
}

export type PresetAttributes = {
  style: CustomStyleProps
  name: string
}

export type Preset = Omit<
  Required<StyledQRCodeProps>,
  'shape' | 'qrOptions' | 'nodeCanvas' | 'jsdom'
> &
  PresetAttributes

const defaultPresetOptions = {
  backgroundOptions: {
    color: 'transparent'
  },
  imageOptions: {
    margin: 0
  },
  width: 200,
  height: 200,
  margin: 0,
  type: 'svg' as DrawType
}

// Company / Tech presets

export const padletPreset: Preset = {
  ...defaultPresetOptions,
  name: 'Padlet',
  data: 'https://padlet.com/',
  image:
    'https://padlet-uploads.storage.googleapis.com/5587727/AEV1LKtFkyKgLU1DzT_Ocg/ef1210d4305560b0eb3acf6500d5099c.png',
  width: 200,
  height: 200,
  margin: 0,
  dotsOptions: { color: '#7ABE4A', type: 'extra-rounded' },
  cornersSquareOptions: { color: '#ed457e', type: 'extra-rounded' },
  cornersDotOptions: { color: '#ed457e', type: 'square' },
  style: { borderRadius: '24px', background: '#000000' }
}

export const vercelLightPreset: Preset = {
  ...defaultPresetOptions,
  name: 'Vercel Light',
  data: 'https://vercel.com',
  image: 'https://api.iconify.design/ion:logo-vercel.svg?color=%23000',
  dotsOptions: { color: '#000000', type: 'classy' },
  cornersSquareOptions: { color: '#000000', type: 'square' },
  cornersDotOptions: { color: '#000000', type: 'square' },
  style: { borderRadius: '0px', background: '#FFFFFF' },
  margin: 8,
  imageOptions: {
    margin: 8
  }
}

export const vercelDarkPreset: Preset = {
  ...defaultPresetOptions,
  name: 'Vercel Dark',
  data: 'https://vercel.com',
  image: 'https://api.iconify.design/ion:logo-vercel.svg?color=%23FFF',
  dotsOptions: { color: '#FFFFFF', type: 'classy' },
  cornersSquareOptions: { color: '#FFFFFF', type: 'square' },
  cornersDotOptions: { color: '#FFFFFF', type: 'square' },
  style: { borderRadius: '0px', background: '#000000' },
  margin: 8,
  imageOptions: {
    margin: 8
  }
}

export const supabaseGreenPreset: Preset = {
  ...defaultPresetOptions,
  name: 'Supabase Green',
  data: 'https://supabase.com',
  image: 'https://api.iconify.design/logos:supabase-icon.svg',
  dotsOptions: {
    color: '#3ecf8e',
    type: 'classy-rounded'
  },
  cornersSquareOptions: {
    color: '#3ecf8e',
    type: 'square'
  },
  cornersDotOptions: {
    color: '#3ecf8e',
    type: 'square'
  },
  imageOptions: {
    margin: 8
  },
  style: {
    borderRadius: '12px',
    background: '#000000'
  }
}

export const supabasePurplePreset: Preset = {
  ...defaultPresetOptions,
  name: 'Supabase Purple',
  data: 'https://supabase.com',
  image: 'https://avatars.githubusercontent.com/u/54469796',
  dotsOptions: {
    color: '#7700ff',
    type: 'classy-rounded'
  },
  cornersSquareOptions: {
    color: '#7700ff',
    type: 'square'
  },
  cornersDotOptions: {
    color: '#7700ff',
    type: 'square'
  },
  imageOptions: {
    margin: 0
  },
  style: {
    borderRadius: '12px',
    background: '#000000'
  }
}

export const uiliciousPreset: Preset = {
  ...defaultPresetOptions,
  name: 'UIlicious',
  data: 'https://uilicious.com/',
  image:
    'data:image/svg+xml;base64,PHN2ZyAKIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIgogd2lkdGg9IjE0NW1tIiBoZWlnaHQ9IjE1MG1tIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiAgZmlsbD0icmdiKDM3LCAzNywgMzcpIgogZD0iTTIwNi4wMDAsNDQzLjAwMCBMMjA2LjAwMCw1NjEuMDAwIEwwLjAwMCwzOTguMDAwIEwwLjAwMCwyODAuMDAwIEwyMDYuMDAwLDQ0My4wMDAgWiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiICBmaWxsPSJyZ2IoMTcsIDE3LCAxNykiCiBkPSJNNTQ1LjAwMCwyMzYuMDAwIEwyMDYuMDAwLDU2MS4wMDAgTDIwNi4wMDAsNDQzLjAwMCBMNTQ1LjAwMCwxMTguMDAwIEw1NDUuMDAwLDIzNi4wMDAgWiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiICBmaWxsPSJyZ2IoMCwgMTY2LCA4MSkiCiBkPSJNMjA2LjAwMCwzMjYuMDAwIEwyMDYuMDAwLDQ0NC4wMDAgTDAuMDAwLDI4MS4wMDAgTDAuMDAwLDE2My4wMDAgTDIwNi4wMDAsMzI2LjAwMCBaIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgIGZpbGw9InJnYigxNiwgMTM5LCA3NikiCiBkPSJNNTQ1LjAwMCwxMTkuMDAwIEwyMDYuMDAwLDQ0NC4wMDAgTDIwNi4wMDAsMzI2LjAwMCBMNTQ1LjAwMCwxLjAwMCBMNTQ1LjAwMCwxMTkuMDAwIFoiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiAgZmlsbD0icmdiKDEzOCwgMjEzLCAxNjUpIgogZD0iTTU0Ni4wMDAsMC4wMDAgTDIwNi4wMDAsMzI3LjAwMCBMMC4wMDAsMTYzLjAwMCBMNTQ2LjAwMCwwLjAwMCBaIi8+Cjwvc3ZnPg==',
  dotsOptions: {
    color: '#0f8b4c',
    type: 'extra-rounded'
  },
  cornersSquareOptions: {
    color: '#0f8b4c',
    type: 'extra-rounded'
  },
  cornersDotOptions: {
    color: '#111111',
    type: 'square'
  },
  imageOptions: {
    margin: 8
  },
  style: {
    borderRadius: '24px',
    background: '#ffffff'
  }
}

export const viteConf2023Preset: Preset = {
  ...defaultPresetOptions,
  data: 'https://viteconf.org/23',
  image:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMTkiIGhlaWdodD0iMzE5IiBmaWxsPSJub25lIj48ZyBjbGlwLXBhdGg9InVybCgjYSkiIGZpbHRlcj0idXJsKCNiKSI+PG1hc2sgaWQ9ImMiIHdpZHRoPSIzMjAiIGhlaWdodD0iMzIwIiB4PSIwIiB5PSItMSIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgc3R5bGU9Im1hc2stdHlwZTpsdW1pbmFuY2UiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0zMTkuMDA4LS4wMzJoLTMxOXYzMTloMzE5di0zMTlaIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYykiPjxwYXRoIGZpbGw9InVybCgjZCkiIGQ9Ik0yMTYuNzQ5IDExLjIxNiAxMTkuMTcyIDMwLjkyYy0uOTM4IDAtMS44NzYuOTM4LTEuODc2LjkzOC0uOTM5LjkzOS0uOTM5IDEuODc3LS45MzkgMS44NzdsLTUuNjI5IDEwNi45NTl2MS44NzZjMCAuOTM5LjkzOC45MzkuOTM4LjkzOXMuOTM4LjkzOCAxLjg3Ny45MzhoMS44NzZsMjcuMjA5LTYuNTY4YzIuODE1LS45MzggNC42OTEgMS44NzcgNC42OTEgNC42OTFsLTguNDQ0IDQyLjIyMWMtLjkzOCAyLjgxNSAxLjg3NyA1LjYyOSA0LjY5MSA0LjY5MWwxNi44ODgtNS42MjljMi44MTUtLjkzOCA0LjY5MiAxLjg3NiA0LjY5MiA0LjY5MWwtMTMuMTM2IDY1LjY3NmMtLjkzOCAzLjc1MyA0LjY5MiA2LjU2OCA2LjU2OCAyLjgxNWwxLjg3Ni0yLjgxNSA3OS43NS0xNjcuOTQ0YzAtMS44NzYtMi44MTQtNS42My01LjYyOS00LjY5MWwtMjguMTQ3IDUuNjNjLTIuODE1LjkzOC00LjY5MS0xLjg3Ny0zLjc1My00LjY5MmwxNy44MjctNjYuNjE1Yy45MzgtMi44MTQtLjkzOS01LjYyOS0zLjc1My00LjY5WiIvPjxwYXRoIGZpbGw9InVybCgjZSkiIGQ9Ik0zMTUuMjcgNDAuMzE1Yy0zLjc1Mi01LjYzLTExLjI1OC04LjQ0NS0xNy44MjYtNy41MDZsLTc0LjEyMSAxNC4wNzMtMi44MTQgMTEuMjU5IDc5Ljc1LTE0LjA3M2MyLjgxNC0uOTM5IDUuNjI5LjkzOCA3LjUwNiAyLjgxNCAxLjg3NiAyLjgxNSAxLjg3NiA1LjYzIDAgOC40NDRMMTY3Ljk2NyAzMDMuOTZjLS45MzggMi44MTQtMy43NTIgMy43NTMtNi41NjcgMy43NTMtMi44MTUgMC01LjYzLTEuODc3LTYuNTY4LTMuNzUzTDEyLjIyIDU0LjM4OWMtMS44NzYtMS44NzctMS44NzYtNS42MyAwLTcuNTA3IDEuODc3LTEuODc2IDMuNzUzLTIuODE0IDYuNTY4LTIuODE0aDEuODc2bDg0LjQ0MiAxNS4wMTEuOTM4LTEwLjMyLTg0LjQ0Mi0xNS45NWMtNy41MDUtLjkzOS0xNC4wNzMgMS44NzYtMTcuODI2IDcuNTA2Qy4wMjMgNDUuOTQ0LS45MTUgNTMuNDUgMi44MzggNjAuMDE3bDE0Mi42MTIgMjQ5LjU3YzIuODE1IDUuNjI5IDkuMzgyIDkuMzgyIDE1Ljk1IDkuMzgyIDYuNTY3IDAgMTIuMTk3LTMuNzUzIDE1Ljk1LTkuMzgybDEzOS43OTctMjQ5LjU3YzIuODE1LTYuNTY4IDIuODE1LTE0LjA3NC0xLjg3Ny0xOS43MDNaIi8+PC9nPjwvZz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImQiIHgxPSIxMTIuOTc4IiB4Mj0iMjIyLjkyOCIgeTE9IjQyLjY1NyIgeTI9IjE4MS41ODIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjQjA0N0ZGIi8+PHN0b3Agb2Zmc2V0PSIuNzUiIHN0b3AtY29sb3I9IiNGRkQwRDAiLz48c3RvcCBvZmZzZXQ9Ii45MTciIHN0b3AtY29sb3I9IiNGRkYzRTYiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iZSIgeDE9Ijg2LjI0MiIgeDI9IjI0NS45NzciIHkxPSIxNC41MzciIHkyPSIxOTIuNjMxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzU3Q0NGRiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0FGNDhGRiIvPjwvbGluZWFyR3JhZGllbnQ+PGNsaXBQYXRoIGlkPSJhIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAwaDMxOXYzMTlIMHoiLz48L2NsaXBQYXRoPjxmaWx0ZXIgaWQ9ImIiIHdpZHRoPSIzMTkiIGhlaWdodD0iMzIzIiB4PSIwIiB5PSIwIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz48ZmVCbGVuZCBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0ic2hhcGUiLz48ZmVDb2xvck1hdHJpeCBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0iaGFyZEFscGhhIiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIi8+PGZlT2Zmc2V0IGR5PSIyIi8+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMSIvPjxmZUNvbXBvc2l0ZSBpbjI9ImhhcmRBbHBoYSIgazI9Ii0xIiBrMz0iMSIgb3BlcmF0b3I9ImFyaXRobWV0aWMiLz48ZmVDb2xvck1hdHJpeCB2YWx1ZXM9IjAgMCAwIDAgMSAwIDAgMCAwIDEgMCAwIDAgMCAxIDAgMCAwIDAuMTYgMCIvPjxmZUJsZW5kIGluMj0ic2hhcGUiIHJlc3VsdD0iZWZmZWN0MV9pbm5lclNoYWRvd180Mjc4XzU2NTk0Ii8+PGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUFscGhhIiByZXN1bHQ9ImhhcmRBbHBoYSIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIvPjxmZU9mZnNldCBkeT0iNCIvPjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMiLz48ZmVDb21wb3NpdGUgaW4yPSJoYXJkQWxwaGEiIGsyPSItMSIgazM9IjEiIG9wZXJhdG9yPSJhcml0aG1ldGljIi8+PGZlQ29sb3JNYXRyaXggdmFsdWVzPSIwIDAgMCAwIDEgMCAwIDAgMCAwLjk1Mjk0MSAwIDAgMCAwIDAuOTAxOTYxIDAgMCAwIDAuMzIgMCIvPjxmZUJsZW5kIGluMj0iZWZmZWN0MV9pbm5lclNoYWRvd180Mjc4XzU2NTk0IiByZXN1bHQ9ImVmZmVjdDJfaW5uZXJTaGFkb3dfNDI3OF81NjU5NCIvPjwvZmlsdGVyPjwvZGVmcz48L3N2Zz4=',
  name: 'Vite Conf 2023',
  margin: 12,
  dotsOptions: {
    color: '#a661ea',
    type: 'classy-rounded'
  },
  cornersSquareOptions: {
    color: '#5d69a0',
    type: 'square'
  },
  cornersDotOptions: {
    color: '#5da5d8',
    type: 'square'
  },
  imageOptions: {
    margin: 0
  },
  style: {
    borderRadius: '12px',
    background: '#060817'
  }
}

export const vuei18nPreset: Preset = {
  ...defaultPresetOptions,
  name: 'Vue I18n',
  data: 'https://vue-i18n.intlify.dev/',
  image:
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB3aWR0aD0iMjU2IgogICBoZWlnaHQ9IjIyNCIKICAgdmlld0JveD0iMCAwIDY3LjczMzMzMiA1OS4yNjY2NjgiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzgiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMiA1YzNlODBkLCAyMDE3LTA4LTA2IgogICBzb2RpcG9kaTpkb2NuYW1lPSJ2dWUtaTE4bi5zdmciCiAgIGlua3NjYXBlOmV4cG9ydC1maWxlbmFtZT0iL1VzZXJzL2thenVwb24vRGVza3RvcC92dWUtaTE4bi5wbmciCiAgIGlua3NjYXBlOmV4cG9ydC14ZHBpPSI5NiIKICAgaW5rc2NhcGU6ZXhwb3J0LXlkcGk9Ijk2Ij4KICA8ZGVmcwogICAgIGlkPSJkZWZzMiIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMiIKICAgICBpbmtzY2FwZTpjeD0iNjUuMTcxMTk2IgogICAgIGlua3NjYXBlOmN5PSIxMDYuMTcxNTIiCiAgICAgaW5rc2NhcGU6ZG9jdW1lbnQtdW5pdHM9Im1tIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9ImxheWVyMSIKICAgICBzaG93Z3JpZD0idHJ1ZSIKICAgICB1bml0cz0icHgiCiAgICAgc2hvd2d1aWRlcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6bG9ja2d1aWRlcz0iZmFsc2UiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxMjgwIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9Ijc1MSIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMSIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIj4KICAgIDxpbmtzY2FwZTpncmlkCiAgICAgICB0eXBlPSJ4eWdyaWQiCiAgICAgICBpZD0iZ3JpZDM3MTUiIC8+CiAgPC9zb2RpcG9kaTpuYW1lZHZpZXc+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iTGF5ZXIgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwtMjM3LjczMzMxKSI+CiAgICA8cmVjdAogICAgICAgc3R5bGU9ImZpbGw6IzQyYjk4MztmaWxsLW9wYWNpdHk6MTtzdHJva2Utd2lkdGg6MC40NDgwMTM4NyIKICAgICAgIGlkPSJyZWN0NDUyNCIKICAgICAgIHdpZHRoPSI2Ny43MzMzMyIKICAgICAgIGhlaWdodD0iNTkuMjY2NjY2IgogICAgICAgeD0iMCIKICAgICAgIHk9IjIzNy43MzMzMSIKICAgICAgIHJ5PSI2Ljg3OTE2NjYiIC8+CiAgICA8cmVjdAogICAgICAgc3R5bGU9ImZpbGw6IzM0NDk1ZTtmaWxsLW9wYWNpdHk6MTtzdHJva2Utd2lkdGg6MS4yOTIxNDk0MiIKICAgICAgIGlkPSJyZWN0NDUyOCIKICAgICAgIHdpZHRoPSI1NS4wMzMzMzMiCiAgICAgICBoZWlnaHQ9IjQ1LjUwODMzNSIKICAgICAgIHg9IjYuMzQ5OTk5OSIKICAgICAgIHk9IjI0NC42MTI0NyIKICAgICAgIHJ5PSI2Ljg3OTE2NjYiIC8+CiAgICA8cGF0aAogICAgICAgc3R5bGU9ImZpbGw6IzM0NDk1ZTtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6NS4zOTcwMzk0MTtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiCiAgICAgICBkPSJtIDMzLjg2NjY2NywyNzAuNTQxNjUgdiAyNi40NTgzMyBMIDYuMzUsMjcwLjU0MTY1IFoiCiAgICAgICBpZD0icGF0aDQ1MzgiCiAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogICAgPGNpcmNsZQogICAgICAgc3R5bGU9ImZpbGw6bm9uZTtmaWxsLW9wYWNpdHk6MTtzdHJva2U6I2ZmZmZmZjtzdHJva2Utd2lkdGg6Mi4xMTcxNjM0MjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiCiAgICAgICBpZD0icGF0aDQ1NjciCiAgICAgICBjeD0iMzQuMDA4NTIyIgogICAgICAgY3k9Ii0yNjcuMzcxIgogICAgICAgdHJhbnNmb3JtPSJzY2FsZSgxLC0xKSIKICAgICAgIHI9IjE1LjYxMDE2OCIgLz4KICAgIDxlbGxpcHNlCiAgICAgICBzdHlsZT0iZmlsbDpub25lO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTojZmZmZmZmO3N0cm9rZS13aWR0aDoyLjA2NzY2MjtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO3BhaW50LW9yZGVyOnN0cm9rZSBmaWxsIG1hcmtlcnMiCiAgICAgICBpZD0icGF0aDQ1NjctNyIKICAgICAgIGN4PSIzMy45Mjk0ODUiCiAgICAgICBjeT0iLTI2Ny40MDU5MSIKICAgICAgIHRyYW5zZm9ybT0ic2NhbGUoMSwtMSkiCiAgICAgICByeD0iNy40MzI4MzU2IgogICAgICAgcnk9IjE1LjYzNDkxOSIgLz4KICAgIDxwYXRoCiAgICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojZmZmZmZmO3N0cm9rZS13aWR0aDoyLjExNjY2NjU2O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICBkPSJtIDMzLjg2NjY2NywyNTIuMDIwODEgdiAzMC40MjcwOCB6IgogICAgICAgaWQ9InBhdGg0NTk2IgogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz4KICAgIDxwYXRoCiAgICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojZmZmZmZmO3N0cm9rZS13aWR0aDoyLjExNjY2NjU2O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICBkPSJNIDQ4Ljk0NzkxNywyNjcuODk1ODEgSCAxOC41MjA4MzcgWiIKICAgICAgIGlkPSJwYXRoNDU5Ni0yIgogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz4KICAgIDxwYXRoCiAgICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojZmZmZmZmO3N0cm9rZS13aWR0aDoyLjAyMjU0NDg2O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICBkPSJNIDQ3LjYyNSwyNTkuOTU4MzEgSCAxOS44NDM3NTMgWiIKICAgICAgIGlkPSJwYXRoNDU5Ni0yLTgiCiAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogICAgPHBhdGgKICAgICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNmZmZmZmY7c3Ryb2tlLXdpZHRoOjIuMDIyNTQ0ODY7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGQ9Ik0gNDcuNjI1LDI3NS4zMDQxNCBIIDE5Ljg0Mzc1MyBaIgogICAgICAgaWQ9InBhdGg0NTk2LTItOC00IgogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgLz4KICA8L2c+Cjwvc3ZnPgo=',
  dotsOptions: {
    color: '#41b983',
    type: 'rounded'
  },
  cornersSquareOptions: {
    color: '#41b983',
    type: 'extra-rounded'
  },
  cornersDotOptions: {
    color: '#41b983',
    type: 'dot'
  },
  imageOptions: {
    margin: 2
  },
  style: {
    borderRadius: '24px',
    background: '#34495e'
  }
}

export const vueJsPreset: Preset = {
  ...defaultPresetOptions,
  name: 'VueJS',
  data: 'https://vuejs.org/',
  image: 'https://api.iconify.design/logos:vue.svg',
  dotsOptions: {
    color: '#35495e',
    type: 'rounded'
  },
  cornersSquareOptions: {
    color: '#40b883',
    type: 'extra-rounded'
  },
  cornersDotOptions: {
    color: '#40b883',
    type: 'dot'
  },
  imageOptions: {
    margin: 2
  },
  style: {
    borderRadius: '24px',
    background: '#ffffff'
  }
}

// Individual presets

export const defaultPreset: Preset = {
  ...defaultPresetOptions,
  name: 'Default (lyqht)',
  data: 'https://github.com/lyqht',
  image: PLACEHOLDER_IMAGE_URL,
  dotsOptions: {
    color: '#abcbca',
    type: 'extra-rounded'
  },
  cornersSquareOptions: {
    color: '#abcbca',
    type: 'extra-rounded'
  },
  cornersDotOptions: {
    color: '#abcbca',
    type: 'square'
  },
  style: {
    borderRadius: '24px',
    background: '#697d80'
  }
}
export const pejuangKodePreset: Preset = {
  ...defaultPresetOptions,
  name: 'Pejuang Kode',
  data: 'https://docs.zavi.family/',
  image: 'https://docs.zavi.family/images/pejuang-kode-logo.png',
  width: 400,
  height: 400,
  margin: 0,
  dotsOptions: { color: '#252f3f', type: 'classy-rounded' },
  cornersSquareOptions: { color: '#252f3f', type: 'dot' },
  cornersDotOptions: { color: '#f05252', type: 'dot' },
  imageOptions: { margin: -1 },
  style: { borderRadius: '22px', background: '#ffffff' }
}

export const geeksHackingPreset = {
  ...defaultPresetOptions,
  name: 'GeeksHacking',
  ...GeeksHackingConfig.props,
  style: GeeksHackingConfig.style
} as Preset

export const spDigitalPreset = {
  ...defaultPresetOptions,
  name: 'SP Digital',
  ...SpDigitalConfig.props,
  style: SpDigitalConfig.style
} as Preset

export const govtechStackCommunityPreset = {
  ...defaultPresetOptions,
  name: 'GovTech - Stack Community',
  ...GovtechStackCommunityConfig.props,
  style: GovtechStackCommunityConfig.style
} as Preset

export const plainPreset = {
  ...defaultPresetOptions,
  name: 'Plain',
  ...PlainConfig.props,
  style: PlainConfig.style
} as Preset

export const hackomania2025Preset = {
  ...defaultPresetOptions,
  name: 'Hackomania 2025',
  ...Hackomania2025Config.props,
  style: Hackomania2025Config.style
} as Preset

export const allPresets: Preset[] = [
  defaultPreset,
  plainPreset,
  ...[
    padletPreset,
    uiliciousPreset,
    supabaseGreenPreset,
    supabasePurplePreset,
    vercelLightPreset,
    vercelDarkPreset,
    viteConf2023Preset,
    vueJsPreset,
    vuei18nPreset,
    pejuangKodePreset,
    geeksHackingPreset,
    spDigitalPreset,
    govtechStackCommunityPreset,
    hackomania2025Preset
  ].sort((a, b) => a.name.localeCompare(b.name))
]
