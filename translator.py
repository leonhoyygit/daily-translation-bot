import os
import json
from google.cloud import translate_v2 as translate
from dotenv import load_dotenv

load_dotenv()

# ── Setup ─────────────────────────────────────────────────────────────────────

# Credentials can be loaded from a file or from an environment variable (for Railway)
GOOGLE_CREDS_PATH = "google_creds.json"

if os.path.exists(GOOGLE_CREDS_PATH):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_CREDS_PATH
elif "GOOGLE_APPLICATION_CREDENTIALS_JSON" in os.environ:
    # On Railway, we can store the JSON content in an env var
    with open(GOOGLE_CREDS_PATH, "w") as f:
        f.write(os.environ["GOOGLE_APPLICATION_CREDENTIALS_JSON"])
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_CREDS_PATH

translate_client = None

def get_translate_client():
    global translate_client
    if translate_client is None:
        translate_client = translate.Client()
    return translate_client

def translate_text(text: str, target_lang: str) -> str:
    """Helper to translate a single string to a target language."""
    client = get_translate_client()
    result = client.translate(text, target_language=target_lang)
    return result["translatedText"]

def route_translation(text: str) -> dict:
    """
    Main logic: Detect language and route translations.
    Returns a dict with translations or None if language not supported.
    """
    client = get_translate_client()
    
    # 1. Detect language
    detection = client.detect_language(text)
    source_lang = detection["language"]
    
    # 2. Routing logic
    # Languages: 'id' (Indonesian), 'en' (English), 'zh' or 'zh-CN' (Chinese)
    
    # Normalize Chinese code
    if source_lang.startswith("zh"):
        source_lang = "zh"

    results = {
        "source_lang": source_lang,
        "original_text": text,
        "translations": {},
        "chars_used": 0
    }

    total_chars = 0

    if source_lang == "id":
        # ID -> EN -> ZH
        en_text = translate_text(text, "en")
        total_chars += len(text)
        zh_text = translate_text(en_text, "zh")
        total_chars += len(en_text)
        results["translations"] = {"en": en_text, "zh": zh_text}
        
    elif source_lang == "en":
        # EN -> ID & ZH
        id_text = translate_text(text, "id")
        total_chars += len(text)
        zh_text = translate_text(text, "zh")
        total_chars += len(text)
        results["translations"] = {"id": id_text, "zh": zh_text}
        
    elif source_lang == "zh":
        # ZH -> EN -> ID
        en_text = translate_text(text, "en")
        total_chars += len(text)
        id_text = translate_text(en_text, "id")
        total_chars += len(en_text)
        results["translations"] = {"en": en_text, "id": id_text}
        
    else:
        # Not one of our three core languages
        return None

    results["chars_used"] = total_chars
    return results
