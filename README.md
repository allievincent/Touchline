# Touchline ⚽

A full-stack app for soccer training. Coaches post sessions (goalkeeper training, finishing clinics, pickup games...) and players book a spot. Everyone also gets a personal training log for lifts, practices, conditioning and games, and can share entries with a coach for feedback.

**Live site:** (https://touchline-4wa1arp7b-personal-5c5b.vercel.app)
**API docs:** (https://touchline-api.onrender.com/docs)

| Part | Tech | Hosted on |
|---|---|---|
| Backend | FastAPI, SQLAlchemy, Pydantic | Render |
| Database | PostgreSQL (SQLite locally) | Neon |
| Frontend | React, React Router, Tailwind | Vercel |

## Features
- Sign up / log in as a **player** or **coach** (passwords are hashed, login uses JWT tokens)
- **Protected routes**: you have to be logged in to see sessions, and only coaches can create/edit sessions
- **Full CRUD** on every table:
  - **Users**: register, view, update profile, delete account
  - **Training sessions** (coaches): create, list with filters, view, edit, delete
  - **Bookings** (users ↔ sessions): book a spot, see my schedule, edit my note, cancel
  - **Training log** (+ exercises): log a workout with sets/reps/weight, effort 1-10 and notes, edit it, delete it, filter by type
- Rules: sessions have a capacity, you can't double-book, can't book a full or past session, can't book your own session
- Coaches see the roster of who's signed up
- Training log entries are **private** unless you share one with a coach. Coaches get a Player Logs page where they can leave feedback, and the player sees it on their entry
- Last-7-days view on the log with workouts, minutes and average effort
- Light / dark mode
- Starter data so it isn't empty the first time (see `backend/app/seed.py`)

**Demo accounts** (password for all: `password123`)
- Player: `player@touchline.app`
- Coach: `coach@touchline.app`

## Project structure
```
touchline/
├── backend/
│   ├── app/
│   │   ├── main.py            # creates the FastAPI app, adds routers + CORS
│   │   ├── config.py          # reads env variables (DATABASE_URL etc.)
│   │   ├── database.py        # SQLAlchemy engine + get_db()
│   │   ├── security.py        # password hashing + JWT tokens
│   │   ├── dependencies.py    # get_current_user, require_coach
│   │   ├── seed.py            # hardcoded starter data
│   │   ├── models/            # SQLAlchemy tables
│   │   │   ├── user.py
│   │   │   ├── training_session.py
│   │   │   ├── booking.py
│   │   │   └── workout_log.py   # WorkoutLog + Exercise
│   │   ├── schemas/           # Pydantic models (what the API accepts/returns)
│   │   ├── crud/              # one object per table that does the DB work
│   │   │   ├── user_crud.py
│   │   │   ├── session_crud.py
│   │   │   ├── booking_crud.py
│   │   │   └── workout_log_crud.py
│   │   └── routers/           # the API endpoints, grouped by resource
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── sessions.py
│   │       ├── bookings.py
│   │       └── logs.py
│   ├── tests/test_api.py      # pytest tests for the API
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── assets/            # logo + field illustration
│       ├── components/        # reusable UI (Button, Card, FormField, Header, SessionCard, ProtectedRoute...)
│       ├── context/           # AuthContext (who's logged in)
│       ├── hooks/             # useTheme (dark mode)
│       ├── pages/             # one folder per page
│       ├── services/          # api.js + userService, sessionService, bookingService, logService
│       ├── utils/
│       └── App.jsx            # all the routes
└── render.yaml                # Render setup for the backend
```

**How a request flows:** page → service (`fetch`) → router (endpoint) → crud object → model/database, and the response comes back through a Pydantic schema.

## API endpoints
| Method | Endpoint | What it does | Who |
|---|---|---|---|
| POST | `/auth/register` | create account, returns token | anyone |
| POST | `/auth/login` | log in, returns token | anyone |
| GET | `/auth/me` | current user | logged in |
| GET | `/users/` · `/users/{id}` | list / get users | logged in |
| PUT | `/users/me` | update my profile | logged in |
| DELETE | `/users/me` | delete my account | logged in |
| GET | `/sessions/` | list upcoming sessions (`?focus=&level=&coach_id=`) | anyone |
| GET | `/sessions/{id}` | one session | anyone |
| POST | `/sessions/` | create session | coach |
| PUT | `/sessions/{id}` | edit session | coach who owns it |
| DELETE | `/sessions/{id}` | delete session | coach who owns it |
| GET | `/sessions/{id}/roster` | who booked | coach who owns it |
| GET | `/bookings/me` | my bookings | logged in |
| POST | `/bookings/` | book a session | logged in |
| PUT | `/bookings/{id}` | edit my note | logged in |
| DELETE | `/bookings/{id}` | cancel | logged in |
| GET | `/logs/me` | my training log (`?kind=Lift`) | logged in |
| POST | `/logs/` | new log entry (with exercises) | logged in |
| GET | `/logs/{id}` | one entry | owner or the coach it's shared with |
| PUT | `/logs/{id}` | edit entry / change who it's shared with | owner |
| DELETE | `/logs/{id}` | delete entry | owner |
| GET | `/logs/shared` | entries players shared with me | coach |
| PUT | `/logs/{id}/feedback` | leave feedback | coach it's shared with |

You can try all of these at **http://localhost:8000/docs** (click **Authorize** and log in with a demo account first).

---

## Run it on your computer

You need **Python 3.11+** and **Node.js 18+**. Open the `touchline` folder in VS Code and use two terminals (the **+** button in the terminal panel).

### Terminal 1: backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The API runs at http://localhost:8000. With no `DATABASE_URL` set it makes a local SQLite file, `touchline.db`, and fills it with the starter data.

### Terminal 2: frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

### Run the tests
```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

---

## Deploying

Do it in this order: **Neon → Render → Vercel**. Push the whole `touchline` folder to a GitHub repo first.

### 1. Database on Neon
1. Sign up at **neon.tech** and create a project.
2. On the dashboard, copy the **connection string**. It looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`.

### 2. Backend on Render
1. Sign up at **render.com** with GitHub, then click **New → Web Service** and pick your repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance type:** Free
3. Under **Environment Variables**, add:
   - `DATABASE_URL`: the Neon connection string
   - `SECRET_KEY`: any long random string
   - `PYTHON_VERSION`: `3.12.6`
4. Click **Create Web Service**. When it's live, open `https://YOUR-API.onrender.com/docs` to check it works. The tables and starter data get created in Neon automatically.

(Or use **New → Blueprint**: Render reads `render.yaml` and fills most of this in.)

> The free Render plan goes to sleep after 15 minutes without traffic, so the first request after that takes about 30–50 seconds.

### 3. Frontend on Vercel
1. Sign in at **vercel.com** with GitHub, then click **Add New → Project** and import the repo.
2. Set **Root Directory** to `frontend`. Vercel detects Vite.
3. Under **Environment Variables**, add `VITE_API_URL` = your Render URL (no slash at the end).
4. Click **Deploy**.
5. Back in Render, add `FRONTEND_URL` = your Vercel URL, so the backend accepts requests from it. Any `*.vercel.app` URL is already allowed, but add it for a custom domain.
