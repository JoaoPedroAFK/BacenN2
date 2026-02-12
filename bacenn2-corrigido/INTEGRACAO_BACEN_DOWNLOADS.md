# Integração Bacen (Downloads) + prioridade commit b88b6e5

**Data:** 2026-02-12  
**Origem:** `C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen`  
**Commit priorizado:** b88b6e50441f54208f05ccc52f8034457060ea0c

## O que foi feito

1. **Projeto completo do Bacen (Downloads)** copiado para `bacenn2-corrigido`:
   - **index.html** = Home - Gestão de Demandas (CANAIS: BACEN, N2, Chatbot; Dashboard Geral; Painel Admin)
   - **bacen.html**, **n2.html**, **chatbot.html** = páginas por canal
   - **admin.html** = Painel Admin com **Editar Fichas Existentes**
   - **importacao.html**, **classificacao.html**, **ra-procon.html**, **validador-demo.html**
   - **css/**, **js/** (43 arquivos), **img/**, **api/**, **functions/**, **scripts/**

2. **Arquivos do commit b88b6e5 (prioridade)** sobrescritos:
   - **configuracao-formularios.html** – configuração de ordem dos formulários
   - **js/aplicar-ordem-formularios.js**
   - **js/botao-configuracao-formularios.js**
   - **js/configuracao-ordem-formularios.js**
   - **js/editor-ordem-formularios.js** – edição de ordem dos campos/módulos (BACEN, N2, Chatbot)

## Edição de fichas

- **Admin → Editar Fichas Existentes:** em **admin.html** (aba "✏️ Editar Fichas Existentes"); usa `admin-configuracoes.js`, `fichas-especificas.js`, `ficha-detalhada.js`.
- **Ordem dos módulos/formulários:** em **configuracao-formularios.html** (acesso via botão ou `configuracao-formularios.html`); usa `editor-ordem-formularios.js`, `configuracao-ordem-formularios.js`, `aplicar-ordem-formularios.js`, `botao-configuracao-formularios.js` (versões do b88b6e5).

## Firebase

O projeto usa a pilha do Downloads: **config-firebase.js**, **firebase-init-v2.js**, **firebase-db.js** (evento `firebaseReady`). O **armazenamento-reclamacoes.js** e as páginas (bacen, n2, chatbot) permanecem na versão do Downloads compatível com essa pilha.
