# Étape 1 : Dépendances
FROM node:20.15.0-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Étape 2 : Développement
FROM deps AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Étape 3 : Build (pour la prod)
FROM deps AS build
COPY . .
RUN npm run build

# Étape 4 : Serveur statique avec NGINX (pour la prod)
FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]