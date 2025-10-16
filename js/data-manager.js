/**
 * Data Manager - Extensible Observable Data Management System
 * 
 * This module provides a flexible, plugin-based data management system with observer
 * pattern support. The core BaseDataManager class handles generic data storage,
 * retrieval, and change notifications, while specialized plugins extend functionality
 * for specific domain use cases.
 * 
 * Key Features:
 * - Observable data store with subscription-based change notifications
 * - Dot-notation path support for nested data access (e.g., 'user.profile.name')
 * - Plugin system for adding domain-specific functionality
 * - Built-in plugins for tabular data (TablePlugin) and geographic/world data (WorldPlugin)
 * 
 * Core Components:
 * - BaseDataManager: Generic observable data container with get/set/update operations
 * - TablePlugin: Adds spreadsheet-like functionality (cell updates, row management, JSON conversion)
 * - WorldPlugin: Adds geographic data handling (nodes, connections, coordinate conversion)
 * - Registry: Global shared data manager instance for UI state management
 * 
 * Common Use Cases:
 * - Managing application state with change notifications
 * - Building reactive data-driven UI components
 * - Handling tabular data for spreadsheet-like applications
 * - Managing geographic/mapping data with waypoints and connections
 * - Centralized state management across multiple application components
 * 
 * Factory functions (createTableManager, createWorldManager, createRegistry) provide
 * convenient ways to instantiate preconfigured data managers for specific use cases.
 */

/**
 * This is a model in MVC
 *
 * Base Data Manager - Core functionality for all data management
 * It is used especially for plug in managers.
 * The main feature is that you can subscribe for changes
 * @class
 */
class BaseDataManager {
  /**
   * @param {Object} [initialData={}] - The initial data for the manager.
   */
  constructor(initialData = {}) {
    this._data = initialData;
    this._listeners = new Set();
    this._plugins = new Map();
  }

  /**
   * Core data access
   * @param {string} path - The path to the data to get.
   * @returns {*} The data at the given path.
   */
  get(path) {
    if(typeof path === 'string' && path.includes('.')) {
      return this._getByPath(path);
    }
    return this._data[path] || this._data;
  }

  // this is used to insist the item exists.
  get2(path) {
    return this._data[path];
  }

  /**
   * Sets data at a given path.
   * @param {string|Object|null|undefined} path - The path to set data at, or an object to merge, or null/undefined to merge at the root.
   * @param {*} [value] - The value to set.
   * @param {boolean} [notify=true] - Whether to notify listeners of the change.
   * @returns {BaseDataManager} The BaseDataManager instance.
   */
  set(path, value, notify = true) {
    if(typeof path === 'string' && path.includes('.')) {
      this._setByPath(path, value);
    } else if(typeof path === 'object' && path !== null) {
      // Bulk update - path raplaces data
      this._data = {};
      Object.assign(this._data, path);
    } else if(path === null || path === undefined) {
      // Root level update - value is the object to merge
      Object.assign(this._data, value);
    } else {
      this._data[path] = value;
    }

    if(notify) this._notifyListeners('set', {
      path,
      value
    });
    return this;
  }

  /**
   * Updates data at a given path.
   * @param {string} path - The path to update data at.
   * @param {Object} props - The properties to update.
   * @param {boolean} [notify=true] - Whether to notify listeners of the change.
   * @returns {BaseDataManager} The BaseDataManager instance.
   */
  update(path, props, notify = true) {
    const current = this.get(path);
    if(typeof current === 'object' && current !== null) {
      const updated = {
        ...current,
        ...props
      };
      this.set(path, updated, notify);
    }
    return this;
  }

  /**
   * Plugin system to add domain-specific functions
   * @param {string} name - The name of the feature.
   * @param {Object} plugin - The plugin to add.
   * @returns {BaseDataManager} The BaseDataManager instance.
   */
  addFeature(name, plugin) {
    this._plugins.set(name, plugin);
    if(typeof plugin.install === 'function') {
      plugin.install(this);
    }
    return this;
  }

  /**
   * Gets a plugin by name.
   * @param {string} name - The name of the plugin to get.
   * @returns {Object} The plugin.
   */
  plugin(name) {
    return this._plugins.get(name);
  }

