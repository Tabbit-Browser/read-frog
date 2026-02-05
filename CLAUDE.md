# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tabbit Translation is an AI-powered browser extension for immersive translation and language learning.

## Design Principles

- **SOLID**: Single Responsibility, Open/Closed (extend via composition), Liskov, Interface Segregation, Dependency Inversion
- **DRY, KISS, YAGNI**: No duplication; simplest solution; don't build for imaginary futures
- **Functional Lean**: Prefer pure functions, immutability, clear boundaries (ports & adapters)

Before implementing, ask:
1. Is this a real problem or imagined?
2. Is there a simpler way?
3. Will it break anything?

## Tech Stack

- **Framework**: [WXT](https://wxt.dev/) - Manifest V3 browser extension framework
- **UI**: React 19, TailwindCSS 4, Radix UI, shadcn/ui
- **State**: Jotai with custom storage adapter for cross-context sync
- **Database**: Dexie (IndexedDB wrapper)
- **AI**: Vercel AI SDK
- **i18n**: @wxt-dev/i18n with YML files in `src/locales/`

## Development Commands

```bash
# Development
pnpm dev                    # Start dev mode (Chrome, localhost:3333)
pnpm dev:local              # Dev with local monorepo packages

# Testing
pnpm test                   # Run all tests
pnpm test:watch             # Watch mode
pnpm test:cov               # With coverage
vitest run src/path/to/file.test.ts  # Single test file

# Quality
pnpm type-check             # TypeScript check
pnpm lint                   # ESLint
pnpm lint:fix               # Auto-fix lint issues

# Build
pnpm build                  # Production build to .output/
pnpm build:analyze          # Build with bundle analysis
pnpm zip                    # Create distributable ZIP
```

## Architecture

### Extension Entrypoints (WXT pattern)

- **`src/entrypoints/background/`** - Service worker: lifecycle, message routing, proxy fetch, translation queues, config backup
- **`src/entrypoints/*.content/`** - Content scripts:
  - `host.content` - Main article reading/analysis UI
  - `selection.content` - Text selection translation popup
  - `subtitles.content` - Video subtitle translation
  - `interceptor.content` - XHR request interception
- **`src/entrypoints/popup/`** - Extension popup UI
- **`src/entrypoints/options/`** - Settings page (multi-page React app)

### Messaging Architecture

Uses `@webext-core/messaging` for typed communication between contexts. Protocol defined in `src/utils/message.ts`:

```typescript
// Send from content script to background
import { sendMessage } from '@/utils/message'
await sendMessage('backgroundFetch', { url, options })

// Listen in background
import { onMessage } from '@/utils/message'
onMessage('backgroundFetch', async (message) => { ... })
```

### State Management

**Config Atom** (`src/utils/atoms/config.ts`):
- Single source of truth for settings
- Optimistic updates with write queue for sequential storage operations
- Cross-context sync via `storageAdapter.watch()`
- Visibility change handler to refresh stale tabs

**Storage Adapter** (`src/utils/atoms/storage-adapter.ts`):
- Abstraction over `browser.storage` API
- Zod schema validation on read/write
- `get`, `set`, `watch` methods

### Config Migration

When changing config schema:
1. Add migration script to `src/utils/config/migration-scripts/`
2. Update `CONFIG_SCHEMA_VERSION` constant
3. Write test examples in `__tests__/example/`

## Commit Conventions

Conventional Commits enforced via commitlint:

Standard: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Custom: `i18n`, `ai`

## Important Notes

Be concise. Sacrifice grammar for brevity.
