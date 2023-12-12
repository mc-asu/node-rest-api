const { validationResult } = require('express-validator')
const statusHandler = require('../utils/statusHandler')
const fs = require('fs')
const path = require('path')

const Post = require('../models/post')

exports.getPosts = (req, res, next) => {
    Post.find()
    .then(posts => {
        statusHandler.success(res, 200, 'Fetched posts successfully.', posts, 'posts')
    })
    .catch(err => statusHandler.error500(err, next))
}

exports.createPost = (req, res, next) => {
    const { title, content } = req.body
    if(!req.file) {
        statusHandler.error(422, 'Attached file is not an image')
    }
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        statusHandler.error(422, 'Validation failed, entered data is incorrect.')
    }

    const imageUrl = req.file.path

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: {
            name: 'Manuel'
        },
    })
    post.save()
    .then(result => {
        console.log(result)
        statusHandler.success(res, 201, 'Post created successfully!', result, 'post')
    })
    .catch(err => statusHandler.error500(err, next))
    
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
        .then(post => {
            if(!post) {
                statusHandler.error(404, 'Could not find post.')
            }
            statusHandler.success(res, 200, 'Post fetched.', post, 'post')
        })
        .catch(err => statusHandler.error500(err, next))
}

exports.updatePost = (req, res, next) => {
    const postId= req.params.postId
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        statusHandler.error(422, 'Validation failed, entered data is incorrect.')
    } 
    const { title, content } = req.body
    let imageUrl = req.body.image
    if(req.file) {
        imageUrl = req.file.path
    }

    if(!imageUrl) {
        statusHandler.error(422, 'No file picked')
    }
    Post.findById(postId)
        .then(post => {
            if(!post) {
                statusHandler.error(404, 'Could not find post.')
            }
            if(imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl)
            }
            post.title = title
            post.content = content
            post.imageUrl = imageUrl

            return post.save()
        })
        .then(result => {
            statusHandler.success(res, 200, 'Post edited successfully!', result, 'post')
        })
        .catch(err => statusHandler.error500(err, next))
}

exports.deletePost = (req,res,next) => {
    const postId = req.params.postId
    Post.findById(postId)
        .then(post => {

            // Check logged in user
            if(!post) {
                statusHandler.error(404, 'Could not find post.')
            }
            clearImage(post.imageUrl)
            return Post.findByIdAndDelete(postId)
        })
        .then(() => {
            statusHandler.success(res, 200, 'Post deleted successfully!')
        })
        .catch(err => statusHandler.error500(err, next))
}


const clearImage = (filePath) => {
    filePath = path.join(__dirname, '..', filePath)
    fs.unlink(filePath, (err) => console.log(err))
}
