// This is a controller in MVC

// Singleton
/**
 * Manages all UI instances, including uiItem and uiItems, and handles the overall application state.
 * @returns {object} The API for managing UI instances.
 */
/**
 * @module UiManager
 * @description A singleton manager for UI.
 * UiManager is implemented as an Immediately Invoked Function Expression (IIFE)
 * to create a single instance. It can be extended by different UI factories
 */
//const UiManager = function() { 
const UiManager = (() => {
  // uiItems are just names under the hood
  let uiItems = [];

  /**
   * Renders Markdown source into the first panel.
   * @param {string} mdSource - The path to the Markdown file.
   */
  function setPanelMarkdown(container, mdSource) {
    if(!(container && mdSource))
      return

    textCache.getText(mdSource).then(text => {
      uiItems = [];

      //let ast = mparser.parse(text);
      //let result = JSON.stringify(ast, null, 2);
      let result = markdownProcessor.htmlOf('\n' + text);
      container.className = "";
      container.innerHTML = result.text;

      // This is how we do delayed processing.
      // Once the html has been rendered, we work through the delayed islands.
      requestAnimationFrame(() => {
        result.fns.forEach((panel, counter) => {
          let panelName = `auto_${counter}`
          if(panel?.type == "canvas") {
            addCanvas(panelName, panel)
            //let canv = canvasFactory(panelName)
            //canv.setCanvasContents( panel );
          } else {
            addPanel(panelName, panel)
            //panelFactory(panelName, panel );
          }
        })
      })
    })
  }

  /**
   * Adds a new table to be managed by the UI.
   * @param {string} name - The ID of the table container element.
   * @param {object} [value] - Optional initial content for the table.
   */
  function addTable(name, value) {
    let table = Factories.create("tableUiFactory", name);
    if(value) {
      table.setTableContents(value);
    }
    return name;
  }

  /**
   * Updates a control variable in the registry.
   * @param {string} prefix - The registry prefix for the variable.
   * @param {object} control - The control object.
   * @param {*} newValue - The new value for the control.
   */
  function updateControlVariable(prefix, control, newValue) {
    v = Registry.get(prefix)
    if(Array.isArray(v))
      v = v[0];
    v[control.id] = newValue;
  }

  /**
   * Handles a change event from a control in a panel.
   * @param {string} prefix - The registry prefix.
   * @param {object} control - The control that changed.
   * @param {*} newValue - The new value of the control.
   */
  function handleControlChange(prefix, control, newValue) {
    updateControlVariable(prefix, control, newValue)
    //Renderer.draw();
    uiItems?.[0]?.draw()
  }

  /**
   * Handles a click event within a panel.
   * @param {Event} evt - The click event.
   * @param {string} prefix - The registry prefix.
   * @param {object} config - The configuration of the clicked element.
   */
  function handlePanelClick(evt, prefix, config) {
    if(prefix == 'world.choice') {
      setItem(config.id);
    }
  }

  function addNewDiv(container, name) {
    let div = document.createElement('div')
    div.id = name;
    container.appendChild(div);
    return name;
  }

  /**
   * Sets the active item, updating the UI based on the selected item's configuration.
   * @param {string} name - The name/ID of the item to set.
   */
  function setItem(name, type) {
    let worlds = Registry.get('worlds') || {};
    let item = name;
    let button = {};
    if(type)
      button[type] = name
    else
      button = worlds?.controls?.find(n => n.id === name);
    if(!button)
      return;
    if(button?.template)
      setTemplate(button.template);

    let container = document.getElementById('all-panels');

    if(button.contents) {
      uiItems = [];
      //canv0 = null;
      container.innerHTML = '';
      for(let i = 0; i < button.contents.length; i += 2) {
        const type = button.contents[i];
        const config = button.contents[i + 1];

        if(!config) {
          console.error("Configuration is missing for type: " + type);
          continue;
        }

        if(type === 'canvas') {
          addCanvas(addNewDiv(container, `ui-item${i}`), config);
        } else if(type === 'panel') {
          addPanel(addNewDiv(container, `ui-item${i}`), config);
        }
      }
    }

    if(button?.md)
      setPanelMarkdown(container, button.md);
  }

  /**
   * Adds a new canvas to be managed by the UI.
   * @param {string} name - The ID of the canvas element.
   */
  function addCanvas(name, value) {
    let canv = Factories.create("canvasUiFactory", name);
    uiItems.push(canv);
    if(value) {
      canv.setCanvasContents(value);
    }
    return name;
  }

  /**
   * Adds a new panel to be managed by the UI.
   * @param {string} name - The ID of the panel element.
   * @param {object} [value] - Optional initial content for the panel.
   */
  function addPanel(name, value) {
    let pan = Factories.create("panelUiFactory", name);
    //uiItems.push(pan)
    if(value) {
      pan.setPanelContents(value);
    }
    return name;
  }

  /**
   * Clears all uiItem and uiItems from the UI manager.
   */
  function clear() {
    uiItems = [];
    Registry.set('worlds', {});
  }

  /**
   * Sets the main HTML template for the application layout.
   * This creates a three column layout with draggable dividers.
   * @param {object} contents - The template configuration.
   */
  function setTemplate(contents) {
    clear();
    let body = document.body;
    body.innerHTML = `
      <div class="container">
        <div class="column" id="col1"> C1 </div>
        <div class="resizer" id="resizer1"></div>
        <div class="column" id="col2"> C2 </div>
        <div class="resizer" id="resizer2"></div>
        <div class="column" id="col3">
          <h1>New Template</h1>
          CX
        </div>
      </div>`;
    document.querySelectorAll('.resizer').forEach(resizer => {
      const handler = (e) => startResizing(resizer, e);
      resizer.addEventListener('mousedown', handler);
      resizer.addEventListener('touchstart', handler);
    });
    document.documentElement.setAttribute('data-theme', 'light');
    //addPanel( 'col3' );
  }

  /**
   * Returns the public API for the AppUi singleton.
   * @returns {object} The API object.
   */
  function api() {
    return {
      addCanvas,
      addPanel,
      addTable,
      setItem,
      clear,
    }
  }
  window.handleControlChange = handleControlChange;
  window.handlePanelClick = handlePanelClick;
  return api();
})();

// A synonym, since we often think of the UiManager as the App itself.
const AppUi = UiManager;
