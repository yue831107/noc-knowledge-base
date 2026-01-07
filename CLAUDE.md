# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NoC (Network on Chip) 知識庫 - A VitePress-based documentation site for learning Network on Chip concepts, based on "On-Chip Networks Second Edition" by Jerger, Krishna, and Peh.

**Live site**: https://yue831107.github.io/noc-knowledge-base/

## Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

```
docs/
├── .vitepress/
│   └── config.ts          # VitePress configuration (sidebar, nav, theme)
├── 01-introduction/       # Chapter 1: Introduction
├── 02-system-architecture/# Chapter 2: System Architecture
├── 03-topology/           # Chapter 3: Topology
├── 04-routing/            # Chapter 4: Routing
├── 05-flow-control/       # Chapter 5: Flow Control
├── 06-router-microarchitecture/ # Chapter 6: Router Microarchitecture
├── 07-modeling-evaluation/# Chapter 7: Modeling & Evaluation
├── 08-case-studies/       # Chapter 8: Case Studies
├── 09-conclusions/        # Chapter 9: Conclusions
├── appendix/              # Formulas, tools
├── public/images/         # Static images (ch01-ch09 subdirs, gif animations)
├── glossary.md            # Terminology glossary with cross-links
├── references.md          # Bibliography
└── index.md               # Homepage
```

## Content Guidelines

- **Language**: Traditional Chinese (Taiwan) with English technical terms preserved
- **Images**: Use actual book figures from `/public/images/chXX/`, no ASCII art
- **Math**: LaTeX supported via `markdown-it-mathjax3` (use `$$` for block, `$` for inline)
- **Cross-links**: Link between chapters and glossary terms using relative paths

## Deployment

Automatic via GitHub Actions on push to `main`. The workflow builds VitePress and deploys to GitHub Pages.

**Important**: `base: '/noc-knowledge-base/'` is set in config.ts for GitHub Pages subdirectory hosting.
