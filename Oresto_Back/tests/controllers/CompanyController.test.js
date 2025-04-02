const UserService = require('../../services/UserService')
const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const server = require('../../server')
const should = chai.should()
const _ = require('lodash')
const Table = require('../../schemas/Table')
let token = ""
var restaurant = []
var restaurants = []

let tab_id_users = []
let users = [
    {
        firstname: "Client 5",
        lastname: "Réservation",
        email:"client5@gmail.com",
        phone_number: "+33601020304",
        role: "manager",
        password: "azerty"
    },    
    {
        firstname: "Client 6",
        lastname: "Réservation",
        email:"client6@gmail.com",
        phone_number: "+33601020304",
        role: "manager",
        password: "azerty"
    },    
    {
        firstname: "Client 7",
        lastname: "Réservation",
        email:"client7@gmail.com",
        phone_number: "+33601020304",
        role: "manager",
        password: "azerty"
    },
    {
        firstname: "Client 8",
        lastname: "Client",
        email:"client8@gmail.com",
        phone_number: "+33601020304",
        role: "manager",
        password: "azerty"
    }
]

it("Création des utilisateurs fictifs", (done) => {
    UserService.addManyUsers(users, null, function (err, value) {
        tab_id_users = _.map(value, '_id')
        // console.log(tab_id_users)
        done()
    })
})

function rdm_user (tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length-1) )]
    return rdm_id
}

describe("POST - /login", () => {
    it("Connexion utilisateur - S", (done) => {
        chai.request(server).post('/login').send({
            email: "client5@gmail.com",
            password: "azerty",
        }).end((err, res) => {
            res.should.have.status(200)
            token = res.body.token
            done()    
        })
    })
})

chai.use(chaiHttp)

// Tests de la fonction pour l'ajout d'un restaurant

describe("POST - /add_restaurant", () => {
    it("Ajouter un restaurant - S", (done) => {
        chai.request(server).post('/add_restaurant').send({
            name: "La belle assiette",
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        })
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            expect(res).to.have.status(201)
            restaurant.push(res.body)
            
            // console.log(res.body)
            done()
        });
    }),
    it("Ajouter un restaurant - E (Unauthorized)", (done) => {
        chai.request(server).post('/add_restaurant').send({
            name: "La belle assiette",
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        })
        .end((err, res) => {
            expect(res).to.have.status(401)
            restaurant.push(res.body)
            done()
        });
    }),
    it("Ajouter un restaurant incorrect. (Sans name) - E", (done) => {
        chai.request(server).post('/add_restaurant').send({
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        })
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un restaurant incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/add_restaurant').send({
            name: "",
            address: "18 rue Hubert Metzger",
            postal_code: "90000",
            city: "Belfort",
            country: "France",
            phone_number: "+33601020304",
            email: "contact@labelleassiette.fr",
            user_id: rdm_user(tab_id_users)
        })
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

// Tests de la fonction pour l'ajout de plusieurs restaurants

describe("POST - /add_restaurants", () => {
    it("Ajout de plusieurs restaurants. - S", (done) => {
      chai.request(server).post('/add_restaurants').send([{
        user_id: rdm_user(tab_id_users),
        name: "La gazelle d'or",
        address: "4, rue des 4 vents",
        postal_code: "90000",
        city: "Belfort",
        country: "France",
        phone_number: "+33601020304",
        email: "contact@lagazelledor.fr"
      },
      {
        user_id: rdm_user(tab_id_users),
        name: "Le Saint Christophe",
        address: "14 place d'Armes",
        postal_code: "90000",
        city: "Belfort",
        country: "France",
        phone_number: "+33601020304",
        email: "contact@restaurantstchristophe.fr"
      }])
      .auth(token, { type: 'bearer' }) 
      .end((err, res) => {
        res.should.have.status(201)
        restaurants = [...restaurants, ...res.body]
        done()
      })
    })
    it("Ajout de plusieurs restaurants. - E (Unauthorized)", (done) => {
        chai.request(server).post('/add_restaurants').send([{
          user_id: rdm_user(tab_id_users),
          name: "La gazelle d'or",
          address: "4, rue des 4 vents",
          postal_code: "90000",
          city: "Belfort",
          country: "France",
          phone_number: "+33601020304",
          email: "contact@lagazelledor.fr"
        },
        {
          user_id: rdm_user(tab_id_users),
          name: "Le Saint Christophe",
          address: "14 place d'Armes",
          postal_code: "90000",
          city: "Belfort",
          country: "France",
          phone_number: "+33601020304",
          email: "contact@restaurantstchristophe.fr"
        }])
        .end((err, res) => {
          res.should.have.status(401)
         // restaurants.push(res.body)
          
          done()
        })
      })
    it("Ajout de plusieurs restaurants incorrects (sans nom). - E", (done) => {
      chai.request(server).post('/add_restaurants').send([{
        user_id: rdm_user(tab_id_users),
        address: "4, rue des 4 vents",
        postal_code: "90000",
        city: "Belfort",
        country: "France",
        phone_number: "+33601020304",
        email: "contact@lagazelledor.fr"
      },
      {
        user_id: rdm_user(tab_id_users),
        address: "14 place d'Armes",
        postal_code: "90000",
        city: "Belfort",
        country: "France",
        phone_number: "+33601020304",
        email: "contact@restaurantstchristophe.fr"
      }])
      .auth(token, { type: 'bearer' }) 
      .end((err, res) => {
        res.should.have.status(405)
        done()
      })
    })
    it("Ajouter de plusieurs restaurants incorrects (Avec un champ vide). - E", (done) => {
      chai.request(server).post('/add_restaurants').send([{
        user_id: rdm_user(tab_id_users),
        name: "",
        address: "4, rue des 4 vents",
        postal_code: "90000",
        city: "Belfort",
        country: "France",
        phone_number: "+33601020304",
        email: "contact@lagazelledor.fr"
      },
      {
        user_id: rdm_user(tab_id_users),
        name: "",
        address: "14 place d'Armes",
        postal_code: "90000",
        city: "Belfort",
        country: "France",
        phone_number: "+33601020304",
        email: "contact@restaurantstchristophe.fr"
      }])
    .auth(token, { type: 'bearer' }) 
    .end((err, res) => {
          expect(res).to.have.status(405)
          done()
      })
  })
  })

