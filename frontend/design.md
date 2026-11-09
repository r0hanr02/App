# Website Theme System — Color Specification

## Objective

Update the website's existing theme system to use the following three-color palette:

- **Cream:** `#F3EEE3`
- **Black:** `#111111`
- **Orange:** `#D9541E`

The website must support both **Light Mode** and **Dark Mode**.

The theme should be implemented using semantic CSS variables so that components do not directly depend on the raw hex values.

---

## 1. Color Palette

### Base Colors

```scss
$cream: #F3EEE3;
$black: #111111;
$orange: #D9541E;
```

These are the only primary colors for the visual system.

Do not introduce unrelated primary colors unless required for accessibility states or system feedback such as success, warning, or error.

---

# 2. Light Mode

Light mode should use:

- Background → Cream
- Primary text → Black
- Accent → Orange

```scss
:root {
  --background: #F3EEE3;
  --foreground: #111111;

  --primary: #111111;
  --primary-foreground: #F3EEE3;

  --accent: #D9541E;
  --accent-foreground: #F3EEE3;

  --surface: #F3EEE3;
  --surface-foreground: #111111;

  --border: #111111;
  --muted: #111111;
  --muted-foreground: #111111;
}
```

The overall visual appearance should feel warm, minimal, editorial, and modern.

---

# 3. Dark Mode

Dark mode must **swap the cream and black roles**.

Therefore:

- Background → Black
- Primary text → Cream
- Accent → Orange

```scss
[data-theme="dark"] {
  --background: #111111;
  --foreground: #F3EEE3;

  --primary: #F3EEE3;
  --primary-foreground: #111111;

  --accent: #D9541E;
  --accent-foreground: #F3EEE3;

  --surface: #111111;
  --surface-foreground: #F3EEE3;

  --border: #F3EEE3;
  --muted: #F3EEE3;
  --muted-foreground: #F3EEE3;
}
```

The orange `#D9541E` should remain the accent color in both themes.

---

# 4. Important Theme Rule

The cream and black colors should change **roles**, not merely become lighter/darker versions of each other.

### Light

```text
Background: #F3EEE3
Text:       #111111
Accent:     #D9541E
```

### Dark

```text
Background: #111111
Text:       #F3EEE3
Accent:     #D9541E
```

Do not create a completely separate color palette for dark mode.

---

# 5. Semantic CSS Variables

All components should consume semantic variables instead of raw colors.

### Correct

```scss
.card {
  background: var(--surface);
  color: var(--surface-foreground);
  border: 1px solid var(--border);
}
```

### Avoid

```scss
.card {
  background: #F3EEE3;
  color: #111111;
}
```

This ensures the entire application automatically responds to theme changes.

---

# 6. Typography

Use the existing typography system.

Do not introduce a new font system unless necessary.

Text hierarchy should primarily be created through:

- Font size
- Font weight
- Line height
- Letter spacing
- Contrast

Avoid introducing many additional colors just to create hierarchy.

---

# 7. Buttons

### Primary Button

Use the orange accent as the primary CTA.

```scss
background: var(--accent);
color: var(--accent-foreground);
```

Example visual intent:

```text
┌──────────────────────┐
│      Get Started     │
└──────────────────────┘
```

Orange should be visually prominent but not dominate the entire interface.

### Secondary Button

Use the theme's primary/background colors.

For example:

```scss
background: transparent;
color: var(--foreground);
border: 1px solid var(--border);
```

### Hover

Use subtle changes in opacity, contrast, or surface treatment rather than introducing a new unrelated color.

---

# 8. Cards / Surfaces

Cards should remain within the same three-color system.

Light mode:

```text
Page background → Cream
Card → Cream
Text → Black
Accent → Orange
```

Dark mode:

```text
Page background → Black
Card → Black
Text → Cream
Accent → Orange
```

If additional separation between cards is required, use borders, shadows, spacing, or subtle opacity rather than introducing another major color.

---

# 9. Borders

Borders should use the opposite primary color where appropriate.

Light mode:

```scss
--border: #111111;
```

Dark mode:

```scss
--border: #F3EEE3;
```

Borders should generally be subtle rather than visually heavy.

Prefer:

