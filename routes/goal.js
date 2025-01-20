const express = require('express')
const router = express.Router()
const goalController = require('../controllers/goalController')
const protect = require('../middleware/protect.middleware')

router.use(protect)

router.get('/', goalController.getAll)

router.get('/:id', goalController.getOne)

router.post('/', goalController.create)

router.put('/:id', goalController.update)

router.delete('/:id', goalController.delete)

router.get('/generateTodos/:id', goalController.generateTodos)

module.exports = router
