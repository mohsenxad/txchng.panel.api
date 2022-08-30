const API_PORT = 7001;
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const managerFile = require('../core/managers/remittaceApi.manager');
var manager = new managerFile({});

app.get('/isAlive',function(req, res){
  res.json({ type: true, message: 'exchange.remittance.api is alive!' } )
})

app.get('/remittance/create', function(req, res){
  var applicantUserPositionId = '5e25a72a1e3dc52e24e3be15';
  var intermediateCompanyId_Hassan = '5e25a0e61e3dc52e24e3be0a';
  var distributorCompanyId_Mammad = '5e25908125930e2d541683fb';
  var price = 1000;
  var currency = 'Amirican_Dollar';
  var receiverUserPositionId = '5e25a7841e3dc52e24e3be18';
  var requestAt = new Date();

  manager
  .createRemittance(applicantUserPositionId, intermediateCompanyId_Hassan, distributorCompanyId_Mammad, price, currency, receiverUserPositionId, requestAt)
  .then(function(remittance){
    res.json({ remittance: remittance })
  })
  .catch(function(err){
    processError(res,err)
  })
})

function processError(res, err) {
  console.log(err);
  res.json({ type: false, message: err.message });
}

app.listen(API_PORT, function() {
  console.log('Init exchange.remittance.api on ' + API_PORT);
})
