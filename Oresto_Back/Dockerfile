# Étape 1 : Dépendances
FROM node:20.15.0-alpine AS dependencies
USER node
WORKDIR /api
COPY --chown=node:node package*.json ./
RUN npm ci

# Étape 2 : Environnement de développement
FROM dependencies AS development
COPY --chown=node:node ./ ./
COPY --chown=node:node scripts/install.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/install.sh
EXPOSE 3001
ENTRYPOINT ["install.sh"]
CMD ["npm", "start"]

# Étape 3 : Environnement de test
FROM dependencies AS test
COPY --chown=node:node ./ ./
CMD ["npm", "run", "test"]

# Étape 4 : Environnement de production
FROM dependencies AS production
COPY --chown=node:node ./ ./
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "server.js"]
