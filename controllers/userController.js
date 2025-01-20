const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const { body, validationResult, matchedData } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.signup = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email must not be empty.')
    .bail()
    .isEmail()
    .withMessage('Email is not a valid email address.')
    .escape()
    .custom(async (email) => {
      const existingUser = await User.findOne({ email }, '_id')
      if (existingUser) throw new Error(`E-mail already in use.`)
    }),

  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be atleast 8 characters long.'),

  body('passwordConfirm')
    .trim()
    .notEmpty()
    .withMessage('Password confirm must not be empty.')
    .bail()
    .custom((value, { req }) => {
      return value === req.body.password
    })
    .withMessage(`Doesn't match the password.`),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { email, password } = matchedData(req, {
      onlyValidData: false,
    })

    const newUser = new User({
      email,
      password,
    })

    if (errors.isEmpty()) {
      const hashedPassword = await bcrypt.hash(password, 10)
      newUser.password = hashedPassword
      await newUser.save()

      const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET)

      res.json({ token })
    } else {
      res.status(401).json(errors.array())
    }
  }),
]

exports.signin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email must not be empty.')
    .bail()
    .isEmail()
    .withMessage('Email is not a valid email address.')
    .bail()
    .escape()
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email }, '_id password')
      if (user) req.user = user
      if (!user) throw new Error(`Email ${email} doesn't exist.`)
    }),

  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be atleast 8 characters long.')
    .bail()
    .custom(async (password, { req }) => {
      if (req.user && !(await bcrypt.compare(password, req.user.password))) {
        throw new Error('Incorrect password.')
      }
    }),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
      const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET)

      res.json({ token })
    } else {
      res.status(401).json(errors.array())
    }
  }),
]

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id, '-password')
  res.json(user)
})
