const e = require('express');
const RestaurantService = require('../../services/RestaurantService')
const UserService = require('../../services/UserService')
const TableService = require('../../services/TableService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')

let user = null
const tables_valid = []
const tables_id = []

// Création d'un manager fictif
it("Création d'un manager fictif", (done) => {
    let manager = {
        firstname: "Manager",
        lastname: "Restaurant",
        email: "manager@oresto.fr",
        phone_number: "+33601020304",
        role: "manager",
        password: "azerty",
    };
    UserService.addOneUser(manager, null, (err, value) => {
        user_id = value._id
        user = value
        done()
    })
})

// Test pour la création d'un restaurant fictif
it("Création d'un restaurant fictif", (done) => {
    let restaurant = {
        user_id: user_id,
        name: "Restaurant test",
        address: "123 rue de Paris",
        postal_code: "75001",
        city: "Paris",
        country: "France",
    }
    RestaurantService.addOneRestaurant(restaurant, null, (err, value) => {
        restaurant = value
        user.restaurant = [value]
        done()
    })
})

// Test pour la création d'un table
describe("addOneTable", () => {
    it("Création d'une table - S.", (done) => {
    TableService.addOneTable({
        // user:user,
        // created_by: user_id,
        table_number: "T1",
        table_size: 4,
        shape: "rectangle",
    }, {user: user}, (err, value) => {
        tables_valid.push(value)
        tables_id.push(value._id)
        expect(value).to.be.a('object')
        expect(value).to.haveOwnProperty('_id')
        expect(value).to.haveOwnProperty('created_by')
        expect(value).to.haveOwnProperty('restaurant_id')
        expect(value).to.haveOwnProperty('table_number')
        expect(value).to.haveOwnProperty('table_size')
        expect(value).to.haveOwnProperty('shape')
        done();
    });
})
  it("Création d'une table sans table_number - E.", (done) => {
    TableService.addOneTable({
        table_size: 6,
        shape: "rectangle",
    }, {user: user}, (err, value) => {
        tables_valid.push(value);
        expect(err).to.be.a('object')
        expect(err).to.haveOwnProperty('msg')
        expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
        expect(err).to.haveOwnProperty('fields')
        expect(err['fields']).to.haveOwnProperty('table_number')
        expect(err['fields']['table_number']).to.equal('Path `table_number` is required.')
        // console.log(err)
        done();
    });
})
  it("Création d'une table sans table_size - E.", (done) => {
    TableService.addOneTable({
        table_number: "T2",
        shape: "rectangle",
    }, {user: user}, (err, value) => {
        tables_valid.push(value);
        expect(err).to.be.a('object')
        expect(err).to.haveOwnProperty('msg')
        expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
        expect(err).to.haveOwnProperty('fields')
        expect(err['fields']).to.haveOwnProperty('table_size')
        expect(err['fields']['table_size']).to.equal('Path `table_size` is required.')
        done();
    });
  })
  it("Création d'une table sans modèle (forme) - E.", (done) => {
    TableService.addOneTable({
        table_number: "7B",
        table_size: 6,
    }, {user: user}, (err, value) => {
        tables_valid.push(value);
        expect(err).to.be.a('object')
        expect(err).to.haveOwnProperty('msg')
        expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
        expect(err).to.haveOwnProperty('fields')
        expect(err['fields']).to.haveOwnProperty('shape')
        expect(err['fields']['shape']).to.equal('Path `shape` is required.')
        done();
    });
  })
})

// Test pour la création de plusieurs tables
describe("addManyTables", () => {
    it("Création de plusieurs tables - S", (done) => {
        const tables = [
            { table_number: "T2", table_size: 4, shape: "square" },
            { table_number: "T3", table_size: 6, shape: "rectangle" },
            { table_number: "T4", table_size: 8, shape: "rectangle" }
        ];
    TableService.addManyTables(tables, { user: user }, (err, value) => {
        expect(err).to.be.null
            expect(value).to.haveOwnProperty('length')
            value.forEach(table => {
                tables_valid.push(table);
                tables_id.push(table._id); // Ajouter l'identifiant dans tables_id
            });
            done();
        })
    })
    it("Création de plusieurs table avec champs manquant - E", (done) => {
        const tables = [
            { table_size: 4, shape: "square" },
            { table_number: "T3", shape: "rectangle" },
            { table_number: "T4", table_size: 8 }
              ];
        TableService.addManyTables(tables, { user: user }, (err, value) => {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('table_number')
            expect(err['fields']['table_number']).to.equal('Path `table_number` is required.')
            // console.log(err)
            done();
        })
    })
})

