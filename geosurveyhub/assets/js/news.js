// news.js — Fetch and render news cards with category filtering
// Optional per-article field in news.json: "sourceUrl": "https://..." (original article).
// When set, "Read article" opens the publisher. Otherwise links to this site's news page anchor.

function newsPageHref(articleId) {
  const inPagesFolder = /\/pages\//.test(window.location.pathname);
  return `${inPagesFolder ? '' : 'pages/'}news.html#${articleId}`;
}

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
    container.innerHTML = list.map(article => {
      const src = article.source ? `<span class="news-source">${escapeHtml(article.source)}</span>` : '';
      const externalUrl = article.sourceUrl ? safeHttpUrl(article.sourceUrl) : null;
      const summary = (article.excerpt || '').trim()
        || 'Summary not on file — use the link below for the full story.';
      const host = externalUrl ? escapeHtml(String(externalUrl).replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '')) : '';
      const footer = externalUrl
        ? `<footer class="news-card-footer">
            <a class="news-read-full" href="${escapeHtml(externalUrl)}" target="_blank" rel="noopener noreferrer"
               aria-label="${escapeHtmlAttr(`Read full article — ${article.title}`)}">Read full article</a>
            ${host ? `<span class="news-link-host">${host}</span>` : ''}
          </footer>`
        : `<footer class="news-card-footer">
            <a class="news-read-full news-read-full--internal" href="${escapeHtml(newsPageHref(article.id))}">View on this page</a>
          </footer>`;
      return `
      <article class="news-card" id="${escapeHtml(article.id)}" data-category="${escapeHtml(article.category)}">
        <div class="news-meta">
          <span class="news-date">${formatDate(article.date)}</span>
          <span class="news-tag">${escapeHtml(article.category)}</span>
        </div>
        ${src}
        <h3 class="news-title">${escapeHtml(article.title)}</h3>
        <p class="news-summary">${escapeHtml(summary)}</p>
        ${footer}
      </article>`;
    }).join('');
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeHtmlAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

/** Only allow http(s) URLs for source links (avoids javascript: etc.) */
function safeHttpUrl(raw) {
  try {
    const url = new URL(String(raw).trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.href;
  } catch {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Full news page
  loadNews('news-grid', 'news-filter');
  // Homepage preview (3 items)
  loadNews('news-preview', null, 3);
});
