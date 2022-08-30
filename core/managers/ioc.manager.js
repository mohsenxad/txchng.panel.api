var pwdGenerator = require('generate-password');
var axios = require('axios');
var xl = require('excel4node');
var reportStoragePath = '/projects/exchange/core/reportStorage/';
var moment = require('moment');

// models
var DB = require('../models/db');
const UserModel = require('../models/user.model.js');
const CompanyModel = require('../models/company.model.js');
const PositionModel = require('../models/position.model.js');
const UserPositionModel = require('../models/userPosition.model.js');
const RemittanceModel = require('../models/remittance.model.js');
const TransactionModel = require('../models/transaction.model.js');
const CurrencyModel = require('../models/currency.model.js');
const RequestModel = require('../models/request.model.js');
const AuthModel = require('../models/auth.model.js');
const WageModel = require('../models/wage.model.js');
const TrackingCodeModel = require('../models/trackingCode.model.js');
const CreditModel = require('../models/credit.model.js');


// manager Files
const userManagerFile = require('./user.manager');
const companyManagerFile = require('./company.manager');
const positionManagerFile = require('./position.manager');
const userPositionManagerFile = require('./userPosition.manager');
const remittanceManagerFile = require('./remittance.manager');
const transactionManagerFile = require('./transaction.manager');
const currencyManagerFile = require('./currency.manager');
const requestManagerFile = require('./request.manager');
const authManagerFile = require('./auth.manager');
const wageManagerFile = require('./wage.manager');
const trackingCodeManagerFile = require('./trackingCode.manager');
const reportManagerFile = require('./report.manager.js');
const creditManagerFile = require('./credit.manager.js');
const socketManagerFile = require('./socket.manager.js');

// provider Files
const tlgrmExchangeProviderFile = require('../providers/tlgrmExchange.prov');
const excelProviderFile = require('../providers/excel.prov.js');

// provider Objects
var tlgrmExchangeProvider = new tlgrmExchangeProviderFile({ axios: axios });
var excelProvider = new excelProviderFile({ xl: xl });


// manager Objects
var userManager = new userManagerFile({ pwdGenerator: pwdGenerator, userModel: UserModel });
var companyManager = new companyManagerFile({ companyModel: CompanyModel });
var positionManager = new positionManagerFile({ positionModel: PositionModel });
var userPositionManager = new userPositionManagerFile({ userPositionModel: UserPositionModel });
var trackingCodeManager = new trackingCodeManagerFile({ trackingCodeModel: TrackingCodeModel });
var remittanceManager = new remittanceManagerFile({ remittanceModel: RemittanceModel, trackingCodeManager: trackingCodeManager, moment: moment });
var transactionManager = new transactionManagerFile({ transactionModel: TransactionModel });
var currencyManager = new currencyManagerFile({ currencyModel: CurrencyModel });
var requestManager = new requestManagerFile({ requestModel: RequestModel, trackingCodeManager: trackingCodeManager });
var authManager = new authManagerFile({ authModel: AuthModel });
var wageManager = new wageManagerFile({ wageModel: WageModel });
var reportManager = new reportManagerFile({ excelProvider: excelProvider , reportStoragePath: reportStoragePath});
var creditManager = new creditManagerFile({ creditModel: CreditModel });
var socketManager = new socketManagerFile({});

exports = module.exports = function(){
  this.userManager = userManager;
  this.companyManager = companyManager;
  this.positionManager = positionManager;
  this.userPositionManager = userPositionManager;
  this.remittanceManager = remittanceManager;
  this.transactionManager = transactionManager;
  this.currencyManager = currencyManager;
  this.requestManager = requestManager;
  this.authManager = authManager;
  this.wageManager = wageManager;
  this.trackingCodeManager = trackingCodeManager;
  this.reportManager = reportManager;
  this.creditManager = creditManager;
  this.socketManager = socketManager;

  this.tlgrmExchangeProvider = tlgrmExchangeProvider;
  this.excelProvider = excelProvider;
};
