# Overture — Copilot Instructions

## What This Is

Overture is a browser-based **real-time audio engine for tabletop RPG Dungeon Masters**. It layers ambient loops, music, randomized emitters, and one-shot SFX into immersive soundscapes, all running client-side via the Web Audio API. Built with Next.js 15 (App Router), React 18, and TypeScript.

**Project stage:** Early development — favor simplicity and getting to MVP quickly. Avoid over-engineering; prefer the simplest solution that works.

## Architecture

### Audio Engine (`src/engine/`)
A **singleton** (`AudioEngine.getInstance()`) owns five subsystems wired together at `initialize()`:
- **`AudioMixer`** — 4-bus routing graph (`music | ambience | sfx | dialogue`) → compressor → destination, plus a reverb send/return.
- **`AssetManager`** — fetch + `decodeAudioData` cache keyed by string asset IDs. Deduplicates in-flight loads.
- **`SourcePlayer`** — creates `AudioBufferSourceNode` per play, routes through bus gain nodes, tracks active sources for stop/cleanup.
- **`AudioScheduler`** — Web Worker posting ticks every 25ms to drive `SceneDirector.tick()`, avoiding main-thread timer drift.
- **`SceneDirector`** — orchestrates scene lifecycle: `loadScene()` fetches assets, `activateScene()` crossfades layers/emitters. Holds mutable `LayerState` map and `RandomContainer` instances for probabilistic emitters.

**Key pattern:** `RandomContainer` uses Fisher-Yates shuffle pools for non-repeating variant selection with per-emitter probability, pitch, and gain variance.

### UI Layer (`src/components/`, `src/context/`)
- **`AudioEngineContext`** — React context + `useAudioEngine()` hook bridges engine to components. Uses `requestAnimationFrame` loop to sync `LayerState` from engine into React state. Engine is initialized on user gesture ("Start Session" button) to satisfy browser autoplay policy.
- **`AppLayout`** — responsive: 3-column on tablet+, swipeable 3-panel on mobile (SceneBrowser → NowPlaying → SFXBoard).
- Components are **props-driven** (no direct engine access); all engine calls flow through context callbacks.

### Scene Data & Persistence
- Scenes are **user-configurable and persisted** — not hardcoded. `demoScenes.ts` provides seed data only.
- Persistence uses `localStorage` for MVP. Scenes are stored as serialized `SceneConfig[]`.
- `sfxLibrary.ts` — global SFX palette with typed `SFXCategory` union for the SFXBoard tabs.

## Key Types (`src/engine/types.ts`)

`SceneConfig` is the central data shape. A scene has:
- `layers: LayerConfig[]` — continuous loops assigned to a `BusName`
- `emitters: EmitterConfig[]` — probabilistic one-shots with weighted variants
- `quickfire: QuickfireSFX[]` — manual-trigger buttons shown in NowPlaying
- `assetManifest?: Record<string, string>` — maps asset IDs → URLs for the AssetManager

When adding new audio features, extend these types first, then update `SceneDirector`.

## Development

```bash
npm run dev      # Next.js dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # ESLint (next/core-web-vitals config)
npm run test     # Vitest unit/component tests
npm run test:ui  # Vitest browser UI
```

Path alias `@/*` maps to `./src/*`.

## Styling: Tailwind CSS + shadcn/ui

- **Tailwind CSS** for all styling — use utility classes, not CSS modules or inline style objects.
- **shadcn/ui** for UI components — install components via `npx shadcn@latest add <component>`. Components land in `src/components/ui/` and are owned source code (edit freely).
- Theme tokens are defined in `tailwind.config.ts` and CSS variables in `globals.css`. Dark mode is the only mode (gold `#D4A843` primary, `#0E0E12` background).
- **Scene accent colors** propagate from `SceneConfig.accentColor` into component borders, gradients, and tints via inline `style` or Tailwind arbitrary values like `border-[${color}]`.
- **MUI is being replaced** — migrate components to shadcn/ui + Tailwind as you touch them. Do not add new MUI usage.

## Testing (`src/__tests__/`)

- **Vitest** for unit and component tests with `@testing-library/react`.
- Test files live in `src/__tests__/` mirroring the source tree (e.g., `src/__tests__/engine/randomContainer.test.ts`).
- Name test files `*.test.ts` (pure logic) or `*.test.tsx` (components).
- Engine classes are pure TypeScript with no DOM deps (except `AudioContext`) — test them directly. Mock `AudioContext` when needed using the `createMockAudioContext` helper in test utils.
- Run `npm run test` before committing.

## Conventions

- **`'use client'`** on every component/context file — the app is fully client-rendered under the App Router server layout.
- Gain ramps use `setTargetAtTime` with time constant `0.01` — never set `.value` directly on active gain nodes.
- The `public/worklets/meter-processor.js` AudioWorklet is available but not yet wired into the engine.
- Keep things simple — this is MVP stage. Prefer fewer abstractions and straightforward implementations.
