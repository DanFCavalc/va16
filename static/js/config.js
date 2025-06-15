/* ====================================================================
   CONFIGURATION - Constants, column configuration, and settings
   ==================================================================== */

// Column configuration mapping
window.COLUMN_CONFIG = {
    spj: 'SPJ',
    ano: 'ANO', 
    natureza: 'NATUREZA',
    procedimento: 'PROCEDIMENTO',
    equipe: 'EQUIPE',
    num_procedimento: 'Nº PROC.',
    status: 'STATUS',
    chave: 'CHAVE',
    circunscricao: 'CIRCUNSCRIÇÃO',
    patio: 'PÁTIO',
    data_apreensao: 'DATA APREENSÃO',
    ultima_movimentacao: 'ÚLTIMA MOVIM.',
    tipo: 'TIPO',
    modelo: 'MODELO',
    cor: 'COR',
    ano_fabricacao: 'ANO FAB.',
    ano_modelo: 'ANO MOD.',
    placa_original: 'PLACA ORIG.',
    placa_ostentada: 'PLACA OST.',
    chassi: 'CHASSI',
    proprietario: 'PROPRIETÁRIO',
    pessoa_relacionada: 'PESSOA REL.',
    pericia: 'PERÍCIA',
    protocolo: 'PROTOCOLO',
    status_pericia: 'STATUS PER.',
    numero_laudo: 'Nº LAUDO',
    resultado_laudo: 'RESULTADO',
    afis: 'AFIS',
    obs1: 'OBS1',
    obs2: 'OBS2'
};

// Default visible columns
window.DEFAULT_VISIBLE_COLUMNS = [
    'spj', 'status', 'tipo', 'modelo', 'placa_original', 
    'data_apreensao', 'patio', 'circunscricao'
];

// API endpoints
window.API_ENDPOINTS = {
    vehicles: '/api/vehicles',
    vehicleDetails: '/api/vehicle',
    autocomplete: '/api/search/autocomplete',
    filterOptions: '/api/filters/options',
    statistics: '/api/statistics',
    test: '/api/test'
};

// Pagination settings
window.PAGINATION_SETTINGS = {
    defaultPerPage: 5,
    availableOptions: [5, 10, 25, 50]
};

// Search settings
window.SEARCH_SETTINGS = {
    minQueryLength: 2,
    debounceMs: 300,
    maxRecentSearches: 5
};

// Animation settings
window.ANIMATION_SETTINGS = {
    cardToggleDuration: 300,
    chipFadeInDuration: 300,
    modalFadeInDuration: 300
};