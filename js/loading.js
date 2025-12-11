/* === SISTEMA DE LOADING VELOTAX === */

class LoadingVelotax {
    constructor() {
        this.loadingElement = null;
    }

    mostrar() {
        if (this.loadingElement) return;
        
        this.loadingElement = document.createElement('div');
        this.loadingElement.className = 'loading-velotax';
        this.loadingElement.innerHTML = `
            <div class="loading-content">
                <img src="img/login_velotax.gif" alt="Carregando..." class="loading-gif">
                <p class="loading-text">Carregando...</p>
            </div>
        `;
        
        document.body.appendChild(this.loadingElement);
    }

    esconder() {
        if (this.loadingElement) {
            this.loadingElement.remove();
            this.loadingElement = null;
        }
        // Remove qualquer loading que possa ter ficado
        const loadings = document.querySelectorAll('.loading-velotax');
        loadings.forEach(el => el.remove());
    }
    
    // Força esconder após um tempo máximo (segurança)
    esconderForcado() {
        setTimeout(() => {
            this.esconder();
        }, 5000); // Máximo 5 segundos
    }
}

// Adiciona estilos
const loadingStyles = `
    <style id="loading-styles">
        .loading-velotax {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(4px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        }

        .loading-content {
            text-align: center;
            color: white;
        }

        .loading-gif {
            max-width: 120px;
            height: auto;
            margin-bottom: 16px;
        }

        .loading-text {
            font-family: 'Poppins', sans-serif;
            font-size: 1.2rem;
            font-weight: 500;
            color: white;
        }
    </style>
`;

if (!document.getElementById('loading-styles')) {
    document.head.insertAdjacentHTML('beforeend', loadingStyles);
}

// Instância global
window.loadingVelotax = new LoadingVelotax();

// Garante que o loading seja escondido quando a página carregar completamente
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.loadingVelotax) {
            window.loadingVelotax.esconder();
        }
    }, 1000);
});

// Esconde loading se a página já estiver carregada
if (document.readyState === 'complete') {
    setTimeout(() => {
        if (window.loadingVelotax) {
            window.loadingVelotax.esconder();
        }
    }, 500);
}

