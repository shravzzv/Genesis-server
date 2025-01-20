const asyncHandler = require('express-async-handler')
const Todo = require('../models/todo')
const { body, validationResult, matchedData } = require('express-validator')

exports.getAll = asyncHandler(async (req, res) => {
  const todos = await Todo.find({ user: req.user.id })
    .populate('goal')
    .sort({ deadline: 1, updatedAt: -1 })
  res.json(todos)
})

exports.getOne = asyncHandler(async (req, res) => {
  const todo = await Todo.findOne({ _id: req.params.id })
  if (todo) {
    res.json(todo)
  } else {
    res.status(404).json({ message: 'Todo not found.' })
  }
})

exports.create = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title must not be empty.')
    .escape(),

  body('description').trim().optional().escape(),

  body('deadline')
    .notEmpty()
    .withMessage('Deadline must not be empty')
    .toDate(),

  body('goal')
    .notEmpty()
    .withMessage('Goal must not be empty.')
    .isMongoId()
    .withMessage('Goal should be a valid MongoDB ID.')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { title, description, deadline, goal } = matchedData(req, {
      onlyValidData: false,
      includeOptionals: true,
    })

    const newTodo = new Todo({
      title,
      description,
      deadline,
      goal,
      user: req.user.id,
    })

    if (errors.isEmpty()) {
      await newTodo.save()
      await newTodo.populate('goal')
      res.json({ newTodo })
    } else {
      res.status(401).json(errors.array())
    }
  }),
]

exports.update = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title must not be empty.')
    .escape(),

  body('description').trim().optional().escape(),

  body('deadline')
    .notEmpty()
    .withMessage('Deadline must not be empty')
    .toDate()
    .optional(),

  body('goal')
    .notEmpty()
    .withMessage('Goal must not be empty.')
    .isMongoId()
    .withMessage('Goal should be a valid MongoDB ID.')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { title, description, deadline, goal } = matchedData(req, {
      onlyValidData: false,
      includeOptionals: true,
    })

    const oldTodo = await Todo.findById(req.params.id)

    if (!oldTodo) {
      return res.status(404).json({ message: 'Todo not found.' })
    }

    if (oldTodo.user.toString() !== req.user.id) {
      res
        .status(403)
        .json({ message: 'You do not have permission to update this todo.' })
    }

    if (errors.isEmpty()) {
      const updatedTodo = await Todo.findByIdAndUpdate(
        req.params.id,
        { title, description, deadline, goal },
        {
          new: true,
        }
      )

      await updatedTodo.populate('goal')
      res.json({ updatedTodo })
    } else {
      res.status(401).json(errors.array())
    }
  }),
]

exports.delete = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id)

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found.' })
  }

  if (todo.user.toString() !== req.user.id) {
    res
      .status(403)
      .json({ message: 'You do not have permission to delete this todo.' })
  }

  await Todo.findByIdAndDelete(req.params.id)

  res.json({ message: 'Todo deleted.' })
})
