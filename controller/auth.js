const User = require('../models/user')
const statusHandler = require('../utils/statusHandler')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { validationResult } = require('express-validator')

exports.signup = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        statusHandler.error(422, 'Validation failed, entered data is incorrect.', errors)
    }

    const { email, name, password } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name,
        })
        const result = await user.save()

        statusHandler.success(res, 201, { 
            message: 'User created successfully!',
            userId: result._id
        })
    } catch(err) {
        statusHandler.error500(err, next)
    }

}

exports.login = async (req, res, next) => {
    const { email, password } = req.body
    try {
        const loadedUser = await User.findOne({email: email})
        if(!loadedUser) {
            statusHandler.error(401, 'Could not find user with this email.')
        }
        const doMatch = await bcrypt.compare(password, loadedUser.password)
        if (!doMatch){
            statusHandler.error(401, 'Wrong password')
        }   
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
        return
    } catch (err) {
        statusHandler.error500(err, next)
        return err
    }

}

exports.getUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId)
        if(!user) {
            statusHandler.error(404, 'User not found!')
        }
        statusHandler.success(res, 200, { 
            message: 'Status fetched successfully!', 
            status: user.status,
        })
    } catch (err) {
        statusHandler.error500(err, next)
    }
}

exports.updateUserStatus = async (req, res, next) => {
    const status = req.body.status
    try {
        const user = await User.findById(req.userId)
        if(!user) {
            statusHandler.error(404, 'User not found!')
        }
        user.status = status
        await user.save()

        statusHandler.success(res, 200, { 
            message: 'Status changed successfully!', 
            status: status,
        })

    } catch (err) {
        statusHandler.error500(err, next)
    }
}