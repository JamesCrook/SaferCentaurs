/**
 * @module registerGraphs
 * @description Registers graph renderers with the canvas renderer.
 * @param {object} r - The renderer object.
 * @requires js3/utilities/line-markings.js
 */
//registerGraphs
((r) => {
  let ctx = null;
  let intervalId;
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
   * @description Sets the sizing for the graph.
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
   * @function drawSineWave
   * @description Draws a sine wave on the canvas.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   */
  function drawSineWave(world, layer) {
    setSizing(world, layer);

    // Set the scale
    const scale = 2 * Math.PI / width;
    const amplitude = height / 4;

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Plot the sine wave
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    for(let x = 0; x <= width; x++) {
      const y = amplitude * Math.sin(scale * x) + height / 2;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'blue';
    ctx.stroke();
    ctx.restore();
  }

  /**
   * @function drawLosses
   * @description Draws a loss graph.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   * @param {object} data - The data to plot.
   */
  function drawLosses(world, layer, data) {
    setSizing(world, layer);
    data = data || ml_progress;

    const config = {
      border: 50,
      nLines: 4,
      fallbackLength: 10,
      yOffset: 0,
      horizontalGrid: {
        fontSize: 12,
        font: '12px serif',
        fillStyle: 'black',
        textAlign: 'center',
        labelOffset: -10,
        strokeStyle: '#888',
        lineWidth: 1,
      },
      axisMarkers: {
        spanDivider: 10,
        strongLineWidth: 2,
        strongLineColor: '#117',
        weakLineColor: '#888',
        labelFont: '12px serif',
        labelColor: 'black',
        labelOffsetBottom: 12,
        labelOffsetTop: -12,
        weakLabelFont: '10px serif',
        verticalLabelOffset: 12,
        verticalLabelYOffset: -2,
        lwThreshold: 1.8,
        fillThreshold: 50,
        fillOpacityThreshold: 80,
        fillOpacityFactor1: 30.0,
        fillOpacityFactor2: 50.0,
      },
      series: {
        lineWidth: 1,
        colors: ['#0000d0', '#20d030', '#d00000']
      },
      shield: {
        width: 150,
        height: 50,
        xOffset: 20,
        yOffset: -20,
        textYOffset: 20,
        lineHeight: 14,
        strokeStyle: '#333333',
        fillStyle: '#eeeeee',
        lineWidth: 1,
        font: '13px serif',
        fontColor: 'black',
        textAlign: 'right',
        textXPosFactor: 0.45,
      },
      axisLabel: {
        fontSize: 14,
        font: 'px serif',
        fillStyle: 'black',
        textAlign: 'center',
        topLabelYOffset: -26,
        bottomLabelYOffset: 15,
        leftLabelXOffset: -26,
      }
    };

    const border = config.border;
    const nLines = config.nLines;
    const xScale = (width - 2 * border) / (data?.losses?.[0]?.length || config
      .fallbackLength);
    const yScale = -(height - 2 * border) / nLines;
    const yOffset = config.yOffset;

    function plotHorizontalGridLines() {
      ctx.beginPath();
      const hg = config.horizontalGrid;
      ctx.font = hg.font;
      ctx.fillStyle = hg.fillStyle;
      ctx.textAlign = hg.textAlign;
      for(let i = 0; i <= nLines; i++) {
        const y = -i * yScale + border;
        ctx.moveTo(border, y);
        ctx.lineTo(width - border, y);
        ctx.fillText(-i, border + hg.labelOffset, y + hg.fontSize / 2);
      }
      ctx.strokeStyle = hg.strokeStyle;
      ctx.lineWidth = hg.lineWidth;
      ctx.stroke();
    }

    function plotAxisMarkers(axisConfig) {
      const {
        span,
        factors,
        orientation,
        labelPos
      } = axisConfig;
      const am = config.axisMarkers;

      const strengths = LineMarkings.lineStrengths(factors, span / am
        .spanDivider);
      const xStep = strengths.steps[2];
      const nCols = span / xStep;
      const l = (width - 2 * border) * (xStep / span);

      for(let i = 0; i < nCols; i++) {
        const x = border + (width - 2 * border) * i * (xStep / span);
        ctx.beginPath();

        const isStrongLine = (i * strengths.steps[2]) % strengths.steps[1] ===
          0;
        const lw = 2 * (1.0 - strengths.strength);

        if(orientation === 'vertical') {
          ctx.moveTo(x, border);
          ctx.lineTo(x, height - border);
        } else { // time markers
          const yTop = isStrongLine ? border - 10 : border - 8;
          ctx.moveTo(x, yTop);
          ctx.lineTo(x, border - 2);
        }

        if(isStrongLine) {
          ctx.strokeStyle = am.strongLineColor;
          ctx.lineWidth = am.strongLineWidth;
          ctx.font = am.labelFont;
          ctx.fillStyle = am.labelColor;
          if(labelPos === 'bottom') {
            ctx.fillText(LineMarkings.formatNumber(i * xStep), x, height -
              border + am.labelOffsetBottom);
          } else {
            ctx.fillText(LineMarkings.formatNumber(i * xStep), x, border + am
              .labelOffsetTop);
          }
        } else {
          ctx.strokeStyle = (lw > am.lwThreshold) ? am.strongLineColor : am
            .weakLineColor;
          ctx.lineWidth = lw;
          if(l > am.fillThreshold && orientation === 'vertical') {
            const fill = (l > am.fillOpacityThreshold) ? '#000000' :
              `rgba(0,0,0,${(l - am.fillOpacityFactor1) / am.fillOpacityFactor2})`;
            ctx.font = am.weakLabelFont;
            ctx.fillStyle = fill;
            ctx.fillText(LineMarkings.formatNumber(i * xStep), x, am
              .verticalLabelYOffset + height - border + am
              .verticalLabelOffset);
          } else if(lw > am.lwThreshold && orientation !== 'vertical') {
            ctx.fillStyle = am.labelColor;
            ctx.fillText(LineMarkings.formatNumber(i * xStep), x, border + am
              .labelOffsetTop);
          }
        }
        ctx.stroke();
      }
    }

    function plotOne(series, colour) {
      // Plot the sine wave
      ctx.beginPath();
      for(let i = 0; i < series.length; i++) {
        const x = i * xScale + border;
        const y = series[i] * yScale + border + yOffset;
        if(i === 0)
          ctx.moveTo(x, y);
        else
          ctx.lineTo(x, y);
      }
      ctx.strokeStyle = colour;
      ctx.lineWidth = config.series.lineWidth;
      ctx.stroke();
    }

    function plotShield(data) {
      const sh = config.shield;
      let w = sh.width;
      let h = sh.height;
      let x = border + sh.xOffset;
      let y = height - border + sh.yOffset - h;
      let ty = sh.textYOffset;

      function line(t1, t2) {
        ctx.textAlign = sh.textAlign;
        ctx.fillText(t1, x + w * sh.textXPosFactor, y + ty);
        ctx.textAlign = 'left';
        ctx.fillText(t2, x + w * sh.textXPosFactor, y + ty);
        ty += sh.lineHeight;
      }

      ctx.strokeStyle = sh.strokeStyle;
      ctx.fillStyle = sh.fillStyle;
      ctx.lineWidth = sh.lineWidth;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);

      ctx.font = sh.font;
      ctx.fillStyle = sh.fontColor;

      line('time: ', data.time.toFixed(1) + ' mins');
      if(data.cfg.main == 'fonty') {
        line('glyphs: ', data.cfg.glyphs);
      }
    }

    function isArrayOfArrays(arr) {
      if(!Array.isArray(arr)) return false;
      return arr.every(item => Array.isArray(item));
    }

    function drawAxisLabel(location, text) {
      const al = config.axisLabel;
      const fontSize = al.fontSize;
      ctx.font = `${fontSize}${al.font}`;
      ctx.fillStyle = al.fillStyle;
      ctx.textAlign = al.textAlign;
      let x = 0;
      let y = 0;
      if(location === 0) {
        x = width / 2;
        y = border + al.topLabelYOffset;
      }
      if(location === 1) {
        x = width / 2;
        y = height - border + fontSize + al.bottomLabelYOffset;
      }
      if(location === 2) {
        x = border + al.leftLabelXOffset;
        y = height / 2;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(text, 0, 0);
        ctx.restore();
        return;
      }
      ctx.fillText(text, x, y);
    }
    if(data?.cfg) {
      drawAxisLabel(0,
        `${data.cfg.params.toLocaleString('en-US')} parameter model; time in mins`
      )
      drawAxisLabel(1,
        `${data.cfg.model_name}; batches of size ${data.cfg.batch_size}`)
      drawAxisLabel(2, 'log error')
    } else {
      drawAxisLabel(0, 'time in mins')
      drawAxisLabel(1, 'batch')
      drawAxisLabel(2, 'log error')
    }

    plotHorizontalGridLines();
    plotAxisMarkers({
      span: data?.batches || 1100,
      factors: LineMarkings.decimalFactors,
      orientation: 'vertical',
      labelPos: 'bottom'
    });
    plotAxisMarkers({
      span: data?.time || 7,
      factors: LineMarkings.decimalFactors,
      orientation: 'horizontal-markers',
      labelPos: 'top'
    });
    if(typeof data?.cfg != 'undefined') {
      plotShield(data)
      if(isArrayOfArrays(data.losses)) {
        if(data.losses?.[2])
          plotOne(data.losses[2], config.series.colors[2]);
        if(data.losses?.[1])
          plotOne(data.losses[1], config.series.colors[1]);
        if(data.losses?.[0])
          plotOne(data.losses[0], config.series.colors[0]);
      } else {
        plotOne(data.losses, config.series.colors[0]);
      }
    }
    ctx.restore();
  }

  /**
   * @function drawTime
   * @description Draws the current time on the canvas.
   */
  function drawTime() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0]; // Get hh:mm:ss
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.font = '48px serif';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(timeString, canvas.width / 2, canvas.height / 2 + 16);
  }

  /**
   * @function drawSankey
   * @description Draws a Sankey diagram.
   * @param {object} world - The world object.
   * @param {object} layer - The layer object.
   * @param {Array<Array<number>>} data - The data for the Sankey diagram.
   */
  function drawSankeyBars(world, layer, data) {
    setSizing(world, layer);

    // Colors for each stack category
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];

    // all parameters are blends between 0 and 1
    function drawStackedBarChart(phi, alignment, parallelStyle, curviness,
      opacity) {

      const padding = 40;
      const chartWidth = width - 2 * padding;
      const chartHeight = height - 2 * padding;

      // Calculate number of bars (assuming all arrays have same length)
      const numBars = data[0].length;
      const numCategories = data.length;
      // width of a bar + sankey pair.
      // phi == 0, all sankey, we divide by n-1
      // phi == 1, all bar, we divide by n.
      const totalBarWidth = chartWidth / (phi + numBars - 1)
      // baseBar is just the bar part of the combined width.
      const baseBarWidth = totalBarWidth * phi;

      // Also blend between stacked and parallel widths
      const parallelBarWidth = baseBarWidth / numCategories;
      const currentWidth = baseBarWidth * (1 - parallelStyle) +
        parallelBarWidth * parallelStyle;

      // Calculate maximum values for scaling
      let maxStackHeight = 0;
      let maxCategoryValue = 0;
      for(let i = 0; i < numBars; i++) {
        let stackHeight = 0;
        for(let j = 0; j < numCategories; j++) {
          stackHeight += data[j][i];
          maxCategoryValue = Math.max(maxCategoryValue, data[j][i]);
        }
        maxStackHeight = Math.max(maxStackHeight, stackHeight);
      }

      // Store bar segment positions for sankey fills
      const barSegments = [];

      // Draw bars and collect segment positions
      for(let i = 0; i < numBars; i++) {
        const groupLeftX = padding + i * totalBarWidth;

        // Calculate total height of this stack for stacked mode
        let totalStackHeight = 0;
        for(let j = 0; j < numCategories; j++) {
          totalStackHeight += (data[j][i] / maxStackHeight) * chartHeight;
        }

        barSegments[i] = [];

        // Calculate positions for each segment/category
        for(let j = 0; j < numCategories; j++) {
          const segmentHeight = (data[j][i] / maxStackHeight) * chartHeight;
          const parallelHeight = (data[j][i] / maxCategoryValue) *
            chartHeight;

          // Calculate X position
          let stackedX = groupLeftX;
          let parallelX = groupLeftX + j * parallelBarWidth;
          let currentX = stackedX * (1 - parallelStyle) + parallelX *
            parallelStyle;

          // Calculate Y position for stacked mode
          let stackedBottomY = padding + chartHeight - alignment * (
            chartHeight - totalStackHeight);
          let stackedY = stackedBottomY;
          for(let k = 0; k < j; k++) {
            stackedY -= (data[k][i] / maxStackHeight) * chartHeight;
          }
          stackedY -= segmentHeight;

          // Calculate Y position for parallel mode
          const unusedParallelSpace = chartHeight - parallelHeight;
          let parallelY = padding + chartHeight - (alignment *
            unusedParallelSpace + parallelHeight);

          // Blend Y positions
          let currentY = stackedY * (1 - parallelStyle) + parallelY *
            parallelStyle;
          let currentHeight = segmentHeight * (1 - parallelStyle) +
            parallelHeight * parallelStyle;

          // Store segment position
          barSegments[i][j] = {
            x: currentX,
            y: currentY,
            width: currentWidth,
            height: currentHeight,
            bottomY: currentY + currentHeight
          };
        }
      }

      // Draw bars under sankey fills
      for(let i = 0; i < numBars; i++) {
        for(let j = 0; j < data.length; j++) {
          const segment = barSegments[i][j];
          ctx.fillStyle = colors[j % colors.length];
          ctx.fillRect(segment.x, segment.y, segment.width, segment.height);
        }
      }

      // Draw sankey fills if opacity > 0
      if(opacity > 0 && numBars > 1) {
        drawSankeyFills(barSegments, curviness, opacity);
      }

    }

    function drawSankeyFills(barSegments, curviness, opacity) {
      // Early return optimization
      if(opacity === 0) return;

      ctx.globalAlpha = opacity;

      for(let i = 0; i < barSegments.length - 1; i++) {
        for(let j = 0; j < data.length; j++) {
          const leftSeg = barSegments[i][j];
          const rightSeg = barSegments[i + 1][j];

          if(leftSeg.height > 0 && rightSeg.height > 0) {
            ctx.fillStyle = colors[j % colors.length];
            drawBlendedConnection(leftSeg, rightSeg, curviness);
          }
        }
      }

      ctx.globalAlpha = 1.0; // Reset alpha
    }

    function drawBlendedConnection(leftSeg, rightSeg, curviness) {
      const leftX = leftSeg.x + leftSeg.width;
      const rightX = rightSeg.x;

      // Calculate slopes for straight line (quadrilateral) case
      const topSlope = (rightSeg.y - leftSeg.y) / (rightX - leftX);
      const bottomSlope = (rightSeg.bottomY - leftSeg.bottomY) / (rightX -
        leftX);

      // Base control offset for hermite curve (horizontal tangents)
      const baseControlOffset = (rightX - leftX) * 0.5;

      // Blend between horizontal (hermite) and angled (quadrilateral) tangents
      // curviness 0 = hermite (horizontal), curviness 1 = quadrilateral (angled)
      const topControlOffsetY = curviness * topSlope * baseControlOffset;
      const bottomControlOffsetY = curviness * bottomSlope *
        baseControlOffset;

      ctx.beginPath();
      ctx.moveTo(leftX, leftSeg.y);

      // Top curve - blend between horizontal and angled tangent
      ctx.bezierCurveTo(
        leftX + baseControlOffset, leftSeg.y + topControlOffsetY,
        rightX - baseControlOffset, rightSeg.y - topControlOffsetY,
        rightX, rightSeg.y
      );

      ctx.lineTo(rightX, rightSeg.bottomY);

      // Bottom curve - blend between horizontal and angled tangent
      ctx.bezierCurveTo(
        rightX - baseControlOffset, rightSeg.bottomY - bottomControlOffsetY,
        leftX + baseControlOffset, leftSeg.bottomY + bottomControlOffsetY,
        leftX, leftSeg.bottomY
      );

      ctx.closePath();
      ctx.fill();
    }

    let labels;
    let chartData;

    if(DataModel) {
      chartData = DataModel.get2('sankeybars');
    } else if(world.sankey) {
      chartData = world.sankey;
    }

    if(chartData) {
      data = chartData.data;
      labels = chartData.labels;
      settings = chartData.settings || {};
    } else {
      // Fallback to default data
      data = [
        [10, 15, 8, 12, 20, 18, 14], // Category 1 (red)
        [5, 8, 12, 6, 10, 15, 9], // Category 2 (blue)
        [8, 12, 5, 9, 15, 8, 11], // Category 3 (green)
        [3, 7, 10, 4, 8, 12, 6] // Category 4 (orange)
      ];
      labels = ['Energy', 'Manufacturing', 'Transport', 'Buildings'];
    }

    let par = settings.parallelStyle ?? 0.0;
    drawStackedBarChart(
      settings.phi ?? 0.8,
      settings.alignment ?? 0.0,
      par,
      1 - (settings.curviness ?? 1.0),
      Math.min(settings.opacity ?? 0.7, (1 - par)));

    ctx.restore()
  }

  r.registerRenderer("wave", drawSineWave, binder)
  r.registerRenderer("ml", drawLosses, binder)
  r.registerRenderer("sankey-bars", drawSankeyBars, binder)
})(Renderers);
