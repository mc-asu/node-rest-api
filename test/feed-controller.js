const feedController = require('../controller/feed')
const expect = require('chai').expect

const mongoose = require('mongoose')

const User = require('../models/user')
const Post = require('../models/post')
const username = 'githubcreds'
const password = 'githubcreds'
const MONGODB_URI = `mongodb+srv://${username}:${password}@nodejscourse.tdqni9o.mongodb.net/test-messages`

describe('Feed Controller', function () {

    before(function(done) {
        mongoose.connect(MONGODB_URI)
        .then(() => {
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

    // beforeEach(function(done) {  

    // })

    it('should add a created to the posts of the creator', function(done) {
        const req = {
            body: {
                title: 'Test Post',
                content: ' Test Content'
            },
            userId: '5c0f66b979af55031b34728a',
            file: {
                path: 'sup/bro'
            }
        }


        const res = {
            status: function() { return this },
            json: function() {}
        }

        feedController.createPost(req, res, () => {}).then(savedUser => {
                expect(savedUser).to.have.property('posts')
                expect(savedUser.posts).to.have.length(1)
                done()
            }).catch(err => {
                done(err)
            })
    })

        // Mocha Lifecycle Hooks
        after(function(done) {
            
            User.deleteMany({}).then(() => {
                return Post.deleteMany({})
            })
            .then(() => {
                return mongoose.disconnect()
            })
            .then(() => {
                done()
            }).catch(err => {
                done(err)
            })
        })
})