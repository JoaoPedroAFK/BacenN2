/* === CONFIGURAÇÃO FIREBASE === */
/* 
 * Para usar Firebase:
 * 1. Acesse https://console.firebase.google.com
 * 2. Crie um novo projeto
 * 3. Ative Firestore Database
 * 4. Copie as credenciais abaixo
 * 5. Substitua os valores de configuração
 */

// Configuração Firebase (substitua com suas credenciais)
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializar Firebase (descomente quando configurar)
// import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
// import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// Exportar para uso
// window.firebaseDB = db;

