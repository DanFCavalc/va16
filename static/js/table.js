/* ====================================================================
   TABLE MODULE - Table rendering, sorting, and pagination
   ==================================================================== */

window.Table = {
    /**
     * Initialize table functionality
     */
    init() {
        this.setupPaginationControls();
        console.log('Table module initialized');
    },

    /**
     * Fetch data and render table
     */
    async fetchAndRender() {
        UI.showLoading();
        
        try {
            const params = {
                page: window.AppState.currentPage,
                perPage: window.AppState.perPage,
                search: window.AppState.searchQuery,
                filters: window.AppState.filters,
                sortBy: window.AppState.sortBy,
                sortOrder: window.AppState.sortOrder
            };
            
            const data = await API.fetchVehicles(params);
            
            window.AppState.vehicles = data.vehicles;
            window.AppState.pagination = data.pagination;
            
            this.renderTable();
            this.renderPagination();
            
            UI.hideLoading();
            
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            UI.showError('Erro ao carregar veículos. Verifique a conexão.');
        }
    },

    /**
     * Render table with current data and column visibility
     */
    renderTable() {
        const thead = document.getElementById('tableHeader');
        const tbody = document.getElementById('tableBody');
        const table = document.querySelector('.results-table');
        
        if (!thead || !tbody || !table) return;
        
        // Get visible columns based on column manager settings
        const visibleColumns = window.ColumnManager ? 
            window.ColumnManager.getVisibleColumns() : 
            window.DEFAULT_VISIBLE_COLUMNS.map(k => [k, window.COLUMN_CONFIG[k]]);
        
        const columnCount = visibleColumns.length;
        
        // Adjust table class based on column count
        table.classList.remove('few-columns', 'many-columns');
        if (columnCount <= 8) {
            table.classList.add('few-columns');
        } else {
            table.classList.add('many-columns');
        }
        
        // Render header
        thead.innerHTML = visibleColumns.map(([key, title]) => 
            `<th data-column="${key}" onclick="Table.sortTable('${key}')">
                ${title}
                <span class="sort-indicator ${window.AppState.sortBy === key ? window.AppState.sortOrder : ''}" data-sort="${window.AppState.sortBy === key ? window.AppState.sortOrder : 'none'}"></span>
            </th>`
        ).join('');
        
        // Render body
        tbody.innerHTML = window.AppState.vehicles.map(vehicle => 
            `<tr onclick="Details.showVehicle(${vehicle.id})">
                ${visibleColumns.map(([key]) => {
                    let value = vehicle[key] || '';
                    let className = '';
                    
                    // Format dates for table display
                    value = Utils.formatTableDate(value, key);
                    
                    // Strip decimals for integer fields
                    if (['protocolo', 'numero_laudo', 'num_procedimento'].includes(key) && value) {
                        value = Utils.formatInteger(value);
                    }
                    
                    // Special formatting for certain fields
                    if (key === 'status' && vehicle.status) {
                        value = `<span class="status ${vehicle.status_class || ''}">${vehicle.status}</span>`;
                    } else if (['modelo', 'proprietario', 'pessoa_relacionada', 'obs1', 'obs2'].includes(key)) {
                        className = 'text-left';
                    }
                    
                    return `<td class="${className}">${value}</td>`;
                }).join('')}
            </tr>`
        ).join('');
        
        console.log(`Table rendered with ${columnCount} columns (${columnCount <= 8 ? 'responsive' : 'horizontal scroll'})`);
    },

    /**
     * Render pagination controls
     */
    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        const { page, pages, total, per_page, has_prev, has_next } = window.AppState.pagination;
        
        pagination.innerHTML = `
            <div class="pagination-left">
                <div class="pagination-info">
                    Mostrando ${((page - 1) * per_page) + 1}-${Math.min(page * per_page, total)} de ${total} resultados
                </div>
                <div class="results-per-page">
                    <label for="resultsPerPage">Resultados por página:</label>
                    <select id="resultsPerPage" onchange="Table.changePerPage(this.value)">
                        ${window.PAGINATION_SETTINGS.availableOptions.map(option => 
                            `<option value="${option}" ${per_page === option ? 'selected' : ''}>${option}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            <div class="pagination-controls">
                <button class="page-btn" onclick="Table.changePage(${page - 1})" ${!has_prev ? 'disabled' : ''}>« Anterior</button>
                ${Utils.generatePageButtons(page, pages)}
                <button class="page-btn" onclick="Table.changePage(${page + 1})" ${!has_next ? 'disabled' : ''}>Próxima »</button>
            </div>
        `;
    },

    /**
     * Setup pagination controls
     */
    setupPaginationControls() {
        // Event delegation for dynamically created pagination controls
        document.addEventListener('change', (e) => {
            if (e.target.id === 'resultsPerPage') {
                this.changePerPage(e.target.value);
            }
        });
    },

    /**
     * Sort table by column
     */
    sortTable(column) {
        if (window.AppState.sortBy === column) {
            window.AppState.sortOrder = window.AppState.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            window.AppState.sortBy = column;
            window.AppState.sortOrder = 'desc';
        }
        
        window.AppState.currentPage = 1;
        this.fetchAndRender();
    },

    /**
     * Change current page
     */
    changePage(page) {
        window.AppState.currentPage = page;
        this.fetchAndRender();
    },

    /**
     * Change results per page
     */
    changePerPage(perPage) {
        window.AppState.perPage = parseInt(perPage);
        window.AppState.currentPage = 1;
        this.fetchAndRender();
    },

    /**
     * Handle vehicle row click
     */
    handleVehicleClick(vehicleId) {
        if (window.Details && window.Details.showVehicle) {
            window.Details.showVehicle(vehicleId);
        }
    }
};