var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var TransactionSchema = new mongoose.Schema({
  company : { type: mongoose.Schema.Types.ObjectId, ref:'Company' },
  customer:{ type: mongoose.Schema.Types.ObjectId, ref:'UserPosition' },
  price : Number,
  currency: {type: mongoose.Schema.Types.ObjectId, ref:'Currency'},
  description: String,
  type: String, //wage, cash
  remittance:{ type: mongoose.Schema.Types.ObjectId, ref:'Remittance' },
  registrationDate: Date,
});

TransactionSchema.plugin(deepPopulate, {whitelist: ['customer.user']});

module.exports = mongoose.model('Transaction', TransactionSchema);
