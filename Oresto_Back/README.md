# 🧠 Oresto — Backend

Backend Node.js + Express pour l'application de réservation Oresto.  
Ce projet est destiné à être utilisé avec MongoDB et Docker (local ou serveur).

---

## 🚀 Contenu du projet

- API REST sécurisée avec Express.js
- Connexion à MongoDB via Mongoose
- Architecture modulaire (controllers, routes, services…)
- Variables d’environnement par fichier `.env`
- Environnements : `development`, `test`, `production`
- Test unitaire avec Mocha/Chai
- Utilisation de Docker multi-stage (dev, test, prod)
- Routage HTTP par Traefik (en production)

---

## 📁 Arborescence

Oresto_Back/ 
├── controllers/ 
├── routes/ 
├── services/ 
├── tests/ 
├── logs/ # Vide au départ (non versionné sauf via .gitkeep) 
├── .env # Ignoré (existe en local uniquement) 
├── .env.test # Pour les tests 
├── .env.production # Pour la prod 
├── .env.example # Exemple de structure pour créer vos .env 
├── Dockerfile # Multi-stage build 
├── package.json 
├── server.js 
└── README.md

## 🧪 Lancer les tests

### ➤ Prérequis :
- Avoir Docker et Docker Compose installés
- Avoir le fichier `.env.test` configuré (voir `.env.example`)

### ➤ Lancer les tests :

```bash
./test.sh

## 📬 Contact

- 📧 Email : [contact@xaviercolombel.fr](mailto:contact@xaviercolombel.fr)
- 🌐 Site internet : [www.xaviercolombel.fr](https://www.xaviercolombel.fr)
- 💼 LinkedIn : [linkedin.com/in/xaviercolombel](https://www.linkedin.com/in/xaviercolombel/)