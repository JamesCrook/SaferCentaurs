/* ============================================
   OmniGrid - Grid/Matrix Viewer Engine
   ============================================
   
   Classes:
   - SampleGenerators: Built-in sample datasets
   - ColorEngine: Color mapping utilities
   - TextUtils: Text measurement and truncation
   - GridRenderer: Main rendering engine
*/

// ============================================================
// SAMPLE GENERATORS
// ============================================================

const SampleGenerators = {
  pam250() {
    const aa = 'ARNDCQEGHILKMFPSTWYV'.split('');
    const matrix = [
      [ 2,-2, 0, 0,-2, 0, 0, 1,-1,-1,-2,-1,-1,-4, 1, 1, 1,-6,-3, 0],
      [-2, 6, 0,-1,-4, 1,-1,-3, 2,-2,-3, 3, 0,-4, 0, 0,-1, 2,-4,-2],
      [ 0, 0, 2, 2,-4, 1, 1, 0, 2,-2,-3, 1,-2,-4,-1, 1, 0,-4,-2,-2],
      [ 0,-1, 2, 4,-5, 2, 3, 1, 1,-2,-4, 0,-3,-6,-1, 0, 0,-7,-4,-2],
      [-2,-4,-4,-6,12,-5,-5,-3,-3,-2,-6,-5,-5,-4,-3, 0,-2,-8, 0,-2],
      [ 0, 1, 1, 2,-5, 4, 2,-1, 3,-2,-2, 1,-1,-5, 0,-1,-1,-5,-4,-2],
      [ 0,-1, 1, 3,-5, 2, 4, 0, 1,-2,-3, 0,-2,-5,-1, 0, 0,-7,-4,-2],
      [ 1,-3, 0, 1,-3,-1, 0, 5,-2,-3,-4,-2,-3,-5,-1, 1, 0,-7,-5,-1],
      [-1, 2, 2, 1,-3, 3, 1,-2, 6,-2,-2, 0,-2,-2, 0,-1,-1,-3, 0,-2],
      [-1,-2,-2,-2,-2,-2,-2,-3,-2, 5, 2,-2, 2, 1,-2,-1, 0,-5,-1, 4],
      [-2,-3,-3,-4,-6,-2,-3,-4,-2, 2, 6,-3, 4, 2,-3,-3,-2,-2,-1, 2],
      [-1, 3, 1, 0,-5, 1, 0,-2, 0,-2,-3, 5, 0,-5,-1, 0, 0,-3,-4,-2],
      [-1, 0,-2,-3,-5,-1,-2,-3,-2, 2, 4, 0, 6, 0,-2,-2,-1,-4,-2, 2],
      [-4,-4,-4,-6,-4,-5,-5,-5,-2, 1, 2,-5, 0, 9,-5,-3,-3, 0, 7,-1],
      [ 1, 0,-1,-1,-3, 0,-1,-1, 0,-2,-3,-1,-2,-5, 6, 1, 0,-6,-5,-1],
      [ 1, 0, 1, 0, 0,-1, 0, 1,-1,-1,-3, 0,-2,-3, 1, 2, 1,-2,-3,-1],
      [ 1,-1, 0, 0,-2,-1, 0, 0,-1, 0,-2, 0,-1,-3, 0, 1, 3,-5,-3, 0],
      [-6, 2,-4,-7,-8,-5,-7,-7,-3,-5,-2,-3,-4, 0,-6,-2,-5,17, 0,-6],
      [-3,-4,-2,-4, 0,-4,-4,-5, 0,-1,-1,-4,-2, 7,-5,-3,-3, 0,10,-2],
      [ 0,-2,-2,-2,-2,-2,-2,-1,-2, 4, 2,-2, 2,-1,-1,-1, 0,-6,-2, 4]
    ];
    
    let csv = ',' + aa.join(',') + '\n';
    for (let i = 0; i < aa.length; i++) {
      csv += aa[i] + ',' + matrix[i].join(',') + '\n';
    }
    return new CSVData(csv);
  },

  cities(size = 'large') {
    const cityNames = [
      'Tokyo','Delhi','Shanghai','São Paulo','Mexico City','Cairo','Mumbai',
      'Beijing','Dhaka','Osaka','New York','Karachi','Buenos Aires','Chongqing',
      'Istanbul','Kolkata','Manila','Lagos','Rio de Janeiro','Tianjin',
      'Kinshasa','Guangzhou','Los Angeles','Moscow','Shenzhen','Lahore',
      'Bangalore','Paris','Jakarta','Chennai'
    ];
    const sizes = { small: 10, medium: 15, large: cityNames.length };
    const n = sizes[size];
    
    const coords = [
      [35.6,139.7],[28.6,77.2],[31.2,121.5],[-23.5,-46.6],[19.4,-99.1],
      [30.0,31.2],[19.0,72.8],[39.9,116.4],[23.8,90.4],[34.7,135.5],
      [40.7,-74.0],[24.9,67.0],[-34.6,-58.4],[29.4,106.9],[41.0,29.0],
      [22.6,88.4],[14.6,121.0],[6.5,3.4],[-22.9,-43.2],[39.3,117.4],
      [-4.4,15.3],[23.1,113.3],[34.1,-118.2],[55.8,37.6],[22.5,114.1],
      [31.5,74.3],[13.0,77.6],[48.9,2.3],[-6.2,106.8],[13.1,80.3]
    ];
    
    const toRad = d => d * Math.PI / 180;
    const dist = (i, j) => {
      const [lat1, lon1] = coords[i];
      const [lat2, lon2] = coords[j];
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
      return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
    };
    
    let csv = ',' + cityNames.slice(0, n).join(',') + '\n';
    for (let i = 0; i < n; i++) {
      const row = [cityNames[i]];
      for (let j = 0; j < n; j++) {
        row.push(i === j ? 0 : dist(i, j));
      }
      csv += row.join(',') + '\n';
    }
    return new CSVData(csv);
  },

  random(size = 'medium') {
    const sizes = { small: 10, medium: 50, large: 200 };
    const n = sizes[size];
    
    let csv = ',';
    for (let c = 0; c < n; c++) csv += 'C' + (c+1) + (c < n-1 ? ',' : '\n');
    
    for (let r = 0; r < n; r++) {
      csv += 'R' + (r+1);
      for (let c = 0; c < n; c++) {
        csv += ',' + (Math.random() * 200 - 100).toFixed(2);
      }
      csv += '\n';
    }
    return new CSVData(csv);
  },

  wave(size = 'medium') {
    const sizes = { small: 50, medium: 200, large: 1000 };
    const n = sizes[size];
    return new FunctionData(n, n,
      (r, c) => Math.sin(r * 0.15) * Math.cos(c * 0.15) * 10,
      { range: { min: -10, max: 10 } }
    );
  },

  multiplication(size = 'medium') {
    const sizes = { small: 12, medium: 50, large: 200 };
    const n = sizes[size];
    return new FunctionData(n, n,
      (r, c) => (r + 1) * (c + 1),
      {
        rowNameFn: r => String(r + 1),
        colNameFn: c => String(c + 1),
        range: { min: 1, max: n * n }
      }
    );
  },

  gradient(size = 'medium') {
    const sizes = { small: 50, medium: 200, large: 500 };
    const n = sizes[size];
    return new FunctionData(n, n,
      (r, c) => r + c - n,
      { range: { min: -n, max: n } }
    );
  }
};

