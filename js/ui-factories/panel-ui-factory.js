/**
 * Creates and manages the ui of a panel instance.
 * Whilst canvasUiFactory must do a lot to handle the mouse and wheel,
 * panelUiFactory has almost nothing to do, as events are handled by the 
 * widgets themselves.
 * @param {string} name - The ID of the panel element.
 * @returns {object} An API for interacting with the panel.
 */
const panelUiFactory = function(name, configIn) {
  const state = {
    panel: null,
  };

  function init() {
    state.panel = document.createElement('div');
    state.panel.className = 'panel';
  }

  /**
   * Gets the panel's DOM element.
   * @returns {HTMLElement} The panel's DOM element.
   */
  function getPanel() {
    let pan = document.getElementById(name)
    return pan
  }

  function addWidget(prefix, control, uniquifier) {
    if(!state.panel)
      return;
    const controlElement = Widgets.createControl(prefix, control, uniquifier);
    state.panel.appendChild(controlElement);
  }

  /**
   * Creates the control panel and its widgets, and replaces the placeholder in the DOM.
   * @param {string} containerName - The ID of the DOM element to replace.
   * @param {object} config - The panel's configuration object.
   * @returns {HTMLDivElement} The newly created panel element.
   */
  function setPanelContents(config) {
    init();
    if(!config)
      return;
    if(config.layout) {
      state.panel.className = 'panel ' + config.layout;
    }
    // Providing a name allows later re-replacements...
    state.panel.id = name;

    if(config.title) {
      const title = document.createElement('h2');
      title.textContent = config.title;
      title.style = "margin:0px;"
      state.panel.appendChild(title);
    }

    const prefix = (config?.id || 'no-id');
    let ix = -1;
    for(const control of config.controls) {
      ix += 1;
      addWidget(prefix, control, name + ix);
    }

    if(config.width)
      state.panel.width = config.width;
    if(config.height)
      state.panel.height = config.height;

    document.getElementById(name)?.replaceWith(state.panel);

    for(const child of state.panel.children) {
      if(child.initialize) {
        child.initialize();
      }
    }

    return state.panel;
  }

  function api() {
    return {
      //init,
      setPanelContents,
      getPanel,
    };
  }
  setPanelContents(configIn)
  return api();
}

Factories.addFactory(panelUiFactory);
