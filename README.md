# Prism — Full-Stack Social Blogging Platform

A production-ready social blogging app where users write Markdown posts, follow
each other, like/comment/bookmark, and browse a personalized feed. Dark theme by
default with a light-mode toggle, pink→blue gradient accents, and glassmorphism.

| Layer | Stack |
| --- | --- |
| Backend | Django 5 + Django REST Framework, SimpleJWT (access + refresh) |
| Async | Celery + Celery Beat (welcome emails, notifications, fan-out, trending tags) |
| Broker / cache | Redis (Celery broker, response caching, throttling) |
| Database | PostgreSQL |
| Frontend | React (Vite) + React Router + TanStack Query + Tailwind CSS |
| Deploy | Backend on Railway, frontend on Vercel |

```
.
├── backend/     # Django + DRF API, Celery, Docker
├── frontend/    # Vite + React SPA
└── docker-compose.yml   # local Postgres + Redis + web + worker + beat
```

## Quick start (Docker, recommended)

```bash
cp backend/.env.example backend/.env       # tweak if you like
docker compose up --build
# API:      http://localhost:8000/api
# Admin:    http://localhost:8000/admin
```

Then run the frontend:

```bash
cd frontend
cp .env.example .env                        # VITE_API_URL defaults to localhost:8000/api
npm install
npm run dev                                 # http://localhost:5173
```

## Manual backend setup (no Docker)

You'll need local PostgreSQL and Redis running.

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                        # set DATABASE_URL / REDIS_URL
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# In separate terminals, for async tasks:
celery -A config worker --loglevel=info
celery -A config beat   --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

### Run backend tests

```bash
cd backend
DATABASE_URL="sqlite:///test.sqlite3" pytest
```

Tests use in-memory SQLite + a local-memory cache and run Celery eagerly
(see `conftest.py`), so they need neither Postgres nor Redis.

## API reference

All routes are prefixed with `/api`. JWT in `Authorization: Bearer <access>`.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | – | Create account (fires welcome email) |
| POST | `/auth/login` | – | Returns `{access, refresh, user}` |
| POST | `/auth/refresh` | – | New access token from refresh |
| GET | `/users/{username}` | – | Public profile (+ `is_following`) |
| PATCH | `/users/me` | ✓ | Update own profile |
| POST | `/users/{username}/follow` | ✓ | Toggle follow |
| GET | `/feed` | ✓ | Personalized, paginated feed |
| GET | `/posts` | – | List/filter (`?tag=`, `?author=`, `?search=`, `?ordering=`) |
| POST | `/posts` | ✓ | Create post (`tag_names: []`) |
| GET/PATCH/DELETE | `/posts/{slug}` | ✓ owner | Retrieve / edit / delete |
| POST | `/posts/{slug}/like` | ✓ | Toggle like |
| POST | `/posts/{slug}/bookmark` | ✓ | Toggle bookmark |
| GET/POST | `/posts/{slug}/comments` | ✓ write | Threaded comments |
| GET | `/bookmarks` | ✓ | Your saved posts |
| GET | `/notifications` | ✓ | Your notifications |
| POST | `/notifications/read` | ✓ | Mark all read |

Pagination is page-number based (`?page=N`, size 10). Feed and post-detail are
cached in Redis with a short TTL; drafts are visible only to their author.

## Deployment

See [DEPLOY.md](./DEPLOY.md) for full Railway + Vercel steps. Summary:

- **Railway** — deploy `backend/` (Dockerfile). Add managed Postgres + Redis;
  set `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`,
  `DEBUG=False`. `DATABASE_URL`/`REDIS_URL` are injected automatically. Add two
  more services from the same repo for the Celery `worker` and `beat` (commands
  in `Procfile`). Migrations run on deploy; static is served via WhiteNoise.
- **Vercel** — import `frontend/`, framework auto-detects Vite. Set
  `VITE_API_URL` to the Railway backend URL (with `/api`). `vercel.json` already
  rewrites all routes to `index.html` for the SPA.

## Design tokens

Defined as CSS variables in `frontend/src/index.css` and wired into Tailwind via
`frontend/tailwind.config.js`, so utility classes like `bg-bg-surface`,
`text-text-muted`, and `bg-brand-gradient` resolve correctly in both themes.
Theme preference is stored in `localStorage`; first visit respects
`prefers-color-scheme` but defaults to dark.
