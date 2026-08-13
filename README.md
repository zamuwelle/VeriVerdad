<div align="center">

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e7f82a80-c0dd-4301-baab-81e08f2582f9" />

<h1>VeriVerdad</h1>

<p>An AI-powered verification platform featuring <strong>Veribot</strong>, a specialized chat assistant that analyzes information and provides detailed reasoning to help users distinguish truth from misinformation using the <strong>CRAAP framework</strong> (Currency, Relevance, Authority, Accuracy, Purpose).</p>

<p>
  <a href="#installation">Installation</a> &bull;
  <a href="#configuration">Configuration</a> &bull;
  <a href="#usage">Usage</a> &bull;
  <a href="#contributing">Contributing</a> &bull;
  <a href="#troubleshooting">Troubleshooting</a>
</p>

</div>

---

## Overview

VeriVerdad is a full-stack web application that promotes **Media and Information Literacy (MIL)** through an interactive AI chat experience. The platform consists of two main components:

- **Veribot Chat** — A conversational AI assistant that evaluates claims, provides sourced verification, and runs interactive CRAAP-based quiz challenges to help users build critical thinking skills.
- **History & Leaderboards** — Users can review past conversations and track their verification progress.

The backend is built with **Laravel 13** (powered by **FrankenPHP** for high-performance serving), and the frontend is a **React 19** single-page application bundled with **Vite** and styled with **Tailwind CSS 4**. AI responses are generated via the **Groq API** using the `openai/gpt-oss-20b` model.

---

## Installation

### Prerequisites

