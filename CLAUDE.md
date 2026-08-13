# ORD Overlay Visual Editor

## Project Overview

A web-based visual editor for ORD Overlay documents. Users can:

1. Load a target document (OpenAPI, EDMX, CSDL JSON, MCP, A2A) and an overlay
2. See visually which parts of the target will be patched (highlighted)
3. Preview the merge result as a diff
4. Edit overlay patches through a form UI (no hand-writing JSON required)
5. Validate overlays in real-time with inline error feedback

Tech stack: Next.js 15 (App Router), React 19, **TypeScript strict mode**, Tailwind CSS, shadcn/ui, Monaco Editor.
Backend: Next.js API routes using `@open-resource-discovery/overlay-tools` for merge/validate.

**All code MUST be TypeScript.** No `.js` files except config files that require it (next.config.js, postcss.config.js).

## TDD Workflow (MANDATORY)

Every feature follows this strict cycle. No exceptions.

```
1. RED:   Write a failing test that defines the expected behavior
2. GREEN: Write the MINIMUM code to make the test pass
3. REFACTOR: Clean up while keeping tests green
4. REVIEW: Run the review agent to check the implementation
```

### Detailed Steps:

1. **Write the test first** — Define what the code should do before writing any implementation.
   The test MUST fail initially (if it passes immediately, the test is wrong or the feature already exists).

2. **Verify the test fails** — Run `npm run test` and confirm the new test fails with the expected reason.
   If it fails for a different reason (import error, syntax), fix the test first.

3. **Write minimal implementation** — Only write enough code to make the failing test pass.
   Do NOT add extra features, edge cases, or "nice to haves" that aren't tested yet.

4. **Verify all tests pass** — Run `npm run check` (typecheck + lint + all tests).
   If anything fails, fix it before proceeding.

5. **Refactor if needed** — Clean up duplication, improve naming, extract helpers.
   Tests must stay green throughout refactoring.

6. **Review** — Run the review agent (see below). Address any issues before committing.

7. **Commit** — Only commit green + reviewed state. Update `progress.md`.

### TDD Rules:

- NEVER write implementation code without a failing test first
- NEVER skip the "verify test fails" step
- NEVER add untested functionality "while you're there"
- If you realize you need more tests: write them BEFORE fixing the code
- Test file lives next to the source file: `foo.ts` → `foo.test.ts`

## Review Agent (Subagent)

After completing each subtask (after TDD green + refactor), a **separate review subagent** MUST be spawned to independently verify the work before committing.

### How it works:

The development agent MUST use Claude Code's subagent capability (the `Agent` tool) to spawn an independent reviewer after each TDD cycle completes. The reviewer operates in a separate context and provides an unbiased assessment.

### Spawning the reviewer:

After tests pass, spawn a subagent with this pattern:

```
Agent({
  description: "Review subtask: <name>",
  prompt: `You are an independent code reviewer for the ORD Overlay Editor project.

Review the changes in the latest uncommitted work (run 'git diff' to see them).
Check against this checklist:

1. Does the code match the test? No extra behavior beyond what tests verify.
2. TypeScript strictness: No 'any', no '@ts-ignore', no type assertions unless justified.
3. Component size: Under 150 lines? If not, must be extracted.
4. No dead code: No commented-out code, unused imports, placeholder TODOs.
5. API contract: Does the response shape match what the frontend expects?
6. Error handling: Are errors returned as actionable messages?
7. Security: No user input in eval, dangerouslySetInnerHTML, or unsanitized commands.
8. Test quality: Tests assert behavior, not implementation details.

Run 'npm run check' to verify everything passes.

Report:
- PASS: if all items are good, say "REVIEW PASSED" and nothing else.
- FAIL: list each failing item with a one-line fix suggestion.
`
})
```

### Handling review results:

- **REVIEW PASSED** → Commit immediately, update `progress.md`
- **REVIEW FAILED** → Fix each issue, re-run `npm run check`, spawn reviewer again
- **Max review cycles: 3** — If still failing after 3 rounds, commit with a `// TODO: review-issue` comment and move on

### Review Checklist:

1. **Does the code match the test?** — No extra behavior beyond what tests verify
2. **TypeScript strictness** — No `any`, no `@ts-ignore`, no type assertions unless justified
3. **Component size** — Under 150 lines? If not, extract.
4. **No dead code** — No commented-out code, no unused imports, no placeholder TODOs
5. **API contract** — Does the response shape match what the frontend expects?
6. **Error handling** — Are errors returned as actionable messages, not generic "failed"?
7. **Security** — No user input passed to `eval`, `dangerouslySetInnerHTML`, or unsanitized shell commands
8. **Test quality** — Tests assert behavior, not implementation details? Would they survive a refactor?

