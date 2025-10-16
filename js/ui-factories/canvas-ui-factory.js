/**
 * This augments a canvasFcatory (which can only draw) by adding UI.
 * Creates and manages a canvas instance, handling all mouse interactions for it.
 * It also draws the contents by forwarding to the renderers
 * @param {string} name - The ID of the canvas element.
 * @returns {object} An API for interacting with the canvas.
 */
const canvasUiFactory = function(name) {
  const state = {
    canvas: null,
    dragOffset: {
      x: 0,
      y: 0
    }
  };
  let thisCanvas = null;
  let DataModel = null;

  /**
   * Initializes the canvas element and sets up event listeners.
   * @param {string} canvasId - The ID of the canvas element.
   * @returns {boolean} True if initialization was successful, false otherwise.
   */
  function init(canvasId) {
    state.canvas = document.getElementById(canvasId);
    if(!state.canvas) return false;

    // It could be a div rather than a canvas...
    if(state.canvas.nodeName == 'DIV') {
      const div = state.canvas
      const canv = document.createElement('canvas');
      canv.width = "900"
      canv.height = "600"
      div.parentNode.replaceChild(canv, div);
      canv.id = canvasId
      state.canvas = canv;
    }

    state.canvas.addEventListener('mousedown', handleMouseDown);
    state.canvas.addEventListener('mousemove', handleMouseMove);
    state.canvas.addEventListener('mouseup', handleMouseUp);
    state.canvas.addEventListener('mouseleave', handleMouseLeave);
    state.canvas.addEventListener('wheel', handleWheel);

    // init the renderer, so that we know it and it knows where to render.
    thisCanvas = canvasFactory(canvasId);
    DataModel = thisCanvas.getDataModel()
    return true;
  }

  /**
   * Calculates the mouse position within the canvas, accounting for panning and scaling.
   * @param {MouseEvent} evt - The mouse event.
   * @returns {{x: number, y: number}} The coordinates of the mouse in the canvas's world space.
   */
  function getMousePos(evt) {
    const rect = state.canvas.getBoundingClientRect();
    const view = Registry.get('view');
    return {
      x: (evt.clientX - rect.left - view.panX) / view.scale,
      y: (evt.clientY - rect.top - view.panY) / view.scale
    };
  }

  /**
   * Finds the node at a given position on the canvas.
   * @param {number} mouseX - The x-coordinate on the canvas.
   * @param {number} mouseY - The y-coordinate on the canvas.
   * @returns {object|null} The node object if found, otherwise null.
   */
  function findNodeUnderMouse(mouseX, mouseY) {
    const nodes = DataModel.getAllNodes();

    for(let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const radius = DataModel.getNodeRadius(node)
      if(dx * dx + dy * dy <= radius * radius) {
        return node;
      }
    }
    return null;
  }

  /**
   * Handles the mouse down event on the canvas.
   * Initiates node dragging or panning.
   * @param {MouseEvent} e - The mouse down event.
   */
  function handleMouseDown(e) {
    const mousePos = getMousePos(e);
    const nodeUnderMouse = findNodeUnderMouse(mousePos.x, mousePos.y);

    if(nodeUnderMouse) {
      Registry.set('ui.isDragging', true);
      Registry.set('ui.selectedNode', nodeUnderMouse);

      state.dragOffset = {
        x: mousePos.x - nodeUnderMouse.x,
        y: mousePos.y - nodeUnderMouse.y
      };

      state.canvas.style.cursor = 'grabbing';
    } else {
      Registry.set('ui.isPanning', true);
      Registry.set('ui.lastMousePos', {
        x: e.clientX,
        y: e.clientY
      });

      state.canvas.style.cursor = 'grabbing';
    }
  }

  /**
   * Handles the mouse move event on the canvas.
   * Drags nodes, pans the view, or updates the cursor.
   * @param {MouseEvent} e - The mouse move event.
   */
  function handleMouseMove(e) {
    const ui = Registry.get('ui');

    if(ui.isDragging && ui.selectedNode) {
      const mousePos = getMousePos(e);

      DataModel.updateNode(ui.selectedNode.id, {
        x: mousePos.x - state.dragOffset.x,
        y: mousePos.y - state.dragOffset.y
      });

      //updateJsonDisplay();
      thisCanvas.draw();
    } else if(ui.isPanning) {
      const dx = e.clientX - ui.lastMousePos.x;
      const dy = e.clientY - ui.lastMousePos.y;

      Registry.update('view', {
        panX: Registry.get('view.panX') + dx,
        panY: Registry.get('view.panY') + dy
      });

      Registry.set('ui.lastMousePos', {
        x: e.clientX,
        y: e.clientY
      });

      thisCanvas.draw();
    } else {
      const mousePos = getMousePos(e);
      const nodeUnderMouse = findNodeUnderMouse(mousePos.x, mousePos.y);
      state.canvas.style.cursor = nodeUnderMouse ? 'grab' : 'default';
    }
  }

  /**
   * Handles the mouse up event on the canvas.
   * Ends dragging and panning operations.
   */
  function handleMouseUp() {
    Registry.set('ui.isDragging', false);
    Registry.set('ui.isPanning', false);
    Registry.set('ui.selectedNode', null);
    state.canvas.style.cursor = 'default';
  }

  /**
   * Handles the mouse leave event for the canvas.
   * Resets dragging and panning states.
   */
  function handleMouseLeave() {
    Registry.set('ui.isDragging', false);
    Registry.set('ui.isPanning', false);
    Registry.set('ui.selectedNode', null);
  }

  /**
   * Handles the mouse wheel event for zooming.
   * @param {WheelEvent} e - The wheel event.
   */
  function handleWheel(e) {
    if (!e.ctrlKey && !e.metaKey) 
      return; // Exit early if Ctrl isn't pressed

    e.preventDefault();

    const mousePos = {
      x: e.clientX - state.canvas.getBoundingClientRect().left,
      y: e.clientY - state.canvas.getBoundingClientRect().top
    };

    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    const view = Registry.get('view');
    const newScale = view.scale * zoom;

    if(newScale > 0.2 && newScale < 5) {
      const mouseBeforeZoomX = (mousePos.x - view.panX) / view.scale;
      const mouseBeforeZoomY = (mousePos.y - view.panY) / view.scale;

      Registry.set('view.scale', newScale);

      const mouseAfterZoomX = (mousePos.x - view.panX) / newScale;
      const mouseAfterZoomY = (mousePos.y - view.panY) / newScale;

      Registry.update('view', {
        panX: view.panX + (mouseAfterZoomX - mouseBeforeZoomX) * newScale,
        panY: view.panY + (mouseAfterZoomY - mouseBeforeZoomY) * newScale
      });

      thisCanvas.draw();
    }
  }

  /**
   * Resets the view to the default pan and zoom.
   * @unused
   */
  function resetView() {
    Registry.set('view', {
      scale: 1,
      panX: 0,
      panY: 0
    });
    thisCanvas.draw();
  }

  /**
   * Centers the view on the existing nodes.
   * @unused
   */
  function centerNodes() {
    const nodes = DataModel.getAllNodes();

    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x);
      maxY = Math.max(maxY, node.y);
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const scale = Registry.get('view.scale');

    Registry.set('view', {
      scale: scale,
      panX: state.canvas.width / 2 - centerX * scale,
      panY: state.canvas.height / 2 - centerY * scale
    });

    thisCanvas.draw();
  }

  /**
   * Applies changes from a JSON editor to the data model.
   * @unused
   */
  function applyJsonChanges() {
    try {
      const jsonEditor = document.getElementById('json-editor');
      const newData = JSON.parse(jsonEditor.value);

      DataModel.importData(newData);
      thisCanvas.draw();
    } catch (error) {
      alert('Invalid JSON format: ' + error.message);
    }
  }

  /**
   * Sets the data content for the canvas.
   * @param {object} contents - The data to be displayed on the canvas.
   */
  function setCanvasContents(contents) {
    // Registry line connects it to controllers
    Registry.set('world', contents);
    DataModel.init(contents)
    thisCanvas.drawWithWaiting();
  }

  function showCanvas(show) {
    state.canvas.style.display = show ? 'block' : 'none';
  }
  /**
   * Redraws the canvas.
   */
  function draw() {
    thisCanvas?.draw();
  }

  init(name);

  /**
   * Returns the public API for the canvas instance.
   * @returns {object} The API object.
   */
  function api() {
    return {
      //init,
      setCanvasContents,
      showCanvas,
      draw,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
      handleWheel,
      resetView,
      centerNodes,
      applyJsonChanges
    };
  }
  return api();
};

//UiManager.addFactory(() => ({ canvasUiFactory }));
Factories.addFactory(canvasUiFactory);
