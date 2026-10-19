from tests.conftest import login


def test_seed_sessions_show_up(client):
    res = client.get("/sessions/")
    assert res.status_code == 200
    assert len(res.json()) == 7


def test_register_and_me(client):
    res = client.post("/auth/register", json={"name": "New Kid", "email": "new@test.com", "password": "secret123"})
    assert res.status_code == 201
    headers = {"Authorization": f"Bearer {res.json()['access_token']}"}
    assert client.get("/auth/me", headers=headers).json()["email"] == "new@test.com"
    # same email twice is blocked
    assert client.post("/auth/register", json={"name": "x", "email": "new@test.com", "password": "secret123"}).status_code == 400


def test_wrong_password(client):
    assert client.post("/auth/login", data={"username": "player@touchline.app", "password": "nope"}).status_code == 401


def test_protected_routes_need_login(client):
    assert client.get("/bookings/me").status_code == 401


def test_session_crud_as_coach(client, coach):
    body = {"title": "Test Session", "focus": "Passing", "level": "Beginner", "location": "Field",
            "start_time": "2099-01-01T10:00:00", "duration_minutes": 60, "capacity": 2}
    created = client.post("/sessions/", json=body, headers=coach)
    assert created.status_code == 201
    sid = created.json()["id"]

    updated = client.put(f"/sessions/{sid}", json={"title": "Renamed"}, headers=coach)
    assert updated.json()["title"] == "Renamed"

    assert client.delete(f"/sessions/{sid}", headers=coach).status_code == 204
    assert client.get(f"/sessions/{sid}").status_code == 404


def test_players_cant_make_sessions(client, player):
    body = {"title": "x", "focus": "Passing", "level": "Beginner", "location": "x", "start_time": "2099-01-01T10:00:00"}
    assert client.post("/sessions/", json=body, headers=player).status_code == 403


def test_booking_flow(client, coach, player):
    body = {"title": "Tiny Session", "focus": "Fitness", "level": "Beginner", "location": "Track",
            "start_time": "2099-01-01T10:00:00", "capacity": 1}
    sid = client.post("/sessions/", json=body, headers=coach).json()["id"]

    booked = client.post("/bookings/", json={"session_id": sid, "note": "hi"}, headers=player)
    assert booked.status_code == 201
    bid = booked.json()["id"]
    assert booked.json()["session"]["spots_left"] == 0

    # can't double book, and session is full for someone else
    assert client.post("/bookings/", json={"session_id": sid}, headers=player).status_code == 400
    other = login(client, "maya@touchline.app")
    assert client.post("/bookings/", json={"session_id": sid}, headers=other).json()["detail"] == "Sorry, this session is full"

    # coach sees the roster, player can't
    assert len(client.get(f"/sessions/{sid}/roster", headers=coach).json()) == 1
    assert client.get(f"/sessions/{sid}/roster", headers=player).status_code == 403

    # update note, then cancel
    assert client.put(f"/bookings/{bid}", json={"note": "changed"}, headers=player).json()["note"] == "changed"
    assert client.delete(f"/bookings/{bid}", headers=player).status_code == 204
    assert client.get(f"/sessions/{sid}").json()["spots_left"] == 1


def test_update_and_delete_account(client):
    res = client.post("/auth/register", json={"name": "Temp", "email": "temp@test.com", "password": "secret123"})
    headers = {"Authorization": f"Bearer {res.json()['access_token']}"}
    assert client.put("/users/me", json={"position": "Goalkeeper"}, headers=headers).json()["position"] == "Goalkeeper"
    assert client.delete("/users/me", headers=headers).status_code == 204
    assert client.get("/auth/me", headers=headers).status_code == 401


def test_training_log(client, coach, player):
    # seed gives the demo player 6 entries, 2 shared with the coach
    assert len(client.get("/logs/me", headers=player).json()) == 6
    assert len(client.get("/logs/shared", headers=coach).json()) == 2
    assert client.get("/logs/shared", headers=player).status_code == 403

    body = {"date": "2026-10-01", "kind": "Lift", "title": "Test lift", "effort": 8,
            "exercises": [{"name": "Squat", "sets": 3, "reps": 5, "weight": 155}]}
    log = client.post("/logs/", json=body, headers=player).json()
    assert log["coach"] is None and log["exercises"][0]["weight"] == 155

    # private: another user can't see it, the coach can't either until it's shared
    other = login(client, "maya@touchline.app")
    assert client.get(f"/logs/{log['id']}", headers=other).status_code == 404
    assert client.get(f"/logs/{log['id']}", headers=coach).status_code == 404

    coach_id = client.get("/auth/me", headers=coach).json()["id"]
    updated = client.put(f"/logs/{log['id']}", json={"coach_id": coach_id, "exercises": []}, headers=player).json()
    assert updated["coach"]["id"] == coach_id and updated["exercises"] == []
    assert client.get(f"/logs/{log['id']}", headers=coach).status_code == 200

    # can't share with a player
    maya_id = client.get("/auth/me", headers=other).json()["id"]
    assert client.put(f"/logs/{log['id']}", json={"coach_id": maya_id}, headers=player).status_code == 400

    fb = client.put(f"/logs/{log['id']}/feedback", json={"feedback": "Good depth"}, headers=coach)
    assert fb.json()["coach_feedback"] == "Good depth"
    assert client.put(f"/logs/{log['id']}/feedback", json={"feedback": "x"}, headers=player).status_code == 403

    assert client.delete(f"/logs/{log['id']}", headers=player).status_code == 204
