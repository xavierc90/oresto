const mongoose = require('mongoose');
const Logger = require('./logger').pino;
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    Logger.info("✅ Connecté à la base de donnée.");
  })
  .catch((err) => {
    Logger.error("❌ Erreur lors de la connexion à la base de donnée :", err);
  });

mongoose.connection.on('disconnected', () =>
  Logger.error("🚫 Déconnecté de la base de donnée.")
);
mongoose.connection.on('reconnected', () =>
  Logger.info("🔄 Reconnecté à la base de donnée.")
);
mongoose.connection.on('close', () =>
  Logger.info("🔒 Connexion à la base de donnée fermée.")
);
