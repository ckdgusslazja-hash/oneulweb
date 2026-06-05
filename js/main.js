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
  initConsultationTicker();
});

// Header scroll effect
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let ticking = false;

  const handleScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('scrolled', window.scrollY > 20);
      ticking = false;
    });
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

// Portfolio iframe scaling + lazy load (67 previews)
function initPortfolioIframes() {
  const thumbs = document.querySelectorAll('.portfolio-thumb');
  if (!thumbs.length) return;

  const IFRAME_WIDTH = 1440;
  const LOAD_MARGIN = '320px 0px';

  const scaleThumb = (thumb) => {
    const iframe = thumb.querySelector('iframe');
    if (!iframe || !iframe.src) return;
    const scale = thumb.offsetWidth / IFRAME_WIDTH;
    iframe.style.transform = `scale(${scale})`;
  };

  const loadIframe = (iframe) => {
    const src = iframe.dataset.src;
    if (!src || iframe.getAttribute('src')) return;

    iframe.src = src;
    iframe.addEventListener('load', () => scaleThumb(iframe.closest('.portfolio-thumb')), { once: true });
  };

  thumbs.forEach((thumb) => {
    const iframe = thumb.querySelector('iframe');
    if (!iframe) return;

    const src = iframe.getAttribute('src');
    if (src) {
      iframe.dataset.src = src;
      iframe.removeAttribute('src');
    }

    if (iframe.dataset.src) {
      const rect = thumb.getBoundingClientRect();
      if (rect.top < window.innerHeight + 320 && rect.bottom > -320) {
        loadIframe(iframe);
      }
    } else if (iframe.src) {
      scaleThumb(thumb);
    }
  });

  const lazyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const iframe = entry.target.querySelector('iframe');
        if (iframe) loadIframe(iframe);
        lazyObserver.unobserve(entry.target);
      });
    },
    { rootMargin: LOAD_MARGIN }
  );

  thumbs.forEach((thumb) => {
    const iframe = thumb.querySelector('iframe');
    if (iframe?.dataset.src && !iframe.getAttribute('src')) {
      lazyObserver.observe(thumb);
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      thumbs.forEach(scaleThumb);
    }, 120);
  }, { passive: true });
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
  const header = document.querySelector('.header');
  let scrollEndTimer;

  const getOffset = () => (header?.offsetHeight ?? 88) + 8;

  const finishNavScroll = () => {
    document.documentElement.classList.remove('is-nav-scrolling');
  };

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      document.documentElement.classList.add('is-nav-scrolling');

      const top = target.getBoundingClientRect().top + window.scrollY - getOffset();
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

      clearTimeout(scrollEndTimer);
      const onScrollEnd = () => {
        finishNavScroll();
        window.removeEventListener('scrollend', onScrollEnd);
      };

      window.addEventListener('scrollend', onScrollEnd, { once: true });
      scrollEndTimer = setTimeout(onScrollEnd, 1200);
    });
  });
}

// Active nav link on scroll
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const ratios = new Map();
  let activeId = '';

  const setActive = (id) => {
    if (!id || id === activeId) return;
    activeId = id;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (document.documentElement.classList.contains('is-nav-scrolling')) return;

      entries.forEach((entry) => {
        ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      let bestId = '';
      let bestRatio = 0;
      ratios.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });

      if (bestId) setActive(bestId);
    },
    { threshold: [0, 0.15, 0.3, 0.45, 0.6], rootMargin: '-88px 0px -42% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
})();

// CTA & Contact live consultation feed (synced)
function initConsultationTicker() {
  const textEls = document.querySelectorAll('.live-feed-text');
  if (!textEls.length) return;

  const SURNAMES = [
    '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권',
    '황', '안', '송', '류', '배', '노', '문', '양', '홍', '백', '유', '남', '심', '하', '곽',
    '성', '차', '주', '우', '구', '민', '진', '나', '엄', '원', '천', '변', '라', '표', '반'
  ];

  const GIVEN = [
    '민', '수', '현', '진', '영', '호', '준', '서', '우', '윤', '나', '희', '동', '태', '성',
    '지', '혁', '연', '미', '경', '환', '철', '원', '승', '빈', '솔', '람', '헌', '주', '석',
    '열', '린', '강', '율', '채', '안', '비', '해', '솜', '아', '은', '정', '혜', '교', '찬',
    '인', '두', '산', '훈', '재', '경', '원', '희', '담', '결', '윤', '범', '형', '규', '상'
  ];

  const BATCH_SIZE = 60;

  function formatDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  function createRng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = Math.imul(s ^ (s >>> 15), s | 1);
      t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function dailySeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  function generateMaskedNames(count, seedOffset) {
    const rng = createRng(dailySeed() + seedOffset);
    const names = new Set();
    let guard = 0;
    while (names.size < count && guard < count * 30) {
      guard += 1;
      const surname = SURNAMES[Math.floor(rng() * SURNAMES.length)];
      const given = GIVEN[Math.floor(rng() * GIVEN.length)];
      names.add(`${surname}*${given}`);
    }
    return [...names];
  }

  function shuffle(arr, seedOffset) {
    const rng = createRng(dailySeed() + seedOffset + 1);
    const list = [...arr];
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  let cycle = 0;

  function buildMessages() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dates = [formatDate(today), formatDate(yesterday)];

    const seed = cycle * 997;
    const names = shuffle(generateMaskedNames(BATCH_SIZE, seed), seed);

    return names.map((name, i) => {
      const date = dates[i % 2];
      return `${date} ${name} 님이 상담접수하였습니다`;
    });
  }

  let messages = buildMessages();
  let index = 0;

  const showNext = () => {
    textEls.forEach(el => el.classList.add('is-fading'));
    setTimeout(() => {
      index = (index + 1) % messages.length;
      if (index === 0) {
        cycle += 1;
        messages = buildMessages();
      }
      const next = messages[index];
      textEls.forEach(el => {
        el.textContent = next;
        el.classList.remove('is-fading');
      });
    }, 350);
  };

  textEls.forEach(el => { el.textContent = messages[0]; });
  setInterval(showNext, 3200);
}
