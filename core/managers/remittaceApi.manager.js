const iocManagerFile = require('./ioc.manager');
var ioc = new iocManagerFile({});

function createRemittance(applicant, intermediateCompany, distributorCompany, price, currency, receiver, requestAt) {
  return ioc.remittanceManager.create(applicant, intermediateCompany, distributorCompany, price, currency, receiver, requestAt);
}



exports = module.exports = function(){
  this.createRemittance = createRemittance;

}
