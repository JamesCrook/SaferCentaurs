const Renderers = (() => {
  let renderers = {}
  let dataModel = null;
  let canvas = {};
  /**
   * @function registerRenderer
   * @description Registers a new renderer.
   * @param {string} name - The name of the renderer.
   * @param {function} renderer - The renderer function.
   * @param {function} binder - The binder function for the renderer.
   */
  function registerRenderer(name, renderer, binder) {
    renderers[name] = {
      drawFn: renderer,
      rebind: binder
    }
  }

  function drawLayer(ctx, DataModel, layer, typeIn) {
    dataModel = DataModel;
    // world is distinction between world and DataModel?
    let world = DataModel.getWorld()
    let type = typeIn || layer.type;
    let entry = renderers[type];
    canvas = ctx.canvas;
    if(entry != undefined) {
      entry.rebind(ctx, DataModel);
      entry.drawFn(world, layer);
    }
  }

  /**
   * @function vecOfRec
   * @description Converts a record with x and y properties to a Vector2D.
   * @param {object} rec - The record to convert.
   * @returns {Vector2D|null} A new Vector2D or null if the record is null.
   */
  function vecOfRec(rec) {
    return (rec ? new Vector2D(rec.x, rec.y) : null)
  }

  /**
   * @function coords
   * @description Calculates the coordinates for a layer.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   * @returns {{tl: Vector2D, br: Vector2D, sz: Vector2D}} The top-left, bottom-right, and size vectors.
   */
  function coords(world, layer) {
    const nodes = dataModel.getAllNodes()

    const nTl = nodes.find(n => n.id === layer.from);
    const nBr = nodes.find(n => n.id === layer.to);
    const tl = vecOfRec(nTl) || new Vector2D(0, 0);
    const br = vecOfRec(nBr) || new Vector2D(canvas.width, canvas.height);
    const sz = br.sub(tl);
    return {
      tl,
      br,
      sz
    }
  }

  /**
   * @function api
   * @description Returns the public API for the canvas renderer.
   * @returns {object} An object with methods to control the canvas renderer.
   */
  function api() {
    return {
      registerRenderer,
      drawLayer,
      vecOfRec,
      coords,
    }
  }
  return api();
})();
