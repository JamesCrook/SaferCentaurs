# README.md

This repo contains code developed at [Safer Centaurs](https://www.safercentaurs.com), where I blog about the AI-assisted development process.

AI amplifies human capability - for better or worse. In Safer Centaurs I'm aiming to help democratise the good uses of AI, aiming for good outcomes.

This works in two ways:
* In the blog posts I am showing how to leverage AI to do more. This is part of democratising the AI tools. There is little point having access to AI tools without also having the know-how to use them effectively.
* The actual code produced in the course of the blog posts is ultimately for communicating using diagrams. Visual metaphors work well for organising information. The diagram tools help us to work better with more information.

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

AI-assisted development naturally pushes toward clean separation of concerns - the AI works best on developing the code when it can focus on specific, well-defined modules. This has led to a highly pluggable architecture where renderers, parsers, and widgets incrementally add capabilities.

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