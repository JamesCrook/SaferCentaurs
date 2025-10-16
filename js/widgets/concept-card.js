/**
 * Registers the concept-card widget with the panel factory.
 */
((w) => {
  /**
   * Creates a concept-card widget, which is a self-assessment card with three options.
   * @param {string} prefix - The prefix for the widget's ID.
   * @param {object} config - The configuration for the concept-card.
   * @returns {HTMLDivElement} The created concept-card element.
   */
  function createConceptCard(prefix, config) {
    const index = config.id;

    if(config.layout) {
      // Safer templating
      let layoutHtml = config.layout
        .replace(/\$\{config.id\}/g, config.id)
        .replace(/\$\{config.label\}/g, config.label);

      const parser = new DOMParser();
      const doc = parser.parseFromString(layoutHtml, 'text/html');

      // If the layout has a single element, return it directly to avoid a wrapper div.
      if(doc.body.children.length === 1) {
        return doc.body.children[0];
      }

      // Fallback for layouts with multiple roots, wrap in a div.
      const card = document.createElement('div');
      card.className = 'concept-card';
      Array.from(doc.body.childNodes).forEach(child => {
        card.appendChild(child);
      });
      return card;
    }

    // Original accessible implementation for standard concept cards
    const card = document.createElement('div');
    card.className = 'concept-card';

    const header = document.createElement('div');
    header.className = 'concept-header';

    const conceptName = document.createElement('div');
    conceptName.className = 'concept-name';
    conceptName.textContent = config.label;

    const infoIcon = document.createElement('button');
    infoIcon.className = 'info-icon';
    infoIcon.textContent = 'i';

    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = config.tooltip || 'This is a Placeholder';
    tooltip.setAttribute('role', 'tooltip');
    const tooltipId = `${prefix}-${index}-tooltip`;
    tooltip.id = tooltipId;

    infoIcon.setAttribute('aria-describedby', tooltipId);
    infoIcon.appendChild(tooltip);

    header.appendChild(conceptName);
    header.appendChild(infoIcon);

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'concept-options';

    if(config.options) {
      config.options.forEach(option => {
        const label = document.createElement('label');
        label.className = 'option';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `concept-${index}`;
        radio.value = option.value;

        label.appendChild(radio);
        label.appendChild(document.createTextNode(` ${option.label}`));

        optionsContainer.appendChild(label);
      });
    } else {
      optionsContainer.textContent = "no options set";
    }

    card.appendChild(header);
    card.appendChild(optionsContainer);
    return card;
  }

  w.registerWidget('concept-card', createConceptCard);
})(Widgets);
