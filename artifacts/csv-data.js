
// ============================================================
// GRID DATA CLASSES
// ============================================================

class GridData {
  constructor(rowCount, colCount) {
    this.rowCount = rowCount;
    this.colCount = colCount;
    this._globalRange = null;
  }

  getValue(row, col) { throw new Error('Abstract method'); }
  getRowName(row) { return String(row + 1); }
  getColName(col) { return String(col + 1); }
  isNumeric(row, col) { return typeof this.getValue(row, col) === 'number'; }
  hasRowNames() { return false; }

  get globalRange() {
    if (!this._globalRange) {
      this._globalRange = this.computeGlobalRange();
    }
    return this._globalRange;
  }

  computeGlobalRange() {
    let min = Infinity, max = -Infinity;
    const sampleSize = Math.min(10000, this.rowCount * this.colCount);
    const step = Math.max(1, Math.floor((this.rowCount * this.colCount) / sampleSize));
    
    for (let i = 0; i < sampleSize; i++) {
      const idx = i * step;
      const r = Math.floor(idx / this.colCount);
      const c = idx % this.colCount;
      if (r < this.rowCount && this.isNumeric(r, c)) {
        const v = this.getValue(r, c);
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    return { min: min === Infinity ? 0 : min, max: max === -Infinity ? 0 : max };
  }
}

/**
 * CSV Data Parser - Reusable CSV parsing utilities
 */

class CSVData extends GridData {
  constructor(rawText) {
    const lines = rawText.trim().split(/\r?\n/);
    const parsed = lines.map(line => CSVData.parseCSVLine(line));
    
    if (parsed.length === 0) throw new Error('Empty CSV');
    
    const colNames = parsed[0];
    const dataRows = parsed.slice(1);
    
    // Auto-detect row names (non-numeric first column)
    let hasRowNames = false;
    if (dataRows.length > 0 && dataRows[0].length > 0) {
      hasRowNames = dataRows.every(row => row[0] && isNaN(parseFloat(row[0])));
    }
    
    const rowNames = hasRowNames ? dataRows.map(row => row[0]) : dataRows.map((_, i) => String(i + 1));
    const dataStartCol = hasRowNames ? 1 : 0;
    const actualColNames = hasRowNames ? colNames.slice(1) : colNames;
    
    const data = dataRows.map(row => {
      return row.slice(dataStartCol).map(cell => {
        const num = parseFloat(cell);
        return isNaN(num) ? cell : num;
      });
    });
    
    const rowCount = data.length;
    const colCount = data[0]?.length || 0;
    
    super(rowCount, colCount);
    
    // Store all properties for OmniGrid compatibility
    this.rowCount = rowCount;
    this.colCount = colCount;
    this._data = data;
    this._rowNames = rowNames;
    this._colNames = actualColNames;
    this._hasRowNames = hasRowNames;
    this._isNumeric = data.map(row => row.map(cell => typeof cell === 'number'));
    this._globalRange = null;
    
    // Also store simple accessors for OmniCard
    this.headers = colNames;
    this.rows = dataRows;
  }

  static parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // OmniGrid methods
  getValue(row, col) { return this._data[row]?.[col]; }
  getRowName(row) { return this._rowNames[row] || String(row + 1); }
  getColName(col) { return this._colNames[col] || String(col + 1); }
  isNumeric(row, col) { return this._isNumeric[row]?.[col] ?? false; }
  hasRowNames() { return this._hasRowNames; }

  get globalRange() {
    if (!this._globalRange) {
      this._globalRange = this.computeGlobalRange();
    }
    return this._globalRange;
  }

  computeGlobalRange() {
    let min = Infinity, max = -Infinity;
    for (let r = 0; r < this.rowCount; r++) {
      for (let c = 0; c < this.colCount; c++) {
        if (this._isNumeric[r][c]) {
          const v = this._data[r][c];
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
    }
    return { min: min === Infinity ? 0 : min, max: max === -Infinity ? 0 : max };
  }

  // OmniCard methods
  getRow(index) {
    return this.rows[index];
  }

  getCell(row, col) {
    return this.rows[row]?.[col] || '';
  }
}

// Export for global scope
if (typeof window !== 'undefined') {
  window.CSVData = CSVData;
}


class FunctionData extends GridData {
  constructor(rowCount, colCount, valueFn, options = {}) {
    super(rowCount, colCount);
    this._valueFn = valueFn;
    this._rowNameFn = options.rowNameFn || (r => String(r + 1));
    this._colNameFn = options.colNameFn || (c => String(c + 1));
    this._knownRange = options.range || null;
  }

  getValue(row, col) { return this._valueFn(row, col); }
  getRowName(row) { return this._rowNameFn(row); }
  getColName(col) { return this._colNameFn(col); }
  isNumeric() { return true; }
  hasRowNames() { return true; }

  computeGlobalRange() {
    return this._knownRange || super.computeGlobalRange();
  }
}