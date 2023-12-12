const User = require('../models/user')
const express = require('express')

const { body } = require('express-validator')

const authController = require('../controller/auth')
const isAuth = require('../middleware/is-auth')

const router = express.Router()

// PUT /auth/signup
router.put(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom((value, { req }) => {
                return User
                    .findOne({ email: value })
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.rejected('E-mail address already exists!')
                        }
                    })
            })
            .normalizeEmail(),
        body('password')
            .trim()
            .isLength({ min: 5 }),
        body('name')
            .trim()
            .not()
            .isEmpty()
    ],
    authController.signup
)

// POST /auth/login
router.post('/login', authController.login)

// GET /auth/status
router.get('/status', isAuth,  authController.getUserStatus)

// PUT /auth/status
router.patch(
    '/status',
    isAuth,
    body('status')
        .trim()
        .not()
        .isEmpty(),  
    authController.updateUserStatus
)


module.exports = router