# Usage guide

> English summary. The original Spanish guide is preserved below for the
> maintainer's reference.

## Product flow

1. Pick the element on the stage.
2. Adjust transforms, filters, and appearance in the sidebar.
3. Add keyframes from the property controls.
4. Edit easing, duration, and playback on the timeline.
5. Preview the result in CSS or Three.js.
6. Export the code from the lower panel.

## Local development

### Install

```bash
pnpm install
```

### Develop

```bash
pnpm run dev
```

### Quick validation

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

## Logs

The main scripts write outputs to `logs/`:

- `typecheck.latest.log`
- `lint.latest.log`
- `test.latest.log`
- `build.latest.log`

Timestamped versions are also kept for local auditing.

## VS Code tasks

The workspace includes short tasks with emoji prefixes for:

- development
- build
- check
- typecheck
- lint
- format
- test
- coverage
- clean
- preview

## Operational notes

- The Three.js engine is loaded on demand.
- 3D models are only visualized correctly in Three.js mode.
- Local persistence saves history, configuration, and selected media.

---

## (Original Spanish — preserved for reference)

### Flujo de producto

1. Elegí el elemento del escenario.
2. Ajustá transforms, filtros y apariencia en el sidebar.
3. Agregá keyframes desde los controles de propiedad.
4. Editá easing, duración y reproducción en la timeline.
5. Probá el resultado en CSS o Three.js.
6. Exportá el código desde el panel inferior.

### Flujo de desarrollo local

#### Instalar

```bash
pnpm install
```

#### Desarrollo

```bash
pnpm run dev
```

#### Validación rápida

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

### Logs

Los scripts principales escriben salidas en `logs/`:

- `typecheck.latest.log`
- `lint.latest.log`
- `test.latest.log`
- `build.latest.log`

También se guardan versiones con timestamp para auditoría local.

### Tareas de VS Code

El workspace incluye tareas cortas con emojis para:

- desarrollo
- build
- check
- typecheck
- lint
- format
- test
- coverage
- clean
- preview

### Notas de operación

- El modo Three.js se carga de forma diferida.
- Los modelos 3D sólo se visualizan correctamente en el modo Three.js.
- La persistencia local guarda historial, configuración y media seleccionada.
