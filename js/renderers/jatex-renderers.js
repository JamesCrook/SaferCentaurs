/**
 * @module registerJatex
 * @description This registration function is registering with the
 * JSON-structure based renderer. 
 * It provides the 'jatex' primitive to that renderer.
 * @param {object} r - The renderer object.
 * @requires js3/parsers/jatex.js
 */
//const registerJatex = function( r ){
((r) => {
  let ctx = null;

  /**
   * @function binder
   * @description Binds the canvas rendering context.
   * @param {CanvasRenderingContext2D} ctx_in - The canvas rendering context.
   */
  function binder(ctx_in) {
    ctx = ctx_in;
  }

  /**
   * @function drawJatexGrid
   * @description Draws a grid on the canvas.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawJatexGrid(world, layer) {
    ctx.strokeStyle = '#11c6';
    ctx.lineWidth = 1;

    const spacing = layer.spacing || 20;
    const {
      tl,
      br,
      sz
    } = r.coords(world, layer);
    // Vertical lines
    for(let x = tl.x; x < br.x; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, tl.y);
      ctx.lineTo(x, br.y);
      ctx.stroke();
    }

    // Horizontal lines
    for(let y = tl.y; y < br.y; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(tl.x, y);
      ctx.lineTo(br.x, y);
      ctx.stroke();
    }
  }

  /**
   * @function drawJatex
   * @description Draws the Jatex content.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawJatex(world, layer) {
    drawJatexGrid(world, layer);
    let ast = jatexProcessor.astOf("\\frac{\\resistor}{\\transistor}");
    console.log(ast);
    jatexProcessor.draw(ast, ctx);
  }

  r.registerRenderer("jatex", drawJatex, binder)
})(Renderers);
