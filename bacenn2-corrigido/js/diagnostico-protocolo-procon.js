/**
 * Diagnóstico: Protocolo Procon - BacenN2
 * Versão: v1.0.0
 * 
 * Script para diagnosticar e corrigir problema com opções do campo protocoloProcon
 */

(function() {
  'use strict';

  /**
   * Diagnostica o problema com protocoloProcon
   */
  function diagnosticarProtocoloProcon() {
    console.log('🔍 ===== DIAGNÓSTICO: protocoloProcon =====');
    
    // Verificar se adminConfiguracoes está disponível
    if (!window.adminConfiguracoes) {
      console.error('❌ window.adminConfiguracoes não está disponível');
      console.log('💡 Certifique-se de que admin-configuracoes.js foi carregado');
      return;
    }

    try {
      // Obter configuração
      const config = window.adminConfiguracoes.obterConfiguracao();
      
      if (!config) {
        console.error('❌ Não foi possível obter configuração');
        return;
      }

      console.log('📋 Configuração completa:', config);

      // Verificar onde está protocoloProcon
      const emTexto = config.camposTexto?.find(c => c.id === 'protocoloProcon' || c.campo === 'protocoloProcon');
      const emLista = config.listas?.find(c => c.id === 'protocoloProcon' || c.campo === 'protocoloProcon');

      console.log('\n🔍 Verificando localização de protocoloProcon:');
      console.log('   Em camposTexto:', emTexto ? '✅ SIM' : '❌ NÃO');
      console.log('   Em listas:', emLista ? '✅ SIM' : '❌ NÃO');

      if (emTexto) {
        console.warn('\n⚠️ PROBLEMA IDENTIFICADO:');
        console.warn('   protocoloProcon está em camposTexto mas o código está tentando obter opções!');
        console.log('\n💡 SOLUÇÃO:');
        console.log('   1. Se precisa de opções: Mover para listas no Firebase');
        console.log('   2. Se não precisa: Corrigir código para não buscar opções de campos texto');
        console.log('\n📝 Estrutura atual:', emTexto);
      }

      if (emLista) {
        console.log('\n✅ protocoloProcon está em listas (correto)');
        console.log('📋 Opções disponíveis:', emLista.opcoes || 'Nenhuma opção definida');
        
        if (!emLista.opcoes || emLista.opcoes.length === 0) {
          console.warn('\n⚠️ ATENÇÃO: Campo está em listas mas não tem opções definidas!');
          console.log('💡 Adicione opções no Firebase em: admin_configuracoes/listas/protocoloProcon/opcoes');
        }
      }

      if (!emTexto && !emLista) {
        console.warn('\n⚠️ protocoloProcon não foi encontrado em nenhum lugar!');
        console.log('💡 Verifique se o campo está configurado no Firebase');
      }

      // Verificar função obterOpcoes
      if (typeof window.adminConfiguracoes.obterOpcoes === 'function') {
        console.log('\n🔍 Testando obterOpcoes:');
        try {
          const opcoes = window.adminConfiguracoes.obterOpcoes('protocoloProcon', 'texto');
          console.log('   Resultado para tipo "texto":', opcoes);
          
          const opcoesLista = window.adminConfiguracoes.obterOpcoes('protocoloProcon', 'lista');
          console.log('   Resultado para tipo "lista":', opcoesLista);
        } catch (error) {
          console.error('   ❌ Erro ao testar obterOpcoes:', error);
        }
      }

      console.log('\n✅ ===== FIM DO DIAGNÓSTICO =====');
    } catch (error) {
      console.error('❌ Erro durante diagnóstico:', error);
    }
  }

  // Expor função globalmente
  window.diagnosticarProtocoloProcon = diagnosticarProtocoloProcon;

  // Executar automaticamente após 2 segundos (aguardar carregamento)
  setTimeout(() => {
    if (window.adminConfiguracoes && window.adminConfiguracoes.isReady) {
      diagnosticarProtocoloProcon();
    } else {
      console.log('⏳ Aguardando adminConfiguracoes estar pronto...');
      const checkInterval = setInterval(() => {
        if (window.adminConfiguracoes && window.adminConfiguracoes.isReady) {
          clearInterval(checkInterval);
          diagnosticarProtocoloProcon();
        }
      }, 500);
      
      // Timeout após 10 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
        console.warn('⏰ Timeout: adminConfiguracoes não ficou pronto em 10 segundos');
      }, 10000);
    }
  }, 2000);

  console.log('✅ Script de diagnóstico carregado. Execute: diagnosticarProtocoloProcon()');

})();
