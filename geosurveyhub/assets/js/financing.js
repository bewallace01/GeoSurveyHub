// financing.js — Financing Interest Form
// No <form> tags. Pure JS validation + submission.

const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'; // replace on deploy
const IS_NETLIFY = typeof __NETLIFY !== 'undefined'; // set true for Netlify

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('financing-form');
  const submitBtn = document.getElementById('financing-submit');
  const consentContact = document.getElementById('consent_contact');
  const consentEdu = document.getElementById('consent_educational');

  if (!form) return;

  // ── CONSENT GATES SUBMIT BUTTON ──────────────────────────
  function updateSubmitState() {
    const enabled = consentContact?.checked && consentEdu?.checked;
    submitBtn.disabled = !enabled;
    submitBtn.style.opacity = enabled ? '1' : '0.4';
    submitBtn.setAttribute('aria-disabled', !enabled);
  }

  consentContact?.addEventListener('change', updateSubmitState);
  consentEdu?.addEventListener('change', updateSubmitState);
  updateSubmitState();

  // ── CUSTOM CHECKBOX TOGGLE ────────────────────────────────
  document.querySelectorAll('.custom-checkbox').forEach(wrapper => {
    const input = wrapper.querySelector('input[type="checkbox"]');
    const box = wrapper.querySelector('.checkbox-box');
    if (!input || !box) return;

    wrapper.addEventListener('click', (e) => {
      e.preventDefault();
      input.checked = !input.checked;
      box.classList.toggle('checked', input.checked);
      input.dispatchEvent(new Event('change'));
    });

    // Keyboard support
    wrapper.setAttribute('tabindex', '0');
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        input.checked = !input.checked;
        box.classList.toggle('checked', input.checked);
        input.dispatchEvent(new Event('change'));
      }
    });
  });

  // ── VALIDATION ────────────────────────────────────────────
  const REQUIRED_FIELDS = [
    { id: 'full_name', label: 'Full Name' },
    { id: 'email', label: 'Email Address' },
    { id: 'state', label: 'State / Region' },
    { id: 'project_type', label: 'Project Type' },
    { id: 'budget_range', label: 'Budget Range' },
  ];

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getCheckedCategories() {
    return Array.from(
      form.querySelectorAll('input[name="equipment_categories"]:checked')
    ).map(cb => cb.value);
  }

  function clearErrors() {
    form.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
    form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
  }

  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const wrapper = field.closest('.field-group');
    if (wrapper) {
      wrapper.classList.add('field-error');
      const msg = document.createElement('span');
      msg.className = 'field-error-msg';
      msg.setAttribute('role', 'alert');
      msg.textContent = message;
      wrapper.appendChild(msg);
    }
  }

  function validate() {
    clearErrors();
    let firstError = null;
    let isValid = true;

    // Required text/select fields
    REQUIRED_FIELDS.forEach(({ id, label }) => {
      const field = document.getElementById(id);
      if (!field) return;
      const value = field.value.trim();

      if (!value) {
        showFieldError(id, `${label} is required.`);
        if (!firstError) firstError = field;
        isValid = false;
      } else if (id === 'email' && !validateEmail(value)) {
        showFieldError(id, 'Please enter a valid email address.');
        if (!firstError) firstError = field;
        isValid = false;
      }
    });

    // Equipment categories (at least one)
    const categories = getCheckedCategories();
    if (categories.length === 0) {
      const wrapper = document.getElementById('equipment-categories-group');
      if (wrapper) {
        wrapper.classList.add('field-error');
        const msg = document.createElement('span');
        msg.className = 'field-error-msg';
        msg.setAttribute('role', 'alert');
        msg.textContent = 'Please select at least one equipment category.';
        wrapper.appendChild(msg);
        if (!firstError) firstError = wrapper;
      }
      isValid = false;
    }

    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }

    return isValid;
  }

  // ── COLLECT FORM DATA ─────────────────────────────────────
  function collectData() {
    const getValue = (id) => document.getElementById(id)?.value?.trim() || '';

    return {
      full_name: getValue('full_name'),
      email: getValue('email'),
      phone: getValue('phone'),
      company: getValue('company'),
      job_title: getValue('job_title'),
      state: getValue('state'),
      project_type: getValue('project_type'),
      project_scale: getValue('project_scale'),
      timeline: getValue('timeline'),
      equipment_categories: getCheckedCategories().join(', '),
      budget_range: getValue('budget_range'),
      specific_equipment: getValue('specific_equipment'),
      notes: getValue('notes'),
      _subject: `Equipment Financing Interest — ${getValue('full_name')}`,
    };
  }

  // ── SUBMIT ────────────────────────────────────────────────
  submitBtn?.addEventListener('click', async () => {
    if (!validate()) return;

    const data = collectData();

    // Loading state
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showSuccess(data.full_name, data.equipment_categories);
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      // Fallback: open mailto
      const subject = encodeURIComponent(data._subject);
      const body = encodeURIComponent(
        Object.entries(data)
          .filter(([k]) => k !== '_subject')
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')
      );
      window.location.href = `mailto:info@geosurveyhub.com?subject=${subject}&body=${body}`;

      submitBtn.textContent = 'Submit My Interest';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  });

  // ── SUCCESS STATE ─────────────────────────────────────────
  function showSuccess(name, categories) {
    const formContainer = document.getElementById('financing-form-container');
    if (!formContainer) return;

    const firstName = name.split(' ')[0];
    const catList = categories || 'geospatial equipment';

    formContainer.innerHTML = `
      <div class="success-panel">
        <div class="success-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"
               stroke="#FBD784" stroke-width="1.5" aria-hidden="true">
            <circle cx="14" cy="14" r="12"/>
            <polyline points="9,14 13,18 20,11"/>
          </svg>
        </div>
        <h2>Thank you, ${firstName}.</h2>
        <p>We've received your interest in <strong style="color:var(--white)">${catList}</strong>.
           Our team will be in touch within 2 business days to connect you with
           <strong>Axiant Partners</strong>, who can help find funding for geospatial equipment.</p>
        <div class="success-actions">
          <a href="guide.html" class="read-more">Continue exploring the guide</a>
          <a href="../index.html" class="read-more">Back to home</a>
        </div>
      </div>
    `;

    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    formContainer.querySelector('h2')?.focus();
  }

});
