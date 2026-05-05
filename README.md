# triari-slides

Presentaciones corporativas de Triari Partners construidas con [open-slide](https://github.com/1weiho/open-slide) — slides como componentes React, renderizados en canvas 1920×1080.

## Arrancar en local

```bash
pnpm install
pnpm dev
```

Abre `http://localhost:5173` — verás el índice de todos los decks. Navega con flechas, `F` para fullscreen.

## Estructura

```
slides/
  <nombre-deck>/
    index.tsx       # export default: array de Page components
    assets/         # imágenes, fuentes, vídeos del deck
themes/             # temas reutilizables entre decks
.agents/skills/     # skills de Claude Code para generar slides con IA
```

## Crear un nuevo deck

```bash
# Opción A — manual
mkdir slides/mi-presentacion
# edita slides/mi-presentacion/index.tsx (ver plantilla abajo)

# Opción B — con Claude Code
# Ejecuta el skill "create-slide" o pide: "crea un deck sobre X"
```

### Plantilla mínima

```tsx
import type { Page, SlideMeta } from '@open-slide/core';

const Portada: Page = () => (
  <div style={{ width: '100%', height: '100%', background: '#0A2A1C', color: '#7CF0A8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Geist, sans-serif', fontSize: 80 }}>
    Mi presentación
  </div>
);

export const meta: SlideMeta = { title: 'Mi presentación' };
export default [Portada] satisfies Page[];
```

Cada `Page` renderiza en un canvas fijo de **1920 × 1080 px**. Usa valores absolutos en px.

## Exportar a PDF

```bash
pnpm build          # genera dist/ con bundle estático
# Despliega dist/ en Vercel/Netlify y usa la función de impresión del browser (Ctrl+P → Guardar como PDF)
# O usa Playwright headless:
npx playwright chromium --headless "http://localhost:4173/mi-deck" --pdf=out.pdf
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Dev server con hot reload |
| `pnpm build` | Bundle estático en `dist/` |
| `pnpm preview` | Preview del bundle local |
| `pnpm sync:skills` | Actualiza los skills de Claude Code al último `@open-slide/core` |

## Actualizar open-slide

```bash
pnpm update @open-slide/core --latest
pnpm sync:skills
```

## Deck de ejemplo

`slides/getting-started/` — deck de bienvenida con diseño oscuro y logos. Úsalo como referencia de estructura y tokens de diseño.
