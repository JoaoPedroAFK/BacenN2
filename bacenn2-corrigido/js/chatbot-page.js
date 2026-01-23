/**
 * Chatbot Page - Página do Chatbot
 * Versão: v1.0.0
 * Projeto: BacenN2
 * 
 * Gerencia a página do chatbot e navegação entre seções
 */
(function() {
  'use strict';

  /**
   * Função global para mostrar seções
   * Deve estar disponível globalmente para os botões
   */
  window.mostrarSecao = function(secaoId) {
    console.log('🔍 Mostrando seção:', secaoId);
    
    // Esconder todas as seções
    document.querySelectorAll('.secao').forEach(secao => {
      secao.style.display = 'none';
      secao.classList.remove('ativa');
    });
    
    // Mostrar seção selecionada
    const secao = document.getElementById(secaoId);
    if (secao) {
      secao.style.display = 'block';
      secao.classList.add('ativa');
      console.log('✅ Seção exibida:', secaoId);
    } else {
      console.warn('⚠️ Seção não encontrada:', secaoId);
    }
  };

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
   * Inicializa o chatbot
   */
  async function inicializarChatbot() {
    try {
      console.log('🚀 Inicializando Chatbot Page...');
      
      // Aguardar Firebase
      await aguardarFirebase();
      console.log('✅ Firebase Manager pronto');

      // Aguardar ArmazenamentoReclamacoes
      await aguardarArmazenamento();
      console.log('✅ ArmazenamentoReclamacoes pronto');

      console.log('✅ Chatbot inicializado com sucesso');
      
      // Continuar inicialização do chatbot...
      inicializarInterface();
    } catch (error) {
      console.error('❌ Erro ao inicializar chatbot:', error);
      mostrarErro('Erro ao inicializar chatbot. Recarregue a página.');
    }
  }

  /**
   * Inicializa interface do chatbot
   */
  function inicializarInterface() {
    // Mostrar primeira seção por padrão
    const primeiraSecao = document.querySelector('.secao');
    if (primeiraSecao) {
      window.mostrarSecao(primeiraSecao.id);
    }

    // Adicionar event listeners aos botões
    document.querySelectorAll('[data-secao]').forEach(botao => {
      botao.addEventListener('click', (e) => {
        const secaoId = e.currentTarget.getAttribute('data-secao');
        window.mostrarSecao(secaoId);
      });
    });

    console.log('✅ Interface do chatbot inicializada');
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

  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarChatbot);
  } else {
    inicializarChatbot();
  }

})();

