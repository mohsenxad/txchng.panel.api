var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var RemittanceSchema = new mongoose.Schema({
  applicantCountry: String,
  applicantProvince: String,
  applicantCity: String,
  applicant: {type: mongoose.Schema.Types.ObjectId, ref:'UserPosition'},
  intermediateCompany :{type: mongoose.Schema.Types.ObjectId, ref:'Company'},
  intermediateCompanyWagePrice: Number,
  intermediateCompanyWageCurrency: {type: mongoose.Schema.Types.ObjectId, ref:'Currency'},
  distributorCompany: {type: mongoose.Schema.Types.ObjectId, ref:'Company'},
  distributorCompanyWagePrice: Number,
  distributorCompanyWageCurrency: {type: mongoose.Schema.Types.ObjectId, ref:'Currency'},
  receiverCountry: String,
  receiverProvince: String,
  receiverCity: String,
  receiver: {type: mongoose.Schema.Types.ObjectId, ref:'UserPosition'},
  price: Number,
  currency: {type: mongoose.Schema.Types.ObjectId, ref:'Currency'},
  description: String,
  createAt: Date,
  requestAt: Date,
  isDelivered: Boolean,
  deliveryActor : {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  deliveryDate: Date,
  deliveryChannel: String, //tlgrm, webApp, mobileApp
  delivertType: String, //cache, bank
  status: String, //new, delivered, reversed, timeout
  logList: [mongoose.Schema.Types.Mixed],
  attachmentFileNameList:[String]
});

RemittanceSchema.plugin(deepPopulate, {whitelist: ['receiver.user','applicant.user','intermediateCompany.owner','distributorCompany.owner']});

module.exports = mongoose.model('Remittance', RemittanceSchema);

//intermediateCompany[new] -> distributorCompany[delivered] X
//                     \  \-> distributorCompany[reversed] X
//                      \---> system[timeout] X
