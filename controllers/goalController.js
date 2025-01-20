const asyncHandler = require('express-async-handler')
const Goal = require('../models/goal')
const Todo = require('../models/todo')
const { body, validationResult, matchedData } = require('express-validator')
const { getTodos } = require('../utils/ai.utils')

exports.getAll = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user: req.user.id }).sort({ updatedAt: -1 })
  res.json(goals)
})

exports.getOne = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id })
  if (goal) {
    res.json(goal)
  } else {
    res.status(404).json({ message: 'Goal not found.' })
  }
})

exports.create = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name must not be empty.')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { name } = matchedData(req, {
      onlyValidData: false,
    })

    const newGoal = new Goal({
      name,
      user: req.user.id,
    })

    if (errors.isEmpty()) {
      await newGoal.save()
      res.json({ newGoal })
    } else {
      res.status(401).json(errors.array())
    }
  }),
]

exports.update = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name must not be empty.')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { name } = matchedData(req, {
      onlyValidData: false,
    })

    const currentGoal = await Goal.findById(req.params.id)

    if (!currentGoal) {
      return res.status(404).json({ message: 'Goal not found.' })
    }

    if (currentGoal.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to update this goal.' })
    }

    if (errors.isEmpty()) {
      const updatedGoal = await Goal.findByIdAndUpdate(
        req.params.id,
        { name },
        {
          new: true,
        }
      )

      res.json(updatedGoal)
    } else {
      res.status(401).json(errors.array())
    }
  }),
]

exports.delete = asyncHandler(async (req, res) => {
  const currentGoal = await Goal.findById(req.params.id)

  if (!currentGoal) {
    return res.status(404).json({ message: 'Goal not found.' })
  }

  if (currentGoal.user.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: 'You do not have permission to delete this goal.' })
  }

  const todos = await Todo.find({ goal: req.params.id })

  todos.forEach(async (todo) => {
    await Todo.findByIdAndDelete(todo._id)
  })

  await Goal.findByIdAndDelete(req.params.id)
  res.json({ message: 'Goal deleted.' })
})

exports.generateTodos = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id)

  if (!goal) {
    return res.status(404).json({ message: 'Goal not found.' })
  }

  if (goal.user.toString() !== req.user.id) {
    return res.status(403).json({
      message: 'You do not have permission to generate todos for this goal.',
    })
  }

  const todos = await getTodos(goal.name)

  const newTodos = []

  todos.forEach(async (todo) => {
    const newTodo = new Todo({
      title: todo,
      goal: req.params.id,
      user: req.user.id,
    })

    newTodos.push(newTodo)
    await newTodo.save()
    await newTodo.populate('goal')
  })

  res.json({ newTodos })
})
