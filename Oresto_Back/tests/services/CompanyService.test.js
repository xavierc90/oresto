const e = require('express');
const RestaurantService = require('../../services/RestaurantService')
const UserService = require('../../services/UserService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')
var id_restaurant_valid = ""
var tab_id_restaurants = []
var restaurants = []


let tab_id_users = []

// Création des utilisateurs fictifs
let users = [
    {
        firstname: "Client 1",
        lastname: "Réservation",
        email:"client1@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },    
    {
        firstname: "Client 2",
        lastname: "Réservation",
        email:"client2@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },
    {
        firstname: "Client 3",
        lastname: "Réservation",
        email:"client3@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },
    {
        firstname: "Client 4",
        lastname: "Client",
        email:"client4@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    }
]

// Test pour création des utilisateurs fictifs
it("Création des utilisateurs fictifs", (done) => {
    UserService.addManyUsers(users, null, function (err, value) {
        tab_id_users = _.map(value, '_id')
        // console.log(tab_id_users)
        done()
    })
})

// Fonction pour récupérer un user_id aléatoire
function rdm_user (tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length-1) )]
    return rdm_id
}

// Ajout d'un restaurant 
describe("addOneRestaurant", () => {
    it("Restaurant correct. - S", (done) => {
        var restaurant_valid = {
            name: "La belle assiette",
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        }
        RestaurantService.addOneRestaurant(restaurant_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('user_id')
            expect(value).to.haveOwnProperty('name')
            done()        
        })
    })
    it("Restaurant incorrect (Sans name). - E", (done) => {
        var restaurants_no_valid = {
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        }
        RestaurantService.addOneRestaurant(restaurants_no_valid, null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('name')
            expect(err['fields']['name']).to.equal('Path `name` is required.')
            // console.log(err)
            done()      
        })
    })
    it("Restaurant incorrect (Sans user_id). - E", (done) => {
        var restaurants_no_valid = {
            name: "La belle assiette",
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
        }
        RestaurantService.addOneRestaurant(restaurants_no_valid, null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('user_id')
            expect(err['fields']['user_id']).to.equal('Path `user_id` is required.')
            // console.log(err)
            done()      
        })
    })
})

// Ajout de plusieurs restaurants 

describe("addManyRestaurants", () => {
    it("Restaurants corrects. - S", (done) => {
        var restaurants_tab = [{
            name: "La gazelle d'or",
            address: "4, rue des 4 vents",
            postal_code: "90000",
            city: "Belfort",
            country: "Espagne",
            phone_number: "+33601020304",
            email: "contact@lagazelledor.fr",
            user_id: rdm_user(tab_id_users)
        },
        {
            name: "Le Saint Christophe",
            address: "14 place d'Armes",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@restaurantstchristophe.fr",
            user_id: rdm_user(tab_id_users)
        },
        {
            name: "Le Venezia",
            address: "3 rue Mercelin Barthelot",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@levenezia.fr",
            user_id: rdm_user(tab_id_users)
        }] 
        RestaurantService.addManyRestaurants(restaurants_tab, null, function (err, value) {
            tab_id_restaurants = _.map(value, '_id')
            id_restaurant_valid = tab_id_restaurants[1]
                restaurants = [...value, ...restaurants]
                expect(value).lengthOf(3)
                done()       
        })
    })
    it("Restaurants incorrects (sans nom). - E", (done) => {
        var restaurants_no_valid = [{
            address: "4, rue des 4 vents",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@lagazelledor.fr",
            user_id: rdm_user(tab_id_users)
        },
        {
            address: "14 place d'Armes",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@restaurantstchristophe.fr",
            user_id: rdm_user(tab_id_users)
        }]
        RestaurantService.addManyRestaurants(restaurants_no_valid, null, function (err, value) {
                done()       
        })
    })
    it("Restaurants incorrects (sans user_id). - E", (done) => {
        var restaurants_no_valid = [{
            name: "La gazelle d'or",
            address: "4, rue des 4 vents",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@lagazelledor.fr"
        },
        {
            name: "Le Saint Christophe",
            address: "14 place d'Armes",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@restaurantstchristophe.fr"
        }]
        RestaurantService.addManyRestaurants(restaurants_no_valid, null, function (err, value) {
            expect(err).to.be.an('Array').lengthOf(2)
            err.forEach((error) => {
                expect(error).to.have.property('fields_with_error').that.includes('user_id');
                expect(error).to.have.property('fields').that.has.property('user_id', 'Path `user_id` is required.');
            })
            done()
        })
    })
})

// Recherche d'un restaurant
describe("findOneRestaurant", () => {
    it("Chercher un restaurant par les champs séléctionnés. - S", (done) => {
        RestaurantService.findOneRestaurant(["name", "address"],  restaurants[0].name, null, function(err, value) {
            expect(value).to.haveOwnProperty('name')
            done()
        })
    })
    it("Chercher un restaurant avec un champ non autorisé. - E", (done) => {
        RestaurantService.findOneRestaurant(["email", "description"], restaurants[0].name, null, function(err, value) {
            expect(err).to.haveOwnProperty('type_error')
            done()
        })
    })
    it("Chercher un restaurant sans tableau de champs. - E", (done) => {
        RestaurantService.findOneRestaurant("name", restaurants[0].name, null, function(err, value) {
            expect(err).to.haveOwnProperty('type_error')
            done()
        })
    })
    it("Chercher un restaurant inexistant. - E", (done) => {
        RestaurantService.findOneRestaurant(["name"], "restaurant[0].restaurant", null, function(err, value) {
            expect(err).to.haveOwnProperty('type_error')
            done()
        })
    })
})

