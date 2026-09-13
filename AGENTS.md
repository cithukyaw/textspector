# AGENTS.md - TextSpector (AI Text Detector)

## Project
Client-side React SPA (Vite + React 19 + TS + Tailwind v4) that scores text as AI- vs human-written. Detection runs through one of three engines selected by env:
- **OpenRouter** via server-side proxy `POST /api/detect`
- **Ollama** local (`{VITE_OLLAMA_BASE_URL}/api/chat`)
- **Offline heuristic** (`src/services/heuristicDetector.ts`)

Provider is env-only (`VITE_PROVIDER`). **There is no UI provider switcher** - do not add one.

## Commands (bun - `bun.lock` is the only lockfile)
- `bun run dev` -> `tsx server.ts`: Express + Vite middleware, serves on **http://localhost:3000** (not Vite's default 5173). HMR/file-watch disabled when `DISABLE_HMR=true`.
- `bun run lint` -> `tsc --noEmit`. This is the **only** lint AND typecheck step (no ESLint/Prettier, no separate typecheck script).
- `bun run build` -> `vite build`, then esbuild bundles `server.ts` -> `dist/server.cjs`.
- `bun run start` -> `node dist/server.cjs` (needs `bun run build` first).
- `bun run preview` -> `vite preview`.
- **No test framework/script exists** - verify with `bun run lint` (+ `bun run build` if touching build path).

## Architecture & request flow
- Dev and self-hosted prod share `server.ts` (Express): mounts Vite middleware (dev) or static `dist/` (prod), plus `/api/detect` and `/api/health` routes.
- Vercel: `vercel.json` builds only Vite (`vite build`, output `dist/`) and serves `api/detect.ts` as a serverless function; all non-`/api/*` routes rewrite to `index.html`. Keep `api/detect.ts` a plain Node handler (no Express, no `app.listen`).
- OpenRouter flow: `src/services/openrouter.ts` (thin client) -> `POST /api/detect` -> `api/detect.ts` -> OpenRouter API. **`OPENROUTER_API_KEY` is read server-side only - never reference it in client code.** (Legacy `VITE_OPENROUTER_API_KEY` is still accepted as fallback inside `api/detect.ts`; the request body, headers, and model routing live there, not in the client.)
- Ollama flow: `src/services/ollama.ts` calls `{baseUrl}/api/chat` directly from the browser - requires Ollama with `OLLAMA_ORIGINS="*"`.
- Server config errors from `api/detect.ts`: `MISSING_OPENROUTER_KEY` (no `OPENROUTER_API_KEY`, caught by `src/App.tsx` -> auto-falls back to the offline heuristic + notice) and `MISSING_OPENROUTER_MODELS` (400 when no `model` / default / list entry is resolvable). `src/services/openrouter.ts` surfaces these as error messages; `EnvironmentNotice.tsx` holds the toggle and setup hints.

## Single source of truth (shared between client and server)
- `SYSTEM_PROMPT` and the robust LLM JSON parser `parseDetectorResponse` (backtick / `{...}`-brace stripping, score clamping, verdict derivation, field defaults) live in **`src/utils/detector.ts`**, imported by `src/services/ollama.ts` (browser) and `api/detect.ts` (server). Keep this file universal: no `import.meta`, no DOM, no Node-only APIs - it ships in the Vite bundle AND the Vercel/Express bundles.
- `paragraphIndex` fallback is 1-based (`idx + 1`) to match the UI: `TextForensicView.tsx` matches paragraphs via `paragraphIndex === idx + 1`. Keep it that way.
- Response schema type definition: `src/types/detector.ts` (`DetectorResult`).

## Env vars (`.env` is gitignored - only `.env.example` is tracked; never commit real keys)
- Server-side secret: `OPENROUTER_API_KEY`.
- Client build-time `VITE_*`: `VITE_PROVIDER`, `VITE_OPENROUTER_DEFAULT_MODEL`, `VITE_OPENROUTER_MODELS` (comma-separated), `VITE_OLLAMA_BASE_URL`, `VITE_OLLAMA_DEFAULT_MODEL`, `VITE_OLLAMA_MODELS` (comma-separated).
- `VITE_OPENROUTER_MODELS` / `VITE_OLLAMA_MODELS` are the single source of truth for the model lists - no hardcoded fallback arrays remain. Client reads them at build time (`import.meta.env`); server reads `VITE_OPENROUTER_MODELS` (also accepts `OPENROUTER_MODELS`) from `process.env` at runtime. Keep values identical between client build env and server env or the two sides diverge. The client sends its chosen `model` in the POST body; client `defaultModel` = `VITE_OPENROUTER_DEFAULT_MODEL` (or `VITE_OLLAMA_DEFAULT_MODEL`) || the first entry of its model list - **no hardcoded default model string remains**. If neither env default nor a list is set, the client omits `model` and the server returns `MISSING_OPENROUTER_MODELS`. Ollama defaults/settings are client-only in `src/config.ts`.
- `GEMINI_API_KEY`, `APP_URL` (in `.env.example`) and the `@google/genai` dependency are vestigial - unused anywhere in source. Don't wire them up without asking.

## Conventions & gotchas
- Import alias `@` -> **project root**: `@/api/detect.ts`, `@/src/...` (`vite.config.ts` alias + tsconfig `paths`). `tsconfig.json` sets `allowImportingTsExtensions`; `server.ts` imports the API handler with an explicit `.ts` extension.
- tsconfig has **no `strict`**: a clean `tsc --noEmit` misses many type issues - keep types explicit.
- `vite.config.ts` has a comment on the `DISABLE_HMR` block - do not modify it (prevents flicker while agents edit files in AI Studio).
- Input requires >=25 characters; enforced in both `src/services/detectorService.ts` and `api/detect.ts`.
- UI: verdict badge colors (green=Likely Human, yellow=Mixed / Edited, red=Likely AI), radial gauge, metrics grid, and paragraph breakdown live in `src/components/`. The Ollama model selector renders only when `VITE_PROVIDER=ollama` and is populated from `APP_CONFIG.ollama.models` (no `/api/tags` call).