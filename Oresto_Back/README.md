# Oresto_back
Application Oresto (Back-end)

### Prérequis  

> creer un fichier .env en copiant le fichier .env.dev et en renseignant les variables d'environnement

- container development et mongodb

### Lancement des containers
```bash
# Utiliser le Makefile
# taper `make` dans le terminal pour voir les commandes disponibles

# lancer les containers
make up-dev

# supprimer et arreter les containers
make down-dv

# clean tous ce qui y a en rapport avec l'environement de developpement
make clean-dev
```

### Info container developpement : 
```md
# Nom du container
api-oresto

# information creation du container
- utilise le dockerfile pour creer une image
- utilise le stage development. ce container ne peux pas etre creer 
si le container mongodb-oresto n'est pas creer
- ce container creera le dossier node_modules dans le dossier de l'application
si il n'existe pas.
- ce container creera un dossier logs pour les logs de l'application
si il n'existe pas.

(les dossier node_modules et logs sont dans le .gitignore)
```

### Info container mongodb :
```md
# Nom du container
mongodb-oresto

# information creation du container
- utilise une image sur le hub docker
- ce container est creer avant le container de l'application
- ce container creera un dossier mongo-data pour les donnees de la base de donnees
  (le dossier mongo-data est dans le .gitignore)
```

- container test et mongodb test

> ce container est specifique est execute que les tests ensuite il s'arrete

### Lancement du container
```bash
# Utiliser le Makefile
# taper `make` dans le terminal pour voir les commandes disponibles

# lancer les containers
make test

# supprimer et arreter les containers
make clean-test

# clean tous ce qui y a en rapport avec l'environement de test et relance les containers de test
make full-test
```

### Info container test :
```md
# Nom du container
api-oresto-test

# information creation du container
- lance les test de l'application et s'arrete
```

### Info container mongodb test :
```md
# Nom du container
mongodb-oresto-test

# information creation du container
- utilise une image sur le hub docker
- ce container est creer avant le container de test
- ce container creera un dossier mongo-data-test pour les donnees de la base de donnees
  (le dossier mongo-data-test est dans le .gitignore)
```
