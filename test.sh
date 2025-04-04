#!/bin/bash

echo "🧪 Lancement des tests du backend Oresto..."

docker compose run --rm \
  --env-file ./Oresto_Back/.env.test \
  backend \
  npm test