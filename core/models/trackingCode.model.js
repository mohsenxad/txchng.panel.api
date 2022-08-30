var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var TrackingCodeSchema = new mongoose.Schema({
  createAt: Date,
  code: String,
  request: {type: mongoose.Schema.Types.ObjectId, ref:'Request'},
  remittance: {type: mongoose.Schema.Types.ObjectId, ref:'Remittance'},
});
var remittanceWhiteList = [
  'remittance.intermediateCompany',
  'remittance.distributorCompany',
  'remittance.currency',
  'remittance.intermediateCompanyWageCurrency',
  'remittance.distributorCompanyWageCurrency',
  'remittance.receiver.user',
  'remittance.applicant.user'
];
TrackingCodeSchema.plugin(deepPopulate, {whitelist: remittanceWhiteList});
module.exports = mongoose.model('TrackingCode', TrackingCodeSchema);
