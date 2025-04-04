const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Config = require("./config");
const logger = require("./utils/logger").pino;
const { addLogger } = require("./middlewares/logger");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cron = require("./utils/cron");
const { errorHandler, APIError } = require("./middlewares/errorHandler");
const routes = require("./routes");
const cookieParser = require("cookie-parser");

// Configuration de l'app
const app = express();

// Gestion des erreurs non capturées
process.on("uncaughtException", (error) => {
  logger.error({
    message: "Erreur non capturée",
    error: error.message,
    stack: error.stack,
  });
});

// Amélioration de la gestion des promesses rejetées
process.on("unhandledRejection", (reason, promise) => {
  logger.error({
    message: "Promesse rejetée non gérée",
    reason: reason,
    promise: promise,
  });

  // Convertir les rejets de promesse non gérés en exceptions
  // ce qui permet de les capturer avec le gestionnaire uncaughtException
  throw reason;
});

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//   next();
// });

// Ajout des headers pour les requêtes (CORS)
const allowedOrigins = [
  "http://localhost:3000",
  "http://oresto.local",
  "http://localhost:8080",
  "https://oresto.io",
  "https://www.oresto.io"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`Origine refusée par CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
      "Expires",
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

// Démarrage de la database
require("./utils/database");

// Configuration passport et session
const passport = require("./utils/passport");
var session = require("express-session");

// Configuration Swagger
const swaggerOptions = require("./swagger.json");
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware de session
app.use(
  session({
    secret: Config.secret_cookie,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      domain:
        process.env.NODE_ENV === "production" ? ".railway.app" : undefined,
    },
  }),
);

// Initialisation passport
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json(), addLogger); // ✅ nickel
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/", routes);

// Gestionnaire d'erreurs global pour capturer toute erreur non gérée
app.use((err, req, res, next) => {
  if (!err) {
    return next();
  }

  // Si l'erreur n'est pas une APIError, la convertir
  if (!(err instanceof APIError)) {
    err = new APIError(
      err.message || "Une erreur inattendue s'est produite",
      err.statusCode || 500,
      err.type_error || "server_error",
      err.details || {},
    );
  }

  next(err);
});

// Gestionnaire d'erreurs
app.use(errorHandler);

// Démarrage du serveur avec gestion des erreurs de port déjà utilisé
const server = app.listen(Config.port, () => {
  logger.info(`Serveur démarré sur le port ${Config.port}`);
});

server.on("error", (e) => {
  logger.error(`Erreur du serveur: ${e.message}`);
  process.exit(1);
});

module.exports = app;
