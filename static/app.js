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
        head_chart: "Head Circumference",
        breast_l: "Breast (L)",
        breast_r: "Breast (R)",
        formula: "Formula",
        water: "Water",
        pee: "Pee",
        poop: "Poop",
        both: "Both",
        daily_overview: "Daily Overview",
        meal_plan: "Meal Plan",
        task_list: "Task List",
        update_now: "Update now",
        check_goals: "Check goals",
        birthday: "Happy Birthday Andrea!",
        save_plan: "Save Plan",
        tasks: "Tasks",
        daily_goals: "Daily Goals",
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        meal_type: "Meal Type",
        dish_name: "Dish Name",
        daily_menu: "Daily Menu"
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
        head_chart: "Lingkar Kepala",
        breast_l: "ASI (Ki)",
        breast_r: "ASI (Ka)",
        formula: "Formula",
        water: "Air",
        pee: "Pipis",
        poop: "Pup",
        both: "Keduanya",
        daily_overview: "Ringkasan Harian",
        meal_plan: "Menu Makan",
        task_list: "Daftar Tugas",
        update_now: "Perbarui",
        check_goals: "Cek target",
        birthday: "Selamat Ulang Tahun Andrea!",
        save_plan: "Simpan Menu",
        tasks: "Tugas",
        daily_goals: "Target Harian",
        breakfast: "Sarapan",
        lunch: "Makan Siang",
        dinner: "Makan Malam",
        meal_type: "Tipe Makan",
        dish_name: "Nama Masakan",
        daily_menu: "Menu Harian"
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
        head_chart: "頭圍趨勢",
        breast_l: "母乳 (左)",
        breast_r: "母乳 (右)",
        formula: "配方奶",
        water: "飲水",
        pee: "小便",
        poop: "大便",
        both: "大小便",
        daily_overview: "每日概覽",
        meal_plan: "今日食譜",
        task_list: "任務清單",
        update_now: "立即更新",
        check_goals: "查看目標",
        birthday: "祝 Andrea 生日快樂！",
        save_plan: "儲存食譜",
        tasks: "任務",
        daily_goals: "今日目標",
        breakfast: "早餐",
        lunch: "午餐",
        dinner: "晚餐",
        meal_type: "餐點類型",
        dish_name: "菜名",
        daily_menu: "今日菜單"
    }
};

function checkBirthday() {
    const today = new Date();
    const isMay16 = (today.getMonth() === 4 && today.getDate() === 16);
    if (isMay16) {
        document.body.classList.add('birthday-mode');
        document.getElementById('birthday-badge').style.display = 'flex';
        document.getElementById('baby-quote').textContent = translations[currentLanguage].birthday + " 🎂🎉";
    }
}

function updateOverviewDate() {
    const today = new Date();
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    document.getElementById('display-date').innerText = today.toLocaleDateString(currentLanguage === 'zh' ? 'zh-TW' : 'en-US', options);
}

async function refreshOverviewPreviews() {
    const date = new Date().toISOString().split('T')[0];
    try {
        const mealRes = await fetch(`/api/meal-plan/${date}`);
        const mealData = await mealRes.json();
        
        const slots = ['breakfast', 'lunch', 'dinner'];
        slots.forEach(slot => {
            const el = document.getElementById(`${slot}-preview`);
            if (el) {
                try {
                    const plan = mealData.meal_plan ? JSON.parse(mealData.meal_plan) : {};
                    if (plan[slot]) {
                        el.innerText = plan[slot];
                        el.classList.remove('empty');
                    } else {
                        el.innerText = "--";
                        el.classList.add('empty');
                    }
                } catch (e) {
                    // Fallback for old plain text format
                    if (slot === 'breakfast') {
                        el.innerText = mealData.meal_plan || "--";
                        el.classList.toggle('empty', !mealData.meal_plan);
                    } else {
                        el.innerText = "--";
                        el.classList.add('empty');
                    }
                }
            }
        });

        const taskRes = await fetch('/api/tasks');
        const tasks = await taskRes.json();
        const total = tasks.length;
        const done = tasks.filter(t => t.Status === 'Done').length;
        const percentage = total > 0 ? (done / total) * 100 : 0;
        
        document.getElementById('task-progress').style.width = `${percentage}%`;
        document.getElementById('task-preview').innerText = `${done}/${total} completed`;
    } catch (e) {
        console.error("Error refreshing previews", e);
    }
}

