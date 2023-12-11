const express = require('express')
const path = require('path')

const feedRoutes = require('./routes/feed')

const bodyParser = require('body-parser')

const mongoose = require('mongoose')
// const session = require('express-session')
// const MongoDBStore = require('connect-mongodb-session')(session)
const username = 'githubcreds'
const password = 'githubcreds'
const MONGODB_URI = `mongodb+srv://${username}:${password}@nodejscourse.tdqni9o.mongodb.net/messages`

const multer = require('multer')

const cors = require('cors')

const app = express()
// const store = new MongoDBStore({
//     uri: MONGODB_URI,
// })

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

// app.use(session({ 
//     secret: 'my secret', 
//     resave: false ,
//     saveUninitialized: false,
//     store: store
// }))


// Solving CORS * or specific websites
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/feed', feedRoutes)
app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message
    res.status(status).json({message: message})
})

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(8080)
    })
    .catch(err => console.log(err))