```scss
border: 1px solid color-mix(
  in srgb,
  var(--border) 20%,
  transparent
);
```

if browser support and the existing project setup allow it.

Otherwise use an appropriate opacity value.

---

# 10. Theme Toggle

Implement the existing theme toggle using the project's current theme architecture.

The toggle must switch between:

```text
Light
  ↓
Cream background
Black text
Orange accent

Dark
  ↓
Black background
Cream text
Orange accent
```

Do not duplicate component styles for each theme.

The theme should be controlled centrally through the existing theme provider / root attribute / class system.

---

# 11. Existing Theme Files

Before modifying the implementation:

1. Inspect the existing theme files.
2. Inspect `themes.scss`.
3. Inspect global CSS/SCSS variables.
4. Inspect typography variables.
5. Inspect components that currently use hard-coded colors.
6. Identify the existing light/dark mode mechanism.
7. Preserve the current architecture where possible.

Do not replace the existing theme architecture unnecessarily.

Refactor it to use the new semantic color system.

---

# 12. Replace Hard-Coded Colors

Search the project for existing hard-coded colors such as:

```text
#fff
#ffffff
#000
#000000
rgb(...)
rgba(...)
other background colors
other primary colors
```

Replace them with semantic theme variables where they represent UI colors.

Do not blindly replace colors used for:

- Images
- SVG illustrations
- Third-party libraries
- Data visualization
- Status indicators
- Brand assets

Only replace colors that belong to the website's theme system.

---

# 13. Accessibility

Maintain sufficient contrast between:

### Light Mode

```text
#111111 on #F3EEE3
```

### Dark Mode

```text
#F3EEE3 on #111111
```

Orange should primarily be used for:

- CTA buttons
- Links
- Active states
- Important highlights
- Selected states
- Small decorative accents

Do not use orange as the primary body-text color.

---

# 14. Design Direction

The visual language should be:

- Minimal
- Warm
- Modern
- Editorial
- High contrast
- Premium
- Clean
- Slightly bold

The orange should act as the visual signature of the website.

Use generous whitespace and strong typography instead of adding many UI colors.

The design should feel intentional rather than overly colorful.

---

# 15. Implementation Constraints

Do not:

- Introduce a new UI framework.
- Replace the existing styling architecture unnecessarily.
- Add Tailwind if the project currently uses SCSS.
- Create separate duplicated styles for light and dark components.
- Hard-code theme colors inside individual components.
- Add unnecessary colors.
- Change existing component behavior.
- Change business logic.
- Change routing.
- Change API behavior.

Only modify the theme/styling system and the affected UI styles.

---

# 16. Final Theme Tokens

The final system should conceptually expose these variables:

```scss
--background
--foreground

--surface
--surface-foreground

--primary
--primary-foreground

--accent
--accent-foreground

--border
--muted
--muted-foreground
```

With the following core mapping:

| Token | Light Mode | Dark Mode |
|---|---|---|
| Background | `#F3EEE3` | `#111111` |
| Foreground | `#111111` | `#F3EEE3` |
| Primary | `#111111` | `#F3EEE3` |
| Primary Foreground | `#F3EEE3` | `#111111` |
| Accent | `#D9541E` | `#D9541E` |
| Accent Foreground | `#F3EEE3` | `#F3EEE3` |
| Surface | `#F3EEE3` | `#111111` |
| Surface Foreground | `#111111` | `#F3EEE3` |
| Border | `#111111` | `#F3EEE3` |

---

# 17. Expected Result

After implementation, the entire website should visually follow this rule:

```text
LIGHT MODE

┌─────────────────────────────────┐
│                                 │
│  CREAM BACKGROUND               │
│                                 │
│  BLACK TEXT                     │
│                                 │
│  ORANGE ACCENTS / CTA           │
│                                 │
└─────────────────────────────────┘


DARK MODE

┌─────────────────────────────────┐
│                                 │
│  BLACK BACKGROUND               │
│                                 │
│  CREAM TEXT                     │
│                                 │
│  ORANGE ACCENTS / CTA           │
│                                 │
└─────────────────────────────────┘
```

Implement this as a **centralized, semantic theme system** so future components automatically inherit the correct colors without needing separate light/dark styling.