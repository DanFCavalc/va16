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
    formatValue(value, isStatus = false) {
        if (!value || value.toString().trim() === '') {
            return '<span class="no-value">Não informado</span>';
        }
        
        if (isStatus) {
            const statusClass = value ? value.toLowerCase().replace(' ', '_') : '';
            return `<span class="status ${statusClass}">${value}</span>`;
        }
        
        return value;
    },

    /**
     * Render vehicle details with modern layout
     */
    renderVehicleDetails(vehicle) {
        const content = `
            <div class="detail-sections">
                
                <!-- Identificação Principal -->
                <div class="detail-section-modern">
                    <div class="section-header">
                        <h3 class="section-title-modern">🔍 Identificação</h3>
                    </div>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="detail-label-modern">SPJ:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.spj)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Status:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.status, true)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Ano SPJ:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.ano)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Circunscrição:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.circunscricao)}</span>
                        </div>
                    </div>
                </div>

                <!-- Informações do Veículo -->
                <div class="detail-section-modern">
                    <div class="section-header">
                        <h3 class="section-title-modern">🚗 Veículo</h3>
                    </div>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="detail-label-modern">Tipo:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.tipo)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Modelo:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.modelo)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Cor:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.cor)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Ano de Fabricação:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.ano_fabricacao)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Ano do Modelo:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.ano_modelo)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Chassi:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.chassi)}</span>
                        </div>
                    </div>
                </div>

                <!-- Placas -->
                <div class="detail-section-modern">
                    <div class="section-header">
                        <h3 class="section-title-modern">🔖 Placas</h3>
                    </div>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="detail-label-modern">Placa Original:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.placa_original)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Placa Ostentada:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.placa_ostentada)}</span>
                        </div>
                    </div>
                </div>

                <!-- Apreensão -->
                <div class="detail-section-modern">
                    <div class="section-header">
                        <h3 class="section-title-modern">📋 Apreensão</h3>
                    </div>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="detail-label-modern">Data da Apreensão:</span>
                            <span class="detail-value-modern">${this.formatValue(Utils.formatDetailDate(vehicle.data_apreensao))}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Última Movimentação:</span>
                            <span class="detail-value-modern">${this.formatValue(Utils.formatDetailDate(vehicle.ultima_movimentacao))}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Pátio:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.patio)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Chave:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.chave)}</span>
                        </div>
                    </div>
                </div>

                <!-- Procedimento -->
                <div class="detail-section-modern">
                    <div class="section-header">
                        <h3 class="section-title-modern">📝 Procedimento</h3>
                    </div>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="detail-label-modern">Natureza:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.natureza)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Procedimento:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.procedimento)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Nº do Procedimento:</span>
                            <span class="detail-value-modern">${this.formatValue(Utils.formatInteger(vehicle.num_procedimento))}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Equipe:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.equipe)}</span>
                        </div>
                    </div>
                </div>

                <!-- Pessoas -->
                <div class="detail-section-modern">
                    <div class="section-header">
                        <h3 class="section-title-modern">👥 Pessoas</h3>
                    </div>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="detail-label-modern">Proprietário:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.proprietario)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Pessoa Relacionada:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.pessoa_relacionada)}</span>
                        </div>
                    </div>
                </div>

                <!-- Perícia -->
                <div class="detail-section-modern">
                    <div class="section-header">
                        <h3 class="section-title-modern">🔬 Perícia</h3>
                    </div>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="detail-label-modern">Perícia:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.pericia)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Protocolo:</span>
                            <span class="detail-value-modern">${this.formatValue(Utils.formatInteger(vehicle.protocolo))}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Status da Perícia:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.status_pericia)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Número do Laudo:</span>
                            <span class="detail-value-modern">${this.formatValue(Utils.formatInteger(vehicle.numero_laudo))}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">Resultado do Laudo:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.resultado_laudo)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label-modern">AFIS:</span>
                            <span class="detail-value-modern">${this.formatValue(vehicle.afis)}</span>
                        </div>
                    </div>
                </div>

                <!-- Observações -->
                <div class="detail-section-modern">
                    <div class="section-header">
                        <h3 class="section-title-modern">📝 Observações</h3>
                    </div>
                    <div class="detail-rows">
                        <div class="detail-row detail-row-full">
                            <span class="detail-label-modern">OBS1:</span>
                            <span class="detail-value-modern detail-obs">${this.formatValue(vehicle.obs1)}</span>
                        </div>
                        <div class="detail-row detail-row-full">
                            <span class="detail-label-modern">OBS2:</span>
                            <span class="detail-value-modern detail-obs">${this.formatValue(vehicle.obs2)}</span>
                        </div>
                    </div>
                </div>

                <!-- Ações -->
                <div class="vehicle-actions-modern">
                    <button class="action-button primary" onclick="Details.handleAction('edit', '${vehicle.spj}')">
                        <span>✏️</span> Alterar Dados
                    </button>
                    <button class="action-button secondary" onclick="Details.handleAction('history', '${vehicle.spj}')">
                        <span>📊</span> Histórico
                    </button>
                    <button class="action-button secondary" onclick="Details.handleAction('print', '${vehicle.spj}')">
                        <span>🖨️</span> Imprimir
                    </button>
                    <button class="action-button danger" onclick="Details.handleAction('delete', '${vehicle.spj}')">
                        <span>🗑️</span> Excluir
                    </button>
                </div>
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