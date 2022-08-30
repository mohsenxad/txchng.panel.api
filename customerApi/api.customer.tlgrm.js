const API_PORT = 8003;
const API_PACKAGE_NAME = 'exchange.tlgrm.api';

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true } ));

var managerFile = require('../core/managers/customerPanel.manager');
var manager = new managerFile({});

app.get('/isAlive',function(req, res){
  var data = { type: true, message: API_PACKAGE_NAME +' is alive!' };
  processResponse(res, data);
});

app.post('/company/getCurrencyList',checkAccess, function(req, res) {
  var company = req.company;
  var disterbutorCompany = { _id: req.body.disterbutorCompanyId };
  manager
    .get_currencyList_company(disterbutorCompany)
    .then(function(currencyList){
      var data = { currencyList: currencyList };
      processResponse(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.post('/company/getByBotToken',checkAccess, function(req, res) {
  var company = req.company;
  var botToken = req.body.botToken;
  manager
    .getCompanyByBotToken(botToken)
    .then(function(company){
      var data = { company: company };
      processResponse(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});


app.post('/request/create',checkAccess, function(req, res) {
  var intermediateCompany = req.company;
  var distributorCompany = { _id: req.body.distributorCompanyId };
  var price = parseInt(req.body.price);
  var currencyId = req.body.currencyId;
  var receiverTitle = req.body.receiverTitle;
  var actor = req.user;
  var requestAt = req.body.requestAt;

  manager.createNewRequest(distributorCompany, intermediateCompany, requestAt, price, currencyId, receiverTitle, 'new', actor, 'tlgrm')
    .then(function(createdRequest){
      var data =  { request: createdRequest };
      processResponse(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});


app.post('/request/acceptWaged',checkAccess, function(req, res) {
  var distributorCompany = req.company;
  var actor = req.user;
  var requestId = req.body.requestId;

  manager
    .acceptWagedRequest(distributorCompany, actor, requestId, 'tlgrm')
    .then(function(createdRemittance){
      var data = { remittance: createdRemittance };
      processResponse(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});

app.post('/request/canceledWaged',checkAccess, function(req, res) {
  var distributorCompany = req.company;
  var actor = req.user;
  var requestId = req.body.requestId;

  manager
    .cancelWagedRequest(distributorCompany, actor, requestId, 'tlgrm')
    .then(function(canceledRequest){
      var data = { request: canceledRequest };
      processResponse(res, data);
    })
    .catch(function(err){
      processError(res, err);
    });
});


app.post('/userPosition/checkAccess',checkAccess, function(req, res) {
  var data = {
    access: {
      role: req.role,
      company: req.company
    }
  };

  processResponse(res, data);
});


app.post('/remittance/list' ,checkAccess, function(req, res) {
  var distributorCompany = req.company;
  var actor = req.user;
  manager.getAll_remittance_distributorCompany(distributorCompany)
    .then(function(remittanceList){
      processResponse(res, { remittanceList: remittanceList });
    })
    .catch(function(err){
      processError(res, err);
    });
});

function processResponse(res, data){
    res.json(data);
}

function processError(res ,err) {
  console.log(err);
  res.json({ type: false, message: err.message });
}

function checkAccess(req,res,callback){

  console.log('asdfasdfasdf');
  var telegramSystemRefId = req.body.tlgrmSystemUserId;
  var botToken = req.body.botToken;
  if(
    telegramSystemRefId &&
    botToken
  ){
    console.log('step 1');
    manager.getCompanyByBotToken(botToken)
      .then(function(foundCompany){
        if(foundCompany){
          manager.getUserBytelegramSystemRefId(telegramSystemRefId)
            .then(function(foundUser){
              if(foundUser){
                console.log('foundUser in checkAccess');
                console.log(foundUser);
                req.user = foundUser;
                manager.getUserPositionList(foundUser)
                  .then(function(foundUserPositionList){
                    if(foundUserPositionList && foundUserPositionList.length > 0){
                      console.log('foundUserPositionList in checkAccess');
                      console.log(foundUserPositionList);
                      req.role = 'unknown';
                      var adminPosition = foundUserPositionList.find(function(userPosition){
                        if(
                          userPosition.position.title == 'owner' &&
                          userPosition.position.company.telegramBotToken &&
                          userPosition.position.company.telegramBotToken == botToken
                        ){
                          return userPosition;
                        }
                      })
                      if(adminPosition){
                        console.log('adminPosition');
                        console.log(adminPosition);
                        req.role = 'admin';
                        req.company = adminPosition.position.company;
                        console.log(foundUser.firstname+ ' ' + foundUser.lastname+ ' is ' + adminPosition.position.title + ' of ' + req.company.name);
                        callback();
                      } else {
                        var coWorkerPosition = foundUserPositionList.find(function(userPosition){
                          if(
                            userPosition.position.title == 'owner' &&
                            foundCompany.coworkerCompanyList.includes(userPosition.position.company._id)
                          ){
                            return userPosition;
                          }
                        });
                        if(coWorkerPosition){
                          console.log('coWorkerPosition');
                          console.log(coWorkerPosition);
                          req.role = 'coWorker';
                          req.company = coWorkerPosition.position.company;
                          console.log(foundUser.firstname+ ' ' + foundUser.lastname+ ' is ' + coWorkerPosition.position.title + ' of ' + req.company.name);
                          callback();
                        } else {
                          res.json({ role: 'unknown'})
                        }
                      }
                    } else {
                      res.json({ role: 'unknown'})
                    }
                  })
                  .catch(function(err){
                    console.log(err);
                  })

              }else{
                res.json({ role: 'unknown'})
              }
            })
            .catch(function(err){
              console.log(err);
            })
        }else{
          res.json({ role: 'unknown'})
        }
      })
      .catch(function(err){
        console.log(err);
        reject(err);
      })
  } else {
    console.log('step 2');
    res.json({ role: 'unknown'})
  }

}

app.listen(API_PORT,function(){
  console.log('Init ' + API_PACKAGE_NAME + ' on: '+API_PORT);
});
