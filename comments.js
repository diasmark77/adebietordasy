import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc }
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

// ── Telegram хабарлама функциясы ──────────────
function sendToTelegram(userName, text) {
    const token = '8575113225:AAGA0i4BfLyvwOFPRdSnmd1ot4VTXHurfv0'; 
    const chatId = '5616776281'; 
    const pageTitle = document.title; 
    const pageUrl = window.location.href; 

    const message = `🔔 *Жаңа пікір!* \n\n👤 *Кім:* ${userName} \n💬 *Пікір:* ${text} \n📖 *Бет:* ${pageTitle} \n🔗 [Сілтемеге өту](${pageUrl})`;

    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;

    fetch(url).catch(err => console.error("Бот қатесі:", err));
}

// ── Пікірді өшіру функциясы ──────────────────
async function deleteComment(commentId) {
  if (confirm("Пікірді өшіргіңіз келе ме?")) {
    try {
      await deleteDoc(doc(db, "comments", pageId, "messages", commentId));
      loadComments(); // Тізімді жаңарту
    } catch (e) {
      console.error("Өшіру қатесі:", e);
      alert("Өшіру мүмкін болмады.");
    }
  }
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
      userId: user.uid, // Авторды анықтау үшін керек
      createdAt: serverTimestamp()
    });
    
    sendToTelegram(user.displayName, text);
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
  if(!container) return;
  container.innerHTML = "<p class='loading-text'>Жүктелуде...</p>";

  try {
    const q = query(
      collection(db, "comments", pageId, "messages"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    container.innerHTML = snapshot.empty ? "<p class='no-comments'>Әлі пікір жоқ.</p>" : "";

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const date = d.createdAt?.toDate?.()?.toLocaleDateString("kk-KZ") ?? "";
      const isOwner = auth.currentUser && d.userId === auth.currentUser.uid;

      const commentHtml = `
        <div class="comment-card">
          <img class="comment-avatar" src="${d.userPhoto}" alt="${d.userName}">
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-name">${d.userName}</span>
              <span class="comment-date">${date}</span>
              ${isOwner ? `<button class="delete-btn" data-id="${docSnap.id}">Өшіру</button>` : ""}
            </div>
            <p class="comment-text">${d.text}</p>
          </div>
        </div>`;
      container.innerHTML += commentHtml;
    });

    // Өшіру батырмаларына оқиға қосу
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = () => deleteComment(btn.getAttribute("data-id"));
    });

  } catch (e) {
    console.error(e);
  }
}

// ── Auth күйін бақылау және батырмаларды байлау ─
onAuthStateChanged(auth, user => {
  const elements = ["login-btn", "logout-btn", "user-info", "comment-form", "login-note"];
  const ui = {};
  elements.forEach(id => ui[id] = document.getElementById(id));

  if (user) {
    if(ui["login-btn"]) ui["login-btn"].style.display = "none";
    if(ui["logout-btn"]) ui["logout-btn"].style.display = "inline-flex";
    if(ui["user-info"]) ui["user-info"].style.display = "flex";
    if(ui["comment-form"]) ui["comment-form"].style.display = "block";
    if(ui["login-note"]) ui["login-note"].style.display = "none";
    document.getElementById("user-name").textContent = user.displayName;
    document.getElementById("user-photo").src = user.photoURL;
  } else {
    if(ui["login-btn"]) ui["login-btn"].style.display = "inline-flex";
    if(ui["logout-btn"]) ui["logout-btn"].style.display = "none";
    if(ui["user-info"]) ui["user-info"].style.display = "none";
    if(ui["comment-form"]) ui["comment-form"].style.display = "none";
    if(ui["login-note"]) ui["login-note"].style.display = "block";
  }
  loadComments(); // Пайдаланушы өзгергенде өшіру батырмасы көрінуі үшін
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-btn")?.addEventListener("click", login);
  document.getElementById("logout-btn")?.addEventListener("click", logout);
  document.getElementById("submit-btn")?.addEventListener("click", submitComment);
});
