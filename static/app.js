const tg = window.Telegram.WebApp;
tg.expand();

let currentLanguage = 'en';
let selectedDate = new Date().toISOString().split('T')[0];
let currentCalendarDate = new Date();
let charts = {};

const translations = {
    en: {
        baby_quote: "Growing with love every day! ❤️",
        sleep: "Sleep",
        diaper: "Diaper",
        feeding: "Feeding",
        food: "Solid Food",
        care: "Care & Love",
        activities: "Activities",
        calendar: "Calendar",
        tab_daily: "Daily",
        tab_growth: "Growth",
        log_growth: "Growth Metrics",
        weight: "W (kg)",
        height: "H (cm)",
        head: "Head (cm)",
        save: "Save Update",
        time: "Time",
        start_time: "Start",
        end_time: "End",
        size: "Size",
        type: "Type",
        remarks: "Remarks",
        amount: "Amount (ml)",
        source: "Source",
        description: "Description",
        success: "Success! 🥯",
        error: "Error! 🍞",
        loading: "Loading...",
        weight_chart: "Weight Trend",
        height_chart: "Height Trend",
        breast_l: "Breast (L)",
        breast_r: "Breast (R)",
        formula: "Formula",
        water: "Water",
        pee: "Pee",
        poop: "Poop",
        both: "Both"
    },
    id: {
        baby_quote: "Tumbuh dengan cinta ❤️",
        sleep: "Tidur",
        diaper: "Popok",
        feeding: "Menyusui",
        food: "Makanan",
        care: "Perawatan",
        activities: "Aktivitas",
        calendar: "Kalender",
        tab_daily: "Harian",
        tab_growth: "Tumbuh",
        log_growth: "Metrik Tumbuh",
        weight: "B (kg)",
        height: "T (cm)",
        head: "Kepala (cm)",
        save: "Simpan",
        time: "Waktu",
        start_time: "Mulai",
        end_time: "Selesai",
        size: "Ukuran",
        type: "Tipe",
        remarks: "Catatan",
        amount: "Jumlah (ml)",
        source: "Sumber",
        description: "Deskripsi",
        success: "Berhasil! 🥯",
        error: "Gagal! 🍞",
        loading: "Memuat...",
        weight_chart: "Tren Berat",
        height_chart: "Tren Tinggi",
        breast_l: "ASI (Ki)",
        breast_r: "ASI (Ka)",
        formula: "Formula",
        water: "Air",
        pee: "Pipis",
        poop: "Pup",
        both: "Keduanya"
    },
    zh: {
        baby_quote: "在愛中茁壯成長 ❤️",
        sleep: "睡眠",
        diaper: "換片",
        feeding: "喂奶",
        food: "輔食",
        care: "關愛",
        activities: "活動",
        calendar: "日曆",
        tab_daily: "日常",
        tab_growth: "成長",
        log_growth: "成長數據",
        weight: "體重 (kg)",
        height: "身高 (cm)",
        head: "頭圍 (cm)",
        save: "儲存更新",
        time: "時間",
        start_time: "開始",
        end_time: "結束",
        size: "尺寸",
        type: "類型",
        remarks: "備註",
        amount: "奶量 (ml)",
        source: "方式",
        description: "描述",
        success: "儲存成功！🥯",
        error: "出錯了！🍞",
        loading: "加載中...",
        weight_chart: "體重趨勢",
        height_chart: "身高趨勢",
        breast_l: "母乳 (左)",
        breast_r: "母乳 (右)",
        formula: "配方奶",
        water: "飲水",
        pee: "小便",
        poop: "大便",
        both: "大小便"
    }
};

function setLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('.lang-pill button').forEach(btn => btn.classList.toggle('active', btn.id === `btn-${lang}`));
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.toggle('active', tab.id === `tab-${tabId}`));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.id === `nav-${tabId}`));
    
    if (tabId === 'activities') loadTimeline(selectedDate);
    if (tabId === 'calendar') renderCalendar();
    if (tabId === 'growth') { loadGrowthHistory(); setTimeout(initCharts, 100); }
}

// ── Interactive Form Fix ──────────────────────────────────────────────────

function openForm(type) {
    const overlay = document.getElementById('form-modal');
    const body = document.getElementById('modal-body');
    const t = translations[currentLanguage];
    let html = `<h2 style="margin-bottom:25px;text-align:center;">${t[type]}</h2>`;

    if (type === 'sleep') {
        html += `
            <div class="form-group"><label>${t.start_time}</label><input type="time" id="f-start"></div>
            <div class="form-group"><label>${t.end_time}</label><input type="time" id="f-end"></div>
        `;
    } else if (type === 'feeding') {
        html += `
            <div class="form-group"><label>${t.time}</label><input type="time" id="f-time"></div>
            <div class="form-group"><label>${t.source}</label><select id="f-detail1">
                <option value="Breast (L)">${t.breast_l}</option><option value="Breast (R)">${t.breast_r}</option>
                <option value="Formula">${t.formula}</option><option value="Water">${t.water}</option>
            </select></div>
            <div class="form-group"><label>${t.amount}</label><input type="number" id="f-detail2"></div>
        `;
    } else if (type === 'diaper') {
        html += `
            <div class="form-group"><label>${t.time}</label><input type="time" id="f-time"></div>
            <div class="form-group"><label>${t.size}</label><select id="f-detail1">
                <option value="NB">NB</option><option value="S">S</option><option value="M">M</option><option value="L">L</option>
            </select></div>
            <div class="form-group"><label>${t.type}</label><select id="f-detail2">
                <option value="Pee">${t.pee}</option><option value="Poop">${t.poop}</option><option value="Both">${t.both}</option>
            </select></div>
        `;
    } else if (type === 'food' || type === 'care') {
        html += `
            <div class="form-group"><label>${t.time}</label><input type="time" id="f-time"></div>
            <div class="form-group"><label>${t.description}</label><textarea id="f-detail1" rows="3" placeholder="..."></textarea></div>
        `;
    } else {
        html += `
            <div class="form-group"><label>${t.time}</label><input type="time" id="f-time"></div>
            <div class="form-group"><label>${t.description}</label><textarea id="f-detail1" rows="3"></textarea></div>
        `;
    }

    html += `
        <div class="form-group"><label>${t.remarks}</label><textarea id="f-remarks" rows="2"></textarea></div>
        <button class="btn-primary-pill" onclick="saveDaily('${type}')">${t.save}</button>
    `;

    body.innerHTML = html;
    overlay.classList.add('active');
    
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    if (document.getElementById('f-time')) document.getElementById('f-time').value = timeStr;
    if (document.getElementById('f-start')) document.getElementById('f-start').value = timeStr;
}

