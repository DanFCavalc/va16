/* ====================================================================
   DETAILS MODULE - Vehicle details display and actions
   ==================================================================== */

window.Details = {
    /**
     * Initialize details functionality
     */
    init() {
        console.log('Details module initialized');
    },

    /**
     * Show vehicle details
     */
    async showVehicle(vehicleId) {
        try {
            const vehicle = await API.fetchVehicleDetails(vehicleId);
            this.renderVehicleDetails(vehicle);
            
            // Auto-expand details card and collapse results
            UI.expandDetailsCard();
            UI.autoCollapseResults();
            
        } catch (error) {
            console.error('Error fetching vehicle details:', error);
            Utils.alert('Erro ao carregar detalhes do veículo.');
        }
    },

    /**
     * Format value or return "Não informado" for empty values
     */
    formatValue(value, fieldType = 'default') {
        if (!value || value.toString().trim() === '') {
            return '<span class="no-value">Não informado</span>';
        }
        
        // Special formatting for specific field types
        switch(fieldType) {
            case 'status':
                // Clean the status value and create class name
                const cleanStatus = value.toString().toLowerCase()
                    .trim()                        // Remove leading/trailing spaces
                    .replace(/\s+/g, '_')         // Replace spaces with underscores
                    .replace(/[àáâãä]/g, 'a')     // Handle accents
                    .replace(/[èéêë]/g, 'e')
                    .replace(/[ìíîï]/g, 'i')
                    .replace(/[òóôõö]/g, 'o')
                    .replace(/[ùúûü]/g, 'u')
                    .replace(/ç/g, 'c')
                    .replace(/ã/g, 'a')
                    .replace(/õ/g, 'o')
                    .replace(/[^a-z0-9_]/g, '');  // Remove special characters
                return `<span class="status-text ${cleanStatus}" title="Status: ${value}">${value}</span>`;
            case 'spj':
                return `<span class="spj-text">${value}</span>`;
            case 'chassi':
                return `<span class="chassi-text">${value}</span>`;
            default:
                return value;
        }
    },

    /**
     * Render vehicle details
     */
    renderVehicleDetails(vehicle) {
        const content = `
            <div class="detail-section">
                <h3 class="section-title">Ocorrência</h3>
                <div class="detail-grid">
                    <div class="detail-group">
                        <div class="detail-label">SPJ</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.spj, 'spj')}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">ANO</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.ano)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Natureza</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.natureza)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Procedimento</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.procedimento)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Equipe</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.equipe)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Nº Procedimento</div>
                        <div class="detail-value-text">${this.formatValue(Utils.formatInteger(vehicle.num_procedimento))}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3 class="section-title">Apreensão</h3>
                <div class="detail-grid">
                    <div class="detail-group">
                        <div class="detail-label">Status</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.status, 'status')}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Chave</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.chave)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Circunscrição</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.circunscricao)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Pátio</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.patio)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Data da Apreensão</div>
                        <div class="detail-value-text">${this.formatValue(Utils.formatDetailDate(vehicle.data_apreensao))}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Última Movimentação</div>
                        <div class="detail-value-text">${this.formatValue(Utils.formatDetailDate(vehicle.ultima_movimentacao))}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3 class="section-title">Veículo</h3>
                <div class="detail-grid">
                    <div class="detail-group">
                        <div class="detail-label">Tipo</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.tipo)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Modelo</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.modelo)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Ano de Fabricação</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.ano_fabricacao)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Ano do Modelo</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.ano_modelo)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Cor</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.cor)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Chassi</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.chassi, 'chassi')}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Placa Original</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.placa_original)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Placa Ostentada</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.placa_ostentada)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Proprietário</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.proprietario)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Pessoa Relacionada</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.pessoa_relacionada)}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3 class="section-title">Perícia</h3>
                <div class="detail-grid">
                    <div class="detail-group">
                        <div class="detail-label">Perícia</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.pericia)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Protocolo</div>
                        <div class="detail-value-text">${this.formatValue(Utils.formatInteger(vehicle.protocolo))}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Status da Perícia</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.status_pericia)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Número do Laudo</div>
                        <div class="detail-value-text">${this.formatValue(Utils.formatInteger(vehicle.numero_laudo))}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Resultado do Laudo</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.resultado_laudo)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">AFIS</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.afis)}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3 class="section-title">Observações</h3>
                <div class="detail-grid-single">
                    <div class="detail-group">
                        <div class="detail-label">OBS1</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.obs1)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">OBS2</div>
                        <div class="detail-value-text">${this.formatValue(vehicle.obs2)}</div>
                    </div>
                </div>
            </div>
            
            <div class="vehicle-actions">
                <button class="action-button primary" onclick="Details.handleAction('edit', '${vehicle.spj}')">Alterar Dados</button>
                <button class="action-button danger" onclick="Details.handleAction('delete', '${vehicle.spj}')">Excluir Veículo</button>
                <button class="action-button secondary" onclick="Details.handleAction('history', '${vehicle.spj}')">Histórico</button>
                <button class="action-button secondary" onclick="Details.handleAction('print', '${vehicle.spj}')">Imprimir Ficha</button>
            </div>
        `;
        
        const container = document.getElementById('vehicleDetailsContent');
        if (container) {
            container.innerHTML = content;
        }
    },

    /**
     * Handle vehicle action buttons
     */
    handleAction(action, spj) {
        switch(action) {
            case 'edit':
                Utils.alert(`Alterar dados do veículo ${spj}`);
                break;
            case 'delete':
                UI.confirmDelete(spj);
                break;
            case 'history':
                Utils.alert(`Ver histórico do veículo ${spj}`);
                break;
            case 'print':
                Utils.alert(`Imprimir ficha do veículo ${spj}`);
                break;
            default:
                console.log('Ação não reconhecida:', action);
        }
    }
};