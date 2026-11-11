



import "./chart.js";
import "./sidebar.js"

// NovaCart product table search/filter
document.addEventListener('DOMContentLoaded', () => {
  const search = document.getElementById('productSearch');
  const category = document.getElementById('categoryFilter');
  const table = document.getElementById('productsTable');
  if (!search || !table) return;
  const filter = () => {
    const q = search.value.toLowerCase().trim();
    const cat = category ? category.value.toLowerCase() : '';
    table.querySelectorAll('tbody tr').forEach(row => {
      const text = row.innerText.toLowerCase();
      const matchesText = !q || text.includes(q);
      const matchesCategory = !cat || text.includes(cat);
      row.style.display = matchesText && matchesCategory ? '' : 'none';
    });
  };
  search.addEventListener('input', filter);
  if (category) category.addEventListener('change', filter);
});
