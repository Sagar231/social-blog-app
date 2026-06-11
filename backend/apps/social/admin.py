from django.contrib import admin

from .models import Bookmark, Follow, Like

admin.site.register(Follow)
admin.site.register(Like)
admin.site.register(Bookmark)
