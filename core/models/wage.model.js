var mongoose = require('mongoose');

var WageSchema = new mongoose.Schema({
  company: {type: mongoose.Schema.Types.ObjectId, ref:'Company'},
  coWorkerCompany :{type: mongoose.Schema.Types.ObjectId, ref:'Company'},
  currency: {type: mongoose.Schema.Types.ObjectId, ref:'Currency'},
  minPrice: Number,
  maxPrice: Number,
  wagePrice: Number,
  fromDate : Date,
  toDate: Date,
  totalCredit: Number,
})

module.exports = mongoose.model('Wage', WageSchema)
