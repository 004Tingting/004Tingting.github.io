---
title: "In the Beginning: Why a Personal Journal"
date: "2026-10-06"
tags: [essay, meta]
summary: Three decisions behind this site — bilingual, editorial layout, and static hosting — plus what to expect.
draft: false
---

It's 2026. Why build a personal website at all?

Social platforms handle distribution — but the layout belongs to the platform, the algorithm belongs to the platform, and so does the account. A site of your own is one of the few places that is entirely yours: **what gets written, how it is set, and how long it stays.**

## Three Decisions

### Bilingual

Chinese is where I write fastest; English is the lingua franca of my field. I chose both over either — a bilingual frame with per-post flexibility: important pieces go out in both languages, quick notes start in Chinese. Perfect symmetry isn't the goal; shipping is.

### Editorial Layout

This site reads less like a blog and more like a journal: serif headlines, a paper-toned background, one vermillion accent running through the page. No thumbnails, no card shadows — hierarchy comes from type scale, whitespace, and hairline rules. The text is the protagonist; the typesetting is the design.

### Static

The whole site compiles down to plain HTML via Next.js, hosted on GitHub Pages:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
```

No database, no server bill, and the build output deploys anywhere static hosting exists.

## Five Sections

The site is organised into five sections: **Research** (derivations, methods, retrospectives), **Works** (things actually made), **Arts** (what I'm listening to, playing, watching), **Chronicles** (time slices and essays), and **About**. The split follows *nature* rather than *subject* — the same project appears in Research when I write up its derivation, and in Works when the finished thing is shown.

- **Research** — control theory and fault diagnosis: derivations, reading notes
- **Works** — software, projects and experiments you can open and run
- **Arts** — music, games and screen, plus the data they leave behind
- **Chronicles** — journal notes, retrospectives and essays

This is where it begins. Come back often.