function closeForm() { document.getElementById('form-modal').classList.remove('active'); }

async function saveDaily(type) {
    const data = {
        type: type,
        time: document.getElementById('f-time')?.value || document.getElementById('f-start')?.value,
        detail1: document.getElementById('f-detail1')?.value || "",
        detail2: document.getElementById('f-detail2')?.value || document.getElementById('f-end')?.value || "",
        remarks: document.getElementById('f-remarks')?.value || "",
        date: new Date().toISOString().split('T')[0]
    };
    try {
        const res = await fetch('/api/daily', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
        if (res.ok) { tg.HapticFeedback.notificationOccurred('success'); closeForm(); tg.showAlert(translations[currentLanguage].success); }
    } catch (e) { tg.showAlert(translations[currentLanguage].error); }
}

// ── Timeline Logic ──────────────────────────────────────────────────────────

async function loadTimeline(date) {
    const container = document.getElementById('timeline-list');
    document.getElementById('activity-date-label').innerText = (date === new Date().toISOString().split('T')[0]) ? "Today" : date;
    container.innerHTML = `<p style="text-align:center;padding:20px;color:#ccc;">${translations[currentLanguage].loading}</p>`;
    try {
        const res = await fetch(`/api/daily/${date}`);
        const records = await res.json();
        if (records.length === 0) { container.innerHTML = `<p style="text-align:center;padding:40px;color:#ccc;">No logs for this day 🍞</p>`; return; }
        records.sort((a, b) => a.Time.localeCompare(b.Time));
        container.innerHTML = records.map(r => `
            <div class="timeline-entry">
                <div class="time-box">${r.Time}</div>
                <div class="entry-details">
                    <strong>${r.Type.toUpperCase()}</strong>
                    <span>${r.Detail1} ${r.Detail2 ? '| ' + r.Detail2 : ''}</span>
                </div>
            </div>
        `).join('');
    } catch (e) { container.innerHTML = 'Error loading logs.'; }
}

// ── Calendar Logic ──────────────────────────────────────────────────────────

function renderCalendar() {
    const container = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('current-month-year');
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    monthYear.innerText = new Intl.DateTimeFormat(currentLanguage === 'zh' ? 'zh-TW' : currentLanguage, { month: 'short', year: 'numeric' }).format(currentCalendarDate);
    container.innerHTML = '';
    ['S','M','T','W','T','F','S'].forEach(d => container.innerHTML += `<div style="font-size:0.7rem;font-weight:700;color:#ddd;text-align:center;">${d}</div>`);
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) container.innerHTML += `<div></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        const isSelected = dateStr === selectedDate;
        container.innerHTML += `<div class="day-cell ${isSelected ? 'selected' : ''}" onclick="selectDate('${dateStr}')">${d}</div>`;
    }
}

function selectDate(date) { selectedDate = date; renderCalendar(); switchTab('activities'); }
function prevMonth() { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); renderCalendar(); }
function nextMonth() { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); renderCalendar(); }

// ── Growth ──────────────────────────────────────────────────────────────────

async function loadGrowthHistory() {
    const res = await fetch('/api/growth');
    const data = await res.json();
    updateCharts(data);
}

function initCharts() {
    const common = (label, color) => ({
        type: 'line',
        data: { labels: [], datasets: [{ label, data: [], borderColor: color, backgroundColor: color + '11', fill: true, tension: 0.4, pointRadius: 4 }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { grid: { display: false } } } }
    });
    if (charts.weight) charts.weight.destroy(); if (charts.height) charts.height.destroy();
    charts.weight = new Chart(document.getElementById('weightChart'), common('Weight', '#ff4d4d'));
    charts.height = new Chart(document.getElementById('heightChart'), common('Height', '#ffb6c1'));
}

function updateCharts(data) {
    if (!data.length || !charts.weight) return;
    const labels = data.map(h => h.Date);
    charts.weight.data.labels = labels; charts.weight.data.datasets[0].data = data.map(h => h['Weight (kg)']); charts.weight.update();
    charts.height.data.labels = labels; charts.height.data.datasets[0].data = data.map(h => h['Height (cm)']); charts.height.update();
}

async function saveGrowth() {
    const data = { weight: document.getElementById('growth-weight').value, height: document.getElementById('growth-height').value, head: document.getElementById('growth-head').value, date: new Date().toISOString().split('T')[0] };
    if (!data.weight || !data.height) return;
    await fetch('/api/growth', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    loadGrowthHistory(); tg.showAlert(translations[currentLanguage].success);
}

// ── Init ────────────────────────────────────────────────────────────────────
setLanguage('en');
switchTab('daily');
