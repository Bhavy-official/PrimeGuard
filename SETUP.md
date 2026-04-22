# Setup Guide: PrimeGuard

This document provides detailed instructions for setting up the PrimeGuard development environment. Follow these steps to get the full-stack application running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: version 20.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: version 10.0.0 or higher (usually comes with Node.js)
- **PostgreSQL**: version 15 or higher ([Download](https://www.postgresql.org/))
- **Docker & Docker Compose**: (Optional, for containerized setup) ([Download](https://www.docker.com/))

---

## 1. Initial Project Setup

Clone the repository and install the dependencies for the entire monorepo:

```bash
# Install root dependencies and workspace dependencies
npm install
```

---

## 2. Environment Configuration

The project uses environment variables to manage configuration for both the backend and frontend.

### Backend (apps/api)

Copy the example environment file and update the values:

```bash
cp apps/api/.env.example apps/api/.env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/primeguard?schema=public` |
| `PORT` | The port the API will run on | `5000` |
| `API_PREFIX` | Base path for all API routes | `/api/v1` |
| `CLIENT_URL` | The URL of the frontend (for CORS) | `http://localhost:5173` |
| `ACCESS_TOKEN_SECRET` | Secret key for signing Access Tokens | *Required (Long random string)* |
| `REFRESH_TOKEN_SECRET`| Secret key for signing Refresh Tokens| *Required (Long random string)* |
| `ACCESS_TOKEN_EXPIRES_IN` | Validity period of Access Tokens | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN`| Validity period of Refresh Tokens| `7d` |

### Frontend (apps/web)

Copy the example environment file:

```bash
cp apps/web/.env.example apps/web/.env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | The full URL to the backend API | `http://localhost:5000/api/v1` |

---

## 3. Database Initialization

PrimeGuard uses **Prisma ORM**. You need to generate the Prisma client and run migrations to set up the database schema.

1.  **Ensure PostgreSQL is running** and you have created a database named `primeguard` (or whatever you specified in `DATABASE_URL`).
2.  **Generate the Client:**
    ```bash
    npm run prisma:generate --workspace api
    ```
3.  **Run Migrations:**
    ```bash
    npx prisma migrate dev --schema apps/api/prisma/schema.prisma
    ```
4.  **Seed Initial Data (Recommended):**
    This will create default admin and user accounts.
    ```bash
    npm run prisma:seed --workspace api
    ```

---

## 4. Running the Application

### Option A: Local Development (Recommended)

Start both the backend and frontend concurrently from the root directory:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Swagger Docs**: [http://localhost:5000/docs](http://localhost:5000/docs)

### Option B: Docker Setup

If you prefer using Docker, you can spin up the entire stack (API, Frontend, and Postgres) with one command:

```bash
docker compose up --build
```

*Note: Docker will use the configurations defined in `docker-compose.yml` and the respective `Dockerfile` in each app.*

---

## 5. Development Workflow

### Useful Commands

| Command | Scope | Description |
| :--- | :--- | :--- |
| `npm run build` | Root | Build both API and Web for production |
| `npm run lint` | Root | Run linting (TypeScript checks) on both apps |
| `npm run format` | Root | Format code using Prettier |
| `npm run prisma:studio --workspace api` | API | Open Prisma Studio to view/edit database data |

### Demo Credentials

If you seeded the database, use these credentials:

- **Admin Account**:
  - Email: `admin@primeguard`
  - Password: `Admin@12345`
- **User Account**:
  - Email: `user@primeguard`
  - Password: `Admin@12345`

---

## 6. Troubleshooting

- **Prisma Migration Failed**: Ensure your `DATABASE_URL` is correct and the PostgreSQL service is reachable.
- **CORS Errors**: Check that `CLIENT_URL` in the API `.env` matches the URL your browser is using for the frontend.
- **Port Conflict**: If port 5000 or 5173 is already in use, change the `PORT` in the respective `.env` files.
