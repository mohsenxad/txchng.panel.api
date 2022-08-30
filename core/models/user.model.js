var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  firstname : String,
  lastname : String,
  title : String,
  cellNumber : String,
  email: String,
  password: String,
  avatar : String,
  telegramId : String,
  telegramInternalId : Number,
  telegramSystemRefId: String, //jsonId
})

module.exports = mongoose.model('User', UserSchema)
