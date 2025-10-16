const Widgets = (() => {
  let widgets = {};
  /**
   * Registers a new widget type with the factory.
   * @param {string} name - The name of the widget type.
   * @param {function} widget - The function that creates the widget's DOM element.
   * @param {function} [binder_in=binder] - An optional function for handling data binding.
   */
  function registerWidget(name, widget) {
    widgets[name] = {
      widgetCreate: widget
    }
  }

  /**
   * Creates a single control widget based on its configuration.
   * @param {string} prefix - A prefix for the control's ID, derived from the panel's ID.
   * @param {object} control - The configuration object for the control.
   * @returns {HTMLElement} The created control element.
   */
  function createControl(prefix, control) {
    let type = control.type;
    let entry = widgets[type];
    if(entry != undefined) {
      return entry.widgetCreate(prefix, control);
    } else {
      console.error(`Unsupported control type: ${control.type}`);
      return document.createElement('div');
    }
  }

  function api() {
    return {
      registerWidget,
      createControl,
    }
  }
  return api();
})();
