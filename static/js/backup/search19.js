/* ====================================================================
   SEARCH MODULE - Search functionality, autocomplete, and history
   ==================================================================== */

window.Search = {
    // Recent searches storage
    recentSearches: [],
    
    // Autocomplete debounced function
    debouncedAutocomplete: null,

    /**
     * Initialize search functionality
     */
    init() {
        this.loadRecentSearches();
        this.setupSearchInput();
        this.renderRecentSearches();
        
        // Setup debounced autocomplete
        this.debouncedAutocomplete = Utils.debounce(
            this.handleAutocomplete.bind(this), 
            window.SEARCH_SETTINGS.debounceMs
        );
        
        console.log('Search module initialized');
    },

    /**
     * Setup search input event listeners
     */
    setupSearchInput() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        // Input event for autocomplete
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length >= window.SEARCH_SETTINGS.minQueryLength) {
                this.debouncedAutocomplete(query);
            } else {
                this.hideAutocomplete();
            }
        });
        
        // Enter key to perform search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Hide autocomplete when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target)) {
                this.hideAutocomplete();
            }
        });
    },

    /**
     * Handle autocomplete suggestions
     */
    async handleAutocomplete(query) {
        try {
            const suggestions = await API.fetchAutocomplete(query);
            this.showAutocomplete(suggestions);
        } catch (error) {
            console.error('Autocomplete error:', error);
            this.hideAutocomplete();
        }
    },

    /**
     * Show autocomplete dropdown
     */
    showAutocomplete(suggestions) {
        const dropdown = document.getElementById('autocompleteDropdown');
        if (!dropdown) return;
        
        if (suggestions.length === 0) {
            this.hideAutocomplete();
            return;
        }
        
        dropdown.innerHTML = suggestions.map(suggestion => 
            `<div class="autocomplete-item" onclick="Search.selectSuggestion('${suggestion.value}')">
                <span>${suggestion.value}</span>
                <span class="autocomplete-type">${suggestion.type}</span>
            </div>`
        ).join('');
        
        dropdown.style.display = 'block';
    },

    /**
     * Hide autocomplete dropdown
     */
    hideAutocomplete() {
        const dropdown = document.getElementById('autocompleteDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    },

    /**
     * Select autocomplete suggestion
     */
    selectSuggestion(value) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = value;
            this.performSearch();
        }
        this.hideAutocomplete();
    },

    /**
     * Perform search
     */
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const query = searchInput.value.trim();
        
        // Update app state
        if (window.AppState) {
            window.AppState.searchQuery = query;
            window.AppState.currentPage = 1;
        }
        
        // Add to recent searches if not empty and not already present
        if (query && !this.recentSearches.includes(query)) {
            this.recentSearches.unshift(query);
            this.recentSearches = this.recentSearches.slice(0, window.SEARCH_SETTINGS.maxRecentSearches);
            this.saveRecentSearches();
            this.renderRecentSearches();
        }
        
        // Hide autocomplete
        this.hideAutocomplete();
        
        // Update filters display and fetch results
        if (window.Filters && window.Filters.renderActiveFilters) {
            window.Filters.renderActiveFilters();
        }
        
        if (window.Table && window.Table.fetchAndRender) {
            window.Table.fetchAndRender();
        }
    },

    /**
     * Clear search
     */
    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        if (window.AppState) {
            window.AppState.searchQuery = '';
            window.AppState.currentPage = 1;
        }
        
        this.hideAutocomplete();
        
        // Update display and fetch results
        if (window.Filters && window.Filters.renderActiveFilters) {
            window.Filters.renderActiveFilters();
        }
        
        if (window.Table && window.Table.fetchAndRender) {
            window.Table.fetchAndRender();
        }
    },

    /**
     * Load recent searches from storage
     */
    loadRecentSearches() {
        this.recentSearches = Utils.loadFromStorage('recentSearches', []);
    },

    /**
     * Save recent searches to storage
     */
    saveRecentSearches() {
        Utils.saveToStorage('recentSearches', this.recentSearches);
    },

    /**
     * Render recent searches list
     */
    renderRecentSearches() {
        const container = document.getElementById('recentSearches');
        if (!container) return;
        
        container.innerHTML = this.recentSearches.map((search, index) => 
            `<div class="recent-item ${index === 0 ? 'active' : ''}" onclick="Search.selectRecentSearch('${search}')">
                <span class="recent-item-text">${search}</span>
                <span class="recent-item-remove" onclick="Search.removeRecentSearch('${search}', event)">×</span>
            </div>`
        ).join('');
    },

    /**
     * Select search from recent searches
     */
    selectRecentSearch(search) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = search;
        }
        
        // Update active state in UI
        document.querySelectorAll('.recent-item').forEach(item => item.classList.remove('active'));
        event.target.closest('.recent-item').classList.add('active');
        
        this.performSearch();
    },

    /**
     * Remove search from recent searches
     */
    removeRecentSearch(search, event) {
        event.stopPropagation(); // Prevent triggering selectRecentSearch
        
        this.recentSearches = this.recentSearches.filter(s => s !== search);
        this.saveRecentSearches();
        this.renderRecentSearches();
        
        // If it was the current search, clear results
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value === search) {
            this.clearSearch();
        }
    }
};