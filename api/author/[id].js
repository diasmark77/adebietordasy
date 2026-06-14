const SUPABASE_URL = "https://rehdrlbhglnhajwtgohr.supabase.co";
const SUPABASE_KEY = "sb_publishable_9-WTtRK7KHkr8dQ7x30Yew_Syacj2vB";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send("ID жоқ");
  }

  // Supabase-тен автор деректерін алу
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/authors?id=eq.${id}&select=*`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  const authors = await response.json();
  const author = authors?.[0];

  if (!author) {
    return res.status(404).send("Автор табылмады");
  }

  const name = author.name || "Белгісіз автор";
  const bio = author.biography || "";
  const photo = author.photo_url || "/images/logo.png";
  const work = author.sample_work || author.work || "";
  const category = author.category || "aqyn";

  const categoryLabel = {
    aqyn: "Ақын",
    jazushy: "Жазушы",
    alash: "Алаш зиялысы",
    kompozitor: "Композитор",
  }[category] || "Автор";

  const html = `<!DOCTYPE html>
<html lang="kk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${categoryLabel} | Әдебиет ордасы</title>
  <meta name="description" content="${bio.substring(0, 160).replace(/"/g, '&quot;')}">
  <meta name="keywords" content="${name}, қазақ ${categoryLabel.toLowerCase()}, әдебиет ордасы, қазақ әдебиеті">

  <!-- Open Graph (әлеуметтік желілер үшін) -->
  <meta property="og:title" content="${name} | Әдебиет ордасы">
  <meta property="og:description" content="${bio.substring(0, 160)}">
  <meta property="og:image" content="${photo}">
  <meta property="og:type" content="profile">
  <meta property="og:url" content="https://adebiet-ordasy.vercel.app/author/${id}">

  <link rel="icon" href="/images/logo.png" type="image/png">
  <link rel="stylesheet" href="/css/menu.css">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f4f1ea; color: #333; line-height: 1.6; }
    header { text-align: center; padding: 40px 20px; background: #5c4033; color: white; }
    .author-img { width: 100%; max-width: 320px; height: auto; border-radius: 15px; margin: 20px 0; box-shadow: 0 6px 15px rgba(0,0,0,0.3); border: 4px solid white; }
    .container { width: 90%; max-width: 800px; margin: -30px auto 20px; background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); position: relative; box-sizing: border-box; }
    h1 { margin: 10px 0; font-size: 1.8rem; }
    .author-bio { font-size: 1.05rem; color: #444; margin-bottom: 25px; }
    .work-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    .work-title { color: #5c4033; font-size: 1.4rem; margin-bottom: 15px; }
    pre.author-work { white-space: pre-wrap; font-family: 'Times New Roman', serif; background: #fafafa; padding: 15px; border-radius: 10px; border-left: 5px solid #5c4033; font-size: 1rem; color: #2c3e50; overflow-x: auto; }
    .back-btn { display: inline-block; margin-top: 20px; padding: 12px 20px; background: #5c4033; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 0.9rem; }
    .cat-badge { display: inline-block; background: #f5e6d0; color: #5c4033; padding: 4px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; margin-bottom: 10px; }
    .menu-btn { position: fixed; top: 16px; left: 16px; z-index: 1000; background: #5c4033; color: white; border: none; border-radius: 8px; padding: 8px 12px; font-size: 20px; cursor: pointer; }
    footer { background: #5c4033; color: rgba(255,255,255,0.85); text-align: center; padding: 18px 20px; font-size: 13px; margin-top: 40px; }
  </style>
</head>
<body>

<button class="menu-btn" onclick="toggleMenu()">☰</button>
<div class="overlay" id="overlay" onclick="toggleMenu()"></div>
<nav id="menu">
  <button onclick="location.href='/index.html'">🏠 Басты бет</button>
  <button onclick="location.href='/authors-filtre.html'">✍️ Авторлар</button>
  <button onclick="location.href='/poemGame.html'">🎮 Қаламгер ойыны</button>
  <button onclick="location.href='/contact.html'">📩 Байланыс</button>
  <button onclick="location.href='/poems.html'">📝 Өлеңдер</button>
  <button onclick="location.href='/shygarms.html'">📑 Шығармалар</button>
</nav>

<header>
  <img src="${photo}" alt="${name} суреті" class="author-img" onerror="this.src='/images/logo.png'">
  <span class="cat-badge">${categoryLabel}</span>
  <h1>${name}</h1>
</header>

<div class="container">
  <p class="author-bio">${bio}</p>

  ${work ? `
  <div class="work-section">
    <h2 class="work-title">Шығармадан үзінді</h2>
    <pre class="author-work">${work.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </div>` : ''}

  <a href="/authors-filtre.html" class="back-btn">← Авторлар тізіміне оралу</a>
</div>

<footer>© 2026 Әдебиет ордасы | Қазақ әдеби порталы</footer>

<script src="/css/menu.css"></script>
<script>
function toggleMenu() {
  document.getElementById('menu').classList.toggle('show');
  document.getElementById('overlay').classList.toggle('show');
}
</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  return res.status(200).send(html);
}
