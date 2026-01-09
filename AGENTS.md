# AI Agent Guide for YT-DLP Web Wrapper

This document helps AI assistants understand the project architecture, conventions, and workflows.

## Project Overview

**YT-DLP Web Wrapper** is a web-based interface for yt-dlp (YouTube media downloader). Users paste a YouTube URL, the app fetches metadata using yt-dlp CLI, allows format selection (video/audio/subtitles), and downloads to the server's storage directory.

### Project Scope

- **Personal Use**: Designed for individual use, not multi-tenant
- **Self-Hosted**: Intended to be deployed on personal servers or local machines
- **Single User**: No authentication, user management, or multi-user support required
- **Local Storage**: Downloads are saved to the server's local `/storage` directory

### Tech Stack

- **Framework**: TanStack Start (React + Vite + SSR)
- **Routing**: TanStack Router (file-based)
- **Forms**: TanStack Form
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Validation**: Zod
- **Server**: Nitro (SSR)
- **Language**: TypeScript
- **Linting/Formatting**: Biome

### Core Functionality

1. **Health Check**: Verify yt-dlp is installed and working
2. **URL Input**: Validate YouTube URLs with regex
3. **Metadata Fetch**: Extract video info (formats, subtitles, duration)
4. **Format Selection**: Choose video quality, audio format, and subtitles
5. **Download**: Merge selected formats and save to `/storage`

## Architecture

### Feature-Based Layered Architecture

```
src/
├── features/              # Feature modules (self-contained)
│   └── downloader/        # Download feature
│       ├── components/     # UI components (PascalCase.tsx)
│       ├── hooks/          # React hooks (camelCase with use*.ts)
│       ├── services/       # Business logic (camelCase.service.ts)
│       ├── types/          # TypeScript types (PascalCase.types.ts)
│       ├── validators/     # Zod schemas (camelCase.validator.ts)
│       └── utils/          # Utilities (camelCase.utils.ts)
│
├── server/                # Server-side code
│   ├── actions/           # Server actions (camelCase.actions.ts)
│   ├── services/          # Server services (camelCase.service.ts)
│   └── utils/             # Server utilities (camelCase.utils.ts)
│
├── shared/                # Cross-cutting code
│   ├── types/             # Shared types (PascalCase.types.ts)
│   └── constants/         # Constants (camelCase.constants.ts)
│
├── app/                   # App configuration
│   └── routes/            # TanStack Router routes
│       ├── __root.tsx     # Root layout
│       ├── index.tsx      # Home route
│       └── $.tsx          # 404 route
│
├── components/ui/         # shadcn UI components
├── lib/                   # Global utilities
└── styles.css             # Global styles
```

### Layer Responsibilities

**Server Layer (`/server`)**

