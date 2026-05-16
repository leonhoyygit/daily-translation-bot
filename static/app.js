// ── Definitive UI Fix & Diagnostics ──────────────────────────────────────────
var tg = window.Telegram.WebApp;
try { tg.expand(); } catch(e) {}

var currentLanguage = 'en';

function getTodayISO() {
    var d = new Date();
    var y = d.getFullYear();
    var m = ("0" + (d.getMonth() + 1)).slice(-2);
    var day = ("0" + d.getDate()).slice(-2);
    return y + "-" + m + "-" + day;
}

var selectedDate = getTodayISO();

var translations = {
    en: {
        baby_quote: "Growing with love every day! ❤️",
        sleep: "Sleep", diaper: "Diaper", feeding: "Feeding", food: "Solid Food", care: "Care & Love",
        activities: "Activities", calendar: "Calendar", tab_daily: "Daily", tab_growth: "Growth",
        log_growth: "Growth Metrics", weight: "W (kg)", height: "H (cm)", head: "Head (cm)",
        save: "Save Update", time: "Time", start_time: "Start", end_time: "End",
        size: "Size", type: "Type", remarks: "Remarks", amount: "Amount (ml)",
        source: "Source", description: "Description", success: "Success! 🥯", error: "Error! 🍞",
        loading: "Loading...", weight_chart: "Weight Trend", height_chart: "Height Trend",
        head_chart: "Head Circumference", breast_l: "Breast (L)", breast_r: "Breast (R)",
        formula: "Formula", water: "Water", pee: "Pee", poop: "Poop", both: "Both",
        daily_overview: "Daily Overview", meal_plan: "Meal Plan", task_list: "Task List",
        update_now: "Update now", check_goals: "Check goals", birthday: "Happy Birthday Andrea!",
        save_plan: "Save Plan", tasks: "Tasks", daily_goals: "Daily Goals",
        breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner",
        meal_type: "Meal Type", dish_name: "Dish Name", daily_menu: "Daily Menu",
        set_goals: "Set Daily Goals", enter_tasks: "Enter tasks (one per line)", save_tasks: "Save Tasks"
    },
    id: {
        baby_quote: "Tumbuh dengan cinta ❤️",
        sleep: "Tidur", diaper: "Popok", feeding: "Menyusui", food: "Makanan", care: "Perawatan",
        activities: "Aktivitas", calendar: "Kalender", tab_daily: "Harian", tab_growth: "Tumbuh",
        log_growth: "Metrik Tumbuh", weight: "B (kg)", height: "T (cm)", head: "Kepala (cm)",
        save: "Simpan", time: "Waktu", start_time: "Mulai", end_time: "Selesai",
        size: "Ukuran", type: "Tipe", remarks: "Catatan", amount: "Jumlah (ml)",
        source: "Sumber", description: "Deskripsi", success: "Berhasil! 🥯", error: "Gagal! 🍞",
        loading: "Memuat...", weight_chart: "Tren Berat", height_chart: "Tren Tinggi",
        head_chart: "Lingkar Kepala", breast_l: "ASI (Ki)", breast_r: "ASI (Ka)",
        formula: "Formula", water: "Air", pee: "Pipis", poop: "Pup", both: "Keduanya",
        daily_overview: "Ringkasan Harian", meal_plan: "Menu Makan", task_list: "Daftar Tugas",
        update_now: "Perbarui", check_goals: "Cek target", birthday: "Selamat Ulang Tahun Andrea!",
        save_plan: "Simpan Menu", tasks: "Tugas", daily_goals: "Target Harian",
        breakfast: "Sarapan", lunch: "Makan Siang", dinner: "Makan Malam",
        meal_type: "Tipe Makan", dish_name: "Nama Masakan", daily_menu: "Menu Harian",
        set_goals: "Atur Target", enter_tasks: "Masukkan tugas (satu per baris)", save_tasks: "Simpan Tugas"
    },
    zh: {
        baby_quote: "在愛中茁壯成長 ❤️",
        sleep: "睡眠", diaper: "換片", feeding: "喂奶", food: "輔食", care: "關愛",
        activities: "活動", calendar: "日曆", tab_daily: "日常", tab_growth: "成長",
        log_growth: "成長數據", weight: "體重 (kg)", height: "身高 (cm)", head: "頭圍 (cm)",
        save: "儲存更新", time: "時間", start_time: "開始", end_time: "結束",
        size: "尺寸", type: "類型", remarks: "備註", amount: "奶量 (ml)",
        source: "方式", description: "描述", success: "儲存成功！🥯", error: "出錯了！🍞",
        loading: "加載中...", weight_chart: "體重趨勢", height_chart: "身高趨勢",
        head_chart: "頭圍趨勢", breast_l: "母乳 (左)", breast_r: "母乳 (右)",
        formula: "配方奶", water: "飲水", pee: "小便", poop: "大便", both: "大小便",
        daily_overview: "每日概覽", meal_plan: "今日食譜", task_list: "任務清單",
        update_now: "立即更新", check_goals: "查看目標", birthday: "祝 Andrea 生日快樂！",
        save_plan: "儲存食譜", tasks: "任務", daily_goals: "今日目標",
        breakfast: "早餐", lunch: "午餐", dinner: "晚餐",
        meal_type: "餐點類型", dish_name: "菜名", daily_menu: "今日菜單",
        set_goals: "設定今日目標", enter_tasks: "輸入任務（每行一個）", save_tasks: "儲存任務"
    }
};

