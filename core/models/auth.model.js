var mongoose = require('mongoose');

var authSchema = new mongoose.Schema(
  {
    authToken: Number,
    createDate: Date,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enterDate: Date
  }
);

module.exports = mongoose.model('Auth',authSchema);
