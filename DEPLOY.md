# Deployment Guide — Railway (backend) + Vercel (frontend)

## 1. Backend on Railway

1. **Create a project** and add three services from this repo, all rooted at
   `backend/` (it contains the `Dockerfile`):
   - **web** — start command:
     `python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 3`
   - **worker** — start command: `celery -A config worker --loglevel=info`
   - **beat** — start command:
     `celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler`
   (These commands are also in `backend/Procfile`.)

2. **Add plugins**: a managed **PostgreSQL** and a managed **Redis**. Railway
   injects `DATABASE_URL` and `REDIS_URL` into every service in the project.

3. **Environment variables** (set on all three services):

   | Key | Value |
   | --- | --- |
   | `SECRET_KEY` | a long random string |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `your-app.up.railway.app` |
   | `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
   | `CSRF_TRUSTED_ORIGINS` | `https://your-frontend.vercel.app` |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` |
   | `CELERY_BROKER_URL` | `${{Redis.REDIS_URL}}` |
   | `CELERY_RESULT_BACKEND` | `${{Redis.REDIS_URL}}` |
   | `EMAIL_BACKEND` | SMTP backend for real email (optional) |

   `DATABASE_URL` and `REDIS_URL` are provided automatically — no need to set them.

4. Deploy. Migrations run automatically via the web start command. Static files
   are collected at build time and served by WhiteNoise.

5. Create an admin user once (Railway shell): `python manage.py createsuperuser`.

## 2. Frontend on Vercel

1. **Import** the repo and set the **root directory** to `frontend/`. Vercel
   auto-detects Vite (build `npm run build`, output `dist`).
2. **Environment variable**: `VITE_API_URL = https://your-app.up.railway.app/api`
   (no trailing slash).
3. Deploy. `vercel.json` rewrites all paths to `index.html` so client-side
   routes work on refresh.

## 3. Wire them together

After both are live, update the Railway `CORS_ALLOWED_ORIGINS` and
`CSRF_TRUSTED_ORIGINS` to the final Vercel URL and redeploy the backend. The JWT
API routes are session-CSRF-exempt by design (token auth), so no CSRF cookie is
required for API calls.

## Notes

- JWT access tokens live 30 min, refresh tokens 7 days with rotation +
  blacklist. The frontend keeps the access token in memory and the refresh token
  in `localStorage`, transparently refreshing on 401.
- The `beat` service drives the periodic **trending tags** task every 15 minutes;
  results are cached in Redis under `trending_tags`.