async function openMealPlan(initialType) {
    const overlay = document.getElementById('form-modal');
    const body = document.getElementById('modal-body');
    const t = translations[currentLanguage];
    
    body.innerHTML = `<h2 style="margin-bottom:20px;text-align:center;">${t.meal_plan}</h2>
        <div class="form-group">
            <label>${t.calendar}</label>
            <input type="date" id="meal-date" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
            <label>${t.meal_type}</label>
            <select id="meal-type">
                <option value="breakfast">${t.breakfast}</option>
                <option value="lunch">${t.lunch}</option>
                <option value="dinner">${t.dinner}</option>
            </select>
        </div>
        <div class="form-group">
            <label>${t.dish_name}</label>
            <textarea id="meal-content" rows="3" placeholder="e.g. Avocado Toast..."></textarea>
        </div>
        <button class="btn-primary-pill" onclick="saveMealPlan()">${t.save_plan}</button>`;
    
    if (initialType) document.getElementById('meal-type').value = initialType.toLowerCase();
    overlay.classList.add('active');
    
    const updateFields = async () => {
        const date = document.getElementById('meal-date').value;
        const res = await fetch(`/api/meal-plan/${date}`);
        const data = await res.json();
        const type = document.getElementById('meal-type').value;
        try {
            const plan = data.meal_plan ? JSON.parse(data.meal_plan) : {};
            document.getElementById('meal-content').value = plan[type] || "";
        } catch (e) {
            document.getElementById('meal-content').value = (type === 'breakfast') ? data.meal_plan || "" : "";
        }
    };

    document.getElementById('meal-date').onchange = updateFields;
    document.getElementById('meal-type').onchange = updateFields;
    updateFields();
}