  /**
   * Observer pattern
   * @param {function} listener - The listener to subscribe.
   * @returns {function} A function to unsubscribe the listener.
   */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /**
   * Universal add method - intelligently handles different types
   * @param {string} what - The name of the thing to add.
   * @param {*} thing - The thing to add.
   * @returns {BaseDataManager} The BaseDataManager instance.
   */
  add(what, thing) {
    debugger;
    if(typeof thing === 'function' && thing.prototype) {
      // It's a class - instantiate it
      this.set(what, new thing());
    } else if(typeof thing === 'function') {
      // It's a function - store as is
      this.set(what, thing);
    } else if(typeof thing === 'object') {
      // It's an object/plugin - store as is
      this.set(what, thing);
    } else {
      console.warn(`BaseDataManager.add: Unknown type for ${what}`, thing);
    }
    return this;
  };

  /**
   * Convenience method for adding multiple registrations
   * @param {Array<Object>|Object} specs - The specifications for the things to add.
   * @returns {BaseDataManager} The BaseDataManager instance.
   */
  addMultiple(specs) {
    debugger;
    if(Array.isArray(specs)) {
      specs.forEach(spec => {
        if(spec.name && spec.thing) {
          createDataManager.add(spec.name, spec.thing);
        }
      });
    } else if(typeof specs === 'object') {
      Object.entries(specs).forEach(([name, thing]) => {
        createDataManager.add(name, thing);
      });
    }
    return this;
  };

  /**
   * Helper methods
   * @private
   */
  _getByPath(path) {
    const parts = path.split('.');
    let result = this._data;
    for(const part of parts) {
      if(result?.[part] === undefined) return null;
      result = result[part];
    }
    return result;
  }

  /**
   * @private
   */
  _setByPath(path, value) {
    const parts = path.split('.');
    let target = this._data;
    for(let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if(!target[part]) target[part] = {};
      target = target[part];
    }
    target[parts[parts.length - 1]] = value;
  }

  /**
   * @private
   */
  _notifyListeners(event, data) {
    this._listeners.forEach(listener => {
      if(typeof listener === 'function') {
        listener(event, data);
      } else if(typeof listener.onDataUpdate === 'function') {
        listener.onDataUpdate(event, data);
      }
    });
  }
}

// Example usage:
// Register features from external files
// BaseDataManager.add('validation', ValidationPlugin);
// BaseDataManager.add('persistence', PersistencePlugin);

// Create instances
// const userDataManager = BaseDataManager({ users: [] });
// const configDataManager = BaseDataManager({ theme: 'dark' });

/**
 * Plugin for tabular data functionality
 * @type {Object}
 */
const TablePlugin = {
  install(manager) {
    manager.updateCell = function(rowIndex, colIndex, value, notify = true) {
      const data = this.get();
      if(data.rows && rowIndex >= 0 && rowIndex < data.rows.length &&
        colIndex >= 0 && colIndex < data.headers?.length) {
        data.rows[rowIndex][colIndex] = value;
        if(notify) this._notifyListeners('cellUpdate', {
          rowIndex,
          colIndex,
          value
        });
      }
      return this;
    };

    manager.setRows = function(newRows, notify = true) {
      this.set('rows', newRows, notify);
      return this;
    };

    manager.dataFromJson = function(jsonData) {
      const data = this.get();
      const dataObj = {
        headers: [...data.headers],
        fields: [...data.fields],
        rows: []
      };

      jsonData.forEach(row => {
        const contents = dataObj.fields.map(field => {
          if(field === 'relativePath') {
            const obj = row?.[field];
            return typeof obj === 'object' ? obj : {
              checked: false,
              value: obj
            };
          }
          return row?.[field] !== undefined ? row[field] : false;
        });
        dataObj.rows.push(contents);
      });

      return dataObj;
    };
  }
};

/**
 * Plugin for geographic/world data functionality
 * @type {Object}
 */
