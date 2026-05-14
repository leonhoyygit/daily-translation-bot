import os
import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
from translator import route_translation
from usage_tracker import log_usage, get_monthly_usage
import sheets_db
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
WEBAPP_URL = os.environ.get("WEBAPP_URL", "http://localhost:8000") # Default for local dev

LANG_NAMES = {
    "en": "🇬🇧 English",
    "id": "🇮🇩 Indonesian",
    "zh": "🇨🇳 Chinese"
}

# ── Telegram Bot Logic ────────────────────────────────────────────────────────

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("👶 Baby Tracker Mini-App", web_app=WebAppInfo(url=WEBAPP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "Hi! I'm your Tri-Lingual Translation Bot.\n\n"
        "Send me any text in English, Indonesian, or Chinese, and I'll translate it for you.\n\n"
        "Use the button below to open the Baby Tracker Mini-App!",
        reply_markup=reply_markup
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

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message or not update.message.text:
        return
    text = update.message.text.strip()
    if text.startswith("/"):
        return

    try:
        result = route_translation(text)
        if not result:
            return

        chars_used = result["chars_used"]
        total_monthly = log_usage(chars_used)

        source_label = LANG_NAMES.get(result["source_lang"], result["source_lang"])
        response = f"🌐 Translation from {source_label}:\n\n"
        
        for lang_code, trans_text in result["translations"].items():
            label = LANG_NAMES.get(lang_code, lang_code)
            response += f"{label}:\n{trans_text}\n\n"

        response += f"───\n📏 Used: {chars_used} chars | Monthly: {total_monthly:,}/500,000"
        await update.message.reply_text(response.strip())
        
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        if update.effective_chat.type == "private":
            await update.message.reply_text("Sorry, I encountered an error during translation.")

# ── FastAPI Setup ─────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start bot
    bot_app = Application.builder().token(TELEGRAM_TOKEN).build()
    bot_app.add_handler(CommandHandler("start", start))
    bot_app.add_handler(CommandHandler("help", help_command))
    bot_app.add_handler(CommandHandler("quota", cmd_quota))
    bot_app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    await bot_app.initialize()
    await bot_app.start()
    await bot_app.updater.start_polling()
    
    app.state.bot_app = bot_app
    logger.info("Bot started...")
    
    yield
    
    # Stop bot
    await bot_app.updater.stop()
    await bot_app.stop()
    await bot_app.shutdown()
    logger.info("Bot stopped.")

app = FastAPI(lifespan=lifespan)
templates = Jinja2Templates(directory="templates")

# Static files for the Mini-App
if not os.path.exists("static"):
    os.makedirs("static")
if not os.path.exists("templates"):
    os.makedirs("templates")

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

# ── API Endpoints for Mini-App ────────────────────────────────────────────────

@app.post("/api/daily")
async def add_daily(record: dict):
    success = sheets_db.log_daily_record(
        record_type=record.get("type"),
        time=record.get("time"),
        detail1=record.get("detail1", ""),
        detail2=record.get("detail2", ""),
        detail3=record.get("detail3", ""),
        remarks=record.get("remarks", ""),
        date_str=record.get("date")
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to log to Google Sheets")
    return {"status": "success"}

@app.get("/api/daily/{date_str}")
async def get_daily(date_str: str):
    records = sheets_db.get_daily_records(date_str)
    return records

@app.post("/api/growth")
async def add_growth(record: dict):
    success = sheets_db.log_growth_metric(
        weight=record.get("weight"),
        height=record.get("height"),
        head=record.get("head"),
        date_str=record.get("date")
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to log to Google Sheets")
    return {"status": "success"}

@app.get("/api/growth")
async def get_growth():
    records = sheets_db.get_growth_metrics()
    return records

@app.get("/api/tasks")
async def get_tasks():
    return sheets_db.get_tasks()

@app.post("/api/tasks")
async def update_task(task: dict):
    success = sheets_db.update_task(task.get("name"), task.get("status"))
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update task")
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
