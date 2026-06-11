import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.mark.django_db
def test_follow_toggle_updates_counts():
    a = User.objects.create_user("a", password="x12345678")
    b = User.objects.create_user("b", password="x12345678")
    client = APIClient()
    client.force_authenticate(user=a)

    r1 = client.post("/api/users/b/follow")
    assert r1.data["following"] is True
    assert r1.data["follower_count"] == 1

    r2 = client.post("/api/users/b/follow")
    assert r2.data["following"] is False
    assert r2.data["follower_count"] == 0


@pytest.mark.django_db
def test_cannot_follow_self():
    a = User.objects.create_user("a", password="x12345678")
    client = APIClient()
    client.force_authenticate(user=a)
    assert client.post("/api/users/a/follow").status_code == 400
