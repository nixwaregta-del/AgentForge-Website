(() => {
  'use strict';

  // ── Navigation scroll state ──
  const nav = document.querySelector('.nav');
  const threshold = 60;

  const updateNav = () => {
    if (window.scrollY > threshold) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Scroll reveal animations ──
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));

  // ── Toast system ──
  const showToast = (msg) => {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(() => {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    });
  };

  // ── Poll widget ──
  const options = document.querySelectorAll('.poll-option');
  const barW = document.getElementById('bar-w');
  const barL = document.getElementById('bar-l');
  const pctW = document.getElementById('pct-w');
  const pctL = document.getElementById('pct-l');
  const totalEl = document.getElementById('poll-total');
  const storageKey = 'agentforge_poll';

  const loadPoll = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const savePoll = (data) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // storage unavailable
    }
  };

  const render = (data) => {
    const w = data.w || 0;
    const l = data.l || 0;
    const total = w + l;
    const wPct = total === 0 ? 0 : Math.round((w / total) * 100);
    const lPct = total === 0 ? 0 : 100 - wPct;

    barW.style.width = wPct + '%';
    barL.style.width = lPct + '%';
    pctW.textContent = wPct + '%';
    pctL.textContent = lPct + '%';
    totalEl.textContent = total + (total === 1 ? ' vote' : ' votes');
  };

  const markVoted = () => {
    options.forEach(btn => btn.disabled = true);
  };

  const existing = loadPoll();
  if (existing) {
    render(existing);
    if (localStorage.getItem(storageKey + '_voted')) {
      markVoted();
    }
  } else {
    render({ w: 0, l: 0 });
  }

  options.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const choice = btn.dataset.vote;
      const data = loadPoll() || { w: 0, l: 0 };
      data[choice]++;
      savePoll(data);
      render(data);
      localStorage.setItem(storageKey + '_voted', '1');
      markVoted();
    });
  });

  // ── Visitor counter ──
  const visitorNum = document.getElementById('visitor-number');
  const visitorKey = 'agentforge_visits';

  const updateVisitorCount = () => {
    const current = parseInt(localStorage.getItem(visitorKey) || '0', 10);
    const next = current + 1;
    localStorage.setItem(visitorKey, next.toString());
    if (visitorNum) {
      visitorNum.textContent = next.toLocaleString();
    }
  };

  if (visitorNum) {
    updateVisitorCount();
  }

  // ── Easter egg: logo click combo ──
  const logo = document.querySelector('.logo-mark');
  const eggThreshold = 5;
  let clickCount = 0;
  let clickTimer = null;

  const ignite = () => {
    logo.classList.add('ignited');
    showToast('Forge ignited. Welcome, operator. 🛠️');
    console.log('%c🛠️ AgentForge Forge Mode: Active. You found the easter egg. Keep building.', 'color: #34d399; font-size: 14px; font-weight: bold;');
    setTimeout(() => logo.classList.remove('ignited'), 3000);
  };

  if (logo) {
    logo.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
      if (clickCount >= eggThreshold) {
        clickCount = 0;
        ignite();
      }
    });
  }

  // ── Easter egg: Konami code ──
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  let konamiIndex = 0;

  const activateKonami = () => {
    showToast('🕹️ Konami code activated. +30 lives.');
    document.body.style.transition = 'filter 0.5s';
    document.body.style.filter = 'hue-rotate(120deg)';
    setTimeout(() => {
      document.body.style.filter = 'none';
    }, 3000);
    console.log('%c🕹️ KONAMI CODE: +30 lives. The forge accepts your input.', 'color: #fbbf24; font-size: 14px; font-weight: bold;');
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiIndex = 0;
        activateKonami();
      }
    } else {
      konamiIndex = 0;
    }
  });

  // ── Easter egg: double-click banner ──
  const banner = document.querySelector('.hero-banner');
  if (banner) {
    banner.addEventListener('dblclick', () => {
      showToast('🔥 Banner ignited. The forge is extra hot today.');
      banner.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.6s';
      banner.style.transform = 'scale(1.05) rotate(1deg)';
      banner.style.boxShadow = '0 0 40px rgba(52, 211, 153, 0.4), 0 0 80px rgba(52, 211, 153, 0.2)';
      setTimeout(() => {
        banner.style.transform = 'scale(1) rotate(0deg)';
        banner.style.boxShadow = 'none';
      }, 2000);
      console.log('%c🔥 Banner double-clicked. The forge runs hotter with every click.', 'color: #f87171; font-size: 14px; font-weight: bold;');
    });
  }

  // ── Easter egg: secret key combo (Ctrl+Shift+A) ──
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      showToast('🤖 Agent mode activated. All systems nominal.');
      console.log('%c🤖 AGENT FORGE: Secret mode unlocked. You are now the agent.', 'color: #a78bfa; font-size: 14px; font-weight: bold;');
    }
  });
})();