// Recherche de plusieurs restaurants 
describe("findManyRestaurants", () => {
    it("Retourne 3 restaurants sur les 4. - S", (done) => {
        RestaurantService.findManyRestaurants(null, 1, 3, null, function (err, value) {
            expect(value).to.haveOwnProperty('count')
            expect(value).to.haveOwnProperty('results')
            expect(value["count"]).to.equal(4)
            expect(value["results"]).lengthOf(3)
            expect(err).to.be.null
            // console.log(value)
            done()
        })
    })
    it("Envoie chaine de caractère sur page - E", (done) => {
        RestaurantService.findManyRestaurants(null, "coucou", 3, null,  function (err, value) {
            expect(err).to.haveOwnProperty('type_error')
            expect(err["type_error"]).to.equal('no-valid')
            expect(value).to.undefined
            done()
        })
    })
})

// Rechercher un restaurant par son id
describe("findOneRestaurantById", () => {
    it("Chercher un restaurant existant correct. - S", (done) => {
        RestaurantService.findOneRestaurantById(id_restaurant_valid, null, (err, value) => {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('name')
            // console.log(id_restaurant_valid)
            done()
        })
    })
    it("Chercher un restaurant non-existant - E", (done) => {
        RestaurantService.findOneRestaurantById("100", null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err["type_error"]).to.equal('no-valid')
            done()
        })
    })
})

// Rechercher plusieurs restaurants par id
describe("findManyRestaurantsById", () => {
    it("Chercher des restaurants existants corrects. - S", (done) => {
        RestaurantService.findManyRestaurantsById(tab_id_restaurants, null, function (err, value) {
            expect(value).lengthOf(3)
            done()
        })
    })
})

// Modification d'un restaurant
describe("updateOneRestaurant", () => {
    it("Modifier un restaurant correct. - S", (done) => {
        RestaurantService.updateOneRestaurant(id_restaurant_valid, { name: "Restaurant test", postal_code: "25000" }, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('name')
            expect(value).to.haveOwnProperty('postal_code')
            expect(value['name']).to.be.equal('Restaurant test')
            expect(value['postal_code']).to.be.equal('25000')
            // console.log(id_restaurant_valid)
            done()
        })
    })
    it("Modifier un restaurant avec id incorrect. - E", (done) => {
        RestaurantService.updateOneRestaurant("1200", { name: "La gazelle d'or", address: "4, rue des 4 vents" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Modifier un restaurant avec des champs requis vide. - E", (done) => {
        RestaurantService.updateOneRestaurant(id_restaurant_valid, { name: "", address: "23 rue du coteau" }, null, function (err, value) {
            expect(value).to.be.undefined
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('name')
            expect(err['fields']['name']).to.equal('Path `name` is required.')
            done()
        })
    })
})

// Modifier plusieurs restaurants
describe("updateManyRestaurants", () => {
    it("Modifier plusieurs restaurants correctement. - S", (done) => {
        RestaurantService.updateManyRestaurants(tab_id_restaurants, { name: "Restaurant pour test updateManyRestaurants", address: "18 rue du Général" }, null, function (err, value) {
            expect(value).to.haveOwnProperty('modifiedCount')
            expect(value).to.haveOwnProperty('matchedCount')
            expect(value['matchedCount']).to.be.equal(tab_id_restaurants.length)
            expect(value['modifiedCount']).to.be.equal(tab_id_restaurants.length)
            done()
        })
    })
    it("Modifier plusieurs restaurants avec id incorrect. - E", (done) => {
        RestaurantService.updateManyRestaurants("1200", { name: "Orangina", country: "Paris" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Modifier plusieurs restaurants avec des champs requis vide. - E", (done) => {
        RestaurantService.updateManyRestaurants(tab_id_restaurants, { name: "", country: "Italie" }, null, function (err, value) {
            expect(value).to.be.undefined
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('name')
            expect(err['fields']['name']).to.equal('Path `name` is required.')
            done()
        })
    })
})

// Supprimer un restaurant
describe("deleteOneRestaurant", () => {
    it("Supprimer un restaurant correct. - S", (done) => {
        RestaurantService.deleteOneRestaurant(id_restaurant_valid, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('name')
            expect(value).to.haveOwnProperty('city')
            done()
        })
    })
    it("Supprimer un restauant avec id incorrect. - E", (done) => {
        RestaurantService.deleteOneRestaurant("1200", null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Supprimer un restaurant avec un id inexistant. - E", (done) => {
        RestaurantService.deleteOneRestaurant("665f18739d3e172be5daf092", null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-found')
            done()
        })
    })
})

// Supprimer plusieurs restaurants
describe("deleteManyRestaurants", () => {
    it("Supprimer plusieurs restaurants avec id incorrect. - E", (done) => {
        RestaurantService.deleteManyRestaurants("1200", null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Supprimer plusieurs restaurants correctement. - S", (done) => {
        RestaurantService.deleteManyRestaurants(tab_id_restaurants, null, function (err, value) {
            expect(value).to.be.an('object');
            expect(value).to.have.property('deletedCount');
            expect(value.deletedCount).to.be.at.least(0);
            expect(value.deletedCount).to.be.at.most(tab_id_restaurants.length);
            // console.log(tab_id_restaurants);
            // console.log(tab_id_restaurants.length);
            // console.log(value.deletedCount);
            done();
        });
    });
})

// Vérifier la suppression des utilisateurs fictifs
it("Supprimer les utilisateurs fictifs", (done) => {
    UserService.deleteManyUsers(tab_id_users,null, function (err, value) {
        done()
    })
})