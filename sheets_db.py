import os
import gspread
from google.oauth2.service_account import Credentials
import json
import logging

# ── Logging Setup ─────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ── Setup ─────────────────────────────────────────────────────────────────────

GOOGLE_CREDS_PATH = "google_creds.json"
SPREADSHEET_NAME = "Baby_Tracker_Data"
SPREADSHEET_ID = os.environ.get("SPREADSHEET_ID")

def get_service_account_email():
    creds = get_credentials()
    if creds and hasattr(creds, 'service_account_email'):
        return creds.service_account_email
    return "Not Found"

def get_credentials():
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]
    try:
        if os.path.exists(GOOGLE_CREDS_PATH):
            return Credentials.from_service_account_file(GOOGLE_CREDS_PATH, scopes=scopes)
        elif "GOOGLE_APPLICATION_CREDENTIALS_JSON" in os.environ:
            creds_dict = json.loads(os.environ["GOOGLE_APPLICATION_CREDENTIALS_JSON"])
            return Credentials.from_service_account_info(creds_dict, scopes=scopes)
    except Exception as e:
        logger.error(f"Error loading credentials: {e}")
    return None

def get_gc():
    creds = get_credentials()
    if creds:
        try:
            return gspread.authorize(creds)
        except Exception as e:
            logger.error(f"Error authorizing gspread: {e}")
    return None

def ensure_worksheet(sh, title, headers):
    try:
        return sh.worksheet(title)
    except gspread.WorksheetNotFound:
        logger.info(f"Worksheet '{title}' not found. Creating...")
        sheet = sh.add_worksheet(title=title, rows="1000", cols="20")
        sheet.append_row(headers)
        return sheet

def get_or_create_spreadsheet():
    gc = get_gc()
    if not gc:
        logger.error("Failed to get gspread client (gc is None)")
        return None
    
    sh = None
    # Try opening by ID first if provided
    if SPREADSHEET_ID:
        try:
            sh = gc.open_by_key(SPREADSHEET_ID)
        except Exception as e:
            logger.error(f"Error opening spreadsheet by ID '{SPREADSHEET_ID}': {e}")
    
    if not sh:
        try:
            sh = gc.open(SPREADSHEET_NAME)
        except gspread.SpreadsheetNotFound:
            try:
                logger.info(f"Spreadsheet '{SPREADSHEET_NAME}' not found. Creating...")
                sh = gc.create(SPREADSHEET_NAME)
            except Exception as e:
                logger.error(f"Error creating spreadsheet: {e}")
                return None
        except Exception as e:
            logger.error(f"Error opening spreadsheet: {e}")
            return None

    if sh:
        # Ensure all required worksheets exist
        ensure_worksheet(sh, "Daily_Records", ["Date", "Type", "Time", "Detail1", "Detail2", "Detail3", "Remarks"])
        ensure_worksheet(sh, "Growth_Metrics", ["Date", "Weight (kg)", "Height (cm)", "Head (cm)"])
        ensure_worksheet(sh, "Daily_Tasks", ["Date", "Task", "Status"])
        ensure_worksheet(sh, "Meal_Plans", ["Date", "MealPlan", "LastUpdated"])
        
    return sh

def set_tasks(date_str, tasks_list):
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Daily_Tasks")
        # Remove existing tasks for this date
        records = sheet.get_all_records()
        new_rows = [["Date", "Task", "Status"]]
        for r in records:
            if str(r.get("Date")) != date_str:
                new_rows.append([r.get("Date"), r.get("Task"), r.get("Status")])
        
        # Add new tasks
        for task_name in tasks_list:
            if task_name.strip():
                new_rows.append([date_str, task_name.strip(), "Pending"])
        
        sheet.clear()
        sheet.update("A1", new_rows)
        return True
    return False

def log_meal_plan(date_str, meal_plan):
    from datetime import datetime
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Meal_Plans")
        cells = sheet.findall(date_str)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if cells:
            row = cells[0].row
            sheet.update_cell(row, 2, meal_plan)
            sheet.update_cell(row, 3, now_str)
        else:
            sheet.append_row([date_str, meal_plan, now_str])
        return True
    return False

def get_meal_plan(date_str):
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Meal_Plans")
        records = sheet.get_all_records()
        for r in records:
            if str(r.get("Date")) == date_str:
                return r.get("MealPlan", "")
    return ""

def log_daily_record(record_type, time, detail1="", detail2="", detail3="", remarks="", date_str=None):
    from datetime import datetime
    if not date_str:
        date_str = datetime.now().strftime("%Y-%m-%d")
    
    try:
        sh = get_or_create_spreadsheet()
        if sh:
            sheet = sh.worksheet("Daily_Records")
            sheet.append_row([date_str, record_type, time, detail1, detail2, detail3, remarks])
            return True
        else:
            logger.error("log_daily_record: sh is None")
    except Exception as e:
        logger.error(f"Error logging daily record: {e}")
    return False

def get_daily_records(date_str):
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Daily_Records")
        all_records = sheet.get_all_records()
        return [r for r in all_records if str(r.get("Date")) == date_str]
    return []

def get_all_daily_records():
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Daily_Records")
        return sheet.get_all_records()
    return []

def log_growth_metric(weight, height, head, date_str=None):
    from datetime import datetime
    if not date_str:
        date_str = datetime.now().strftime("%Y-%m-%d")
    
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Growth_Metrics")
        sheet.append_row([date_str, weight, height, head])
        return True
    return False

def get_growth_metrics():
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Growth_Metrics")
        return sheet.get_all_records()
    return []

def get_tasks(date_str):
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Daily_Tasks")
        records = sheet.get_all_records()
        return [r for r in records if str(r.get("Date")) == date_str]
    return []

def update_task(date_str, task_name, status):
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Daily_Tasks")
        records = sheet.get_all_records()
        found = False
        for i, r in enumerate(records):
            if str(r.get("Date")) == date_str and r.get("Task") == task_name:
                sheet.update_cell(i + 2, 3, status)
                found = True
                break
        return found
    return False
