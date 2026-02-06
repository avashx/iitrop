"""
Lightweight campus chatbot using keyword matching + intent detection.
No external API dependency — runs entirely offline.
"""

import re
import random
from datetime import datetime


# intent -> patterns mapping
INTENTS = {
    "greeting": [
        r"\b(hi|hello|hey|sup|yo|howdy|greetings)\b",
    ],
    "mess_menu": [
        r"\b(mess|menu|food|breakfast|lunch|dinner|snacks|meal|eat|canteen|khana)\b",
    ],
    "timetable": [
        r"\b(timetable|schedule|class|lecture|period|slot|time.?table)\b",
    ],
    "lost_found": [
        r"\b(lost|found|missing|misplaced|left behind|forgotten)\b",
    ],
    "marketplace": [
        r"\b(buy|sell|market|price|textbook|cycle|laptop|second.?hand)\b",
    ],
    "cab_share": [
        r"\b(cab|taxi|ride|travel|pool|sharing|chandigarh|delhi|airport|bus)\b",
    ],
    "explorer": [
        r"\b(restaurant|cafe|place|nearby|ropar|rupnagar|eat out|hangout|explore)\b",
    ],
    "academic": [
        r"\b(assignment|grade|marks|gpa|cgpa|exam|quiz|submission|deadline)\b",
    ],
    "help": [
        r"\b(help|how|what can you|features|guide|tutorial|assist)\b",
    ],
    "goodbye": [
        r"\b(bye|goodbye|see you|later|cya|take care)\b",
    ],
}

RESPONSES = {
    "greeting": [
        "Hey there! 👋 I'm NexBot, your campus assistant. What can I help you with?",
        "Hi! Need help navigating campus life? Ask me anything about mess menus, classes, rides, and more.",
        "Hello! I'm here to make your campus life easier. What's up?",
    ],
    "mess_menu": [
        "🍽️ Head to the **Mess Menu** section to see today's meals, rate the food, and check nutritional info. You can also see what's trending!",
        "Hungry? Check out the Daily Pulse → Mess Menu for today's lineup. You can filter by dietary preferences too.",
        "The mess menu is updated daily. Go to Daily Pulse to see breakfast, lunch, snacks, and dinner options.",
    ],
    "timetable": [
        "📅 Your timetable is in the **Academic Cockpit**. You can add courses, check for cancellations, and find free slots.",
        "Check Academic Cockpit → Timetable for your personalized schedule. It also shows room changes and cancellations in real-time!",
    ],
    "lost_found": [
        "🔍 Lost something? Go to **Student Exchange → Lost & Found** and file a report. We'll match it against found items automatically.",
        "If you found an item, post it in Lost & Found with a photo. The system tries to match it with reported lost items.",
    ],
    "marketplace": [
        "🛒 The **Marketplace** lets you buy and sell textbooks, electronics, cycles, and more. Check Student Exchange → Buy/Sell.",
        "Looking to sell something? Post it in the Marketplace with photos and a price. Other students can browse and contact you directly.",
    ],
    "cab_share": [
        "🚕 Need a ride? Go to **Student Exchange → Cab Share** to find or create trips. Split costs and travel together!",
        "Planning a trip to Chandigarh or Delhi? Check Cab Share to find co-passengers and save on travel costs.",
    ],
    "explorer": [
        "📍 Explore nearby places in the **Explorer's Guide**! Find restaurants, cafes, and hidden gems around Ropar with ratings and reviews.",
        "Looking for a good place to eat? The Explorer section has curated spots with student reviews and vibe tags.",
    ],
    "academic": [
        "📚 Check the **Academic Cockpit** for assignments, grades, and GPA tracking. Your LMS section has everything from submissions to marks.",
        "Deadlines piling up? The Academic Cockpit shows all your assignments with due dates. You can also track your GPA over time.",
    ],
    "help": [
        "I can help you with:\n• 🍽️ Mess menus & ratings\n• 📅 Timetable & class updates\n• 🔍 Lost & Found\n• 🛒 Buy/Sell marketplace\n• 🚕 Cab sharing\n• 📍 Nearby places\n• 📚 Assignments & grades\n• 📧 Mail summaries\n\nJust ask me about any of these!",
        "Here's what I can do:\n- Tell you about today's mess menu\n- Guide you to the right section\n- Help you understand app features\n- Answer campus-related questions\n\nTry asking something specific!",
    ],
    "goodbye": [
        "See you around! 👋 Don't forget to check your notifications.",
        "Bye! Good luck with everything. I'm always here if you need help.",
        "Take care! 🎓",
    ],
    "fallback": [
        "I'm not sure I understand. Could you rephrase that? Or type **help** to see what I can do.",
        "Hmm, I didn't quite get that. Try asking about mess menus, timetable, cab sharing, or type **help**.",
        "Sorry, I'm still learning! For now, try asking about specific campus features like marketplace, lost & found, or classes.",
    ],
}


def _detect_intent(message: str) -> str:
    msg = message.lower().strip()
    for intent, patterns in INTENTS.items():
        for pat in patterns:
            if re.search(pat, msg, re.IGNORECASE):
                return intent
    return "fallback"


def get_bot_response(message: str) -> dict:
    """
    Takes user message, returns a dict with:
      - reply (str)
      - intent (str)
      - timestamp (str)
    """
    intent = _detect_intent(message)
    reply = random.choice(RESPONSES.get(intent, RESPONSES["fallback"]))

    return {
        "reply": reply,
        "intent": intent,
        "timestamp": datetime.utcnow().isoformat(),
    }
