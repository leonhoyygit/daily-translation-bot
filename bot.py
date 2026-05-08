import os
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
from translator import route_translation
from usage_tracker import log_usage, get_monthly_usage
from dotenv import load_dotenv

load_dotenv()

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN")

LANG_NAMES = {
    "en": "🇬🇧 English",
    "id": "🇮🇩 Indonesian",
    "zh": "🇨🇳 Chinese"
}

# ── Commands ──────────────────────────────────────────────────────────────────
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Hi! I'm your Tri-Lingual Translation Bot.\n\n"
        "Send me any text in English, Indonesian, or Chinese, and I'll translate it for you.\n\n"
        "I work in groups too! Just add me and I'll reply to messages I can translate."
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "I automatically detect and translate:\n"
        "• Indonesian ➡️ English ➡️ Chinese\n"
        "• English ➡️ Indonesian & Chinese\n"
        "• Chinese ➡️ English ➡️ Indonesian\n\n"
        "Commands:\n"
        "/quota - View monthly character usage\n"
        "/help  - Show this message\n\n"
        "I ignore photos and non-text messages."
    )

async def cmd_quota(update: Update, context: ContextTypes.DEFAULT_TYPE):
    usage = get_monthly_usage()
    limit = 500000
    percentage = (usage / limit) * 100
    await update.message.reply_text(
        f"📊 **Monthly Quota Usage**\n\n"
        f"Characters used: {usage:,}\n"
        f"Monthly limit: {limit:,}\n"
        f"Progress: {percentage:.2f}%"
    )

# ── Message Handler ───────────────────────────────────────────────────────────
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # 1. Ignore if no text or if it's a photo/media
    if not update.message or not update.message.text:
        return

    text = update.message.text.strip()
    
    # 2. Skip commands
    if text.startswith("/"):
        return

    try:
        # 3. Perform translation routing
        result = route_translation(text)
        
        if not result:
            # Language not supported or detection failed
            return

        # 4. Log usage
        chars_used = result["chars_used"]
        total_monthly = log_usage(chars_used)

        # 5. Format response
        source_label = LANG_NAMES.get(result["source_lang"], result["source_lang"])
        response = f"🌐 Translation from {source_label}:\n\n"
        
        for lang_code, trans_text in result["translations"].items():
            label = LANG_NAMES.get(lang_code, lang_code)
            response += f"{label}:\n{trans_text}\n\n"

        response += f"───\n📏 Used: {chars_used} chars | Monthly: {total_monthly:,}/500,000"

        # 6. Reply to the message for context
        await update.message.reply_text(response.strip())
        
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        # In a group, we might want to be silent on errors unless it's a private chat
        if update.effective_chat.type == "private":
            await update.message.reply_text("Sorry, I encountered an error during translation.")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    if not TELEGRAM_TOKEN:
        print("Error: TELEGRAM_TOKEN not found in environment variables.")
        return

    app = Application.builder().token(TELEGRAM_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("quota", cmd_quota))
    
    # Handle text messages, excluding commands
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    print("Translation Bot is running...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
