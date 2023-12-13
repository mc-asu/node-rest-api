const { validationResult } = require('express-validator')
const statusHandler = require('../utils/statusHandler')
const fs = require('fs')
const path = require('path')

const Post = require('../models/post')
const User = require('../models/user')
const PER_PAGE = 2

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1
    try {
        const totalItems = await Post.find().countDocuments()
        const posts = await Post.find()
            .skip((currentPage - 1) * PER_PAGE)
            .limit(PER_PAGE)
        statusHandler.success(res, 200, { 
            message: 'Fetched posts successfully.', 
            posts: posts,
            totalItems: totalItems
        })
    } catch (err) {
        statusHandler.error500(err, next)
    }
}

exports.createPost = async (req, res, next) => {
    const { title, content } = req.body
    if(!req.file) {
        statusHandler.error(422, 'Attached file is not an image')
    }
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        statusHandler.error(422, 'Validation failed, entered data is incorrect.', errors)
    }

    const imageUrl = req.file.path

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId,
    })

    try {
        await post.save()
        const user = await User.findById(req.userId)
        user.posts.push(post)
        await user.save()

        statusHandler.success(res, 201, { 
            message: 'Post created successfully!', 
            post: post,
            creator: {
                _id: user._id,
                name: user.name
            }
        })
    } catch (err) {
        statusHandler.error500(err, next)
    }
}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId
    try {
        const post = await Post.findById(postId)
        if(!post) {
            statusHandler.error(404, 'Could not find post.')
        } 
        statusHandler.success(res, 200, { 
            message: 'Post fetched!', 
            post: post,
        })
    } catch (err) {
        statusHandler.error500(err, next)
    }
}

exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        statusHandler.error(422, 'Validation failed, entered data is incorrect.', errors)
    } 
    const { title, content } = req.body
    let imageUrl = req.body.image
    if(req.file) {
        imageUrl = req.file.path
    }

    if(!imageUrl) {
        statusHandler.error(422, 'No file picked')
    }
    try {
        const post = await Post.findById(postId)
        if(!post) {
            statusHandler.error(404, 'Could not find post.')
        }

        if(post.creator.toString() !== req.userId) {
            statusHandler.error(403, 'Not authorized')
        }   

        if(imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl)
        }
        post.title = title
        post.content = content
        post.imageUrl = imageUrl

        const result = await post.save()

        statusHandler.success(res, 200, { 
            message: 'Post edited!', 
            post: result,
        })
    } catch (err) {
        statusHandler.error500(err, next)
    }
}

exports.deletePost = async (req,res,next) => {
    const postId = req.params.postId
    try {
        const post = await Post.findById(postId)
        if(!post) {
            statusHandler.error(404, 'Could not find post.')
        } 

        if(post.creator.toString() !== req.userId) {
            statusHandler.error(403, 'Not authorized')
        }   

        clearImage(post.imageUrl)
        await Post.findByIdAndDelete(postId)

        const user = await User.findById(req.userId)
        user.posts.pull(postId)
        await user.save()

        statusHandler.success(res, 200, { 
            message: 'Post deleted and cleared relations!', 
        })
    } catch (err) {
        statusHandler.error500(err, next)
    } 
}


const clearImage = (filePath) => {
    filePath = path.join(__dirname, '..', filePath)
    fs.unlink(filePath, (err) => console.log(err))
}
