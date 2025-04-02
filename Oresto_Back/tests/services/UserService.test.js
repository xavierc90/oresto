const UserService = require('../../services/UserService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')
let id_user_valid = ""
var tab_id_users = []
var users = []

// TEST - Service pour ajouter un utilisteur (tous les roles)
describe("addOneUser", () => {
    it("Utilisateur correct. - S", (done) => {
        var user = {
            firstname: "Bernard",
            lastname: "Dupont",
            email: "test@gmail.com",
            password: "123456",
            phone_number: "1234567890"
        }
        UserService.addOneUser(user, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id');
            expect(value).to.haveOwnProperty('email');
            id_user_valid = String(value._id)
            users.push(value)
            // console.log(err)
            // console.log(value)
            done()
        })
    })
    it("Utilisateur incorrect. (Sans email) - E", (done) => {
        var user_no_valid = {
            firstname: "BernardDupont",
            lastname: "test",
            phone_number: "1234567890",
            password: "123456"
        }
        UserService.addOneUser(user_no_valid, null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('email')
            expect(err['fields']['email']).to.equal('Path `email` is required.')
            done()
        })
    })
    it("Utilisateur incorrect. (Avec un email déjà utilisé) - E", (done) => {
        let user_no_valid = {
            lastname: "Bernard",
            firstname: "dDupont",
            email: "test@gmail.com",
            password: "123456",
            phone_number: 123456789
        }
        UserService.addOneUser(user_no_valid, null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('email')
           expect(err['fields']['email']).to.equal('The email is already taken.')
           expect(err['msg']).to.equal('Duplicate key error: email must be unique.')
        // console.log(err)    
        done()
        })
    })
})

// TEST - Service pour ajouter plusieurs utilisateurs (tous les roles)
describe("addManyUsers", () => {
    it("Utilisateurs à ajouter, non valide. - E", (done) => {
        var users_tab_error = [{
            email: "bernard.dupont3@gmail.com",
            password: "123456"
        }, {
            email: "bernard.dupont4@gmail.com",
            password: "123456"
        },
        {
            email: "bernard.dupon5t@gmail.com",
            password: "123456"
        }, {
            email: "bernard.dupont6@gmail.com"
        }]

        UserService.addManyUsers(users_tab_error, null, function (err, value) {
            done()
        })
    })
    it("Utilisateurs à ajouter, valide. - S", (done) => {
        var users_tab = [{
            firstname: "Julien",
            lastname: "Dupont",
            email: "alex.porteron1@gmail.com",
            phone_number: 1234567890,
            password: "topsecret"
        }, {
            firstname: "Julien",
            lastname: "Dupont",
            email: "mat.boi1@gmail.com",
            phone_number: 1234567890,
            password: "chouchou"
        },
        {
            firstname: "Julien",
            lastname: "Dupont",
            email: "lut.us1@gmail.com",
            phone_number: 1234567890,
            password: "enfant"
        }]
        UserService.addManyUsers(users_tab, null, function (err, value) {
            tab_id_users = _.map(value, '_id')
            users_tab = [...value, ...users]
           // id_user_valid = value._id
            expect(value).lengthOf(3)
            done()
        })
    })
})

// TEST - Service pour rechercher un utilisteur (tous les roles)
describe("findOneUser", () => {
    it("Chercher un utilisateur par les champs selectionnées. - S", (done) => {
        UserService.findOneUser(["email"], users[0].email, null, function (err, value) {
            expect(value).to.haveOwnProperty('email')
            done()

        })
    })
    it("Chercher un utilisateur avec un champ non autorisé. - E", (done) => {
        UserService.findOneUser(["email", "firstname"], users[0].email, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error')
            done()
        })
    })
    it("Chercher un utilisateur sans tableau de champ. - E", (done) => {
        UserService.findOneUser("email", users[0].email, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error')
            done()
        })
    })
    it("Chercher un utilisateur inexistant. - E", (done) => {
        UserService.findOneUser(["email"], "users[0].email", null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error')
            done()
        })
    })
})

