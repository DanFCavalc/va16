/* ====================================================================
   UI MODULE - General UI management and interactions
   ==================================================================== */

window.UI = {
    /**
     * Toggle card expansion/collapse
     */
    toggleCard(header) {
        const content = header.nextElementSibling;
        const chevron = header.querySelector('.card-chevron, .results-chevron, .details-chevron');
        
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            chevron.classList.remove('collapsed');
        } else {
            content.classList.add('collapsed');
            chevron.classList.add('collapsed');
        }
    },

    /**
     * Handle function button clicks
     */
    handleFunction(action) {
        switch(action) {
            case 'cadastrar':
                Utils.alert('Cadastrar novo veículo apreendido');
                break;
            case 'relatorio':
                Utils.alert('Gerar relatório de veículos');
                break;
            case 'backup':
                Utils.alert('Fazer backup do sistema');
                break;
            case 'settings':
                Utils.alert('Configurações do sistema');
                break;
            default:
                console.log('Função não reconhecida:', action);
        }
    },

    /**
     * Show loading spinner
     */
    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        const table = document.getElementById('tableContainer');
        const error = document.getElementById('errorMessage');
        
        if (spinner) spinner.style.display = 'flex';
        if (table) table.style.display = 'none';
        if (error) error.style.display = 'none';
    },

    /**
     * Hide loading spinner
     */
    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        const table = document.getElementById('tableContainer');
        
        if (spinner) spinner.style.display = 'none';
        if (table) table.style.display = 'block';
    },

    /**
     * Show error message
     */
    showError(message) {
        const error = document.getElementById('errorMessage');
        const spinner = document.getElementById('loadingSpinner');
        const table = document.getElementById('tableContainer');
        
        if (error) {
            error.textContent = message || 'Erro ao carregar dados. Tente novamente.';
            error.style.display = 'block';
        }
        if (spinner) spinner.style.display = 'none';
        if (table) table.style.display = 'none';
    },

    /**
     * Auto-collapse results section when vehicle is selected
     */
    autoCollapseResults() {
        const resultsContent = document.querySelector('.results-content');
        const resultsChevron = document.querySelector('.results-chevron');
        
        if (resultsContent && !resultsContent.classList.contains('collapsed')) {
            // Add animation class
            resultsContent.classList.add('auto-collapsed');
            
            // Apply collapse after delay for animation
            setTimeout(() => {
                resultsContent.classList.add('collapsed');
                resultsChevron.classList.add('collapsed');
                resultsContent.classList.remove('auto-collapsed');
            }, 100);
            
            // Add visual feedback on details header
            setTimeout(() => {
                const detailsHeader = document.querySelector('.details-header');
                if (detailsHeader) {
                    detailsHeader.classList.add('vehicle-selected', 'highlight');
                    
                    // Remove highlight after 2 seconds
                    setTimeout(() => {
                        detailsHeader.classList.remove('highlight');
                        setTimeout(() => {
                            detailsHeader.classList.remove('vehicle-selected');
                        }, 300);
                    }, 2000);
                }
            }, 400);
        }
    },

    /**
     * Auto-expand results section when searching or filtering
     */
    autoExpandResults() {
        const resultsContent = document.querySelector('.results-content');
        const resultsChevron = document.querySelector('.results-chevron');
        
        if (resultsContent && resultsContent.classList.contains('collapsed')) {
            resultsContent.classList.remove('collapsed');
            resultsChevron.classList.remove('collapsed');
        }
    },

    /**
     * Auto-collapse details card when searching or filtering
     */
    autoCollapseDetails() {
        const detailsContent = document.querySelector('.details-card .details-content');
        const detailsChevron = document.querySelector('.details-chevron');
        
        if (detailsContent && !detailsContent.classList.contains('collapsed')) {
            detailsContent.classList.add('collapsed');
            detailsChevron.classList.add('collapsed');
            
            // Show empty state
            this.showEmptyVehicleDetails();
        }
    },

    /**
     * Expand details card if collapsed
     */
    expandDetailsCard() {
        const detailsCard = document.querySelector('.details-card .details-content');
        const detailsChevron = document.querySelector('.details-chevron');
        
        if (detailsCard && detailsCard.classList.contains('collapsed')) {
            detailsCard.classList.remove('collapsed');
            detailsChevron.classList.remove('collapsed');
        }
    },

    /**
     * Show initial empty state for vehicle details
     */
    showEmptyVehicleDetails() {
        const content = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 200px; text-align: center;">
                <div>
                    <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">🔍</div>
                    <div style="color: #94a3b8; font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                        Nenhum veículo selecionado
                    </div>
                    <div style="color: #64748b; font-size: 14px;">
                        Pesquise e selecione um veículo acima
                    </div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('vehicleDetailsContent');
        if (container) {
            container.innerHTML = content;
        }
    },

    /**
     * Confirm vehicle deletion
     */
    confirmDelete(spj) {
        if (Utils.confirm(`Tem certeza que deseja excluir o veículo ${spj}?\n\nEsta ação não pode ser desfeita.`)) {
            Utils.alert(`Veículo ${spj} excluído com sucesso!`);
        }
    },

    /**
     * Initialize UI components
     */
    init() {
        // Show initial empty state
        this.showEmptyVehicleDetails();
        
        // Setup modal click-outside-to-close
        const columnModal = document.getElementById('columnModal');
        if (columnModal) {
            columnModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    ColumnManager.closeModal();
                }
            });
        }
        
        console.log('UI module initialized');
    }
};