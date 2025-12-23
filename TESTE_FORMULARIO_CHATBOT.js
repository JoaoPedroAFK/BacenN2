// 🔍 TESTE DO FORMULÁRIO CHATBOT
// Execute este código no console para verificar se o formulário está configurado

(function() {
    console.log('🔍 ===== TESTE DO FORMULÁRIO CHATBOT =====');
    
    // 1. Verificar se o formulário existe
    const form = document.getElementById('form-chatbot');
    console.log('📋 Formulário encontrado?', form ? '✅ Sim' : '❌ Não');
    
    if (!form) {
        console.error('❌ Formulário form-chatbot não encontrado!');
        return;
    }
    
    // 2. Verificar se handleSubmitChatbot existe
    console.log('📋 handleSubmitChatbot existe?', typeof handleSubmitChatbot === 'function' ? '✅ Sim' : '❌ Não');
    
    // 3. Verificar event listeners
    console.log('📋 Verificando event listeners...');
    // Não há forma direta de verificar listeners, mas podemos testar
    
    // 4. Testar adicionar listener manualmente
    console.log('🧪 Adicionando listener manualmente...');
    form.addEventListener('submit', function(e) {
        console.log('🚀🚀🚀 FORMULÁRIO SUBMIT CHAMADO! 🚀🚀🚀');
        console.log('🚀 Event:', e);
        console.log('🚀 Target:', e.target);
        
        // Chamar handleSubmitChatbot se existir
        if (typeof handleSubmitChatbot === 'function') {
            console.log('✅ Chamando handleSubmitChatbot...');
            handleSubmitChatbot(e);
        } else {
            console.error('❌ handleSubmitChatbot não está disponível!');
        }
    });
    console.log('✅ Listener adicionado manualmente');
    
    // 5. Verificar botão de submit
    const submitBtn = form.querySelector('button[type="submit"]');
    console.log('📋 Botão submit encontrado?', submitBtn ? '✅ Sim' : '❌ Não');
    if (submitBtn) {
        console.log('📋 Texto do botão:', submitBtn.textContent);
    }
    
    console.log('\n✅ ===== FIM DO TESTE =====');
    console.log('💡 Agora tente salvar uma ficha pelo formulário e veja se aparece o log "FORMULÁRIO SUBMIT CHAMADO!"');
})();