// ============================================================
// COLOR ENGINE
// ============================================================

const ColorEngine = {
  schemes: {
    'red-green': { negative: [220, 50, 50], zero: [255, 255, 255], positive: [50, 180, 50] },
    'blue-red': { negative: [50, 100, 200], zero: [255, 255, 255], positive: [200, 50, 50] },
    'purple-orange': { negative: [150, 50, 200], zero: [255, 255, 255], positive: [230, 150, 50] },
    'cyan-magenta': { negative: [50, 200, 200], zero: [255, 255, 255], positive: [200, 50, 200] }
  },

  getColor(value, range, scheme, smooth) {
    const { min, max } = range;
    const colors = this.schemes[scheme] || this.schemes['red-green'];
    
    if (max === min) return colors.zero;
    
    const fullRange = Math.max(Math.abs(min), Math.abs(max));
    let t = value / (fullRange || 1);
    
    if (!smooth) {
      if (t < -0.5) return colors.negative;
      if (t > 0.5) return colors.positive;
      return colors.zero;
    }
    
    if (t < 0) {
      const factor = Math.abs(t);
      return this.lerp(colors.zero, colors.negative, factor);
    } else {
      return this.lerp(colors.zero, colors.positive, t);
    }
  },

  lerp(c1, c2, t) {
    return [
      Math.round(c1[0] + (c2[0] - c1[0]) * t),
      Math.round(c1[1] + (c2[1] - c1[1]) * t),
      Math.round(c1[2] + (c2[2] - c1[2]) * t)
    ];
  },

  toCSS(rgb, alpha = 1) {
    if (alpha < 1) {
      return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
    }
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  }
};

