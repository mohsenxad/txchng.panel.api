var Auth

var authManager = {};

function create(){
  var newAuth = new Auth({
    authToken : Math.floor(Math.random()* (99999 - 10000 + 1) + 10000),
    createDate : new Date()
  });

  return newAuth.save();
}

function createForUser(user){
  var newAuth = new Auth({
    user: user,
    authToken : Math.floor(Math.random()* (99999 - 10000 + 1) + 10000),
    createDate : new Date()
  });

  return newAuth.save();
}

function get(authId) {
  var query = {
    _id : authId,
  };

  return Auth.findOne(query).populate('user');
}

function getOrCreateByUser(user){
  return new Promise(function(resolve, reject) {
      var query = { user: user };
      Auth.findOne(query).populate('user')
        .then(function(foundAuth){
          if(foundAuth) {
            resolve(foundAuth);
          } else {
            createForUser(user)
              .then(function(createdAuth){
                resolve(createdAuth);
              })
              .catch(function(err){
                reject(err);
              });
          }
        })
        .catch(function(err){
          reject(err);
        });
  });


}

module.exports = exports = function(options) {
  Auth = options.authModel;

  this.create = create;
  this.getOrCreateByUser = getOrCreateByUser;
  this.get = get;
};
