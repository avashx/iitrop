"""
Mail summarization engine using extractive + heuristic NLP.
Falls back to a rule-based approach when transformer models aren't available,
so it works even without a GPU or huggingface download.
"""

import re
import json
from typing import Tuple, List


# ---- keyword banks for classification ----
ACADEMIC_KEYWORDS = [
    "exam", "assignment", "quiz", "grade", "marks", "semester", "course",
    "lecture", "lab", "midterm", "endsem", "syllabus", "attendance",
    "project", "submission", "deadline", "credit", "cgpa", "sgpa",
    "professor", "instructor", "tutorial", "viva", "thesis", "research"
]

EVENT_KEYWORDS = [
    "fest", "event", "workshop", "seminar", "hackathon", "competition",
    "cultural", "sports", "club", "registration", "ceremony", "concert",
    "talk", "webinar", "meetup", "celebration", "annual", "inauguration"
]

URGENT_KEYWORDS = [
    "urgent", "immediately", "asap", "emergency", "critical", "important",
    "mandatory", "compulsory", "last date", "final notice", "warning",
    "action required", "respond", "deadline today", "expiring"
]

ADMIN_KEYWORDS = [
    "fee", "hostel", "mess", "library", "scholarship", "stipend",
    "administration", "registrar", "dean", "warden", "maintenance",
    "id card", "document", "certificate", "noc", "leave"
]

# patterns that look like dates
DATE_PATTERNS = [
    r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',
    r'\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{2,4}',
    r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2},?\s+\d{2,4}',
    r'(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s+\d{1,2}\s+\w+',
    r'by\s+\d{1,2}\s+\w+',
    r'before\s+\d{1,2}\s+\w+',
    r'due\s+(?:on|by)?\s*\d{1,2}\s+\w+',
]


def _classify_mail(subject: str, body: str) -> Tuple[str, float]:
    """Categorise an email and assign a priority score (0-1)."""
    combined = (subject + " " + body).lower()

    scores = {
        "academic": 0,
        "event": 0,
        "urgent": 0,
        "administrative": 0,
        "general": 0,
    }

    for kw in ACADEMIC_KEYWORDS:
        if kw in combined:
            scores["academic"] += 1
    for kw in EVENT_KEYWORDS:
        if kw in combined:
            scores["event"] += 1
    for kw in URGENT_KEYWORDS:
        if kw in combined:
            scores["urgent"] += 2  # urgent words carry more weight
    for kw in ADMIN_KEYWORDS:
        if kw in combined:
            scores["administrative"] += 1

    best_cat = max(scores, key=scores.get)
    if scores[best_cat] == 0:
        best_cat = "general"

    # priority: blend of urgency indicators and overall keyword density
    total = sum(scores.values()) or 1
    priority = min(1.0, (scores["urgent"] * 0.4 + total * 0.05))
    priority = round(priority, 2)

    return best_cat, priority


def _extract_deadlines(text: str) -> str:
    """Pull out anything that looks like a date/deadline."""
    found = []
    for pat in DATE_PATTERNS:
        matches = re.findall(pat, text, re.IGNORECASE)
        found.extend(matches)
    return found[0] if found else ""


def _extract_action_items(text: str) -> List[str]:
    """Pull imperative sentences that look like tasks."""
    actions = []
    sentences = re.split(r'[.!?\n]+', text)
    action_verbs = [
        "submit", "register", "attend", "complete", "fill", "report",
        "contact", "visit", "bring", "pay", "upload", "download",
        "sign", "apply", "collect", "note", "ensure", "confirm",
        "prepare", "check", "update", "send", "join", "participate"
    ]
    for sent in sentences:
        stripped = sent.strip()
        if not stripped or len(stripped) < 10:
            continue
        lower = stripped.lower()
        # starts with an action verb or contains "must/should/required"
        starts_action = any(lower.startswith(v) for v in action_verbs)
        has_modal = any(m in lower for m in ["must", "should", "required to", "need to", "have to"])
        if starts_action or has_modal:
            actions.append(stripped[:200])
    return actions[:5]  # cap at 5 action items


def _summarize_text(text: str, max_sentences: int = 2) -> str:
    """
    Extractive summarizer: picks the most 'important' sentences based on
    word-frequency overlap with the whole document, plus a position bias
    (first/last sentences often carry key info).
    """
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if len(s.strip()) > 15]

    if len(sentences) <= max_sentences:
        return " ".join(sentences)

    # word frequency map
    words = re.findall(r'[a-zA-Z]{3,}', text.lower())
    freq = {}
    for w in words:
        freq[w] = freq.get(w, 0) + 1

    # score each sentence
    scored = []
    for idx, sent in enumerate(sentences):
        sent_words = re.findall(r'[a-zA-Z]{3,}', sent.lower())
        if not sent_words:
            scored.append((0, idx, sent))
            continue
        word_score = sum(freq.get(w, 0) for w in sent_words) / len(sent_words)
        # position bias: first and last sentences get a boost
        position_bonus = 0
        if idx == 0:
            position_bonus = 3
        elif idx == len(sentences) - 1:
            position_bonus = 1.5
        elif idx == 1:
            position_bonus = 1.2
        scored.append((word_score + position_bonus, idx, sent))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:max_sentences]
    # reorder by original position so the summary reads naturally
    top.sort(key=lambda x: x[1])

    summary = " ".join(t[2] for t in top)
    return summary


def process_mail(subject: str, body: str) -> dict:
    """
    Main entry point. Takes a raw email subject+body and returns structured data:
      - summary (str)
      - category (str)
      - priority_score (float 0-1)
      - action_items (list[str])
      - deadline (str)
    """
    full_text = f"{subject}. {body}"

    category, priority = _classify_mail(subject, body)
    summary = _summarize_text(full_text)
    actions = _extract_action_items(body)
    deadline = _extract_deadlines(full_text)

    return {
        "summary": summary,
        "category": category,
        "priority_score": priority,
        "action_items": json.dumps(actions),
        "deadline": deadline,
    }
