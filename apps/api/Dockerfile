FROM node:20-alpine AS base
WORKDIR /app

COPY package.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm install --workspace api --include-workspace-root

COPY tsconfig.json ./
COPY apps/api apps/api

WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
