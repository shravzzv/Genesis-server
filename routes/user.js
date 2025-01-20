const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const protect = require('../middleware/protect.middleware')

router.post('/signup', userController.signup)

router.post('/signin', userController.signin)

router.get('/user', protect, userController.getUser)

module.exports = router
