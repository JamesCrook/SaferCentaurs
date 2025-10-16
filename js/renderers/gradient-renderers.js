/**
 * @module registerGradients
 * @description Gradient renderers draw background colors.
 * @param {object} r - The renderer object.
 */
//const registerGradients = function( r ){
((r) => {
  let ctx = null;
  let DataModel = null;
  let tl = 0;
  let br = 0;
  let sz = 0;
  let colorPoints = [];
  let imageDataBuffer = null;
  let lastCanvasWidth = 0;
  let lastCanvasHeight = 0;
  const resultRGBA = new Uint8Array(4);

  /**
   * @function binder
   * @description Binds the canvas rendering context.
   * @param {CanvasRenderingContext2D} ctx_in - The canvas rendering context.
   */
  function binder(ctx_in, DataModel_in) {
    ctx = ctx_in;
    DataModel = DataModel_in;
  }

  function addColorPoint(v, color) {
    const point = new ColorPoint(v.x, v.y, color);
    colorPoints.push(point);
  }

  function precomputeAdaptiveSigmas() {
    const sigmas = [];

    for(let i = 0; i < colorPoints.length; i++) {
      let minDistance = Infinity;

      // Find distance to nearest neighbor
      for(let j = 0; j < colorPoints.length; j++) {
        if(i !== j) {
          const dx = colorPoints[i].x - colorPoints[j].x;
          const dy = colorPoints[i].y - colorPoints[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          minDistance = Math.min(minDistance, distance);
        }
      }

      // Adaptive sigma: wider Gaussians for isolated points
      // Use 60% of nearest neighbor distance, clamped to reasonable bounds
      const adaptiveSigma = Math.max(30, Math.min(200, minDistance * 0.6));
      sigmas.push(adaptiveSigma);
    }

    return sigmas;
  }

  function getDistanceWeight(distance, sigma = 100) {
    // Gaussian weighting - smoother falloff with adaptive sigma
    return Math.exp(-(distance * distance) / (2 * sigma * sigma));
  }

  function interpolateColor(x, y) {
    if(colorPoints.length === 0) {
      resultRGBA[0] = 128;
      resultRGBA[1] = 128;
      resultRGBA[2] = 128;
      resultRGBA[3] = 255;
      return resultRGBA;
    }
    if(colorPoints.length === 1) {
      return colorPoints[0].rgba;
    }

    // Check if we're very close to a control point (within 2 pixels)
    for(let i = 0; i < colorPoints.length; i++) {
      const point = colorPoints[i];
      const dx = x - point.x;
      const dy = y - point.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if(distance < 2) {
        return point.rgba;
      }
    }

    let totalR = 0,
      totalG = 0,
      totalB = 0;
    let totalWeight = 0;
    const sigmas = precomputeAdaptiveSigmas();

    colorPoints.forEach((point, index) => {
      const dx = x - point.x;
      const dy = y - point.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const sigma = sigmas[index];
      const weight = getDistanceWeight(distance, sigma);

      totalR += point.rgba[0] * weight;
      totalG += point.rgba[1] * weight;
      totalB += point.rgba[2] * weight;
      totalWeight += weight;
    });

    if(totalWeight === 0) {
      resultRGBA[0] = 128;
      resultRGBA[1] = 128;
      resultRGBA[2] = 128;
      resultRGBA[3] = 255;
      return resultRGBA;
    }

    resultRGBA[0] = (totalR / totalWeight) | 0;
    resultRGBA[1] = (totalG / totalWeight) | 0;
    resultRGBA[2] = (totalB / totalWeight) | 0;
    resultRGBA[3] = 255;
    return resultRGBA;
  }

  function render() {
    if(colorPoints.length === 0) {
      return;
    }
    const canvas = ctx.canvas;
    if(canvas.width !== lastCanvasWidth || canvas.height !==
      lastCanvasHeight) {
      imageDataBuffer = ctx.createImageData(canvas.width, canvas.height);
      lastCanvasWidth = canvas.width;
      lastCanvasHeight = canvas.height;
    }

    const data = imageDataBuffer.data;
    const width = canvas.width;
    // Hmm, we are drawing direct on the canvas bits, so we do not get the benefit
    // of scaling/panning, so maybe there is an adjustment needed here???
    for(let y = tl.y; y < br.y; y++) {
      for(let x = tl.x; x < br.x; x++) {
        const rgba = interpolateColor(x, y);
        const index = (y * width + x) << 2;
        data.set(rgba, index);
      }
    }

    ctx.putImageData(imageDataBuffer, 0, 0);

    // Draw the color points with their adaptive sigma visualization in gaussian mode
    colorPoints.forEach((point, index) => {
      // Draw adaptive sigma circle in gaussian mode
      if(colorPoints.length > 1) {
        const sigmas = precomputeAdaptiveSigmas();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(point.x, point.y, sigmas[index], 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw the control point
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw point number
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), point.x, point.y + 4);

    });
  }

  function interpolateGradient(gradient, numPoints) {
    if(numPoints <= 1) {
      return [gradient[0]];
    }
    const lchGradient = gradient.map(hex => {
      const rgb = Colours.hexToRgb(hex);
      return Colours.rgbToLch(rgb.r, rgb.g, rgb.b);
    });

    const interpolatedColors = [];
    for(let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);

      const gradientIndex = Math.floor(t * (lchGradient.length - 1));
      const localT = (t * (lchGradient.length - 1)) - gradientIndex;

      const c1 = lchGradient[gradientIndex];
      const c2 = lchGradient[Math.min(gradientIndex + 1, lchGradient.length -
        1)];

      const l = c1.l + (c2.l - c1.l) * localT;
      const c = c1.c + (c2.c - c1.c) * localT;
      const h = Colours.interpolateHue(c1.h, c2.h, localT);

      const rgb = Colours.lchToRgb(l, c, h);
      interpolatedColors.push(Colours.rgbToHex(rgb.r, rgb.g, rgb.b));
    }
    return interpolatedColors;
  }

  /**
   * @function drawField
   * @description Draws a vector field.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawGradient(world, layer) {
    ({
      tl,
      br,
      sz
    } = r.coords(world, layer));
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
      "gradient": ["#ee1111", "#11eeee"]
    };
    const style2 = DataModel.getStyle('pathStyles', layer);
    Object.assign(style, style2);
    colorPoints = [];
    const colors = interpolateGradient(style.gradient, world.nodes.length);
    world.nodes.forEach((node, i) => {
      addColorPoint(node, colors[i]);
    });
    render();
  }

  r.registerRenderer("gradient", drawGradient, binder)
})(Renderers);
