const Restaurant = require("../schemas/Restaurant");
const { APIError } = require("./errorHandler");

const validateRestaurant = async (req, res, next) => {
  try {
    const restaurantId = req.body.restaurant_id;
    console.log("=== Middleware validateRestaurant ===");
    console.log("restaurant_id reçu dans le body:", restaurantId);

    if (!restaurantId) {
      throw new APIError(
        "L'identifiant du restaurant est requis",
        400,
        "validation_error",
      );
    }

    const restaurant = await Restaurant.findById(restaurantId);
    console.log("Restaurant trouvé:", restaurant ? "✅" : "❌");

    if (restaurant) {
      console.log("ID du restaurant:", restaurant._id);
      console.log("Nom du restaurant:", restaurant.name);
      console.log("Statut actif:", restaurant.is_active ? "✅" : "❌");
    }

    if (!restaurant) {
      throw new APIError("Restaurant non trouvé", 404, "not_found_error");
    }

    if (!restaurant.is_active) {
      throw new APIError(
        "Ce restaurant n'accepte pas les réservations actuellement",
        403,
        "restaurant_inactive",
      );
    }

    // Vérification si nous sommes en mode développement
    const isDevelopment =
      process.env.NODE_ENV === "development" ||
      !process.env.NODE_ENV ||
      req.headers["x-development-mode"] === "true";

    console.log("Mode développement détecté:", isDevelopment ? "✅" : "❌");

    // Vérification du domaine autorisé
    const referer = req.headers.referer;
    console.log("Referer:", referer);

    // Ne pas vérifier le domaine en mode développement local ou avec l'en-tête de développement
    if (referer && !isDevelopment) {
      const hostname = new URL(referer).hostname;
      const isLocalhost =
        hostname === "localhost" || hostname.startsWith("localhost:");

      // Si c'est localhost en mode développement, on autorise
      if (isLocalhost && isDevelopment) {
        console.log("Domaine localhost autorisé en mode développement");
      }
      // Sinon on vérifie les domaines autorisés
      else if (
        !isLocalhost &&
        restaurant.authorized_domains &&
        restaurant.authorized_domains.length > 0 &&
        !restaurant.authorized_domains.includes(hostname)
      ) {
        console.log(`Domaine non autorisé: ${hostname}`);
        console.log(
          `Domaines autorisés: ${restaurant.authorized_domains.join(", ")}`,
        );
        throw new APIError(
          "Domaine non autorisé pour ce restaurant",
          403,
          "unauthorized_domain",
        );
      }
    } else if (!referer && !isDevelopment) {
      // Si pas de referer en production, c'est suspect
      console.log("Aucun referer détecté en production");
      throw new APIError(
        "Origine de la requête non identifiable",
        403,
        "missing_referer",
      );
    }

    // Ajouter le restaurant aux données de la requête
    req.restaurant = restaurant;
    console.log("✅ Restaurant validé et ajouté à req.restaurant");
    next();
  } catch (error) {
    if (error instanceof APIError) {
      next(error);
    } else {
      next(
        new APIError(
          "Erreur lors de la validation du restaurant",
          500,
          "server_error",
          { originalError: error.message },
        ),
      );
    }
  }
};

module.exports = validateRestaurant;