// Fonction pour la récupération des restaurants (avec champs)

describe("GET - /restaurants_by_filters", () => {
    it("Rechercher plusieurs articles avec filtres. - S", (done) => {
        chai.request(server).get('/restaurants_by_filters').query({ page: 1, pageSize: 4})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            done()
        })
    })
    it("Rechercher plusieurs restaurants avec query vide. - S", (done) => {
        chai.request(server).get('/restaurants_by_filters').query({ page: 1, pageSize: 4})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            expect(res.body.count).to.be.equal(4)
            done()
        })
    })
    it("Rechercher plusieurs restaurants avec une chaîne de caractère dans page - E", (done) => {
        chai.request(server).get('/restaurants_by_filters').query({ page: 'salut les gens', pageSize: 2})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

// Fonction pour la récupération des restaurants (avec champs)

describe("GET - /find_restaurants", () => {
    it("Rechercher plusieurs restaurants par ID. - S", (done) => {
        chai.request(server).get('/find_restaurants').query({id: _.map(restaurants, '_id')})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
             res.should.have.status(200);
            //  expect(value).to.be.an('array');
           // console.log(err)
           // console.log(res.body)
            // console.log( _.map(restaurants, '_id'))
            done();
        });
    });

    it("Rechercher plusieurs restaurants incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/find_restaurants').query({id: '665f18739d3e172be5daf092'})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });

    it("Rechercher plusieurs restaurants incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).get('/find_restaurants').query({id: '123,456'})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
});

describe("PUT - /update_restaurant/:id", () => {
    it("Modifier un restaurant. - S", (done) => {
        chai.request(server).put('/update_restaurant/' + restaurants[0]._id)
        .auth(token, { type: 'bearer' }) 
        .send({name: 'Macbook Pro'})
        .end((err, res) => {
             res.should.have.status(200)
            done()
        })
    })
    it("Modifier un restaurant incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).put('/update_restaurant/' + '665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .send({name: 'Imprimante HP'})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Modifier un restaurant incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).put('/update_restaurant' + 'ds65dq6s5d6qs5sqds65d')
        .auth(token, { type: 'bearer' }) 
        .send({name: 'Restaurant test'})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Modifier un restaurant avec un champ vide. - E", (done) => {
        chai.request(server).put('/update_restaurant/' + restaurants[0]._id)
        .auth(token, { type: 'bearer' }) 
        .send({name: ''})
        .end((err, res) => {
            res.should.have.status(405)
            // console.log(res.body)
            // console.log(restaurants[0]._id)
            done()
        })
    })    
})

describe("PUT - /update_restaurants", () => {
    it("Modifier plusieurs articles. - S", (done) => {
        chai.request(server).put('/update_restaurants').query({id: _.map(restaurants, '_id')})
        .auth(token, { type: 'bearer' }) 
        .send({name: 'Je change de nom de restaurant'})
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Modifier plusieurs restaurants  incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).put('/update_restaurants').query({id: ['667980900166578fd4b6b32b', '667980a00166578fd4b6b32c']})
        .auth(token, { type: 'bearer' }) 
        .send({name: 'restaurants avec ID inexistant'})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Modifier plusieurs restaurants incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).put('/update_restaurants/').query({id: ['123', '456']})
        .auth(token, { type: 'bearer' }) 
        .send({name: 'restaurants avec ID invalide'})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Modifier plusieurs restaurants incorrects (sans renseigner l'id). - E", (done) => {
        chai.request(server).put('/update_restaurants').query({id: []})
        .auth(token, { type: 'bearer' }) 
        .send({name: 'Coca-Cola'})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Modifier plusieurs restaurants avec un champ vide. - E", (done) => {
        chai.request(server).put('/update_restaurants').query({id: _.map(restaurants, '_id')})
        .auth(token, { type: 'bearer' }) 
        .send({name: ''})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

describe("DELETE - /delete_restaurant/:id", () => {
    it("Supprimer un restaurant. - S", (done) => {
        chai.request(server).delete('/delete_restaurant/' + restaurants[0]._id)
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Supprimer un restaurant incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/delete_restaurant/665f18739d3e172be5daf092')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Supprimer un restaurant incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/delete_restaurant/' + '123')
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

describe("DELETE - /delete_restaurants", () => {
    it("Supprimer plusieurs restaurants. - S", (done) => {
        chai.request(server).delete('/delete_restaurants').query({id: _.map(restaurants, '_id')})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Supprimer plusieurs restaurants incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/delete_restaurants').query({id: ['123', '456']})
        .auth(token, { type: 'bearer' }) 
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Supprimer les utilisateurs fictifs", (done) => {
        UserService.deleteManyUsers(tab_id_users,null, function (err, value) {
            done()
        })
    })
})