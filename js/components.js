class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
<header class="header">
  <div class="header-logo">
    <div class="logo-icon">
      <img src="/imges/logo.ico">
    </div>

    <div class="logo-name">
      نور الحياة
      <span>Noor Al-Hayat</span>
    </div>
  </div>

  <div class="header-actions">
    <button class="icon-btn" id="searchBtn"><i class="fa-solid fa-magnifying-glass"></i></button>
    <button class="icon-btn" id="themeBtn">🌙</button>
  </div>
</header>

<div class="search-overlay" id="searchOverlay">
    <div class="search-box">
        <input class="search-input" id="searchInput" type="text">
        <div id="searchResults"></div>
    </div>
</div>
`;
    }
}

customElements.define("site-header", SiteHeader);

class BottomNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="bottom-nav">
                <a href="/index.html" class="nav-item" data-page="index">
                    <span class="nav-icon"> 
                        <i class="fa-solid fa-house"></i>
                    </span>
                    <span>الرئيسية</span>
                </a>

                <a href="/المصحف/quran.html" class="nav-item" data-page="quran">
                    <span class="nav-icon"><i class="fa-solid fa-book-quran"></i></span>
                    <span>المصحف</span>
                </a>

                <a href="/tasbeeh/tasbeeh.html" class="nav-item" data-page="eid">
                    <span class="nav-icon"><i class="fa-solid fa-hands-praying"></i></span>
                    <span>سبحة</span>
                </a>

                <a href="/zekr/azkar.html" class="nav-item" data-page="azkar">
                    <span class="nav-icon"><i class="fa-solid fa-person-praying"></i></span>
                    <span>الأذكار</span>
                </a>

                <a href="/prayer-times.html" class="nav-item" data-page="prayer">
                    <span class="nav-icon"><i class="fa-solid fa-alarm-clock"></i></span>
                    <span>الصلاة</span>
                </a>

                <a href="/ramadan.html" class="nav-item" data-page="ramadan">
                    <span class="nav-icon"><i class="fa-solid fa-moon"></i></span>
                    <span>رمضان</span>
                </a>

            </nav>
        `;

        this.setActivePage();
    }

    setActivePage() {
        const path = window.location.pathname;

        let currentPage = "index";

        if (path.includes("quran.html")) {
            currentPage = "quran";
        } 
        else if (path.includes("azkar.html")) {
            currentPage = "azkar";
        } 
        else if (path.includes("prayer-times.html")) {
            currentPage = "prayer";
        } 
        else if (path.includes("ramadan.html")) {
            currentPage = "ramadan";
        } 
        else if (path.includes("eid.html")) {
            currentPage = "eid";
        }

        const activeItem = this.querySelector(
            `[data-page="${currentPage}"]`
        );

        if (activeItem) {
            activeItem.classList.add("active");
        }
    }
}

customElements.define("bottom-nav", BottomNav);