/**
 * Script Local para Limpar Dados do Firebase Realtime Database
 * Versão: v1.2.0
 * Data: 2025-01-31
 * Autor: VeloHub Development Team
 * 
 * Este script limpa os dados especificados no user_privacy.json
 * preservando a estrutura dos caminhos no Firebase.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuração do Firebase - Credenciais do projeto bacen-n2
const firebaseConfig = {
  databaseURL: "https://bacen-n2-default-rtdb.firebaseio.com",
  projectId: "bacen-n2"
};

// Caminho para o arquivo user_privacy.json
const userPrivacyPath = path.join(__dirname, '..', 'functions', 'user_privacy.json');

/**
 * Inicializa o Firebase Admin SDK
 */
function initializeFirebase() {
  try {
    // Verificar se já foi inicializado
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin já inicializado');
      return admin.database();
    }

    // Opção 1: Service Account Key (mais simples, não precisa de gcloud)
    // Tenta carregar service-account-key.json se existir
    try {
      const serviceAccountPath = path.join(__dirname, 'service-account-key.json');
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: firebaseConfig.databaseURL
        });
        console.log('✅ Firebase Admin inicializado com Service Account Key');
        return admin.database();
      }
    } catch (error) {
      // Continuar para próxima opção se service account falhar
    }

    // Opção 2: Application Default Credentials (requer gcloud)
    // NOTA: Esta opção geralmente NÃO funciona em ambiente local Windows
    // Prefira SEMPRE usar Service Account Key (Opção 1)
    console.log('⚠️  Service Account Key não encontrado. Tentando Application Default Credentials...');
    console.log('   (Isso geralmente não funciona no Windows. Use Service Account Key!)\n');
    
    // Não tentar Application Default Credentials - sempre falha no Windows local
    throw new Error('Service Account Key não encontrado');
    
  } catch (error) {
    // Tratamento de erro unificado
    if (error.message.includes('Service Account Key')) {
      console.error('\n❌ ERRO: Service Account Key não encontrado!\n');
      console.log('📋 SOLUÇÃO (OBRIGATÓRIA para Windows):\n');
      console.log('   1. Acesse: https://console.firebase.google.com/project/bacen-n2/settings/serviceaccounts/adminsdk');
      console.log('   2. Clique em "Gerar nova chave privada"');
      console.log('   3. Salve o arquivo JSON baixado');
      console.log('   4. Renomeie para: service-account-key.json');
      console.log('   5. Coloque o arquivo nesta pasta:');
      console.log(`      ${__dirname}`);
      console.log('   6. Execute o script novamente: npm start\n');
      console.log('⚠️  Application Default Credentials NÃO funciona no Windows local!');
      console.log('   Você DEVE usar Service Account Key.\n');
    } else {
      console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
    }
    throw error;
  }
}

/**
 * Lê o arquivo user_privacy.json
 */
function readUserPrivacyConfig() {
  try {
    const configContent = fs.readFileSync(userPrivacyPath, 'utf8');
    const config = JSON.parse(configContent);
    console.log('✅ Arquivo user_privacy.json lido com sucesso');
    return config;
  } catch (error) {
    console.error('❌ Erro ao ler user_privacy.json:', error.message);
    throw error;
  }
}

/**
 * Limpa os dados de um caminho específico no Firebase
 * Preserva a estrutura do caminho (mantém vazio)
 */
async function clearPath(database, path) {
  try {
    console.log(`\n🔄 Limpando caminho: ${path}`);
    
    // Verificar se o caminho existe
    const snapshot = await database.ref(path).once('value');
    
    if (!snapshot.exists()) {
      console.log(`   ⚠️  Caminho ${path} não existe ou já está vazio`);
      return { success: true, message: 'Caminho não existe' };
    }

    // Contar quantos registros existem
    const data = snapshot.val();
    const count = data ? Object.keys(data).length : 0;
    console.log(`   📊 Encontrados ${count} registro(s) no caminho ${path}`);

    // Limpar todos os dados do caminho
    await database.ref(path).remove();
    
    console.log(`   ✅ Caminho ${path} limpo com sucesso`);
    return { success: true, message: `${count} registro(s) removido(s)` };
  } catch (error) {
    console.error(`   ❌ Erro ao limpar caminho ${path}:`, error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando script de limpeza de dados do Firebase...\n');
  console.log('=' .repeat(60));

  try {
    // 1. Ler configuração
    const config = readUserPrivacyConfig();
    
    // 2. Verificar se há caminhos para limpar
    const pathsToClear = config.database?.clearData || [];
    
    if (pathsToClear.length === 0) {
      console.log('⚠️  Nenhum caminho configurado para limpeza em user_privacy.json');
      return;
    }

    console.log(`\n📋 Caminhos configurados para limpeza: ${pathsToClear.length}`);
    pathsToClear.forEach((path, index) => {
      console.log(`   ${index + 1}. ${path}`);
    });

    // 3. Confirmar ação
    console.log('\n⚠️  ATENÇÃO: Esta operação irá REMOVER TODOS OS DADOS dos caminhos acima!');
    console.log('   Os caminhos serão mantidos vazios (estrutura preservada).\n');

    // 4. Inicializar Firebase
    const database = initializeFirebase();

    // 5. Limpar cada caminho
    const results = [];
    for (const path of pathsToClear) {
      const result = await clearPath(database, path);
      results.push({ path, ...result });
    }

    // 6. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA OPERAÇÃO:\n');
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    results.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.path}: ${result.message}`);
    });

    console.log(`\n✅ Sucessos: ${successCount}`);
    if (failCount > 0) {
      console.log(`❌ Falhas: ${failCount}`);
    }

    console.log('\n✅ Script concluído!');
    
    // Fechar conexão
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main();
}

module.exports = { main, clearPath, initializeFirebase };

