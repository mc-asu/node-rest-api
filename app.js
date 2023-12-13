const express = require('express')
const path = require('path')

const bodyParser = require('body-parser')

const mongoose = require('mongoose')
const username = 'githubcreds'
const password = 'githubcreds'
const MONGODB_URI = `mongodb+srv://${username}:${password}@nodejscourse.tdqni9o.mongodb.net/messages`

const multer = require('multer')

const { graphqlHTTP } = require('express-graphql')
const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')

const cors = require('cors')

const app = express()

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime()+ '-' +file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

// app.use(bodyParser.urlencoded()) // x-www-folr-urlencoded <form>
app.options('*',cors())

app.use(bodyParser.json()) // application/json

// iamge handler
app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

// Solving CORS * or specific websites
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE', 'OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if(req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
        if (!err.originalError) {
            return err
        }
        const data = err.originalError.data
        const message = err.message || 'An error occurred.'
        const code = err.originalError.code || 500
        return { message: message, status: code, data: data }
    }
}))

app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message
    const data = error.data
    res.status(status).json({
        message: message,
        data: data,
    })
})

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(8080)
    })
    .catch(err => console.log(err))