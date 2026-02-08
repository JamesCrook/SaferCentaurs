/* ============================================
   OmniChart - Unified Charting Engine
   ============================================
   
   Includes:
   - OmniChart: Core rendering engine with presets
*/

// ============================================================
// OmniChart Core Engine
// ============================================================

const OmniChart = (function() {
  
  const COLORS = ['#4fc3f7', '#81c784', '#ffb74d', '#f06292', '#ba68c8', '#4db6ac', '#fff176', '#a1887f'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const PRODUCTS = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
  const NUM_PRODUCTS = 5;
  
  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  const generateData = (numCategories) => {
    const labels = MONTHS.slice(0, numCategories);
    const series = [];
    for (let s = 0; s < NUM_PRODUCTS; s++) {
      const values = [];
      for (let c = 0; c < numCategories; c++) {
        values.push(15 + Math.floor(seededRandom(s * 100 + c * 7 + 42) * 40));
      }
      series.push({ name: PRODUCTS[s], values });
    }
    return { labels, series };
  };
  
  const svgNS = 'http://www.w3.org/2000/svg';
  const createElement = (tag) => document.createElementNS(svgNS, tag);
  
  const getDrawOrder = (focusProduct, numProducts) => {
    const order = [];
    for (let p = 0; p < numProducts; p++) {
      order.push((focusProduct - 1 + p) % NUM_PRODUCTS);
    }
    return order;
  };
  
  const calcAllSegments = (data, params) => {
    const { stack, normalize, focusProduct, numProducts } = params;
    const numCats = data.labels.length;
    const drawOrder = getDrawOrder(focusProduct, numProducts);
    
    const useAllForNorm = numProducts === 1 || numProducts === NUM_PRODUCTS;
    const normIndices = useAllForNorm ? [0, 1, 2, 3, 4] : drawOrder;
    
    const categoryTotals = data.labels.map((_, i) => 
      normIndices.reduce((sum, idx) => sum + data.series[idx].values[i], 0)
    );
    const maxTotal = Math.max(...categoryTotals);
    const maxSingle = Math.max(...drawOrder.flatMap(idx => data.series[idx].values));
    
    const result = [];
    
    for (let i = 0; i < numCats; i++) {
      const catSegs = [];
      let stackedY = 0;
      
      for (const origIdx of drawOrder) {
        const rawValue = data.series[origIdx].values[i];
        const normVal = categoryTotals[i] > 0 ? rawValue / categoryTotals[i] : 0;
        const rawScaled = rawValue / maxTotal;
        const singleScaled = rawValue / maxSingle;
        const value = lerp(rawScaled, normVal, normalize);
        const valueOverlay = lerp(singleScaled, normVal, normalize);
        
        const y0 = lerp(0, stackedY, stack);
        const y1 = lerp(valueOverlay, stackedY + value, stack);
        
        catSegs.push({ origIdx, y0, y1, rawValue, color: COLORS[origIdx % COLORS.length] });
        stackedY += value;
      }
      result.push(catSegs);
    }
    return result;
  };
  
  const calcUnifiedGeometry = (allSegs, data, params, bounds, panZoom) => {
    const { bend, bendStack, gridiness, rotation, categoryRotation, segmentWidth, segmentGap, baseline, alignment, zoom, flatness } = params;
    const numCats = data.labels.length;
    const scale = Math.pow(2, zoom - 1);
    
    const maxHeights = allSegs.map(segs => Math.max(...segs.map(s => s.y1)));
    const globalMax = Math.max(...maxHeights);
    
    const geometries = [];
    
    const chartCenter = V.create(bounds.cx + panZoom.panX, bounds.cy + panZoom.panY);
    const chartW = bounds.width * scale;
    const chartH = bounds.height * scale;
    
    const cols = Math.ceil(Math.sqrt(numCats * 1.5));
    const rows = Math.ceil(numCats / cols);
    const cellW = chartW / cols;
    const cellH = chartH / rows;
    const gridTopLeft = V.create(chartCenter.x - cellW * cols / 2, chartCenter.y - cellH * rows / 2);
    
    const barTopLeft = V.create(chartCenter.x - chartW / 2, chartCenter.y - chartH / 2);
    const bandW = chartW / numCats;
    const barW = bandW * Math.max(0.001, segmentWidth) * (1 - segmentGap);
    
    const radialMaxR = Math.min(chartW, chartH) / 2 * 0.85;
    const radialRange = chartH;
    const radialMinR = chartH / 2;
    
    const donutR = Math.min(bandW, chartH) * 0.4;
    const pieR = Math.min(cellW, cellH) * 0.38;
    const donutInnerRatio = 1 - Math.max(0.05, segmentWidth);
    const donutGapAngle = segmentGap * 0.1;
    
    const baselineArcR = Math.min(chartW, chartH) / 2 * 0.5;
    const bendBlend = Math.min(1, bend / (Math.PI * 2));
    
    const effBend = Math.max(bend, 0.0001);
    const fullSliceAngle = effBend / numCats;
    const sliceAngle = fullSliceAngle * segmentWidth * (1 - segmentGap);
    
    for (let i = 0; i < numCats; i++) {
      const alignShift = alignment * (globalMax - maxHeights[i]);
      
      const barCatX = barTopLeft.x + (i + 0.5) * bandW;
      const barCatPosUnrotated = V.create(barCatX, chartCenter.y);
      const barCatPos = V.rotate(barCatPosUnrotated, chartCenter, categoryRotation);
      
      const catBaseAngle = -Math.PI / 2 + rotation + categoryRotation;
      const catAngle = catBaseAngle - (effBend / 2) + (i + 0.5) * fullSliceAngle;
      const radialCatPos = V.addPolar(chartCenter, baselineArcR, catAngle);
      
      const baselineCatPos = V.lerp(barCatPos, radialCatPos, bendBlend);
      
      const col = i % cols;
      const row = Math.floor(i / cols);
      const gridCatPos = V.create(
        gridTopLeft.x + (col + 0.5) * cellW,
        gridTopLeft.y + (row + 0.5) * cellH
      );
      
      const catCenter = V.lerp(baselineCatPos, gridCatPos, gridiness);
      
      const currentDonutR = lerp(donutR, pieR, gridiness);
      const currentDonutInnerR = currentDonutR * donutInnerRatio;
      
      for (const seg of allSegs[i]) {
        const next = allSegs[(i + 1)%numCats]?.find(s => s.origIdx === seg.origIdx);
        
        const y1L = seg.y1;
        const y0L = seg.y0;
        const y1R = lerp(next ? next.y1 : seg.y1, seg.y1, flatness);
        const y0R = lerp(next ? next.y0 : seg.y0, seg.y0, flatness);
        
        const toYBar = v => barTopLeft.y + chartH * (1 - (v + alignShift - baseline + 0.5));
        const halfBarW = barW / 2;
        
        const baselineSpineR = (radialMinR + (baseline - 0.5) * radialRange) * 0.5;
        const bendAngularSpan = bend;
        const barBaselineLength = chartW;
        const radialBaselineLength = 2 * Math.PI * baselineSpineR;
        const baselineArcLength = lerp(barBaselineLength, radialBaselineLength, bendBlend);
        
        const minBendAngularSpan = 0.0001;
        const bendSpineR = baselineArcLength / Math.max(bendAngularSpan, minBendAngularSpan);
        const bendCenterOffset = bendSpineR - baselineSpineR;
        const bendArcCenter = V.create(chartCenter.x, chartCenter.y + bendCenterOffset);
        const rotatedBendArcCenter = V.rotate(bendArcCenter, chartCenter, rotation + categoryRotation);
        
        const bendBaseAngle = -Math.PI / 2 + rotation + categoryRotation;
        const catCenterAngle = bendBaseAngle - (bend / 2) + (i + 0.5) * fullSliceAngle;
        const bendSliceAngle = fullSliceAngle * segmentWidth * (1 - segmentGap);
        const bendAStart = catCenterAngle - bendSliceAngle / 2;
        const bendAEnd = catCenterAngle + bendSliceAngle / 2;
        
        const heightScale = lerp(chartH, radialRange * 0.25, bendBlend);
        const baseShift = 1.5 * baseline * (1 - bendBlend);
        const h0L = (y0L + alignShift - baseShift) * heightScale;
        const h1L = (y1L + alignShift - baseShift) * heightScale;
        const h0R = (y0R + alignShift - baseShift) * heightScale;
        const h1R = (y1R + alignShift - baseShift) * heightScale;
        
        const r0L = bendSpineR + h0L;
        const r1L = bendSpineR + h1L;
        const r0R = bendSpineR + h0R;
        const r1R = bendSpineR + h1R;
        
        const sharedCorners = bend < 0.001 ? [
          V.rotate(V.create(barCatX - halfBarW, toYBar(y0L)), chartCenter, rotation + categoryRotation),
          V.rotate(V.create(barCatX + halfBarW, toYBar(y0R)), chartCenter, rotation + categoryRotation),
          V.rotate(V.create(barCatX + halfBarW, toYBar(y1R)), chartCenter, rotation + categoryRotation),
          V.rotate(V.create(barCatX - halfBarW, toYBar(y1L)), chartCenter, rotation + categoryRotation)
        ] : [
          V.addPolar(rotatedBendArcCenter, r0L, bendAStart),
          V.addPolar(rotatedBendArcCenter, r0R, bendAEnd),
          V.addPolar(rotatedBendArcCenter, r1R, bendAEnd),
          V.addPolar(rotatedBendArcCenter, r1L, bendAStart)
        ];
        
        const donutSpineR = (currentDonutR + currentDonutInnerR) / 2;
        const donutHalfThick = (currentDonutR - currentDonutInnerR) / 2;
        
        const barUpDir = rotation + categoryRotation - Math.PI / 2;
        const barRightDir = rotation + categoryRotation;
        
        const targetAngularSpan = bendStack * 2 * Math.PI;
        const barArcLength = chartH;
        const donutArcLength = 2 * Math.PI * donutSpineR;
        const arcLength = lerp(barArcLength, donutArcLength, bendStack);
        
        const minAngularSpan = 0.0001;
        const spineR = arcLength / Math.max(targetAngularSpan, minAngularSpan);
        const centerOffset = spineR - donutSpineR;
        const localArcCenter = V.addPolar(catCenter, centerOffset, barRightDir);
        
        const halfThick = lerp(halfBarW, donutHalfThick, bendStack);
        const outerR = spineR + halfThick;
        const innerR = spineR - halfThick;
        
        const baseAngle = barRightDir + Math.PI;
        const gapAngle = lerp(0, donutGapAngle, bendStack);
        
        const v0 = seg.y0 + alignShift;
        const v1 = seg.y1 + alignShift;
        
        const theta0 = baseAngle + (v0 - 0.5) * targetAngularSpan + gapAngle / 2;
        const theta1 = baseAngle + (v1 - 0.5) * targetAngularSpan - gapAngle / 2;
        
        const donutCorners = [
          V.addPolar(localArcCenter, outerR, theta0),
          V.addPolar(localArcCenter, innerR, theta0),
          V.addPolar(localArcCenter, innerR, theta1),
          V.addPolar(localArcCenter, outerR, theta1)
        ];
        
        const corners = sharedCorners.map((sc, idx) => V.lerp(sc, donutCorners[idx], bendStack));
        
        if (V.dist(corners[0], corners[1]) < 0.5 && V.dist(corners[2], corners[3]) < 0.5) continue;
        
        const edgeBendH = bendSliceAngle;
        const stackAngularSpan = (v1 - v0) * -targetAngularSpan;
        
        const bends = [
          -edgeBendH,
          stackAngularSpan,
          edgeBendH,
          -stackAngularSpan
        ];
        
        geometries.push({
          type: 'warpedpoly',
          corners,
          bends: bends.map(b => b * params.curviness),
          color: seg.color
        });
      }
      
      const barLabelPos = V.rotate(V.create(barCatX, barTopLeft.y + chartH + 20), chartCenter, rotation + categoryRotation);
      const radialLabelPos = V.addPolar(chartCenter, radialMaxR + 15, catAngle);
      const sharedLabelPos = V.lerp(barLabelPos, radialLabelPos, bendBlend);
      
      const donutLabelPos = V.create(catCenter.x, catCenter.y + currentDonutR + 15);
      const labelPos = V.lerp(sharedLabelPos, donutLabelPos, bendStack);
      
      geometries.push({
        type: 'label',
        x: labelPos.x,
        y: labelPos.y,
        text: data.labels[i],
        rotation: bendStack < 0.5 ? rotation + categoryRotation : 0,
        angle: bendBlend > 0.5 && bendStack < 0.5 ? catAngle : undefined
      });
    }
    
    return geometries;
  };
  
  const renderGeometries = (group, geoms, params) => {
    const { fillOpacity, strokeWidth, topWidth } = params;
    
    for (const g of geoms) {
      if (g.type === 'warpedpoly') {
        const pathD = WarpedPolygon.path(g.corners, g.bends);
        
        const path = createElement('path');
        path.setAttribute('d', pathD);
        path.setAttribute('fill', g.color);
        path.setAttribute('fill-opacity', g.opacity ?? fillOpacity);
        if (strokeWidth > 0) {
          path.setAttribute('stroke', g.color);
          path.setAttribute('stroke-width', strokeWidth);
        }
        group.appendChild(path);
        
        if (topWidth > 0) {
          const topD = WarpedPolygon.topPath(g.corners, g.bends);
          const topPath = createElement('path');
          topPath.setAttribute('d', topD);
          topPath.setAttribute('stroke', g.color);
          topPath.setAttribute('stroke-width', topWidth);
          topPath.setAttribute('stroke-linecap', 'round');
          topPath.setAttribute('fill', 'none');
          topPath.setAttribute('opacity', g.opacity ?? 1);
          group.appendChild(topPath);
        }
      } else if (g.type === 'label') {
        const text = createElement('text');
        text.setAttribute('x', g.x);
        text.setAttribute('y', g.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#888');
        text.setAttribute('font-size', '11px');
        if (g.opacity !== undefined) text.setAttribute('opacity', g.opacity);
        
        let textRot = 0;
        if (g.angle !== undefined) {
          let deg = (g.angle * 180 / Math.PI) % 360;
          if (deg < 0) deg += 360;
          textRot = (deg > 90 && deg < 270) ? deg + 180 : deg;
        } else if (g.rotation !== undefined && g.rotation !== 0) {
          let deg = (g.rotation * 180 / Math.PI) % 360;
          if (deg < 0) deg += 360;
          textRot = (deg >= 67.5 && deg < 112.5) ? -90 : (deg >= 247.5 && deg < 292.5) ? 90 : 0;
        }
        
        if (textRot !== 0) {
          text.setAttribute('transform', `rotate(${textRot}, ${g.x}, ${g.y})`);
        }
        
        text.textContent = g.text;
        group.appendChild(text);
      }
    }
  };
  
  const render = (svg, data, params, panZoom = { panX: 0, panY: 0 }) => {
    const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
    const width = viewBox[2];
    const height = viewBox[3];
    
    svg.innerHTML = '';
    
    const bounds = { cx: width / 2, cy: height / 2, width: width - 100, height: height - 100 };
    const mainGroup = createElement('g');
    
    const allSegs = calcAllSegments(data, params);
    const geoms = calcUnifiedGeometry(allSegs, data, params, bounds, panZoom);
    renderGeometries(mainGroup, geoms, params);
    
    svg.appendChild(mainGroup);
  };
  
  const PRESETS = {
    'Stacked': {
      bend: 0, bendStack: 0, gridiness: 0, rotation: 0, categoryRotation: 0, segmentWidth: 0.8, segmentGap: 0.08,
      flatness: 1, stack: 1, baseline: 0.5, alignment: 0, curviness: 0,
      normalize: 0, fillOpacity: 1, strokeWidth: 0, topWidth: 0, zoom: 1
    },
    'Stream Graph': {
      bend: 0, bendStack: 0, gridiness: 0, rotation: 0, categoryRotation: 0, segmentWidth: 1, segmentGap: 0,
      flatness: 0, stack: 1, baseline: 0.5, alignment: 0, curviness: 0,
      normalize: 0, fillOpacity: 0.9, strokeWidth: 0, topWidth: 0, zoom: 1
    },
    'Area Chart': {
      bend: 0, bendStack: 0, gridiness: 0, rotation: 0, categoryRotation: 0, segmentWidth: 1, segmentGap: 0,
      flatness: 0, stack: 1, baseline: 0.5, alignment: 0, curviness: 0,
      normalize: 0, fillOpacity: 0.7, strokeWidth: 0, topWidth: 1, zoom: 1
    },
    'Line Chart': {
      bend: 0, bendStack: 0, gridiness: 0, rotation: 0, categoryRotation: 0, segmentWidth: 1, segmentGap: 0,
      flatness: 0, stack: 0, baseline: 0.5, alignment: 0, curviness: 0,
      normalize: 0, fillOpacity: 0.06, strokeWidth: 0, topWidth: 2.5, zoom: 1
    },
    'Bar Chart': {
      bend: 0, bendStack: 0, gridiness: 0, rotation: 0, categoryRotation: 0, segmentWidth: 0.92, segmentGap: 0,
      flatness: 1, stack: 0, baseline: 0.5, alignment: 0, curviness: 0,
      normalize: 0, fillOpacity: 0.1, strokeWidth: 1, topWidth: 3, zoom: 1
    },
    'Horizontal Bar': {
      bend: 0, bendStack: 0, gridiness: 0, rotation: 1.5708, categoryRotation: 0, segmentWidth: 0.8, segmentGap: 0.08,
      flatness: 1, stack: 1, baseline: 0.5, alignment: 0, curviness: 0,
      normalize: 0, fillOpacity: 1, strokeWidth: 0, topWidth: 0, zoom: 1
    },
    'Spider': {
      bend: 6.283, bendStack: 0, gridiness: 0, rotation: 0, categoryRotation: 0, segmentWidth: 1.0, segmentGap: 0.02,
      flatness: 0, stack: 1, baseline: 0.3, alignment: 0, curviness: 0,
      normalize: 0, fillOpacity: 0.15, strokeWidth: 0.5, topWidth: 2, zoom: 1
    },
    'Radial Bar': {
      bend: 6.283, bendStack: 0, gridiness: 0, rotation: 0, categoryRotation: 0, segmentWidth: 1.0, segmentGap: 0.02,
      flatness: 1, stack: 1, baseline: 0.3, alignment: 0, curviness: 1,
      normalize: 0, fillOpacity: 0.8, strokeWidth: 0.5, topWidth: 0, zoom: 1
    },
    'Radial Line': {
      bend: 6.283, bendStack: 0, gridiness: 0, rotation: 0, categoryRotation: 0, segmentWidth: 1.0, segmentGap: 0.02,
      flatness: 0, stack: 0, baseline: 0.3, alignment: 0, curviness: 0,
      normalize: 0, fillOpacity: 0, strokeWidth: 0.5, topWidth: 2.5, zoom: 1
    },
    'Donut Row': {
      bend: 0, bendStack: 1, gridiness: 0, rotation: 0, categoryRotation: 0, segmentWidth: 0.5, segmentGap: 0.15,
      flatness: 0, stack: 1, baseline: 0.5, alignment: 0, curviness: 1,
      normalize: 1, fillOpacity: 1, strokeWidth: 0, topWidth: 0, zoom: 1
    },
    'Donut Ring': {
      bend: 6.283, bendStack: 1, gridiness: 0, rotation: 0, categoryRotation: 0, segmentWidth: 0.5, segmentGap: 0.15,
      flatness: 0, stack: 1, baseline: 0.5, alignment: 0, curviness: 1,
      normalize: 1, fillOpacity: 1, strokeWidth: 0, topWidth: 0, zoom: 1
    },
    'Donut Chart': {
      bend: 0, bendStack: 1, gridiness: 1, rotation: 0, categoryRotation: 0, segmentWidth: 0.5, segmentGap: 0.15,
      flatness: 0, stack: 1, baseline: 0.5, alignment: 0, curviness: 1,
      normalize: 1, fillOpacity: 1, strokeWidth: 0, topWidth: 0, zoom: 1
    },
    'Pie Chart': {
      bend: 0, bendStack: 1, gridiness: 1, rotation: 0, categoryRotation: 0, segmentWidth: 1, segmentGap: 0,
      flatness: 0, stack: 1, baseline: 0.5, alignment: 0, curviness: 1,
      normalize: 1, fillOpacity: 0.5, strokeWidth: 1, topWidth: 0, zoom: 1
    }
  };
  
  return { render, generateData, PRESETS, COLORS, NUM_PRODUCTS, PRODUCTS, getDrawOrder };
})();

// Export for use in modules or global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { V, lerp, WarpedPolygon, OmniChart };
} else if (typeof window !== 'undefined') {
  window.V = V;
  window.lerp = lerp;
  window.WarpedPolygon = WarpedPolygon;
  window.OmniChart = OmniChart;
}