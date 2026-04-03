# Dashboard Visual System

Este documento resume los tokens y decisiones visuales aplicadas al dashboard para mantener un estilo premium, escalable y consistente.

## 1) Tokens globales

Definidos en [frontend/app/globals.css](../app/globals.css).

### Superficies
- `--dashboard-bg`: fondo general (capa 0)
- `--dashboard-surface-base`: base tonal del shell
- `--dashboard-surface-1`: panel principal elevado (capa 1)
- `--dashboard-surface-2`: modulo/card secundaria (capa 2)

### Texto
- `--dashboard-text-primary`: titulos y contenido principal
- `--dashboard-text-secondary`: texto base y descripciones
- `--dashboard-text-muted`: etiquetas auxiliares y metadata

### Bordes
- `--dashboard-border-subtle`: separadores y contornos suaves
- `--dashboard-border-default`: contornos activos de baja prioridad
- `--dashboard-border-focus`: realce de foco (capa 3)

### Sombras
- `--dashboard-shadow-sm`: tarjetas y elementos compactos
- `--dashboard-shadow-md`: paneles secundarios
- `--dashboard-shadow-lg`: shell principal

### Radios
- `--dashboard-radius-sm`
- `--dashboard-radius-md`
- `--dashboard-radius-lg`
- `--dashboard-radius-xl`

### Motion
- `--dashboard-duration-fast`: 150ms
- `--dashboard-duration-normal`: 220ms

## 2) Utilidades de sistema

Clases reutilizables en [frontend/app/globals.css](../app/globals.css):
- `.dashboard-app-bg`: atmosfera de fondo neutra con variacion tonal
- `.dashboard-main-shell`: contenedor principal del dashboard
- `.dashboard-surface-1`: panel primario elevado
- `.dashboard-surface-2`: modulo secundario
- `.dashboard-interactive`: transiciones estandar (transform, opacity, box-shadow, border-color, background, color)
- `.dashboard-focusable`: foco visible consistente
- `.dashboard-title`, `.dashboard-text-secondary`, `.dashboard-text-muted`

`prefers-reduced-motion` reduce transiciones y elimina transform en `:active`.

## 3) Jerarquia de profundidad aplicada

- Capa 0: fondo global neutro (`.dashboard-app-bg`).
- Capa 1: shell principal del dashboard (`.dashboard-main-shell`).
- Capa 2: paneles y cards (`.dashboard-surface-1` y `.dashboard-surface-2`).
- Capa 3: estado activo/focus por borde/acento, sin sombra exagerada.

## 4) Direccion de color

- Base: neutros frios (slate/surface) para legibilidad.
- Acento principal: teal para acciones primarias y foco.
- Estados semanticos: amber (pending), teal (confirmed), rose (cancelled), sky (completed).
- Los estados no dependen solo de color: mantienen etiqueta textual.

## 5) Escala tipografica y espaciado

- Tipografia jerarquica consistente:
  - Eyebrow: `text-[10px]` a `text-[11px]` uppercase y tracking alto
  - Body: `text-sm`
  - Titulos de modulo: `text-lg`
  - Titulos principales: `text-2xl` / `text-3xl`
- Espaciado base por bloques: 4, 5, 6 y 8 (`p-4`, `p-5`, `p-6`, `p-8`) con grid gaps de 2-5.

## 6) Estados interactivos estandar

Aplicados en botones, links, items de navegacion y controles:
- Hover: ajuste sutil de borde/fondo
- Active: `translateY(1px)` muy leve
- Focus-visible: outline de 2px con token de focus
- Disabled: opacidad y cursor no permitido en controles relevantes

## 7) Alcance del refactor

Se aplico al shell del dashboard, sidebar, pagina principal y modulos de agenda para evitar deuda visual y mantener coherencia del sistema.
