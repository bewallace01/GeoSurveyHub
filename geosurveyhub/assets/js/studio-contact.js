(function () {
  const form = document.getElementById('studio-contact-form');
  const wrap = document.getElementById('studio-contact-form-wrap');
  const success = document.getElementById('studio-contact-success');

  if (form) {
    const id =
      typeof window.STUDIO_FORMSPREE_FORM_ID === 'string'
        ? window.STUDIO_FORMSPREE_FORM_ID.trim()
        : '';
    if (id && !id.includes('YOUR_')) {
      form.action = `https://formspree.io/f/${id.replace(/^\//, '')}`;
    }
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('sent') === '1' && wrap && success) {
    wrap.hidden = true;
    success.hidden = false;
    success.focus();
  }
})();
