# CSS 3D Playground

Playground interactivo para diseñar, previsualizar y exportar animaciones 3D con una UI visual, timeline editable y soporte de render CSS y Three.js.

El proyecto quedó modernizado para trabajar con una base **Bun-first**, **Vite+ sobre Vite 8**, **React 19 + TypeScript**, **Tailwind CSS 4**, **Vitest 4**, **OXC** (`oxlint` + `oxfmt`) y **GSAP** como librería principal de exportación/animación recomendada.

## ✨ Qué ofrece

- **Render dual**: edición y vista previa con motor **CSS** o **Three.js**.
- **Timeline visual** con keyframes, selección múltiple, scrubbing y easing por propiedad.
- **Controles de transformación** para perspectiva, translate, rotate, scale, skew, filtros y apariencia.
- **Persistencia local** de estado e historial con restauración automática.
- **Soporte para media**: imagen, video y modelos `.glb` / `.gltf`.
- **Exportación de código** en CSS, GSAP, Three.js y compatibilidad heredada con Anime.js.
- **Sistema de diseño tokenizado** con Tailwind y utilidades visuales consistentes.
- **Calidad automatizada** con typecheck, lint, test, build y logs locales.

## 🧱 Stack actual

| Capa                     | Herramienta                                                   |
| ------------------------ | ------------------------------------------------------------- |
| Runtime                  | React 19 + TypeScript 5.8                                     |
| Dev / Build              | Vite+ + Vite 8                                                |
| Estilos                  | Tailwind CSS 4                                                |
| Estado global UI         | Zustand 5                                                     |
| Historial / persistencia | hooks locales (`useHistoryManager`, `useStageElementManager`) |
| 3D                       | Three.js                                                      |
| Animación recomendada    | GSAP                                                          |
| Tests                    | Vitest 4 + Testing Library + jsdom                            |
| Lint / format            | OXC (`oxlint`, `oxfmt`)                                       |
| Package manager          | Bun                                                           |

## 🚀 Arranque rápido

### Requisitos

- **Bun** `>= 1.3.11`
- **Node.js** `>= 20` para compatibilidad de herramientas auxiliares

### Instalar dependencias

```bash
bun install
```

### Desarrollo

```bash
bun run dev
```

Servidor local por defecto en `http://localhost:3000`.

## 🛠 Scripts útiles

Todos los scripts de validación y build importantes generan archivos en `logs/` mediante `scripts/run-with-log.mjs`.

| Script                  | Qué hace                                   |
| ----------------------- | ------------------------------------------ |
| `bun run dev`           | Levanta el entorno de desarrollo con Vite+ |
| `bun run check`         | Ejecuta chequeos integrados de Vite+       |
| `bun run typecheck`     | Ejecuta `tsc --noEmit`                     |
| `bun run lint`          | Ejecuta `oxlint --deny-warnings`           |
| `bun run lint:fix`      | Intenta correcciones automáticas de OXC    |
| `bun run format`        | Formatea el proyecto con `oxfmt`           |
| `bun run format:check`  | Verifica formato sin escribir              |
| `bun run test`          | Ejecuta la suite con Vite+ / Vitest        |
| `bun run test:watch`    | Ejecuta pruebas en modo watch              |
| `bun run test:coverage` | Genera cobertura en `coverage/`            |
| `bun run build`         | Compila producción en `dist/`              |
| `bun run preview`       | Previsualiza la build local                |
| `bun run clean`         | Limpia `dist/`, `coverage/` y `logs/`      |

## 🧭 Flujo de uso

1. **Elegí el elemento del stage**: card, cube, text, image o model.
2. **Ajustá transforms y estilos** desde el sidebar.
3. **Agregá keyframes** con el diamante junto a cada propiedad.
4. **Editá easing y tiempo** directamente en la timeline.
5. **Probá el resultado** con scrub, play/pause y loop.
6. **Exportá el código** usando el panel inferior según el motor seleccionado.

## 🗂 Documentación adicional

- `architecture.md`: arquitectura y flujo de datos actualizado.
- `docs/README.md`: índice de documentación del proyecto.
- `docs/USAGE.md`: guía operativa rápida.
- `docs/WORKLOG.md`: cambios aplicados en esta mejora integral.
- `TECH-DEBT.md`: deuda técnica y próximos pasos recomendados.

## ✅ Estado verificado

Última validación realizada en esta sesión:

- `bun run typecheck` ✅
- `bun run lint` ✅
- `bun run test` ✅ (`109/109`)
- `bun run build` ✅

## ⚠️ Notas conocidas

- En algunos entornos con Node 25 puede aparecer un warning relacionado con `--localstorage-file` al ejecutar tests; la suite sigue pasando y el comportamiento del proyecto no se ve afectado.
- El chunk lazy de Three.js es intencionalmente más pesado que el resto del bundle, porque el canvas 3D sólo se carga cuando se usa ese modo.
