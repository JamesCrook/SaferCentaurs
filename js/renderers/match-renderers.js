/**
 * @class SankeyDiagram
 * @description A class to draw a Sankey diagram on a canvas.
 */
class SankeyMatchDiagram {
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {number} width - The width of the canvas.
   * @param {number} height - The height of the canvas.
   */
  constructor(ctx, width, height) {
    this.ctx = ctx
    this.width = width
    this.height = height
    this.padding = 80;
    this.nodeWidth = 20;
    this.currentData = null;
    this.currentSourceLabels = null;
    this.currentTargetLabels = null;
    this.positionFactor = 0; // 0 = vertical, 1 = 45 degree slope
    this.diversionFactor = 0; // 0 = direct, 1 = via center blobs
    this.squareSize = 200;
    this.centerSquare = new Vector2D(this.width / 2, this.height / 2);
  }

  /**
   * @method calculateRibbonWidth
   * @description Calculate ribbon width from flow value.
   * @param {number} flowValue - The value of the flow.
   * @returns {number} The width of the ribbon.
   */
  calculateRibbonWidth(flowValue) {
    return Math.max(2, flowValue * 2); // Minimum 2px, scale by 2
  }

  /**
   * @method calculateBlobPosition
   * @description Calculate blob position in center square for a specific flow.
   * @param {number} sourceIndex - The index of the source node.
   * @param {number} targetIndex - The index of the target node.
   * @param {number} sourceCount - The total number of source nodes.
   * @param {number} targetCount - The total number of target nodes.
   * @returns {Vector2D} The position of the blob.
   */
  calculateBlobPosition(sourceIndex, targetIndex, sourceCount, targetCount) {
    const squareHalf = this.squareSize / 2;

    // Map source and target indices to positions within the square
    const sourceT = sourceCount > 1 ? sourceIndex / (sourceCount - 1) : 0.5;
    const targetT = targetCount > 1 ? targetIndex / (targetCount - 1) : 0.5;

    // Position within the rotated square
    const localX = (sourceT - 0.5) * squareHalf;
    const localY = (targetT - 0.5) * squareHalf;

    // Rotate by 45 degrees and translate to center
    const rotated = new Vector2D(localX, localY).rotate(Math.PI / 4);
    return this.centerSquare.add(rotated);
  }

  /**
   * @method calculateLabelPositions
   * @description Calculate label positions based on position factor.
   * @param {string[]} labels - The labels for the nodes.
   * @param {boolean} isSource - True if the labels are for source nodes, false otherwise.
   * @returns {Vector2D[]} An array of positions for the labels.
   */
  calculateLabelPositions(labels, isSource) {
    const positions = [];
    const labelCount = labels.length;

    let startPos1, startPos2, endPos1, endPos2;
    const squareHalf = this.squareSize / 2;
    const c = this.centerSquare;
    // for nice lines we want to be positioned relative to the last blob,
    // rather than relative to the bottom corner.
    const fudge = 50;

    if(isSource) {
      startPos1 = new Vector2D(this.padding, this.padding);
      endPos1 = new Vector2D(this.padding, this.height - this.padding);

      startPos2 = c.add(new Vector2D(-squareHalf - this.padding, 0));
      endPos2 = c.add(new Vector2D(-this.padding - fudge, squareHalf -
        fudge));
    } else {
      startPos1 = new Vector2D(this.width - this.padding, this.padding);
      endPos1 = new Vector2D(this.width - this.padding, this.height - this
        .padding);

      startPos2 = c.add(new Vector2D(squareHalf + this.padding, 0));
      endPos2 = c.add(new Vector2D(this.padding + fudge, squareHalf - fudge));
    }
    for(let i = 0; i < labelCount; i++) {
      const t = (labelCount > 1 ? i / (labelCount - 1) : 0);

      // Vertical positioning (factor = 0)
      const pos1 = startPos1.lerp(endPos1, t);
      const pos2 = startPos2.lerp(endPos2, t);

      const finalPos = pos1.lerp(pos2, this.positionFactor);
      positions.push(finalPos);
    }

    return positions;
  }

