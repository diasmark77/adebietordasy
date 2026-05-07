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

// ── Telegram-ға хабарлама жіберу ────────────────
function sendToTelegram(message) {
    const token = '8575113225:AAGA0i4BfLyvwOFPRdSnmd1ot4VTXHurfv0'; 
    const chatId = '5616776281'; 
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;
    fetch(url).catch(err => console.error("Telegram қатесі:", err));
}

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

// ── Пікірді өшіру ─────────────────────────────
async function deleteComment(commentId) {
  if (confirm("Пікірді өшіргіңіз келе ме?")) {
    try {
      const user = auth.currentUser;
      const pageTitle = document.title;
      
      // 1. Алдымен экрандағы пікірлер тізімінен өшірілетін мәтінді тауып аламыз
      // (Бұл базаға қайта сұраныс жібермей-ақ тез жұмыс істеу үшін керек)
      const commentCards = document.querySelectorAll('.comment-card');
      let deletedText = "Мәтін анықталмады";
      
      commentCards.forEach(card => {
        const btn = card.querySelector(`.delete-btn[data-id="${commentId}"]`);
        if (btn) {
          deletedText = card.querySelector('.comment-text').textContent;
        }
      });

      // 2. Базадан (Firebase) өшіру
      await deleteDoc(doc(db, "comments", pageId, "messages", commentId));
      
      // 3. Телеграмға хабарлама жіберу
      const deletionMsg = `🗑️ *Пікір өшірілді!* \n\n👤 *Кім:* ${user.displayName} \n💬 *Өшірілген мәтін:* _${deletedText}_ \n📖 *Бет:* ${pageTitle}`;
      sendToTelegram(deletionMsg);
      
      // 4. Тізімді жаңарту
      await loadComments();
      
    } catch (e) {
      console.error("Өшіру қатесі:", e);
      alert("Өшіру мүмкін болмады. Қате: " + e.message);
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
      userId: user.uid,
      createdAt: serverTimestamp()
    });
    
    // Жаңа пікір туралы хабарлама
    const msg = `🔔 *Жаңа пікір!* \n👤 *Кім:* ${user.displayName} \n💬 *Пікір:* ${text} \n📖 *Бет:* ${document.title} \n🔗 [Сілтеме](${window.location.href})`;
    sendToTelegram(msg);
    
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

      container.innerHTML += `
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
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = () => deleteComment(btn.getAttribute("data-id"));
    });
  } catch (e) {
    console.error(e);
  }
}

// ── Auth бақылау ────────────────────────────
onAuthStateChanged(auth, user => {
  const ui = {
    login: document.getElementById("login-btn"),
    logout: document.getElementById("logout-btn"),
    info: document.getElementById("user-info"),
    form: document.getElementById("comment-form"),
    note: document.getElementById("login-note"),
    name: document.getElementById("user-name"),
    photo: document.getElementById("user-photo")
  };

  if (user) {
    if(ui.login) ui.login.style.display = "none";
    if(ui.logout) ui.logout.style.display = "inline-flex";
    if(ui.info) ui.info.style.display = "flex";
    if(ui.form) ui.form.style.display = "block";
    if(ui.note) ui.note.style.display = "none";
    if(ui.name) ui.name.textContent = user.displayName;
    if(ui.photo) ui.photo.src = user.photoURL;
  } else {
    if(ui.login) ui.login.style.display = "inline-flex";
    if(ui.logout) ui.logout.style.display = "none";
    if(ui.info) ui.info.style.display = "none";
    if(ui.form) ui.form.style.display = "none";
    if(ui.note) ui.note.style.display = "block";
  }
  loadComments();
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-btn")?.addEventListener("click", login);
  document.getElementById("logout-btn")?.addEventListener("click", logout);
  document.getElementById("submit-btn")?.addEventListener("click", submitComment);
});
