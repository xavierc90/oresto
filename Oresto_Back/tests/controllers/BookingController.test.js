const UserService = require('../../services/UserService')
const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const server = require('../../server')
const should = chai.should()
const _ = require('lodash')
let token = ""
var reservation = []
let tab_id_users = []

