/* === VALIDAÇÃO CONDICIONAL - PRAZO BACEN === */

function validarPrazoBacen() {
    const origem = document.getElementById('bacen-origem').value;
    const prazoBacen = document.getElementById('bacen-prazo-bacen');
    const labelPrazo = document.querySelector('label[for="bacen-prazo-bacen"]');
    const obrigatorioSpan = document.getElementById('prazo-bacen-obrigatorio');
    
    if (origem === 'Bacen Celcoin' || origem === 'Bacen Via Capital') {
        // Tornar obrigatório
        prazoBacen.required = true;
        if (obrigatorioSpan) {
            obrigatorioSpan.style.display = 'inline';
        }
        if (labelPrazo) {
            labelPrazo.style.color = 'var(--azul-royal)';
        }
    } else {
        // Tornar opcional
        prazoBacen.required = false;
        if (obrigatorioSpan) {
            obrigatorioSpan.style.display = 'none';
        }
        if (labelPrazo) {
            labelPrazo.style.color = '';
        }
    }
}

// Inicializar validação quando a página carregar
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        const origemSelect = document.getElementById('bacen-origem');
        if (origemSelect) {
            origemSelect.addEventListener('change', validarPrazoBacen);
            // Validar estado inicial
            validarPrazoBacen();
        }
    });
}





