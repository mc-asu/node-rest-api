const bcrypt = require('bcryptjs')
const validator = require('validator')

const User = require('../models/user')
const Post  = require('../models/post')
module.exports = {
    createUser: async function (args, req) {
        // args can be destructured to  { userInput } in this casew
        // const email = userInput.email
        // not gonna use destructuring on these files for readability
        const errors = []
        if(!validator.isEmail(args.userInput.email)) {
            errors.push({message: 'E-Mail is invalid'})
        }

        if(
            validator.isEmpty(args.userInput.password) || 
            !validator.isLength(args.userInput.password, {min: 5})
        ) {
            errors.push({message: 'Password too short'})
        }

        if(errors.length > 0) {
            const error = new Error('Invalid input.')
            error.data = errors
            error.code = 422
            throw error
        }

        const existingUser = await User.findOne({email: args.userInput.email})
        if(existingUser) {
            const error = new Error('User exist already')
            throw error
        }

        const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
        const user = new User({
            email: args.userInput.email,
            password: hashedPassword,
            name: args.userInput.name,
        })

        const createdUser = await user.save()
        return { ...createdUser._doc, _id: createdUser._id.toString()}
    }
}