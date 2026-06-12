"""
Seed the database with realistic demo data: users (with avatars), posts
(with cover photos + inline images), tags, follows, likes, comments, bookmarks.

Usage:
    python manage.py seed            # add demo data (idempotent on usernames)
    python manage.py seed --fresh    # wipe existing demo data first
    python manage.py seed --password mypass123   # set demo-user password

Images use free, key-less services (pravatar.cc, picsum.photos) stored as URLs,
so they render in production without any media hosting.
"""
import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from datetime import timedelta

from apps.posts.models import Comment, Post, Tag
from apps.social.models import Bookmark, Follow, Like

User = get_user_model()

DEMO_PASSWORD = "demopass123"

USERS = [
    ("maya.codes", "Frontend dev obsessed with design systems & micro-interactions.", "Maya"),
    ("devon.writes", "Backend engineer. I write about databases, scale, and coffee.", "Devon"),
    ("aria.designs", "Product designer. Pixels, prototypes, and pretty gradients.", "Aria"),
    ("leo.builds", "Indie hacker shipping tiny apps every weekend.", "Leo"),
    ("nina.ml", "ML engineer turning data into delightful products.", "Nina"),
    ("sam.devops", "Platform & infra. I make deploys boring (in a good way).", "Sam"),
    ("priya.ux", "UX researcher. I talk to users so you don't have to.", "Priya"),
    ("theo.rust", "Systems nerd. Rust, performance, and zero-cost abstractions.", "Theo"),
]

TAGS = [
    "react", "django", "design", "career", "ai", "rust", "css",
    "productivity", "startups", "databases", "devops", "ux",
]

POSTS = [
    ("Building a design system that scales",
     "react design css",
     "After three rewrites, here's what finally stuck when building our design system.\n\n## Start with tokens, not components\n\nColors, spacing, radii, and typography as **design tokens** are the real foundation. Components come later.\n\n![tokens](https://picsum.photos/seed/designsystem/1200/600)\n\n- Keep tokens semantic (`--bg-surface`, not `--gray-800`)\n- Theme by swapping token values, not rewriting components\n- Document everything in one place\n\n> A design system is a product whose users are your own team.\n\nShip the boring version first. Iterate in public."),
    ("Why your Postgres queries are slow (and how to fix them)",
     "databases django",
     "Nine times out of ten, a slow endpoint is a missing index or an N+1 query.\n\n## The N+1 trap\n\n```python\nfor post in Post.objects.all():\n    print(post.author.username)  # one query PER post 😬\n```\n\nUse `select_related` and `prefetch_related`:\n\n```python\nPost.objects.select_related('author').prefetch_related('tags')\n```\n\n![db](https://picsum.photos/seed/postgres/1200/600)\n\nThen `EXPLAIN ANALYZE` everything. Measure, don't guess."),
    ("The gradient is back, and I'm here for it",
     "design css",
     "Flat design walked so gradients could run. Here's how to use them tastefully.\n\n![gradient](https://picsum.photos/seed/gradient/1200/600)\n\n- Use a **135° angle** for that modern diagonal feel\n- Stick to 2 hues that sit close on the color wheel\n- Reserve gradients for hero/CTA moments, not body text\n\nA little goes a long way."),
    ("How I ship a side project every weekend",
     "startups productivity",
     "Constraints are a feature. A 48-hour deadline forces ruthless scoping.\n\n## My weekend stack\n\n1. **Friday night:** one sentence describing the app\n2. **Saturday:** build the single core flow, nothing else\n3. **Sunday:** deploy, post it, go outside\n\n![ship](https://picsum.photos/seed/weekend/1200/600)\n\nDone beats perfect. Every single time."),
    ("A gentle introduction to embeddings",
     "ai productivity",
     "Embeddings turn words into vectors so machines can measure *meaning* by distance.\n\n![ai](https://picsum.photos/seed/embeddings/1200/600)\n\nThink of it as a map where 'king' and 'queen' live in the same neighborhood. Once you have vectors, search becomes geometry."),
    ("Rust for people who love deadlines",
     "rust career",
     "The borrow checker isn't your enemy — it's a very strict pair programmer.\n\n```rust\nfn main() {\n    let greeting = String::from(\"hello\");\n    println!(\"{greeting}\");\n}\n```\n\n![rust](https://picsum.photos/seed/rustlang/1200/600)\n\nFight it for a week. Then it starts catching bugs before they exist."),
    ("Making deploys boring with CI/CD",
     "devops productivity",
     "The dream: push to main, grab coffee, it's live. Here's the pipeline.\n\n![devops](https://picsum.photos/seed/cicd/1200/600)\n\n- Run tests on every PR\n- Auto-deploy main to staging\n- One-click promote to production\n\nBoring deploys mean you ship more, and panic less."),
    ("What I learned from 100 user interviews",
     "ux career",
     "Users rarely tell you what they want. They tell you where it hurts.\n\n![ux](https://picsum.photos/seed/research/1200/600)\n\n## Three rules\n\n1. Ask about the **last time** they did the thing\n2. Shut up and let silence do the work\n3. Watch what they do, not what they say"),
    ("CSS container queries changed everything",
     "css react",
     "Media queries ask about the *viewport*. Container queries ask about the *parent*. That's the unlock for truly reusable components.\n\n![css](https://picsum.photos/seed/cssquery/1200/600)\n\nNow a card looks right whether it's in a sidebar or a hero. No props, no JS."),
    ("Career advice I wish I got at 22",
     "career productivity",
     "Optimize for the steepness of the learning curve, not the size of the paycheck — early on.\n\n![career](https://picsum.photos/seed/career22/1200/600)\n\nThe compounding is unreal. Skills you build at 24 pay dividends for decades."),
    ("Caching: the two hardest problems in CS",
     "databases devops",
     "There are only two hard things: cache invalidation, naming things, and off-by-one errors.\n\n![cache](https://picsum.photos/seed/caching/1200/600)\n\nStart with short TTLs. Invalidate on write. Don't cache until you've measured a real hotspot."),
    ("Designing for dark mode first",
     "design ux css",
     "Dark mode isn't 'light mode with inverted colors'. It needs its own contrast thinking.\n\n![dark](https://picsum.photos/seed/darkmode/1200/600)\n\n- Avoid pure black (#000) — use a soft near-black\n- Reduce saturation slightly in dark themes\n- Test your focus rings on both themes"),
    ("Shipping my first AI feature",
     "ai startups",
     "I added one small AI feature and learned more about prompts than models.\n\n![feature](https://picsum.photos/seed/aifeature/1200/600)\n\nThe model is 20% of the work. The other 80% is UX: loading states, errors, and managing expectations."),
]

