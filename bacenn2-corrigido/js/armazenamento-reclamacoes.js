/**
 * ArmazenamentoReclamacoes - Gerenciamento de Fichas no Firebase
 * Versão: v1.0.0
 * Projeto: BacenN2
 * 
 * Gerencia o armazenamento e carregamento de fichas de reclamações
 * usando Firebase Realtime Database com caminhos corretos
 */
class ArmazenamentoReclamacoes {
  constructor() {
    this.firebaseDB = null;
    this.isReady = false;
    
    // Aguardar Firebase estar pronto
    if (window.firebaseManager) {
      window.firebaseManager.onReady(() => {
        this.firebaseDB = window.firebaseManager.getDatabase();
        this.isReady = true;
        console.log('✅ ArmazenamentoReclamacoes: Firebase pronto');
        
        // Disparar evento customizado
        window.dispatchEvent(new CustomEvent('armazenamentoReady', {
          detail: { armazenamento: this }
        }));
      });
    } else {
      // Aguardar FirebaseManager ser criado
      const checkInterval = setInterval(() => {
        if (window.firebaseManager) {
          clearInterval(checkInterval);
          window.firebaseManager.onReady(() => {
            this.firebaseDB = window.firebaseManager.getDatabase();
            this.isReady = true;
            console.log('✅ ArmazenamentoReclamacoes: Firebase pronto');
            
            window.dispatchEvent(new CustomEvent('armazenamentoReady', {
              detail: { armazenamento: this }
            }));
          });
        }
      }, 100);
    }
  }

