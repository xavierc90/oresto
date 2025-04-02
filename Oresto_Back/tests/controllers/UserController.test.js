const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const server = require('./../../server')
const should = chai.should()
const _ = require('lodash')
const passport = require('passport')
var users = []
var token = ""
chai.use(chaiHttp)


// TEST CONTROLLER - Ajouter un utilisateur

describe("POST - /register", () => {
    it("Ajouter un utilisateur . - S", (done) => {
        chai.request(server).post('/register').send({
            firstname: "Test",
            lastname: "Test",
            email: "testeur@gmail.com",
            password: "azerty",
            phone_number: "1234567890"
        }).end((err, res) => {
            expect(res).to.have.status(201)
            users.push(res.body)
            done()
        });
    })
    it("Ajouter un utilisateur incorrect. (Sans firstname) - E", (done) => {
        chai.request(server).post('/register').send({
            lastname: 'Us',
            email: 'lutfu.us@gmil.com',
            phone_number: "1234567890",
            password: "azerty"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec email déjà existant) - E", (done) => {
        chai.request(server).post('/register').send({
            firstname: "luf",
            lastname: "Us",
            email: "testeur@gmail.com",
            phone_number: "1234567890",
            password: "azerty"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/register').send({
            firstname: "luffu",
            lastname: "",
            email: "lufu.us@gmai.com",
            phone_number: "1234567890",
            password: "azerty"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})


// TEST CONTROLLER - Connecter un utilisateur

describe("POST - /login", () => {
    it("Connexion utilisateur - S", (done) => {
        // console.log(users)
        chai.request(server).post('/login').send({
            email: "testeur@gmail.com",
            password: "azerty"
        }).end((err, res) => {
            res.should.have.status(200)
            token = res.body.token
            done()
        })
    })
    it("Connexion utilisateur - Identifiant incorrect - E", (done) => {
        chai.request(server).post('/login').send({
            email: "email_incorrect",
            password: "azerty"
        }).end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Connexion utilisateur - Mot de passe incorrect - E", (done) => {
        chai.request(server).post('/login').send({
            email: "testeur@gmail.com",
            password: "password_incorrect"
        }).end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})


// TESTS CONTROLLER - Ajouter un manager

describe("POST - /register_manager", () => {
    it("Ajouter un manager . - S", (done) => {
        chai.request(server).post('/register_manager').send({
            firstname: "The",
            lastname: "Manager",
            email: "themanager@gmail.com",
            password: "azerty",
            phone_number: "1234567890"
        }).end((err, res) => {
            expect(res).to.have.status(201)
            users.push(res.body)
            done()
        });
    })
})

// TESTS CONTROLLER - Connecter un manager

describe("POST - /login_manager", () => {
    it("Connecter un manager . - S", (done) => {
        chai.request(server).post('/login_manager').send({
            email: "themanager@gmail.com",
            password: "azerty",
        })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            });
    });
    it("Connecter un user sans role manager . - E", (done) => {
        chai.request(server).post('/login_manager').send({
            email: "testeur@gmail.com",
            password: "azerty",
        }).end((err, res) => {
            expect(res).to.have.status(403);
            done();
        });
    })
})

// TEST CONTROLLER - Ajouter plusieurs utilisateurs 

describe("POST - /add_users", () => {
    it("Ajout de plusieurs utilisateurs. - S", (done) => {
        chai.request(server).post('/add_users')
            .send([{
                firstname: "Second",
                lastname: "User",
                email: "seconduser@test.fr",
                phone_number: "1234567890",
                password: "mdpmdp"
            },
            {
                firstname: "Third",
                lastname: "User",
                email: "thirduser@test.fr",
                phone_number: "1234567890",
                password: "azerty"
            }])
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(200)
                users = [...users, ...res.body]
                done()
            })
    })
    it("Ajout de plusieurs utilisateurs. - E (Unauthorized)", (done) => {
        chai.request(server).post('/add_users')
            .send([{
                firstname: "Edouard",
                lastname: "BERNIER",
                email: "edouard.bernierrr@155.fr",
                phone_number: "1234567890",
                password: "azerty"
            },
            {
                firstname: "Edouard",
                lastname: "BERNIER",
                email: "edouard.bernier5455@155.fr",
                phone_number: "1234567890",
                password: "azerty"
            }])
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })
    it("Ajout de plusieurs utilisateurs incorrects (sans firstname). - E", (done) => {
        chai.request(server).post('/add_users').send([{
            firstname: "",
            lastname: "BERNIER",
            email: "edouard.bernier546@155.fr",
            phone_number: "1234567890",
            password: "azerty"
        },
        {
            firstname: "",
            lastname: "BERNIER",
            email: "edouard.bernie6@155.fr",
            phone_number: "1234567890",
            password: "azerty"
        }])
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Ajout de plusieurs utilisateurs incorrects (avec un email existant). - E", (done) => {
        chai.request(server).post('/add_users').send([{
            firstname: "First",
            lastname: "User",
            email: "testeur@gmail.com",
            phone_number: "1234567890",
            password: "azerty"
        },
        {
            firstname: "Edouard",
            lastname: "BERNIER",
            email: "seconduser@test.fr",
            phone_number: "1234567890",
            password: "azerty"
        }])
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Ajouter de plusieurs utilisateurs incorrects (Avec un champ vide). - E", (done) => {
        chai.request(server).post('/add_users')
            .send([{
                firstname: "jesuisunprenom",
                lastname: "jesuisunnom",
                email: "uneadresse@mail.fr",
                phone_number: 1234567890,
                password: ""
            },
            {
                firstname: "Mathou",
                lastname: "",
                email: "lufu.us@gmailop.com",
                phone_number: "1234567890",
                password: "azerty"
            }])
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                expect(res).to.have.status(405)
                done()
            })
    })
})

// TEST CONTROLLER - Trouver un utilisateur

describe("GET - /find_user", () => {
    it("Rechercher un utilisateur avec un champ valide. - S", (done) => {
        chai.request(server).get('/find_user').query({ fields: ['email'], value: users[0].email })
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("Rechercher un utilisateur avec un champ valide. - E (Unauthorized)", (done) => {
        chai.request(server).get('/find_user').query({ fields: ['email'], value: users[0].email })
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })
    it("Rechercher un utilisateur inexistant. - E", (done) => {
        chai.request(server).get('/find_user').query({ fields: ['email'], value: 'lutfu4846844' })
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Rechercher un utilisateur avec un champ non autorisé. - E", (done) => {
        chai.request(server).get('/find_user').query({ fields: ['firstname'], value: 'lutfu4846844' })
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Rechercher un utilisateur avec un champ vide. - E", (done) => {
        chai.request(server).get('/find_user').query({ fields: ['email'], value: '' })
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Rechercher un utilisateur sans query. - E", (done) => {
        chai.request(server).get('/find_user')
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })

})

// TEST CONTROLLER - Trouver un utilisateur par son ID

describe("GET - /find_user/:id", () => {
    it("Rechercher un utilisateur avec son id. - S", (done) => {
        chai.request(server).get('/find_user/' + users[0]._id)
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("Rechercher un utilisateur avec son id. - E (Unauthorized)", (done) => {
        chai.request(server).get('/find_user/' + users[0]._id)
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })
    it("Rechercher un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/find_user/665f18739d3e172be5daf092')
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Rechercher un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).get('/find_user/123')
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})

// TEST CONTROLLER - Trouver plusieurs utilisateurs

describe("GET - /find_users", () => {
    it("Rechercher plusieurs utilisateurs par ID. - S", (done) => {
        chai.request(server).get('/find_users').query({ id: _.map(users, '_id') })
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("Rechercher plusieurs utilisateurs par ID. - E (Unauthorized)", (done) => {
        chai.request(server).get('/find_users').query({ id: _.map(users, '_id') })
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })
    it("Rechercher plusieurs utilisateurs incorrect(avec un id inexistant). - E", (done) => {
        chai.request(server).get('/find_users').query({ id: ['665f18739d3e172be5daf092', '665f18739d3e172be5daf093'] })
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Rechercher plusieurs utilisateurs incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).get('/find_users').query({ id: ['123', '456'] })
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})

// TEST CONTROLLER - Modifier un utilisateur

describe("PUT - /update_user/:id", () => {
    it("Modifier un utilisateur. - S", (done) => {
        chai.request(server).put('/update_user/' + users[0]._id)
            .auth(token, { type: 'bearer' })
            .send({ firstname: 'loutfou' })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("Modifier un utilisateur. - E (Unauthorized)", (done) => {
        chai.request(server).put('/update_user/' + users[0]._id)
            .send({ firstname: 'loutfou' })
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })
    it("Modifier un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).put('/update_user/665f18739d3e172be5daf092')
            .auth(token, { type: 'bearer' })
            .send({ firstname: 'loutfou' })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Modifier un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).put('/update_user/123')
            .auth(token, { type: 'bearer' })
            .send({ lastname: 'tissoubebou', firstname: 'loutfou' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier un utilisateur avec un champ vide. - E", (done) => {
        chai.request(server).put('/update_user/' + users[0]._id)
            .auth(token, { type: 'bearer' })
            .send({ firstname: '', lastname: 'tissoubebou' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})

// TEST CONTROLLER - Modifier plusieurs utilisateurs

describe("PUT - /update_users", () => {
    it("Modifier plusieurs utilisateurs. - E (Unauthorized)", (done) => {
        chai.request(server).put('/update_users').query({ id: _.map(users, '_id') })
            .send({ firstname: 'loutfou' })
            .end((err, res) => {
                res.should.have.status(401)
                // console.log(users)
                // console.log(res.body)
                // console.log(err)
                done()
            })
    })
    it("Modifier plusieurs utilisateurs. - S", (done) => {
        chai.request(server).put('/update_users').query({ id: _.map(users, '_id') })
            .auth(token, { type: 'bearer' })
            .send({ firstname: 'loutfou', lastname: 'tissoubebou', phone_number: '1234567890' })
            .end((err, res) => {
                res.should.have.status(200)
                // console.log(users)
                // console.log(res.body)
                // console.log(value)
                done()
            })
    })
    it("Modifier plusieurs utilisateurs incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).put('/update_users').query({ id: ['667980900166578fd4b6b32b', '667980a00166578fd4b6b32c'] })
            .auth(token, { type: 'bearer' })
            .send({ firstname: 'loutfous' })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Modifier plusieurs utilisateurs incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).put('/update_users').query({ id: ['123', '456'] })
            .auth(token, { type: 'bearer' })
            .send({ firstname: 'loutfou', lastname: 'tissoubebou', phone_number: '1234567890' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier plusieurs utilisateurs incorrect (sans renseigner l'id). - E", (done) => {
        chai.request(server).put('/update_users').query({ id: [] })
            .auth(token, { type: 'bearer' })
            .send({ firstname: 'loutfou' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier plusieurs utilisateurs avec un champ vide. - E", (done) => {
        chai.request(server).put('/update_users').query({ id: _.map(users, '_id') })
            .auth(token, { type: 'bearer' })
            .send({ firstname: '' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier plusieurs utilisateurs avec un champ unique existant. - E", (done) => {
        chai.request(server).put('/update_users').query({ id: _.map(users, '_id') })
            .auth(token, { type: 'bearer' })
            .send({ email: users[1].email })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})

// TEST CONTROLLER - Supprimer un utilisateur

describe("DELETE - /delete_user", () => {
    it("Supprimer un utilisateur. - S", (done) => {
        chai.request(server).delete('/delete_user/' + users[1]._id)
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("Supprimer un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/delete_user/665f18739d3e172be5daf092')
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Supprimer un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/delete_user/665f18739d3e172be5daf092')
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Supprimer un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/delete_user/123')
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})

// TEST CONTROLLER - Supprimer plusieurs utilisateurs

describe("DELETE - /delete_users", () => {
    it("Supprimer plusieurs utilisateurs. - E (Unauthorized)", (done) => {
        // console.log(users)
        chai.request(server).delete('/delete_users').query({ id: _.map(users, '_id') })
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })
    it("Supprimer plusieurs utilisateurs incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/delete_users').query({ id: ['123', '456'] })
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Supprimer plusieurs utilisateurs. - S", (done) => {
        chai.request(server).delete('/delete_users').query({ id: _.map(users, '_id') })
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
})