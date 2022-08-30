var mongoose = require('mongoose');

var CurrencySchema = new mongoose.Schema({
  name : String,
  ar_name: String,
  code: String,
  type: String, //ISO4217, crypto
  imoji: String,
});

module.exports = mongoose.model('Currency', CurrencySchema);
