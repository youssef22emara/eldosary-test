/* =========================================================
   صفحة الشيخ ياسر الدوسري — مشغل بنوعين من التلاوة
   ========================================================= */

/* ---------------------------------------------------------
   إعدادات التلاوات
   --------------------------------------------------------- */

// التلاوة المرتلة: حط رابط كل سورة اتسجلت هنا (رقم السورة: الرابط).
// أي سورة مالهاش رابط بتفضل مقفولة وعليها "جاري التسجيل".
const MURATTAL_LINKS = {
    1: '',   // الفاتحة  ← حط الرابط هنا
    2: ''    // البقرة   ← حط الرابط هنا
};

const pad3 = (n) => String(n).padStart(3, '0');

const RECITATIONS = {
    main: {
        label: 'التلاوة الأساسية',
        // كل السور من MP3Quran
        url: (n) => `https://server11.mp3quran.net/yasser/${pad3(n)}.mp3`
    },
    murattal: {
        label: 'التلاوة المرتلة',
        url: (n) => MURATTAL_LINKS[n] || null
    }
};

const SURAHS = [
    'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
    'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
    'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
    'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
    'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
    'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
    'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
    'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
    'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
    'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
    'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
    'المسد', 'الإخلاص', 'الفلق', 'الناس'
];

const STORAGE_KEY = 'yaser-recitation';

