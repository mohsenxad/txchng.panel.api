const API_PORT = 8002;
const PACKAGE_NAME = 'exchange.customer.api';
const STORAGE_PATH = '/projects/exchange/storage';

var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer');
var uuid = require('uuid');
var path = require('path');
var cors = require('cors');

var app = express();
var http = require('http').createServer(app);

var io = require('socket.io')(http, {
  maxHttpBufferSize: 1e8,
  pingTimeout: 30000,
  cors: {
    allowEIO3: true,
    cors: {
        origin: true,
        credentials: true
    },
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true } ));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cors());


var documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('werwer');
    cb(null, STORAGE_PATH);
  },

  onError: function (error, next) {
    console.log(error);
    next(error);
  },

  filename: function (req, file, cb) {
    console.log('herere');
    cb(null, uuid.v4() + path.extname(file.originalname));
  },
});

var documentFileUploader = multer({ storage: documentStorage });

const managerFile = require('../core/managers/customerPanel.manager');
var manager = new managerFile({});

app.get('/isAlive',function(req, res){
  console.log('is Alive');
  res.json({ type: true, message:'exchange.customer.api is alive!' });
});

// ========= [Transaction] ========================

app.post('/transaction/getAll_company',checkAccess, function(req, res) {
  var company = req.company;
  manager
    .getAll_transaction_company(company)
    .then(function(transactionList){
      res.json({transactionList: transactionList});
    })
    .catch(function(err){
      processError(res, err);
    });
})

app.post('/transaction/getAll_company_dateTimeRange',checkAccess, function(req, res) {
  var company = req.company;
  let fromDateTime = req.body.fromDateTime;
  let toDateTime = req.body.toDateTime;
  manager
    .getAll_transaction_company_dateTimeRange(company,fromDateTime,toDateTime)
    .then(function(transactionList){
      res.json({transactionList: transactionList});
    })
    .catch(function(err){
      processError(res, err);
    });
})

app.post('/transaction/create',checkAccess, function(req, res) {
  let company = req.company;
  let receiverUserPositionId = req.body.receiverUserPositionId;
  let price = req.body.price;
  let currencyId = req.body.currencyId;
  let description = req.body.description;

  manager
    .create_transaction(company, receiverUserPositionId, price, currencyId, description)
    .then(function(transaction){
      res.json({transaction: transaction});
    })
    .catch(function(err){
      processError(res, err);
    });
})

app.post('/transaction/createFromRemittance',checkAccess, function(req, res) {
  let company = req.company;
  let receiverUserPositionId = req.body.receiverUserPositionId;
  let price = req.body.price;
  let currencyId = req.body.currencyId;
  let description = req.body.description;
  let remittanceId = req.body.remittanceId;

  manager
    .create_transaction_from_remittance(company, receiverUserPositionId, price, currencyId, description, remittanceId)
    .then(function(transaction){
      res.json({transaction: transaction});
    })
    .catch(function(err){
      processError(res, err);
    });
})

