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
        latest_logs: "Latest Logs",
        calendar: "Calendar",
        activities: "Activities",
        tab_daily: "Daily",
        tab_calendar: "History",
        tab_growth: "Growth",
        log_growth: "Log Growth",
        weight: "Weight (kg)",
        height: "Height (cm)",
        head: "Head (cm)",
        save: "Save",
        time: "Time",
        start_time: "Start",
        end_time: "End",
        size: "Size",
        type: "Type",
        remarks: "Remarks",
        amount: "Amount (ml)",
        source: "Source",
        description: "What happened?",
        success: "Yay! Saved! 🥯",
        error: "Oh no! Error! 🍞",
        loading: "Loading... 🥯",
        weight_chart: "Weight Curve",
        height_chart: "Height Curve",
        head_chart: "Head Curve",
        breast_l: "Breast (L)",
        breast_r: "Breast (R)",
        formula: "Formula",
        water: "Water",
        pee: "Pee 💧",
        poop: "Poop 💩",
        both: "Both 🌈"
    },
    id: {
        baby_quote: "Tumbuh dengan cinta setiap hari! ❤️",
        sleep: "Tidur",
        diaper: "Popok",
        feeding: "Menyusui",
        food: "Makanan",
        care: "Perawatan",
        latest_logs: "Catatan Terbaru",
        calendar: "Kalender",
        activities: "Aktivitas",
        tab_daily: "Harian",
        tab_calendar: "Riwayat",
        tab_growth: "Tumbuh",
        log_growth: "Catat Pertumbuhan",
        weight: "Berat (kg)",
        height: "Tinggi (cm)",
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
        description: "Apa yang terjadi?",
        success: "Hore! Disimpan! 🥯",
        error: "Waduh! Galat! 🍞",
        loading: "Memuat... 🥯",
        weight_chart: "Kurva Berat",
        height_chart: "Kurva Tinggi",
        head_chart: "Kurva Kepala",
        breast_l: "ASI (Kiri)",
        breast_r: "ASI (Kanan)",
        formula: "Formula",
        water: "Air",
        pee: "Pipis 💧",
        poop: "Pup 💩",
        both: "Keduanya 🌈"
    },
    zh: {
        baby_quote: "每天都在愛中快樂成長！❤️",
        sleep: "睡眠記錄",
        diaper: "換尿片",
        feeding: "喂奶時間",
        food: "輔食添加",
        care: "關愛記錄",
        latest_logs: "最近記錄",
        calendar: "日曆瀏覽",
        activities: "活動詳情",
        tab_daily: "日常記錄",
        tab_calendar: "成長回顧",
        tab_growth: "成長數值",
        log_growth: "記錄成長數據",
        weight: "體重 (kg)",
        height: "身高 (cm)",
        head: "頭圍 (cm)",
        save: "儲存記錄",
        time: "時間",
        start_time: "開始時間",
        end_time: "結束時間",
        size: "尿片尺寸",
        type: "類型",
        remarks: "備註事項",
        amount: "份量 (ml)",
        source: "喂哺方式",
        description: "詳情描述",
        success: "好耶！儲存成功！🥯",
        error: "糟糕！出錯了！🍞",
        loading: "正在加載中... 🥯",
        weight_chart: "體重增長曲線",
        height_chart: "身高增長曲線",
        head_chart: "頭圍增長曲線",
        breast_l: "母乳 (左)",
        breast_r: "母乳 (右)",
        formula: "配方奶",
        water: "飲水",
        pee: "小解 💧",
        poop: "大解 💩",
        both: "大小解 🌈"
    }
};

function setLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    
    document.querySelectorAll('.lang-switcher button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    
    renderCalendar();
    if (charts.weight) updateCharts();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(`nav-${tabId}`).classList.add('active');

    if (tabId === 'growth') {
        loadGrowthHistory();
        setTimeout(initCharts, 100);
    }
    if (tabId === 'daily') loadLatestLogs();
    if (tabId === 'calendar') renderCalendar();
}

