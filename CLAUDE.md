# Apache — Project Guide

This file guides Claude Code when working in this repository.

## What this is

A single-page **presentation / marketing website** for **Apache**, a project focused on
**secure, encrypted, fast, long-distance communication over LoRaWAN**.

The current showcase is a LoRaWAN Arduino device for wintersporters: when a phone has no
signal or battery, the device relays the wearer's location and an emergency status over
LoRaWAN so help can reach the right place faster. The site explains the concept, walks
through how the device works, and shows an animated simulation of the Arduino code path.

This is a **website that presents the project** — it is not the firmware or the LoRaWAN
stack itself. Keep work focused on the presentation experience unless asked otherwise.

## Tech stack

- **React 19** (function components + hooks, no class components)
- **Vite 7** as dev server and bundler (ESM, `"type": "module"`)
- **`@vitejs/plugin-react`** for JSX/Fast Refresh
- **Plain CSS** in a single file ([src/styles.css](src/styles.css)) using CSS custom
  properties — no Tailwind, CSS modules, or CSS-in-JS
- **Space Grotesk** variable font, self-hosted from [fonts/](fonts/)
- No router, no state library, no test framework, no TypeScript

## Commands

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server (default http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

There is no lint, format, or test script configured.

## Structure

```
index.html            # Vite entry; mounts #root, loads /src/main.jsx
src/
  main.jsx            # React root, imports styles.css
  App.jsx             # The entire site: header, hero, sections, code-demo
  styles.css          # All styling + design tokens in :root
biglogo.svg           # Brand logo (hero)
background.jpg        # Section background image
fonts/                # Space Grotesk variable font
vite.config.js        # Vite + React plugin
```

The whole UI lives in [src/App.jsx](src/App.jsx). Content is driven by data arrays at the
top of the file:

- `navItems` — header navigation links (anchor targets)
- `workSteps` — the "Hoe werkt Apache?" numbered steps
- `codeFrames` — the animated Arduino code demo (label, status, telemetry, code lines)

To add/change content, edit these arrays rather than hardcoding markup. The code demo
auto-advances every 1700ms and can be paused/stepped via the timeline controls.

## Conventions

- **Language:** UI copy is in **Dutch**. Match the existing tone (clear, calm, not hypey).
  Code identifiers, comments, and commit messages are in English.
- **Styling:** use the existing CSS custom properties in `:root`
  ([src/styles.css](src/styles.css)) — colors (`--muted-olive`, `--olive-dark`,
  `--soft-linen`, `--graphite`, …), shadows, and the `.text-box` surface pattern. Don't
  introduce raw hex values when a token exists.
- **Accessibility:** the markup leans on semantic landmarks, `aria-label`/`aria-labelledby`,
  and `aria-hidden` for decorative images. Preserve this — every interactive control needs
  an accessible name, decorative imagery stays hidden from assistive tech.
- **Class naming:** descriptive, hyphenated class names (`.site-header`, `.code-window`,
  `.device-panel`). Follow the same style.
- **No emojis** in code, copy, or files.

## Design direction

This is a design-led presentation site. The look is grounded and editorial — an olive /
linen / graphite palette, generous whitespace, Space Grotesk, no gradients or floating
decoration. When making visual changes:

- Communicate, don't decorate. Every element earns its place; whitespace and typography
  create hierarchy, not borders, dividers, or background shapes.
- No AI gradients (purple→blue, etc.), no neon palettes, no oversized generic hero copy,
  no scale/glow hover effects. Hover states stay subtle (150–300ms, `ease-out`).
- Don't center all text; body text stays left-aligned and readable (~65–75ch max width).
- Let content drive layout — vary the rhythm instead of stacking identical card grids.
- Verify visually in the browser, mobile-first, before considering visual work done.

## Working agreement

- Read the relevant code before changing it; keep edits consistent with what's there.
- Don't add dependencies, build tooling, or frameworks without asking — the stack is
  deliberately minimal.
- When copy or branding is ambiguous, surface it rather than guessing.
