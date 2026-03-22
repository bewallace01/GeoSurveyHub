// news.js — Fetch and render news cards with category filtering

async function loadNews(containerId, filterBarId, limit = null) {
  const container = document.getElementById(containerId);
  const filterBar = document.getElementById(filterBarId);
  if (!container) return;

  let articles = [];

  try {
    // Try relative path from pages/ or root
    const paths = ['../content/news.json', './content/news.json'];
    for (const path of paths) {
      try {
        const res = await fetch(path);
        if (res.ok) { articles = await res.json(); break; }
      } catch {}
    }
  } catch (e) {
    container.innerHTML = '<p style="color: var(--muted)">Could not load news.</p>';
    return;
  }

  if (limit) articles = articles.slice(0, limit);

  // Collect unique categories
  const categories = ['All', ...new Set(articles.map(a => a.category))];

  // Render filter bar
  if (filterBar) {
    filterBar.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-cat="${cat}">${cat}</button>
    `).join('');

    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        renderArticles(cat === 'All' ? articles : articles.filter(a => a.category === cat));
      });
    });
  }

  renderArticles(articles);

  function renderArticles(list) {
    container.innerHTML = list.map(article => `
      <div class="news-card" id="${article.id}" data-category="${article.category}">
        <div class="news-meta">
          <span class="news-date">${formatDate(article.date)}</span>
          <span class="news-tag">${article.category}</span>
        </div>
        <div class="news-title">${article.title}</div>
        <div class="news-excerpt">${article.excerpt}</div>
        <a href="news.html#${article.id}" class="read-more">Read More</a>
      </div>
    `).join('');
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

document.addEventListener('DOMContentLoaded', () => {
  // Full news page
  loadNews('news-grid', 'news-filter');
  // Homepage preview (3 items)
  loadNews('news-preview', null, 3);
});
