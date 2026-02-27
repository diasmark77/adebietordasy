function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return; // егер бетте search жоқ болса — қате шықпасын

  const cards = document.getElementsByClassName("card");

  input.addEventListener("input", function () {
    const filter = this.value.toLowerCase();

    for (let i = 0; i < cards.length; i++) {
      const text = cards[i].innerText.toLowerCase();
      if (text.includes(filter)) {
        cards[i].style.display = "block";
      } else {
        cards[i].style.display = "none";
      }
    }
  });
}


document.addEventListener("DOMContentLoaded", initSearch);
