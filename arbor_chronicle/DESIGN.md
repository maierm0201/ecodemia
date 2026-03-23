# Design System Strategy: High-End Environmental Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Living Archive"**

This design system moves away from the frantic, ad-cluttered aesthetic of traditional news sites. Instead, it adopts the persona of a prestigious, permanent record. The goal is to evoke the tactile quality of a high-end print journal combined with the fluid responsiveness of modern digital craft. 

We break the "template" look through **Intentional Asymmetry**. Rather than perfectly centered grids, we utilize the "Leaning Margin" technique—where headlines may be offset from the body copy to create a sophisticated, curated feel. This system relies on breathing room (whitespace) not just as a gap between elements, but as a functional tool to signify the gravity and importance of environmental reporting.

---

## 2. Colors: The Tonal Landscape
Our palette is rooted in the organic. We use deep, "ink-stained" greens and warm, paper-like off-whites to establish immediate credibility.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. Traditional borders create visual noise that breaks the "Living Archive" feel. Boundaries must be defined solely through background color shifts. 
*   *Example:* A featured article block using `surface-container-low` (#f3f4f0) sitting atop a `background` (#f9faf6) provides all the separation required.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, recycled paper. 
*   **Base Layer:** `surface` (#f9faf6).
*   **Secondary Context:** Use `surface-container-low` (#f3f4f0) for sidebar modules.
*   **Emphasis/Highlight:** Use `surface-container-high` (#e7e9e5) for "Breaking News" or callouts.
Each inner container should use a slightly higher or lower tier to define its importance, creating a "nested" depth that feels architectural rather than flat.

### The "Glass & Gradient" Rule
To add a "signature" polish, floating navigation bars or overlay cards must use **Glassmorphism**. Apply a backdrop-blur (12px–20px) to `surface` at 85% opacity. For primary CTAs (like "Subscribe"), avoid flat fills; instead, use a subtle linear gradient from `primary` (#012d1d) to `primary-container` (#1b4332) at a 135-degree angle to give the button a "jewel-like" depth.

---

## 3. Typography: The Authoritative Voice
The tension between the traditional serif and the modern sans-serif creates a bridge between heritage and progress.

*   **Display & Headline (Newsreader):** This is our "Editorial Authority." Use `display-lg` (3.5rem) for long-form hero titles. The tighter tracking and elegant serifs command attention and slow the reader down, encouraging deep reading.
*   **Body (Inter):** Our "Functional Engine." Set at `body-lg` (1rem) for articles to ensure maximum legibility. The neutral, high-x-height of Inter prevents the serif headlines from feeling "stuffy."
*   **Labels (Public Sans):** Used for metadata (dates, categories). We use `label-md` in all-caps with increased letter-spacing (0.05rem) to provide a modern, technical contrast to the flow of the serif headlines.

---

## 4. Elevation & Depth
In "The Living Archive," we do not use heavy shadows. We use **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f3f4f0) section. This creates a soft, natural lift mimicking the way light hits physical paper.
*   **Ambient Shadows:** If a floating element (like a modal) is required, use an "Atmospheric Shadow": `0px 20px 40px rgba(26, 28, 26, 0.06)`. The shadow color is a tinted version of `on-surface`, ensuring it looks like a natural occlusion of light rather than a gray smudge.
*   **The Ghost Border Fallback:** If a border is functionally necessary for accessibility, use the `outline-variant` (#c1c8c2) at **20% opacity**. Never use 100% opaque borders.

---

## 5. Components: Editorial Primitives

### Cards & Article Previews
*   **Forbid Dividers:** Do not use lines to separate articles in a list. Instead, use a `spacing-8` (2.75rem) vertical gap or alternating `surface` and `surface-container-lowest` backgrounds.
*   **Image Handling:** Apply `rounded-md` (0.375rem) to all media. Environmental photography is our primary visual asset; ensure it is never "boxed in" by heavy frames.

### Buttons
*   **Primary:** Gradient of `primary` to `primary-container`. `rounded-full` for a modern, approachable feel.
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Tertiary:** Text-only using `primary` color. Use a 2px underline that only appears on hover for a sophisticated "link" interaction.

### Input Fields
*   **Style:** Minimalist. No background fill. Only a bottom border using `outline` (#717973) at 40% opacity. Upon focus, the border animates to 100% `primary`.

### Specialized Editorial Components
*   **The "Data Pull-out":** A custom component for environmental statistics. Use a `tertiary-container` background with `on-tertiary-container` text, utilizing `display-sm` for the "big number."
*   **The "Carbon Marker":** A specialized chip using `secondary-container` (#cfe5d9) to tag stories by their environmental impact or topic.

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetric Margins:** Push the main body text 1/12th to the right of the headline to create a "curated" look.
*   **Embrace Whitespace:** If a section feels crowded, double the spacing using the `spacing-16` (5.5rem) or `spacing-20` (7rem) tokens.
*   **Image Dominance:** Allow high-quality environmental photography to bleed to the edges of the container.

### Don't:
*   **No Pure Black:** Never use #000000. Use `on-surface` (#1a1c1a) for all text to maintain the "ink on paper" softness.
*   **No Sharp Corners:** Avoid `rounded-none`. Even a subtle `rounded-sm` (0.125rem) makes the interface feel more organic and less "digital."
*   **No Standard Grids:** Avoid a 12-column grid where every element is the same width. Vary the widths of content blocks to create a rhythmic, magazine-like flow.