/**
 * @module registerGridders
 * @description Grid renderers draw background grids and heat maps. They can also do vector fields.
 * @param {object} r - The renderer object.
 */
//const registerGridders = function( r ){
((r) => {
  let ctx = null;
  let DataModel = null;

  /**
   * @function binder
   * @description Binds the canvas rendering context.
   * @param {CanvasRenderingContext2D} ctx_in - The canvas rendering context.
   */
  function binder(ctx_in, DataModel_in) {
    ctx = ctx_in;
    DataModel = DataModel_in;
  }

  /**
   * @function drawGrid
   * @description Draws a grid on the canvas.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawGrid(world, layer) {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    const spacing = layer.spacing || 50;
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
   * @function drawRoundedRect
   * @description Draws a rounded rectangle.
   * @param {number} x - The x-coordinate of the top-left corner.
   * @param {number} y - The y-coordinate of the top-left corner.
   * @param {number} width - The width of the rectangle.
   * @param {number} height - The height of the rectangle.
   * @param {number} radius - The corner radius.
   */
  function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y +
      height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill(); // or ctx.fill() to fill the rectangle
  }

  /**
   * @function countSetBits
   * @description Counts the number of set bits in a number.
   * @param {number} number - The number to count the set bits of.
   * @returns {number} The number of set bits.
   */
  function countSetBits(number) {
    let count = 0;
    while(number > 0) {
      number &= (number - 1); // Clear the least significant bit set
      count++;
    }
    return count;
  }

  // colouring based on numbers of set bits.
  function hadamard(i, j) {
    return (countSetBits(i) + countSetBits(j))
  }
  /**
   * @function drawHeatmap
   * @description Draws a heatmap.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  // This is placeholder code that draws some blobs.
  function drawHeatmap(world, layer) {
    ctx.strokeStyle = '#88c';
    ctx.lineWidth = 2;

    const stripes = true;
    const spacing = 10; //layer.spacing || 5;
    const d = 1;
    const {
      tl,
      br,
      sz
    } = r.coords(world, layer);
    // blobs on a grid
    for(let x = tl.x; x < br.x; x += spacing) {
      for(let y = tl.y; y < br.y; y += spacing) {
        const i = (x - tl.x) / spacing;
        const j = (y - tl.y) / spacing;
        const haddy = stripes ? (i + j) : hadamard(i, j);
        let c1 = ['#88c', '#c88', '#80c', '#c08'][haddy % 4];
        ctx.fillStyle = c1;
        drawRoundedRect(x + d, y + d, spacing - d, spacing - d, 3);
      }
    }
  }

  /**
   * @function drawField
   * @description Draws a vector field.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawField(world, layer) {
    const {
      tl,
      br,
      sz
    } = r.coords(world, layer);
    if(VectorFields) {
      let grid;
      if(DataModel) {
        const grids = DataModel.get('grids');
        if(grids && grids.length > 0) {
          grid = grids[0];
        }
      } else {
        grid = world.grids[0];
      }
      if(grid) {
        VectorFields.drawVectorField(ctx, grid);
      }
    }
  }

  r.registerRenderer("grid", drawGrid, binder)
  r.registerRenderer("heatmap", drawHeatmap, binder)
  r.registerRenderer("field", drawField, binder)
})(Renderers);
