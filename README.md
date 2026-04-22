# PrimeTrade.ai

Production-grade full-stack task management project built with:

- Backend: Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT, bcrypt, Zod, Swagger, Morgan, Winston
- Frontend: React, Vite, Axios, Tailwind CSS

## Structure

- `apps/api` - Express API
- `apps/web` - React frontend

## Features

- Access + refresh token authentication
- Refresh token rotation and logout invalidation
- Role-based access with `USER` and `ADMIN`
- User profile endpoints and admin user listing
- Task CRUD with pagination, filtering, sorting, and search
- Soft delete and activity logs
- Swagger docs at `/docs`
- Health endpoint at `/health`
- Docker Compose for API, Postgres, and frontend

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure backend environment:

```bash
cp apps/api/.env.example apps/api/.env
```

3. Configure frontend environment:

```bash
cp apps/web/.env.example apps/web/.env
```

4. Run Prisma migration and generate the client:

```bash
npm run prisma:generate --workspace api
npx prisma migrate dev --schema apps/api/prisma/schema.prisma
```

5. Optional: seed demo data:

```bash
npm run prisma:seed --workspace api
```

6. Start both apps:

```bash
npm run dev
```

## Demo Credentials

- Admin: `admin@primetrade.ai`
- User: `user@primetrade.ai`
- Password: `Admin@12345`

## Build Verification

Verified locally in this workspace:

- `npm run lint --workspace api`
- `npm run lint --workspace web`
- `npm run build --workspace api`
- `npm run build --workspace web`

## Docker

Start the full stack:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`
- Swagger: `http://localhost:5000/docs`

