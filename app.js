const express = require('express')

const feedRoutes = require('./routes/feed')

const bodyParser = require('body-parser')

const app = express()

// app.use(bodyParser.urlencoded()) // x-www-folr-urlencoded <form>

app.use(bodyParser.json()) // application/json


// Solving CORS * or specific websites
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, PÖOST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/feed', feedRoutes)

app.listen(8080)