async function saveMealPlan() {
    const btn = document.querySelector('.modal-sheet .btn-primary-pill');
    const date = document.getElementById('meal-date').value;
    const type = document.getElementById('meal-type').value;
    const dish = document.getElementById('meal-content').value;
    
    btn.disabled = true;
    btn.innerText = translations[currentLanguage].loading;
    
    try {
        // 1. Get current plan and update it
        const res = await fetch(`/api/meal-plan/${date}`);
        const data = await res.json();
        let plan = {};
        try {
            plan = data.meal_plan ? JSON.parse(data.meal_plan) : {};
        } catch (e) {
            plan = { 'breakfast': data.meal_plan };
        }
        plan[type] = dish;

        // 2. Save meal plan
        await fetch('/api/meal-plan', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ date, meal_plan: JSON.stringify(plan) })
        });

        // 3. Inject into timeline with hardcoded times
        const timeMap = { 'breakfast': '09:00', 'lunch': '12:00', 'dinner': '18:00' };
        if (dish) {
            await fetch('/api/daily', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    type: 'food',
                    time: timeMap[type],
                    detail1: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${dish}`,
                    date: date
                })
            });
        }

        tg.HapticFeedback.notificationOccurred('success');
        closeForm();
        refreshOverviewPreviews();
    } catch (e) {
        tg.showAlert(translations[currentLanguage].error);
    } finally {
        btn.disabled = false;
        btn.innerText = translations[currentLanguage].save_plan;
    }
}

async function openTaskList() {
    const overlay = document.getElementById('form-modal');
    const body = document.getElementById('modal-body');
    const t = translations[currentLanguage];
    
    body.innerHTML = `<h2 style="margin-bottom:20px;text-align:center;">${t.task_list}</h2>
        <div id="tasks-container" style="margin-bottom:20px;">${t.loading}</div>`;
    
    overlay.classList.add('active');
    
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    
    let html = '';
    tasks.forEach(task => {
        const isDone = task.Status === 'Done';
        html += `
            <div class="overview-item" style="margin-bottom:8px; justify-content:space-between;" onclick="toggleTask('${task.Task}', '${isDone ? 'Pending' : 'Done'}')">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="item-icon ${isDone ? 'feeding-bg' : 'task-bg'}">${isDone ? '✅' : '⭕'}</div>
                    <span style="${isDone ? 'text-decoration:line-through;color:#aaa;' : 'font-weight:600;'}">${task.Task}</span>
                </div>
            </div>
        `;
    });
    document.getElementById('tasks-container').innerHTML = html;
}

async function toggleTask(name, newStatus) {
    try {
        await fetch('/api/tasks', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: name, status: newStatus })
        });
        tg.HapticFeedback.impactOccurred('light');
        openTaskList(); // Refresh list
        refreshOverviewPreviews();
    } catch (e) {
        tg.showAlert(translations[currentLanguage].error);
    }
}


function setLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('.lang-pill button').forEach(btn => btn.classList.toggle('active', btn.id === `btn-${lang}`));
    
    updateOverviewDate();
    checkBirthday();
    
    // Refresh timeline if active to translate dynamic content
    if (document.getElementById('tab-activities').classList.contains('active')) {
        loadTimeline(selectedDate);
    }
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

    // Common Date field for all forms
    html += `<div class="form-group"><label data-i18n="calendar">${t.calendar}</label><input type="date" id="f-date"></div>`;

    if (type === 'sleep') {
        html += `
            <div class="form-group"><label>${t.start_time}</label><input type="time" id="f-start"></div>
            <div class="form-group"><label>${t.end_time}</label><input type="time" id="f-end"></div>
        `;
    } else if (type === 'feeding') {
        html += `
            <div class="form-group"><label>${t.time}</label><input type="time" id="f-time"></div>
            <div class="form-group"><label>${t.source}</label><select id="f-detail1">
                <option value="Formula" selected>${t.formula}</option>
                <option value="Breast (L)">${t.breast_l}</option>
                <option value="Breast (R)">${t.breast_r}</option>
                <option value="Water">${t.water}</option>
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
    
    // Set default values
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    document.getElementById('f-date').value = selectedDate;
    if (document.getElementById('f-time')) document.getElementById('f-time').value = timeStr;
    if (document.getElementById('f-start')) document.getElementById('f-start').value = timeStr;
}

function closeForm() { document.getElementById('form-modal').classList.remove('active'); }

async function saveDaily(type) {
    const btn = document.querySelector('.modal-sheet .btn-primary-pill');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = translations[currentLanguage].loading;

    const chosenDate = document.getElementById('f-date').value;

    const data = {
        type: type,
        time: document.getElementById('f-time')?.value || document.getElementById('f-start')?.value,
        detail1: document.getElementById('f-detail1')?.value || "",
        detail2: document.getElementById('f-detail2')?.value || document.getElementById('f-end')?.value || "",
        remarks: document.getElementById('f-remarks')?.value || "",
        date: chosenDate
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
            
            // Switch view to the date that was just saved
            selectedDate = chosenDate;
            loadTimeline(chosenDate);
            renderCalendar(); // Refresh dots
        } else {
            throw new Error('Save failed');
        }
    } catch (e) { 
        tg.showAlert(translations[currentLanguage].error); 
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

// ── Timeline Logic ──────────────────────────────────────────────────────────

async function loadTimeline(date) {
    const container = document.getElementById('timeline-list');
    document.getElementById('activity-date-label').innerText = (date === new Date().toISOString().split('T')[0]) ? "Today" : date;
    container.innerHTML = `<p style="text-align:center;padding:20px;color:#ccc;">${translations[currentLanguage].loading}</p>`;
    
    const translateValue = (val) => {
        if (val === undefined || val === null || val === "") return "";
        const strVal = String(val);
        const map = {
            "feeding": "feeding", "diaper": "diaper", "sleep": "sleep", "food": "food", "care": "care",
            "Breast (L)": "breast_l", "Breast (R)": "breast_r", "Formula": "formula", "Water": "water",
            "Pee": "pee", "Poop": "poop", "Both": "both"
        };
        const key = map[strVal] || map[strVal.toLowerCase()];
        return key ? (translations[currentLanguage][key] || strVal) : strVal;
    };

    try {
        const res = await fetch(`/api/daily/${date}`);
        const records = await res.json();
        if (records.length === 0) { container.innerHTML = `<p style="text-align:center;padding:40px;color:#ccc;">No logs for this day 🍞</p>`; return; }
        records.sort((a, b) => a.Time.localeCompare(b.Time));
        container.innerHTML = records.map(r => `
            <div class="timeline-entry">
                <div class="time-box">${r.Time}</div>
                <div class="entry-details">
                    <strong>${translateValue(r.Type).toUpperCase()}</strong>
                    <span>${translateValue(r.Detail1)} ${r.Detail2 ? '| ' + translateValue(r.Detail2) : ''}</span>
                    ${r.Remarks ? `<p style="font-size:0.75rem;color:#aaa;margin-top:4px;">${r.Remarks}</p>` : ''}
                </div>
            </div>
        `).join('');
    } catch (e) { container.innerHTML = 'Error loading logs.'; }
}

// ── Calendar Logic ──────────────────────────────────────────────────────────

async function renderCalendar() {
    const container = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('current-month-year');
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    monthYear.innerText = new Intl.DateTimeFormat(currentLanguage === 'zh' ? 'zh-TW' : currentLanguage, { month: 'short', year: 'numeric' }).format(currentCalendarDate);
    container.innerHTML = '';
    
    ['S','M','T','W','T','F','S'].forEach(d => container.innerHTML += `<div style="font-size:0.7rem;font-weight:700;color:#ddd;text-align:center;">${d}</div>`);
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Fetch dates with activities to show dots
    let activityDates = [];
    try {
        const res = await fetch('/api/activity-dates');
        if (res.ok) activityDates = await res.json();
    } catch(e) {}

    for (let i = 0; i < firstDay; i++) container.innerHTML += `<div></div>`;
    
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        const isSelected = dateStr === selectedDate;
        const hasActivity = activityDates.includes(dateStr);
        
        container.innerHTML += `
            <div class="day-cell ${isSelected ? 'selected' : ''} ${hasActivity ? 'has-activity' : ''}" onclick="selectDate('${dateStr}')">
                ${d}
                ${hasActivity && !isSelected ? '<span class="dot"></span>' : ''}
            </div>
        `;
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
        options: { 
            responsive: true, 
            plugins: { legend: { display: false } }, 
            scales: { 
                x: { 
                    display: true, 
                    grid: { display: false },
                    ticks: { font: { size: 10 }, color: '#ccc' }
                }, 
                y: { grid: { display: false } } 
            } 
        }
    });
    if (charts.weight) charts.weight.destroy(); 
    if (charts.height) charts.height.destroy();
    if (charts.head) charts.head.destroy();

    charts.weight = new Chart(document.getElementById('weightChart'), common('Weight', '#ff4d4d'));
    charts.height = new Chart(document.getElementById('heightChart'), common('Height', '#ffb6c1'));
    charts.head = new Chart(document.getElementById('headChart'), common('Head', '#ffd700'));
}

