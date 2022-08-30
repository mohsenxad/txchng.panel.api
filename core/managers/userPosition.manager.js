var Promise = require('promise');
var UserPosition;

function create(user, position){
  var newUserPosition = new UserPosition({
    user: user,
    position: position,
    isActive: true,
  });

  return newUserPosition.save()
}


function findOrCreate_user_position(user, position){
  return new Promise(function(resolve, reject) {
    var query = { user: user, position: position };
    UserPosition.findOne(query)
      .then(function(foundUserPosition){
        if(foundUserPosition){
          resolve(foundUserPosition)
        }else{
          create(user, position)
            .then(function(createdUserPosition){
              resolve(createdUserPosition);
            })
            .catch(function(err){
              reject(err);
            })
        }
      })
      .catch(function(err) {
        reject(err);
      })
  });
}

function getAll_positionList(positionIdList){
  var query = {
    position: {
      $in:positionIdList
    }
  };
  return UserPosition
    .find(query)
    .populate('position')
    .populate('user');
}

function getAll_user(user){
  var query = { user: user };
  return UserPosition
  .find(query)
  .populate('position')
  .deepPopulate('position.company');
}

function getAll_position_keyword(position, keyword){
  var query = {
    position: position,
  };

  var populateOptions ={
    path: 'user',
    match:{
      $or: [
          {title: { "$regex": keyword, "$options": "i" }},
          {firstname: { "$regex": keyword, "$options": "i" }},
          {lastname: { "$regex": keyword, "$options": "i" }},
          {cellNumber: { "$regex": keyword, "$options": "i" }},
          {email: { "$regex": keyword, "$options": "i" }},
      ]
    },
    select:'firstname lastname title cellNumber email'
  }

  console.log(populateOptions)
  return UserPosition
  .find(query)
  .populate('position')
  .populate(populateOptions);

}

function get_id(userPositionId){
  var query = { _id: userPositionId };
  return UserPosition
  .findOne(query)
  .populate('user');
}

exports = module.exports = function(options){
  UserPosition = options.userPositionModel;

  this.create = create;
  this.getAll_positionList = getAll_positionList;
  this.findOrCreate_user_position = findOrCreate_user_position;
  this.getAll_user = getAll_user;
  this.getAll_position_keyword = getAll_position_keyword;
  this.get_id = get_id;
}
