# README.md

This repo contains code developed at [Safer Centaurs](https://www.safercentaurs.com), where I blog about the AI-assisted development process.

I believe AI amplifies human capability - for better or worse. By rapidly building and openly sharing powerful tools, we help ensure positive applications emerge first and shape how this technology develops.

## Repository Structure
```
├── js/              # Core graphics library - unified approach to diagrams, graphs, infographics
│   ├── renderers/   # Pluggable output systems
│   ├── widgets/     # Reusable UI components 
│   ├── parsers/     # Input format handlers (Markdown, JSON, JaTeX, custom DSLs)
│   └── core/        # Plugin system and shared abstractions
├── spikes/          # Rapid prototypes testing new ideas
├── mind-map/        # Markdown → interactive mind map application  
└── framer/          # Comic book layout and creation tool
```

## Architecture

AI-assisted development naturally pushes toward clean separation of concerns - the AI works best when it can focus on specific, well-defined modules. This has led to a highly pluggable architecture where renderers, parsers, and widgets incrementally add capabilities.

## Quick Start

Open any HTML file in `/spikes` or `/apps` directories directly in your browser - no build step required.

## Points to Consider

* **Browser Compatibility:** Tested in Safari and Chrome. May work in Firefox too.
* **Trusted Input:** Current markdown processing assumes trusted inputs - i.e. that you control the inputs and they are not malicious. Only use where those assumptions hold.
* **Forward Compatibility:** The API is likely to change as the project develops. 
* **Contributing:** Similar to Manim and SQLite, feedback welcome, open source, but don't submit pull/merge requests.

## License

MIT - See LICENSE file  
Font files from KaTeX project have SIL license