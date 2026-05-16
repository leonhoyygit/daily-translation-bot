# Translation Bot Setup Guide

## 1. Telegram Setup (BotFather)
1.  Open Telegram and search for `@BotFather`.
2.  Use `/newbot` to create your bot and get the **API Token**.
3.  **IMPORTANT for Group Chats:**
    *   Send `/setprivacy` to `@BotFather`.
    *   Select your bot.
    *   Select **Disable**. This allows the bot to read all messages in a group so it can translate them automatically.
4.  Add the bot to your Telegram group and make it an Admin (optional but recommended for better visibility).

## 2. Google Cloud Setup
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project or select an existing one.
3.  Enable the **Cloud Translation API**.
4.  Go to **IAM & Admin > Service Accounts**.
5.  Create a Service Account, then go to the **Keys** tab and **Add Key > Create new key (JSON)**.
6.  Download the JSON file and rename it to `google_creds.json`. Place it in the `GeminiProject/Translation_Bot/` folder.
7.  **Google Sheets Sync:**
    *   The bot automatically creates a spreadsheet named `Baby_Tracker_Data`.
    *   To allow the bot to write data, you **must** share your spreadsheet with the service account email found in your `google_creds.json` (or use the `/setup` command in the bot to get the email).

## 3. Local Setup
1.  Create a `.env` file in the `GeminiProject/Translation_Bot/` folder:
    ```env
    TELEGRAM_TOKEN=your_telegram_token_here
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the bot:
    ```bash
    python bot.py
    ```

## 4. Quota & Usage Tracking
*   **Monthly Limit:** The bot tracks usage against Google's 500,000 character/month free tier.
*   **Check Quota:** Type `/quota` in Telegram to see your current monthly usage.
*   **Daily Log:** The bot also shows the character count for each individual translation at the bottom of the message.

## 5. Push to GitHub
1.  Create a new repository on [GitHub](https://github.com/new).
2.  Initialize your local repository:
    ```bash
    git init
    git add .
    git commit -m "Initial commit: Tri-Lingual Translation Bot"
    ```
3.  Link to your GitHub repository and push:
    ```bash
    git remote add origin https://github.com/your-username/your-repo-name.git
    git branch -M main
    git push -u origin main
    ```
    *(Note: Your `.env` and `google_creds.json` are excluded via `.gitignore` for security.)*

## 6. Railway Deployment
1.  Create a new project on Railway.
2.  Connect your GitHub repository.
3.  Add the following **Variables** in the Railway dashboard:
    *   `TELEGRAM_TOKEN`: Your bot token.
    *   `GOOGLE_APPLICATION_CREDENTIALS_JSON`: Paste the entire content of your `google_creds.json` file here.
4.  The `Procfile` and `runtime.txt` are already included, so Railway will automatically detect and run the bot.

---

## ⚠️ IMPORTANT REMARKS & REMINDERS

1. **No Concurrent Running:** NEVER run the bot locally on your Mac (via terminal) while it is also running on Railway. This causes a **Conflict Error (409)** and the bot will stop working. Always stop the local bot before deploying to Railway.
2. **Privacy Mode:** In **@BotFather**, set `/setprivacy` to **Disabled**. This is mandatory for the bot to see and translate group messages without being mentioned.
3. **Reply Context:** The bot always **replies** to the original message it is translating. This keeps the conversation clear in groups.
4. **Media Support:** The bot is built for **text only**. It will ignore photos, stickers, and videos.
5. **Separate Projects:** Use a dedicated Google Cloud project for this bot to avoid mixing quotas with other applications.
