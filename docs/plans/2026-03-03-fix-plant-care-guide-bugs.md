# Fix Plant Addition & Care Guide Generation Bugs

## Problem

Plant addition and care guide generation have been unreliable. Several bugs cause silent failures or unnecessary API calls.

## Fixes

### 1. Handle `stop_reason: 'max_tokens'` truncation in `generateCareProfile`

File: `lib/ai/anthropic.ts`, `generateCareProfile` method.

After the initial API call, check `response.stop_reason`. If it's `'max_tokens'`, the JSON is truncated. Send the partial response back as an assistant message with a user message asking to continue from where it left off. Concatenate the text pieces, then extract JSON from the combined text. Limit to 2 continuation attempts to avoid infinite loops.

### 2. Reuse cached type profiles when plantState is default

File: `app/api/ai/generate-type-profile/route.ts`.

The cache check currently requires `!plantState` to return early. Since the frontend always sends plantState, the cache is never hit. Change the logic: if the existing type has a care profile, reuse it regardless of plantState. The type-level profile describes how to care for the plant type in general. Per-plant personalization based on state can happen via the existing `PATCH /api/plants/[id]/state` endpoint later.

### 3. Add `maxDuration` to identify-plant route

File: `app/api/ai/identify-plant/route.ts`.

Add `export const maxDuration = 120` to match the search route's timeout.

### 4. Surface real error messages in custom plant entry

File: `app/(dashboard)/plants/new/page.tsx`, `handleCustomEntry` function.

Read the error response body and include its message in the error shown to the user, rather than always showing "Failed to identify plant. Please try again."

### 5. Guard against null plantTypeId

File: `app/(dashboard)/plants/new/page.tsx`, `handleConfirmAndGenerate` function.

After destructuring `typeData`, check that `plantTypeId` is actually set. If the upsert returned no data, throw a meaningful error rather than silently creating a plant with no linked type.
