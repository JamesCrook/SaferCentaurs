// This is a view in MVC
// We don't register this factory with Factories. Instead it is just for use
// by canvas-ui-factories.js
/**
 * @module canvasFactory
 * @description The Canvas factory attaches to a canvas in the dom and draws on to
 * it using renderers.
 * It can do a double draw where it draws what it can and also waits for any
 * resources to become available.
 * It does not include user interaction.
 * @param {string} canvasId - The ID of the canvas element.
 * @returns {object} An API object with methods to control the canvas renderer.
 */
const canvasFactory = function(canvasId) {
  //let world  = {};
  let canvas = null;
  let ctx = null;
  let scaling = {};
  let DataModel = createWorldManager();

  scaling.tl = new Vector2D(0, 0);
  scaling.br = new Vector2D(100, 100);
  scaling.sz = new Vector2D(100, 100);

  /**
   * @function init
   * @description Initializes the canvas and registers the renderers.
   * @param {string} canvasId - The ID of the canvas element.
   * @returns {boolean} True if initialization was successful, false otherwise.
   */
  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    if(!canvas) return false;

    ctx = canvas.getContext('2d');
    return true;
  }

  /**
   * @function binder
   * @description This parent rendererFactory does not need to rebind,
   * but grouped child renderers will uncomment these in their copies of 'binder()',
   * to populate the closure variables.
   * @param {CanvasRenderingContext2D} ctx_in - The canvas rendering context.
   * @param {object} DataModel_in - The data model.
   */
  function binder(ctx_in, DataModel_in) {
    //ctx = ctx_in;
    //DataModel = DataModel_in
  }

  /**
   * @function draw
   * @description Clears the canvas and draws all layers.
   */
  function draw() {
    if(!ctx) return;
    const startTime = performance.now();
    const view = Registry.get('view');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(view.panX, view.panY);
    ctx.scale(view.scale, view.scale);

    let world = DataModel.getWorld()
    // Draw each layer in turn
    // The first layer is often a background grid
    let layers = world.layers;
    layers.forEach(layer => {
      Renderers.drawLayer(ctx, DataModel, layer);
    });
    ctx.restore();

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    const renderTimeDivId = canvas.dataset.renderTimeDiv;
    if(renderTimeDivId) {
      const renderTimeDiv = document.getElementById(renderTimeDivId);
      if(renderTimeDiv) {
        renderTimeDiv.textContent =
          `Render time: ${renderTime.toFixed(2)} ms`;
      }
    }
  }

  /**
   * @function drawWithWaiting
   * @description Draws what it can immediately, and triggers a delayed draw if it was waiting on data.
   * TODO: If we issue many such requests, might they all mature at once?
   * in other words, should we avoid queuing one if one exists already?
   */
  function drawWithWaiting() {
    draw();
    // in case they didn't include the delayed image cache.
    if(typeof imageCache === 'undefined')
      return;
    let prom = imageCache?.delayedItemsPromise()
    if(prom) {
      prom.then(() => {
        draw();
      });
    }
  }

  /**
   * @function getDataModel
   * @description Returns the data model.
   * @returns {object} The data model.
   */
  function getDataModel() {
    return DataModel
  }

  /**
   * @function api
   * @description Returns the public API for the canvas renderer.
   * @returns {object} An object with methods to control the canvas renderer.
   */
  function api() {
    return {
      draw,
      drawWithWaiting,
      getDataModel,
    }
  }
  init(canvasId);
  return api();
}