  /**
   * @method createGradient
   * @description Create gradient for ribbon.
   * @param {Vector2D} pos1 - The starting position of the gradient.
   * @param {Vector2D} pos2 - The ending position of the gradient.
   * @param {string} color1 - The starting color of the gradient.
   * @param {string} color2 - The ending color of the gradient.
   * @returns {CanvasGradient} The canvas gradient.
   */
  createGradient(pos1, pos2, color1, color2) {
    const gradient = this.ctx.createLinearGradient(pos1.x, pos1.y, pos2.x,
      pos2.y);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  }

  /**
   * @method drawCenterSquare
   * @description Draw tilted square in center.
   */
  drawCenterSquare() {
    const squareHalf = this.squareSize / 2;
    this.ctx.strokeStyle = '#ccc';
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.5;

    this.ctx.beginPath();
    // Draw diamond (45-degree rotated square)
    this.ctx.moveTo(this.centerSquare.x, this.centerSquare.y - squareHalf);
    this.ctx.lineTo(this.centerSquare.x + squareHalf, this.centerSquare.y);
    this.ctx.lineTo(this.centerSquare.x, this.centerSquare.y + squareHalf);
    this.ctx.lineTo(this.centerSquare.x - squareHalf, this.centerSquare.y);
    this.ctx.closePath();
    this.ctx.stroke();

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * @method drawBlob
   * @description Draw circular blob at given position.
   * @param {Vector2D} position - The position of the blob.
   * @param {number} radius - The radius of the blob.
   * @param {string} color - The color of the blob.
   */
  drawBlob(position, radius, color) {
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = 0.8;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;
  }

  /**
   * @method drawRibbon
   * @description Draw a curved ribbon, optionally via a center blob.
   * @param {Vector2D} pos1 - The starting position of the ribbon.
   * @param {number} height1 - The starting height of the ribbon.
   * @param {Vector2D} pos2 - The ending position of the ribbon.
   * @param {number} height2 - The ending height of the ribbon.
   * @param {string} color1 - The starting color of the ribbon.
   * @param {string} color2 - The ending color of the ribbon.
   * @param {Vector2D} [blobPos=null] - The position of the center blob.
   */
  drawRibbon(pos1, height1, pos2, height2, color1, color2, blobPos = null) {
    const gradient = this.createGradient(pos1, pos2, color1, color2);
    this.ctx.fillStyle = gradient;
    this.ctx.globalAlpha = 0.7;

    this.ctx.beginPath();

    if(blobPos && this.diversionFactor > 0) {
      // Calculate waypoint: interpolate from midpoint to blob position
      const midpoint = pos1.lerp(pos2, 0.5);
      const waypoint = midpoint.lerp(blobPos, this.diversionFactor);

      // Adjust waypoint so ribbon center (not top edge) goes through blob center
      const adjustedWaypoint = waypoint.add(new Vector2D(0, -height1 / 2));

      // Control points for smooth curves through waypoint
      const controlDistance1 = Math.abs(adjustedWaypoint.x - pos1.x) * 0.5;
      const controlDistance2 = Math.abs(pos2.x - adjustedWaypoint.x) * 0.5;

      const cp1 = pos1.add(new Vector2D(controlDistance1, 0));
      const cp2 = adjustedWaypoint.add(new Vector2D(-controlDistance1, 0));
      const cp3 = adjustedWaypoint.add(new Vector2D(controlDistance2, 0));
      const cp4 = pos2.add(new Vector2D(-controlDistance2, 0));

      // Top curve via waypoint
      this.ctx.moveTo(pos1.x, pos1.y);
      this.ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, adjustedWaypoint.x,
        adjustedWaypoint.y);
      this.ctx.bezierCurveTo(cp3.x, cp3.y, cp4.x, cp4.y, pos2.x, pos2.y);

      // Right edge
      this.ctx.lineTo(pos2.x, pos2.y + height2);

      // Bottom curve via waypoint
      this.ctx.bezierCurveTo(cp4.x, cp4.y + height2, cp3.x, cp3.y + height1,
        adjustedWaypoint.x, adjustedWaypoint.y + height1);
      this.ctx.bezierCurveTo(cp2.x, cp2.y + height1, cp1.x, cp1.y + height1,
        pos1.x, pos1.y + height1);

      // Left edge
      this.ctx.closePath();
    } else {
      // Direct path (original behavior)
      const controlDistance = Math.abs(pos2.x - pos1.x) * 0.5;
      const cp1 = pos1.add(new Vector2D(controlDistance, 0));
      const cp2 = pos2.add(new Vector2D(-controlDistance, 0));

      // Top curve
      this.ctx.moveTo(pos1.x, pos1.y);
      this.ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, pos2.x, pos2.y);
      // Right edge
      this.ctx.lineTo(pos2.x, pos2.y + height2);
      // Bottom curve
      this.ctx.bezierCurveTo(cp2.x, cp2.y + height2, cp1.x, cp1.y + height1,
        pos1.x, pos1.y + height1);
      // Left edge
      this.ctx.closePath();
    }

    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;
  }

  /**
   * @method drawNode
   * @description Draw a node (rectangle with label).
   * @param {Vector2D} position - The position of the node.
   * @param {number} width - The width of the node.
   * @param {number} height - The height of the node.
   * @param {string} color - The color of the node.
   * @param {string} label - The label of the node.
   */
  drawNode(position, width, height, color, label) {
    const pos = new Vector2D(position.x - width / 2, position.y - height / 2);

    // Draw rectangle
    this.ctx.fillStyle = color;
    this.ctx.fillRect(pos.x, pos.y, width, height);

    // Draw label
    this.ctx.fillStyle = '#333';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, position.x, position.y + 4);
  }

  /**
   * @method setPositionFactor
   * @description Update position factor and redraw.
   * @param {number} factor - The new position factor.
   */
  setPositionFactor(factor) {
    this.positionFactor = Math.max(0, Math.min(1, factor));
    if(this.currentData) {
      this.draw(this.currentData, this.currentSourceLabels, this
        .currentTargetLabels);
    }
  }

  /**
   * @method setDiversionFactor
   * @description Update diversion factor and redraw.
   * @param {number} factor - The new diversion factor.
   */
  setDiversionFactor(factor) {
    this.diversionFactor = Math.max(0, Math.min(1, factor));
    if(this.currentData) {
      this.draw(this.currentData, this.currentSourceLabels, this
        .currentTargetLabels);
    }
  }

  /**
   * @method setGridSize
   * @description Update grid size and redraw.
   * @param {number} size - The new grid size.
   */
  setGridSize(size) {
    this.squareSize = size * Math.min(this.width, this.height);
    if(this.currentData) {
      this.draw(this.currentData, this.currentSourceLabels, this
        .currentTargetLabels);
    }
  }

  /**
   * @method processData
   * @description Process data and calculate node positions.
   * @param {Array<Array<number>>} data - The data for the Sankey diagram.
   * @param {string[]} sourceLabels - The labels for the source nodes.
   * @param {string[]} targetLabels - The labels for the target nodes.
   * @returns {object} An object containing the nodes.
   */
  processData(data, sourceLabels, targetLabels) {
    const sourcePositions = this.calculateLabelPositions(sourceLabels, true);
    const targetPositions = this.calculateLabelPositions(targetLabels, false);

    const nodes = {};

    // Calculate source nodes
    sourceLabels.forEach((label, i) => {
      const totalFlow = data[i].reduce((sum, val) => sum + val, 0);
      const nodeHeight = Math.max(20, totalFlow * 2);

      nodes[`source_${i}`] = {
        position: sourcePositions[i],
        width: this.nodeWidth,
        height: nodeHeight,
        color: Colours.nodeColors[i % Colours.nodeColors.length],
        label: label,
        totalFlow: totalFlow
      };
    });

    // Calculate target nodes
    targetLabels.forEach((label, j) => {
      const totalFlow = data.reduce((sum, row) => sum + row[j], 0);
      const nodeHeight = Math.max(20, totalFlow * 2);

      nodes[`target_${j}`] = {
        position: targetPositions[j],
        width: this.nodeWidth,
        height: nodeHeight,
        color: Colours.nodeColors[(sourceLabels.length + j) % Colours
          .nodeColors.length],
        label: label,
        totalFlow: totalFlow
      };
    });

    return nodes;
  }

  // This function should be split into functions to
  //   init (sizing calculations)
  //   drawSquare
  //   drawRibbons
  //   drawBlobs
  //   drawNodes
  //   drawNodeLabels
  /**
   * @method draw
   * @description Draw the complete Sankey diagram.
   * @param {Array<Array<number>>} data - The data for the Sankey diagram.
   * @param {string[]} sourceLabels - The labels for the source nodes.
   * @param {string[]} targetLabels - The labels for the target nodes.
   */
  draw(data, sourceLabels, targetLabels) {
    // Store current data for position updates
    this.currentData = data;
    this.currentSourceLabels = sourceLabels;
    this.currentTargetLabels = targetLabels;
    let drawBlobs = this.squareSize > 200;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw center square first
    if(drawBlobs)
      this.drawCenterSquare();

    const nodes = this.processData(data, sourceLabels, targetLabels);

    // Collect all blobs to draw
    const blobs = [];

    // Draw ribbons first (so they appear behind nodes)
    let sourceOffsets = {};
    let targetOffsets = {};

    // Initialize offsets
    sourceLabels.forEach((_, i) => {
      sourceOffsets[i] = 0;
    });
    targetLabels.forEach((_, j) => {
      targetOffsets[j] = 0;
    });

    // Draw ribbons and collect blob data
    data.forEach((row, i) => {
      row.forEach((value, j) => {
        if(value > 0) {
          const sourceNode = nodes[`source_${i}`];
          const targetNode = nodes[`target_${j}`];

          const ribbonHeight = this.calculateRibbonWidth(value);

          const sourcePos = new Vector2D(
            sourceNode.position.x + sourceNode.width / 2,
            sourceNode.position.y - sourceNode.height / 2 +
            sourceOffsets[i]
          );

          const targetPos = new Vector2D(
            targetNode.position.x - targetNode.width / 2,
            targetNode.position.y - targetNode.height / 2 +
            targetOffsets[j]
          );

          // Calculate blob position and add to collection
          const blobPos = this.calculateBlobPosition(i, j,
            sourceLabels.length, targetLabels.length);
          const blobRadius = ribbonHeight / 2 + 2;
          const blobColor = Colours.interpolateColor(sourceNode.color,
            targetNode.color, 0.5);

          blobs.push({
            position: blobPos,
            radius: blobRadius,
            color: blobColor
          });

          this.drawRibbon(
            sourcePos, ribbonHeight,
            targetPos, ribbonHeight,
            sourceNode.color, targetNode.color,
            blobPos
          );

          sourceOffsets[i] += ribbonHeight;
          targetOffsets[j] += ribbonHeight;
        }
      });
    });

    // Draw blobs on top of ribbons but below nodes
    if(drawBlobs && this.diversionFactor > 0) {
      blobs.forEach(blob => {
        this.drawBlob(blob.position, blob.radius, blob.color);
      });
    }

    // Draw nodes on top
    Object.values(nodes).forEach(node => {
      this.drawNode(node.position, node.width, node.height, node.color,
        node.label);
    });

    // Draw axis lines when in slope mode
    if(this.positionFactor > 0.1) {
      this.drawAxisLines(sourceLabels, targetLabels);
    }
  }

  /**
   * @method drawAxisLines
   * @description Draw axis lines to show the coordinate system.
   * @param {string[]} sourceLabels - The labels for the source nodes.
   * @param {string[]} targetLabels - The labels for the target nodes.
   */
  drawAxisLines(sourceLabels, targetLabels) {
    const alpha = Math.min(0.4, this.positionFactor);
    this.ctx.globalAlpha = alpha;
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([5, 5]);

    const sourcePositions = this.calculateLabelPositions(sourceLabels, true);
    const targetPositions = this.calculateLabelPositions(targetLabels, false);

    // Draw source axis line
    if(sourcePositions.length > 1) {
      this.ctx.beginPath();
      this.ctx.moveTo(sourcePositions[0].x, sourcePositions[0].y);
      this.ctx.lineTo(sourcePositions[sourcePositions.length - 1].x,
        sourcePositions[sourcePositions.length - 1].y);
      this.ctx.stroke();
    }

    // Draw target axis line
    if(targetPositions.length > 1) {
      this.ctx.beginPath();
      this.ctx.moveTo(targetPositions[0].x, targetPositions[0].y);
      this.ctx.lineTo(targetPositions[targetPositions.length - 1].x,
        targetPositions[targetPositions.length - 1].y);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1.0;
    this.ctx.setLineDash([]);
  }
}

