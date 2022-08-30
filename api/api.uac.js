//add User
//add Company
//add Position
//add User_Position
//remove User_Position
//get User
//get User_Position_By_User
//get User_Position_By_Company
const API_PORT = 7002;
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


const managerFile = require('../core/managers/uacApi.Manager');
var manager = new managerFile({});

app.get('/isAlive',function(req, res){
  res.json({type:true,message:'exchange.uac.api is alive!'})
})

app.get('/user/create',function(req, res) {
  manager
  .createUser('mohsen','xad')
  .then(function(user){
    res.json({ user: user })
  })
  .catch(function(err){
    processError(res,err)
  })
});

app.get('/company/create', function(req, res){
  manager
  .createCompany('mamadExchange')
  .then(function(company){
    res.json({ company: company })
  })
  .catch(function(err){
    processError(res,err);
  })
})

app.get('/position/create', function(req, res){
  var companyId = '5e25908125930e2d541683fb';
  var positionTitle = 'Owner';
  manager
  .createPosition(companyId, positionTitle)
  .then(function(position){
    res.json({ position: position })
  })
  .catch(function(err){
    processError(res,err);
  })
})

app.get('/userPosition/create', function(req, res){
  var positionId = '5e259232bc94f23300f02b3b';
  var userId = '5e258abae06ba52f848e696f';
  manager
  .createUserPosition(positionId, userId)
  .then(function(userPosition){
    res.json({ userPosition: userPosition })
  })
  .catch(function(err){
    processError(res,err);
  })
})

function processError(res,err){
  console.log(err);
  res.json({type:false,message:err.message});
}

app.listen(API_PORT,function(){
  console.log('Init exchange.uac.api on '+API_PORT);
})
