(function () {
  const root = document.documentElement.dataset.root || '.';

  function withRoot(path) {
    return `${root}/${path}`.replace(/\/{2,}/g, '/').replace(/^\.\//, './');
  }

  function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) themeBtn.textContent = saved === 'dark' ? '☀️' : '🌙';

    themeBtn?.addEventListener('click', () => {
      const curr = document.documentElement.getAttribute('data-theme');
      const next = curr === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }

  function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  function initSearch() {
    const searchLinks = [
      { text: 'المصحف الإلكتروني', url: withRoot('المصحف/quran.html'), icon: '📖' },
      { text: 'أذكار الصباح', url: withRoot('zekr/اذكار_الصباح/azkar-1.html'), icon: '🌅' },
      { text: 'أذكار المساء', url: withRoot('zekr/اذكار_المساء/azkar-2.html'), icon: '🌆' },
      { text: 'أذكار النوم', url: withRoot('zekr/اذكار_النوم/azkar-3.html'), icon: '🌙' },
      { text: 'مواقيت الصلاة', url: withRoot('prayer-times.html'), icon: '🕐' },
      { text: 'رمضان', url: withRoot('ramadan.html'), icon: '🌙' },
      { text: 'العيد', url: withRoot('eid.html'), icon: '🎊' },
    ];

    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchBtn || !searchOverlay || !searchInput || !searchResults) return;

    function render(items) {
      searchResults.innerHTML = items.map(item =>
        `<a href="${item.url}" class="search-result-item">${item.icon} ${item.text}</a>`
      ).join('');
    }

    searchBtn.addEventListener('click', () => {
      searchOverlay.classList.add('open');
      searchInput.focus();
      render(searchLinks);
    });

    searchOverlay.addEventListener('click', event => {
      if (event.target === searchOverlay) searchOverlay.classList.remove('open');
    });

    searchInput.addEventListener('input', event => {
      const query = event.target.value.trim().toLowerCase();
      render(query ? searchLinks.filter(item => item.text.toLowerCase().includes(query)) : searchLinks);
    });
  }

  function initWhatsAppContact() {
    const phone = '201505990443';
    const message = encodeURIComponent('السلام عليكم، أريد التواصل بخصوص موقع نور الحياة.');
    const url = `https://wa.me/${phone}?text=${message}`;
    const label = 'تواصل واتساب';
    const icon = '<svg class="whatsapp-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M16.03 3.2A12.7 12.7 0 0 0 5.15 22.45L3.7 28.8l6.49-1.52A12.7 12.7 0 1 0 16.03 3.2Zm0 2.35a10.35 10.35 0 0 1 8.7 15.96 10.35 10.35 0 0 1-13.93 3.58l-.43-.25-3.58.84.8-3.5-.28-.45A10.35 10.35 0 0 1 16.03 5.55Zm-4.29 4.98c-.23 0-.6.09-.92.44-.32.35-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.55c.17.23 2.38 3.8 5.86 5.17 2.9 1.14 3.5.91 4.13.86.63-.06 2.03-.83 2.32-1.63.29-.8.29-1.49.2-1.63-.09-.14-.32-.23-.66-.4-.35-.17-2.03-1-2.35-1.12-.32-.12-.55-.17-.78.17-.23.35-.9 1.12-1.1 1.35-.2.23-.41.26-.75.09-.35-.17-1.45-.53-2.76-1.7-1.02-.91-1.7-2.03-1.9-2.38-.2-.35-.02-.54.15-.71.15-.15.35-.4.52-.6.17-.2.23-.35.35-.58.12-.23.06-.43-.03-.6-.09-.17-.78-1.89-1.07-2.58-.28-.67-.57-.58-.78-.59h-.65Z"/></svg>';

    if (!document.querySelector('.whatsapp-header-btn')) {
      const headerActions = document.querySelector('.header-actions');
      if (headerActions) {
        const headerLink = document.createElement('a');
        headerLink.className = 'icon-btn whatsapp-header-btn';
        headerLink.href = url;
        headerLink.target = '_blank';
        headerLink.rel = 'noopener';
        headerLink.title = label;
        headerLink.setAttribute('aria-label', label);
        headerLink.innerHTML = icon;
        headerActions.insertBefore(headerLink, headerActions.firstChild);
      }
    }

    document.querySelector('.whatsapp-float')?.remove();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initHeader();
    initSearch();
    initWhatsAppContact();
  });
})();
