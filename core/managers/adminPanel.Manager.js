const iocManagerFile = require('./ioc.manager');
var ioc = new iocManagerFile({});

function get_company_all() {
  return ioc.companyManager.get_all();
}

function get_company_id(companyId) {
  return ioc.companyManager.get_id(companyId);
}

function create_company(company, owner) {
  return new Promise(function(resolve, reject) {
    ioc.userManager.create(owner.firstname, owner.lastname)
    .then(function(ownerUser){
      ioc.companyManager.createWithOwner(company.name, company.type, ownerUser)
        .then(function(company){
          resolve(company)
        })
        .catch(function(err){
          reject(err);
        })
    })
    .catch(function(err){
      reject(err);
    })
  });
}

function addCurrency(name, code, type){
  return ioc.currencyManager.add(name, code, type)
}

function getAllCurrency(){
  return ioc.currencyManager.getAll();
}

exports = module.exports = function(){
  this.get_company_all = get_company_all;
  this.get_company_id = get_company_id;
  this.create_company = create_company;
  this.addCurrency = addCurrency;
  this.getAllCurrency = getAllCurrency;
}
