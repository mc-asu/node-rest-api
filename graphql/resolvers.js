const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const Post  = require('../models/post')
module.exports = {
    createUser: async function (args, req) {
        // args can be destructured to  { userInput } in this case
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
            errorHandler(422, 'Invalid input.', errors)
        }

        const existingUser = await User.findOne({email: args.userInput.email})
        if(existingUser) {
            errorHandler(500, 'User exist already')
        }

        const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
        const user = new User({
            email: args.userInput.email,
            password: hashedPassword,
            name: args.userInput.name,
        })

        const createdUser = await user.save()
        return { ...createdUser._doc, _id: createdUser._id.toString()}
    },
    login: async function ({ email, password }, req) {
        // args is destructured to { email, password }
        const user = await User.findOne({email: email})
        if(!user) {
            errorHandler(401, 'User not found.')
        }

        const doMatch = await bcrypt.compare(password, user.password)
        if (!doMatch){
            errorHandler(401, 'Wrong password')
        }
        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString()
            }, 
            'somesuperdupersecret',
            { expiresIn: '1h'}
        )

        return { token: token, userId: user._id.toString() }


    },
    createPost: async function ({ postInput }, req) {
        if (!req.isAuth) errorHandler(401, ' Not authenticated.')
        
        const { title, content, imageUrl } = postInput
        const errors = []
        if ( 
            validator.isEmpty(title)|| 
            !validator.isLength(title, {min: 5})
        ) {
            errors.push({message: 'Title is too short.' })
        }

        if (
            validator.isEmpty(content) || 
            !validator.isLength(content, {min: 5})
        ) {
            errors.push({message: 'Content is invalid'})
        }

        if(errors.length > 0) {
            errorHandler(422, 'Invalid inputs.', errors)
        }
        const user = await User.findById(req.userId)
        if(!user) errorHandler(401, 'Invalid user.')

        const post = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: user,
        })

        const createdPost = await post.save()
        user.posts.push(post)
        await user.save()

        //need to transform data as data strunctures are not supported
        return { 
            ...createdPost._doc, 
            _id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString()
        }

    },
    getPosts: async function({ page }, req) {
        if (!req.isAuth) errorHandler(401, ' Not authenticated.')

        if(!page) {
            page = 1
        }

        const PER_PAGE = 2
        const totalPosts = await Post.find().countDocuments()
        const posts = await Post.find()
            .sort({createdAt: -1})
            .skip((page - 1) * PER_PAGE)
            .limit(PER_PAGE)
            .populate('creator')

        
        //need to transform data as data strunctures are not supported
        return { posts: posts.map(p => {
            return { 
                ...p._doc, 
                _id: p._id.toString(),
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString()
            }
        }), totalPosts: totalPosts}
    },
    getPost: async function({ id }, req) {
        if (!req.isAuth) errorHandler(401, ' Not authenticated.')

        const post = await Post.findById(id).populate('creator')
        if(!post) {
            errorHandler.error(404, 'Could not find post.')
        }

        return { 
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }
    }
}

const errorHandler = (statusCode, message, errors) => {
    const error = new Error(message)
    if(statusCode) {
        error.code = statusCode
    }
    if(errors) {
        error.data = errors
    }
    throw error
}