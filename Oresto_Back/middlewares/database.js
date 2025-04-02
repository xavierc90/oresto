const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// 🔄 Chargement dynamique du bon fichier .env selon l'environnement
const envFile =
  process.env.NODE_ENV === 'test'
    ? '.env.test'
    : process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.local';

const envPath = path.resolve(__dirname, `../${envFile}`);
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log(`🌱 Variables chargées depuis ${envFile}`);
} else {
  console.warn(`⚠️ Fichier ${envFile} introuvable. Les variables d'environnement peuvent être manquantes.`);
}

// 🧪 Connexion à MongoDB
let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ Erreur : La variable DATABASE_URL n'est pas définie.");
  process.exit(1);
}

DATABASE_URL = DATABASE_URL.trim();
console.log(`🔍 URL MongoDB utilisée : "${DATABASE_URL}"`);

if (!DATABASE_URL.startsWith("mongodb://") && !DATABASE_URL.startsWith("mongodb+srv://")) {
  console.error("❌ Erreur : L'URL MongoDB doit commencer par mongodb:// ou mongodb+srv://");
  process.exit(1);
}

if (mongoose.connection.readyState === 0) {
  mongoose.connect(DATABASE_URL)
    .then(() => console.log('✅ Base de données connectée'))
    .catch((err) => {
      console.error('❌ Erreur de connexion à MongoDB :', err);
      process.exit(1);
    });
} else {
  console.log('✅ Mongoose est déjà connecté.');
}

// ✅ Middleware pour vérifier la connexion
module.exports.checkConnection = (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    req.log ? req.log.info('✅ Database connected') : console.log('✅ Database connected');
    next();
  } else {
    req.log ? req.log.error('❌ Database not connected') : console.error('❌ Database not connected');
    res.status(500).send('Service Unavailable: Database not connected');
  }
};
