var Company;

function create(name, type){
  var newCompany = new Company({
    name: name,
    type : type,
    registerDate : new Date(),
  });

  return newCompany.save()
}

function createWithOwner(name, type , owner){
  var newCompany = new Company({
    name: name,
    type: type,
    owner: owner,
    registerDate : new Date(),
  });

  return newCompany.save()
}

function createWithOwnerAndCurrencyList(name, type , owner, currencyList){
  var newCompany = new Company({
    name: name,
    type: type,
    owner: owner,
    registerDate : new Date(),
    currencyList: currencyList,
  });

  return newCompany.save()
}

function addCurrency(company, currency){
  var condition = {
    _id: company._id,
    currencyList: { $ne: currency }
  };

  var update = {
    $addToSet: { currencyList: currency },
  };

  return Company.findOneAndUpdate(condition, update);
}

function removeCurrency(company, currency){
  var condition = {
    _id: company._id,
    currencyList: { $in: currency }
  };

  var update = {
    $pull: { currencyList: currency },
  };

  return Company.findOneAndUpdate(condition, update);
}

function addCoWorker(company, coWorkerCompany){
  var condition = {
    _id: company._id,
  };

  var update = {
    $addToSet: { coworkerCompanyList: coWorkerCompany },
  }

  return Company.findOneAndUpdate(condition, update);
}

function get_all(){
  return Company.find().populate('owner')
}

function get_id(id) {
  var query = { _id: id }
  return Company
    .findOne(query)
    .populate('owner')
    .populate('currencyList')
    .populate('coworkerCompanyList')
    ;
}

function get_botToken(botToken) {
  var query = { telegramBotToken: botToken };
  return Company.findOne(query).populate('owner');
}

function get_coworkers_company(company){
  var query = { _id : company._id };
  return new Promise(function(resolve, reject) {
    Company.findOne(query)
      .deepPopulate('coworkerCompanyList')
      .exec(function(err, foundCompany){
        if(err){
          reject(err);
        }else{
          if(foundCompany){
            resolve(foundCompany.coworkerCompanyList);
          }else{
            var noCompanyFoundWithIdError = new Error('شرکت متناظر با کد ارسالی یافت نشد.');
            reject(noCompanyFoundWithIdError);
          }
        }
      });
  });

}

function get_currencyList_company(company){
  var query = { _id : company._id };
  return new Promise(function(resolve, reject) {
      Company.findOne(query).populate('currencyList').exec(function(err, foundCompany){
        if(err){
          reject(err);
        }else{
          if(foundCompany){
            resolve(foundCompany.currencyList);
          }else{
            var noCompanyFoundWithIdError = new Error('شرکت متناظر با کد ارسالی یافت نشد.');
            reject(noCompanyFoundWithIdError);
          }
        }
      });
  });

}

function create_coworker(name, email) {

}

exports = module.exports = function(options){
  Company = options.companyModel;

  this.create = create;
  this.createWithOwner = createWithOwner;
  this.get_all = get_all;
  this.get_id = get_id;
  this.get_botToken = get_botToken;
  this.get_coworkers_company = get_coworkers_company;
  this.addCurrency = addCurrency;
  this.removeCurrency = removeCurrency;
  this.addCoWorker = addCoWorker;
  this.get_currencyList_company = get_currencyList_company;
  this.createWithOwnerAndCurrencyList = createWithOwnerAndCurrencyList;
}