/**
 * @module registerMatchings
 * @description Match renderers draw flow lines and heatmaps that connect two categories.
 * @param {object} r - The renderer object.
 * @requires js3/utilities/vector2d.js
 * @requires js3/utilities/colours.js
 */
//const registerMatchings = function( r ){
((r) => {
  let ctx = null;
  let DataModel = null;

  let width;
  let height;
  let tl;
  let br;
  let sz;

  /**
   * @function binder
   * @description Binds the canvas rendering context.
   * @param {CanvasRenderingContext2D} ctx_in - The canvas rendering context.
   * @param {object} DataModel_in - The data model.
   */
  function binder(ctx_in, DataModel_in) {
    ctx = ctx_in;
    DataModel = DataModel_in;
  }

  /**
   * @function setSizing
   * @description Sets the sizing for the matching diagram.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function setSizing(world, layer) {
    ({
      tl,
      br,
      sz
    } = r.coords(world, layer));
    width = br.x - tl.x;
    height = br.y - tl.y;
    ctx.save();
    ctx.translate(tl.x, tl.y);
    ctx.clearRect(0, 0, width, height);
  }

  /**
   * @function drawSankey
   * @description Draws a Sankey diagram.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawSankeyMatch(world, layer) {
    setSizing(world, layer);

    // Initialize the diagram
    const sankey = new SankeyMatchDiagram(ctx, width, height);

    sankey.setPositionFactor(0.2);
    sankey.setDiversionFactor(1.0);
    sankey.setGridSize(1.0);

    let data, sourceLabels, targetLabels;
    let sankeyData;

    if(DataModel) {
      sankeyData = DataModel.get2('sankeymatch');
    } else if(world.sankey) {
      sankeyData = world.sankey;
    }

    if(sankeyData) {
      data = sankeyData.data;
      sourceLabels = sankeyData.sourceLabels;
      targetLabels = sankeyData.targetLabels;
    } else {
      // Fallback to default data
      data = [
        [10, 5, 3],
        [8, 12, 2],
        [4, 8, 15],
        [6, 3, 9]
      ];
      sourceLabels = ['Energy', 'Manufacturing', 'Transport', 'Buildings'];
      targetLabels = ['Electricity', 'Heat', 'Industry'];
    }

    if(data && sourceLabels && targetLabels) {
      sankey.draw(data, sourceLabels, targetLabels);
    }

    ctx.restore()
  }
  r.registerRenderer("sankey-match", drawSankeyMatch, binder)
})(Renderers);