// TEST - Service pour rechercher un utilisteur avec son id (tous les roles)
describe("findOneUserById", () => {
    it("Chercher un utilisateur existant correct. - S", (done) => {
        UserService.findOneUserById(id_user_valid, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('email')
            done()
        })
    })
    it("Chercher un utilisateur non-existant correct. - E", (done) => {
        UserService.findOneUserById("100", null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err["type_error"]).to.equal('no-valid')
            done()
        })
    })
})
describe("findManyUsers", () => {
    it("Retourne 4 utilisateurs - S", (done) => {
        UserService.findManyUsers(null, 3, 1, function (err, value) {
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(4)
            expect(value["results"]).lengthOf(1)
            expect(err).to.be.null
            done()
        })
    })
    it("Envoie d'une chaine de caractère a la place de la page - E", (done) => {
        UserService.findManyUsers(null, "coucou", 3, function (err, value) {
            expect(err).to.haveOwnProperty("type_error")
            expect(err["type_error"]).to.be.equal("no-valid")
            expect(value).to.undefined
            done()
        })
    })
})

// TEST - Service pour rechercher pusieurs utilisteurs avec le userId (tous les roles)
describe("findManyUsersById", () => {
    it("Chercher des utilisateurs existant correct. - S", (done) => {
        UserService.findManyUsersById(tab_id_users, null, function (err, value) {
            expect(value).lengthOf(3)
            done()

        })
    })
})

// TEST - Service pour modifier un utilisateur (tous les roles)
describe("updateOneUser", () => {
    it("Modifier un utilisateur correct. - S", (done) => {
        UserService.updateOneUser(id_user_valid, { email: "dragon3000", firstname: "cracheurdefeu" }, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('email')
            expect(value).to.haveOwnProperty('firstname')
            expect(value['email']).to.be.equal('dragon3000')
            done()

        })
    })
    it("Modifier un utilisateur avec id incorrect. - E", (done) => {
        UserService.updateOneUser("1200", { email: "Zensuni", name: "AlexandrePorteron" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Modifier un utilisateur avec des champs requis vide. - E", (done) => {
        UserService.updateOneUser(id_user_valid, { email: "", firstname: "AlexandrePorteron", phone_number: "0102030405" }, null, function (err, value) {
            expect(value).to.be.undefined
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('email')
            expect(err['fields']['email']).to.equal('Path `email` is required.')
            done()
        })
    })
})

// TEST - Service pour modifier plusieurs utilisateurs

describe("updateManyUsers", () => {
    it("Modifier plusieurs utilisateurs correctement. - S", (done) => {
        UserService.updateManyUsers(tab_id_users,  { firstname: "Jean", lastname: "Luc" },null, function (err, value) {
            expect(value).to.haveOwnProperty('modifiedCount')
            expect(value).to.haveOwnProperty('matchedCount')
            expect(value['matchedCount']).to.be.equal(tab_id_users.length)
            expect(value['modifiedCount']).to.be.equal(tab_id_users.length)
            done()

        })
    })
    it("Modifier plusieurs utilisateurs avec id incorrect. - E", (done) => {
        UserService.updateManyUsers("1200", { firstname: "Jean", lastname: "Luc" },null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Modifier plusieurs utilisateurs avec des champs requis vide. - E", (done) => {
        UserService.updateManyUsers(tab_id_users,  { firstname: "", lastname: "Luc" },null, function (err, value) {
            expect(value).to.be.undefined
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('firstname')
            expect(err['fields']['firstname']).to.equal('Path `firstname` is required.')
            done()
        })
    })
})


// TEST - Service pour supprimer un utilisateur (tous les roles)
describe("deleteOneUser", () => {
    it("Supprimer un utilisateur correct. - S", (done) => {
        UserService.deleteOneUser(id_user_valid, null, function (err, value) { 
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('email')
            expect(value).to.haveOwnProperty('email')
            done()

        })
    })
    it("Supprimer un utilisateur avec id incorrect. - E", (done) => {
        UserService.deleteOneUser("1200", null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Supprimer un utilisateur avec un id inexistant - E", (done) => {
        UserService.deleteOneUser("665f00c6f64f76ba59361e9f", null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-found')
            done()
        })
    })
})

// TEST - Service pour supprimer plusieurs utilisateurs (tous les roles)
describe("deleteManyUsers", () => {
    it("Supprimer plusieurs utilisateurs correctement. - S", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('deletedCount')
            expect(value['deletedCount']).is.equal(tab_id_users.length)
            done()

        })
    })
    it("Supprimer plusieurs utilisateurs avec id incorrect. - E", (done) => {
        UserService.deleteManyUsers("1200", null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
})