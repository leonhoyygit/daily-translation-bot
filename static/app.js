const tg = window.Telegram.WebApp;
tg.expand();

let currentLanguage = 'en';
let selectedDate = new Date().toISOString().split('T')[0];
let currentCalendarDate = new Date();
let charts = {};

const translations = {
    en: {
        app_title: "Baby Tracker",
        daily_tasks: "Daily Tasks",
        sleep: "Sleep",
        diaper: "Diaper",
        feeding: "Feeding",
        food: "Solid Food",
        care: "Care & Love",
        tab_daily: "Daily",
        tab_calendar: "Calendar",
        tab_growth: "Growth",
        select_date: "Select a date to view records",
        log_growth: "Log Monthly Growth",
        weight: "Weight (kg)",
        height: "Height (cm)",
        head: "Head Circ. (cm)",
        save: "Save",
        time: "Time",
        start_time: "Start Time",
        end_time: "End Time",
        size: "Size",
        type: "Type",
        remarks: "Remarks",
        amount: "Amount (ml)",
        source: "Source",
        description: "Description",
        success: "Saved successfully!",
        error: "Error saving data.",
        loading: "Loading...",
        weight_chart: "Weight Trend",
        height_chart: "Height Trend",
        head_chart: "Head Circ. Trend",
        add_task: "Add Task",
        task_name: "Task Name",
        cancel: "Cancel",
        breast_l: "Breast (L)",
        breast_r: "Breast (R)",
        formula: "Formula",
        water: "Water",
        pee: "Pee",
        poop: "Poop",
        both: "Both"
    },
    id: {
        app_title: "Pelacak Bayi",
        daily_tasks: "Tugas Harian",
        sleep: "Tidur",
        diaper: "Popok",
        feeding: "Menyusui",
        food: "Makanan Padat",
        care: "Perawatan & Kasih",
        tab_daily: "Harian",
        tab_calendar: "Kalender",
        tab_growth: "Pertumbuhan",
        select_date: "Pilih tanggal untuk melihat catatan",
        log_growth: "Catat Pertumbuhan Bulanan",
        weight: "Berat (kg)",
        height: "Tinggi (cm)",
        head: "Lingkar Kepala (cm)",
        save: "Simpan",
        time: "Waktu",
        start_time: "Waktu Mulai",
        end_time: "Waktu Selesai",
        size: "Ukuran",
        type: "Tipe",
        remarks: "Keterangan",
        amount: "Jumlah (ml)",
        source: "Sumber",
        description: "Deskripsi",
        success: "Berhasil disimpan!",
        error: "Gagal menyimpan data.",
        loading: "Memuat...",
        weight_chart: "Tren Berat",
        height_chart: "Tren Tinggi",
        head_chart: "Tren Lingkar Kepala",
        add_task: "Tambah Tugas",
        task_name: "Nama Tugas",
        cancel: "Batal",
        breast_l: "ASI (Kiri)",
        breast_r: "ASI (Kanan)",
        formula: "Susu Formula",
        water: "Air Putih",
        pee: "Pipis",
        poop: "BAB",
        both: "Keduanya"
    },
    zh: {
        app_title: "寶寶成長記錄",
        daily_tasks: "每日任務",
        sleep: "睡眠",
        diaper: "換尿布",
        feeding: "喂奶",
        food: "輔食",
        care: "關愛記錄",
        tab_daily: "日常",
        tab_calendar: "日曆",
        tab_growth: "成長",
        select_date: "請選擇日期查看記錄",
        log_growth: "記錄每月成長",
        weight: "體重 (kg)",
        height: "身高 (cm)",
        head: "頭圍 (cm)",
        save: "保存",
        time: "時間",
        start_time: "開始時間",
        end_time: "結束時間",
        size: "尺寸",
        type: "類型",
        remarks: "備註",
        amount: "奶量 (ml)",
        source: "方式",
        description: "描述",
        success: "保存成功！",
        error: "保存失敗。",
        loading: "加載中...",
        weight_chart: "體重趨勢",
        height_chart: "身高趨勢",
        head_chart: "頭圍趨勢",
        add_task: "添加任務",
        task_name: "任務名稱",
        cancel: "取消",
        breast_l: "母乳 (左)",
        breast_r: "母乳 (右)",
        formula: "配方奶",
        water: "水",
        pee: "小便",
        poop: "大便",
        both: "大小便"
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
    if (tabId === 'daily') loadTasks();
    if (tabId === 'calendar') renderCalendar();
}

// ── Daily Forms ─────────────────────────────────────────────────────────────

function openForm(type) {
    const modal = document.getElementById('form-modal');
    const body = document.getElementById('modal-body');
    const t = translations[currentLanguage];
    let html = `<h2>${t[type]}</h2>`;

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
            <div class="form-group"><label>${t.description}</label><textarea id="f-detail1"></textarea></div>
        `;
    } else if (type === 'care') {
        html += `
            <div class="form-group"><label>${t.time}</label><input type="time" id="f-time"></div>
            <div class="form-group"><label>${t.description}</label><select id="f-detail1">
                <option value="DHA">DHA</option><option value="Probiotics">Probiotics</option><option value="Vitamin AD">Vitamin AD</option>
                <option value="Bath">Bath</option><option value="Massage">Massage</option><option value="Sunlight">Sunlight</option>
            </select></div>
        `;
    }

    html += `
        <div class="form-group"><label>${t.remarks}</label><textarea id="f-remarks"></textarea></div>
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
        }
    } catch (e) {
        tg.showAlert(translations[currentLanguage].error);
    }
}

