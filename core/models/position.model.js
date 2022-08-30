var mongoose = require('mongoose');

var PositionSchema = new mongoose.Schema({
  company : { type: mongoose.Schema.Types.ObjectId, ref:'Company' },
  title : String, //'applicant','receiver','owner',
});

module.exports = mongoose.model('Position', PositionSchema);
