const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Déterminer l'environnement (par défaut : development)
const NODE_ENV = process.env.NODE_ENV || 'development';

const envFile =
    NODE_ENV === 'test'
        ? '.env.test'
        : NODE_ENV === 'production'
            ? '.env.production'
            : '.env.local';

const envPath = path.resolve(__dirname, envFile);

// Charger les variables d’environnement si le fichier existe
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ Variables d'environnement chargées depuis ${envFile}`);
} else {
    console.warn(`⚠️ Aucun fichier ${envFile} trouvé. Certaines variables peuvent manquer.`);
}

// Exporter les variables de manière claire
module.exports = {
    env: NODE_ENV,
    port: process.env.PORT || 8080,
    secret_key: process.env.SECRET_KEY || 'MY_SECRET_KEY_HASH',
    secret_cookie: process.env.SECRET_COOKIE || 'COOKIE',
    database_url: process.env.DATABASE_URL || 'mongodb://localhost:27017',
};
