<script type="module">
  // Firebase негізгі модульдер
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

  // Firebase config (сенің кілттерің)
  const firebaseConfig = {
    apiKey: "AIzaSyCGwoBeiG0blGR0_GTQ74FFo0gew95-dBw",
    authDomain: "adebietordasy.firebaseapp.com",
    projectId: "adebietordasy",
    storageBucket: "adebietordasy.firebasestorage.app",
    messagingSenderId: "933110984004",
    appId: "1:933110984004:web:a9a9dba11325950ed1fb11"
  };

  // Инициализация
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Басқа беттерде қолдану үшін экспорт
  export { app, auth, db };
</script>