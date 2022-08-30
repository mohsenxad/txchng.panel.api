const iocManagerFile = require('./ioc.manager');
var ioc = new iocManagerFile({});

function createUser(firstname, lastname) {
  return ioc.userManager.create(firstname, lastname);
}

function createCompany(name) {
  return ioc.companyManager.create(name);
}

function createPosition(company, title) {
  return ioc.positionManager.create(company, title);
}

function createUserPosition(user, position) {
  return ioc.userPositionManager.create(user, position);
}

exports = module.exports = function(){
  this.createUser = createUser;
  this.createCompany = createCompany;
  this.createPosition = createPosition;
  this.createUserPosition = createUserPosition;
}
