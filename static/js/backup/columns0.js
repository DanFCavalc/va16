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
        
        this.setupDragAndDrop(item);
        return item;
    },

    /**
     * Setup drag and drop for column item
     */
    setupDragAndDrop(item) {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.column);
            e.dataTransfer.effectAllowed = 'move';
            item.classList.add('dragging');
            
            // Add visual feedback to drop zones
            document.querySelectorAll('.column-list').forEach(list => {
                list.classList.add('drag-active');
            });
        });
        
        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
            
            // Remove visual feedback
            document.querySelectorAll('.column-list').forEach(list => {
                list.classList.remove('drag-active', 'drag-over');
            });
        });
    },

    /**
     * Setup drop zones for drag and drop
     */
    setupDropZones() {
        const visibleList = document.getElementById('visibleColumnsList');
        const hiddenList = document.getElementById('hiddenColumnsList');
        const placeholder = document.createElement('div');
        placeholder.className = 'column-placeholder';

        [visibleList, hiddenList].forEach(list => {
            // Remove existing listeners
            list.replaceWith(list.cloneNode(true));
            const newList = list.id === 'visibleColumnsList' ? 
                document.getElementById('visibleColumnsList') : 
                document.getElementById('hiddenColumnsList');
            
            newList.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterEl = Utils.getDragAfterElement(newList, e.clientY);

                // Remove existing placeholder
                newList.querySelectorAll('.column-placeholder').forEach(p => p.remove());

                if (afterEl) {
                    newList.insertBefore(placeholder, afterEl);
                } else {
                    newList.appendChild(placeholder);
                }
            });

            newList.addEventListener('dragleave', (e) => {
                if (!newList.contains(e.relatedTarget)) {
                    newList.querySelectorAll('.column-placeholder').forEach(p => p.remove());
                }
            });

            newList.addEventListener('drop', (e) => {
                e.preventDefault();
                const key = e.dataTransfer.getData('text/plain');
                const newVis = (newList.id === 'visibleColumnsList');
                
                // Update visibility
                this.columnVisibility[key] = newVis;

                const draggingEl = document.querySelector('.column-item.dragging');
                const ph = newList.querySelector('.column-placeholder');
                
                if (ph && draggingEl) {
                    newList.insertBefore(draggingEl, ph);
                    ph.remove();
                } else if (draggingEl) {
                    newList.appendChild(draggingEl);
                }
                
                if (draggingEl) {
                    draggingEl.classList.remove('dragging');
                }

                // Rebuild column order based on DOM
                const visibleKeys = [...document.getElementById('visibleColumnsList').children]
                    .map(c => c.dataset.column);
                const hiddenKeys = [...document.getElementById('hiddenColumnsList').children]
                    .map(c => c.dataset.column);
                
                this.columnOrder = visibleKeys.concat(hiddenKeys);

                this.saveColumnSettings();
                
                if (window.Table && window.Table.renderTable) {
                    window.Table.renderTable();
                }
                this.updateModal();
            });
        });
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
            if (visibleList.children.length === 0) {
                visibleList.classList.add('empty');
            } else {
                visibleList.classList.remove('empty');
            }
        }
        
        if (hiddenList) {
            if (hiddenList.children.length === 0) {
                hiddenList.classList.add('empty');
            } else {
                hiddenList.classList.remove('empty');
            }
        }
    }
};