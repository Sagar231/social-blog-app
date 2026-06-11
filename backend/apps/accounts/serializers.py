from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserMiniSerializer(serializers.ModelSerializer):
    """Compact author representation embedded in posts/comments."""

    class Meta:
        model = User
        fields = ("id", "username", "avatar", "bio")
        read_only_fields = fields


class UserSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "bio",
            "avatar",
            "banner",
            "follower_count",
            "following_count",
            "is_following",
            "created_at",
        )
        read_only_fields = (
            "id",
            "follower_count",
            "following_count",
            "is_following",
            "created_at",
        )

    def get_is_following(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.followers.filter(follower=request.user).exists()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds minimal user data to the login response."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserMiniSerializer(self.user).data
        return data