// ── Sync Engine with Catch Blocks ──────────────────────────────────────────

function refreshOverviewPreviews() {
    var date = getTodayISO();
    
    // Meals sync
    fetch('/api/meal-plan/' + date)
    .then(function(r){ return r.json(); })
    .then(function(res){
        var plan = {};
        if (res.meal_plan) {
            try {
                if (typeof res.meal_plan === 'string' && res.meal_plan.indexOf('{') === 0) plan = JSON.parse(res.meal_plan);
                else plan = { breakfast: res.meal_plan };
            } catch(e) { plan = { breakfast: res.meal_plan }; }
        }
        ['breakfast', 'lunch', 'dinner'].forEach(function(s) {
            var el = document.getElementById(s + '-preview');
            var card = document.getElementById('slot-' + s);
            var val = plan[s] || "--";
            if (el) el.innerText = val;
            if (card) card.classList.toggle('active-slot', val !== "--");
        });
    })
    .catch(function(e){ console.error("Meal preview error:", e); });

    // Progress sync
    fetch('/api/tasks/' + date)
    .then(function(r){ return r.json(); })
    .then(function(tasks){
        if(!Array.isArray(tasks)) return;
        var total = tasks.length;
        var done = tasks.filter(function(t){ return t.Status === 'Done'; }).length;
        var pct = total > 0 ? (done / total) * 100 : 0;
        
        var bar = document.getElementById('task-progress');
        var text = document.getElementById('task-preview');
        if (bar) bar.style.width = pct + "%";
        if (text) text.innerText = done + "/" + total + " completed";
    })
    .catch(function(e){ console.error("Task preview error:", e); });
}

// ── Immediate Modals ───────────────────────────────────────────────────────

function openTasksInput() {
    var t = translations[currentLanguage] || translations['en'];
    var date = getTodayISO();
    
    showModal('<h2 style="margin-bottom:20px;text-align:center;">' + t.set_goals + '</h2>' +
            '<div class="form-group"><label>Date</label><input type="date" id="tasks-date" value="' + date + '"></div>' +
            '<div class="form-group"><label>Enter tasks (one per line)</label><textarea id="tasks-content" rows="8"></textarea></div>' +
            '<button class="btn-primary-pill" id="btn-save-tasks" onclick="saveDailyTasks()">Save Tasks</button>' +
            '<p style="margin-top:20px; text-align:center;"><button onclick="emergencyFix()" style="font-size:0.6rem; color:#ccc; background:none; border:1px solid #eee; padding:5px 10px; border-radius:10px;">Emergency Fix Database</button></p>');

    fetch('/api/tasks/' + date).then(function(r){ return r.json(); }).then(function(tasks){
        if (Array.isArray(tasks) && tasks.length > 0) {
            var el = document.getElementById('tasks-content');
            if (el) el.value = tasks.map(function(tk){ return tk.Task; }).join('\n');
        }
    });
}

function emergencyFix() {
    if(!confirm("This will clear and reset today's tasks to fix database structure. Continue?")) return;
    fetch('/api/force-fix-headers', {method:'POST'}).then(function(){
        alert("Database structure reset! Try adding tasks again.");
        closeForm();
        refreshOverviewPreviews();
    });
}

function saveDailyTasks() {
    var btn = document.getElementById('btn-save-tasks');
    if (btn) { btn.disabled = true; btn.innerText = "Syncing with Google..."; }
    
    var date = document.getElementById('tasks-date').value;
    var list = document.getElementById('tasks-content').value.split('\n').filter(function(x){ return x.trim(); });
    
    fetch('/api/set-tasks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ date: date, tasks: list })
    })
    .then(function(r){
        if (r.ok) {
            try { tg.HapticFeedback.notificationOccurred('success'); } catch(e){}
            closeForm();
            refreshOverviewPreviews();
        } else { alert("Network Error: Could not reach Google Sheets"); }
    })
    .catch(function(e){ alert("Fatal Sync Error: " + e.message); })
    .finally(function(){ if (btn) { btn.disabled = false; btn.innerText = "Save Tasks"; } });
}

