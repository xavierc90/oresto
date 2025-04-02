# Variables
DOCKER_COMPOSE_TEST = docker-compose -f docker-compose.test.yml
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose.yml

# Cibles
.PHONY: help clean-test test up-dev down-dev clean-dev full-test

# Afficher l'aide
help:
	@echo "Usage:"
	@echo "  make <command>"
	@echo ""
	@echo "Commands:"
	@echo "  clean-test    Nettoyer les conteneurs et images de test"
	@echo "  test          Lancer les tests (assurez-vous que l'environnement est propre)"
	@echo "  full-test     Nettoyer et lancer les tests (équivaut à clean-test puis test)"
	@echo "  up-dev        Démarrer l'environnement de développement"
	@echo "  down-dev      Arrêter et supprimer les conteneurs de développement"
	@echo "  clean-dev     Nettoyer complètement l'environnement de développement"
	@echo "  help          Afficher cette aide"

# Lancer les tests (supprime tout puis lance les tests)
test:
	@echo "Lancement des tests..."
	$(DOCKER_COMPOSE_TEST) up --build

# Nettoyer les conteneurs et images de l'environnement de test
clean-test:
	@echo "Nettoyage des conteneurs et images de test..."
	$(DOCKER_COMPOSE_TEST) down --rmi all

# Combiner nettoyage et lancement des tests
full-test: clean-test test

# Démarrer l'environnement de développement
up-dev:
	@echo "Démarrage de l'environnement de développement..."
	$(DOCKER_COMPOSE_DEV) up --build

# Arrêter et supprimer les conteneurs de l'environnement de développement
down-dev:
	@echo "Arrêt et suppression des conteneurs de développement..."
	$(DOCKER_COMPOSE_DEV) down

# Nettoyer complètement l'environnement de développement
clean-dev: down-dev
	@echo "Suppression des images de développement..."
	$(DOCKER_COMPOSE_DEV) down --rmi all