const RestaurantService = require('../services/RestaurantService')

// La fonction permet d'ajouter un restaurant.
module.exports.addOneRestaurant = function(req, res) {
  req.log.info("Création d'un restaurant");
  if (req.user.role !== 'manager') {
    return res.status(403).send({ 
      msg: "Vous n'êtes pas autorisé à créer une table.",
      type_error: "not-authorized"
    });
  }
  var options = { user: req.user };
  RestaurantService.addOneRestaurant(req.body, options, function(err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    }
    else if (err && err.type_error == "validator") {
      res.statusCode = 405;
      res.send(err);
    }
    else if (err && err.type_error == "duplicate") {
      res.statusCode = 405;
      res.send(err);
    }
    else if (err && err.type_error == "unauthorized") {
      res.statusCode = 401;
      res.send(err);
    } else {
      res.statusCode = 201;
      res.send(value);
    }
  });
};

// La fonction permet d'ajouter plusieurs restaurants.
module.exports.addManyRestaurants = function(req, res) {
  req.log.info("Création de plusieurs restaurants")

    // Vérifier le rôle de l'utilisateur
    if (req.user.role !== 'manager') {
      return res.status(403).send({ 
        msg: "Vous n'êtes pas autorisé à créer une entreprise.",
        type_error: "not-authorized"
      });
    }
  
  var options = { user: req.user };  
  RestaurantService.addManyRestaurants(req.body,options, function(err, value) {
    if (err) {
      res.statusCode = 405
      res.send(err)
    }
    else {
      res.statusCode = 201
      res.send(value)
    }
  })
}

// La fonction permet de rechercher un restaurant.
module.exports.findOneRestaurant = function(req, res) {
  req.log.info("Chercher un restaurant")
  let restaurantFields = req.query.fields
  if (restaurantFields && !Array.isArray(restaurantFields))
    restaurantFields = [restaurantFields]
  var opts = { populate: req.query.populate }
  RestaurantService.findOneRestaurant(restaurantFields, req.query.value, opts, function(err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404
      res.send(err)
    }
    else if (err && err.type_error == "no-valid") {
      res.statusCode = 405
      res.send(err)
    }
    else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500
      res.send(err)
    }
    else {
      res.statusCode = 200
      res.send(value)
    }
  })
}

// La fonction permet de rechercher plusieurs restaurants.
module.exports.findManyRestaurants = function(req, res) {
  req.log.info("Chercher plusieurs restaurants")
  let page = req.query.page
  let pageSize = req.query.pageSize
  let search = req.query.q
  var opts = { populate: req.query.populate }
  RestaurantService.findManyRestaurants(search, page, pageSize, opts, function(err, value) {
    if (err && err.type_error == "no-valid") {
      res.statusCode = 405
      res.send(err)
    }
    else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500
      res.send(err)
    }
    else {
      res.statusCode = 200
      res.send(value)
    }
  })
}

// La fonction permet de chercher un restaurant par son id.
module.exports.findOneRestaurantById = function (req, res) {
  req.log.info("Recherche d'un restaurant par son id");
  
  // Correction de la récupération de l'id
  const restaurant_id = req.params.sid; 
  
  RestaurantService.findOneRestaurantById(restaurant_id, null, function (err, value) {
    if (err && err.type_error === "no-found") {
      res.status(404).json(err); // Utilisation de res.json pour renvoyer un objet JSON
    } else if (err && err.type_error === "no-valid") {
      res.status(405).json(err);
    } else if (err && err.type_error === "error-mongo") {
      res.status(500).json(err);
    } else {
      res.status(200).json(value);
    }
  });
};

// La fonction permet de trouver plusieurs restaurants par leur id.
module.exports.findManyRestaurantsById = function(req, res) {
  req.log.info("Chercher plusieurs restaurants")
  let restaurantId = req.query.id;
  if (restaurantId && !Array.isArray(restaurantId))
    restaurantId = [restaurantId]
  var opts = {populate: req.query.populate}
  RestaurantService.findManyRestaurantsById(restaurantId, opts, function(err, value) {
    if (err && err.type_error === "no-found") {
      res.statusCode = 404
      res.send(err)
    } 
    else if (err && err.type_error == "no-valid") {
      res.statusCode = 405
      res.send(err)
    }
    else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500
      res.send(err)
    }
    else {
      res.statusCode = 200
      res.send(value)
    }
  });
};

// La fonction permet de supprimer un restaurant.
module.exports.deleteOneRestaurant = function(req, res) {
  req.log.info("Suppression d'un restaurant")
  RestaurantService.deleteOneRestaurant(req.params.id,null, function(err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404
      res.send(err)
    }
    else if (err && err.type_error == "no-valid") {
      res.statusCode = 405
      res.send(err)
    }
    else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500
      res.send(err)
    }
    else {
      res.statusCode = 200
      res.send(value)
    }
  })
}

// La fonction permet de supprimer plusieurs restaurants.
module.exports.deleteManyRestaurants = function(req, res) {
  req.log.info("Suppresssion de plusieurs restaurants")
  let restaurantId = req.query.id;
  if (restaurantId && !Array.isArray(restaurantId))
    restaurantId = [restaurantId]

  RestaurantService.deleteManyRestaurants(restaurantId,null, function(err, value) {
    if (err && err.type_error === "no-found") {
      res.statusCode = 404
      res.send(err)
    } 
    else if (err && err.type_error == "no-valid") {
      res.statusCode = 405
      res.send(err)
    }
    else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500
      res.send(err)
    }
    else {
      res.statusCode = 200
      res.send(value)
    }
  });
};

// La fonction permet de modifier un restaurant.
module.exports.updateOneRestaurant = function(req, res) {
  req.log.info("Modification d'un restaurant")

  RestaurantService.updateOneRestaurant(req.params.id, req.body,null, function(err, value) {

    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && (err.type_error == "no-valid" || err.type_error == "validator" || err.type_error == "duplicate")) {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    }else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de modifier plusieurs restaurants.
module.exports.updateManyRestaurants = function(req, res) {
  req.log.info("Modification de plusieurs restaurants")
  let restaurantId = req.query.id;
  if (restaurantId && !Array.isArray(restaurantId))
    restaurantId = [restaurantId]

  const updateData = req.body;

  RestaurantService.updateManyRestaurants(restaurantId, updateData,null, function(err, value) {
    if (err && err.type_error === "no-found") {
      res.statusCode = 404
      res.send(err)
    } 
    else if (err && (err.type_error == "no-valid" || err.type_error == "validator" || err.type_error == "duplicate")) {
      res.statusCode = 405
      res.send(err)
    }
    else if (err && err.type_error == "duplicate") {
      res.statusCode = 405
      res.send(err)
    }
    else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500
      res.send(err)
    }
    else {
      res.statusCode = 200
      res.send(value)
    }
  });
}
  