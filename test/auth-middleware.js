const authMiddleware = require('../middleware/is-auth')
const expect = require('chai').expect
const sinon = require('sinon')
const jwt = require('jsonwebtoken')

// No testing 3rd party functions
// Organization
describe('Auth middleware', function() {
    // integration test is a flow test - complex

    // unit testing is testing other scenarios
    // this is a unit test boiiiiiiis - one unit of our application
    it('should throw an error if no authorization header is present', function() {
        const req = {
            get: function() {
                return null
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not authenticated')
    })

    it('should throw an error if the authorization header is only one string', function() {
        const req = {
            get: function() {
                return 'Bearer'
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw()
    })

    it('should yield a userId after decoding the token', function () {
        const req = {
            get: function() {
                return 'Bearer adasdadasdsds'
            }
        }
        sinon.stub(jwt, 'verify') // sinon will replace this function
        
        jwt.verify.returns({ userId: 'abc'})
        authMiddleware(req, {}, () => {})
        expect(req).to.have.property('userId')
        expect(req).to.have.property('userId', 'abc')
        expect(jwt.verify.called).to.be.true
        jwt.verify.restore()
    })

    it('should throw an error if the token cannot be verified', function () {
        const req = {
            get: function() {
                return 'Bearer xyz'
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw()
    })


})
