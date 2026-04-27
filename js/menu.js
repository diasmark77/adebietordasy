fetch("../menu.html")
.then(res => res.text())
.then(data => {
  document.getElementById("menu-container").innerHTML = data;
});

function toggleMenu(){
  document.getElementById("menu").classList.toggle("show");
  document.getElementById("overlay").classList.toggle("show");
}

// Scroll батырмаларын меню батырмасының астына қос
document.addEventListener("DOMContentLoaded", function() {
  const scrollDiv = document.createElement('div');
  scrollDiv.className = 'scroll-buttons';
  scrollDiv.innerHTML = `
    <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" class="scroll-btn">⬆</button>
    <button onclick="window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})" class="scroll-btn">⬇</button>
  `;
  document.querySelector('.menu-btn').after(scrollDiv);
});
