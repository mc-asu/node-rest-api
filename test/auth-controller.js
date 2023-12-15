const authController = require('../controller/auth')
const expect = require('chai').expect
const sinon = require('sinon')

const mongoose = require('mongoose')

const User = require('../models/user')
const username = 'githubcreds'
const password = 'githubcreds'
const MONGODB_URI = `mongodb+srv://${username}:${password}@nodejscourse.tdqni9o.mongodb.net/test-messages`

describe('Auth controller', function() {

    // Mocha Lifecycle Hooks

    // Runs once
    before(function(done) {
        mongoose.connect(MONGODB_URI)
        .then(result => {
            const user = new User({
                email: 'tester@test.com',
                name: 'tester',
                password: 'tester',
                post: [],
                _id: '5c0f66b979af55031b34728a'
            })
            // String format in _id matters for MongoDB
            return user.save()
        })
        .then(() => {
            done()
        }).catch(err => {
            done(err)
        })
    })

    // // Runs multiple times before every "it"
    // beforeEach(function() {})
    // // Runs multiple times before after "it"
    // afterEach(function() {})
    
    // Strategy 1: stub
    it('should throw an error with code 500 if accessing the database fails', function(done) {
        sinon.stub(User, 'findOne')
        User.findOne.throws()
        const req = {
            body: {
                email: 'mc@mc.mc',
                password: 'password'
            }
        }
        expect(authController.login(req, {}, () => {})
            .then(result => {
                expect(result).to.be.an('error')
                expect(result).to.have.property('statusCode', 500)
                done()
            }).catch(err => {
                done(err)
            })
        )

        User.findOne.restore()
    })

     // Strategy 2: Connect to Test DB
    it('should send a response with a valid user status for an existing user', function(done) {

        const req = {
            userId: '5c0f66b979af55031b34728a'
        }

        const res = {
            statusCode: 500,
            userStatus: null,
            status: function(code) {
                this.statusCode = code
                return this
            },
            json: function(data) {
                this.userStatus = data.status
            }
        }

        authController.getUserStatus(req, res, () => {})
            .then(() => {
                expect(res.statusCode).to.be.equal(200)
                expect(res.userStatus).to.be.equal('New')
                done()
            }).catch(err => {
                done(err)
            })

    })

    // Mocha Lifecycle Hooks
    after(function(done) {
        User.deleteMany({}).then(() => {
            return mongoose.disconnect()
        })
        .then(() => {
            done()
        }).catch(err => {
            done(err)
        })
    })
})