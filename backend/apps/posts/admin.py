from django.contrib import admin

from .models import Comment, Post, Tag


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "status", "like_count", "comment_count", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("title", "body")
    prepopulated_fields = {"slug": ("title",)}


admin.site.register(Tag)
admin.site.register(Comment)