COMMENTS = [
    "This is exactly what I needed today, thank you!",
    "Saving this for later. Great breakdown 🔥",
    "Curious how this holds up at scale?",
    "Disagree slightly on point 2, but love the write-up.",
    "The example made it click for me. 🙌",
    "Bookmarked. Sharing with my team.",
    "Wish I'd read this a year ago.",
    "Clean and practical. More of this please.",
    "Underrated take, honestly.",
    "Following you for more of these!",
]


class Command(BaseCommand):
    help = "Seed the database with realistic demo data."

    def add_arguments(self, parser):
        parser.add_argument("--fresh", action="store_true", help="Wipe demo data first")
        parser.add_argument("--password", default=DEMO_PASSWORD, help="Demo user password")

    @transaction.atomic
    def handle(self, *args, **opts):
        random.seed(42)
        password = opts["password"]
        usernames = [u[0] for u in USERS]

        if opts["fresh"]:
            self.stdout.write("Wiping existing demo data…")
            demo = User.objects.filter(username__in=usernames)
            Post.objects.filter(author__in=demo).delete()
            demo.delete()

        # Tags
        tag_objs = {name: Tag.objects.get_or_create(name=name)[0] for name in TAGS}

        # Users
        users = []
        for username, bio, display in USERS:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@example.com",
                    "bio": bio,
                    "first_name": display,
                    "avatar_url": f"https://i.pravatar.cc/200?u={username}",
                    "banner_url": f"https://picsum.photos/seed/{username}-banner/1200/300",
                },
            )
            if created:
                user.set_password(password)
                user.save()
            users.append(user)
        self.stdout.write(f"Users: {len(users)}")

        # Follows (each user follows 2-5 random others)
        Follow.objects.all().delete()
        for u in users:
            others = [o for o in users if o != u]
            for target in random.sample(others, random.randint(2, 5)):
                Follow.objects.get_or_create(follower=u, following=target)

        # Posts
        posts = []
        now = timezone.now()
        for i, (title, tagstr, body) in enumerate(POSTS):
            author = users[i % len(users)]
            post, created = Post.objects.get_or_create(
                title=title,
                author=author,
                defaults={
                    "body": body,
                    "status": Post.Status.PUBLISHED,
                    "cover_image_url": f"https://picsum.photos/seed/cover{i}/1200/600",
                },
            )
            if created:
                post.created_at = now - timedelta(days=random.randint(0, 20), hours=random.randint(0, 23))
                post.save()
                post.tags.set([tag_objs[t] for t in tagstr.split()])
            posts.append(post)
        self.stdout.write(f"Posts: {len(posts)}")

        # Likes, comments, bookmarks
        Like.objects.all().delete()
        Comment.objects.all().delete()
        Bookmark.objects.all().delete()
        for post in posts:
            likers = random.sample(users, random.randint(2, len(users)))
            for u in likers:
                Like.objects.get_or_create(user=u, post=post)
            for _ in range(random.randint(1, 5)):
                Comment.objects.create(
                    post=post,
                    author=random.choice(users),
                    body=random.choice(COMMENTS),
                )
            for u in random.sample(users, random.randint(0, 3)):
                Bookmark.objects.get_or_create(user=u, post=post)

        # Recompute denormalized counts
        for post in posts:
            post.like_count = post.likes.count()
            post.comment_count = post.comments.count()
            post.save(update_fields=["like_count", "comment_count"])
        for u in users:
            u.follower_count = u.followers.count()
            u.following_count = u.following.count()
            u.save(update_fields=["follower_count", "following_count"])

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(users)} users and {len(posts)} posts.\n"
            f"Log in as any of: {', '.join(usernames)}\n"
            f"Password for all demo users: {password}"
        ))
