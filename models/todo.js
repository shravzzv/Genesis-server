const mongoose = require('mongoose')
const Schema = mongoose.Schema

const todoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    deadline: {
      type: Date,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    goal: {
      type: Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Todo', todoSchema)
