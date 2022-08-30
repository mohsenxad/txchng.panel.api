var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var CompanySchema = new mongoose.Schema({
  name : String,
  country : String,
  province: String,
  city: String,
  area : String,
  address : String,
  timezone: String,
  phoneList: [String],
  isActive: Boolean,
  availableCurrencyList : [String],
  type: String, //tester,member,customer
  status: String,// active,suspend,
  owner : { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  registerDate: Date,
  coworkerCompanyList:[{ type: mongoose.Schema.Types.ObjectId, ref:'Company' }],
  currencyList: [{ type: mongoose.Schema.Types.ObjectId, ref:'Currency' }],
  email: String,
  telegramBotToken: String,
});

CompanySchema.plugin(deepPopulate, 'coworkerCompanyList.owner');
module.exports = mongoose.model('Company', CompanySchema);
