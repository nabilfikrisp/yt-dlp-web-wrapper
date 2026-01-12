# AGENTS.md

## Prompt Guard (Loop Prevention)

- **The Map is Open:** You MAY use `ls` to view directory structures.
- **The Content is Locked:** DO NOT use `ReadFile` or `SearchText` without explicit consent.
- **Consent Flow:** YYou may request to read multiple files at once if they are part of the same data flow (e.g., Schema + Route + Component), provided you justify the batch in one sentence.
- **No Deep Scans:** Do not run recursive searches or broad greps.
- **Dependency Guard:** NEVER suggest or run library installations. I handle all `npm` tasks.
- **Privacy:** NEVER attempt to access `.env` or sensitive configs.

## Interaction & Execution

- **Goal-Oriented:** Focus all logic and suggestions strictly on the specific task requested. Avoid unprompted structural changes or moving files.
- **Announce Before Write:** State the target path and a one-sentence summary of the change before triggering `WriteFile`.
- **Minimal Diffs:** Modify only the specific lines required for the fix. Do not rewrite existing logic or surrounding code unless necessary for the goal.
- **SSOT Priority:** Use central schemas as the absolute reference. **Maintain a clear, one-way data flow**; never duplicate definitions or create local state that bypasses the source of truth.
- **Native First:** Prioritize native Web APIs or existing Framework features over adding new third-party utility libraries (e.g., use native Array methods instead of lodash).
- **Loop Kill-Switch:** If no progress is made or the same error repeats for 3 turns, stop and ask for guidance.

## Tech Stack

- **Framework:** TanStack Start
- **State/Forms:** TanStack Form (and Zod)
- **UI:** shadcn/ui, Tailwind CSS
- **Machine Libs:** `yt-dlp`, `zenity` (Linux)
