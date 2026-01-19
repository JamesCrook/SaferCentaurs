# README.md

This repo contains code developed at [Safer Centaurs](https://www.safercentaurs.com), where I blog about the AI-assisted development process.

* In the blog posts I am showing how to leverage AI to do more. This is part of democratising the AI tools.
* The actual code produced in the course of the blog posts is here, a gradually developing visual toolkit, with examples.

## Repository Structure
```
├── js/               # Core graphics library - unified approach to diagrams, graphs, infographics
│   ├── renderers/    # Pluggable output systems
│   ├── widgets/      # Reusable UI components 
│   ├── parsers/      # Input format handlers (Markdown, JSON, JaTeX, custom DSLs)
│   └── core/         # Plugin system and shared abstractions
├── artifacts/        # Small demos of code that have graduated from the 'spikes'
│   ├── lcars         # Star Trek inspired UI showing molecular structures
│   ├── small-sounds  # A DSL for short sound effects
│   ├── omnichart     # Morphing bar chart / line chart / radial chart
│   └── ascii-tree    # Make trees for documentation by drag and drop
└── spikes/           # Rapid prototypes testing new ideas WIP
```

## Architecture

AI-assisted development naturally pushes toward clean separation of concerns - the AI works best on developing the code when it can focus on specific, well-defined modules. This has led to a highly pluggable architecture where renderers, parsers, and widgets incrementally add capabilities.

## Quick Start

Open any HTML file in `/spikes` or `/artifacts` directories directly in your browser - no build step required.

The ideas behind, making of and documentation for these artifacts are on the Safer Centaurs website.

## Points to Consider

* **Browser Compatibility:** Tested in Safari and Chrome. May work in Firefox too.
* **Desktop First:** Generally the ideas are for desktop and not mobile. 
* **Trusted Input:** Current markdown processing assumes trusted inputs - i.e. that you control the inputs and they are not malicious. Only serve the markdown where those assumptions hold.
* **Forward Breaking:** The API is likely to change as the project develops. Beware. 
* **Contributing:** Similar to policy on the Open Source software Manim and SQLite, feedback is welcome, the software is open source, but don't submit pull/merge requests.

These are strategic choices for a workflow optimised for prototyping.

## License

MIT - See LICENSE file  
Font files from KaTeX project have SIL license