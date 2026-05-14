import os
import gspread
from google.oauth2.service_account import Credentials
import json

# ── Setup ─────────────────────────────────────────────────────────────────────

GOOGLE_CREDS_PATH = "google_creds.json"
SPREADSHEET_NAME = "Baby_Tracker_Data"

def get_credentials():
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]
    if os.path.exists(GOOGLE_CREDS_PATH):
        return Credentials.from_service_account_file(GOOGLE_CREDS_PATH, scopes=scopes)
    elif "GOOGLE_APPLICATION_CREDENTIALS_JSON" in os.environ:
        creds_dict = json.loads(os.environ["GOOGLE_APPLICATION_CREDENTIALS_JSON"])
        return Credentials.from_service_account_info(creds_dict, scopes=scopes)
    return None

def get_gc():
    creds = get_credentials()
    if creds:
        return gspread.authorize(creds)
    return None

def get_or_create_spreadsheet():
    gc = get_gc()
    if not gc:
        return None
    
    try:
        return gc.open(SPREADSHEET_NAME)
    except gspread.SpreadsheetNotFound:
        sh = gc.create(SPREADSHEET_NAME)
        # Share with the service account email is automatic, 
        # but we might want to share with the user's email if we knew it.
        # For now, it's just in the service account's drive.
        
        # Initialize sheets
        sh.add_worksheet(title="Daily_Records", rows="1000", cols="20")
        sh.add_worksheet(title="Growth_Metrics", rows="1000", cols="5")
        sh.add_worksheet(title="Daily_Tasks", rows="100", cols="3")
        
        # Remove default Sheet1
        try:
            sheet1 = sh.worksheet("Sheet1")
            sh.del_worksheet(sheet1)
        except:
            pass
            
        # Add headers
        daily = sh.worksheet("Daily_Records")
        daily.append_row(["Date", "Type", "Time", "Detail1", "Detail2", "Detail3", "Remarks"])
        
        growth = sh.worksheet("Growth_Metrics")
        growth.append_row(["Date", "Weight (kg)", "Height (cm)", "Head (cm)"])
        
        tasks = sh.worksheet("Daily_Tasks")
        tasks.append_row(["Task", "Status", "LastUpdated"])
        # Add default tasks
        default_tasks = [
            ["Morning Feeding", "Pending", ""],
            ["Vitamin AD", "Pending", ""],
            ["Bath Time", "Pending", ""],
            ["Tummy Time", "Pending", ""]
        ]
        tasks.append_rows(default_tasks)
        
        return sh

def log_daily_record(record_type, time, detail1="", detail2="", detail3="", remarks="", date_str=None):
    from datetime import datetime
    if not date_str:
        date_str = datetime.now().strftime("%Y-%m-%d")
    
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Daily_Records")
        sheet.append_row([date_str, record_type, time, detail1, detail2, detail3, remarks])
        return True
    return False

def get_daily_records(date_str):
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Daily_Records")
        all_records = sheet.get_all_records()
        return [r for r in all_records if r["Date"] == date_str]
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

def get_tasks():
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Daily_Tasks")
        return sheet.get_all_records()
    return []

def update_task(task_name, status):
    from datetime import datetime
    sh = get_or_create_spreadsheet()
    if sh:
        sheet = sh.worksheet("Daily_Tasks")
        cells = sheet.findall(task_name)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if cells:
            row = cells[0].row
            sheet.update_cell(row, 2, status)
            sheet.update_cell(row, 3, now_str)
        else:
            sheet.append_row([task_name, status, now_str])
        return True
    return False
