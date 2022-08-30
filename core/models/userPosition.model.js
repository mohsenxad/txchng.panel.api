var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var UserPositionSchema = new mongoose.Schema({
  user : {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  position : {type: mongoose.Schema.Types.ObjectId, ref:'Position'},
  isActive : Boolean,
})

UserPositionSchema.plugin(deepPopulate, {whitelist: ['position.company.name']});

module.exports = mongoose.model('UserPosition', UserPositionSchema)
