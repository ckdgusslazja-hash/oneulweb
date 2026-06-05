// 오늘웹 - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initScrollAnimations();
  initPortfolioFilter();
  initPortfolioIframes();
  initContactForm();
  initSmoothScroll();
  initShowcaseControls();
});

// Header scroll effect
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// Mobile navigation
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('active');
    });
  });
}

// Scroll animations
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

// Portfolio iframe scaling
function initPortfolioIframes() {
  const thumbs = document.querySelectorAll('.portfolio-thumb');
  if (!thumbs.length) return;

  const resize = () => {
    thumbs.forEach(thumb => {
      const iframe = thumb.querySelector('iframe');
      if (!iframe) return;
      const scale = thumb.offsetWidth / 1440;
      iframe.style.transform = `scale(${scale})`;
    });
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
}

// Showcase device controls on detail pages
function initShowcaseControls() {
  const wrap = document.querySelector('.showcase-frame-wrap');
  if (!wrap) return;

  const iframe = wrap.querySelector('iframe');
  const buttons = wrap.querySelectorAll('.showcase-controls button');
  const container = wrap.querySelector('.showcase-iframe-container');
  if (!iframe || !buttons.length || !container) return;

  const DESKTOP_WIDTH = 1440;
  const DESKTOP_HEIGHT = 900;
  const MOBILE_WIDTH = 390;
  const MOBILE_HEIGHT = 844;
  const MOBILE_WIDTH_SM = 320;
  const MOBILE_HEIGHT_SM = 693;

  const scaleIframe = (frameW, frameH) => {
    const available = container.clientWidth || frameW;
    const scale = available / frameW;
    iframe.style.width = `${frameW}px`;
    iframe.style.height = `${frameH}px`;
    iframe.style.transform = `scale(${scale})`;
    iframe.style.transformOrigin = 'top left';
    iframe.setAttribute('scrolling', 'yes');
    container.style.height = `${Math.round(frameH * scale)}px`;
    container.scrollTop = 0;
  };

  const setDesktop = () => {
    wrap.classList.remove('mobile-preview');
    scaleIframe(DESKTOP_WIDTH, DESKTOP_HEIGHT);
  };

  const setMobile = () => {
    wrap.classList.add('mobile-preview');
    const isSmall = window.innerWidth <= 768;
    scaleIframe(
      isSmall ? MOBILE_WIDTH_SM : MOBILE_WIDTH,
      isSmall ? MOBILE_HEIGHT_SM : MOBILE_HEIGHT
    );
  };

  const syncActive = () => {
    if (wrap.classList.contains('mobile-preview')) setMobile();
    else setDesktop();
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.dataset.device === 'mobile') setMobile();
      else setDesktop();
    });
  });

  window.addEventListener('resize', syncActive, { passive: true });

  // 초기 로드 시 active 버튼 기준 적용
  const active = wrap.querySelector('.showcase-controls button.active');
  if (active?.dataset.device === 'mobile') setMobile();
  else setDesktop();
}

// Portfolio filter
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;
        card.style.display = show ? '' : 'none';
        card.style.opacity = show ? '1' : '0';
        card.style.transform = show ? '' : 'scale(0.95)';
      });
    });
  });
}

// Contact form → Formspree
const FORMSPREE_URL = 'https://formspree.io/f/xvznzgro';

function initContactForm() {
  const form = document.querySelector('.contact-form form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');

  const showStatus = (message, type) => {
    if (!statusEl) return;
    statusEl.hidden = !message;
    statusEl.textContent = message || '';
    statusEl.className = `form-status${type ? ` form-status--${type}` : ''}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    btn.textContent = '전송 중...';
    btn.disabled = true;
    showStatus('');

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || '문의 전송에 실패했습니다.');
      }

      btn.textContent = '문의가 접수되었습니다! ✓';
      btn.style.background = '#22c55e';
      showStatus('24시간 내에 연락드리겠습니다.', 'success');
      form.reset();

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
        showStatus('');
      }, 4000);
    } catch (err) {
      btn.textContent = '다시 시도해 주세요';
      btn.style.background = '#ef4444';
      showStatus(err.message || '전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
        showStatus('');
      }, 4000);
    }
  });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Active nav link on scroll
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach(section => observer.observe(section));
})();
