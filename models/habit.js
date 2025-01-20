const mongoose = require('mongoose')
const Schema = mongoose.Schema

const habitSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    repeatDays: {
      type: [String],
      enum: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Habit', habitSchema)
