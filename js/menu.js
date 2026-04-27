// Басындағы '/' таңбасы және репозиторий аты (adebietordasy) өте маңызды!
fetch("/adebietordasy/menu.html")
.then(res => {
  if (!res.ok) throw new Error('Меню файлы табылмады!');
  return res.text();
})
.then(data => {
  document.getElementById("menu-container").innerHTML = data;
})
.catch(err => console.error(err));

function toggleMenu(){
  const menu = document.getElementById("menu");
  const overlay = document.getElementById("overlay");
  if(menu && overlay) {
    menu.classList.toggle("show");
    overlay.classList.toggle("show");
  }
}

// Scroll батырмалары
setTimeout(function() {
  const menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) {
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'scroll-buttons';
    scrollDiv.innerHTML = `
      <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" class="scroll-btn">⬆</button>
      <button onclick="window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})" class="scroll-btn">⬇</button>
    `;
    menuBtn.after(scrollDiv);
  }
}, 300); // Күту уақытын сәл ұзарттық, меню жүктеліп үлгеруі үшін


// Scroll батырмаларын меню батырмасының астына қос
setTimeout(function() {
  const menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) {
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'scroll-buttons';
    scrollDiv.innerHTML = `
      <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" class="scroll-btn">⬆</button>
      <button onclick="window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})" class="scroll-btn">⬇</button>
    `;
    menuBtn.after(scrollDiv);
  }
}, 100);
