/**
 * Registers the slider widget with the panel factory.
 * @param {object} panelFactory - The factory instance to register with.
 */
//const registerSlider = function(panelFactory) {
((w) => {
  /**
   * Creates a slider widget with labels for min, max, and current value.
   * @param {string} prefix - The prefix for the widget's ID.
   * @param {object} config - The configuration for the slider.
   * @returns {HTMLDivElement} The created slider widget container.
   */
  function createSlider(prefix, config) {
    const group = document.createElement('div');
    group.className = 'slider-container';

    const sliderRow = document.createElement('div');
    sliderRow.className = 'slider-row';

    // Min label
    const minLabel = document.createElement('span');
    minLabel.className = 'min-label';
    minLabel.textContent = "" + config.min + (config.unit || "");
    sliderRow.appendChild(minLabel);

    // Center label with value
    const labelContainer = document.createElement('div');
    labelContainer.className = 'label-container';

    const label = document.createElement('label');
    label.setAttribute('for', config.id);
    label.textContent = config.label + ":";
    labelContainer.appendChild(label);

    const displayId = `${config.id}Value`;

    // Always have a value display...
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'value-display';
    valueDisplay.id = displayId;
    valueDisplay.textContent = `${config.value}${config.unit || ''}`;
    labelContainer.appendChild(valueDisplay);

    sliderRow.appendChild(labelContainer);

    // Max label
    const maxLabel = document.createElement('span');
    maxLabel.className = 'max-label';
    maxLabel.textContent = "" + config.max + (config.unit || "");
    sliderRow.appendChild(maxLabel);

    group.appendChild(sliderRow);

    // Slider
    const slider = document.createElement('input');
    slider.className = 'slider';
    slider.type = 'range';
    slider.id = config.id;

    // set the step before setting the value, otherwise it will be rounded.
    slider.step = config.step || 1;
    if(config.scale === 'log') {
      slider.min = 0;
      slider.max = 1000;
      const minl = Math.log(config.min);
      const maxl = Math.log(config.max);
      const valuel = Math.log(config.value);
      slider.value = Math.round(1000 * (valuel - minl) / (maxl - minl));
    } else {
      slider.min = config.min;
      slider.max = config.max;
      slider.value = config.value;
    }

    slider.oninput = function() {
      let finalValue;
      if(config.scale === 'log') {
        const minl = Math.log(config.min);
        const maxl = Math.log(config.max);
        const v = Number(this.value);
        finalValue = Math.round(Math.exp(minl + (v / 1000) * (maxl -
          minl)));
      } else {
        finalValue = Number(this.value);
      }
      const displayValue = document.getElementById(displayId);
      if(displayValue)
        displayValue.textContent = `${finalValue}${config.unit || ''}`;
      handleControlChange(prefix, config, finalValue);
    };

    group.appendChild(slider);

    return group;
  }

  w.registerWidget('slider', createSlider);
})(Widgets)
