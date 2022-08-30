const API_PORT = 8001;
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


const managerFile = require('../core/managers/adminPanel.Manager');
var manager = new managerFile({});

app.get('/isAlive',function(req, res){
  res.json({ type: true, message:'exchange.uac.admin.api is alive!' })
})

app.post('/company/add', function(req, res) {
  var company = req.body.company;
  var owner = req.body.owner;
  manager.create_company(company, owner)
    .then(function(company){
      res.json({company: company})
    })
    .catch(function(err){
      processError(res, err);
    })
})

app.get('/company/getAll', function(req, res){
  manager
  .get_company_all()
  .then(function(companyList){
    res.json({ companyList: companyList })
  })
  .catch(function(err){
    processError(res,err);
  })
})

app.get('/company/get_id/:companyId', function(req, res){
  var companyId = req.params.companyId;
  manager
  .get_company_id(companyId)
  .then(function(company){
    res.json({ company: company })
  })
  .catch(function(err){
    processError(res,err);
  })
})

app.post('/currency/add',function(req, res){
  var currency = req.body.currency;
  manager.addCurrency(currency.name, currency.code, currency.type)
    .then(function(addedCurrency){
      res.json( {currency : addedCurrency })
    })
    .catch(function(err){
      processError(res,err);
    })
})

app.get('/currency/list',function(req, res){
  manager.getAllCurrency()
  .then(function(currencyList){
    res.json( {currencyList : currencyList })
  })
  .catch(function(err){
    processError(res,err);
  })
})

function processError(res ,err) {
  console.log(err);
  res.json({ type: false, message: err.message });
}

app.listen(API_PORT,function(){
  console.log('Init exchange.uac.admin.api on '+API_PORT);
})
