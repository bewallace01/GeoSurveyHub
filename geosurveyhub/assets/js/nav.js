// nav.js — Sticky nav, dropdowns, mobile menu

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  window.addEventListener(
    'scroll',
    () => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    },
    { passive: true }
  );

  const toggle = nav.querySelector('.nav-toggle');
  const primaryNav = nav.querySelector('#primary-nav');

  function setBodyScrollLock(lock) {
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  function closeDropdowns() {
    nav.querySelectorAll('[data-nav-dropdown].is-open').forEach((dd) => {
      dd.classList.remove('is-open');
      const b = dd.querySelector('.nav-dropdown-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  function closeMobileMenu() {
    nav.classList.remove('nav-is-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
    setBodyScrollLock(false);
  }

  if (toggle && primaryNav) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = nav.classList.toggle('nav-is-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      setBodyScrollLock(open);
      if (!open) closeDropdowns();
    });
  }

  nav.querySelectorAll('[data-nav-dropdown]').forEach((dd) => {
    const btn = dd.querySelector('.nav-dropdown-btn');
    const panel = dd.querySelector('.nav-dropdown-panel');
    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !dd.classList.contains('is-open');
      nav.querySelectorAll('[data-nav-dropdown]').forEach((other) => {
        if (other !== dd) {
          other.classList.remove('is-open');
          const ob = other.querySelector('.nav-dropdown-btn');
          if (ob) ob.setAttribute('aria-expanded', 'false');
        }
      });
      dd.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', willOpen);
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      closeDropdowns();
      closeMobileMenu();
    } else if (!e.target.closest('[data-nav-dropdown]')) {
      closeDropdowns();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdowns();
      closeMobileMenu();
    }
  });

  nav.querySelectorAll('.nav-dropdown-panel a').forEach((link) => {
    link.addEventListener('click', () => {
      closeDropdowns();
      closeMobileMenu();
    });
  });

  let path = window.location.pathname.replace(/\/$/, '');
  const current = path.split('/').pop() || 'index.html';
  const cur = current.split('?')[0];

  function isHomeHref(href) {
    if (!href || href.startsWith('#')) return false;
    const h = href.split('?')[0];
    return h === '/' || h === '../' || /(^|\/)index\.html$/.test(h);
  }

  const isHomePage = !path || cur === 'index.html';

  nav.querySelectorAll('.nav-links a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    const last = href.split('/').pop().split('?')[0];
    if (last === cur || (isHomePage && isHomeHref(href))) {
      link.classList.add('active');
    }
  });

  nav.querySelectorAll('.nav-dropdown-panel a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const last = href.split('/').pop().split('?')[0];
    if (last === cur || (isHomePage && isHomeHref(href))) {
      link.classList.add('active');
      const dd = link.closest('[data-nav-dropdown]');
      const btn = dd && dd.querySelector('.nav-dropdown-btn');
      if (btn) btn.classList.add('active');
    }
  });
});
