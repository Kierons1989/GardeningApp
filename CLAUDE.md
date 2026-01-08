# Project: Garden Brain

## Project Overview

Garden Brain is a UK-focused personal garden companion web app that knows your plants and tells you what to do and when, powered by AI. Users can add plants, receive AI-generated care profiles with seasonal UK-specific tasks, track task completion, and chat with AI about their specific plants.

## Tech Stack

- **Language**: TypeScript
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database/Backend**: Supabase (Auth + PostgreSQL)
- **AI**: Anthropic Claude API
- **Animations**: Framer Motion

## Code Style & Conventions

- Use 2-space indentation
- Prefer named exports over default exports
- Follow existing patterns in the codebase
- Use path aliases (`@/` maps to project root)

## Architecture Notes

The app uses Next.js App Router with route groups for authentication `(auth)` and dashboard `(dashboard)`. Server components are used for data fetching, with client components for interactivity. AI calls are made through API routes to keep keys server-side.

## Important Directories

- `app/(auth)/` - Authentication pages (login, signup)
- `app/(dashboard)/` - Main app pages (dashboard, plants, plant details)
- `app/api/ai/` - AI API routes (generate-profile, chat)
- `components/ui/` - Reusable UI primitives
- `components/plants/` - Plant-specific components
- `components/tasks/` - Task-related components
- `components/chat/` - AI chat components
- `lib/ai/` - AI provider abstraction and prompts
- `lib/supabase/` - Supabase client setup
- `lib/tasks/` - Task generation engine
- `types/` - TypeScript type definitions

## Commands

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

---

# Claude Behavior Guidelines

<frontend_skill_requirement>
IMPORTANT: When making ANY frontend changes (components, pages, styling, layouts, animations), you MUST invoke the `frontend-design` skill at the start of the task using the Skill tool. This ensures consistent, high-quality design across the project. Do not skip this step - invoke the skill before writing any frontend code.
</frontend_skill_requirement>

<frontend_aesthetics>
Focus on creating distinctive, non-generic frontends:

- Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial, Inter, Roboto, and system fonts.
- Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid palettes.
- Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions or Framer Motion. Focus on high-impact moments like page loads with staggered reveals.
- Backgrounds: Create atmosphere and depth rather than solid colors. Layer CSS gradients or use subtle patterns.

Avoid generic AI aesthetics: overused fonts (Inter, Roboto), clichéd color schemes (purple gradients on white), and cookie-cutter layouts.
</frontend_aesthetics>

<code_exploration>
ALWAYS read and understand relevant files before proposing code edits. Do not speculate about code you have not inspected. Thoroughly review the style, conventions, and abstractions of the codebase before implementing new features.
</code_exploration>

<avoid_overengineering>
Avoid over-engineering. Only make changes that are directly requested or clearly necessary. Keep solutions simple and focused. Don't add error handling for scenarios that can't happen. Reuse existing abstractions where possible.
</avoid_overengineering>

<quality_and_testing>
Write high-quality, general-purpose solutions. Do not hard-code values. When completed with a task, run `npm run lint` and `npm run build` to verify code is correct.
</quality_and_testing>
