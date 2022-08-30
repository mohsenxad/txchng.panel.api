var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var RequestSchema = new mongoose.Schema({
  remittance: {type: mongoose.Schema.Types.ObjectId, ref:'Remittance'},
  distributorCompany: {type: mongoose.Schema.Types.ObjectId, ref:'Company'},
  intermediateCompany: {type: mongoose.Schema.Types.ObjectId, ref:'Company'},
  description: String,
  createAt: Date,
  requestAt: Date,
  price:  Number,
  currency: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
  receiverTitle: String,
  status: String, //intermediate[new, confirmed, canceled, accepted],distributer[read,rejected,waged, accepted ,canceled]
  distributorCompanyWagePrice: Number,
  distributorCompanyWageCurrency: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
  requestActor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestChannel: String, //webApp , tlgrm, mobileApp, windowsApp
  responseActor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responseChannel: String, //webApp , tlgrm, mobileApp, windowsApp
  logList: [mongoose.Schema.Types.Mixed],
});

RequestSchema.plugin(deepPopulate, {whitelist: ['remittance.intermediateCompany','remittance.intermediateCompany.owner','distributorCompany.owner','remittance.receiver.title','remittance.currency']});

module.exports = mongoose.model('Request', RequestSchema);

// intermediate[new] -> distributer[read] -> distributer[rejected] X
//                                       \-> distributer[waged] -> intermediate[canceled] X
//                                                             \-> intermediate[accepted] X