app.post('/transaction/getAllCompany', checkAccess, function (req, res) {
  let company = req.company;
  manager
    .getTotalTransactionCompany(company)
    .then(function(dataSet){
      var data = { dataSet: dataSet };
      processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.post('/transaction/getTotal_company_dateTimeRange', checkAccess, function (req, res) {
  let company = req.company;
  let fromDateTime = req.body.fromDateTime;
  let toDateTime = req.body.toDateTime;
  console.log(fromDateTime , toDateTime);
  manager
    .getTotalTransactionCompanyDateTimeRange(company, fromDateTime, toDateTime)
    .then(function(dataSet){
      var data = { dataSet: dataSet };
      processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});


app.post('/credit/create',checkAccess, function(req, res) {
  let company = req.company;
  let coworkerCompanyId = req.body.coworkerCompanyId;
  let price = req.body.price;
  let currencyId = req.body.currencyId;
  let description = req.body.description;

  manager
    .create_credit(company, coworkerCompanyId, price, currencyId, description)
    .then(function(createdCredit){
      res.json({credit: createdCredit});
    })
    .catch(function(err){
      processError(res, err);
    });
})

app.post('/credit/getTotal',checkAccess, function(req, res){
  let company = req.company;
  manager
    .getTotalCreditCompany(company)
    .then(function(dataSet){
      var data = { dataSet: dataSet };
      processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
})

app.post('/credit/getTotal_company_dateTimeRange', checkAccess, function (req, res) {
  let company = req.company;
  let fromDateTime = req.body.fromDateTime;
  let toDateTime = req.body.toDateTime;
  manager
    .getTotalCreditCompanyDateTimeRange(company, fromDateTime, toDateTime)
    .then(function(dataSet){
      var data = { dataSet: dataSet };
      processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.post('/credit/getAll_company_dateTimeRange',checkAccess, function(req, res) {
  var company = req.company;
  let fromDateTime = req.body.fromDateTime;
  let toDateTime = req.body.toDateTime;
  manager
    .getAll_credit_company_dateTimeRange(company,fromDateTime,toDateTime)
    .then(function(foundCreditList){
      res.json({creditList: foundCreditList});
    })
    .catch(function(err){
      processError(res, err);
    });
})


app.post('/remittance/add', checkAccess, function(req, res) {
  var applicant = req.body.applicant;
  var receiver = req.body.receiver;
  var price = req.body.remittance.price;
  var currencyId = req.body.remittance.currencyId;
  var intermediateCompanyWagePrice = req.body.remittance.intermediateCompanyWagePrice;
  var intermediateCompanyWageCurrencyId = req.body.remittance.intermediateCompanyWageCurrencyId;
  var intermediateCompany = req.company;
  manager
    .create_remittance(intermediateCompany, applicant, receiver, price, currencyId, intermediateCompanyWagePrice, intermediateCompanyWageCurrencyId)
    .then(function(remittance){
      res.json({remittance: remittance})
    })
    .catch(function(err){
      processError(res, err);
    })
})

app.post('/remittance/addDistribution', checkAccess, function(req, res) {
  var receiver = req.body.receiver;
  var price = req.body.remittance.price;
  var currencyId = req.body.remittance.currencyId;
  var distributorCompanyWage = req.body.distributorCompanyWage;
  var intermediateCompany = req.body.intermediateCompany;
  var distributionCompany = req.company;
  manager
    .create_distribution(intermediateCompany, receiver, price, currencyId, distributionCompany,distributorCompanyWage.price, distributorCompanyWage.currencyId)
    .then(function(remittance){
      res.json({remittance: remittance})
    })
    .catch(function(err){
      processError(res, err);
    })
})

app.post('/remittance/setDistributorCompany', checkAccess, function(req, res) {
  var distributorCompany = req.body.distributorCompany;
  var distributorCompanyWage = req.body.distributorCompanyWage;
  var remittanceId = req.body.remittanceId;
  var intermediateCompany = req.company;
  manager
    .setDistributorCompany(intermediateCompany, remittanceId, distributorCompany, distributorCompanyWage.price, distributorCompanyWage.currencyId)
    .then(function(remittance){
      res.json({remittance: remittance})
    })
    .catch(function(err){
      processError(res, err);
    })
})

app.post('/remittance/get_remittance_intermediateCompany_id', checkAccess, function(req, res) {
  var remittanceId = req.body.remittanceId;
  var intermediateCompany = req.company;
  manager
    .get_remittance_intermediateCompany_id(intermediateCompany, remittanceId)
    .then(function(remittance){
      res.json({remittance: remittance})
    })
    .catch(function(err){
      processError(res, err);
    })
})

app.post('/remittance/get_remittance_distributorCompany_id', checkAccess, function(req, res) {
  var remittanceId = req.body.remittanceId;
  var distributorCompany = req.company;
  console.log('get_remittance_distributorCompany_id');
  console.log(remittanceId);
  manager
    .get_remittance_distributorCompany_id(distributorCompany, remittanceId)
    .then(function(remittance){
      res.json({remittance: remittance})
    })
    .catch(function(err){
      processError(res, err);
    })
})

app.post('/remittance/getAll_intermediateCompany', checkAccess, function (req, res) {
  var intermediateCompany = req.company;
  manager
    .getAll_remittance_intermediateCompany(intermediateCompany)
    .then(function(remittanceList){
      res.json( { remittanceList: remittanceList } )
    })
    .catch(function(err){
      processError(res, err);
    })
})

app.post('/remittance/getAll_distributionCompany', checkAccess, function (req, res) {
  let distributorCompany = req.company;
  manager
    .getAll_remittance_distributorCompany(distributorCompany)
    .then(function(remittanceList){
      var data = { remittanceList: remittanceList };
      processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
})

app.post('/remittance/getAll_distributionCompany_status', checkAccess, function (req, res) {
  let distributorCompany = req.company;
  let status = req.body.status;
  manager
    .getAll_remittance_distributorCompany_status(distributorCompany, status)
    .then(function(remittanceList){
      var data = { remittanceList: remittanceList };
      processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
})

app.post('/remittance/getAll_distributionCompany_dateTimeRange', checkAccess, function (req, res) {
  let distributorCompany = req.company;
  let fromDateTime = req.body.fromDateTime;
  let toDateTime = req.body.toDateTime;
  console.log('fromDateTime');
  console.log(fromDateTime);
  console.log('toDateTime');
  console.log(toDateTime);
  manager
    .getAll_remittance_distributorCompany_dateTimeRange(distributorCompany, fromDateTime,toDateTime)
    .then(function(remittanceList){
      var data = { remittanceList: remittanceList };
      processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.post('/remittance/reverse', checkAccess, function (req, res) {
  var distributorCompany = req.company;
  var remittanceId = req.body.remittanceId;
  var actor = req.user;

  manager
    .reverseRemittance(distributorCompany, actor, remittanceId, 'webApp')
    .then(function(reversedRemittance){
      var data  = { remittance: reversedRemittance };
      processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.post('/remittance/delivered', checkAccess, function (req, res) {
  var distributorCompany = req.company;
  var remittanceId = req.body.remittanceId;
  var actor = req.user;

  manager
    .deliveredRemittance(distributorCompany, actor, remittanceId, 'webApp')
    .then(function(deliveredRemittance){
      var data = { remittance: deliveredRemittance };
        processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.post('/remittance/uploadFile', documentFileUploader.single('file'), checkAccess, function(req,res){
  var filename = req.file.filename;
  var distributorCompany = req.company;
  var remittanceId = req.body.remittanceId;
  var actor = req.user;
  console.log('remittanceId');
  console.log(remittanceId);

  manager.setAttachment(distributorCompany, filename, remittanceId, actor, 'webApp')
    .then(function(updatedRemittance){
      res.json({type:true});
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.post('/remittance/getTotalPending', checkAccess, function (req, res) {
  var distributorCompany = req.company;
  var actor = req.user;

  manager
    .getTotalPendingDistribution(distributorCompany)
    .then(function(dataSet){
      var data = { dataSet: dataSet };
      processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});


app.post('/remittance/getTodayTotalPending', checkAccess, function (req, res) {
  var distributorCompany = req.company;
  var actor = req.user;

  manager
    .getTotalPendingDistributionToDay(distributorCompany)
    .then(function(dataSet){
      var data = { dataSet: dataSet };
      processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});


app.post('/remittance/getTodayTotalDelivered', checkAccess, function (req, res) {
  var distributorCompany = req.company;
  var actor = req.user;

  manager
    .getTotalDeliveredDistributionToDay(distributorCompany)
    .then(function(dataSet){
      var data = { dataSet: dataSet };
      processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.get('/remittance_distributorCompany/export/:token', function(req, res){
  var token = req.params.token;
  if(token){
    manager.getCompany_token(token)
      .then(function(access){
        console.log(access);
        req.company = access.company;
        req.user = access.auth.user;
        manager.exportRemittanceList_distributorCompany(access.company)
          .then(function(exporetedFilePath){
            res.sendFile(exporetedFilePath);
          })
          .catch(function(err){
            processError(res, err);
          });
      })
      .catch(function(err){
        console.log(err);
        processError(res, err);
      });
  }else{
    var noTokenProvidedError = new Error('Access Forbidden');
    processError(res, noTokenProvidedError);
  }
});

app.get('/remittance_intermediateCompany/export/:token', function(req, res){
  var token = req.params.token;
  if(token){
    manager.getCompany_token(token)
      .then(function(access){
        console.log(access);
        req.company = access.company;
        req.user = access.auth.user;
        manager.exportRemittanceList_intermediateCompany(access.company)
          .then(function(exporetedFilePath){
            res.sendFile(exporetedFilePath);
          })
          .catch(function(err){
            processError(res, err);
          });
      })
      .catch(function(err){
        console.log(err);
        processError(res, err);
      });
  }else{
    var noTokenProvidedError = new Error('Access Forbidden');
    processError(res, noTokenProvidedError);
  }
});

app.get('/remittance/getAttachment/:token/:attachmentFileName',checkAccess, function(req, res){
  let attachmentFileName = req.params.attachmentFileName;
  let fileLocation = STORAGE_PATH + '/' +attachmentFileName;
  res.sendFile(fileLocation);
});


app.post('/request/createForRemittance', checkAccess, function(req, res){
  var intermediateCompany = req.company;
  var remittanceId = req.body.remittanceId;
  var distributorCompany = req.body.distributorCompany;
  manager
    .create_request(intermediateCompany, remittanceId, distributorCompany)
    .then(function(createdRequest){
      res.json({request: createdRequest})
    })
    .catch(function(err){
      processError(res, err);
    })
})

app.post('/request/getAll_company', checkAccess, function(req, res){
  var company = req.company;
  manager
    .getAllRequest_company(company)
    .then(function(requestList){
      res.json({ requestList: requestList });
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.post('/request/getAll_company_dateTimeRange', checkAccess, function(req, res){
  var company = req.company;
  var fromDateTime = req.body.fromDateTime;
  var toDateTime = req.body.toDateTime;
  console.log('fromDateTime');
  console.log(fromDateTime);
  console.log('toDateTime');
  console.log(toDateTime);
  manager
    .getAllRequest_company_dateTimeRange(company, fromDateTime, toDateTime)
    .then(function(requestList){
      res.json({ requestList: requestList });
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.post('/request/setWage', checkAccess, function(req, res) {
    var company = req.company;
    var distributorCompanyWagePrice = req.body.distributorCompanyWagePrice;
    var distributorCompanyWageCurrencyId = req.body.distributorCompanyWageCurrencyId;
    var requestId = req.body.requestId;
    manager
      .setRequestWage(company, requestId, distributorCompanyWagePrice, distributorCompanyWageCurrencyId, undefined, 'webApp')
      .then(function(updatedRequest){
        processSuccess(res, {request: updatedRequest});
      })
      .catch(function(err){
        processError(res, err);
      })
})

app.post('/request/reject', checkAccess, function(req, res) {
    var company = req.company;
    var requestId = req.body.requestId;
    manager
      .rejectRequest(company, undefined, requestId, 'webApp')
      .then(function(updatedRequest){
        processSuccess(res, {request: updatedRequest});
      })
      .catch(function(err){
        processError(res, err);
      })
})

app.get('/request/export/:token', function(req, res){
  var token = req.params.token;
  if(token){
    manager.getCompany_token(token)
      .then(function(access){
        console.log(access);
        req.company = access.company;
        req.user = access.auth.user;
        manager.exportRequestList(access.company)
          .then(function(exporetedFilePath){
            res.sendFile(exporetedFilePath);
          })
          .catch(function(err){
            processError(res, err);
          });
      })
      .catch(function(err){
        console.log(err);
        processError(res, err);
      });
  }else{
    var noTokenProvidedError = new Error('Access Forbidden');
    processError(res, noTokenProvidedError);
  }
});


app.post('/company/get_coworkers_company',checkAccess, function(req, res) {
  var company = req.company;
  manager
    .get_coworkers_company(company)
    .then(function(companyList){
      res.json({companyList: companyList})
    })
    .catch(function(err){
      processError(res, err);
    })
})

app.post('/company/getCurrencyList',checkAccess, function(req, res) {
  var company = req.company;
  manager
    .get_currencyList_company(company)
    .then(function(currencyList){
      res.json({currencyList: currencyList})
    })
    .catch(function(err){
      processError(res, err);
    })
})

app.post('/company/addCoWorker', checkAccess, function(req, res) {
  var company = req.company;
  var coWorkercompany = req.body.coWorkercompany;
  var owner = req.body.owner;

  manager
    .add_co_worker(company, coWorkercompany.name, coWorkercompany.email, owner.firstname, owner.lastname, owner.cellNumber, owner.email)
    .then(function(company){
      res.json( {company: company} )
    })
    .catch(function(err){
      processError(res, err);
    })
})


app.post('/currency/getAll', checkAccess, function(req, res){
  var company = req.company;
  manager
    .getAll_currency()
    .then(function(currencyList){
      res.json({currencyList: currencyList})
    })
    .catch(function(err){
      processError(res, err);
    })
})

app.post('/currency/addToCompany', checkAccess, function(req, res){
  var company = req.company;
  var currencyId = req.body.currencyId;
  manager
    .addCurrencyToCompany(company, currencyId)
    .then(function(addedCurrency){
      res.json({currency: addedCurrency});
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.post('/currency/removeFromCompany', checkAccess, function(req, res){
  var company = req.company;
  var currencyId = req.body.currencyId;
  manager
    .removeCurrencyFromCompany(company, currencyId)
    .then(function(removedCurrency){
      res.json({currency: removedCurrency});
    })
    .catch(function(err){
      processError(res, err);
    });
});


app.post('/wage/getAll', checkAccess, function(req, res){
  var company = req.company;
  manager
    .getWageList_Company(company)
    .then(function(wageList){
      res.json({wageList: wageList});
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.post('/wage/add', checkAccess, function(req, res){
  var company = req.company;
  var wage = req.body.wage;
  manager
    .createWageRule(company, wage.coWorkerCompanyId, wage.currencyId, wage.minPrice, wage.maxPrice, wage.price)
    .then(function(createdWageRule){
      res.json({wage: createdWageRule});
    })
    .catch(function(err){
      processError(res, err);
    });
});


app.post('/trackingCode/get', checkAccess, function(req, res){
  var company = req.company;
  var trackingCode = req.body.trackingCode;
  manager.getTrackingCode(company, trackingCode)
    .then(function(foundTarckingCode){
      var data = { trackingCode: foundTarckingCode };
      processSuccess(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});


app.post('/userPosition/getAllByKeywordAndPositionTitle', checkAccess, function(req, res){
  var company = req.company;
  var keyword = req.body.keyword;
  var positionTitle = req.body.positionTitle;

  manager.searchUserPositionByKeyword(company, keyword, positionTitle)
  .then(function(foundUserPositionList){
    var data = { userPositionList: foundUserPositionList };
    processSuccess(res, data);
  })
  .catch(function(err){
    processError(res, err);
  });

});

app.post('/userPosition/getAll', checkAccess, function(req, res){
  var company = req.company;

  manager.getAllCompanyUserPositionListWithUser(company)
  .then(function(foundUserPositionList){
    var data = { userPositionList: foundUserPositionList };
    processSuccess(res, data);
  })
  .catch(function(err){
    processError(res, err);
  });

});


app.post('/user/login', function(req, res) {

console.log('we are here at login');

  var email = req.body.email;
  var password = req.body.password;

  console.log('we are here');

  if(email && password){
    manager.getTokenByEmailAndPassword(email.toString().trim(), password.toString().trim())
      .then(function(foundAuth){
        var params = { auth: foundAuth};
        processSuccess(res, params);
      })
      .catch(function(err){
        processError(res, err);
      });
  }else{
    processError(res, new Error('Invalid Login'));
  }
});

function processSuccess(res,data){
  res.json(data);
}

function processError(res ,err) {
  console.log(err);
  res.status(400).json({ message: err.message });
}

function checkAccess(req,res,callback){
  var token = req.body.token || req.params.token;
  manager.getCompany_token(token)
    .then(function(access){
       req.company = access.company;
       req.user = access.auth.user;
      callback();
      let noCreditMessage = 'Your service contract has been expired. Please contact support';
      //processError(res, new Error(noCreditMessage));
    })
    .catch(function(err){
      processError(res, err);
    });
}

io.on('connection', function(socket){
  //console.log(`Socket Connected :: ${socket.user.title}`);
  manager.addNewSocketConnection(socket);
});

io.use(checkSocketAuth);

function checkSocketAuth(socket, callBack){
  var query = socket.handshake.query;
  console.log(query);
  var token = query.token;
  if(token){

    manager.getCompany_token(token)
      .then(function(access){
        socket.company = access.company;
        socket.user = access.auth.user;
        callback();
      })
      .catch(function(err){
        console.log(err);
        socket.close();
      });
  }else{
    let errorMessage = 'Access Denied on socket connection';
    console.log(errorMessage);
    //callback();
    //socket.conn.close(403,errorMessage);
  }
}

http.listen(API_PORT,function(){
  console.log('Init ' + PACKAGE_NAME + ' on ' + API_PORT);
});
