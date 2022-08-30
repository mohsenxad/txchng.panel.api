var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/exchange',function(err){
  if(err){
    console.log(err);
  }else{
    console.log('connected to exchange');
  }
});
