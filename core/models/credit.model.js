var mongoose = require('mongoose');


var CreditSchema = new mongoose.Schema({
  from : { type: mongoose.Schema.Types.ObjectId, ref:'Company' },
  to : { type: mongoose.Schema.Types.ObjectId, ref:'Company' },
  price : Number,
  currency: { type: mongoose.Schema.Types.ObjectId, ref:'Currency' },
  remittance: { type: mongoose.Schema.Types.ObjectId, ref:'Remittance' },
  registrationDate: Date,
  description: String,
});

module.exports = mongoose.model('Credit', CreditSchema);
