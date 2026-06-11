import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.mark.django_db
def test_register_creates_user(client):
    resp = client.post(
        "/api/auth/register",
        {"username": "alice", "email": "alice@example.com", "password": "supersecret1"},
        format="json",
    )
    assert resp.status_code == 201
    assert User.objects.filter(username="alice").exists()


@pytest.mark.django_db
def test_login_returns_token_pair(client):
    User.objects.create_user(username="bob", password="supersecret1")
    resp = client.post(
        "/api/auth/login",
        {"username": "bob", "password": "supersecret1"},
        format="json",
    )
    assert resp.status_code == 200
    assert "access" in resp.data and "refresh" in resp.data
    assert resp.data["user"]["username"] == "bob"


@pytest.mark.django_db
def test_me_requires_auth(client):
    assert client.get("/api/users/me").status_code == 401
