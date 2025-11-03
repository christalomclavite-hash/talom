# Teachers Appointment System - Backend

This repository includes two simple backends that can be used with the existing static frontend (`index.html`, `style.css`):

1. Node.js + Express (in `server.js`) using SQLite
2. PHP + SQLite (in `api/`) — good when you have PHP available

Files added
- `server.js` - Express server and API (Node)
- `package.json` - Node dependencies and start script
- `api/` - PHP API implementation (see below)
- `api/db.php` - DB initialization for PHP
- `api/index.php` - PHP API endpoints
- `router.php` - router script for PHP built-in server
- `db/schema.sql` - DB schema

Node quick start (Windows PowerShell)

1. Install dependencies

```powershell
npm install
```

2. Start server

```powershell
npm start
# or
node server.js
```

Server will run on http://localhost:3000 and serve the static frontend.

PHP backend
-----------

If you prefer to run the PHP backend instead of Node, a simple PHP implementation is included under the `api/` folder. It uses SQLite and PHP sessions.

Run using the PHP built-in server (PowerShell):

```powershell
php -S localhost:8000 router.php
```

This will:
- Serve static files (your existing `index.html`, `style.css`, etc.)
- Route `/api/*` requests to `api/index.php` which implements the same endpoints as the Node version (register, login, logout, profile, appointments).

Notes: PHP must be installed and available on your PATH. The DB file will be created at `db/app.db` and initialized from `db/schema.sql` on first run. A default admin user (admin@sti.local / adminpass) is created if missing.

Note about Docker
-----------------
This project previously included instructions for running with Docker. That workflow has been removed from this repository to keep the project focused on running locally with PHP or Node.

If you rely on Docker in your environment, you can still containerize this project yourself; the codebase is standard PHP/Node and uses SQLite for data.

API overview (same for Node and PHP)

- POST /api/register  { name, email, password } -> registers and logs in user
- POST /api/login     { email, password } -> logs in, creates session cookie
- POST /api/logout    -> logs out (destroys session)
- GET  /api/profile   -> returns current user (requires session)
- GET  /api/appointments?student=...&teacher=... -> list appointments
- POST /api/appointments { student_name, teacher_name, date, notes } -> create appointment
- PUT  /api/appointments/:id/accept -> mark appointment accepted
- GET /api/health -> basic status

Security & production notes
- Passwords are hashed with PHP's `password_hash` / `password_verify` or Node's `bcryptjs`.
- Sessions are stored in-memory (Node) or PHP session default (filesystem). For production, use a persistent session store and secure secrets.
- Validation is minimal. Consider adding input validation, rate-limiting, CSRF protection, and HTTPS for production.

Next steps I can help with
- Wire the frontend to call the PHP endpoints (login/register forms, appointment submission)
- Add a message/contact table and endpoint for `contact.html`
- Add unit tests or Postman collection for the API
- Replace session auth with JWT if you'd prefer an SPA architecture

If you'd like me to run a quick local check of the PHP API by starting the PHP server in a terminal, say "please run the PHP server" and I'll start it and report back the health check result.