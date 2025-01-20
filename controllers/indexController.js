const asyncHandler = require('express-async-handler')

exports.index = asyncHandler(async (req, res) => {
  res.send('Welcome to the Express API of the Genesis Server.')
})
