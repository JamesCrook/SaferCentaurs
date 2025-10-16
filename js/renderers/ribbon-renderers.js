/**
 * Ribbons that go through a sequence of points.
 * We have biarc and we have splined ribbons.
 * The biarc are better in nearly all ways, so we use them by default.
 * These ribbon functions interface with the 'world' variable, which views
 * ribbons as sequences of nodes, with style in a separate structure.
 * drawNodeSequence is the do-all function in this closure, marshalling the
 * styles and then delegating to the ribbon draw functions.
 * @module registerRibbons
 * @description Registers network renderers with the canvas renderer.
 * @param {object} r - The renderer object.
 * @requires js3/utilities/vector2d.js
 * @requires js3/utilities/line-geometry.js
 */
//const registerRibbons = 
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
   * @function drawSequencePath
   * @description Draws a sequence path.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawSequencePath(world, layer, splineMode = false) {
    let style = {
      "angle": 12,
      "width": 3,
      "straightEdgeWidth": 2,
      "strength": 50,
      "radius": 10,
      "features": 5,
      "startEndType": "]",
      "endEndType": "]",
      "startSlant": 0.0,
      "endSlant": 0.0,
      "fill": 'green',
      "outline": '#0006',
    };
    const style2 = DataModel.getStyle('pathStyles', layer);
    Object.assign(style, style2);

    if(style.gradient) {
      style.fill = style.gradient;
    }

    drawNodeSequence(world.nodes || [], style, splineMode)
  }

  function drawSplinedSequencePath(world, layer) {
    drawSequencePath(world, layer, true)
  }

  // helper that allows a default if the param is undefined.
  function getParam(param, ifNull = false) {
    if(typeof param === 'undefined')
      return ifNull
    return param;
  }

  function drawNodeSequence(nodes, style, splineModeIn) {

    // For backward compatibility, we support a single features number,
    // and derive the features we want from it.
    // It is OK to modify the source style by adding .features.
    if(typeof style.features !== 'object' || style.features === null) {
      const featureValue = style.features;
      style.features = {
        endJoin: featureValue > 2,
        fill: featureValue > 3,
        bars: featureValue > 4,
        tangents: featureValue > 6
      };
    }

    // Draw straight lines if requested
    const straightStyle = {
      width: style.straightEdgeWidth,
      color: '#11A'
    };

    const fill = getParam(style?.features?.fill, false);
    const polygon = straightStyle.width > 0;
    const endJoin = getParam(style?.features?.endJoin);
    const endControl = getParam(style?.features?.endControl, false);
    const bars = getParam(style?.features?.bars);
    const markings = getParam(style?.features?.markings);
    const segments = getParam(style?.features?.segments, true);
    const ribbonFill = getParam(style?.features?.ribbonFill, false) && !
      segments;
    const imageFill = getParam(style?.features?.imageFill, false);
    const splineMode = getParam(style?.features?.spline, false);
    const tangents = getParam(style?.features?.tangents, false);

    if(style.gradient) {
      const n = nodes.length;
      const colors = Colours.interpolateGradient(style.gradient, n);
      nodes.forEach((node, i) => {
        node.color = colors[i];
      });
    }

    // Build the biarc path
    const ribbonPath = new RibbonPath()
      .withType(splineMode ? 'spline' : 'biarc')
      .withNodes(nodes)
      .withEndJoin(endJoin)
      .withEndControls(endControl)
      .build();

    const ribbon = new Ribbon({
      path: null,
      style: style
    });
    ribbon.setCtx(ctx);

    // Draw fill (of interior space) if requested
    if(fill)
      ribbon.drawFillFromPath(ribbonPath);

    // These three are different choices of background.
    // Short segments, node to node
    if(segments)
      ribbon.drawSegmentsFromPath(ribbonPath, style);
    // Or draw the filled ribbon, all with one outline
    if(ribbonFill)
      ribbon.drawFilledRibbonFromPath(ribbonPath, style);
    // Draw warped image, if specified
    if(imageFill && style.image) {
      ribbon.drawWarpedImageFromPath(ribbonPath, style.image);
    }

    if(polygon)
      ribbon.drawPolygonFromPath(ribbonPath, straightStyle)
    // Draw tangents if requested
    if(tangents)
      ribbon.drawTangentsFromPath(ribbonPath);
    // Draw bars if needed
    if(bars)
      ribbon.drawBarsFromPath(ribbonPath);

    // Draw markings if needed
    if(markings) {
      ribbon.drawMarkingsFromPath(ribbonPath, style.markings);
    }
  }

  /**
   * @function drawConnections
   * @description Draws all connections in the world.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawConnections(world, layer, splineMode = false) {
    const connections = world.connections || [];
    const nodes = world.nodes || [];

    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);

      if(!fromNode || !toNode) return;
      const style = DataModel.getConnectionStyle(conn);
      style.layer = layer;

      drawConnection(fromNode, toNode, style, splineMode);
    });
  }

  /**
   * @function drawSequence
   * @description Draws a sequence.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawSequence(world, layer) {
    r.drawLayer(ctx, DataModel, layer, "sequence-path")
    r.drawLayer(ctx, DataModel, layer, "points")
    //drawSequencePath(world, layer);
    //drawPoints(world, layer);
  }

  function drawConnection(fromNode, toNode, style, splineMode) {

    // We adjust the start and ends of the segment to take account of the size of
    // objects placed at the end points.
    const fromPt = new Vector2D(fromNode.x, fromNode.y);
    const toPt = new Vector2D(toNode.x, toNode.y);
    let radiusFrom = DataModel.getNodeRadius(fromNode);
    let radiusTo = DataModel.getNodeRadius(toNode);
    if(style?.startEndType != '>' && style?.startEndType != ')') radiusFrom =
      radiusFrom + Math.min(10, radiusFrom);
    if(style?.endEndType != '<' && style?.endEndType != '(') radiusTo =
      radiusTo + Math.min(10, radiusTo);

    // Calculate connection points
    const angle = toPt.subtract(fromPt).angle;
    const delta = (style?.angle || 0) * Math.PI / 180;
    const from = fromPt.add(Vector2D.fromPolar(radiusFrom, angle - delta));
    const to = toPt.subtract(Vector2D.fromPolar(radiusTo, angle + delta));

    const ribbon = new Ribbon({
      path: null,
      style: style
    });
    ribbon.setCtx(ctx);

    if(style) {
      const styleCopy = {
        ...style
      };
      styleCopy.features = {
        endJoin: false,
        fill: false,
        bars: true,
        tangents: true
      };
      /**
       * We'd rather use:
       * drawNodeSequence([vPre, from, to, vPost], styleCopy, splineMode);
       * in the next few lines as it would give us the options of showing tangents
       * and bars depending on the settings in style.
       *
       * vPre and vPost need to be computed, to give the right slope at the start
       * and end of the segment.
       *
       * Also for the biarc case, we might need a 'shortcut'
       * in the case the biarc can be done with one arc, because the in and out
       * slopes are the same. So we use more explicit case by case code for now.
       */
      if(splineMode) {
        let theta = styleCopy.angle * (Math.PI / 180.0);
        styleCopy.startTangent = to.sub(from).normalize().rotate(-theta);
        styleCopy.endTangent = to.sub(from).normalize().rotate(theta);
        ribbon.drawSplineRectangle(from, to, styleCopy);
      } else
        // drawArcRectangle uses style.angle directly.
        ribbon.drawArcRectangle(from, to, styleCopy);
    } else {
      ribbon.drawStraightSegment(from, to, style);
    }
  }

  // component renderers
  r.registerRenderer("connections", drawConnections, binder);
  r.registerRenderer("sequence-path", drawSequencePath, binder);
  r.registerRenderer("splined-sequence-path", drawSplinedSequencePath,
    binder);
  // Compound renderers for convenience
  r.registerRenderer("sequence", drawSequence, binder);
})(Renderers);
