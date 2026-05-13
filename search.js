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


  window.onload = function() {
    // 1. URL-ден "search" параметрін іздейміз (мысалы: poems.html?search=Ақжол)
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    if (searchQuery) {
      // 2. Іздеу ұяшығын (input) тауып, оған автордың атын жазамыз
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = searchQuery;

        // 3. Сенің search.js файлындағы іздеу функциясын қолмен іске қосамыз
        // Егер функцияның аты басқа болса (мысалы, filterTable), соны жаз
        if (typeof filterSearch === "function") {
            filterSearch(); 
        } else {
            // Егер арнайы функция болмаса, жай ғана "input" оқиғасын тудырамыз
            searchInput.dispatchEvent(new Event('input'));
        }
      }
    }
  };
document.addEventListener("DOMContentLoaded", initSearch);
