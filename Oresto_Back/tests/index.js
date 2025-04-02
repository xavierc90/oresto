const mongoose = require('mongoose')

/* Connexion à la base de données */
require('../utils/database')


// Tests pour Users
describe("UserService", () => {
  require('./services/UserService.test')
})

// describe("UserController", () => {
//   require('./controllers/UserController.test')
// })

// Tests pour les restaurants (restaurants)

// describe("RestaurantService", () => {
//   require('./services/RestaurantService.test')
// })

// describe("RestaurantController", () => {
//   require('./controllers/RestaurantController.test')
// })

// Tests pour les tables

// describe("TableService", () => {
//   require('./services/TableService.test')
// })

// describe("TableController", () => {
//   require('./controllers/TableController.test')
// })

// Tests pour réservations

// describe("ReservationService", () => {
//   require('./services/ReservationService.test')
// })

// describe("ReservationController", () => {
//   require('./services/ReservationController.test')
// })

// Vider la base de données test

describe("API - Mongo", () => {
  it("Vider les dbs. - S", () => {
    if (process.env.npm_lifecycle_event == 'test')
      mongoose.connection.db.dropDatabase()
  })
})