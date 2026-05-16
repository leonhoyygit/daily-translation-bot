import os
import gspread
from google.oauth2.service_account import Credentials
import json
import logging
from datetime import datetime

# ── Logging Setup ─────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Setup ─────────────────────────────────────────────────────────────────────
GOOGLE_CREDS_PATH = "google_creds.json"
SPREADSHEET_NAME = "Baby_Tracker_Data"
SPREADSHEET_ID = os.environ.get("SPREADSHEET_ID")

# In-memory cache to reduce API calls
# Structure: { "worksheet_name": (timestamp, data_list) }
_CACHE = {}
_CACHE_TTL = 60  # seconds

def _get_from_cache(key):
    if key in _CACHE:
        ts, data = _CACHE[key]
        if (datetime.now() - ts).total_seconds() < _CACHE_TTL:
            return data
    return None

def _save_to_cache(key, data):
    _CACHE[key] = (datetime.now(), data)

def _invalidate_cache(key=None):
    global _CACHE
    if key:
        if key in _CACHE: del _CACHE[key]
    else:
        _CACHE = {}

def get_credentials():
    scopes = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
    try:
        if os.path.exists(GOOGLE_CREDS_PATH):
            return Credentials.from_service_account_file(GOOGLE_CREDS_PATH, scopes=scopes)
        elif "GOOGLE_APPLICATION_CREDENTIALS_JSON" in os.environ:
            return Credentials.from_service_account_info(json.loads(os.environ["GOOGLE_APPLICATION_CREDENTIALS_JSON"]), scopes=scopes)
    except Exception as e:
        logger.error(f"Creds Error: {e}")
    return None

def get_sh():
    try:
        creds = get_credentials()
        if not creds: return None
        gc = gspread.authorize(creds)
        sh = None
        if SPREADSHEET_ID:
            try: sh = gc.open_by_key(SPREADSHEET_ID)
            except: pass
        if not sh:
            try: sh = gc.open(SPREADSHEET_NAME)
            except gspread.SpreadsheetNotFound: sh = gc.create(SPREADSHEET_NAME)
        
        # Simple worksheet existence check (no header checks to save API calls)
        if sh:
            def ensure(name, headers):
                try: return sh.worksheet(name)
                except gspread.WorksheetNotFound:
                    s = sh.add_worksheet(title=name, rows="1000", cols="20")
                    s.append_row(headers)
                    return s
            
            ensure("Daily_Records", ["Date", "Type", "Time", "Detail1", "Detail2", "Detail3", "Remarks"])
            ensure("Growth_Metrics", ["Date", "Weight (kg)", "Height (cm)", "Head (cm)"])
            ensure("Daily_Tasks", ["Date", "Task", "Status"])
            ensure("Meal_Plans", ["Date", "MealPlan", "LastUpdated"])
        return sh
    except Exception as e:
        logger.error(f"Spreadsheet Error: {e}")
        return None

# ── Task Logic ──────────────────────────────────────────────────────────────

def set_tasks(date_str, tasks_list):
    sh = get_sh()
    if not sh: return False
    try:
        sheet = sh.worksheet("Daily_Tasks")
        records = sheet.get_all_records()
        new_rows = [["Date", "Task", "Status"]]
        for r in records:
            if str(r.get("Date")) != date_str:
                new_rows.append([r.get("Date"), r.get("Task"), r.get("Status")])
        for task_name in tasks_list:
            if task_name.strip():
                new_rows.append([date_str, task_name.strip(), "Pending"])
        
        sheet.clear()
        sheet.update("A1", new_rows)
        _invalidate_cache("Daily_Tasks")
        return True
    except Exception as e:
        logger.error(f"set_tasks error: {e}")
        return False

def get_tasks(date_str):
    data = _get_from_cache("Daily_Tasks")
    if data is None:
        sh = get_sh()
        if not sh: return []
        try:
            sheet = sh.worksheet("Daily_Tasks")
            data = sheet.get_all_records()
            _save_to_cache("Daily_Tasks", data)
        except Exception as e:
            logger.error(f"get_tasks error: {e}")
            return []
    return [r for r in data if str(r.get("Date")) == date_str]

