const express = require('express')
const router = express.Router()
const habitController = require('../controllers/habitController')
const protect = require('../middleware/protect.middleware')

router.use(protect)

router.get('/', habitController.getAll)

router.get('/:id', habitController.getOne)

router.post('/', habitController.create)

router.put('/:id', habitController.update)

router.delete('/:id', habitController.delete)

module.exports = router