function openTaskList() {
    var t = translations[currentLanguage] || translations['en'];
    var date = getTodayISO();
    
    showModal('<h2 style="margin-bottom:20px;text-align:center;">Daily Goals</h2><div id="tasks-container">' + t.loading + '</div>');

    fetch('/api/tasks/' + date)
    .then(function(r){ 
        if(!r.ok) throw new Error("Server status " + r.status);
        return r.json(); 
    })
    .then(function(tasks){
        var cont = document.getElementById('tasks-container');
        if (!cont) return;
        if (!Array.isArray(tasks) || tasks.length === 0) {
            cont.innerHTML = '<p style="text-align:center;color:#ccc;padding:20px;">No goals set for today 🎯</p>';
            return;
        }
        cont.innerHTML = tasks.map(function(tk){
            var ok = tk.Status === 'Done';
            var esc = tk.Task.replace(/'/g, "\\'");
            return '<div class="overview-item" style="margin-bottom:10px; justify-content:space-between;" onclick="toggleTaskStatus(\'' + esc + '\', \'' + (ok ? 'Pending' : 'Done') + '\')">' +
                   '<div style="display:flex; align-items:center; gap:12px;"><div class="item-icon ' + (ok ? 'feeding-bg' : 'task-bg') + '">' + (ok ? '✅' : '⭕') + '</div>' +
                   '<span style="' + (ok ? 'text-decoration:line-through;color:#aaa;' : 'font-weight:600;') + '">' + tk.Task + '</span></div></div>';
        }).join('');
    })
    .catch(function(e){
        var cont = document.getElementById('tasks-container');
        if(cont) cont.innerHTML = '<p style="color:red;padding:20px;text-align:center;">Load Error: ' + e.message + '<br><br><button onclick="openTasksInput()" style="background:#eee;border:none;padding:10px;border-radius:10px;">Retry / Set Tasks</button></p>';
    });
}

function toggleTaskStatus(name, next) {
    var date = getTodayISO();
    fetch('/api/tasks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ date: date, name: name, status: next })
    }).then(function(){
        try { tg.HapticFeedback.impactOccurred('light'); } catch(e){}
        openTaskList();
        refreshOverviewPreviews();
    });
}

function openMealPlan(slot) {
    var date = getTodayISO();
    var s = slot || 'breakfast';
    
    showModal('<h2 style="margin-bottom:20px;text-align:center;">Daily Menu</h2>' +
            '<div class="form-group"><label>Date</label><input type="date" id="meal-date" value="' + date + '"></div>' +
            '<div class="form-group"><label>Type</label><select id="meal-type">' +
            '<option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option>' +
            '</select></div>' +
            '<div class="form-group"><label>Dish Name</label><textarea id="meal-content" rows="3"></textarea></div>' +
            '<button class="btn-primary-pill" id="btn-save-meal" onclick="saveMealData()">Save Meal</button>');
    
    document.getElementById('meal-type').value = s;

    var load = function() {
        var d = document.getElementById('meal-date').value;
        var ty = document.getElementById('meal-type').value;
        fetch('/api/meal-plan/' + d).then(function(r){ return r.json(); }).then(function(res){
            var p = {};
            if (res.meal_plan) {
                try {
                    if (typeof res.meal_plan === 'string' && res.meal_plan.indexOf('{') === 0) p = JSON.parse(res.meal_plan);
                    else p = { breakfast: res.meal_plan };
                } catch(e) { p = { breakfast: res.meal_plan }; }
            }
            document.getElementById('meal-content').value = p[ty] || "";
        });
    };
    document.getElementById('meal-date').onchange = load;
    document.getElementById('meal-type').onchange = load;
    load();
}

function saveMealData() {
    var btn = document.getElementById('btn-save-meal');
    if (btn) { btn.disabled = true; btn.innerText = "Saving..."; }
    
    var date = document.getElementById('meal-date').value;
    var type = document.getElementById('meal-type').value;
    var dish = document.getElementById('meal-content').value;

    fetch('/api/meal-plan/' + date).then(function(r){ return r.json(); }).then(function(res){
        var p = {};
        if (res.meal_plan) {
            try {
                if (typeof res.meal_plan === 'string' && res.meal_plan.indexOf('{') === 0) p = JSON.parse(res.meal_plan);
                else p = { breakfast: res.meal_plan };
            } catch(e) { p = { breakfast: res.meal_plan }; }
        }
        p[type] = dish;
        return fetch('/api/meal-plan', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ date: date, meal_plan: JSON.stringify(p) }) });
    }).then(function(r){
        if (r.ok) {
            if (dish) {
                var tm = { breakfast: '09:00', lunch: '12:00', dinner: '18:00' };
                fetch('/api/daily', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ type: 'food', time: tm[type], detail1: type.toUpperCase() + ": " + dish, date: date }) });
            }
            try { tg.HapticFeedback.notificationOccurred('success'); } catch(e){}
            closeForm();
            refreshOverviewPreviews();
        }
    }).finally(function(){ if (btn) { btn.disabled = false; btn.innerText = "Save Meal"; } });
}

