const { validationResult } = require('express-validator')
const statusHandler = require('../utils/statusHandler')

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