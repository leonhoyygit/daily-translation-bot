const tg = window.Telegram.WebApp;
tg.expand();

let currentLanguage = 'en';

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
        loading: "Loading..."
    },
    id: {
        app_title: "Pelacak Bayi",
        daily_tasks: "Tugas Harian",
        sleep: "Tidur",
        diaper: "Popok",
        feeding: "Menyusui",
        food: "Makanan Padat",
        care: "Perawatan & Kasih Sayang",
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
        loading: "Memuat..."
    },
    zh: {
        app_title: "宝宝成长记录",
        daily_tasks: "每日任务",
        sleep: "睡眠",
        diaper: "换尿布",
        feeding: "喂奶",
        food: "辅食",
        care: "关爱记录",
        tab_daily: "日常",
        tab_calendar: "日历",
        tab_growth: "成长",
        select_date: "选择日期查看记录",
        log_growth: "记录每月成长",
        weight: "体重 (kg)",
        height: "身高 (cm)",
        head: "头围 (cm)",
        save: "保存",
        time: "时间",
        start_time: "开始时间",
        end_time: "结束时间",
        size: "尺寸",
        type: "类型",
        remarks: "备注",
        amount: "奶量 (ml)",
        source: "方式",
        description: "描述",
        success: "保存成功！",
        error: "保存失败。",
        loading: "加载中..."
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
    
    // Update active button
    document.querySelectorAll('.lang-switcher button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    
    // Refresh modal if open
    const modal = document.getElementById('form-modal');
    if (modal.style.display === 'block') {
        // We might want to re-render the specific form
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(`nav-${tabId}`).classList.add('active');

    if (tabId === 'growth') loadGrowthHistory();
    if (tabId === 'daily') loadTasks();
}

// ── Daily Forms ─────────────────────────────────────────────────────────────

function openForm(type) {
    const modal = document.getElementById('form-modal');
    const body = document.getElementById('modal-body');
    const t = translations[currentLanguage];
    let html = `<h2>${t[type]}</h2>`;

    if (type === 'sleep') {
        html += `
            <div class="form-group">
                <label>${t.start_time}</label>
                <input type="time" id="f-start">
            </div>
            <div class="form-group">
                <label>${t.end_time}</label>
                <input type="time" id="f-end">
            </div>
        `;
    } else if (type === 'diaper') {
        html += `
            <div class="form-group">
                <label>${t.time}</label>
                <input type="time" id="f-time">
            </div>
            <div class="form-group">
                <label>${t.size}</label>
                <select id="f-detail1">
                    <option value="NB">NB</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                </select>
            </div>
            <div class="form-group">
                <label>${t.type}</label>
                <select id="f-detail2">
                    <option value="Pee">Pee</option>
                    <option value="Poop">Poop</option>
                    <option value="Both">Both</option>
                </select>
            </div>
        `;
    } else if (type === 'feeding') {
        html += `
            <div class="form-group">
                <label>${t.time}</label>
                <input type="time" id="f-time">
            </div>
            <div class="form-group">
                <label>${t.source}</label>
                <select id="f-detail1">
                    <option value="Breast (L)">Breast (L)</option>
                    <option value="Breast (R)">Breast (R)</option>
                    <option value="Formula">Formula</option>
                    <option value="Water">Water</option>
                </select>
            </div>
            <div class="form-group">
                <label>${t.amount}</label>
                <input type="number" id="f-detail2">
            </div>
        `;
    } else if (type === 'food') {
        html += `
            <div class="form-group">
                <label>${t.time}</label>
                <input type="time" id="f-time">
            </div>
            <div class="form-group">
                <label>${t.description}</label>
                <textarea id="f-detail1"></textarea>
            </div>
        `;
    } else if (type === 'care') {
        html += `
            <div class="form-group">
                <label>${t.time}</label>
                <input type="time" id="f-time">
            </div>
            <div class="form-group">
                <label>${t.description}</label>
                <select id="f-detail1">
                    <option value="DHA">DHA</option>
                    <option value="Probiotics">Probiotics</option>
                    <option value="Vitamin AD">Vitamin AD</option>
                    <option value="Bath">Bath</option>
                    <option value="Massage">Massage</option>
                    <option value="Sunlight">Sunlight</option>
                </select>
            </div>
        `;
    }

    html += `
        <div class="form-group">
            <label>${t.remarks}</label>
            <textarea id="f-remarks"></textarea>
        </div>
        <button class="btn-save" onclick="saveDaily('${type}')">${t.save}</button>
    `;

    body.innerHTML = html;
    modal.style.display = 'block';
    
    // Auto-fill time
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
        detail1: document.getElementById('f-detail1')?.value || document.getElementById('f-start')?.value || "",
        detail2: document.getElementById('f-detail2')?.value || document.getElementById('f-end')?.value || "",
        detail3: document.getElementById('f-detail3')?.value || "",
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

// ── Calendar & Growth ───────────────────────────────────────────────────────

async function loadDailyRecords() {
    const date = document.getElementById('calendar-date').value;
    if (!date) return;
    
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

async function saveGrowth() {
    const data = {
        weight: document.getElementById('growth-weight').value,
        height: document.getElementById('growth-height').value,
        head: document.getElementById('growth-head').value,
        date: new Date().toISOString().split('T')[0]
    };

    if (!data.weight || !data.height) return;

    try {
        const res = await fetch('/api/growth', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (res.ok) {
            loadGrowthHistory();
            tg.showAlert(translations[currentLanguage].success);
        }
    } catch (e) {
        tg.showAlert(translations[currentLanguage].error);
    }
}

async function loadGrowthHistory() {
    const container = document.getElementById('growth-history');
    try {
        const res = await fetch('/api/growth');
        const history = await res.json();
        container.innerHTML = history.reverse().map(h => `
            <div class="record-item">
                <div class="record-header">${h.Date}</div>
                <div class="record-details">
                    W: ${h['Weight (kg)']}kg | H: ${h['Height (cm)']}cm | Head: ${h['Head (cm)']}cm
                </div>
            </div>
        `).join('');
    } catch (e) {}
}

// ── Tasks ───────────────────────────────────────────────────────────────────

async function loadTasks() {
    const container = document.getElementById('task-list');
    try {
        const res = await fetch('/api/tasks');
        const tasks = await res.json();
        container.innerHTML = tasks.map(t => `
            <li class="task-item">
                <input type="checkbox" ${t.Status === 'Done' ? 'checked' : ''} 
                    onchange="toggleTask('${t.Task}', this.checked)">
                <span>${t.Task}</span>
            </li>
        `).join('');
    } catch (e) {}
}

async function toggleTask(name, checked) {
    await fetch('/api/tasks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: name, status: checked ? 'Done' : 'Pending'})
    });
    tg.HapticFeedback.impactOccurred('light');
}

// ── Init ────────────────────────────────────────────────────────────────────

setLanguage('en');
loadTasks();
// Set default date for calendar
document.getElementById('calendar-date').value = new Date().toISOString().split('T')[0];
loadDailyRecords();
