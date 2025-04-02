const UserService = require('../../services/UserService')
const RestaurantService = require('../../services/RestaurantService')
const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const server = require('../../server')
const should = chai.should()
const _ = require('lodash')
const Table = require('../../schemas/Table')

let user = null
let token = ""
const tables_valid = []
const tables_id = []

// Création d'un manager fictif
it("Création d'un manager fictif", (done) => {
    let manager = {
        firstname: "Manager2",
        lastname: "Restaurant",
        email: "manager2@oresto.fr",
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

describe("POST - /login", () => {
    it("Connexion utilisateur - S", (done) => {
        chai.request(server).post('/login').send({
            email: "manager2@oresto.fr",
            password: "azerty",
        }).end((err, res) => {
            res.should.have.status(200)
            token = res.body.token
            // console.log("token : ", token)
            done()    
        })
    })
})

chai.use(chaiHttp)

// Tests de la fonction pour l'ajout d'une table

describe("POST - /add_table", () => {
    it("Ajouter une table - S", (done) => {
        chai.request(server).post('/add_table').send({
            table_number: "123B",
            table_size: 6,
            shape: "rectangle",
        })
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            expect(res).to.have.status(201)
            tables_valid.push(res.body)    
            tables_id.push(res.body._id)
            // console.log(res.body)
            done()
        });
    }),
    it("Ajouter une table - E (Unauthorized)", (done) => {
        chai.request(server).post('/add_table').send({
            table_number: "123B",
            table_size: 6,
        })
        .end((err, res) => {
            expect(res).to.have.status(401)
            tables_valid.push(res.body)
            done()
        });
    }),
    it("Ajouter une table incorrecte. (Sans table_number) - E", (done) => {
        chai.request(server).post('/add_table').send({
            table_size: 2,
            shape: "square",
        })
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter une table incorrecte. (Avec un champ requis vide) - E", (done) => {
        chai.request(server).post('/add_table').send({
            table_number: "",
            table_size: 2,
            shape: "square",
        })
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

// Tests de la fonction pour l'ajout de plusieurs tables

describe("POST - /add_tables", () => {
    it("Ajout de plusieurs tables. - S", (done) => {
      chai.request(server).post('/add_tables').send([
        { table_number: "T2", table_size: 4, shape: "square" },
        { table_number: "T3", table_size: 6, shape: "rectangle" },
        { table_number: "T4", table_size: 8, shape: "rectangle" }
    ])
      .auth(token, { type: 'bearer' }) 
      .end((err, res) => {
        res.should.have.status(201)
        tables_valid.push(res.body);
        tables_id.push(_.map(tables_valid._id))
        done()
      })
    })
    it("Ajout de plusieurs tables - E (Unauthorized)", (done) => {
        chai.request(server).post('/add_tables').send([       
            { table_number: "T2", table_size: 4, shape: "square" },
            { table_number: "T3", table_size: 6, shape: "rectangle" },
            { table_number: "T4", table_size: 8, shape: "rectangle" }])
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
      })
    it("Ajout de plusieurs tables incorrectes (sans table_number). - E", (done) => {
      chai.request(server).post('/add_tables').send([
        { table_size: 4, shape: "square" },
        { table_size: 6, shape: "rectangle" },
        { table_size: 8, shape: "rectangle" }
      ])
      .auth(token, { type: 'bearer' }) 
      .end((err, res) => {
        res.should.have.status(405)
        done()
      })
    })
    it("Ajouter de plusieurs tables vides (Avec un champs requis vide). - E", (done) => {
      chai.request(server).post('/add_tables').send([
        { table_number: "T2", table_size: "", shape: "square" },
        { table_number: "", table_size: 6, shape: "rectangle" },
        { table_number: "T4", table_size: 8, shape: "" }
      ])
    .auth(token, { type: 'bearer' }) 
    .end((err, res) => {
          expect(res).to.have.status(405)
          done()
      })
  })
  })

// Fonction pour la récupération des tables (avec champs)

describe("GET - /tables_by_filters", () => {
    it("Rechercher plusieurs tables avec filtres. - S", (done) => {
        chai.request(server).get('/tables_by_filters').query({ page: 1, pageSize: 4})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            done()
        })
    })
    it("Rechercher plusieurs tables avec query vide. - S", (done) => {
        chai.request(server).get('/tables_by_filters').query({ page: 1, pageSize: 4})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            expect(res.body.count).to.be.equal(4)
            done()
        })
    })
    it("Rechercher plusieurs tables avec une chaîne de caractère dans page - E", (done) => {
        chai.request(server).get('/tables_by_filters').query({ page: 'salut les gens', pageSize: 2})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

// Fonction pour la récupération des tables (avec champs)

describe("GET - /find_tables", () => {
    it("Rechercher plusieurs tables par ID. - S", (done) => {
        chai.request(server).get('/find_tables').query({id: _.map(tables_valid, '_id')})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
             res.should.have.status(200);
            //  expect(value).to.be.an('array');
           // console.log(err)
           // console.log(res.body)
            // console.log( _.map(tables, '_id'))
            done();
        });
    });

    it("Rechercher plusieurs tables incorrectes (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/find_tables').query({id: '665f18739d3e172be5daf092'})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });

    it("Rechercher plusieurs tables incorrectes (avec un id invalide). - E", (done) => {
        chai.request(server).get('/find_tables').query({id: '123,456'})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
});

describe("PUT - /update_table/:id", () => {
    it("Modifier une table. - S", (done) => {
        chai.request(server).put('/update_table/' + tables_valid[0]._id)
        .auth(token, { type: 'bearer' }) 
        .send({table_number: 32})
        .end((err, res) => {
             res.should.have.status(200)
            done()
        })
    })
    it("Modifier une table incorrecte (avec un id inexistant). - E", (done) => {
        chai.request(server).put('/update_table/' + '665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .send({table_size: 4})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Modifier une table incorrecte (avec un id invalide). - E", (done) => {
        chai.request(server).put('/update_table' + 'ds65dq6s5d6qs5sqds65d')
        .auth(token, { type: 'bearer' }) 
        .send({shape: 'rectangle'})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Modifier une table avec un champ vide. - E", (done) => {
        chai.request(server).put('/update_table/' + tables_valid[0]._id)
        .auth(token, { type: 'bearer' }) 
        .send({table_number: ''})
        .end((err, res) => {
            res.should.have.status(405)
            // console.log(res.body)
            // console.log(tables[0]._id)
            done()
        })
    })    
})

describe("PUT - /update_tables", () => {
    it("Modifier plusieurs tables. - S", (done) => {
        chai.request(server).put('/update_tables').query({id: _.map(tables_valid, '_id')})
        .auth(token, { type: 'bearer' }) 
        .send({table_size: 2})
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Modifier plusieurs tables incorrectes (avec un id inexistant). - E", (done) => {
        chai.request(server).put('/update_tables').query({id: ['667980900166578fd4b6b32b', '667980a00166578fd4b6b32c']})
        .auth(token, { type: 'bearer' }) 
        .send({shape: 'square'})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Modifier plusieurs tables incorrectes (avec un id invalide). - E", (done) => {
        chai.request(server).put('/update_tables/').query({id: ['123', '456']})
        .auth(token, { type: 'bearer' }) 
        .send({shape: 'rounded'})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Modifier plusieurs tables incorrectes (sans renseigner l'id). - E", (done) => {
        chai.request(server).put('/update_tables').query({id: []})
        .auth(token, { type: 'bearer' }) 
        .send({table_number: '42'})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Modifier plusieurs tables avec un champ vide. - E", (done) => {
        chai.request(server).put('/update_tables').query({id: _.map(tables_valid, '_id')})
        .auth(token, { type: 'bearer' }) 
        .send({table_size: ""})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

describe("DELETE - /delete_table/:id", () => {
    it("Supprimer une table. - S", (done) => {
        chai.request(server).delete('/delete_table/' + tables_valid[0]._id)
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Supprimer une table incorrecte (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/delete_table/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Supprimer une table incorrecte (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/delete_table/' + '123')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

describe("DELETE - /delete_tables", () => {
    it("Supprimer plusieurs tables. - S", (done) => {
        chai.request(server).delete('/delete_tables').query({id: _.map(tables_id, '_id')})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            // res.should.have.status(200)
            // console.log(tables_id)
            done()
        })
    })
    it("Supprimer plusieurs tables incorrectes (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/delete_tables').query({id: ['123', '456']})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Supprimer le manager fictif", (done) => {
        UserService.deleteOneUser(user,null, function (err, value) {
            done()
        })
    })
})