const asyncHandler = require('express-async-handler')
const Journal = require('../models/journal')
const { body, validationResult, matchedData } = require('express-validator')

exports.getAll = asyncHandler(async (req, res) => {
  const journals = await Journal.find({ user: req.user.id }).sort({
    updatedAt: -1,
  })
  res.json(journals)
})

exports.getOne = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({ _id: req.params.id })
  if (journal) {
    res.json(journal)
  } else {
    res.status(404).json({ message: 'Journal not found.' })
  }
})

exports.create = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject must not be empty.')
    .escape(),

  body('body')
    .trim()
    .notEmpty()
    .withMessage('Body must not be empty.')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { subject, body } = matchedData(req, {
      onlyValidData: false,
      includeOptionals: true,
    })

    const newJournal = new Journal({
      subject,
      body,
      user: req.user._id,
    })

    if (errors.isEmpty()) {
      await newJournal.save()
      res.json({ newJournal })
    } else {
      res.status(401).json(errors.array())
    }
  }),
]

exports.update = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject must not be empty.')
    .escape(),

  body('body')
    .trim()
    .notEmpty()
    .withMessage('Body must not be empty.')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { subject, body } = matchedData(req, {
      onlyValidData: false,
      includeOptionals: true,
    })

    const oldJournal = await Journal.findById(req.params.id)

    if (!oldJournal) {
      return res.status(404).json({ message: 'Journal not found.' })
    }

    if (oldJournal.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to update this journal.' })
    }

    if (errors.isEmpty()) {
      const updatedJournal = await Journal.findByIdAndUpdate(
        req.params.id,
        { subject, body },
        { new: true }
      )

      res.json({ updatedJournal })
    } else {
      res.status(401).json(errors.array())
    }
  }),
]

exports.delete = asyncHandler(async (req, res) => {
  const journal = await Journal.findById(req.params.id)

  if (!journal) {
    return res.status(404).json({ message: 'Journal not found.' })
  }

  if (journal.user.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: 'You do not have permission to delete this journal.' })
  }

  await Journal.findByIdAndDelete(req.params.id)

  res.json({ message: 'Journal deleted.' })
})