- **PHP** 8.3 or higher
- **Composer** 2.x
- **Node.js** 18+ and **npm** 9+
- **Groq API key** ([get one free at console.groq.com](https://console.groq.com))
- A database (SQLite is used by default; MySQL/MariaDB/PostgreSQL are also supported)

### 1. Clone the Repository

```bash
git clone https://github.com/zamuwelle/veriverdad.git
cd VeriVerdad
```

### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Create environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database and Groq API key in .env (see Configuration section)

# Run database migrations
php artisan migrate --force

# Start the development server
php artisan serve
```

The backend will be available at `http://localhost:8000`.

> **Tip:** You can also run `composer run dev` from the backend directory to start the server, queue worker, and log watcher concurrently.

### 3. Frontend Setup

Open a new terminal window:

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 4. One-Step Setup (Backend Only)

If you want to quickly bootstrap the backend with default settings:

```bash
cd backend
composer run setup
```

---

## Configuration

### Backend Environment Variables

Edit `backend/.env` with your settings:

```env
APP_NAME=VeriVerdad
APP_ENV=local
APP_KEY=base64:<generated-by-artisan>
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (SQLite by default)
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/backend/database/database.sqlite

# Or use MySQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=verivdad
# DB_USERNAME=root
# DB_PASSWORD=

# Groq API
GROQ_API_KEY=gsk_your_groq_api_key_here

# Secret token for API middleware
SECRET_TOKEN=your_super_secret_token_here
```

To create the SQLite database file:

```bash
touch backend/database/database.sqlite
```

### Frontend Environment Variables

Edit `frontend/.env` (or copy from `.env.example`):

```env
VITE_API_URL=http://localhost:8000/api
VITE_SECRET_TOKEN=your_super_secret_token_here
```

> The `VITE_SECRET_TOKEN` must match the backend `SECRET_TOKEN`.

### CORS Note

If the frontend and backend run on different origins, ensure CORS is configured in `backend/config/cors.php` or use a Laravel CORS package.

---

## Usage

### Running the Application

1. Start the backend: `php artisan serve` (port 8000)
2. Start the frontend: `npm run dev` (port 5173)
3. Open `http://localhost:5173` in your browser

### API Endpoints

All API routes are prefixed with `/api` and protected by a secret token middleware. Authenticated routes require a Bearer token obtained via login.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/register` | Register a new user | No |
| `POST` | `/api/login` | Login and receive token | No |
| `POST` | `/api/logout` | Logout and invalidate token | Yes |
| `POST` | `/api/chat` | Send a message to Veribot | Yes |
| `GET` | `/api/chats` | List user conversations | Yes |
| `GET` | `/api/chats/{id}` | Get a specific conversation | Yes |
| `PATCH` | `/api/chats/{id}` | Update conversation title | Yes |
| `DELETE` | `/api/chats/{id}` | Delete a conversation | Yes |

### Frontend Scripts

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Production build to dist/
npm run lint     # Run oxlint
npm run preview  # Preview production build locally
```

### Backend Scripts

```bash
composer run setup    # Full project setup (install, key generate, migrate, build)
composer run dev      # Run server, queue, logs, and Vite concurrently
composer run test     # Run PHPUnit test suite
php artisan serve     # Start Laravel development server
php artisan migrate   # Run pending migrations
php artisan pail      # Stream Laravel logs
```

---

## Project Structure

```
VeriVerdad/
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   └── ChatController.php
│   │   │   ├── Middleware/
│   │   │   │   └── SecretTokenMiddleware.php
│   │   │   └── Requests/
│   │   │       ├── LoginRequest.php
│   │   │       ├── RegisterRequest.php
│   │   │       └── ChatRequest.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Conversation.php
│   │   │   └── Message.php
│   │   └── Services/
│   │       ├── ChatService.php
│   │       └── GroqService.php
│   ├── config/
│   │   ├── groq.php
│   │   ├── secret.php
│   │   └── database.php
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   ├── Dockerfile
│   └── composer.json
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── router.jsx
│   │   ├── pages/
│   │   │   ├── Auth.jsx
│   │   │   ├── Veribot.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Leaderboards.jsx
│   │   │   └── Landing.jsx
│   │   └── components/
│   │       ├── Sidebar.jsx
│   │       ├── PageLoader.jsx
│   │       └── Icons.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
└── README.md
```

---

## Contributing

Contributions are welcome. Please follow these guidelines:

1. **Fork** the repository and create a feature branch from `main`.
2. **Install dependencies** for both backend and frontend.
3. **Make your changes** following the existing code style.
4. **Run tests** to ensure nothing is broken:
   - Backend: `composer run test`
   - Frontend: `npm run lint`
5. **Commit** with a clear, descriptive message.
6. **Open a pull request** with a summary of the change and any relevant context.

### Code Style

- **Backend (PHP/Laravel):** Follow Laravel conventions. Use Pint for formatting where available.
- **Frontend (React):** Follow the existing component patterns. Use functional components with hooks.

---

## Troubleshooting

### Backend Issues

| Problem | Solution |
|---------|----------|
| `SQLSTATE[HY000]` or database connection errors | Ensure your `.env` database credentials are correct and the database exists. For SQLite, run `touch database/database.sqlite`. |
| `Groq API key missing` | Set `GROQ_API_KEY` in `backend/.env`. Get a key from [console.groq.com](https://console.groq.com). |
| `Class not found` after `git pull` | Run `composer install` and `php artisan optimize:clear`. |
| `Permission denied` on `storage/` | Run `chmod -R 775 storage bootstrap/cache` inside the `backend/` directory. |
| Port 8000 already in use | Run `php artisan serve --port=8001` or stop the conflicting process. |

### Frontend Issues

| Problem | Solution |
|---------|----------|
| `VITE_API_URL` not found | Ensure `frontend/.env` exists and contains the backend URL. Restart the Vite dev server after changing `.env`. |
| `401 Unauthorized` on API calls | Verify `VITE_SECRET_TOKEN` matches `SECRET_TOKEN` in the backend `.env`. |
| CORS errors | Configure CORS in `backend/config/cors.php` or ensure both servers use compatible origins. |
| HMR not working | Clear Vite cache: delete `node_modules/.vite` and restart. |

### General

- Clear all caches if you encounter stale config or route errors:
  ```bash
  php artisan optimize:clear
  ```
- If migrations fail, check your database connection and ensure no conflicting migrations exist.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