// ── Calendar Logic ──────────────────────────────────────────────────────────

function renderCalendar() {
    const container = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('current-month-year');
    const t = translations[currentLanguage];
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    monthYear.innerText = new Intl.DateTimeFormat(currentLanguage === 'zh' ? 'zh-TW' : currentLanguage, { month: 'long', year: 'numeric' }).format(currentCalendarDate);
    
    container.innerHTML = '';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => {
        container.innerHTML += `<div class="day-header">${d}</div>`;
    });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
        container.innerHTML += `<div class="day-cell empty"></div>`;
    }
    
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
    
    document.getElementById('selected-date-label').innerText = selectedDate;
    loadDailyRecords(selectedDate);
}

function selectCalendarDate(date) {
    selectedDate = date;
    renderCalendar();
}

function prevMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
}

async function loadDailyRecords(date) {
    const container = document.getElementById('calendar-records');
    container.innerHTML = translations[currentLanguage].loading;
    
    try {
        const res = await fetch(`/api/daily/${date}`);
        const records = await res.json();
        
        if (records.length === 0) {
            container.innerHTML = `<p>${translations[currentLanguage].select_date}</p>`;
            return;
        }
        
        container.innerHTML = records.map(r => `
            <div class="record-item">
                <div class="record-header">
                    <span>${r.Type.toUpperCase()}</span>
                    <span>${r.Time}</span>
                </div>
                <div class="record-details">
                    ${r.Detail1} ${r.Detail2 ? '| ' + r.Detail2 : ''}
                    ${r.Remarks ? '<br><i>' + r.Remarks + '</i>' : ''}
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = 'Error loading records.';
    }
}

// ── Growth & Charts ──────────────────────────────────────────────────────────

async function loadGrowthHistory() {
    const res = await fetch('/api/growth');
    const history = await res.json();
    const container = document.getElementById('growth-history');
    container.innerHTML = history.reverse().map(h => `
        <div class="record-item">
            <div class="record-header">${h.Date}</div>
            <div class="record-details">
                W: ${h['Weight (kg)']}kg | H: ${h['Height (cm)']}cm | Head: ${h['Head (cm)']}cm
            </div>
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
        data: { labels: [], datasets: [{ label: label, data: [], borderColor: color, fill: false, tension: 0.4 }] },
        options: { responsive: true, plugins: { legend: { display: false } } }
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
    
    charts.weight.data.labels = labels;
    charts.weight.data.datasets[0].data = data.map(h => h['Weight (kg)']);
    charts.weight.update();

    charts.height.data.labels = labels;
    charts.height.data.datasets[0].data = data.map(h => h['Height (cm)']);
    charts.height.update();

    charts.head.data.labels = labels;
    charts.head.data.datasets[0].data = data.map(h => h['Head (cm)']);
    charts.head.update();
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

// ── Tasks ───────────────────────────────────────────────────────────────────

async function loadTasks() {
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    const container = document.getElementById('task-list');
    container.innerHTML = tasks.map(t => `
        <li class="task-item">
            <input type="checkbox" ${t.Status === 'Done' ? 'checked' : ''} onchange="toggleTask('${t.Task}', this.checked)">
            <span>${t.Task}</span>
        </li>
    `).join('');
}

async function toggleTask(name, checked) {
    await fetch('/api/tasks', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name: name, status: checked ? 'Done' : 'Pending'}) });
    tg.HapticFeedback.impactOccurred('light');
}

function showAddTask() {
    const modal = document.getElementById('form-modal');
    const body = document.getElementById('modal-body');
    const t = translations[currentLanguage];
    
    body.innerHTML = `
        <h2>${t.add_task}</h2>
        <div class="form-group"><label>${t.task_name}</label><input type="text" id="new-task-name"></div>
        <button class="btn-save" onclick="addNewTask()">${t.save}</button>
    `;
    modal.style.display = 'block';
}

async function addNewTask() {
    const name = document.getElementById('new-task-name').value;
    if (!name) return;
    await fetch('/api/tasks', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name: name, status: 'Pending'}) });
    closeForm();
    loadTasks();
}

// ── Init ────────────────────────────────────────────────────────────────────
setLanguage('en');
loadTasks();
renderCalendar();
