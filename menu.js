fetch("/menu.html")
.then(res => res.text())
.then(data => {
document.getElementById("menu-container").innerHTML = data;
});

function toggleMenu(){
document.getElementById("menu").classList.toggle("show");
document.getElementById("overlay").classList.toggle("show");
}
