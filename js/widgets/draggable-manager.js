class DraggableManager {
  constructor(columns, cardState, onDropCallback, noDragSelector) {
    this.columns = columns;
    this.draggables = [];
    this.draggedItem = null;
    this.cardState = cardState;
    this.onDropCallback = onDropCallback;
    this.noDragSelector = noDragSelector;

    this.columns.forEach(column => {
      column.addEventListener('dragover', this.handleDragOver.bind(this));
      column.addEventListener('drop', this.handleDrop.bind(this));
    });
  }

  handleDragStart(e) {
    if(this.noDragSelector && e.target.matches(this.noDragSelector)) {
      e.preventDefault();
      return;
    }
    this.draggedItem = e.target;
    this.draggedItem.classList.add('dragging');
  }

  handleDragEnd(e) {
    this.draggedItem.classList.remove('dragging');
    this.draggedItem = null;
  }

  handleDragOver(e) {
    e.preventDefault();
    const column = e.target.closest('.column');
    if(column) {
      this.columns.forEach(c => c.classList.remove('drag-over'));
      column.classList.add('drag-over');

      const afterElement = this.getDragAfterElement(column, e.clientY);
      const draggable = this.draggedItem;
      if(afterElement == null) {
        column.appendChild(draggable);
      } else {
        column.insertBefore(draggable, afterElement);
      }
    }
  }

  handleDrop(e) {
    e.preventDefault();
    const column = e.target.closest('.column');
    if(column && this.draggedItem) {
      const cardKey = this.draggedItem.id.split('-')[1];
      const oldColumnId = this.findCardColumn(cardKey);
      const newColumnId = column.id;

      // Remove from old column
      if(oldColumnId) {
        const oldColumn = this.cardState.columns[oldColumnId];
        const index = oldColumn.indexOf(cardKey);
        if(index > -1) {
          oldColumn.splice(index, 1);
        }
      }

      // Add to new column
      const afterElement = this.getDragAfterElement(column, e.clientY);
      const newColumn = this.cardState.columns[newColumnId];
      if(afterElement == null) {
        newColumn.push(cardKey);
      } else {
        const afterCardKey = afterElement.id.split('-')[1];
        const index = newColumn.indexOf(afterCardKey);
        newColumn.splice(index, 0, cardKey);
      }
      if(this.onDropCallback) {
        this.onDropCallback();
      }
    }
    this.columns.forEach(c => c.classList.remove('drag-over'));
  }

  findCardColumn(cardKey) {
    for(const columnId in this.cardState.columns) {
      if(this.cardState.columns[columnId].includes(cardKey)) {
        return columnId;
      }
    }
    return null;
  }

  getDragAfterElement(column, y) {
    const draggableElements = [...column.querySelectorAll(
      '.card3:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if(offset < 0 && offset > closest.offset) {
        return {
          offset: offset,
          element: child
        };
      } else {
        return closest;
      }
    }, {
      offset: Number.NEGATIVE_INFINITY
    }).element;
  }

  addDraggable(draggable) {
    draggable.addEventListener('dragstart', this.handleDragStart.bind(this));
    draggable.addEventListener('dragend', this.handleDragEnd.bind(this));
  }

  updateDraggables(draggables) {
    this.draggables = draggables;
    this.draggables.forEach(draggable => this.addDraggable(draggable));
  }

  enable() {
    this.draggables.forEach(draggable => {
      draggable.draggable = true;
    });
  }

  disable() {
    this.draggables.forEach(draggable => {
      draggable.draggable = false;
    });
  }
}
