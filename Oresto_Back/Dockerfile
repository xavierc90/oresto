# Étape 1 : Dépendances de base
FROM node:20.15.0-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Étape 2 : Développement
FROM base AS development
COPY . .
EXPOSE 3001
CMD ["npm", "start"]

# Étape 3 : Tests
FROM base AS test
COPY . .
CMD ["npm", "test"]

# Étape 4 : Production
FROM base AS production
COPY . .
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "server.js"]