  /**
   * Salva uma ficha no Firebase
   * @param {Object} ficha - Objeto com os dados da ficha
   * @param {String} tipo - Tipo da ficha: 'bacen', 'n2', ou 'chatbot'
   * @param {Boolean} usarPush - Se true, usa push() para gerar ID automático
   * @returns {Promise<String>} ID da ficha salva
   */
  async salvar(ficha, tipo = 'bacen', usarPush = false) {
    if (!this.isReady || !this.firebaseDB) {
      throw new Error('Firebase não está pronto. Aguarde o evento armazenamentoReady.');
    }

    if (!['bacen', 'n2', 'chatbot'].includes(tipo)) {
      throw new Error('Tipo inválido. Use: bacen, n2 ou chatbot');
    }

    try {
      const caminho = `fichas_${tipo}`;
      
      if (usarPush) {
        // Usar push() para criar novo registro com ID automático
        const ref = this.firebaseDB.ref(caminho);
        const novoRef = ref.push();
        const fichaCompleta = {
          ...ficha,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        await novoRef.set(fichaCompleta);
        console.log('✅ Ficha criada no Firebase com ID:', novoRef.key, 'Tipo:', tipo);
        return novoRef.key;
      } else {
        // Usar set() para salvar/sobrescrever em caminho específico
        if (!ficha.id) {
          throw new Error('ID da ficha é obrigatório quando usarPush=false');
        }
        const ref = this.firebaseDB.ref(`${caminho}/${ficha.id}`);
        const fichaCompleta = {
          ...ficha,
          updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        await ref.set(fichaCompleta);
        console.log('✅ Ficha salva no Firebase:', ficha.id, 'Tipo:', tipo);
        return ficha.id;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar ficha:', error);
      throw error;
    }
  }

  /**
   * Atualiza campos específicos de uma ficha sem sobrescrever outros
   * @param {String} id - ID da ficha
   * @param {Object} campos - Campos a atualizar
   * @param {String} tipo - Tipo da ficha: 'bacen', 'n2', ou 'chatbot'
   * @returns {Promise<Boolean>} true se atualizado com sucesso
   */
  async atualizar(id, campos, tipo = 'bacen') {
    if (!this.isReady || !this.firebaseDB) {
      throw new Error('Firebase não está pronto.');
    }

    if (!['bacen', 'n2', 'chatbot'].includes(tipo)) {
      throw new Error('Tipo inválido. Use: bacen, n2 ou chatbot');
    }

    try {
      const caminho = `fichas_${tipo}/${id}`;
      const ref = this.firebaseDB.ref(caminho);
      
      // Usar update() para atualizar apenas campos específicos
      const camposAtualizados = {
        ...campos,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      };
      
      await ref.update(camposAtualizados);
      
      console.log('✅ Ficha atualizada no Firebase:', id, 'Tipo:', tipo);
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar ficha:', error);
      throw error;
    }
  }

  /**
   * Carrega todas as fichas de um tipo específico
   * @param {String} tipo - Tipo da ficha: 'bacen', 'n2', ou 'chatbot'
   * @returns {Promise<Array>} Array de fichas
   */
  async carregarTodos(tipo = 'bacen') {
    if (!this.isReady || !this.firebaseDB) {
      throw new Error('Firebase não está pronto. Aguarde o evento armazenamentoReady.');
    }

    if (!['bacen', 'n2', 'chatbot'].includes(tipo)) {
      throw new Error('Tipo inválido. Use: bacen, n2 ou chatbot');
    }

    try {
      const caminho = `fichas_${tipo}`;
      console.log(`📥 Carregando fichas do tipo '${tipo}' do caminho: ${caminho}`);
      
      // Usar once('value') para leitura única
      const snapshot = await this.firebaseDB.ref(caminho).once('value');
      const fichas = snapshot.val() || {};
      
      // Converter objeto em array
      const fichasArray = Object.keys(fichas).map(key => ({
        id: key,
        ...fichas[key]
      }));

      console.log(`✅ ${fichasArray.length} fichas do tipo '${tipo}' carregadas do Firebase`);
      return fichasArray;
    } catch (error) {
      console.error('❌ Erro ao carregar fichas:', error);
      throw error;
    }
  }

  /**
   * Carrega uma ficha específica por ID
   * @param {String} id - ID da ficha
   * @param {String} tipo - Tipo da ficha: 'bacen', 'n2', ou 'chatbot'
   * @returns {Promise<Object|null>} Ficha ou null se não encontrada
   */
  async carregarPorId(id, tipo = 'bacen') {
    if (!this.isReady || !this.firebaseDB) {
      throw new Error('Firebase não está pronto.');
    }

    if (!['bacen', 'n2', 'chatbot'].includes(tipo)) {
      throw new Error('Tipo inválido. Use: bacen, n2 ou chatbot');
    }

    try {
      const caminho = `fichas_${tipo}/${id}`;
      console.log(`📥 Carregando ficha ${id} do tipo '${tipo}'`);
      
      const snapshot = await this.firebaseDB.ref(caminho).once('value');
      const ficha = snapshot.val();
      
      if (ficha) {
        console.log(`✅ Ficha ${id} carregada com sucesso`);
        return { id, ...ficha };
      }
      
      console.log(`⚠️ Ficha ${id} não encontrada`);
      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar ficha:', error);
      throw error;
    }
  }

  /**
   * Monitora alterações em tempo real usando on('value')
   * @param {Function} callback - Função chamada quando há alterações
   * @param {String} tipo - Tipo da ficha: 'bacen', 'n2', ou 'chatbot'
   * @returns {Function} Função para remover o listener
   */
  observarFichas(callback, tipo = 'bacen') {
    if (!this.isReady || !this.firebaseDB) {
      throw new Error('Firebase não está pronto.');
    }

    if (!['bacen', 'n2', 'chatbot'].includes(tipo)) {
      throw new Error('Tipo inválido. Use: bacen, n2 ou chatbot');
    }

    const caminho = `fichas_${tipo}`;
    const ref = this.firebaseDB.ref(caminho);
    
    console.log(`👂 Iniciando observação em tempo real do tipo '${tipo}'`);
    
    // Usar on('value') para monitoramento em tempo real
    ref.on('value', (snapshot) => {
      const fichas = snapshot.val() || {};
      const fichasArray = Object.keys(fichas).map(key => ({
        id: key,
        ...fichas[key]
      }));
      console.log(`📊 Atualização em tempo real: ${fichasArray.length} fichas do tipo '${tipo}'`);
      callback(fichasArray);
    });

    // Retornar função para remover listener
    return () => {
      ref.off('value');
      console.log(`✅ Listener removido do tipo '${tipo}'`);
    };
  }

  /**
   * Remove uma ficha
   * @param {String} id - ID da ficha
   * @param {String} tipo - Tipo da ficha: 'bacen', 'n2', ou 'chatbot'
   * @returns {Promise<Boolean>} true se removida com sucesso
   */
  async remover(id, tipo = 'bacen') {
    if (!this.isReady || !this.firebaseDB) {
      throw new Error('Firebase não está pronto.');
    }

    try {
      const caminho = `fichas_${tipo}/${id}`;
      const ref = this.firebaseDB.ref(caminho);
      await ref.remove();
      console.log('✅ Ficha removida do Firebase:', id, 'Tipo:', tipo);
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover ficha:', error);
      throw error;
    }
  }
}

// Criar instância global
window.armazenamentoReclamacoes = new ArmazenamentoReclamacoes();

