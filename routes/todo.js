const express = require('express')
const router = express.Router()
const todoController = require('../controllers/todoController')
const protect = require('../middleware/protect.middleware')

router.use(protect)

router.get('/', todoController.getAll)

router.get('/:id', todoController.getOne)

router.post('/', todoController.create)

router.put('/:id', todoController.update)

router.delete('/:id', todoController.delete)

module.exports = router
