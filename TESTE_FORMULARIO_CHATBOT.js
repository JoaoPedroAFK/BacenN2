// 🔍 TESTE DO FORMULÁRIO CHATBOT
// Execute este código no console para verificar se o formulário está configurado

(function() {
    console.log('🔍 ===== TESTE DO FORMULÁRIO CHATBOT =====');
    
    // 1. Verificar se o formulário existe
    const form = document.getElementById('form-chatbot');
    console.log('📋 Formulário encontrado?', form ? '✅ Sim' : '❌ Não');
    
    if (!form) {
        console.error('❌ Formulário form-chatbot não encontrado!');
        console.log('🔍 Procurando formulários na página...');
        const forms = document.querySelectorAll('form');
        console.log('📋 Formulários encontrados:', forms.length);
        forms.forEach((f, i) => {
            console.log(`   ${i + 1}. ID: ${f.id}, Classes: ${f.className}`);
        });
        return;
    }
    
    // 2. Verificar se handleSubmitChatbot existe
    console.log('📋 handleSubmitChatbot existe?', typeof handleSubmitChatbot === 'function' ? '✅ Sim' : '❌ Não');
    console.log('📋 window.handleSubmitChatbot existe?', typeof window.handleSubmitChatbot === 'function' ? '✅ Sim' : '❌ Não');
    
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
        } else if (typeof window.handleSubmitChatbot === 'function') {
            console.log('✅ Chamando window.handleSubmitChatbot...');
            window.handleSubmitChatbot(e);
        } else {
            console.error('❌ handleSubmitChatbot não está disponível!');
            console.error('   typeof handleSubmitChatbot:', typeof handleSubmitChatbot);
            console.error('   typeof window.handleSubmitChatbot:', typeof window.handleSubmitChatbot);
        }
    });
    console.log('✅ Listener adicionado manualmente');
    
    // 5. Verificar botão de submit
    const submitBtn = form.querySelector('button[type="submit"]');
    console.log('📋 Botão submit encontrado?', submitBtn ? '✅ Sim' : '❌ Não');
    if (submitBtn) {
        console.log('📋 Texto do botão:', submitBtn.textContent);
        console.log('📋 ID do botão:', submitBtn.id);
    } else {
        // Procurar botões no formulário
        const buttons = form.querySelectorAll('button');
        console.log('📋 Botões encontrados no formulário:', buttons.length);
        buttons.forEach((btn, i) => {
            console.log(`   ${i + 1}. Tipo: ${btn.type}, Texto: ${btn.textContent}, ID: ${btn.id}`);
        });
    }
    
    // 6. Verificar se configurarEventosChatbot foi chamada
    console.log('📋 configurarEventosChatbot existe?', typeof configurarEventosChatbot === 'function' ? '✅ Sim' : '❌ Não');
    if (typeof configurarEventosChatbot === 'function') {
        console.log('🧪 Chamando configurarEventosChatbot novamente...');
        try {
            configurarEventosChatbot();
            console.log('✅ configurarEventosChatbot executada com sucesso');
        } catch (error) {
            console.error('❌ Erro ao executar configurarEventosChatbot:', error);
        }
    }
    
    console.log('\n✅ ===== FIM DO TESTE =====');
    console.log('💡 Agora tente salvar uma ficha pelo formulário e veja se aparece o log "FORMULÁRIO SUBMIT CHAMADO!"');
})();
