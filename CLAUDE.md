# Project: Gardening App

## Project Overview

Gardening App (branding to be decided) is a UK-focused personal garden companion web app that knows your plants and tells you what to do and when, powered by AI. Users can add plants, receive AI-generated care profiles with seasonal UK-specific tasks, track task completion, and chat with AI about their specific plants.


## Tech Stack

- **Language**: -
- **Framework**: -
- **Styling**: -
- **Database/Backend**: -
- **Routing**: -
- **State/Data**: -
- **Forms**: -
- **Animations**: -

## Code Style & Conventions

- Use 2-space indentation
- Prefer named exports over default exports
- Follow existing patterns in the codebase
- Use path aliases (`@/` maps to `src/`)
- Ensure that you componentise the code so it is easier to make edits and updates
- Always create a hidden page in the UI

## Architecture Notes




## Important Files

-

## Commands

-

# Design System Page Generator

When starting work on this project, if no design system page exists at `/design-system`, create one by analyzing the existing codebase.

<design_system_generation>
Scan the codebase for design tokens and create a hidden page that visually displays the complete design system. This page is for reference purposes (by designers and AI assistants) and should not appear in site navigation.

### What to extract and display:

**Colors**
- Scan CSS/SCSS files for color variables, custom properties, or repeated color values
- Display as labeled swatches with hex/rgb values
- Group by purpose: primary, secondary, accent, neutrals, semantic (success, warning, error)

**Typography**
- Extract font families, weights, and sizes from stylesheets
- Render actual examples of each heading level (H1-H6) and body text
- Show font pairings as they appear in the site
- Include line-height and letter-spacing if defined

**Spacing**
- Extract spacing scale (margins, paddings, gaps)
- Display as visual blocks with pixel/rem values labeled

**Components**
- Find and render examples of:
  - Buttons (all variants and states)
  - Form inputs (text, select, checkbox, radio)
  - Cards or containers
  - Navigation elements
  - Any other recurring UI patterns

**Borders & Effects**
- Border radius values
- Shadow definitions
- Any gradients or overlays

### Output requirements:

1. Create a single self-contained HTML file at `/design-system/index.html` (or equivalent for the platform)
2. Page should be excluded from sitemap and navigation
3. Use minimal additional styling — let the design system styles speak for themselves
4. Label everything clearly with the variable names and values
5. Organize into logical sections with anchor links at the top

### Page structure:

```
Design System - [Project Name]
├── Table of contents (anchor links)
├── Colors
│   ├── Primary palette
│   ├── Neutrals
│   └── Semantic colors
├── Typography
│   ├── Font families
│   ├── Heading scale
│   └── Body text
├── Spacing scale
├── Components
│   ├── Buttons
│   ├── Forms
│   ├── Cards
│   └── [Other patterns found]
└── Effects
    ├── Shadows
    ├── Borders
    └── Transitions
```

After creating the page, inform me so I can take a screenshot for future visual reference.
</design_system_generation>


---

# Claude Behavior Guidelines

<do_not_act_before_instructions>
Do not jump into implementation or change files unless clearly instructed to make changes. When the user's intent is ambiguous, default to providing information, doing research, and providing recommendations rather than taking action. Only proceed with edits, modifications, or implementations when the user explicitly requests them.
</do_not_act_before_instructions>

<code_exploration>
ALWAYS read and understand relevant files before proposing code edits. Do not speculate about code you have not inspected. If the user references a specific file/path, you MUST open and inspect it before explaining or proposing fixes. Be rigorous and persistent in searching code for key facts. Thoroughly review the style, conventions, and abstractions of the codebase before implementing new features or abstractions.
</code_exploration>

<investigate_before_answering>
Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.
</investigate_before_answering>

<quality_and_testing>
Please write a high-quality, general-purpose solution using the standard tools available. Do not create helper scripts or workarounds to accomplish the task more efficiently. Implement a solution that works correctly for all valid inputs, not just the test cases. Do not hard-code values or create solutions that only work for specific test inputs. Instead, implement the actual logic that solves the problem generally.

Focus on understanding the problem requirements and implementing the correct algorithm. Tests are there to verify correctness, not to define the solution. Provide a principled implementation that follows best practices and software design principles.

VERY IMPORTANT: When you have completed a task, you MUST run the lint and typecheck commands if they were provided to ensure your code is correct.
</quality_and_testing>

<avoid_overengineering>
Avoid over-engineering. Only make changes that are directly requested or clearly necessary. Keep solutions simple and focused.

Don't add features, refactor code, or make "improvements" beyond what was asked. A bug fix doesn't need surrounding code cleaned up. A simple feature doesn't need extra configurability.

Don't add error handling, fallbacks, or validation for scenarios that can't happen. Trust internal code and framework guarantees. Only validate at system boundaries (user input, external APIs).

Don't create helpers, utilities, or abstractions for one-time operations. Don't design for hypothetical future requirements. The right amount of complexity is the minimum needed for the current task. Reuse existing abstractions where possible and follow the DRY principle.
</avoid_overengineering>

<use_parallel_tool_calls>
If you intend to call multiple tools and there are no dependencies between the tool calls, make all of the independent calls in parallel. Prioritize calling tools simultaneously whenever the actions can be done in parallel rather than sequentially. For example, when reading 3 files, run 3 tool calls in parallel to read all 3 files into context at the same time. Maximize use of parallel tool calls where possible to increase speed and efficiency. However, if some tool calls depend on previous calls to inform dependent values like the parameters, do NOT call these tools in parallel and instead call them sequentially. Never use placeholders or guess missing parameters in tool calls.
</use_parallel_tool_calls>

<file_cleanup>
If you create any temporary new files, scripts, or helper files for iteration, clean up these files by removing them at the end of the task.
</file_cleanup>

<frontend_skill_requirement>
IMPORTANT: When making ANY frontend changes (components, pages, styling, layouts, animations), you MUST invoke the `frontend-design` skill at the start of the task using the Skill tool. This ensures consistent, high-quality design across the project. Do not skip this step - invoke the skill before writing any frontend code.
</frontend_skill_requirement>

<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight.

Focus on:
- Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.
- Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.
- Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.
- Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
</frontend_aesthetics>

<avoid_excessive_markdown_and_bullet_points>
When writing reports, documents, technical explanations, analyses, or any long-form content, write in clear, flowing prose using complete paragraphs and sentences. Use standard paragraph breaks for organization and reserve markdown primarily for `inline code`, code blocks, and simple headings (##, ###). Avoid using **bold** and *italics* excessively.

DO NOT use ordered lists (1. ...) or unordered lists (*) unless: a) you're presenting truly discrete items where a list format is the best option, or b) the user explicitly requests a list or ranking.

Instead of listing items with bullets or numbers, incorporate them naturally into sentences.
</avoid_excessive_markdown_and_bullet_points>
