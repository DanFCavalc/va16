/* ====================================================================
   MAIN APPLICATION - Global state management and initialization
   ==================================================================== */

// Global application state
window.AppState = {
    currentPage: 1,
    perPage: window.PAGINATION_SETTINGS.defaultPerPage,
    searchQuery: '',
    filters: {},
    sortBy: 'data_apreensao',
    sortOrder: 'desc',
    vehicles: [],
    pagination: {}
};

/**
 * Initialize the entire application
 */
async function initializeApp() {
    console.log('🚓 Initializing Vehicle Management System...');
    
    try {
        // Initialize all modules in correct order
        UI.init();
        await Filters.init();
        Search.init();
        Table.init();
        Details.init();
        ColumnManager.init();
        
        // Load initial data
        await Table.fetchAndRender();
        
        console.log('✅ Application initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing application:', error);
        UI.showError('Erro ao inicializar aplicação. Recarregue a página.');
    }
}

/**
 * Setup global event listeners
 */
function setupGlobalEventListeners() {
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+F or Cmd+F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Escape to clear search or close modals
        if (e.key === 'Escape') {
            // Close modal if open
            const modal = document.getElementById('columnModal');
            if (modal && modal.classList.contains('active')) {
                ColumnManager.closeModal();
                return;
            }
            
            // Clear search if focused
            const searchInput = document.getElementById('searchInput');
            if (searchInput === document.activeElement && searchInput.value) {
                Search.clearSearch();
            }
        }
    });
    
    // Handle window resize for responsive table
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.Table && window.Table.renderTable) {
                window.Table.renderTable();
            }
        }, 250);
    });
    
    console.log('Global event listeners setup complete');
}

/**
 * Handle application errors globally
 */
function setupErrorHandling() {
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        
        // Don't show UI errors for minor issues
        if (e.error && e.error.name !== 'NetworkError') {
            UI.showError('Erro inesperado. Recarregue a página se o problema persistir.');
        }
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        
        // Handle API errors specifically
        if (e.reason && e.reason.message && e.reason.message.includes('fetch')) {
            UI.showError('Erro de conexão com o servidor. Verifique sua conexão.');
        }
    });
    
    console.log('Error handling setup complete');
}

/**
 * Performance monitoring
 */
function setupPerformanceMonitoring() {
    // Log performance metrics
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('📊 Performance metrics:', {
                    'Page Load': `${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`,
                    'DOM Ready': `${Math.round(perfData.domContentLoadedEventEnd - perfData.loadEventStart)}ms`,
                    'Total Time': `${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`
                });
            }
        }, 0);
    });
}

/**
 * Application health check
 */
async function performHealthCheck() {
    try {
        const healthData = await API.testConnection();
        console.log('🔧 System health check:', healthData);
        
        if (healthData.status === 'success') {
            console.log(`✅ Database connected with ${healthData.model_count} vehicles`);
        }
        
        return true;
    } catch (error) {
        console.warn('⚠️ Health check failed:', error);
        return false;
    }
}

/**
 * Main initialization when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 DOM loaded, starting initialization...');
    
    // Setup global systems
    setupGlobalEventListeners();
    setupErrorHandling();
    setupPerformanceMonitoring();
    
    // Perform health check
    const isHealthy = await performHealthCheck();
    
    if (!isHealthy) {
        console.warn('⚠️ System health check failed, but continuing...');
    }
    
    // Initialize the main application
    await initializeApp();
    
    // Final setup
    console.log('🎉 Vehicle Management System ready!');
    console.log('📍 Server available at: http://localhost:5000');
    console.log('🔍 Press Ctrl+F to search, Escape to clear');
});

/**
 * Global utility functions exposed to window
 */

// Expose main functions globally for HTML onclick handlers
window.handleFunction = (action) => UI.handleFunction(action);
window.toggleCard = (header) => UI.toggleCard(header);
window.confirmDelete = (spj) => UI.confirmDelete(spj);

// Expose filter functions
window.clearAllFilters = () => Filters.clearAll();
window.removeFilter = (type) => Filters.removeFilter(type);

// Expose search functions  
window.performSearch = () => Search.performSearch();
window.selectRecentSearch = (search) => Search.selectRecentSearch(search);
window.removeRecentSearch = (search, event) => Search.removeRecentSearch(search, event);

// Expose table functions
window.sortTable = (column) => Table.sortTable(column);
window.changePage = (page) => Table.changePage(page);
window.changePerPage = (perPage) => Table.changePerPage(perPage);

// Expose column manager functions
window.openColumnModal = () => ColumnManager.openModal();
window.closeColumnModal = () => ColumnManager.closeModal();
window.toggleAllColumns = (show) => ColumnManager.toggleAll(show);
window.resetToDefaultColumns = () => ColumnManager.resetToDefault();

// Expose details functions
window.fetchVehicleDetails = (id) => Details.showVehicle(id);

// Expose filter update function for tipo checkboxes
window.updateTypeFilter = () => Filters.updateTypeFilter();