- **actions/**: TanStack server actions (API endpoints)
- **services/**: yt-dlp CLI execution, data parsing
- **utils/**: Error handling, process utilities

**Feature Layer (`/features/{feature}`)**

- **components/**: Feature-specific UI components
- **hooks/**: React hooks for state management
- **services/**: Feature business logic (client-side)
- **types/**: Feature-specific types
- **validators/**: Zod schemas for validation
- **utils/**: Feature-specific utilities

**Shared Layer (`/shared`)**

- **types/**: Types used across layers (API contracts)
- **constants/**: App-wide constants

**App Layer (`/app`)**

- **routes/**: Route orchestration (thin, delegate to features)

## Key Patterns

### 1. Server Actions Pattern

Server actions are the API layer using TanStack Start's `createServerFn`:

```typescript
// src/server/actions/downloader.actions.ts
export const getVideoMetadataAction = createServerFn({ method: "POST" })
  .inputValidator(z.object({ url: z.string() }))
  .handler(async ({ data }) => {
    // Business logic
    return { success: true, data, error: null };
  });
```

**Always return `ServerResponse<T>`** from server actions:

```typescript
type ServerResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};
```

### 2. Component Structure Pattern

**Atomic Components** (`components/ui/`): Small, reusable UI pieces

```typescript
// src/features/downloader/components/ui/SelectionBadge.tsx
interface SelectionBadgeProps {
  icon: ReactNode;
  label: string;
  size?: string | null;
  active: boolean;
}

export function SelectionBadge({ ... }: SelectionBadgeProps) { }
```

**Composite Components** (`components/`): Compose atomic components

```typescript
// src/features/downloader/components/MetadataDisplay.tsx
export function MetadataDisplay({ data, videoUrl }: MetadataDisplayProps) {
  const { state, actions, data: view } = useMetadataManager(data);
  // Compose UI components
}
```

**Page Components** (`routes/` or top-level): Orchestration only

```typescript
// src/features/downloader/components/DownloaderPage.tsx
export function DownloaderPage() {
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  // Minimal state management, delegate to child components
}
```

### 3. Type Safety Pattern

**Define types in `types/`**:

```typescript
// src/features/downloader/types/video-metadata.types.ts
export interface VideoMetadata {
  title: string;
  thumbnail: string;
  duration?: number;
  channel?: string;
  subtitles: Subtitle[];
  videoFormats: VideoFormat[];
  audioFormats: AudioFormat[];
}
```

**Export from feature index** (optional):

```typescript
// src/features/downloader/index.ts
export * from "./types/video-metadata.types";
export * from "./components/MetadataDisplay";
```

### 4. Validation Pattern

Use Zod for all validation:

```typescript
// src/features/downloader/validators/video-url.validator.ts
export const youtubeInputURLSchema = z.object({
  url: z
    .url("Please enter a valid URL")
    .regex(YOUTUBE_REGEX, "Invalid YouTube URL"),
});
```

Use in TanStack Form:

```typescript
const form = useForm({
  validators: { onSubmit: youtubeInputURLSchema },
});
```

Use in Server Actions:

```typescript
export const action = createServerFn({ method: "POST" })
  .inputValidator(youtubeInputURLSchema)
  .handler(async ({ data }) => {});
```

### 5. Hook Pattern

Custom hooks manage complex state logic:

```typescript
// src/features/downloader/hooks/useMetadataManager.ts
export function useMetadataManager(data: VideoMetadata) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  // State management
  // Derived values
  // Actions
  return { state, actions, data };
}
```

## Naming Conventions

### File Names

- **Components**: `PascalCase.tsx` (e.g., `MetadataDisplay.tsx`)
- **Hooks**: `useCamelCase.ts` (e.g., `useMetadataManager.ts`)
- **Services**: `camelCase.service.ts` (e.g., `ytDlp.service.ts`)
- **Types**: `PascalCase.types.ts` (e.g., `VideoMetadata.types.ts`)
- **Validators**: `camelCase.validator.ts` (e.g., `videoUrl.validator.ts`)
- **Utils**: `camelCase.utils.ts` (e.g., `format.utils.ts`)
- **Constants**: `camelCase.constants.ts` (e.g., `youtube.constants.ts`)
- **Actions**: `camelCase.actions.ts` (e.g., `downloader.actions.ts`)

### Variable/Function Names

- **Components**: PascalCase (`MetadataDisplay`)
- **Hooks**: camelCase with `use` prefix (`useMetadataManager`)
- **Functions**: camelCase (`formatBitToMB`)
- **Constants**: UPPER_SNAKE_CASE or camelCase
- **Interfaces/Types**: PascalCase (`VideoMetadata`)

### Folder Names

- **lowercase-kebab-case**: `features/downloader/components/ui`

## Key Technical Decisions

### 1. Feature-Based Architecture

- Each feature is self-contained
- Easy to add new features without modifying existing code
- Clear ownership boundaries

### 2. Server Actions as API Layer

- TanStack Start server actions replace traditional API routes
- Type-safe client-server communication
- Built-in validation with Zod
- **Thin controller pattern**: Actions < 20 lines, delegate to services

### 3. Type-First Development

- All types defined explicitly
- No `any` types
- Centralized type definitions
- No type assertions (`as` operator)

### 4. Component Composition

- Atomic design principles
- Small, reusable components
- Clear prop interfaces

### 5. State Management

- Local state with React hooks
- No global state library (yet)
- Server state via loaders/actions

### 6. Zero Duplication

- Extract repeated logic to utilities/services
- No logic duplicated in 2+ places
- Centralized configuration (no hardcoded values)
- Centralized error handling

### 7. Server Layer Isolation

- Server code (`/server/**`) is completely isolated from client code
- Client can ONLY communicate with server via `createServerFn()` (server actions)
- Server code CANNOT import client code (components, hooks, etc.)
- Server actions are the only bridge between client and server

**Examples:**

✅ ALLOWED - Client calling server action:

```typescript
// src/features/downloader/components/MetadataDisplay.tsx
import { getVideoMetadataAction } from "@/server/actions/downloader.actions";

const handleSubmit = async () => {
  const result = await getVideoMetadataAction({ data: { url: videoUrl } });
};
```

❌ FORBIDDEN - Server importing client code:

```typescript
// src/server/actions/downloader.actions.ts
import { MetadataDisplay } from "@/features/downloader/components/MetadataDisplay"; // ERROR
```

❌ FORBIDDEN - Client importing server services directly:

```typescript
// src/features/downloader/hooks/useMetadataManager.ts
import { runYtDlp } from "@/server/services/yt-dlp.service"; // ERROR
```

## Development Workflow

### Adding a New Feature

1. **Create feature structure**:

   ```bash
   mkdir -p src/features/your-feature/{components,hooks,services,types,validators,utils}
   ```

2. **Define types**:

   ```typescript
   // src/features/your-feature/types/feature.types.ts
   export interface YourData {}
   ```

3. **Create validators**:

   ```typescript
   // src/features/your-feature/validators/input.validator.ts
   export const yourSchema = z.object({});
   ```

4. **Build components**:

   - Atomic UI components in `components/ui/`
   - Composite components in `components/`

5. **Create hooks**:

   ```typescript
   // src/features/your-feature/hooks/useYourHook.ts
   export function useYourHook() {}
   ```

6. **Add server actions** (if needed):

   ```typescript
   // src/server/actions/your-feature.actions.ts
   export const yourAction = createServerFn({}).handler(async () => {});
   ```

7. **Create route**:
   ```typescript
   // src/app/routes/your-route.tsx
   export const Route = createFileRoute("/your-route")({
     component: YourPage,
   });
   ```

### Modifying Existing Code

**Components**:

- Open component file
- Modify props interface if needed
- Update component logic
- Test in browser

**Server Actions**:

- Open action file in `src/server/actions/`
- Modify handler logic
- Ensure return type is `ServerResponse<T>`

**Types**:

- Modify type in `types/`
- Update all usages
- Run TypeScript check: `npx tsc --noEmit`

**Utilities**:

- Modify in `utils/` or `lib/`
- Update imports if needed

### Common Tasks

**Run development server**:

```bash
pnpm dev
```

**Build for production**:

```bash
pnpm build
```

**Run linting**:

```bash
pnpm lint
```

**Format code**:

```bash
pnpm format
```

**Run all checks**:

```bash
pnpm check
```

**Run tests**:

```bash
pnpm test
```

## Important Files

### Configuration

- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite configuration
- `biome.json`: Linting and formatting rules
- `tailwind.config.ts`: Tailwind CSS configuration (if separate)

### Entry Points

- `src/router.tsx`: Router configuration
- `src/app/routes/__root.tsx`: Root layout
- `src/app/routes/index.tsx`: Home page

### Server

- `src/server/actions/downloader.actions.ts`: Download server actions
- `src/server/services/yt-dlp.service.ts`: yt-dlp CLI wrapper
- `src/server/services/downloader.service.ts`: Download business logic

### Features

- `src/features/downloader/`: Complete downloader feature
  - `components/MetadataDisplay.tsx`: Main metadata display
  - `hooks/useMetadataManager.ts`: Format selection logic
  - `types/video-metadata.types.ts`: Video metadata types

## Dependencies Key Points

### TanStack Start

- **Routing**: File-based routes in `src/app/routes/`
- **Server Actions**: `createServerFn()` for API endpoints
- **Loaders**: Route-level data fetching

### TanStack Form

- **useForm()**: Form state management
- **Validators**: Zod integration
- **Field components**: `form.Field`, `form.Subscribe`

### shadcn/ui

- Located in `src/components/ui/`
- Add new components: `pnpm dlx shadcn@latest add button`
- Based on Radix UI primitives

### yt-dlp

- Executed via Node.js `spawn()`
- Must be installed system-wide
- JSON output parsing in `downloader.service.ts`

## Code Quality Baseline

### Core Principles

**1. Single Responsibility Principle (SRP)**
Each function, class, and module has exactly ONE reason to change.

```typescript
// ✅ GOOD - Single responsibility
// src/server/actions/downloader.actions.ts
export const getVideoMetadataAction = createServerFn({ method: "POST" })
  .inputValidator(z.object({ url: z.string() }))
  .handler(async ({ data }) => {
    return await getVideoMetadata(data.url);
  });

// ❌ BAD - Multiple responsibilities (validation + logic + formatting)
export const getVideoMetadataAction = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const result = await runYtDlp(["--dump-json", data.url]);
  const metadata = parseYtDlpJson(result);
  return { success: true, data: metadata, error: null };
});
```

**2. Don't Repeat Yourself (DRY)**
Zero tolerance for code duplication. Extract repeated logic immediately.

```typescript
// ✅ GOOD - Extracted to service
const formatSelection = createFormatSelection(videoFormatId, audioFormatId);
const args = buildDownloadArgs(formatSelection, outputPath, url);

// ❌ BAD - Duplicated across multiple actions
const formatSelection = [data.videoFormatId, data.audioFormatId]
  .filter(Boolean)
  .join("+");
// Same logic repeated in 3 different functions
```

**3. Separation of Concerns**
Clear layer boundaries with minimal cross-layer dependencies:

- **Actions (controllers)**: Validate input, call services, format response (< 20 lines)
- **Services (business logic)**: Orchestrate domain operations, handle domain errors
- **Utils**: Pure functions, no side effects, reusable
- **Config**: All constants and configuration values

**4. Type Safety**

- **No `any` types**: Use `unknown` for truly unknown types, then type-guard
- **No type assertions**: Avoid `as` operator; use type guards and proper type definitions
- **Explicit interfaces**: Define all function parameters and return types
- **Discriminated unions**: Use for complex state (e.g., `StreamProgress | StreamError`)

### Quality Metrics

| Metric              | Target      | Maximum        | How to Measure                                        |
| ------------------- | ----------- | -------------- | ----------------------------------------------------- |
| Code duplication    | 0%          | 5%             | `grep` for patterns, refactor when > 2 occurrences    |
| Function complexity | < 5         | < 10           | Cyclomatic complexity (branches + loops + conditions) |
| Function length     | < 30 lines  | < 50 lines     | Lines of code                                         |
| File size           | < 200 lines | < 300 lines    | Lines of code                                         |
| Nesting depth       | < 3         | < 4 levels     | Indentation levels                                    |
| Parameters          | < 4         | < 6 parameters | Function parameter count                              |
| Test coverage       | 80%         | -              | `pnpm test -- --coverage`                             |

### Server-Side Patterns

**Actions Must Be Thin Controllers**

```typescript
// ✅ GOOD - Action delegates to services
export const downloadVideoAction = createServerFn({ method: "POST" })
  .inputValidator(downloadRequestValidator)
  .handler(async ({ data }) => {
    logger.info("Starting download...");
    return await executeDownload(data);
  });

// ❌ BAD - Action contains business logic
export const downloadVideoAction = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    const storagePath = path.resolve("storage");
    await fs.mkdir(storagePath, { recursive: true });
    const formatSelection = [data.videoFormatId, data.audioFormatId]
      .filter(Boolean)
      .join("+");
    // ... 20+ more lines of logic
  }
);
```

**Centralize Error Handling**

```typescript
// ✅ GOOD - Centralized error handlers
// src/server/utils/download-errors.utils.ts
export function handleDownloadError(error: unknown): ServerResponse<never> {
  if (isRateLimitError(error)) {
    return { success: false, data: null, error: "Rate limit hit" };
  }
  if (isAbortError(error)) {
    return { success: false, data: null, error: "Download cancelled" };
  }
  return handleServerError(error);
}

// ❌ BAD - Scattered error handling
try {
  await runYtDlp(args);
} catch (error) {
  if (error.message.includes("429")) {
    return { success: false, data: null, error: "Rate limit" };
  }
  if (error.name === "AbortError") {
    return { success: false, data: null, error: "Cancelled" };
  }
  return { success: false, data: null, error: error.message };
}
```

**No Hardcoded Values**

```typescript
// ✅ GOOD - Configuration file
// src/shared/config/app.config.ts
export const APP_CONFIG = {
  STORAGE_PATH: process.env.STORAGE_PATH ?? "storage",
  YTDLP_COMMAND: process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp",
  MAX_RETRIES: 3,
  RATE_LIMIT_ERROR: "429",
} as const;

// ❌ BAD - Hardcoded values scattered everywhere
const storagePath = path.resolve("storage");
const command = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
if (message.includes("429")) {
}
```

**Structured Logging**

```typescript
// ✅ GOOD - Structured logger
// src/server/utils/logger.utils.ts
export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: "info", msg, ...meta }));
  },
  error: (msg: string, err?: unknown, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: "error", msg, error: err, ...meta }));
  },
};

// ❌ BAD - Direct console calls with inconsistent format
console.log(`[Terminal] 🚀 Fetching video metadata...`);
console.log(`✅ Success: ${version}`);
console.error("Could not create storage directory", err);
```

### Anti-Patterns to Avoid

**1. Business Logic in Server Actions**

- ❌ Building CLI arguments in actions
- ❌ Parsing JSON responses in actions
- ❌ File operations in actions
- ✅ Delegate to services: `service.executeDownload()`

**2. Code Duplication**

- ❌ Same logic in 2+ functions
- ❌ Similar functions with minor differences
- ✅ Extract to utility: `createFormatSelection()`

**3. Type Assertions**

- ❌ `as Error`, `as string`, `as any`
- ✅ Type guards: `error instanceof Error`
- ✅ Proper type definitions: custom error classes

**4. Mixed Concerns**

- ❌ Services calling other services directly (layer violation)
- ❌ Utils performing side effects
- ✅ Clear boundaries: actions → services → utils

**5. Missing Error Boundaries**

- ❌ Try-catch in every function
- ❌ Silent error swallowing
- ✅ Centralized error handling, explicit error types

**6. Inconsistent Return Types**

- ❌ Sometimes returning `T`, sometimes `T | null`
- ❌ Mixed error handling patterns
- ✅ Always return `ServerResponse<T>` from actions

### Code Review Checklist

Before committing code, verify:

**Structure**

- [ ] No code duplication (grep for patterns)
- [ ] Functions < 50 lines
- [ ] Files < 300 lines
- [ ] Clear separation of concerns

**Server Actions**

- [ ] Action is thin (< 20 lines)
- [ ] Only validates + delegates
- [ ] Returns `ServerResponse<T>`
- [ ] Uses centralized error handler

**Services**

- [ ] Business logic (not file I/O)
- [ ] Reusable across actions
- [ ] No hardcoded values
- [ ] Proper error types

**Type Safety**

- [ ] No `any` types
- [ ] No type assertions (`as`)
- [ ] All interfaces exported
- [ ] Proper error types (Error classes)

**Error Handling**

- [ ] Centralized error handlers
- [ ] No silent errors
- [ ] User-friendly error messages
- [ ] No console.log in production code

**Logging**

- [ ] Structured logger used
- [ ] No direct console.log/error
- [ ] Appropriate log levels
- [ ] Context included (request ID, user ID, etc.)

### Linting & Formatting

**Tool**: Biome
**Config**: `biome.json`
**Auto-fix**: `pnpm format` or `npx biome check --write`

Run before committing:

```bash
pnpm lint      # Check for issues
pnpm format    # Auto-fix issues
npx tsc --noEmit  # Type check
```

## Testing (Future)

Test structure when added:

```
src/features/downloader/__tests__/
├── components/
│   └── MetadataDisplay.test.tsx
├── hooks/
│   └── useMetadataManager.test.ts
└── services/
    └── downloader.service.test.ts
```

## Deployment

### Build

```bash
pnpm build
```

Output: `.output/` directory

### Preview

```bash
pnpm preview
```

### Production Server

```bash
node .output/server/index.mjs
```

## Gotchas & Common Mistakes

### 1. Import Order

Biome enforces specific import order:

1. React imports
2. Third-party imports (alphabetical)
3. Local imports (absolute paths first, alphabetical)
4. Type imports after value imports

### 2. Server Action Usage

- Must use `.data` wrapper: `action({ data: { ... } })`
- Server actions run on server, not client
- Can't import client-only code in server actions

### 3. Type Imports

- Use `import type { }` for type-only imports
- Avoid importing types in runtime code if possible

### 4. File Extensions

- Use `.ts` for non-JSX files
- Use `.tsx` for JSX files
- Even hooks (`.ts`) not (`.tsx`) unless they return JSX

### 5. Route Files

- Routes must be in `src/app/routes/`
- Route files use `createFileRoute()`
- Export `Route` constant

## Quick Reference

### Useful Commands

```bash
pnpm dev              # Start dev server on port 3000
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm lint             # Run linter
pnpm format           # Format code
pnpm check            # Run all checks
pnpm test             # Run tests
npx tsc --noEmit      # TypeScript check only
```

### File Patterns

- **Component**: `PascalCase.tsx`
- **Hook**: `useCamelCase.ts`
- **Service**: `camelCase.service.ts`
- **Type**: `PascalCase.types.ts`
- **Validator**: `camelCase.validator.ts`

### Directory Patterns

- **Atomic components**: `components/ui/`
- **Feature components**: `components/`
- **Server code**: `server/`
- **Shared code**: `shared/`
- **Routes**: `src/routes/`

## Contact & Resources

- **TanStack Docs**: https://tanstack.com
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **Zod**: https://zod.dev
- **Biome**: https://biomejs.dev
