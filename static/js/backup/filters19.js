/* ====================================================================
   FILTERS MODULE - Filter management, active filters, and UI
   ==================================================================== */

window.Filters = {
    // Current filter state
    activeFilters: {},
    
    // Track which date shortcut is active
    activeDateShortcut: null,

    /**
     * Initialize filter components
     */
    async init() {
        await this.loadFilterOptions();
        this.setupEventListeners();
        this.setupDateShortcuts();
        console.log('Filters module initialized');
    },

    /**
     * Load and populate filter options
     */
    async loadFilterOptions() {
        try {
            const options = await API.fetchFilterOptions();
            this.populateFilterOptions(options);
        } catch (error) {
            console.error('Error loading filter options:', error);
        }
    },

    /**
     * Populate filter dropdown options
     */
    populateFilterOptions(options) {
        // Populate status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.innerHTML = '<option value="">Todos</option>' + 
                options.status.map(status => `<option value="${status}">${status}</option>`).join('');
        }
        
        // Populate patio filter
        const patioFilter = document.getElementById('patioFilter');
        if (patioFilter) {
            patioFilter.innerHTML = '<option value="">Todos</option>' + 
                options.patio.map(patio => `<option value="${patio}">${patio}</option>`).join('');
        }
        
        // Populate circunscricao filter
        const circunscricaoFilter = document.getElementById('circunscricaoFilter');
        if (circunscricaoFilter) {
            circunscricaoFilter.innerHTML = '<option value="">Todas</option>' + 
                options.circunscricao.map(circ => `<option value="${circ}">${circ}</option>`).join('');
        }
        
        // Populate tipo filter (checkboxes)
        const tipoFilter = document.getElementById('tipoFilter');
        if (tipoFilter) {
            tipoFilter.innerHTML = options.tipo.map(tipo => 
                `<div class="checkbox-item">
                    <input type="checkbox" id="tipo_${tipo}" value="${tipo}" onchange="Filters.updateTypeFilter()">
                    <label for="tipo_${tipo}">${tipo}</label>
                </div>`
            ).join('');
        }
    },

    /**
     * Setup filter event listeners
     */
    setupEventListeners() {
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.updateFilter('status', e.target.value, e.target);
            });
        }
        
        // Patio filter
        const patioFilter = document.getElementById('patioFilter');
        if (patioFilter) {
            patioFilter.addEventListener('change', (e) => {
                this.updateFilter('patio', e.target.value, e.target);
            });
        }
        
        // Circunscricao filter
        const circunscricaoFilter = document.getElementById('circunscricaoFilter');
        if (circunscricaoFilter) {
            circunscricaoFilter.addEventListener('change', (e) => {
                this.updateFilter('circunscricao', e.target.value, e.target);
            });
        }
        
        // Date filters with Brazilian format support
        const dateFrom = document.getElementById('dateFrom');
        if (dateFrom) {
            // Add input masking for dd/mm/yyyy
            dateFrom.addEventListener('input', (e) => {
                e.target.value = this.formatDateInput(e.target.value);
            });
            
            dateFrom.addEventListener('blur', (e) => {
                const brazilianDate = e.target.value;
                const isoDate = this.convertBrazilianToISO(brazilianDate);
                if (isoDate) {
                    this.activeDateShortcut = null; // Clear shortcut when manually set
                    this.clearDateShortcutButtons();
                    this.updateFilter('date_from', isoDate, e.target);
                } else if (brazilianDate) {
                    // Invalid date format
                    e.target.style.borderColor = '#dc2626';
                    setTimeout(() => {
                        e.target.style.borderColor = '';
                    }, 2000);
                } else {
                    // Empty date
                    this.removeFilter('date_from');
                }
            });
        }
        
        const dateTo = document.getElementById('dateTo');
        if (dateTo) {
            // Add input masking for dd/mm/yyyy
            dateTo.addEventListener('input', (e) => {
                e.target.value = this.formatDateInput(e.target.value);
            });
            
            dateTo.addEventListener('blur', (e) => {
                const brazilianDate = e.target.value;
                const isoDate = this.convertBrazilianToISO(brazilianDate);
                if (isoDate) {
                    this.activeDateShortcut = null; // Clear shortcut when manually set
                    this.clearDateShortcutButtons();
                    this.updateFilter('date_to', isoDate, e.target);
                } else if (brazilianDate) {
                    // Invalid date format
                    e.target.style.borderColor = '#dc2626';
                    setTimeout(() => {
                        e.target.style.borderColor = '';
                    }, 2000);
                } else {
                    // Empty date
                    this.removeFilter('date_to');
                }
            });
        }
    },

    /**
     * Format date input with dd/mm/yyyy mask
     */
    formatDateInput(value) {
        // Remove non-numeric characters
        const numericValue = value.replace(/\D/g, '');
        
        // Apply dd/mm/yyyy mask
        if (numericValue.length <= 2) {
            return numericValue;
        } else if (numericValue.length <= 4) {
            return numericValue.slice(0, 2) + '/' + numericValue.slice(2);
        } else {
            return numericValue.slice(0, 2) + '/' + numericValue.slice(2, 4) + '/' + numericValue.slice(4, 8);
        }
    },

    /**
     * Convert Brazilian date (dd/mm/yyyy) to ISO format (yyyy-mm-dd)
     */
    convertBrazilianToISO(brazilianDate) {
        if (!brazilianDate || brazilianDate.length !== 10) return null;
        
        const parts = brazilianDate.split('/');
        if (parts.length !== 3) return null;
        
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        // Basic validation
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
            return null;
        }
        
        // More thorough validation
        const date = new Date(year, month - 1, day);
        if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
            return null;
        }
        
        // Return ISO format
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    },

    /**
     * Convert ISO date (yyyy-mm-dd) to Brazilian format (dd/mm/yyyy)
     */
    convertISOToBrazilian(isoDate) {
        if (!isoDate) return '';
        
        const parts = isoDate.split('-');
        if (parts.length !== 3) return '';
        
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        
        return `${day}/${month}/${year}`;
    },

    /**
     * Setup date shortcut buttons
     */
    setupDateShortcuts() {
        document.querySelectorAll('.date-shortcut').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Clear active state from all shortcuts
                this.clearDateShortcutButtons();
                e.target.classList.add('active');
                
                const days = parseInt(e.target.dataset.days);
                const shortcutText = e.target.textContent;
                
                if (days > 0) {
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(endDate.getDate() - days);
                    
                    this.activeFilters.date_from = startDate.toISOString().split('T')[0];
                    this.activeFilters.date_to = endDate.toISOString().split('T')[0];
                } else {
                    // Today
                    const today = new Date().toISOString().split('T')[0];
                    this.activeFilters.date_from = today;
                    this.activeFilters.date_to = today;
                }
                
                // Set active shortcut for badge display
                this.activeDateShortcut = shortcutText;
                
                // Update the date inputs to reflect the values in Brazilian format
                const dateFromInput = document.getElementById('dateFrom');
                const dateToInput = document.getElementById('dateTo');
                if (dateFromInput) dateFromInput.value = this.convertISOToBrazilian(this.activeFilters.date_from);
                if (dateToInput) dateToInput.value = this.convertISOToBrazilian(this.activeFilters.date_to);
                
                this.applyFilters();
            });
        });
    },

    /**
     * Clear date shortcut button states
     */
    clearDateShortcutButtons() {
        document.querySelectorAll('.date-shortcut').forEach(btn => btn.classList.remove('active'));
    },

    /**
     * Update a single filter
     */
    updateFilter(key, value, element) {
        if (value) {
            this.activeFilters[key] = value;
            if (element) element.classList.add('active');
        } else {
            delete this.activeFilters[key];
            if (element) element.classList.remove('active');
        }
        
        this.applyFilters();
    },

    /**
     * Update type filter (checkboxes with OR logic)
     */
    updateTypeFilter() {
        const checkboxes = document.querySelectorAll('#tipoFilter input[type="checkbox"]:checked');
        const types = Array.from(checkboxes).map(cb => cb.value);
        
        if (types.length > 0) {
            this.activeFilters.tipo = types; // Store as array for OR logic
        } else {
            delete this.activeFilters.tipo;
        }
        
        this.applyFilters();
    },

    /**
     * Clear all filters
     */
    clearAll() {
        // Clear form controls
        document.querySelectorAll('.filter-select').forEach(select => {
            select.selectedIndex = 0;
            select.classList.remove('active');
        });
        
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('.filter-input').forEach(input => {
            input.value = '';
            input.classList.remove('active');
            input.style.borderColor = ''; // Clear any error styling
        });
        
        this.clearDateShortcutButtons();
        
        // Clear state
        this.activeFilters = {};
        this.activeDateShortcut = null;
        this.applyFilters();
    },

    /**
     * Remove a specific filter
     */
    removeFilter(filterType) {
        if (filterType === 'date_shortcut') {
            // Remove both date filters and clear shortcut
            delete this.activeFilters.date_from;
            delete this.activeFilters.date_to;
            this.activeDateShortcut = null;
            
            // Clear UI
            const dateFrom = document.getElementById('dateFrom');
            const dateTo = document.getElementById('dateTo');
            if (dateFrom) {
                dateFrom.value = '';
                dateFrom.classList.remove('active');
                dateFrom.style.borderColor = ''; // Clear any error styling
            }
            if (dateTo) {
                dateTo.value = '';
                dateTo.classList.remove('active');
                dateTo.style.borderColor = ''; // Clear any error styling
            }
            this.clearDateShortcutButtons();
        } else {
            delete this.activeFilters[filterType];
            
            // Update UI controls
            switch(filterType) {
                case 'status':
                    const statusFilter = document.getElementById('statusFilter');
                    if (statusFilter) {
                        statusFilter.selectedIndex = 0;
                        statusFilter.classList.remove('active');
                    }
                    break;
                case 'patio':
                    const patioFilter = document.getElementById('patioFilter');
                    if (patioFilter) {
                        patioFilter.selectedIndex = 0;
                        patioFilter.classList.remove('active');
                    }
                    break;
                case 'circunscricao':
                    const circunscricaoFilter = document.getElementById('circunscricaoFilter');
                    if (circunscricaoFilter) {
                        circunscricaoFilter.selectedIndex = 0;
                        circunscricaoFilter.classList.remove('active');
                    }
                    break;
                case 'tipo':
                    document.querySelectorAll('#tipoFilter input[type="checkbox"]').forEach(cb => {
                        cb.checked = false;
                    });
                    break;
                case 'date_from':
                    const dateFrom = document.getElementById('dateFrom');
                    if (dateFrom) {
                        dateFrom.value = '';
                        dateFrom.classList.remove('active');
                        dateFrom.style.borderColor = ''; // Clear any error styling
                    }
                    this.activeDateShortcut = null;
                    this.clearDateShortcutButtons();
                    break;
                case 'date_to':
                    const dateTo = document.getElementById('dateTo');
                    if (dateTo) {
                        dateTo.value = '';
                        dateTo.classList.remove('active');
                        dateTo.style.borderColor = ''; // Clear any error styling
                    }
                    this.activeDateShortcut = null;
                    this.clearDateShortcutButtons();
                    break;
            }
        }
        
        this.applyFilters();
    },

    /**
     * Apply current filters and trigger table update
     */
    applyFilters() {
        if (window.AppState) {
            window.AppState.currentPage = 1;
            window.AppState.filters = { ...this.activeFilters };
        }
        
        this.renderActiveFilters();
        
        if (window.Table && window.Table.fetchAndRender) {
            window.Table.fetchAndRender();
        }
    },

    /**
     * Render active filter badges
     */
    renderActiveFilters() {
        const activeFiltersContainer = document.querySelector('#activeFilters .filters-content');
        const noFiltersMsg = document.getElementById('no-filters-msg');
        
        if (!activeFiltersContainer) return;
        
        // Remove existing badges
        const existingChips = activeFiltersContainer.querySelectorAll('.filter-chip');
        existingChips.forEach(chip => chip.remove());
        
        const activeFilters = [];
        
        // Check search query
        if (window.AppState && window.AppState.searchQuery) {
            activeFilters.push({
                type: 'search',
                label: `Busca: ${window.AppState.searchQuery}`,
                value: window.AppState.searchQuery
            });
        }
        
        // Check other filters
        Object.entries(this.activeFilters).forEach(([key, value]) => {
            let label;
            
            // Skip individual date filters if we have an active shortcut
            if ((key === 'date_from' || key === 'date_to') && this.activeDateShortcut) {
                return; // Skip individual date badges when shortcut is active
            }
            
            switch(key) {
                case 'status':
                    label = `Status: ${value}`;
                    break;
                case 'patio':
                    label = `Pátio: ${value}`;
                    break;
                case 'circunscricao':
                    label = `Circunscrição: ${value}`;
                    break;
                case 'tipo':
                    const types = Array.isArray(value) ? value : value.split(',');
                    label = `Tipo: ${types.join(', ')}`;
                    break;
                case 'date_from':
                    label = `De: ${this.convertISOToBrazilian(value)}`;
                    break;
                case 'date_to':
                    label = `Até: ${this.convertISOToBrazilian(value)}`;
                    break;
                default:
                    label = `${key}: ${value}`;
            }
            
            activeFilters.push({
                type: key,
                label: label,
                value: value
            });
        });
        
        // Add shortcut badge if active
        if (this.activeDateShortcut) {
            activeFilters.push({
                type: 'date_shortcut',
                label: this.activeDateShortcut,
                value: this.activeDateShortcut
            });
        }
        
        if (activeFilters.length > 0) {
            if (noFiltersMsg) noFiltersMsg.style.display = 'none';
            
            activeFilters.forEach(filter => {
                const chip = document.createElement('div');
                chip.className = 'filter-chip';
                chip.innerHTML = `
                    ${filter.label}
                    <span class="filter-chip-remove" onclick="Filters.handleRemoveFilter('${filter.type}')">&times;</span>
                `;
                activeFiltersContainer.appendChild(chip);
            });
        } else {
            if (noFiltersMsg) noFiltersMsg.style.display = 'inline';
        }
    },

    /**
     * Handle filter removal from badge click
     */
    handleRemoveFilter(filterType) {
        if (filterType === 'search') {
            if (window.Search && window.Search.clearSearch) {
                window.Search.clearSearch();
            }
        } else {
            this.removeFilter(filterType);
        }
    }
};