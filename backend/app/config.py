import os
from dotenv import load_dotenv

load_dotenv()

# no DATABASE_URL = use sqlite on my computer. on render this is the neon url
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./touchline.db"

# neon/heroku style urls start with postgres:// but sqlalchemy wants postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24  # stay logged in for a day

# comma separated list so I can add the vercel url + localhost
FRONTEND_URLS = [u.strip() for u in os.getenv("FRONTEND_URL", "http://localhost:5173").split(",") if u.strip()]
