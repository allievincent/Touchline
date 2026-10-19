from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (registers the tables)
from app.config import FRONTEND_URLS
from app.database import Base, engine, SessionLocal
from app.routers import auth, users, sessions, bookings, logs
from app.seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    # create the tables if they don't exist yet, then add the starter data
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(
    title="Touchline API",
    description="Book soccer training sessions. Coaches post sessions, players sign up.",
    version="1.0.0",
    lifespan=lifespan,
)

# lets the react app (different port / domain) call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(bookings.router)
app.include_router(logs.router)


@app.get("/", tags=["Health"])
def root():
    return {"message": "Touchline API is running. Go to /docs to try it out."}
