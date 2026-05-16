# 🌐 Tri-Lingual Translation Bot

A specialized Telegram bot designed for seamless tri-lingual communication. It automatically detects and translates messages between **Indonesian**, **English**, and **Chinese** in both private chats and group environments.

## ✨ Key Features
- **Automatic Multi-Route Translation:**
  - 🇮🇩 **Indonesian** ➡️ 🇬🇧 English ➡️ 🇨🇳 Chinese
  - 🇬🇧 **English** ➡️ 🇮🇩 Indonesian & 🇨🇳 Chinese
  - 🇨🇳 **Chinese** ➡️ 🇬🇧 English ➡️ 🇮🇩 Indonesian
- **Group Support:** Translates messages in real-time within groups (requires Privacy Mode disabled).
- **Reply Context:** Replies directly to the original message to maintain conversation flow.
- **Quota Tracking:** Monitors character usage against Google's free tier (500,000 chars/month).
- **Usage Command:** `/quota` to check real-time monthly character consumption.
- **👶 Baby Tracker Mini-App:**
  - **Daily Overview:** Premium banners for today's Meal Plan and Goal progress.
  - **Smart Logging:** Quick-log buttons for Sleep, Feeding, Diapers, and Care.
  - **Growth Metrics:** Interactive charts for Weight, Height, and Head Circumference.
  - **Google Sheets Sync:** Automatic backup of all data to a shared spreadsheet.
  - **Birthday Celebration:** A special "Birthday Mode" triggers every May 16 for Andrea!

## 🛠️ Tech Stack
- **Framework:** `python-telegram-bot` (v22+)
- **Translation Engine:** Google Cloud Translation API V2
- **Deployment:** Optimized for Railway (Procfile included)

## 🚀 Quick Start
For detailed setup instructions including Google Cloud configuration and Railway deployment, please refer to the **[SETUP_GUIDE.md](SETUP_GUIDE.md)**.

### Basic Setup Summary:
1.  **Telegram:** Create a bot via `@BotFather` and disable **Privacy Mode**.
2.  **Google Cloud:** Enable Translation API and save service account keys as `google_creds.json`.
3.  **Environment:** Set `TELEGRAM_TOKEN` in a `.env` file.
4.  **Run:** `python bot.py`

## ⚠️ Important Notes
- **Privacy Mode:** Must be **Disabled** in BotFather for automatic group translation.
- **Media:** The bot currently only supports text messages; photos and other media are ignored.
- **Concurrent Running:** Avoid running the bot locally and on a server (e.g., Railway) simultaneously to prevent 409 Conflict errors.
