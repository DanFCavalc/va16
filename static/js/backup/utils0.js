/* ====================================================================
   UTILITY FUNCTIONS - Helper functions and formatting
   ==================================================================== */

window.Utils = {
    /**
     * Format date for display in details view
     */
    formatDetailDate(value) {
        if (!value) return '';
        const str = value.toString();
        
        // Year only
        if (/^\d{4}$/.test(str)) return str;
        
        // Numeric timestamp
        if (/^\d+(?:\.\d+)?$/.test(str)) {
            const num = parseInt(str.split('.')[0], 10);
            const dateObj = str.length <= 10 ? new Date(num * 1000) : new Date(num);
            if (!isNaN(dateObj)) {
                const dd = String(dateObj.getDate()).padStart(2, '0');
                const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                const yyyy = dateObj.getFullYear();
                return `${dd}/${mm}/${yyyy}`;
            }
        }
        
        // ISO or other date string
        const dateObj = new Date(str);
        if (!isNaN(dateObj)) {
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const yyyy = dateObj.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        }
        
        return value;
    },

    /**
     * Format date for table display (dd/mm/yyyy)
     */
    formatTableDate(value, fieldName) {
        if (!['data_apreensao', 'ultima_movimentacao'].includes(fieldName) || !value) {
            return value;
        }
        
        const valStr = value.toString();
        let dateObj = null;
        
        if (/^\d+(?:\.\d+)?$/.test(valStr)) {
            const num = parseInt(valStr.split('.')[0], 10);
            dateObj = valStr.length <= 10 ? new Date(num * 1000) : new Date(num);
        } else if (!/^\d{4}$/.test(valStr)) {
            dateObj = new Date(valStr);
        }
        
        if (dateObj && !isNaN(dateObj)) {
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const yyyy = dateObj.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        }
        
        return value;
    },

    /**
     * Format integer values (remove decimals)
     */
    formatInteger(value) {
        if (value === null || value === undefined) return '';
        return value.toString().split('.')[0];
    },

    /**
     * Debounce function execution
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Save data to localStorage safely
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn(`Não foi possível salvar ${key}:`, error);
            return false;
        }
    },

    /**
     * Load data from localStorage safely
     */
    loadFromStorage(key, defaultValue = null) {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (error) {
            console.warn(`Não foi possível carregar ${key}:`, error);
            return defaultValue;
        }
    },

    /**
     * Generate page buttons for pagination
     */
    generatePageButtons(currentPage, totalPages, maxVisible = 5) {
        let buttons = '';
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        for (let i = start; i <= end; i++) {
            buttons += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="Table.changePage(${i})">${i}</button>`;
        }
        
        return buttons;
    },

    /**
     * Get drop position for drag and drop
     */
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.column-item:not(.dragging)')];
        return draggableElements
            .map(el => {
                const box = el.getBoundingClientRect();
                return { element: el, offset: y - box.top - box.height / 2 };
            })
            .filter(item => item.offset < 0)
            .sort((a, b) => b.offset - a.offset)[0]
            ?.element || null;
    },

    /**
     * Show confirmation dialog
     */
    confirm(message) {
        return confirm(message);
    },

    /**
     * Show alert dialog
     */
    alert(message) {
        alert(message);
    }
};