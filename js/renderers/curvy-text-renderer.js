/**
 * @module registerMotto
 * @description Registers the motto renderer with the canvas renderer.
 * @param {object} r - The renderer object.
 * @requires js3/utilities/vector2d.js
 * @requires js3/utilities/line-geometry.js
 */
//const registerMotto = function(r) {
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
   * @function drawMotto
   * @description Draws a heraldry motto along a biarc path.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawCurvyText(world, layer) {
    const style = (world.pathStyles && world.pathStyles[0]) ? world
      .pathStyles[
        0] : {};
    if(style?.features?.flowtext === false)
      return;
    const mottoText = style.mottoText || "Per Ardua Ad Astra";
    const font = layer.font || "24px serif";
    const nodes = world.nodes.filter(n => layer.nodes.includes(n.id));
    const path = new RibbonPath().withNodes(nodes).build();
    const pathLength = path.getLength();

    ctx.save();
    ctx.font = font;
    ctx.fillStyle = layer.fill || "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textMetrics = ctx.measureText(mottoText);
    const textWidth = textMetrics.width;
    const startOffset = (pathLength - textWidth) / 2;

    for(let i = 0; i < mottoText.length; i++) {
      const char = mottoText[i];
      const charWidth = ctx.measureText(char).width;
      const distance = startOffset + ctx.measureText(mottoText.substring(0,
        i)).width + charWidth / 2;

      if(distance < 0 || distance > pathLength) continue;

      const {
        point,
        tangent
      } = path.sampleAtDistance(distance);
      if(!point || !tangent) continue;

      ctx.save();
      ctx.translate(point.x, point.y);
      ctx.rotate(tangent.angle);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  r.registerRenderer("curvy-text", drawCurvyText, binder);
})(Renderers);
