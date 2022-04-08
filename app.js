const fs = require('fs')
const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors');

const postsRoutes = require('./routes/post-routes')
const usersRoutes = require('./routes/user-routes')
const HttpError = require('./models/http-error')

const app = express()

app.use(bodyParser.json())
app.use(cors())

app.use('/uploads', express.static(path.join('uploads')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', '*')
    res.setHeader('Access-Control-Allow-Methods', '*')
    next()
})

app.use('/api/posts', postsRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
    const error = new HttpError('Not Found', 404)
    throw error
})

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err)
        })
    }
    if (res.headerSet) {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'Error' })
})

mongoose
    .connect('mongodb://127.0.0.1:27017/mern')
    .then(() => {
        app.listen(5000)
    })
    .catch(err => {
        console.log(err)
    })  