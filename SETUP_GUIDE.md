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
6.  Download the JSON file and rename it to `google_creds.json`. Place it in the `translation_bot/` folder.

## 3. Local Setup
1.  Create a `.env` file in the `translation_bot/` folder:
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

## 4. Push to GitHub
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

## 5. Railway Deployment
1.  Create a new project on Railway.
2.  Connect your GitHub repository.
3.  Add the following **Variables** in the Railway dashboard:
    *   `TELEGRAM_TOKEN`: Your bot token.
    *   `GOOGLE_APPLICATION_CREDENTIALS_JSON`: Paste the entire content of your `google_creds.json` file here.
4.  The `Procfile` and `runtime.txt` are already included, so Railway will automatically detect and run the bot.
