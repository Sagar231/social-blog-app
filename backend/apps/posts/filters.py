import django_filters

from .models import Post


class PostFilter(django_filters.FilterSet):
    tag = django_filters.CharFilter(field_name="tags__slug", lookup_expr="iexact")
    author = django_filters.CharFilter(
        field_name="author__username", lookup_expr="iexact"
    )

    class Meta:
        model = Post
        fields = ["tag", "author", "status"]
