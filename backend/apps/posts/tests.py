import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from .models import Post

User = get_user_model()


@pytest.fixture
def auth_client():
    user = User.objects.create_user(username="writer", password="supersecret1")
    client = APIClient()
    client.force_authenticate(user=user)
    return client, user


@pytest.mark.django_db
def test_create_post(auth_client):
    client, _ = auth_client
    resp = client.post(
        "/api/posts",
        {"title": "Hello World", "body": "# hi", "tag_names": ["python", "web"]},
        format="json",
    )
    assert resp.status_code == 201
    assert resp.data["slug"]
    assert {t["name"] for t in resp.data["tags"]} == {"python", "web"}


@pytest.mark.django_db
def test_like_toggles(auth_client):
    client, _ = auth_client
    post = Post.objects.create(
        author=User.objects.create_user("a", password="x12345678"),
        title="T",
        body="b",
    )
    r1 = client.post(f"/api/posts/{post.slug}/like")
    assert r1.data == {"liked": True, "like_count": 1}
    r2 = client.post(f"/api/posts/{post.slug}/like")
    assert r2.data == {"liked": False, "like_count": 0}


@pytest.mark.django_db
def test_drafts_hidden_from_others():
    author = User.objects.create_user("author", password="x12345678")
    Post.objects.create(author=author, title="Secret", body="b", status="draft")
    other = User.objects.create_user("other", password="x12345678")
    client = APIClient()
    client.force_authenticate(user=other)
    resp = client.get("/api/posts")
    assert resp.data["count"] == 0
