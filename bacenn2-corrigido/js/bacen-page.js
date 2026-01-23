/**
 * Bacen Page - Página Principal do BacenN2
 * Versão: v1.0.0
 * Projeto: BacenN2
 * 
 * Gerencia a exibição e carregamento de fichas do tipo 'bacen'
 */
(function() {
  'use strict';

  let fichas = [];
  let carregando = false;
  let removeListener = null;

  /**
   * Aguarda Firebase estar pronto
   */
  async function aguardarFirebase() {
    return new Promise((resolve) => {
      if (window.firebaseManager && window.firebaseManager.getReady()) {
        resolve();
      } else if (window.firebaseManager) {
        window.firebaseManager.onReady(resolve);
      } else {
        // Aguardar FirebaseManager ser criado
        const checkInterval = setInterval(() => {
          if (window.firebaseManager) {
            clearInterval(checkInterval);
            if (window.firebaseManager.getReady()) {
              resolve();
            } else {
              window.firebaseManager.onReady(resolve);
            }
          }
        }, 100);
      }
    });
  }

  /**
   * Aguarda ArmazenamentoReclamacoes estar pronto
   */
  async function aguardarArmazenamento() {
    return new Promise((resolve) => {
      if (window.armazenamentoReclamacoes && window.armazenamentoReclamacoes.isReady) {
        resolve();
      } else {
        window.addEventListener('armazenamentoReady', resolve, { once: true });
      }
    });
  }

  /**
   * Inicializa a página
   */
  async function inicializar() {
    try {
      console.log('🚀 Inicializando Bacen Page...');
      
      // Aguardar Firebase Manager
      await aguardarFirebase();
      console.log('✅ Firebase Manager pronto');

      // Aguardar ArmazenamentoReclamacoes estar pronto
      await aguardarArmazenamento();
      console.log('✅ ArmazenamentoReclamacoes pronto');

      console.log('✅ Tudo pronto, carregando fichas...');
      await carregarFichas();

      // Opcional: Observar mudanças em tempo real
      // observarMudancasTempoReal();
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      mostrarErro('Erro ao inicializar. Recarregue a página.');
    }
  }

  /**
   * Carrega fichas do Firebase
   */
  async function carregarFichas() {
    if (carregando) {
      console.log('⏳ Já está carregando...');
      return;
    }

    carregando = true;
    mostrarLoading(true);

    try {
      if (!window.armazenamentoReclamacoes || !window.armazenamentoReclamacoes.isReady) {
        throw new Error('ArmazenamentoReclamacoes não está pronto');
      }

      // Carregar fichas do tipo 'bacen'
      fichas = await window.armazenamentoReclamacoes.carregarTodos('bacen');
      console.log(`✅ ${fichas.length} fichas carregadas`);
      
      renderizarFichas();
      mostrarLoading(false);
    } catch (error) {
      console.error('❌ Erro ao carregar fichas:', error);
      mostrarErro('Erro ao carregar fichas. Tente novamente.');
      mostrarLoading(false);
    } finally {
      carregando = false;
    }
  }

  /**
   * Observa mudanças em tempo real
   */
  function observarMudancasTempoReal() {
    if (removeListener) {
      removeListener(); // Remover listener anterior se existir
    }

    try {
      removeListener = window.armazenamentoReclamacoes.observarFichas((fichasAtualizadas) => {
        fichas = fichasAtualizadas;
        renderizarFichas();
        console.log('🔄 Fichas atualizadas em tempo real');
      }, 'bacen');
    } catch (error) {
      console.error('❌ Erro ao observar mudanças:', error);
    }
  }

  /**
   * Renderiza fichas na página
   */
  function renderizarFichas() {
    const container = document.getElementById('fichas-container');
    if (!container) {
      console.warn('⚠️ Container #fichas-container não encontrado');
      return;
    }

    if (fichas.length === 0) {
      container.innerHTML = '<p class="sem-fichas">Nenhuma ficha encontrada.</p>';
      return;
    }

    container.innerHTML = fichas.map(ficha => `
      <div class="ficha-card" data-id="${ficha.id}">
        <h3>${escapeHtml(ficha.titulo || 'Sem título')}</h3>
        <p>${escapeHtml(ficha.descricao || '')}</p>
        <div class="ficha-meta">
          <small>ID: ${ficha.id}</small>
          ${ficha.createdAt ? `<small>Data: ${formatarData(ficha.createdAt)}</small>` : ''}
        </div>
      </div>
    `).join('');

    console.log(`✅ ${fichas.length} fichas renderizadas`);
  }

  /**
   * Mostra indicador de carregamento
   */
  function mostrarLoading(mostrar) {
    const loading = document.getElementById('loading-indicator');
    if (loading) {
      loading.style.display = mostrar ? 'block' : 'none';
    }
  }

  /**
   * Mostra mensagem de erro
   */
  function mostrarErro(mensagem) {
    const erro = document.getElementById('erro-mensagem');
    if (erro) {
      erro.textContent = mensagem;
      erro.style.display = 'block';
    } else {
      alert(mensagem);
    }
  }

  /**
   * Escapa HTML para prevenir XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Formata timestamp do Firebase
   */
  function formatarData(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  }

  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }

  // Limpar listener ao sair da página
  window.addEventListener('beforeunload', () => {
    if (removeListener) {
      removeListener();
    }
  });

})();

