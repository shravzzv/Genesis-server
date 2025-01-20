const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

require('./config/db.config')
const indexRouter = require('./routes/index')
const userRouter = require('./routes/user')
const goalRouter = require('./routes/goal')
const todoRouter = require('./routes/todo')
const habitRouter = require('./routes/habit')
const journalRouter = require('./routes/journal')

const app = express()

app.use(cors())
app.use(helmet())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', userRouter)
app.use('/goals', goalRouter)
app.use('/todos', todoRouter)
app.use('/habits', habitRouter)
app.use('/journals', journalRouter)

module.exports = app