function switchSubTab(subTabId) {
    document.querySelectorAll('.sub-tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`sub-tab-${subTabId}`).classList.add('active');
    
    document.querySelectorAll('.sub-tab-nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${subTabId}`).classList.add('active');

    if (subTabId === 'act-view') loadTimeline(selectedDate);
}

// ── Daily Forms ─────────────────────────────────────────────────────────────

function openForm(type) {
    const modal = document.getElementById('form-modal');
    const body = document.getElementById('modal-body');
    const t = translations[currentLanguage];
    let html = `<h2 style="color:var(--accent-red);margin-bottom:20px;text-align:center;">${t[type]} 🥯</h2>`;

    if (type === 'sleep') {
        html += `
            <div class="form-group"><label>${t.start_time}</label><input type="time" id="f-start"></div>
            <div class="form-group"><label>${t.end_time}</label><input type="time" id="f-end"></div>
        `;
    } else if (type === 'diaper') {
        html += `
            <div class="form-group"><label>${t.time}</label><input type="time" id="f-time"></div>
            <div class="form-group"><label>${t.size}</label><select id="f-detail1">
                <option value="NB">NB</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option>
            </select></div>
            <div class="form-group"><label>${t.type}</label><select id="f-detail2">
                <option value="Pee">${t.pee}</option><option value="Poop">${t.poop}</option><option value="Both">${t.both}</option>
            </select></div>
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
    } else if (type === 'food') {
        html += `
            <div class="form-group"><label>${t.time}</label><input type="time" id="f-time"></div>
            <div class="form-group"><label>${t.description}</label><textarea id="f-detail1" placeholder="What did Andrea eat?"></textarea></div>
        `;
    } else if (type === 'care') {
        html += `
            <div class="form-group"><label>${t.time}</label><input type="time" id="f-time"></div>
            <div class="form-group"><label>${t.description}</label><select id="f-detail1">
                <option value="DHA">DHA 💊</option><option value="Probiotics">Probiotics 🧬</option><option value="Vitamin AD">Vitamin AD ☀️</option>
                <option value="Bath">Bath 🛁</option><option value="Massage">Massage 💆‍♀️</option><option value="Sunlight">Sunlight ☀️</option>
            </select></div>
        `;
    }

    html += `
        <div class="form-group"><label>${t.remarks}</label><textarea id="f-remarks" placeholder="Any special notes?"></textarea></div>
        <button class="btn-save" onclick="saveDaily('${type}')">${t.save}</button>
    `;

    body.innerHTML = html;
    modal.style.display = 'block';
    
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    if (document.getElementById('f-time')) document.getElementById('f-time').value = timeStr;
    if (document.getElementById('f-start')) document.getElementById('f-start').value = timeStr;
}

function closeForm() {
    document.getElementById('form-modal').style.display = 'none';
}

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
        const res = await fetch('/api/daily', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (res.ok) {
            tg.HapticFeedback.notificationOccurred('success');
            closeForm();
            tg.showAlert(translations[currentLanguage].success);
            loadLatestLogs();
            if (selectedDate === data.date) loadTimeline(selectedDate);
        }
    } catch (e) {
        tg.showAlert(translations[currentLanguage].error);
    }
}

// ── Activity Timeline ────────────────────────────────────────────────────────

async function loadLatestLogs() {
    const today = new Date().toISOString().split('T')[0];
    const container = document.getElementById('latest-logs-list');
    
    try {
        const res = await fetch(`/api/daily/${today}`);
        const records = await res.json();
        
        if (records.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#bbb;padding:10px;">No logs yet today! 🍞</p>`;
            return;
        }
        
        records.sort((a, b) => b.Time.localeCompare(a.Time));

        container.innerHTML = records.slice(0, 3).map(r => `
            <div style="font-size:0.85rem;padding:5px 0;border-bottom:1px dashed var(--secondary-color);">
                <span style="color:var(--accent-red);font-weight:bold;">${r.Time}</span>: ${r.Type.toUpperCase()} - ${r.Detail1.substring(0, 15)}...
            </div>
        `).join('');
    } catch (e) {}
}

async function loadTimeline(date) {
    const container = document.getElementById('timeline-list');
    container.innerHTML = translations[currentLanguage].loading;
    
    try {
        const res = await fetch(`/api/daily/${date}`);
        const records = await res.json();
        
        if (records.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#bbb;padding:20px;">No activities recorded for this day! 🍞</p>`;
            return;
        }
        
        records.sort((a, b) => a.Time.localeCompare(b.Time));

        container.innerHTML = records.map(r => `
            <div class="timeline-item">
                <span class="timeline-time">${r.Time}</span>
                <strong style="color:var(--primary-color);">${r.Type.toUpperCase()}</strong>
                <div style="font-size:0.9rem;margin-top:5px;">
                    ${r.Detail1} ${r.Detail2 ? '| ' + r.Detail2 : ''}
                    ${r.Remarks ? '<br><small style="color:#888;">' + r.Remarks + '</small>' : ''}
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = 'Error loading timeline.';
    }
}

// ── Calendar Logic ──────────────────────────────────────────────────────────

function renderCalendar() {
    const container = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('current-month-year');
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    monthYear.innerText = new Intl.DateTimeFormat(currentLanguage === 'zh' ? 'zh-TW' : currentLanguage, { month: 'long', year: 'numeric' }).format(currentCalendarDate);
    
    container.innerHTML = '';
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
        container.innerHTML += `<div style="font-weight:bold;color:var(--accent-red);font-size:0.75rem;padding:5px;">${d}</div>`;
    });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) container.innerHTML += `<div class="day-cell empty"></div>`;
    
    const today = new Date().toISOString().split('T')[0];
    
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === today;
        
        container.innerHTML += `
            <div class="day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" 
                 onclick="selectCalendarDate('${dateStr}')">${d}</div>
        `;
    }
    
    document.getElementById('selected-date-label').innerText = selectedDate + " 🥯";
}

function selectCalendarDate(date) {
    selectedDate = date;
    renderCalendar();
    // Switch to Activities automatically when a date is selected for convenience
    switchSubTab('act-view');
}

function prevMonth() { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); renderCalendar(); }
function nextMonth() { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); renderCalendar(); }

// ── Growth & Charts ──────────────────────────────────────────────────────────

async function loadGrowthHistory() {
    const res = await fetch('/api/growth');
    const history = await res.json();
    const container = document.getElementById('growth-history');
    container.innerHTML = history.reverse().map(h => `
        <div class="timeline-item">
            <span class="timeline-time">${h.Date}</span>
            <span>W: ${h['Weight (kg)']}kg | H: ${h['Height (cm)']}cm | Head: ${h['Head (cm)']}cm</span>
        </div>
    `).join('');
    updateCharts(history.reverse());
}

function initCharts() {
    const ctxW = document.getElementById('weightChart').getContext('2d');
    const ctxH = document.getElementById('heightChart').getContext('2d');
    const ctxHC = document.getElementById('headChart').getContext('2d');

    const config = (label, color) => ({
        type: 'line',
        data: { labels: [], datasets: [{ label: label, data: [], borderColor: color, backgroundColor: color + '22', fill: true, tension: 0.4, pointRadius: 5 }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } }
    });

    if (charts.weight) charts.weight.destroy();
    if (charts.height) charts.height.destroy();
    if (charts.head) charts.head.destroy();

    charts.weight = new Chart(ctxW, config('Weight', '#ff6688'));
    charts.height = new Chart(ctxH, config('Height', '#ffb6c1'));
    charts.head = new Chart(ctxHC, config('Head Circ', '#ff99aa'));
}

function updateCharts(data) {
    if (!data || !charts.weight) return;
    const labels = data.map(h => h.Date);
    charts.weight.data.labels = labels; charts.weight.data.datasets[0].data = data.map(h => h['Weight (kg)']); charts.weight.update();
    charts.height.data.labels = labels; charts.height.data.datasets[0].data = data.map(h => h['Height (cm)']); charts.height.update();
    charts.head.data.labels = labels; charts.head.data.datasets[0].data = data.map(h => h['Head (cm)']); charts.head.update();
}

async function saveGrowth() {
    const data = {
        weight: document.getElementById('growth-weight').value,
        height: document.getElementById('growth-height').value,
        head: document.getElementById('growth-head').value,
        date: new Date().toISOString().split('T')[0]
    };
    if (!data.weight || !data.height) return;
    await fetch('/api/growth', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    loadGrowthHistory();
    tg.showAlert(translations[currentLanguage].success);
}

// ── Init ────────────────────────────────────────────────────────────────────
setLanguage('en');
loadLatestLogs();
renderCalendar();