// ── Generic ──────────────────────────────────────────────────────────────────

function showModal(h) {
    var over = document.getElementById('form-modal');
    var body = document.getElementById('modal-body');
    if (over && body) { body.innerHTML = h; over.classList.add('active'); }
}

function closeForm() { document.getElementById('form-modal').classList.remove('active'); }

function setLanguage(l) {
    currentLanguage = l;
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var k = el.getAttribute('data-i18n');
        if (translations[l][k]) el.textContent = translations[l][k];
    });
    document.querySelectorAll('.lang-pill button').forEach(function(b) {
        b.classList.toggle('active', b.id === 'btn-' + l);
    });
    refreshOverviewPreviews();
    checkBirthday();
}

function checkBirthday() {
    var now = new Date();
    if (now.getMonth() === 4 && now.getDate() === 16) {
        document.body.classList.add('birthday-mode');
        var badge = document.getElementById('birthday-badge');
        if (badge) badge.style.display = 'flex';
    }
}

function switchTab(t) {
    document.querySelectorAll('.tab-content').forEach(function(x) { x.classList.toggle('active', x.id === 'tab-' + t); });
    document.querySelectorAll('.nav-btn').forEach(function(x) { x.classList.toggle('active', x.id === 'nav-' + t); });
    if (t === 'activities') loadTimeline(getTodayISO());
}

function openForm(type) {
    var t = translations[currentLanguage] || translations['en'];
    var h = '<h2 style="margin-bottom:25px;text-align:center;">' + t[type] + '</h2>' +
             '<div class="form-group"><label>Date</label><input type="date" id="f-date" value="' + getTodayISO() + '"></div>';

    if (type === 'sleep') h += '<div class="form-group"><label>Start</label><input type="time" id="f-start"></div><div class="form-group"><label>End</label><input type="time" id="f-end"></div>';
    else if (type === 'feeding') h += '<div class="form-group"><label>Time</label><input type="time" id="f-time"></div><div class="form-group"><label>Source</label><select id="f-detail1"><option value="Formula">Formula</option><option value="Water">Water</option></select></div><div class="form-group"><label>Amount</label><input type="number" id="f-detail2"></div>';
    else h += '<div class="form-group"><label>Time</label><input type="time" id="f-time"></div><div class="form-group"><label>Description</label><textarea id="f-detail1"></textarea></div>';

    h += '<button class="btn-primary-pill" onclick="saveRecord(\'' + type + '\')">' + t.save + '</button>';
    showModal(h);
    var now = new Date(); var ts = ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2);
    if (document.getElementById('f-time')) document.getElementById('f-time').value = ts;
}

function saveRecord(type) {
    var d = { 
        type: type, date: document.getElementById('f-date').value, 
        time: document.getElementById('f-time') ? document.getElementById('f-time').value : document.getElementById('f-start').value, 
        detail1: document.getElementById('f-detail1') ? document.getElementById('f-detail1').value : "", 
        detail2: document.getElementById('f-detail2') ? document.getElementById('f-detail2').value : ""
    };
    fetch('/api/daily', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) }).then(function(){ closeForm(); refreshOverviewPreviews(); });
}

function loadTimeline(date) {
    var cont = document.getElementById('timeline-list');
    cont.innerHTML = '<p style="text-align:center;padding:20px;">Loading...</p>';
    fetch('/api/daily/' + date).then(function(r){ return r.json(); }).then(function(data){
        if (!Array.isArray(data) || data.length === 0) { cont.innerHTML = '<p style="text-align:center;padding:20px;">No logs.</p>'; return; }
        data.sort(function(a,b){ return a.Time.localeCompare(b.Time); });
        cont.innerHTML = data.map(function(x){
            return '<div class="timeline-entry"><div class="time-box">' + x.Time + '</div><div class="entry-details"><strong>' + x.Type.toUpperCase() + '</strong><span>' + x.Detail1 + '</span></div></div>';
        }).join('');
    });
}

// ── Start ──────────────────────────────────────────────────────────────────
setLanguage('en');
switchTab('daily');
console.log("Mini-App Diagnostics: Standardized.");
