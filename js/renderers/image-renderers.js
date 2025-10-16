/**
 * @module registerImage
 * @description Registers image renderer with the canvas renderer.
 * @param {object} r - The renderer object.
 * @requires js3/items-cache.js
 */
//const registerImage = function(r) {
((r) => {
  let ctx = null;
  let DataModel = null;

  /**
   * @function binder
   * @description Binds the canvas rendering context and data model.
   * @param {CanvasRenderingContext2D} ctx_in - The canvas rendering context.
   * @param {object} DataModel_in - The data model.
   */
  function binder(ctx_in, DataModel_in) {
    ctx = ctx_in;
    DataModel = DataModel_in;
  }

  /**
   * @function drawImage
   * @description Draws an image on the canvas.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawImage(world, layer) {
    const imageUrl = layer.url;
    const img1 = imageCache.cache.get(imageUrl);
    if(!img1) {
      imageCache.loadImages([imageUrl]);
      return;
    }
    const {
      tl,
      br,
      sz
    } = r.coords(world, layer);

    ctx.save();
    if(layer.cropPath) {
      ctx.beginPath();
      const firstPoint = layer.cropPath[0];
      ctx.moveTo(tl.x + firstPoint.x, tl.y + firstPoint.y);
      for(let i = 1; i < layer.cropPath.length; i++) {
        const point = layer.cropPath[i];
        ctx.lineTo(tl.x + point.x, tl.y + point.y);
      }
      ctx.closePath();
      ctx.clip();
    }

    ctx.drawImage(img1, tl.x, tl.y, sz.x, sz.y);
    ctx.restore();
  }

  // component renderers
  r.registerRenderer("image", drawImage, binder);
})(Renderers);
