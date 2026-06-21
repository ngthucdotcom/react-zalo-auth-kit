# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`react-zalo-auth-kit` is a published npm package (React components + hooks for Zalo OAuth/PKCE login). The root of this repo *is* the package source (`src/`); `example/`, `example-cloud/`, `passport-cloud/`, and `stories/` are consumers/demos of that package, not part of the published artifact.

## Commands

```bash
npm run storybook          # Storybook dev server on :6006 — primary way to develop/preview components
npm run build-storybook    # static Storybook build -> storybook-static/
npm run build              # rm -rf dist && babel src --out-dir dist --copy-files (this is what actually ships)
npm test                   # react-scripts test (CRA test runner)
npm run patch|minor|major  # npm version bump (no commit/tag yet)
npm run auto               # patch -> build -> publish from dist/ (full release in one command)
```

Note: `rollup.config.js` exists (esm/cjs dual build + `.d.ts` bundling via rollup-plugin-dts) but the `build` script in `package.json` does **not** invoke it — it uses plain Babel. If you change the build pipeline, check whether `pkg.main`/`pkg.module` (`dist/cjs/index`, `dist/esm/index`) still line up with what `npm run build` actually produces, since right now Babel just emits flat `dist/*.js` files. Treat the rollup config as currently dormant/needs reconciliation rather than authoritative.

There is no lint script wired up despite `ts-standard` and an `eslintConfig` (`react-app`, `react-app/jest`) being present in `package.json`.

To work on the `example/`, `example-cloud/`, or `passport-cloud/` sub-projects, `cd` into them first — each has its own `package.json`/`package-lock.json` and is not part of the root npm workspace.

## Architecture

### Two parallel auth APIs (don't conflate them)

The package exposes **two independent ways** to do the same OAuth+PKCE flow against Zalo, aimed at different use cases:

1. **`useZaloAuthKit(config)`** (`src/useZaloAuthKit.js`) — a plain hook-returning-object with all logic self-contained (PKCE generation/verification, building the OAuth URL, exchanging code for tokens, fetching the profile from the Zalo Graph API). Consumed directly by app code; see `ZaloLoginPopup` usage patterns in the README and `example/src/BasicAuth.js`.

2. **`getZaloAuth()` + `ZaloAuthProvider`** (`src/index.js` + `src/ZaloAuthProvider.js`) — a **Firebase Auth-shaped facade**. `ZaloAuthProvider.js` is essentially a hand-rolled mirror of `firebase/auth`'s public types (`Auth`, `AuthCredential`, `OAuthProvider`, `UserCredential`, `ProviderId`, etc.) with a Zalo-specific `ZaloAuthProvider extends OAuthProvider` and `ZaloAuthConfigure` bolted on. `getZaloAuth()` in `src/index.js` builds an `authApp` object whose `onAuthStateChanged` polls `window.location.search` every 5s for the OAuth callback params, then chains `signInWithAuthCode` -> `signInWithZalo` -> optionally a custom-token exchange -> `signInWithCustomToken` (real `firebase/auth`). This is the path `ZaloLoginButton` uses (`auth.onAuthStateChanged(auth, authProvider, ...)`).

When editing OAuth/token logic, check **both** `useZaloAuthKit.js` and `index.js` — the PKCE/fetch logic (build form-encoded body, call `ACCESS_TOKEN_URI`, then Graph API `/me`) is duplicated between them rather than shared, and `signInWithZalo.js` / `useZaloAuthFlow.js` are yet other variants of the same fetch sequence kept for backward compatibility. Confirm which entry point a change should target instead of assuming one util file is canonical.

### Custom Token Flow (server-assisted Firebase sign-in)

`ZaloAuthConfigure.customTokenFlow` / `CustomTokenFlow` (`src/ZaloAuthProvider.js`) lets a consumer skip Firebase's native OAuth flow entirely: after Zalo profile fetch succeeds, this package POSTs the Zalo `uid`/tokens to a developer-supplied HTTP endpoint, expects back `{ token }` (a Firebase custom token minted server-side via Admin SDK), and calls `signInWithCustomToken`. `passport-cloud/functions/index.js` is a reference implementation of that endpoint (Firebase Cloud Function + Admin SDK), and `example-cloud/` is the matching frontend demo. If you're touching the custom-token path, read the request/response shape in both `ZaloAuthProvider.js` (`credentialFromResult`) and `passport-cloud/functions/index.js` together — they must agree on field names (`uid`, `accessToken`, `refreshToken`/`idToken`, returned `token`).

### Popup-based OAuth handoff

Both APIs rely on opening a popup window (`util.js#openPopup`, or `react-new-window` via `ZaloLoginPopup.js`) to `oauth.zaloapp.com`, then having the popup itself detect the redirect-back query params (`code`, `state`, `code_challenge`) and call back into the opener via `window.opener.handleZaloResponse(...)` / `window.opener.handleSignInWithZalo(...)` before `window.close()`. The `code_verifier` is round-tripped through the popup as the base64-encoded `state` param (`window.btoa(code_verifier)` / `window.atob(...)`) since the popup has no other way to recover it. Any change to PKCE state handling must keep the opener and popup sides in sync — they communicate only through global `window` callbacks and the URL query string, not React state.

### Component layer

- `ZaloStyledButton` — presentational Firebase-UI-styled button (`src/assets/firebaseui.css`, `src/assets/zalo.png`).
- `ZaloLoginButton` — wires `ZaloStyledButton` to `signInZaloWithPopup` + `auth.onAuthStateChanged` (the Firebase-facade path).
- `ZaloLoginPopup` — thin wrapper over `react-new-window`, used by the `useZaloAuthKit` path.
- `src/loading/` — a manually-mounted (non-React-tree) loading overlay, created/removed via direct DOM manipulation (`createRoot`/`removeChild` against a detached `#react-confirm-alert` div), invoked by `ShowLoading`/`HideLoading` during the `onAuthStateChanged` polling loop.

### Storybook

Stories live in `stories/*.stories.jsx` (not colocated with components in `src/`). `.storybook/main.js` uses the Vite builder with custom esbuild JSX loader overrides for `.js` files. See `README.storybook.md` for what each story demonstrates.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **react-zalo-auth-kit** (419 symbols, 716 relationships, 21 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "master"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/react-zalo-auth-kit/context` | Codebase overview, check index freshness |
| `gitnexus://repo/react-zalo-auth-kit/clusters` | All functional areas |
| `gitnexus://repo/react-zalo-auth-kit/processes` | All execution flows |
| `gitnexus://repo/react-zalo-auth-kit/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
