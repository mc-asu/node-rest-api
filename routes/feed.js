const express = require('express')

const { body } = require('express-validator')

const feedController = require('../controller/feed')

const router = express.Router()

// GET /feed/posts
router.get('/posts', feedController.getPosts)

// POST /feed/post
router.post(
    '/post',
    [
        body('title')
            .isString()
            .trim()
            .isLength({ min: 5 }),
        body('content')
            .trim()
            .isLength({ min: 5 })
    ],
    feedController.createPost
)

// GET /feed/post/:postId
router.get('/post/:postId', feedController.getPost)

module.exports = router