def update_task(date_str, task_name, status):
    sh = get_sh()
    if not sh: return False
    try:
        sheet = sh.worksheet("Daily_Tasks")
        records = sheet.get_all_records()
        for i, r in enumerate(records):
            if str(r.get("Date")) == date_str and str(r.get("Task")) == task_name:
                sheet.update_cell(i + 2, 3, status)
                _invalidate_cache("Daily_Tasks")
                return True
    except Exception as e:
        logger.error(f"update_task error: {e}")
    return False

# ── Meal Logic ──────────────────────────────────────────────────────────────

def log_meal_plan(date_str, meal_plan):
    sh = get_sh()
    if not sh: return False
    try:
        sheet = sh.worksheet("Meal_Plans")
        cell = None
        try: cell = sheet.find(date_str, in_column=1)
        except gspread.CellNotFound: pass
        
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if cell:
            sheet.update_cell(cell.row, 2, meal_plan)
            sheet.update_cell(cell.row, 3, now_str)
        else:
            sheet.append_row([date_str, meal_plan, now_str])
        _invalidate_cache("Meal_Plans")
        return True
    except Exception as e:
        logger.error(f"log_meal_plan error: {e}")
        return False

def get_meal_plan(date_str):
    data = _get_from_cache("Meal_Plans")
    if data is None:
        sh = get_sh()
        if not sh: return ""
        try:
            sheet = sh.worksheet("Meal_Plans")
            data = sheet.get_all_records()
            _save_to_cache("Meal_Plans", data)
        except Exception as e:
            logger.error(f"get_meal_plan error: {e}")
            return ""
    
    for r in data:
        if str(r.get("Date")) == date_str:
            return r.get("MealPlan", "")
    return ""

# ── Direct Header Fix (Manual trigger only) ──────────────────────────────────

def force_fix_headers():
    sh = get_sh()
    if not sh: return False
    try:
        targets = {
            "Daily_Tasks": ["Date", "Task", "Status"],
            "Meal_Plans": ["Date", "MealPlan", "LastUpdated"]
        }
        for name, headers in targets.items():
            ws = sh.worksheet(name)
            ws.clear()
            ws.append_row(headers)
        _invalidate_cache()
        return True
    except: return False

# ── Record Logic (Standard) ──────────────────────────────────────────────────

def log_daily_record(record_type, time, detail1="", detail2="", detail3="", remarks="", date_str=None):
    if not date_str: date_str = datetime.now().strftime("%Y-%m-%d")
    sh = get_sh()
    if sh:
        try:
            sheet = sh.worksheet("Daily_Records")
            sheet.append_row([date_str, record_type, time, detail1, detail2, detail3, remarks])
            _invalidate_cache("Daily_Records")
            return True
        except: pass
    return False

def get_daily_records(date_str):
    data = _get_from_cache("Daily_Records")
    if data is None:
        sh = get_sh()
        if not sh: return []
        try:
            sheet = sh.worksheet("Daily_Records")
            data = sheet.get_all_records()
            _save_to_cache("Daily_Records", data)
        except Exception as e:
            logger.error(f"get_daily_records error: {e}")
            return []
    return [r for r in data if str(r.get("Date")) == date_str]

def get_all_daily_records():
    data = _get_from_cache("Daily_Records")
    if data is None:
        sh = get_sh()
        if not sh: return []
        try:
            sheet = sh.worksheet("Daily_Records")
            data = sheet.get_all_records()
            _save_to_cache("Daily_Records", data)
        except Exception as e:
            logger.error(f"get_all_daily_records error: {e}")
            return []
    return data

def get_growth_metrics():
    data = _get_from_cache("Growth_Metrics")
    if data is None:
        sh = get_sh()
        if not sh: return []
        try:
            sheet = sh.worksheet("Growth_Metrics")
            data = sheet.get_all_records()
            _save_to_cache("Growth_Metrics", data)
        except Exception as e:
            logger.error(f"get_growth_metrics error: {e}")
            return []
    return data

def log_growth_metric(weight, height, head, date_str=None):
    if not date_str: date_str = datetime.now().strftime("%Y-%m-%d")
    sh = get_sh()
    if sh:
        try:
            sh.worksheet("Growth_Metrics").append_row([date_str, weight, height, head])
            _invalidate_cache("Growth_Metrics")
            return True
        except: pass
    return False

def get_service_account_email():
    creds = get_credentials()
    return creds.service_account_email if creds and hasattr(creds, 'service_account_email') else "Not Found"