## Quality Gates

After EVERY change:

```bash
npm run check
```

This runs (in order, fail-fast):

1. `npm run typecheck` - TypeScript strict mode, no errors
2. `npm run lint` - ESLint
3. `npm run test` - Vitest unit tests

Before EVERY commit:

```bash
npm run check && npm run build
```

Build MUST succeed. If it doesn't, fix it before committing.

## Development Rules

### Commit Discipline

- Commit after EVERY completed subtask (not after multiple changes)
- Only commit green + reviewed state
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`
- If a change breaks tests: fix immediately, do NOT proceed to next task

### Progress Tracking

- Maintain `progress.md` at project root
- Update it after every commit: mark completed items, note what's next
- This file is your memory across autocompact cycles - keep it accurate

### Rollback Protocol

- Before any risky refactor: commit current working state first
- If tests fail after a change and can't fix in 2 attempts: `git checkout -- .` and try a different approach
- Never accumulate multiple unverified changes

### Architecture Rules

- All overlay logic goes through `@open-resource-discovery/overlay-tools` - do NOT reimplement merge/validate
- API routes in `app/api/` - thin wrappers around overlay-tools
- Components in `components/` - one component per file
- **No `any` types.** Use the types from overlay-tools or define new ones in `types/`
- Keep components small (<150 lines). Extract when bigger.
- **All files `.ts` or `.tsx`** — no JavaScript

### Testing Strategy

- **TDD is mandatory** — test comes first, always
- Unit tests for: API route handlers, utility functions, data transformations
- Component tests for: form interactions, state management
- E2E tests (Playwright) for: full user flows (load file → see highlights → edit → preview)
- Test naming: `describe("ComponentName")` → `it("should do X when Y")`
- Tests must be independent — no shared mutable state between tests

### UI/UX Principles

- The editor must be usable without reading documentation
- Show, don't tell: visual highlighting > text explanation
- Provide example overlays that users can load with one click
- Error messages must be actionable ("selector 'operation' requires a value" not "validation failed")

## File Structure

```
app/
  layout.tsx            - Root layout with providers
  page.tsx              - Main editor page
  api/
    merge/route.ts      - POST: apply overlay to target, return merged + diff
    validate/route.ts   - POST: validate overlay, return errors
    examples/route.ts   - GET: list example overlays
components/
  editor/
    OverlayEditor.tsx   - Main editor orchestrator
    TargetViewer.tsx    - Shows target document with patch highlights
    PatchList.tsx       - List of patches with add/edit/remove
    PatchForm.tsx       - Form for editing a single patch (selector + action + data)
    SelectorPicker.tsx  - UI for choosing selector type and value
    MergePreview.tsx    - Side-by-side or unified diff of merge result
    JsonEditor.tsx      - Monaco-based JSON editor wrapper
  ui/                   - shadcn/ui components
types/
  index.ts             - Shared TypeScript types
lib/
  overlay-client.ts    - Frontend API client for calling backend routes
  diff.ts              - Diff computation utilities
  highlights.ts        - Logic for mapping selectors to document positions
public/
  examples/            - Example overlay + target file pairs
tests/
  unit/                - Vitest unit tests
  e2e/                 - Playwright E2E tests
```

## Key Dependencies

- `@open-resource-discovery/overlay-tools` - merge, validate, convert (backend only)
- `next` - Full-stack framework
- `monaco-editor` / `@monaco-editor/react` - Code editor
- `diff` - Text diffing for merge preview
- `tailwindcss` + `shadcn/ui` - Styling and components

## Examples Available

The overlay-tools repo has these examples to bundle:

- `openapi-astronomy-api.overlay.json` - OpenAPI with operation + jsonPath selectors
- `edmx-all-selectors.overlay.json` - All OData selector types
- `edmx-business-partner.overlay.json` - Simple EDMX enrichment
- `a2a-dispute-agent.overlay.json` - A2A agent card overlay
- `mcp-weather-server.overlay.json` - MCP server card overlay
- `csn-interop-airline.overlay.json` - CSN Interop overlay

## Drift Prevention

Every 5 commits, re-read this file and `progress.md`. Verify:

1. Are you still building toward the stated goals?
2. Is the UI actually usable (not just "working")?
3. Are tests keeping up with implementation (TDD means they should LEAD, not lag)?
