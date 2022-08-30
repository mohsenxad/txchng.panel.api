var Promise = require('promise');
var pwdGenerator;
var User;

function create(firstname, lastname, cellNumber, email, title){
  var newUser = new User({
    firstname: firstname,
    lastname: lastname,
    cellNumber: cellNumber,
    email: email,
    title: title,
  });

  return newUser.save();
}

function createWithTitle(title){
  var newUser = new User({
    title: title,
  });

  return newUser.save();
}

function findOrCreate_cellNumber(firstname, lastname, cellNumber){
  return new Promise(function(resolve, reject) {
    var query = { cellNumber: cellNumber };
    User.findOne(query)
    .then(function(user){
      if(user){
        resolve(user)
      }else{
        create(firstname, lastname, cellNumber)
          .then(function(createdUser){
            resolve(createdUser)
          })
          .catch(function(err){
            reject(err);
          })
      }
    })
    .catch(function(err){
      reject(err);
    })
  });
}

function get_telegramSystemRefId(telegramSystemRefId) {
  var query = { telegramSystemRefId: telegramSystemRefId };
  return User.findOne(query);
}

function get_email_password(email, password) {
  var query = { email: email, password: password };
  return User.findOne(query);
}

function get(userId){
  var query = { _id: userId };
  return User.findOne(query);
}

exports = module.exports = function(options){
  pwdGenerator = options.pwdGenerator;
  User = options.userModel;

  this.create = create;
  this.createWithTitle = createWithTitle;
  this.findOrCreate_cellNumber = findOrCreate_cellNumber;
  this.get = get;
  this.get_telegramSystemRefId = get_telegramSystemRefId;
  this.get_email_password = get_email_password;
}
