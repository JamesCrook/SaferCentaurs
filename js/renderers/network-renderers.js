/**
 * @module registerNetworks
 * @description Registers network renderers with the canvas renderer.
 * @param {object} r - The renderer object.
 * @requires js3/utilities/vector2d.js
 * @requires js3/utilities/line-geometry.js
 */
//const registerNetworks = 
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
   * @function drawPoints
   * @description Draws all points in the world.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawPoints(world, layer) {
    let nodes = world.nodes || [];
    if(layer && layer.limit) {
      let lim = Registry.get(layer.limit)
      nodes = nodes.slice(0, lim || 10);
    }
    nodes.forEach(node => {
      const point = r.vecOfRec(node);
      drawNode(point, node, DataModel.getNodeStyle(node));
    });
  }

  /**
   * @function drawNode
   * @description Draws a node on the canvas.
   * @param {Vector2D} point - The point of the node.
   * @param {object} node - The node data.
   * @param {object} style - The style for the node.
   */
  function drawNode(point, node, style) {
    const features = style.features || {};
    const showNodes = features.showNodes === undefined || features.showNodes;
    const showText = features.showText === undefined || features.showText;

    // Draw node circle
    if(showNodes && style.radius >= 1) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, style.radius, 0, Math.PI * 2);
      ctx.fillStyle = style.fill;
      ctx.fill();
      ctx.strokeStyle = style.outline;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if(!showText) {
      return;
    }

    let suffix = Math.floor((Math.min(50, style?.strength ?? 50) * 255 / 50))
      .toString(16).padStart(2, '0');

    // Draw node text
    ctx.fillStyle = '#000000'; // emoji still in colour!
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if(style.innerFont && (style.radius >= 1)) {
      ctx.font = GeometryUtils.resizedFont(style.innerFont, style.radius);
      const fontDisplace = (parseInt(ctx.font.match(/\d+/), 10) || 16) / 8;
      let displayText = node.emoji || node.symbol || node.name?.substr(0,
        2) || 'X';
      ctx.fillText(displayText, node.x, node.y + fontDisplace);
    }

    ctx.fillStyle = '#000000' + suffix;
    ctx.font = '12px Arial';
    ctx.fillText(node.name, node.x, node.y + style.radius + 15);
  }

  /**
   * It is very common to want to draw points and the connections between them
   * so as a convenience we have drawNetwork
   * @function drawNetwork
   * @description Draws a network.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawNetwork(world, layer) {
    r.drawLayer(ctx, DataModel, layer, "connections")
    r.drawLayer(ctx, DataModel, layer, "points")
  }

  // component renderers
  r.registerRenderer("points", drawPoints, binder);
  // Compound renderers for convenience
  r.registerRenderer("network", drawNetwork, binder);
})(Renderers);