// ============================================================
// TEXT UTILS
// ============================================================

const TextUtils = {
  measureCache: new Map(),
  
  measure(ctx, text, font) {
    const key = font + '|' + text;
    if (!this.measureCache.has(key)) {
      ctx.font = font;
      this.measureCache.set(key, ctx.measureText(text).width);
    }
    return this.measureCache.get(key);
  },

  clearCache() {
    this.measureCache.clear();
  },

  truncate(ctx, text, maxWidth, font) {
    if (this.measure(ctx, text, font) <= maxWidth) {
      return text;
    }
    
    for (let len = text.length - 1; len > 0; len--) {
      const truncated = text.substring(0, len) + '…';
      if (this.measure(ctx, truncated, font) <= maxWidth) {
        return truncated;
      }
    }
    
    if (this.measure(ctx, text[0], font) <= maxWidth) {
      return text[0];
    }
    
    return '';
  }
};

// ============================================================
// GRID RENDERER
// ============================================================

class GridRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridData = null;
    this.camera = { x: 0, y: 0, zoom: 1.0 };
    
    this.options = {
      distanceMatrix: 0,      // 0-1: opacity of reflected cells (1 = fully hidden)
      headersAffectWidth: 0,  // 0-1: blend between ignoring/using header widths
      colorTarget: 0,         // 0 = background, 1 = foreground
      colorScheme: 'red-green',
      smoothGradient: 1,      // 0-1
      decimalPlaces: 2,
      blobMode: 0,            // 0-1
      constrainZoomOut: true
    };

    // Layout constants
    this.baseFontSize = 14;
    this.cellPadding = 6;
    this.headerHeight = 30;
    this.rowNameWidth = 80;
    this.minCellSize = 4;
    
    // Zoom thresholds
    this.TEXT_ZOOM = 0.5;
    this.HEATMAP_ZOOM = 0.12;
    
    // Cached calculations
    this.baseColWidths = [];
    this.baseColWidthsWithHeaders = [];
    this.baseCellHeight = 0;
  }

  setData(gridData) {
    this.gridData = gridData;
    this.calculateBaseDimensions();
    this.resetView();
  }

  calculateBaseDimensions() {
    if (!this.gridData) return;
    
    const ctx = this.ctx;
    const font = `${this.baseFontSize}px sans-serif`;
    ctx.font = font;
    
    this.baseCellHeight = this.baseFontSize + this.cellPadding * 2;
    
    // Calculate column widths (both with and without headers)
    this.baseColWidths = [];
    this.baseColWidthsWithHeaders = [];
    
    for (let c = 0; c < this.gridData.colCount; c++) {
      let maxWidth = 40;
      let maxWidthWithHeader = 40;
      let hasText = false;
      
      const headerWidth = TextUtils.measure(ctx, this.gridData.getColName(c), font) + this.cellPadding * 2;
      maxWidthWithHeader = Math.max(maxWidthWithHeader, headerWidth);
      
      const sampleRows = Math.min(100, this.gridData.rowCount);
      for (let r = 0; r < sampleRows; r++) {
        const row = Math.floor(r * this.gridData.rowCount / sampleRows);
        const value = this.gridData.getValue(row, c);
        const isNum = this.gridData.isNumeric(row, c);
        
        if (!isNum) hasText = true;
        
        let text;
        if (isNum) {
          const range = this.gridData.globalRange;
          const needsSign = range.min < 0;
          const maxAbs = Math.max(Math.abs(range.min), Math.abs(range.max));
          const formatted = maxAbs.toFixed(this.options.decimalPlaces);
          text = needsSign ? '-' + formatted : formatted;
        } else {
          text = this.formatValue(value);
        }
        const cellWidth = TextUtils.measure(ctx, text, font) + this.cellPadding * 2;
        maxWidth = Math.max(maxWidth, cellWidth);
        maxWidthWithHeader = Math.max(maxWidthWithHeader, cellWidth);
      }
      
      const maxLimit = hasText ? 1200 : 150;
      this.baseColWidths[c] = Math.min(maxWidth, maxLimit);
      this.baseColWidthsWithHeaders[c] = Math.min(maxWidthWithHeader, maxLimit);
    }
    
    // Calculate row name width
    this.rowNameWidth = 50;
    const sampleRows = Math.min(100, this.gridData.rowCount);
    for (let r = 0; r < sampleRows; r++) {
      const row = Math.floor(r * this.gridData.rowCount / sampleRows);
      const name = this.gridData.getRowName(row);
      this.rowNameWidth = Math.max(this.rowNameWidth, TextUtils.measure(ctx, name, font) + this.cellPadding * 2);
    }
    this.rowNameWidth = Math.min(this.rowNameWidth, 120);
  }

  resetView() {
    this.camera = { x: 0, y: 0, zoom: 1.0 };
    this.calculateBaseDimensions();
  }

  formatValue(value) {
    if (typeof value === 'number') {
      if (Number.isInteger(value)) return String(value);
      return value.toFixed(this.options.decimalPlaces);
    }
    return String(value ?? '');
  }

  smoothstep(x, edge0, edge1) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  getEffectiveColWidths() {
    // Blend between widths without headers and with headers
    const t = this.options.headersAffectWidth;
    return this.baseColWidths.map((w, i) => 
      this.lerp(w, this.baseColWidthsWithHeaders[i], t)
    );
  }

  getCellDimensions() {
    const t = this.smoothstep(this.camera.zoom, this.HEATMAP_ZOOM, this.TEXT_ZOOM);
    const heatmapSize = this.minCellSize;
    
    const cellHeight = this.lerp(heatmapSize, this.baseCellHeight, t);
    const effectiveWidths = this.getEffectiveColWidths();
    const colWidths = effectiveWidths.map(w => this.lerp(heatmapSize, w, t));
    
    return { cellHeight, colWidths, t };
  }

  getVisibleRange() {
    if (!this.gridData) return { startRow: 0, endRow: 0, startCol: 0, endCol: 0 };
    
    const { cellHeight, colWidths } = this.getCellDimensions();
    const headerOpacity = this.smoothstep(this.camera.zoom, this.HEATMAP_ZOOM, this.TEXT_ZOOM * 0.8);
    
    const offsetX = headerOpacity > 0.01 ? this.rowNameWidth * this.camera.zoom : 0;
    const offsetY = headerOpacity > 0.01 ? this.headerHeight * this.camera.zoom : 0;
    
    const startRow = Math.max(0, Math.floor(this.camera.y / cellHeight));
    const visibleHeight = (this.canvas.height - offsetY) / this.camera.zoom;
    const endRow = Math.min(this.gridData.rowCount - 1, Math.ceil((this.camera.y + visibleHeight) / cellHeight));
    
    let cumWidth = 0;
    let startCol = 0;
    for (let c = 0; c < colWidths.length; c++) {
      if (cumWidth + colWidths[c] > this.camera.x) {
        startCol = c;
        break;
      }
      cumWidth += colWidths[c];
    }
    
    cumWidth = 0;
    for (let c = 0; c < startCol; c++) cumWidth += colWidths[c];
    
    const visibleWidth = (this.canvas.width - offsetX) / this.camera.zoom;
    let endCol = startCol;
    let widthSoFar = 0;
    for (let c = startCol; c < colWidths.length; c++) {
      widthSoFar += colWidths[c];
      endCol = c;
      if (cumWidth + widthSoFar - this.camera.x > visibleWidth) break;
    }
    endCol = Math.min(endCol, this.gridData.colCount - 1);
    
    return { startRow, endRow, startCol, endCol };
  }

  permutedRow(r) {
    const rowCount = this.gridData.rowCount;
    const k = this.options.reverseRows;
    const splitPoint = Math.floor(k * rowCount);
    return (r < splitPoint) ? (rowCount - 1) - r : r - splitPoint;
  }

  permutedCol(c) {
    const colCount = this.gridData.colCount;
    const k = this.options.reverseCols;
    const splitPoint = Math.floor(k * colCount);
    return (c < splitPoint) ? (colCount - 1) - c : c - splitPoint;
  }

  render() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, width, height);
    
    if (!this.gridData) {
      ctx.fillStyle = '#666';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Load data to begin', width / 2, height / 2);
      return;
    }
    
    const { cellHeight, colWidths, t } = this.getCellDimensions();
    const textOpacity = this.smoothstep(this.camera.zoom, this.HEATMAP_ZOOM, this.TEXT_ZOOM * 0.7);
    const headerOpacity = this.smoothstep(this.camera.zoom, this.HEATMAP_ZOOM, this.TEXT_ZOOM * 0.8);
    
    const offsetX = headerOpacity > 0.01 ? this.rowNameWidth * this.camera.zoom : 0;
    const offsetY = headerOpacity > 0.01 ? this.headerHeight * this.camera.zoom : 0;
    
    const fontSize = Math.max(8, this.baseFontSize * t);
    const effectiveFontSize = fontSize * this.camera.zoom;
    const showText = effectiveFontSize >= 5 && textOpacity > 0.01;
    
    const { startRow, endRow, startCol, endCol } = this.getVisibleRange();

    const isVisible = (row, col) => {
      return (startRow <= row) && (row <= endRow) && (startCol <= col) && (col <= endCol);
    };

    const range = this.gridData.globalRange;
    const distanceMode = this.gridData.rowCount === this.gridData.colCount;
    const reverseCols = this.options.reverseCols > 0.5;
    
    // Calculate column X positions
    const colX = [0];
    for (let c = 0; c < colWidths.length; c++) {
      const displayCol = this.permutedCol(c);
      colX[c + 1] = colX[c] + colWidths[displayCol];
    }
    
    ctx.save();
    
    ctx.beginPath();
    ctx.rect(offsetX, offsetY, width - offsetX, height - offsetY);
    ctx.clip();
    
    ctx.translate(offsetX, offsetY);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);
    
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Effective smooth gradient (blend between stepped and smooth)
    const useSmooth = this.options.smoothGradient > 0.5;
    
    for (let r = startRow; r <= endRow; r++) {
      const displayRow = this.permutedRow( r );
      const y = r * cellHeight;
      
      for (let c = startCol; c <= endCol; c++) {
        const displayCol = this.permutedCol(c);
        const x = colX[c];
        const w = colWidths[displayCol];
        const value = this.gridData.getValue(displayRow, displayCol);
        const isNum = this.gridData.isNumeric(displayRow, displayCol);
        
        // Calculate cell opacity for distance matrix mode
        let cellOpacity = 1;
        if (distanceMode && isNum && displayRow < displayCol) {
          // This is an upper triangle cell with matching mirror
          // Fade based on distanceMatrix slider value
          cellOpacity = 1 - this.options.distanceMatrix;
          if (cellOpacity < 0.01) continue; // Skip if fully transparent
        }
        
        // Background color
        let bgColor = [30, 40, 60];
        let fgColor = [255, 255, 255];
        
        const mode = true;
        if (isNum && mode) {
          const valueColor = ColorEngine.getColor(value, range, this.options.colorScheme, useSmooth);
          // Blend between background and foreground coloring
          const colorTarget = this.options.colorTarget;
          const brightness = (valueColor[0] * 299 + valueColor[1] * 587 + valueColor[2] * 114) / 1000;
          const contrastColor = brightness > 128 ? [0, 0, 0] : [255, 255, 255];
          bgColor = ColorEngine.lerp( valueColor, bgColor, colorTarget )
          fgColor = ColorEngine.lerp( contrastColor, valueColor, colorTarget )
        }

        if( isNum && !mode ){
          const valueColor = ColorEngine.getColor(value, range, this.options.colorScheme, useSmooth);
          // Blend between background and foreground coloring
          const colorTarget = this.options.colorTarget;
          if (colorTarget < 0.5) {
            bgColor = valueColor;
            const brightness = (bgColor[0] * 299 + bgColor[1] * 587 + bgColor[2] * 114) / 1000;
            fgColor = brightness > 128 ? [0, 0, 0] : [255, 255, 255];
          } else {
            fgColor = valueColor;
          }
        }
        
        ctx.globalAlpha = cellOpacity;
        ctx.fillStyle = ColorEngine.toCSS(bgColor);
        ctx.fillRect(x, y, w, cellHeight);

        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1 / this.camera.zoom;
        ctx.strokeRect(x, y, w, cellHeight);
        
        if (showText) {
          ctx.globalAlpha = textOpacity * cellOpacity;
          
          // Blend between text and blob mode
          const blobAmount = this.options.blobMode;
          
          if (blobAmount > 0.01 && isNum) {
            const maxRadius = Math.min(w, cellHeight) / 2 * 0.8;
            const maxAbs = Math.max(Math.abs(range.min), Math.abs(range.max));
            const radius = maxRadius * (Math.abs(value) / (maxAbs || 1));
            
            if (radius > 0.5) {
              // Draw blob with opacity based on blobMode slider
              ctx.globalAlpha = textOpacity * cellOpacity * blobAmount;
              ctx.fillStyle = ColorEngine.toCSS(fgColor);
              ctx.beginPath();
              ctx.arc(x + w / 2, y + cellHeight / 2, radius, 0, Math.PI * 2);
              ctx.fill();
            }
            
            // Draw text with inverse opacity if not fully blob
            if (blobAmount < 0.99) {
              ctx.globalAlpha = textOpacity * cellOpacity * (1 - blobAmount);
              const text = this.formatValue(value);
              const font = `${fontSize}px sans-serif`;
              const displayText = TextUtils.truncate(ctx, text, w - this.cellPadding, font);
              if (displayText) {
                ctx.fillStyle = ColorEngine.toCSS(fgColor);
                ctx.fillText(displayText, x + w / 2, y + cellHeight / 2);
              }
            }
          } else {
            // Text only mode
            const text = this.formatValue(value);
            const font = `${fontSize}px sans-serif`;
            const displayText = TextUtils.truncate(ctx, text, w - this.cellPadding, font);
            
            if (displayText) {
              ctx.fillStyle = ColorEngine.toCSS(fgColor);
              ctx.fillText(displayText, x + w / 2, y + cellHeight / 2);
            }
          }
        }
        
        ctx.globalAlpha = 1;
      }
    }
    
    ctx.restore();
    
    // Draw sticky headers
    if (headerOpacity > 0.01) {
      ctx.globalAlpha = headerOpacity;
      
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(offsetX, 0, width - offsetX, offsetY);
      ctx.fillRect(0, offsetY, offsetX, height - offsetY);
      ctx.fillRect(0, 0, offsetX, offsetY);
      
      // Column headers
      ctx.save();
      ctx.beginPath();
      ctx.rect(offsetX, 0, width - offsetX, offsetY);
      ctx.clip();
      
      ctx.translate(offsetX, 0);
      ctx.scale(this.camera.zoom, this.camera.zoom);
      ctx.translate(-this.camera.x, 0);
      
      const headerFontSize = Math.max(8, 12 * t);
      ctx.font = `${headerFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ccc';
      
      for (let c = startCol; c <= endCol; c++) {
        const displayCol = this.permutedCol(c);
        const x = colX[c];
        const w = colWidths[displayCol];
        const name = this.gridData.getColName(displayCol);
        const font = `${headerFontSize}px sans-serif`;
        const displayText = TextUtils.truncate(ctx, name, w - 4, font);
        if (displayText) {
          ctx.fillText(displayText, x + w / 2, this.headerHeight / 2);
        }
      }
      ctx.restore();
      
      // Row names
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, offsetY, offsetX, height - offsetY);
      ctx.clip();
      
      ctx.translate(0, offsetY);
      ctx.scale(this.camera.zoom, this.camera.zoom);
      ctx.translate(0, -this.camera.y);
      
      ctx.font = `${headerFontSize}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ccc';
      
      for (let r = startRow; r <= endRow; r++) {
        const y = r * cellHeight;
        const displayRow = this.permutedRow( r );
        const name = this.gridData.getRowName(displayRow);
        const font = `${headerFontSize}px sans-serif`;
        const displayText = TextUtils.truncate(ctx, name, this.rowNameWidth - 8, font);
        if (displayText) {
          ctx.fillText(displayText, this.rowNameWidth - 4, y + cellHeight / 2);
        }
      }
      ctx.restore();
      
      ctx.globalAlpha = 1;
    }
  }

  pan(dx, dy) {
    this.camera.x -= dx / this.camera.zoom;
    this.camera.y -= dy / this.camera.zoom;
    this.clampCamera();
  }

  zoomAt(factor, px, py) {
    const { cellHeight, colWidths } = this.getCellDimensions();
    const headerOpacity = this.smoothstep(this.camera.zoom, this.HEATMAP_ZOOM, this.TEXT_ZOOM * 0.8);
    const offsetX = headerOpacity > 0.01 ? this.rowNameWidth * this.camera.zoom : 0;
    const offsetY = headerOpacity > 0.01 ? this.headerHeight * this.camera.zoom : 0;
    
    const wx = (px - offsetX) / this.camera.zoom + this.camera.x;
    const wy = (py - offsetY) / this.camera.zoom + this.camera.y;
    
    const oldZoom = this.camera.zoom;
    const oldX = this.camera.x;
    const oldY = this.camera.y;
    
    const zoomToFit = this.getZoomToFit();
    const minZoom = zoomToFit / 2;
    const maxZoom = 2.0;
    this.camera.zoom = Math.max(minZoom, Math.min(maxZoom, this.camera.zoom * factor));
    
    const newHeaderOpacity = this.smoothstep(this.camera.zoom, this.HEATMAP_ZOOM, this.TEXT_ZOOM * 0.8);
    const newOffsetX = newHeaderOpacity > 0.01 ? this.rowNameWidth * this.camera.zoom : 0;
    const newOffsetY = newHeaderOpacity > 0.01 ? this.headerHeight * this.camera.zoom : 0;
    
    this.camera.x = wx - (px - newOffsetX) / this.camera.zoom;
    this.camera.y = wy - (py - newOffsetY) / this.camera.zoom;
    
    if (this.options.constrainZoomOut && factor < 1) {
      const preClampX = this.camera.x;
      const preClampY = this.camera.y;
      this.clampCamera();
      
      if (this.camera.x !== preClampX || this.camera.y !== preClampY) {
        this.camera.zoom = oldZoom;
        this.camera.x = oldX;
        this.camera.y = oldY;
        return;
      }
    } else {
      this.clampCamera();
    }
  }

  clampCamera() {
    this.camera.x = Math.max(0, this.camera.x);
    this.camera.y = Math.max(0, this.camera.y);
  }

  getCellDimensionsAtZoom(zoom) {
    const t = this.smoothstep(zoom, this.HEATMAP_ZOOM, this.TEXT_ZOOM);
    const heatmapSize = this.minCellSize;
    
    const cellHeight = this.lerp(heatmapSize, this.baseCellHeight, t);
    const effectiveWidths = this.getEffectiveColWidths();
    const colWidths = effectiveWidths.map(w => this.lerp(heatmapSize, w, t));
    
    return { cellHeight, colWidths, t };
  }

  getZoomToFit() {
    if (!this.gridData || this.baseColWidths.length === 0) return 1.0;
    
    const availableWidth = this.canvas.width - this.rowNameWidth;
    const availableHeight = this.canvas.height - this.headerHeight;
    
    let lo = 0.001, hi = 2.0;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      const dims = this.getCellDimensionsAtZoom(mid);
      const totalWidth = dims.colWidths.reduce((a, b) => a + b, 0);
      const totalHeight = this.gridData.rowCount * dims.cellHeight;
      const renderedWidth = totalWidth * mid;
      const renderedHeight = totalHeight * mid;
      
      if (renderedWidth <= availableWidth && renderedHeight <= availableHeight) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  setZoom(zoom) {
    const zoomToFit = this.getZoomToFit();
    const minZoom = zoomToFit / 2;
    const maxZoom = 2.0;
    this.camera.zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    this.clampCamera();
  }

  getZoomRange() {
    const zoomToFit = this.getZoomToFit();
    return {
      min: zoomToFit / 2,
      max: 2.0
    };
  }
}

