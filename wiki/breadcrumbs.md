---
title: Breadcrumbs Tool - Safer Centaurs
template: tool_template.html
---
## Content
```html
<div class="container">
 <div class="tool-header">
  <h1>
   Breadcrumbs
  </h1>
  <p>
   Generate navigation breadcrumbs from simple path strings
  </p>
 </div>
 <div class="tool-interface">
  <div class="input-section">
   <label for="pathInput">
    Navigation Path
   </label>
   <input class="path-input" id="pathInput" oninput="generateBreadcrumbs()" placeholder="bible &gt; new testament &gt; john" type="text"/>
   <div class="help-text">
    Separate path levels with " &gt; " (space-greater than-space)
   </div>
  </div>
  <div class="output-section" id="outputSection" style="display: none;">
   <h3>
    Preview
   </h3>
   <div class="preview">
    <nav class="breadcrumbs" id="breadcrumbPreview">
     <!-- Generated breadcrumbs will appear here -->
    </nav>
   </div>
   <h3>
    HTML Code
   </h3>
   <div class="code-output" id="codeOutput">
    <button class="copy-btn" onclick="copyCode()">
     Copy
    </button>
    <span id="htmlCode">
     <!-- Generated HTML will appear here -->
    </span>
   </div>
  </div>
 </div>
 <div class="future-features">
  <h3>
   Coming Soon
  </h3>
  <p>
   Advanced features in development: Arc-style layouts, customizable hover effects, Miller column selection mode, and theme variations.
  </p>
 </div>
</div>

```


## Script
```javascript
function toggleMenu() {
            const navMenu = document.getElementById('navMenu');
            navMenu.classList.toggle('active');
        }

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.getElementById('navMenu');

            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
            }
        });

        function generateBreadcrumbs() {
            const input = document.getElementById('pathInput').value.trim();
            const outputSection = document.getElementById('outputSection');
            const preview = document.getElementById('breadcrumbPreview');
            const codeOutput = document.getElementById('htmlCode');

            if (!input) {
                outputSection.style.display = 'none';
                return;
            }

            const pathParts = input.split(' > ').map(part => part.trim()).filter(part => part);

            if (pathParts.length === 0) {
                outputSection.style.display = 'none';
                return;
            }

            // Generate preview HTML
            let previewHtml = '';
            let codeHtml = '<nav class="breadcrumbs">\n';

            pathParts.forEach((part, index) => {
                const isLast = index === pathParts.length - 1;
                const separator = index > 0 ? '<span class="breadcrumb-separator">›</span>' : '';

                if (isLast) {
                    previewHtml += `${separator}<span class="breadcrumb-item">${part}</span>`;
                    codeHtml += `  ${separator}<span class="breadcrumb-item">${part}</span>\n`;
                } else {
                    previewHtml += `${separator}<a href="#" class="breadcrumb-item">${part}</a>`;
                    codeHtml += `  ${separator}<a href="#" class="breadcrumb-item">${part}</a>\n`;
                }
            });

            codeHtml += '</nav>';

            preview.innerHTML = previewHtml;
            codeOutput.textContent = codeHtml;
            outputSection.style.display = 'block';
        }

        function copyCode() {
            const codeElement = document.getElementById('htmlCode');
            const text = codeElement.textContent;

            navigator.clipboard.writeText(text).then(() => {
                const copyBtn = document.querySelector('.copy-btn');
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
        }

        // Initialize with example
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('pathInput').value = 'bible > new testament > john';
            generateBreadcrumbs();
        });
```