function updateCharts(data) {
    if (!data.length || !charts.weight) return;
    const labels = data.map(h => h.Date);
    charts.weight.data.labels = labels; charts.weight.data.datasets[0].data = data.map(h => h['Weight (kg)']); charts.weight.update();
    charts.height.data.labels = labels; charts.height.data.datasets[0].data = data.map(h => h['Height (cm)']); charts.height.update();
    charts.head.data.labels = labels; charts.head.data.datasets[0].data = data.map(h => h['Head (cm)']); charts.head.update();
}

async function saveGrowth() {
    const btn = document.querySelector('#tab-growth .btn-primary-pill');
    const originalText = btn.innerText;
    
    const chosenDate = document.getElementById('growth-date').value;

    const data = { 
        weight: document.getElementById('growth-weight').value, 
        height: document.getElementById('growth-height').value, 
        head: document.getElementById('growth-head').value, 
        date: chosenDate 
    };
    
    if (!data.weight || !data.height) {
        tg.showAlert("Please enter weight and height");
        return;
    }

    btn.disabled = true;
    btn.innerText = translations[currentLanguage].loading;

    try {
        const res = await fetch('/api/growth', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(data) 
        });
        if (res.ok) {
            loadGrowthHistory(); 
            tg.showAlert(translations[currentLanguage].success);
            selectedDate = chosenDate;
            renderCalendar();
        } else {
            throw new Error('Growth save failed');
        }
    } catch (e) {
        tg.showAlert(translations[currentLanguage].error);
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

// ── Init ────────────────────────────────────────────────────────────────────
setLanguage('en');
switchTab('daily');
document.getElementById('growth-date').value = selectedDate;
refreshOverviewPreviews();