// ============================================================
// PRESETS
// ============================================================

const OMNIGRID_PRESETS = {
  'Standard': {
    distanceMatrix: 0.0,
    reverseRows: 0.0,
    reverseCols: 0.0,
    headersAffectWidth: 0,
    colorTarget: 0,
    smoothGradient: 1,
    blobMode: 0,
    decimalPlaces: 2
  },
  'Heatmap': {
    distanceMatrix: 0.0,
    reverseRows: 0.0,
    reverseCols: 0.0,
    headersAffectWidth: 0,
    colorTarget: 0,
    smoothGradient: 1,
    blobMode: 0,
    decimalPlaces: 0
  },
  'Inverse': {
    distanceMatrix: 0.0,
    reverseRows: 0.0,
    reverseCols: 0.0,
    headersAffectWidth: 0,
    colorTarget: 1,
    smoothGradient: 1,
    blobMode: 0,
    decimalPlaces: 2
  },
  'Bubble': {
    distanceMatrix: 0.0,
    reverseRows: 0.0,
    reverseCols: 0.0,
    headersAffectWidth: 0,
    colorTarget: 0,
    smoothGradient: 1,
    blobMode: 1,
    decimalPlaces: 2
  },
  'Distance': {
    distanceMatrix: 0.4,
    reverseRows: 1.0,
    reverseCols: 0.0,
    headersAffectWidth: 1,
    colorTarget: 0,
    smoothGradient: 1,
    blobMode: 0,
    decimalPlaces: 0
  }
};

// Export for global scope
if (typeof window !== 'undefined') {
  window.GridData = GridData;
  window.CSVData = CSVData;
  window.FunctionData = FunctionData;
  window.SampleGenerators = SampleGenerators;
  window.ColorEngine = ColorEngine;
  window.TextUtils = TextUtils;
  window.GridRenderer = GridRenderer;
  window.OMNIGRID_PRESETS = OMNIGRID_PRESETS;
}