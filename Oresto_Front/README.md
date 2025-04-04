# 🍽️ Oresto – Online reservation system for restaurants

![Screenshot of Oresto](https://github.com/xavierc90/mon-projet-perso/blob/main/public/img/preview-app-oresto.png?raw=true)

---

## 🧾 Description

Oresto est une application web moderne, responsive, et complète permettant aux restaurateurs de gérer :

- Les réservations en ligne
- Le plan de salle
- Les utilisateurs
- L’historique des réservations

Elle propose une **interface publique** pour les clients (via un widget), ainsi qu’un **espace de gestion sécurisé** pour les restaurateurs.

---

## 🛠️ Technologies utilisées

- ⚛️ **React** + **Vite.js** (Frontend)
- 🧠 **Node.js** + **Express.js** (Backend)
- 🍃 **MongoDB** (Base de données)
- 🐳 **Docker** / **Docker Compose**
- 🎨 **Tailwind CSS**
- 🔁 **Traefik** (reverse proxy + HTTPS)
- 🧪 **Mocha** / **Chai** (tests backend)

---

## 📁 Structure du projet

```
oresto/
├── Oresto_Front/        # Frontend React (Vite)
├── Oresto_Back/         # Backend Express + MongoDB
├── traefik/             # Fichiers de configuration Traefik
├── docker-compose.yml   # Docker global (frontend + backend + mongo + traefik)
├── test.sh              # Script pour exécuter les tests backend
└── README.md            # Documentation principale
```

---

## ⚙️ Installation locale (sans Docker)

```bash
# Frontend
cd Oresto_Front
npm install
npm run dev

# Backend
cd ../Oresto_Back
npm install
npm start
```

MongoDB doit tourner en local sur le port 27017.

---

## 🐳 Installation via Docker (recommandé)

### ➤ Lancer tous les services :

```bash
docker compose up --build -d
```

### ➤ Accès :

- 🌐 Frontend : http://localhost *(ou ton domaine configuré avec Traefik)*
- 🧠 Backend API : http://localhost:3001
- 🔐 Traefik dashboard : http://localhost:8080

### ➤ Stopper et nettoyer :

```bash
docker compose down --rmi all
```

---

## 🧪 Lancer les tests backend

```bash
./test.sh
```

Ce script exécute les tests dans un conteneur isolé Docker via `docker-compose.test.yml`.

---

## 🔐 Variables d’environnement

Chaque partie a son propre fichier `.env`.  
Exemples disponibles dans :

- `/Oresto_Front/.env.example`
- `/Oresto_Back/.env.example`

Variables clés à définir :
```env
# Backend
DATABASE_URL=mongodb://mongo:27017/oresto_dev
PORT=3001
SECRET_KEY=your_dev_secret
SECRET_COOKIE=your_cookie_secret

# Frontend
VITE_API_URL=http://localhost:3001
```

---

## 🧭 Traefik & HTTPS

Le dossier `/traefik` contient la configuration :

- du reverse proxy
- des entrées sur les ports 80 / 443
- de la génération automatique de certificats via Let's Encrypt

⚠️ Le fichier `acme.json` stocke les certificats TLS générés automatiquement. Ne le versionnez pas.

---

## 📬 Contact

- 📧 Email : [contact@xaviercolombel.fr](mailto:contact@xaviercolombel.fr)
- 🌐 Site internet : [www.xaviercolombel.fr](https://www.xaviercolombel.fr)
- 💼 LinkedIn : [linkedin.com/in/xaviercolombel](https://www.linkedin.com/in/xaviercolombel/)

---

## ✅ To do

- [ ] Ajout d’un système de paiement
- [ ] Gestion multilingue (FR / EN)
- [ ] Optimisation mobile
- [ ] Notifications email / SMS
- [ ] Authentification avec refresh tokens

---

> 🧑‍💻 Projet personnel réalisé par Xavier Colombel dans le cadre de la formation Concepteur Développeur d'Applications @Numérica