document.addEventListener('DOMContentLoaded', function () {
    const audio = document.getElementById('quran-audio');
    const listEl = document.getElementById('surah-list');
    if (!audio || !listEl) return;

    const player = document.getElementById('gl-player');
    const playBtn = document.getElementById('play-pause');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const downloadBtn = document.getElementById('download-btn');
    const progress = document.getElementById('progress');
    const curTimeEl = document.getElementById('current-time');
    const durEl = document.getElementById('duration');
    const titleEl = document.getElementById('current-surah');
    const subEl = document.getElementById('current-sub');
    const searchEl = document.getElementById('surah-search');
    const countEl = document.getElementById('surah-count');
    const noteEl = document.getElementById('gl-note');
    const noteTextEl = document.getElementById('gl-note-text');
    const tabsEl = document.getElementById('rec-tabs');
    const tabBtns = tabsEl ? tabsEl.querySelectorAll('.gl-tab') : [];
    const waveEl = document.getElementById('gl-wave');
    const toastEl = document.getElementById('gl-toast');
    const toastText = document.getElementById('gl-toast-text');

    const state = { rec: 'main', surah: null };

    /* ---------- أدوات ---------- */
    const rec = () => RECITATIONS[state.rec];
    const surahUrl = (n) => rec().url(n);

    function fmt(s) {
        if (!isFinite(s)) return '00:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
    }

    // توحيد الحروف للبحث (تجاهل الهمزات والتشكيل)
    function norm(str) {
        return String(str)
            .replace(/[\u064B-\u0652\u0640]/g, '')
            .replace(/[أإآٱ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .trim();
    }

    let toastTimer;
    function toast(msg, icon) {
        if (!toastEl) return;
        toastText.textContent = msg;
        const i = toastEl.querySelector('i');
        if (i) i.className = 'fa-solid ' + (icon || 'fa-lock');
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
    }

    function availableCount() {
        let c = 0;
        for (let n = 1; n <= SURAHS.length; n++) if (surahUrl(n)) c++;
        return c;
    }

    /* ---------- موجة الصوت ---------- */
    if (waveEl) {
        const bars = 30;
        let html = '';
        for (let i = 0; i < bars; i++) {
            const h = 14 + Math.round(Math.abs(Math.sin(i * 0.55)) * 34);
            const d = (i % 7) * -0.17;
            html += `<span style="--h:${h}px;animation-delay:${d}s"></span>`;
        }
        waveEl.innerHTML = html;
    }

    /* ---------- رسم قائمة السور ---------- */
    function renderList() {
        const q = norm(searchEl ? searchEl.value : '');
        const frag = document.createDocumentFragment();
        let shown = 0;

        SURAHS.forEach((name, idx) => {
            const n = idx + 1;
            if (q && !norm(name).includes(q) && String(n) !== q) return;

            const available = !!surahUrl(n);
            const li = document.createElement('li');
            li.className = 'gl-item' + (available ? '' : ' locked') + (state.surah === n ? ' active' : '');
            li.dataset.n = n;
            li.style.setProperty('--i', Math.min(shown, 30));
            li.setAttribute('role', 'button');
            li.tabIndex = 0;
            if (!available) li.setAttribute('aria-disabled', 'true');

            li.innerHTML =
                `<span class="gl-num">${n}</span>` +
                `<span class="gl-name">سورة ${name}</span>` +
                (available ? '' : '<span class="gl-lock"><i class="fa-solid fa-lock"></i> جاري التسجيل</span>');

            frag.appendChild(li);
            shown++;
        });

        listEl.innerHTML = '';
        if (!shown) {
            listEl.innerHTML =
                '<li class="gl-empty"><i class="fa-solid fa-magnifying-glass"></i><strong>مفيش نتائج</strong><span>جرّب كلمة تانية</span></li>';
        } else {
            listEl.appendChild(frag);
        }

        // العداد والملاحظة
        const avail = availableCount();
        if (state.rec === 'murattal') {
            countEl.textContent = `${avail} من ${SURAHS.length} سورة`;
            noteTextEl.textContent =
                'التلاوة المرتلة قيد التسجيل، وبنضيف السور أول بأول. السور المقفولة جاري تسجيلها.';
            noteEl.classList.add('show');
        } else {
            countEl.textContent = `${SURAHS.length} سورة`;
            noteEl.classList.remove('show');
        }
    }

    /* ---------- تحميل وتشغيل سورة ---------- */
    function setActiveItem() {
        listEl.querySelectorAll('.gl-item').forEach((li) => {
            li.classList.toggle('active', Number(li.dataset.n) === state.surah);
        });
    }

    function loadSurah(n, opts) {
        opts = opts || {};
        const src = surahUrl(n);
        if (!src) {
            toast('هذه السورة جاري تسجيلها');
            return false;
        }
        state.surah = n;
        audio.src = src;
        audio.load();
        if (opts.time) {
            audio.addEventListener('loadedmetadata', function () {
                try { audio.currentTime = opts.time; } catch (e) {}
            }, { once: true });
        }
        titleEl.textContent = 'سورة ' + SURAHS[n - 1];
        subEl.textContent = rec().label;
        downloadBtn.href = src;
        setActiveItem();
        if (opts.autoplay !== false) audio.play().catch(() => {});
        return true;
    }

    function resetPlayer() {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        state.surah = null;
        titleEl.textContent = 'اختر سورة للاستماع';
        subEl.textContent = rec().label;
        downloadBtn.href = '#';
        progress.value = 0;
        progress.style.setProperty('--p', '0%');
        curTimeEl.textContent = '00:00';
        durEl.textContent = '00:00';
        setActiveItem();
    }

    // السورة التالية/السابقة المتاحة في التلاوة الحالية
    function step(dir, silent) {
        let n = state.surah == null ? (dir > 0 ? 0 : SURAHS.length + 1) : state.surah;
        while (true) {
            n += dir;
            if (n < 1 || n > SURAHS.length) {
                if (!silent) toast('مفيش سورة متاحة في الاتجاه ده', 'fa-circle-info');
                return false;
            }
            if (surahUrl(n)) return loadSurah(n);
        }
    }

    /* ---------- تبديل نوع التلاوة ---------- */
    function setRecitation(key, initial) {
        if (!RECITATIONS[key]) key = 'main';
        if (!initial && key === state.rec) return;

        const wasPlaying = !audio.paused;
        const t = audio.currentTime || 0;
        state.rec = key;

        try { localStorage.setItem(STORAGE_KEY, key); } catch (e) {}

        tabBtns.forEach((b) => {
            const on = b.dataset.rec === key;
            b.classList.toggle('active', on);
            b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        if (tabsEl) tabsEl.dataset.active = key === 'main' ? '0' : '1';

        renderList();
        subEl.textContent = rec().label;

        if (initial || state.surah == null) return;

        // نكمل نفس السورة في التلاوة الجديدة من نفس المكان لو متاحة
        if (surahUrl(state.surah)) {
            loadSurah(state.surah, { time: t, autoplay: wasPlaying });
        } else {
            const name = SURAHS[state.surah - 1];
            resetPlayer();
            toast(`سورة ${name} جاري تسجيلها في ${rec().label}`);
        }
    }

    tabBtns.forEach((b) => b.addEventListener('click', () => setRecitation(b.dataset.rec)));

    /* ---------- أحداث القائمة ---------- */
    function activateItem(li) {
        if (!li || !li.dataset.n) return;
        const n = Number(li.dataset.n);
        if (li.classList.contains('locked')) {
            li.classList.remove('shake');
            void li.offsetWidth;
            li.classList.add('shake');
            toast('جاري التسجيل — السورة دي هتتضاف قريبًا');
            return;
        }
        loadSurah(n);
    }

    listEl.addEventListener('click', (e) => activateItem(e.target.closest('.gl-item')));
    listEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const li = e.target.closest('.gl-item');
            if (li) { e.preventDefault(); activateItem(li); }
        }
    });

    if (searchEl) searchEl.addEventListener('input', renderList);

    /* ---------- أزرار التحكم ---------- */
    playBtn.addEventListener('click', function () {
        if (state.surah == null) { step(1); return; }
        if (audio.paused) audio.play().catch(() => {}); else audio.pause();
    });

    nextBtn.addEventListener('click', () => step(1));
    prevBtn.addEventListener('click', () => step(-1));

    repeatBtn.addEventListener('click', function () {
        audio.loop = !audio.loop;
        this.classList.toggle('active', audio.loop);
        this.setAttribute('aria-pressed', String(audio.loop));
    });

    downloadBtn.addEventListener('click', function (e) {
        if (state.surah == null) {
            e.preventDefault();
            toast('اختر سورة الأول عشان تحمّلها', 'fa-circle-info');
        }
    });

    /* ---------- أحداث الصوت ---------- */
    function setPlayIcon(playing) {
        const icon = playBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-pause', playing);
            icon.classList.toggle('fa-play', !playing);
        }
        player.classList.toggle('is-playing', playing);
    }

    audio.addEventListener('play', () => setPlayIcon(true));
    audio.addEventListener('pause', () => setPlayIcon(false));

    audio.addEventListener('ended', function () {
        setPlayIcon(false);
        if (!audio.loop) step(1, true); // يكمل على السورة التالية المتاحة
    });

    audio.addEventListener('loadedmetadata', () => {
        durEl.textContent = fmt(audio.duration);
    });

    audio.addEventListener('timeupdate', function () {
        const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        progress.value = pct;
        progress.style.setProperty('--p', pct + '%');
        curTimeEl.textContent = fmt(audio.currentTime);
    });

    progress.addEventListener('input', function () {
        if (!audio.duration) return;
        audio.currentTime = (progress.value / 100) * audio.duration;
        progress.style.setProperty('--p', progress.value + '%');
    });

    audio.addEventListener('error', function () {
        if (state.surah != null && audio.getAttribute('src')) {
            toast('تعذّر تحميل الملف، جرّب مرة تانية', 'fa-triangle-exclamation');
        }
    });

    /* ---------- بداية الصفحة ---------- */
    let saved = 'main';
    try { saved = localStorage.getItem(STORAGE_KEY) || 'main'; } catch (e) {}
    setRecitation(saved, true);
});