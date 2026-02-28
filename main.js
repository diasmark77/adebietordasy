// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_aLF4dK_m0jvkbSzhTWo3rsP7yx5uoXw",
  authDomain: "adebietordasy.firebaseapp.com",
  projectId: "adebiet-ordasy",
  storageBucket: "adebietordasy.firebasestorage.app",
  messagingSenderId: "331787955330",
  appId: "1:331787955330:web:a77853b5bffdb44bed989b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
