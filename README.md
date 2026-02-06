# Project Nexus — IIT Ropar Campus Super-App

A full-stack campus application built for the AI Fusion Hackathon 2026 at IIT Ropar. Nexus brings together everything a student needs — from daily mess menus and mail management to marketplace trading and cab sharing — all wrapped in a clean, modern interface with built-in AI/ML capabilities.

---

## What it does

| Module                              | Description                                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Daily Pulse – Mess Menu**         | View the weekly mess menu, see nutritional info & allergens, and rate meals on a 1-5 scale                           |
| **Daily Pulse – Mail Summarizer**   | Paste any campus email and the NLP engine extracts a summary, category, priority score, action items, and deadlines  |
| **Student Exchange – Marketplace**  | Buy & sell textbooks, electronics, cycles, furniture among students with search & category filters                   |
| **Student Exchange – Lost & Found** | Report lost or found items with location, description, and contact info; mark as resolved                            |
| **Student Exchange – Cab Sharing**  | Post upcoming rides, share seats, and join/leave trips with seat management                                          |
| **Explorer's Guide**                | Discover restaurants, cafés, and hangouts near campus; get AI-powered recommendations based on your vibe preferences |
| **Academic Cockpit – Timetable**    | Build your personal weekly timetable with course codes, rooms, and instructors                                       |
| **Academic Cockpit – LMS**          | View assignments, due dates, and marks (faculty can create & grade)                                                  |
| **Campus Chatbot**                  | An intent-based chatbot that answers questions about mess, timetable, clubs, lost items, and more                    |

---

## Tech Stack

### Backend

- **FastAPI** — async Python API framework
- **SQLAlchemy 2.0** — async ORM with SQLite (easily swappable to PostgreSQL)
- **JWT Authentication** — secure token-based auth with bcrypt password hashing
- **Custom NLP pipeline** — extractive text summarization, keyword-based mail classification, deadline extraction via regex
- **Content-based recommender** — Jaccard similarity on vibe tags + weighted rating scores
- **Rule-based chatbot** — intent detection across 10 campus-related categories

### Frontend

- **React 18** with Vite for fast HMR
- **Tailwind CSS** — utility-first styling
- **React Router v6** — client-side navigation
- **Axios** — API communication with JWT interceptors
- **react-hot-toast** — notification toasts
- **react-icons** — icon library
- **date-fns** — date formatting

### DevOps

- **Docker** + **docker-compose** for containerised deployment
- **Nginx** as reverse proxy for the production frontend

---

## Project Structure

```
iitrop/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── config.py          # Environment settings
│   │   ├── database.py        # Async SQLAlchemy setup
│   │   ├── models/
│   │   │   └── models.py      # All database models
│   │   ├── routers/           # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── mess.py
│   │   │   ├── mail.py
│   │   │   ├── marketplace.py
│   │   │   ├── lost_found.py
│   │   │   ├── cab.py
│   │   │   ├── academic.py
│   │   │   ├── explorer.py
│   │   │   └── chat.py
│   │   ├── services/          # AI/ML logic
│   │   │   ├── mail_ai.py
│   │   │   ├── chatbot.py
│   │   │   └── recommender.py
│   │   └── utils/
│   │       └── auth.py        # JWT helpers
│   ├── seed.py                # Sample data loader
│   ├── requirements.txt
│   ├── .env
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Layout.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── MessMenu.jsx
│   │       ├── MailHub.jsx
│   │       ├── Marketplace.jsx
│   │       ├── LostFound.jsx
│   │       ├── CabShare.jsx
│   │       ├── Explorer.jsx
│   │       ├── Academics.jsx
│   │       └── ChatBot.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### 1. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with demo data
python seed.py

# Start the API server
uvicorn app.main:app --reload
```

The API will be live at **http://localhost:8000** and interactive docs at **http://localhost:8000/docs**.

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

### 3. Demo Login

Use these credentials to explore the app right away:

| Email                   | Password    |
| ----------------------- | ----------- |
| arjun@iitrpr.ac.in      | password123 |
| priya@iitrpr.ac.in      | password123 |
| prof.verma@iitrpr.ac.in | password123 |

---

## Docker Deployment

```bash
docker-compose up --build
```

Frontend at **http://localhost:3000**, API at **http://localhost:8000**.

---

## AI/ML Features — How They Work

### Mail Summarizer

The NLP pipeline uses extractive summarization — it scores sentences by word frequency and position bias (earlier sentences get more weight), then picks the top-scoring ones. Category detection uses keyword banks for academic, event, club, and urgent mails. Deadlines are extracted via date-pattern regex. Action items are identified by imperative verb patterns ("register", "submit", "contact", etc.).

### Campus Chatbot

Uses regex-based intent detection across 10 categories (greeting, mess, timetable, lost & found, marketplace, cab sharing, explorer, academic, help, goodbye). Each intent maps to a pool of natural-sounding responses. The system picks a random response from the matched intent to keep conversations varied.

### Place Recommender

Content-based filtering: computes Jaccard similarity between user's vibe preferences and each place's vibe tags, then combines with a weighted score (40% tag match + 40% average rating + 20% review popularity). Returns the top 5 matches sorted by relevance.

---

## Team

Built for the AI Fusion Hackathon 2026 at IIT Ropar.

---

## License

MIT
