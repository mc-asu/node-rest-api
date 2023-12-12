const User = require('../models/user')
const statusHandler = require('../utils/statusHandler')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { validationResult } = require('express-validator')

exports.signup = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        statusHandler.error(422, 'Validation failed, entered data is incorrect.', errors)
    }

    const { email, name, password } = req.body
    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                name: name,
            })
            return user.save()
        })
        .then(user => {
            statusHandler.success(res, 201, { 
                message: 'User created successfully!',
                userId: user._id
            })
        })
        .catch(err => statusHandler.error500(err, next))
}

exports.login = (req, res, next) => {
    // const errors = validationResult(req)
    // if(!errors.isEmpty()) {
    //     statusHandler.error(422, 'Validation failed, entered data is incorrect.', errors)
    // }
    const { email, password } = req.body
    let loadedUser
    User.findOne({email: email})
        .then(user => {
            if(!user) {
                statusHandler.error(401, 'Could not find user with this email.')
            }
            loadedUser = user
            return bcrypt.compare(password, user.password)      
        })
        .then(doMatch => {
            if(!doMatch) {
                statusHandler.error(401, 'Wrong password')
            }
            // Second parameter is only known by the server. 
            // So please be careful who you trust
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                }, 
                'somesuperdupersecret',
                { expiresIn: '1h'}
            )

            statusHandler.success(res, 200, { 
                message: 'User logged in!', 
                token: token,
                userId: loadedUser._id.toString()
            })
        })
        .catch(err => statusHandler.error500(err, next))
}

exports.getUserStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            if(!user) {
                statusHandler.error(404, 'User not found!')
            }
            statusHandler.success(res, 200, { 
                message: 'Status fetched successfully!', 
                status: user.status,
            })
        })
        .catch(err => statusHandler.error500(err, next))
}

exports.updateUserStatus = (req, res, next) => {
    const status = req.body.status
    User.findById(req.userId)
        .then(user => {
            if(!user) {
                statusHandler.error(404, 'User not found!')
            }

            user.status = status
            return user.save()
        })
        .then(() => {
            statusHandler.success(res, 200, { 
                message: 'Status changed successfully!', 
                status: status,
            })
        })
        .catch(err => statusHandler.error500(err, next))
}