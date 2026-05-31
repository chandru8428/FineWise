// =============================================
// FINWISE - APP.JS
// Core navigation, theme, search, animations
// =============================================

(function () {
  'use strict';

  // ── State ──────────────────────────────────
  const state = {
    currentSection: 'home',
    theme: localStorage.getItem('fw-theme') || 'light',
    bookmarks: JSON.parse(localStorage.getItem('fw-bookmarks') || '[]'),
    searchQuery: '',
  };

  // ── DOM References ─────────────────────────
  const DOM = {
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('sidebarOverlay'),
    menuToggle: document.getElementById('menuToggle'),
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    searchInput: document.getElementById('searchInput'),
    navItems: document.querySelectorAll('[data-nav]'),
    sectionPages: document.querySelectorAll('.section-page'),
    toastContainer: document.getElementById('toastContainer'),
  };

  // ── Theme ──────────────────────────────────
  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fw-theme', theme);
    if (DOM.themeIcon) {
      DOM.themeIcon.innerHTML = theme === 'dark'
        ? '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'
        : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>';
    }
  }

  function toggleTheme() {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // ── Navigation ────────────────────────────
  function navigateTo(sectionId) {
    state.currentSection = sectionId;

    // Update nav items
    DOM.navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.nav === sectionId);
    });

    // Show/hide sections
    DOM.sectionPages.forEach(page => {
      page.classList.toggle('active', page.id === `section-${sectionId}`);
    });

    // Update page title
    const activeNav = document.querySelector(`[data-nav="${sectionId}"]`);
    if (activeNav) {
      document.title = `${activeNav.querySelector('.nav-label')?.textContent || 'FinWise'} — FinWise`;
    }

    // Close mobile sidebar
    closeSidebar();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger reveal animations for new section
    setTimeout(() => triggerReveals(), 100);
  }

  // ── Sidebar ───────────────────────────────
  function openSidebar() {
    DOM.sidebar?.classList.add('open');
    DOM.overlay?.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    DOM.sidebar?.classList.remove('open');
    DOM.overlay?.classList.remove('show');
    document.body.style.overflow = '';
  }

  // ── Scroll Reveal ─────────────────────────
  function triggerReveals() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // For cascade elements, trigger progress bars
          const bars = entry.target.querySelectorAll('.progress-animate');
          bars.forEach(bar => {
            setTimeout(() => bar.classList.add('animated'), 300);
          });
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-cascade').forEach(el => {
      observer.observe(el);
    });
  }

  // ── Counter Animation ─────────────────────
  function animateCounter(element, target, duration = 1500, prefix = '', suffix = '') {
    const start = 0;
    const startTime = performance.now();
    const isFloat = target % 1 !== 0;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = start + (target - start) * eased;
      element.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString('en-IN')) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.counter);
          const prefix = el.dataset.prefix || '';
          const suffix = el.dataset.suffix || '';
          animateCounter(el, target, 1500, prefix, suffix);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
  }

  // ── Search ────────────────────────────────
  function initSearch() {
    if (!DOM.searchInput) return;
    DOM.searchInput.addEventListener('input', debounce((e) => {
      const query = e.target.value.toLowerCase().trim();
      state.searchQuery = query;

      if (query.length < 2) {
        clearSearchHighlights();
        return;
      }

      // If we're in learning center, filter cards
      if (state.currentSection === 'learning') {
        filterLearningCards(query);
      } else {
        // Navigate to learning and filter
        searchAllContent(query);
      }
    }, 300));
  }

  function filterLearningCards(query) {
    const cards = document.querySelectorAll('.learning-card');
    let anyVisible = false;
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const match = text.includes(query);
      card.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });

    const emptyState = document.getElementById('learningEmpty');
    if (emptyState) emptyState.style.display = anyVisible ? 'none' : 'flex';
  }

  function searchAllContent(query) {
    navigateTo('learning');
    setTimeout(() => filterLearningCards(query), 200);
  }

  function clearSearchHighlights() {
    const cards = document.querySelectorAll('.learning-card');
    cards.forEach(card => card.style.display = '');
    const emptyState = document.getElementById('learningEmpty');
    if (emptyState) emptyState.style.display = 'none';
  }

  // ── Toast Notifications ───────────────────
  function showToast(message, type = 'info', duration = 3000) {
    if (!DOM.toastContainer) return;

    const icons = {
      success: '<path d="M20 6 9 17l-5-5"/>',
      error: '<path d="M18 6 6 18M6 6l12 12"/>',
      info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${icons[type] || icons.info}
      </svg>
      <span>${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ── Accordion ────────────────────────────
  function initAccordions() {
    document.addEventListener('click', (e) => {
      const header = e.target.closest('.accordion-header');
      if (!header) return;

      const item = header.closest('.accordion-item');
      if (!item) return;

      const isOpen = item.classList.contains('open');

      // Close siblings in same group
      const group = item.closest('[data-accordion-group]');
      if (group) {
        group.querySelectorAll('.accordion-item.open').forEach(openItem => {
          if (openItem !== item) openItem.classList.remove('open');
        });
      }

      item.classList.toggle('open', !isOpen);
    });
  }

  // ── Tabs (within sections) ────────────────
  function initTabs() {
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.tab-btn');
      if (!tabBtn) return;

      const tabList = tabBtn.closest('.tab-list');
      const tabContainer = tabList?.closest('[data-tabs]');
      if (!tabContainer) return;

      const targetPanel = tabBtn.dataset.tab;

      // Update buttons
      tabList.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn === tabBtn);
      });

      // Update panels
      tabContainer.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === targetPanel);
      });
    });
  }

  // ── Checklists ────────────────────────────
  function initChecklists() {
    document.addEventListener('click', (e) => {
      const item = e.target.closest('.checklist-item');
      if (!item) return;

      item.classList.toggle('checked');
      const checkIcon = item.querySelector('.checklist-checkbox');
      if (checkIcon) {
        checkIcon.innerHTML = item.classList.contains('checked')
          ? '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
          : '';
      }

      // Save progress
      const listId = item.closest('[data-checklist]')?.dataset.checklist;
      if (listId) saveChecklistState(listId);
    });
  }

  function saveChecklistState(listId) {
    const items = document.querySelectorAll(`[data-checklist="${listId}"] .checklist-item`);
    const state = Array.from(items).map((item, i) => ({ i, checked: item.classList.contains('checked') }));
    localStorage.setItem(`fw-checklist-${listId}`, JSON.stringify(state));
  }

  function loadChecklistStates() {
    document.querySelectorAll('[data-checklist]').forEach(list => {
      const listId = list.dataset.checklist;
      const savedState = JSON.parse(localStorage.getItem(`fw-checklist-${listId}`) || '[]');
      const items = list.querySelectorAll('.checklist-item');
      savedState.forEach(({ i, checked }) => {
        if (items[i] && checked) {
          items[i].classList.add('checked');
          const checkIcon = items[i].querySelector('.checklist-checkbox');
          if (checkIcon) {
            checkIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
          }
        }
      });
    });
  }

  // ── Bookmarks ────────────────────────────
  function toggleBookmark(id, title) {
    const idx = state.bookmarks.indexOf(id);
    if (idx === -1) {
      state.bookmarks.push(id);
      showToast(`"${title}" bookmarked!`, 'success');
    } else {
      state.bookmarks.splice(idx, 1);
      showToast('Bookmark removed', 'info');
    }
    localStorage.setItem('fw-bookmarks', JSON.stringify(state.bookmarks));
    updateBookmarkButtons();
  }

  function updateBookmarkButtons() {
    document.querySelectorAll('[data-bookmark]').forEach(btn => {
      const id = btn.dataset.bookmark;
      btn.classList.toggle('bookmarked', state.bookmarks.includes(id));
    });
  }

  // ── Utility: Debounce ─────────────────────
  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  // ── Utility: Format Currency ──────────────
  window.formatCurrency = function (amount) {
    if (amount >= 1e7) return '₹' + (amount / 1e7).toFixed(2) + ' Cr';
    if (amount >= 1e5) return '₹' + (amount / 1e5).toFixed(2) + ' L';
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  };

  window.formatNumber = function (n) {
    return n.toLocaleString('en-IN');
  };

  window.showToast = showToast;
  window.navigateTo = navigateTo;
  window.toggleBookmark = toggleBookmark;

  // ── Init ──────────────────────────────────
  function init() {
    // Set initial theme
    setTheme(state.theme);

    // Bind nav clicks
    DOM.navItems.forEach(item => {
      item.addEventListener('click', () => navigateTo(item.dataset.nav));
    });

    // Bind feature card clicks
    document.querySelectorAll('[data-goto]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.btn-tool-link')) return; // handled below
        navigateTo(el.dataset.goto);
      });
    });

    // Bind specific tool link buttons inside cards
    document.querySelectorAll('.btn-tool-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const sectionMap = {
          'calculator': 'credit',
          'sip': 'mutual',
          'debt': 'debt',
          'budget': 'finance',
          'income': 'hustle'
        };
        const section = sectionMap[action] || 'home';
        navigateTo(section);
        showToast('Opened tool directly', 'success');
        // Optionally scroll to the specific tool inside the section
      });
    });

    // Bind theme toggle
    DOM.themeToggle?.addEventListener('click', toggleTheme);

    // Bind mobile menu
    DOM.menuToggle?.addEventListener('click', () => {
      DOM.sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    DOM.overlay?.addEventListener('click', closeSidebar);

    // Init components
    initAccordions();
    initTabs();
    initChecklists();
    initSearch();

    // Load saved states
    loadChecklistStates();
    updateBookmarkButtons();

    // Navigate to home
    navigateTo('home');

    // Start counters + reveals after short delay
    setTimeout(() => {
      initCounters();
      triggerReveals();
    }, 200);

    console.log('🚀 FinWise initialized');
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
