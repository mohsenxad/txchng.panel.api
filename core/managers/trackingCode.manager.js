var TrackingCode;

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function createForRequest(request){
  var newTrackingCode = new TrackingCode({
    createAt: new Date(),
    request: request,
    code: makeid(5),
  });

  return newTrackingCode.save();
}

function createForRemittance(remittance){
  var newTrackingCode = new TrackingCode({
    createAt: new Date(),
    remittance: remittance,
    code: makeid(5),
  });

  return newTrackingCode.save();
}

function assignRemittance_request(request, remittance){
  console.log('request, remittance');
  console.log(request, remittance);

  var query = {
    request : request,
  };

  var update = {
    remittance: remittance,
  };

  return TrackingCode
    .findOneAndUpdate(query, update, {new: true});
}

function get_company_code(company, code){
  var query = {
    code : code,
  };

  return TrackingCode.findOne(query)
    .populate('request')
    .deepPopulate(['remittance.intermediateCompany','remittance.distributorCompany','remittance.currency','remittance.intermediateCompanyWageCurrency','remittance.distributorCompanyWageCurrency', 'remittance.receiver.user','remittance.applicant.user'])
    .populate('remittance');

}

exports = module.exports = function(options){
  TrackingCode = options.trackingCodeModel;

  this.createForRequest  = createForRequest;
  this.createForRemittance = createForRemittance;
  this.assignRemittance_request = assignRemittance_request;
  this.get_company_code = get_company_code;
};