// Rechercher un restaurant par son id
describe("findOneTableById", () => {
    it("Chercher une table existante. - S", (done) => {
        TableService.findOneTableById(tables_valid[0]._id, null, (err, value) => {
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('table_number')
            done()
        })
    })
    it("Chercher une table non existante - E", (done) => {
        TableService.findOneTableById("100", null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err['msg']).to.equal('ObjectId non conforme.')
            expect(err).to.haveOwnProperty('type_error')
            expect(err["type_error"]).to.equal('no-valid')
            done()
        })
    })
})

// Rechercher plusieurs tables par id
describe("findManyTablesById", () => {
    it("Chercher des tables existantes par Id - S", (done) => {
        TableService.findManyTablesById(tables_id, null, function (err, value) {
            expect(value).lengthOf(4)
            done()
        })
    })
})

// Modification d'une table
describe("updateOneTable", () => {
    it("Modifier une table existante. - S", (done) => {
        TableService.updateOneTable(tables_valid[0]._id, { table_number: "99", table_size: "4" }, null, function (err, value) {
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('table_number')
            expect(value).to.haveOwnProperty('table_size')
            expect(value['table_number']).to.be.equal('99')
            expect(value['table_size']).to.be.equal(4)
            // console.log(tables_valid[0]._id)
            // console.log(value)
            // console.log(err)
            done()
        })
    })
    it("Modifier un restaurant avec id incorrect. - E", (done) => {
        TableService.updateOneTable("1200", { table_number: "22", shape: "round" }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Modifier un restaurant avec des champs requis vide. - E", (done) => {
        TableService.updateOneTable(tables_id[0], { table_number: "", table_size:"" }, null, function (err, value) {
            expect(value).to.be.undefined
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(2)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('table_number')
            expect(err['fields']['table_number']).to.equal('Path `table_number` is required.')
            expect(err['fields']).to.haveOwnProperty('table_size')
            expect(err['fields']['table_size']).to.equal('Path `table_size` is required.')
            done()
        })
    })
})

// Modifier plusieurs tables
describe("updateManyTables", () => {
    it("Modifier plusieurs tables existantes - S", (done) => {
        TableService.updateManyTables(tables_id, { table_size: 4, shape: "round" }, null, function (err, value) {
            expect(value).to.haveOwnProperty('modifiedCount')
            expect(value).to.haveOwnProperty('matchedCount')
            expect(value['matchedCount']).to.be.equal(4)
            expect(value['modifiedCount']).to.be.equal(4)
            done()
        })
    })
    it("Modifier plusieurs tables avec id incorrect. - E", (done) => {
        RestaurantService.updateManyRestaurants("1200", { shape: "rectangle", table_size: 4 }, null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Modifier plusieurs restaurants avec des champs requis vide. - E", (done) => {
        TableService.updateManyTables(tables_id, { shape: "", table_size: "" }, null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(2)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('shape')
            expect(err['fields']['shape']).to.equal('Path `shape` is required.')
            expect(err['fields']).to.haveOwnProperty('table_size')
            expect(err['fields']['table_size']).to.equal('Path `table_size` is required.')
            done()
        })
    })
})

// Supprimer une table
describe("deleteOneTable", () => {
    it("Supprimer une table existante. - S", (done) => {
        TableService.deleteOneTable(tables_id[0], null, function (err, value) {
            expect(value).to.be.a('object')
            expect(value).to.haveOwnProperty('_id')
            expect(value).to.haveOwnProperty('table_number')
            expect(value).to.haveOwnProperty('table_size')
            done()
        })
    })
    it("Supprimer un restauant avec id incorrect. - E", (done) => {
        TableService.deleteOneTable("1200", null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Supprimer une table avec un id inexistant. - E", (done) => {
        TableService.deleteOneTable("665f18739d3e172be5daf092", null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-found')
            done()
        })
    })
})

// Supprimer plusieurs tables
describe("deleteManyTables", () => {
    it("Supprimer plusieurs tables avec id incorrect. - E", (done) => {
        TableService.deleteManyTables("1200", null, function (err, value) {
            expect(err).to.be.a('object')
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-valid')
            done()
        })
    })
    it("Supprimer plusieurs tables correctement. - S", (done) => {
        TableService.deleteManyTables(tables_id, null, function (err, value) {
            expect(value).to.be.an('object');
            expect(value).to.have.property('deletedCount');
            expect(value.deletedCount).to.be.at.least(3);
            expect(value.deletedCount).to.be.at.most(tables_id.length);
            // console.log(value.deletedCount);
            done();
        });
    });
})

// Vérifier la suppression du manager fictif
describe("Supprimer du manager fictif", () => {
it("Supprimer le manager fictif", (done) => {
    UserService.deleteOneUser(user,null, function (err, value) {
    done()
    })
  })
})