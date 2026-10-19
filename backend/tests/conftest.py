import os
import tempfile

# use a throwaway sqlite file for tests so we don't touch the real database
_db = os.path.join(tempfile.mkdtemp(), "test.db")
os.environ["DATABASE_URL"] = f"sqlite:///{_db}"

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


def login(client, email, password="password123"):
    res = client.post("/auth/login", data={"username": email, "password": password})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


@pytest.fixture
def coach(client):
    return login(client, "coach@touchline.app")


@pytest.fixture
def player(client):
    return login(client, "player@touchline.app")
