import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyC_aLF4dK_m0jvkbSzhTWo3rsP7yx5uoXw",
  authDomain: "adebiet-ordasy.firebaseapp.com",
  projectId: "adebiet-ordasy",
  storageBucket: "adebiet-ordasy.firebasestorage.app",
  messagingSenderId: "331787955330",
  appId: "1:331787955330:web:a77853b5bffdb44bed989b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Беттің идентификаторы (URL бойынша)
const pageId = window.location.pathname.replace(/\//g, "_").replace(".html", "");

// ── Кіру / Шығу ──────────────────────────────
async function login() {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error("Кіру қатесі:", e);
  }
}

async function logout() {
  await signOut(auth);
}

// ── Пікір жіберу ─────────────────────────────
async function submitComment() {
  const user = auth.currentUser;
  if (!user) return alert("Пікір қалдыру үшін кіріңіз!");

  const input = document.getElementById("comment-input");
  const text = input.value.trim();
  if (!text) return;

  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.textContent = "Жіберілуде...";

  try {
    await addDoc(collection(db, "comments", pageId, "messages"), {
      text,
      userName: user.displayName,
      userPhoto: user.photoURL,
      userId: user.uid,
      createdAt: serverTimestamp()
    });
    input.value = "";
    await loadComments();
  } catch (e) {
    console.error("Жіберу қатесі:", e);
  }

  btn.disabled = false;
  btn.textContent = "Жіберу";
}

// ── Пікірлерді жүктеу ────────────────────────
async function loadComments() {
  const container = document.getElementById("comments-list");
  container.innerHTML = "<p class='loading-text'>Жүктелуде...</p>";

  try {
    const q = query(
      collection(db, "comments", pageId, "messages"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = "<p class='no-comments'>Әлі пікір жоқ. Бірінші болыңыз!</p>";
      return;
    }

    container.innerHTML = "";
    snapshot.forEach(doc => {
      const d = doc.data();
      const date = d.createdAt?.toDate?.()?.toLocaleDateString("kk-KZ") ?? "";
      container.innerHTML += `
        <div class="comment-card">
          <img class="comment-avatar" src="${d.userPhoto}" alt="${d.userName}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(d.userName)}&background=8B4513&color=fff'">
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-name">${d.userName}</span>
              <span class="comment-date">${date}</span>
            </div>
            <p class="comment-text">${d.text}</p>
          </div>
        </div>`;
    });
  } catch (e) {
    container.innerHTML = "<p class='error-text'>Қате шықты, қайта жүктеңіз.</p>";
    console.error(e);
  }
}

// ── Auth күйін бақылау ────────────────────────
onAuthStateChanged(auth, user => {
  const loginBtn  = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const userInfo  = document.getElementById("user-info");
  const form      = document.getElementById("comment-form");
  const loginNote = document.getElementById("login-note");

  if (user) {
    loginBtn.style.display  = "none";
    logoutBtn.style.display = "inline-flex";
    userInfo.style.display  = "flex";
    form.style.display      = "block";
    loginNote.style.display = "none";
    document.getElementById("user-name").textContent  = user.displayName;
    document.getElementById("user-photo").src         = user.photoURL;
  } else {
    loginBtn.style.display  = "inline-flex";
    logoutBtn.style.display = "none";
    userInfo.style.display  = "none";
    form.style.display      = "none";
    loginNote.style.display = "block";
  }
});

// ── Батырмаларды байлау ───────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-btn").addEventListener("click", login);
  document.getElementById("logout-btn").addEventListener("click", logout);
  document.getElementById("submit-btn").addEventListener("click", submitComment);
  loadComments();
});

// Telegram хабарлама функциясы
function sendToTelegram(userName, text) {
    const token = '8575113225:AAGA0i4BfLyvwOFPRdSnmd1ot4VTXHurfv0'; 
    const chatId = '5616776281';
    const message = `🔔 *Әдебиет Ордасы: Жаңа пікір!*\n\n👤 *Кім:* ${userName}\n💬 *Пікір:* ${text}`;

    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;

    fetch(url)
        .then(() => console.log("Telegram-ға сәтті жіберілді!"))
        .catch(err => console.error("Telegram қатесі:", err));
}