const WorldPlugin = {
  install(manager) {
    manager.init = function(data) {
      this.set(data, false); // Don't notify during init
      const world = this.get();
      if(world.waypoints && !world.nodes) {
        this._doWaypointConversion();
      }
      return this;
    };

    manager.getWorld = function() {
      return this.get();
    };

    manager.getAllNodes = function() {
      return this.get('nodes') || [];
    };

    manager.getNode = function(id) {
      const nodes = this.getAllNodes();
      return nodes.find(n => n.id === id);
    };

    manager.updateNode = function(id, props) {
      const nodes = this.getAllNodes();
      const nodeIndex = nodes.findIndex(n => n.id === id);
      if(nodeIndex !== -1) {
        nodes[nodeIndex] = {
          ...nodes[nodeIndex],
          ...props
        };
        this.set('nodes', nodes);
        return true;
      }
      return false;
    };

    manager.getStyle = function(kind, source) {
      const styles = this.get(kind);
      let style = styles?.[0]; // default

      if(source?.style) {
        if(typeof source.style === "string") {
          style = styles.find(s => s.id === source.style) || style;
        } else {
          style = source.style;
        }
      }
      return style;
    };

    manager.getNodeStyle = function(node) {
      return this.getStyle('pointStyles', node);
    };

    manager.getConnectionStyle = function(conn) {
      return this.getStyle('edgeStyles', conn);
    };

    manager.getNodeRadius = function(node) {
      return this.getNodeStyle(node)?.radius || 5;
    };

    manager._doWaypointConversion = function() {
      const world = this.get();
      const nodes = [];
      const connections = [];

      world.waypoints.forEach((pt, index) => {
        const {
          x,
          y
        } = this._latLongToPixel(pt.latitude, pt.longitude);
        const node = {
          id: `id${index}`,
          x,
          y,
          name: pt.location
        };
        nodes.push(node);

        if(index > 0) {
          connections.push({
            from: `id${index-1}`,
            to: `id${index}`
          });
        }
      });

      this.update(null, {
        nodes,
        connections,
        pointStyles: world.pointStyles || [{
          "id": "emoji",
          "radius": 8,
          "innerFont": '11px Arial',
          "fill": "#eeaa77",
          "outline": "#664422",
        }],
        edgeStyles: world.edgeStyles || [{
          "id": "arrow1",
          "angle": 30,
          "width": 5,
          "startEndType": '>',
          "endEndType": '>',
          "startSlant": 0,
          "endSlant": 0,
          "fill": "#d978",
          "outline": "#975a",
          /*"dot" : "#f70",*/
        }]
      });
    };

    manager._latLongToPixel = function(lat, long) {
      const width = 900,
        height = 800;
      const x = ((long + 180 + 360 - 28) % 360 / 360) * width;
      const y = ((90 - lat - 10) / 180) * height;
      return {
        x,
        y
      };
    };
  }
};

/**
 * The global shared data manager instance for UI state management.
 * @type {BaseDataManager}
 */
const Registry = new BaseDataManager({
  view: {
    scale: 1.0,
    panX: 0,
    panY: 0
  },
  ui: {
    isDragging: false,
    isPanning: false,
    selectedNode: null
  }
});

/*
// Usage Examples:

// 1. Create a table data manager
const tableData = new BaseDataManager({
  headers: ['Name', 'Age', 'City'],
  fields: ['name', 'age', 'city'],
  rows: []
}).addFeature('table', TablePlugin);

// 2. Create a world data manager  
const worldData = new BaseDataManager()
  .addFeature('world', WorldPlugin);

// 4. Subscribe to changes
tableData.subscribe((event, data) => {
  console.log(`Table ${event}:`, data);
});

worldData.subscribe((event, data) => {
  console.log(`World ${event}:`, data);
});

// 5. Use the APIs
//Registry.set('view.scale', 2);
//Registry.update('ui', { isDragging: true });

tableData.updateCell(0, 1, 'New Value');
//worldData.init(someWorldData);
*/

/**
 * Make factory functions for convenience
 * @param {Object} initialData - The initial data for the manager.
 * @returns {BaseDataManager} A new BaseDataManager instance with the TablePlugin.
 */
const createTableManager = (initialData) =>
  new BaseDataManager(initialData).addFeature('table', TablePlugin);

/**
 * @param {Object} initialData - The initial data for the manager.
 * @returns {BaseDataManager} A new BaseDataManager instance with the WorldPlugin.
 */
const createWorldManager = (initialData) =>
  new BaseDataManager(initialData).addFeature('world', WorldPlugin);

/**
 * @param {Object} initialData - The initial data for the manager.
 * @returns {BaseDataManager} A new BaseDataManager instance.
 */
const createRegistry = (initialData) =>
  new BaseDataManager(initialData);
