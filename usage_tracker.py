import json
import os
from datetime import datetime

USAGE_FILE = "usage_data.json"

def _load_usage():
    if not os.path.exists(USAGE_FILE):
        return {}
    with open(USAGE_FILE, "r") as f:
        return json.load(f)

def _save_usage(data):
    with open(USAGE_FILE, "w") as f:
        json.dump(data, f, indent=2)

def log_usage(character_count: int):
    """Logs character usage for the current month."""
    data = _load_usage()
    month_key = datetime.now().strftime("%Y-%m")
    
    current_total = data.get(month_key, 0)
    data[month_key] = current_total + character_count
    
    _save_usage(data)
    return data[month_key]

def get_monthly_usage():
    """Returns the character usage for the current month."""
    data = _load_usage()
    month_key = datetime.now().strftime("%Y-%m")
    return data.get(month_key, 0)
