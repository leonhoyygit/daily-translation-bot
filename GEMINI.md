# Translation Bot Project Context

## Architecture
- **Framework:** `python-telegram-bot` (v22+)
- **Translation Engine:** Google Cloud Translation API V2
- **Logic:** `translator.py` handles tri-lingual routing:
  - Indonesian -> English -> Chinese
  - English -> Indonesian & Chinese
  - Chinese -> English -> Indonesian

## Deployment
- **Platform:** Railway (using `Procfile` and `runtime.txt`)
- **Credentials:** 
  - Telegram Token via `TELEGRAM_TOKEN` env var.
  - Google Cloud JSON via `GOOGLE_APPLICATION_CREDENTIALS_JSON` env var.
- **Environment:** Python 3.11+ using a virtual environment (`venv`).

## Key Features
- **Group Support:** Bot replies directly to messages for context.
- **Baby Tracker Mini-App:** Integrated Telegram WebApp for tracking Andrea's daily activities.
  - **Daily Overview:** Wide banners for Meal Plan and Daily Goals (with progress bar).
  - **Growth Tracking:** Weight, height, and head circumference with interactive charts.
  - **Birthday Mode:** Festive UI automatically activates on Andrea's birthday (May 16).
- **Google Sheets Integration:** Syncs all tracker data to `Baby_Tracker_Data` spreadsheet.
- **Usage Tracking:** Monthly character log in `usage_data.json` (max 500k/month).

## Operational Notes
- Git is initialized in the project folder.
- Remote: `https://github.com/leonhoyygit/daily-translation-bot.git`
- `.gitignore` protects `google_creds.json` and `.env`.
