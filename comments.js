// ✅ Supabase SDK (CDN арқылы жүктелген, HTML-де қосылған болуы керек)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = "https://rehdrlbhglnhajwtgohr.supabase.co";
const SUPABASE_KEY = "sb_publishable_9-WTtRK7KHkr8dQ7x30Yew_Syacj2vB";
const supabase     = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const pageId = window.location.pathname.replace(/\//g, "_").replace(".html", "");

// ── Telegram-ға хабарлама жіберу ────────────────
function sendToTelegram(message) {
    const token  = '8575113225:AAGA0i4BfLyvwOFPRdSnmd1ot4VTXHurfv0';
    const chatId = '5616776281';
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;
    fetch(url).catch(err => console.error("Telegram қатесі:", err));
}

// ── Кіру (Google OAuth) ───────────────────────
async function login() {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.href }
        });
        if (error) throw error;
    } catch (e) {
        console.error("Кіру қатесі:", e);
    }
}

// ── Шығу ──────────────────────────────────────
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Шығу қатесі:", error);
}

// ── Пікірді өшіру ─────────────────────────────
async function deleteComment(commentId) {
    if (!confirm("Пікірді өшіргіңіз келе ме?")) return;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        const pageTitle = document.title;

        // Экрандағы мәтінді алу
        let deletedText = "Мәтін анықталмады";
        document.querySelectorAll('.comment-card').forEach(card => {
            const btn = card.querySelector(`.delete-btn[data-id="${commentId}"]`);
            if (btn) deletedText = card.querySelector('.comment-text').textContent;
        });

        // Базадан өшіру
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', user.id);

        if (error) throw error;

        // Telegram хабарлама
        const deletionMsg = `🗑️ *Пікір өшірілді!* \n\n👤 *Кім:* ${user.user_metadata.full_name} \n💬 *Өшірілген мәтін:* _${deletedText}_ \n📖 *Бет:* ${pageTitle}`;
        sendToTelegram(deletionMsg);

        await loadComments();

    } catch (e) {
        console.error("Өшіру қатесі:", e);
        alert("Өшіру мүмкін болмады. Қате: " + e.message);
    }
}

// ── Пікір жіберу ─────────────────────────────
async function submitComment() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Пікір қалдыру үшін кіріңіз!");

    const input = document.getElementById("comment-input");
    const text  = input.value.trim();
    if (!text) return;

    const btn = document.getElementById("submit-btn");
    btn.disabled    = true;
    btn.textContent = "Жіберілуде...";

    try {
        const { error } = await supabase
            .from('comments')
            .insert([{
                page_id:    pageId,
                text:       text,
                user_name:  user.user_metadata.full_name,
                user_photo: user.user_metadata.avatar_url,
                user_id:    user.id,
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;

        // Telegram хабарлама
        const msg = `🔔 *Жаңа пікір!* \n👤 *Кім:* ${user.user_metadata.full_name} \n💬 *Пікір:* ${text} \n📖 *Бет:* ${document.title} \n🔗 [Сілтеме](${window.location.href})`;
        sendToTelegram(msg);

        input.value = "";
        await loadComments();

    } catch (e) {
        console.error("Жіберу қатесі:", e);
    }

    btn.disabled    = false;
    btn.textContent = "Жіберу";
}

// ── Пікірлерді жүктеу ────────────────────────
async function loadComments() {
    const container = document.getElementById("comments-list");
    if (!container) return;
    container.innerHTML = "<p class='loading-text'>Жүктелуде...</p>";

    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .eq('page_id', pageId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!comments || comments.length === 0) {
            container.innerHTML = "<p class='no-comments'>Әлі пікір жоқ.</p>";
            return;
        }

        container.innerHTML = "";
        comments.forEach(d => {
            const date    = d.created_at ? new Date(d.created_at).toLocaleDateString("kk-KZ") : "";
            const isOwner = user && d.user_id === user.id;

            container.innerHTML += `
                <div class="comment-card">
                    <img class="comment-avatar" src="${d.user_photo}" alt="${d.user_name}">
                    <div class="comment-body">
                        <div class="comment-header">
                            <span class="comment-name">${d.user_name}</span>
                            <span class="comment-date">${date}</span>
                            ${isOwner ? `<button class="delete-btn" data-id="${d.id}">Өшіру</button>` : ""}
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
        container.innerHTML = "<p class='error-text'>Пікірлерді жүктеу қатесі.</p>";
    }
}

// ── Auth бақылау ────────────────────────────
supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user ?? null;

    const ui = {
        login:  document.getElementById("login-btn"),
        logout: document.getElementById("logout-btn"),
        info:   document.getElementById("user-info"),
        form:   document.getElementById("comment-form"),
        note:   document.getElementById("login-note"),
        name:   document.getElementById("user-name"),
        photo:  document.getElementById("user-photo")
    };

    if (user) {
        if (ui.login)  ui.login.style.display  = "none";
        if (ui.logout) ui.logout.style.display = "inline-flex";
        if (ui.info)   ui.info.style.display   = "flex";
        if (ui.form)   ui.form.style.display   = "block";
        if (ui.note)   ui.note.style.display   = "none";
        if (ui.name)   ui.name.textContent      = user.user_metadata.full_name;
        if (ui.photo)  ui.photo.src             = user.user_metadata.avatar_url;
    } else {
        if (ui.login)  ui.login.style.display  = "inline-flex";
        if (ui.logout) ui.logout.style.display = "none";
        if (ui.info)   ui.info.style.display   = "none";
        if (ui.form)   ui.form.style.display   = "none";
        if (ui.note)   ui.note.style.display   = "block";
    }

    loadComments();
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login-btn")?.addEventListener("click", login);
    document.getElementById("logout-btn")?.addEventListener("click", logout);
    document.getElementById("submit-btn")?.addEventListener("click", submitComment);
});
