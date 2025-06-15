/* ====================================================================
   COLUMN MANAGER - Column visibility, ordering, and drag-drop
   ==================================================================== */

window.ColumnManager = {
    // Column visibility state
    columnVisibility: {},
    
    // Column order (controls left-to-right placement)
    columnOrder: [],

    /**
     * Initialize column management
     */
    init() {
        this.initializeColumnVisibility();
        this.loadColumnSettings();
        console.log('Column Manager initialized');
    },

    /**
     * Initialize default column visibility
     */
    initializeColumnVisibility() {
        // Initialize all columns as hidden first
        Object.keys(window.COLUMN_CONFIG).forEach(column => {
            this.columnVisibility[column] = window.DEFAULT_VISIBLE_COLUMNS.includes(column);
        });
        
        // Set initial column order
        this.columnOrder = Object.keys(window.COLUMN_CONFIG);
    },

    /**
     * Load column settings from localStorage
     */
    loadColumnSettings() {
        try {
            const savedVisibility = Utils.loadFromStorage('dashboardColumnVisibility');
            if (savedVisibility) {
                this.columnVisibility = { ...this.columnVisibility, ...savedVisibility };
            }
            
            const savedOrder = Utils.loadFromStorage('dashboardColumnOrder', []);
            if (Array.isArray(savedOrder) && savedOrder.length > 0) {
                const validOrder = savedOrder.filter(k => k in window.COLUMN_CONFIG);
                Object.keys(window.COLUMN_CONFIG).forEach(k => {
                    if (!validOrder.includes(k)) validOrder.push(k);
                });
                this.columnOrder = validOrder;
            }
        } catch (error) {
            console.warn('Error loading column settings:', error);
        }
    },

    /**
     * Save column settings to localStorage
     */
    saveColumnSettings() {
        Utils.saveToStorage('dashboardColumnVisibility', this.columnVisibility);
        Utils.saveToStorage('dashboardColumnOrder', this.columnOrder);
    },

    /**
     * Get visible columns in correct order
     */
    getVisibleColumns() {
        return this.columnOrder
            .filter(key => this.columnVisibility[key])
            .map(key => [key, window.COLUMN_CONFIG[key]]);
    },

    /**
     * Toggle column visibility
     */
    toggleColumnVisibility(columnKey) {
        this.columnVisibility[columnKey] = !this.columnVisibility[columnKey];
        this.saveColumnSettings();
        
        if (window.Table && window.Table.renderTable) {
            window.Table.renderTable();
        }
        this.updateModal();
    },

    /**
     * Show/hide all columns
     */
    toggleAll(show) {
        Object.keys(window.COLUMN_CONFIG).forEach(column => {
            this.columnVisibility[column] = show;
        });
        this.saveColumnSettings();
        
        if (window.Table && window.Table.renderTable) {
            window.Table.renderTable();
        }
        this.updateModal();
    },

    /**
     * Reset to default columns
     */
    resetToDefault() {
        Object.keys(window.COLUMN_CONFIG).forEach(column => {
            this.columnVisibility[column] = window.DEFAULT_VISIBLE_COLUMNS.includes(column);
        });
        
        this.columnOrder = Object.keys(window.COLUMN_CONFIG);
        this.saveColumnSettings();
        
        if (window.Table && window.Table.renderTable) {
            window.Table.renderTable();
        }
        this.updateModal();
    },

    /**
     * Open column configuration modal
     */
    openModal() {
        const modal = document.getElementById('columnModal');
        if (modal) {
            modal.classList.add('active');
            this.updateModal();
        }
    },

    /**
     * Close column configuration modal
     */
    closeModal() {
        const modal = document.getElementById('columnModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Update modal content
     */
    updateModal() {
        const visibleList = document.getElementById('visibleColumnsList');
        const hiddenList = document.getElementById('hiddenColumnsList');
        
        if (!visibleList || !hiddenList) return;
        
        // Clear lists
        visibleList.innerHTML = '';
        hiddenList.innerHTML = '';
        
        // Populate lists with drag-and-drop items
        this.columnOrder.forEach(key => {
            const title = window.COLUMN_CONFIG[key];
            if (!title) return;
            
            const item = this.createColumnItem(key, title, this.columnVisibility[key]);
            
            if (this.columnVisibility[key]) {
                visibleList.appendChild(item);
            } else {
                hiddenList.appendChild(item);
            }
        });
        
        // Setup drop zones
        this.setupDropZones();
        
        // Update counters
        this.updateCounters();
        
        // Update empty states
        this.updateEmptyStates();
    },

    /**
     * Create draggable column item
     */
    createColumnItem(key, title, isVisible) {
        const item = document.createElement('div');
        item.className = 'column-item';
        item.draggable = true;
        item.dataset.column = key;
        item.innerHTML = `
            <span class="column-name">${title}</span>
            <span class="column-status ${isVisible ? 'visible' : 'hidden'}">
                ${isVisible ? 'Visível' : 'Oculta'}
            </span>
        `;
        
        this.setupDragEvents(item);
        return item;
    },

    /**
     * Setup drag events for column item
     */
    setupDragEvents(item) {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.column);
            e.dataTransfer.effectAllowed = 'move';
            item.classList.add('dragging');
            
            // Store the dragged element
            this.draggedElement = item;
            
            console.log('Drag started for:', item.dataset.column);
        });
        
        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
            this.draggedElement = null;
            
            // Clean up any visual feedback
            document.querySelectorAll('.column-list').forEach(list => {
                list.classList.remove('drag-over');
            });
            
            // Remove any placeholders
            document.querySelectorAll('.drop-placeholder').forEach(p => p.remove());
            
            console.log('Drag ended');
        });
    },

    /**
     * Setup drop zones for drag and drop
     */
    setupDropZones() {
        const visibleList = document.getElementById('visibleColumnsList');
        const hiddenList = document.getElementById('hiddenColumnsList');
        
        [visibleList, hiddenList].forEach(list => {
            // Remove any existing event listeners by cloning and replacing
            const newList = list.cloneNode(false);
            list.parentNode.replaceChild(newList, list);
            
            // Re-populate the new list
            const isVisible = newList.id === 'visibleColumnsList';
            this.columnOrder.forEach(key => {
                const title = window.COLUMN_CONFIG[key];
                if (!title) return;
                
                if (this.columnVisibility[key] === isVisible) {
                    const item = this.createColumnItem(key, title, isVisible);
                    newList.appendChild(item);
                }
            });
            
            // Add drop zone events
            newList.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                newList.classList.add('drag-over');
                
                // Find insertion point and add placeholder
                const afterElement = this.getDragAfterElement(newList, e.clientY);
                const placeholder = this.getOrCreatePlaceholder();
                
                if (afterElement == null) {
                    // Drop at the end
                    newList.appendChild(placeholder);
                } else {
                    // Drop before the found element
                    newList.insertBefore(placeholder, afterElement);
                }
            });
            
            newList.addEventListener('dragleave', (e) => {
                // Only remove drag-over if we're leaving the list entirely
                if (!newList.contains(e.relatedTarget)) {
                    newList.classList.remove('drag-over');
                    this.removePlaceholder();
                }
            });
            
            newList.addEventListener('drop', (e) => {
                e.preventDefault();
                
                const draggedColumn = e.dataTransfer.getData('text/plain');
                const newVisibility = newList.id === 'visibleColumnsList';
                
                console.log('Dropping', draggedColumn, 'into', newList.id);
                
                // Update column visibility
                this.columnVisibility[draggedColumn] = newVisibility;
                
                // Rebuild the column order based on the current DOM state
                this.rebuildColumnOrder(newList, draggedColumn);
                
                // Save and refresh
                this.saveColumnSettings();
                this.updateModal();
                
                // Update table if needed
                if (window.Table && window.Table.renderTable) {
                    window.Table.renderTable();
                }
                
                // Clean up
                newList.classList.remove('drag-over');
                this.removePlaceholder();
                
                console.log('Drop completed. New order:', this.columnOrder);
            });
        });
    },

    /**
     * Rebuild column order based on DOM state after drop
     */
    rebuildColumnOrder(targetList, draggedColumn) {
        // Get the placeholder position
        const placeholder = targetList.querySelector('.drop-placeholder');
        const isVisible = targetList.id === 'visibleColumnsList';
        
        // Get all current items in target list (excluding dragged element and placeholder)
        const currentItems = Array.from(targetList.children)
            .filter(child => 
                child.classList.contains('column-item') && 
                child.dataset.column !== draggedColumn &&
                !child.classList.contains('drop-placeholder')
            )
            .map(item => item.dataset.column);
        
        // Find where to insert the dragged column
        let insertPosition = currentItems.length; // Default: insert at end
        
        if (placeholder) {
            const placeholderIndex = Array.from(targetList.children).indexOf(placeholder);
            
            // Count how many column items come before the placeholder
            let itemsBefore = 0;
            for (let i = 0; i < placeholderIndex; i++) {
                const child = targetList.children[i];
                if (child.classList.contains('column-item') && 
                    child.dataset.column !== draggedColumn) {
                    itemsBefore++;
                }
            }
            insertPosition = itemsBefore;
        }
        
        // Insert the dragged column at the correct position in the current items
        currentItems.splice(insertPosition, 0, draggedColumn);
        
        // Now rebuild the full column order
        const newOrder = [];
        
        // Add columns that should be visible in their new order
        if (isVisible) {
            newOrder.push(...currentItems);
        } else {
            // For visible list, keep existing visible columns in their current order
            const existingVisible = this.columnOrder.filter(key => 
                this.columnVisibility[key] && key !== draggedColumn
            );
            newOrder.push(...existingVisible);
        }
        
        // Add columns that should be hidden in their new order
        if (!isVisible) {
            newOrder.push(...currentItems);
        } else {
            // For hidden list, keep existing hidden columns in their current order
            const existingHidden = this.columnOrder.filter(key => 
                !this.columnVisibility[key] && key !== draggedColumn
            );
            newOrder.push(...existingHidden);
        }
        
        // Add any remaining columns that weren't categorized
        this.columnOrder.forEach(key => {
            if (!newOrder.includes(key)) {
                newOrder.push(key);
            }
        });
        
        this.columnOrder = newOrder;
        
        console.log('Rebuilt order:', {
            draggedColumn,
            insertPosition,
            currentItems,
            newOrder: this.columnOrder
        });
    },

    /**
     * Get or create drop placeholder
     */
    getOrCreatePlaceholder() {
        let placeholder = document.querySelector('.drop-placeholder');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'drop-placeholder';
            placeholder.style.cssText = `
                height: 3px;
                background: linear-gradient(90deg, #3b82f6, #60a5fa);
                margin: 4px 0;
                border-radius: 2px;
                opacity: 0.9;
                box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
                animation: pulse 0.8s ease-in-out infinite alternate;
            `;
            
            // Add pulsing animation
            if (!document.getElementById('placeholderAnimation')) {
                const style = document.createElement('style');
                style.id = 'placeholderAnimation';
                style.textContent = `
                    @keyframes pulse {
                        from { opacity: 0.6; transform: scaleY(0.8); }
                        to { opacity: 1; transform: scaleY(1.2); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        return placeholder;
    },

    /**
     * Remove drop placeholder
     */
    removePlaceholder() {
        const placeholder = document.querySelector('.drop-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
    },

    /**
     * Get the element that should come after the dragged element
     * Improved logic for better positioning
     */
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.column-item:not(.dragging)')];
        
        // If no elements, return null (insert at beginning)
        if (draggableElements.length === 0) {
            return null;
        }
        
        // Find the element we should insert before
        for (const child of draggableElements) {
            const box = child.getBoundingClientRect();
            const elementMiddle = box.top + box.height / 2;
            
            // If mouse is above the middle of this element, insert before it
            if (y < elementMiddle) {
                return child;
            }
        }
        
        // If we didn't find any element to insert before, insert at the end
        return null;
    },

    /**
     * Update modal counters
     */
    updateCounters() {
        const visibleCount = Object.values(this.columnVisibility).filter(v => v).length;
        const totalCount = Object.keys(window.COLUMN_CONFIG).length;
        
        const visibleCountEl = document.getElementById('visibleCount');
        const totalCountEl = document.getElementById('totalCount');
        
        if (visibleCountEl) visibleCountEl.textContent = visibleCount;
        if (totalCountEl) totalCountEl.textContent = totalCount;
    },

    /**
     * Update empty states for lists
     */
    updateEmptyStates() {
        const visibleList = document.getElementById('visibleColumnsList');
        const hiddenList = document.getElementById('hiddenColumnsList');
        
        if (visibleList) {
            const items = visibleList.querySelectorAll('.column-item').length;
            if (items === 0) {
                visibleList.classList.add('empty');
            } else {
                visibleList.classList.remove('empty');
            }
        }
        
        if (hiddenList) {
            const items = hiddenList.querySelectorAll('.column-item').length;
            if (items === 0) {
                hiddenList.classList.add('empty');
            } else {
                hiddenList.classList.remove('empty');
            }
        }
    }
};