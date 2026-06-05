// Mobile nav
document.querySelectorAll('.nav-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const links = btn.closest('.site-nav')?.querySelector('.nav-links');
    if (links) links.classList.toggle('open');
    btn.classList.toggle('active');
  });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const nav = anchor.closest('.site-nav');
    if (nav) {
      nav.querySelector('.nav-links')?.classList.remove('open');
      nav.querySelector('.nav-toggle')?.classList.remove('active');
    }
  });
});

// Tabs
document.querySelectorAll('.tabs').forEach(tabGroup => {
  const btns = tabGroup.querySelectorAll('.tab-btn');
  const panels = tabGroup.parentElement.querySelectorAll('.tab-panel');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      panels.forEach(p => p.classList.toggle('active', p.dataset.tab === target));
    });
  });
});

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    item.closest('.faq-list')?.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// Toast
function showToast(msg) {
  let toast = document.querySelector('.demo-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'demo-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

document.querySelectorAll('[data-toast]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    showToast(el.dataset.toast);
  });
});

// Forms
document.querySelectorAll('.demo-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast(form.dataset.success || '접수되었습니다! 곧 연락드릴게요.');
    form.reset();
  });
});
