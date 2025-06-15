/* ====================================================================
   API MODULE - All API calls and data fetching
   ==================================================================== */

window.API = {
    /**
     * Fetch vehicles with filters and pagination
     */
    async fetchVehicles(params = {}) {
        try {
            const searchParams = new URLSearchParams();
            
            // Add pagination
            searchParams.append('page', params.page || 1);
            searchParams.append('per_page', params.perPage || window.PAGINATION_SETTINGS.defaultPerPage);
            
            // Add search
            if (params.search) {
                searchParams.append('search', params.search);
            }
            
            // Add sorting
            searchParams.append('sort_by', params.sortBy || 'data_apreensao');
            searchParams.append('sort_order', params.sortOrder || 'desc');
            
            // Add filters, handling tipo specially for OR logic
            if (params.filters) {
                Object.entries(params.filters).forEach(([key, value]) => {
                    if (key === 'tipo' && Array.isArray(value)) {
                        // Send multiple tipo parameters for OR logic
                        value.forEach(tipo => searchParams.append('tipo', tipo));
                    } else {
                        searchParams.append(key, value);
                    }
                });
            }
            
            const response = await fetch(`${window.API_ENDPOINTS.vehicles}?${searchParams}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    },

    /**
     * Fetch vehicle details by ID
     */
    async fetchVehicleDetails(vehicleId) {
        try {
            const response = await fetch(`${window.API_ENDPOINTS.vehicleDetails}/${vehicleId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching vehicle details:', error);
            throw error;
        }
    },

    /**
     * Fetch autocomplete suggestions
     */
    async fetchAutocomplete(query) {
        try {
            if (query.length < window.SEARCH_SETTINGS.minQueryLength) {
                return [];
            }
            
            const response = await fetch(`${window.API_ENDPOINTS.autocomplete}?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching autocomplete:', error);
            return [];
        }
    },

    /**
     * Fetch filter options for dropdowns
     */
    async fetchFilterOptions() {
        try {
            const response = await fetch(window.API_ENDPOINTS.filterOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching filter options:', error);
            return {
                status: [],
                patio: [],
                circunscricao: [],
                tipo: []
            };
        }
    },

    /**
     * Fetch dashboard statistics
     */
    async fetchStatistics() {
        try {
            const response = await fetch(window.API_ENDPOINTS.statistics);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching statistics:', error);
            return {
                total_vehicles: 0,
                status_distribution: {},
                type_distribution: {},
                recent_vehicles: 0
            };
        }
    },

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const response = await fetch(window.API_ENDPOINTS.test);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error testing connection:', error);
            throw error;
        }
    }
};