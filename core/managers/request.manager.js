var Request;
var trackingCodeManager;

function createForRemittance(remittance, distributorCompany, requestAt) {
  var newRequest = new Request({
    remittance: remittance,
    distributorCompany: distributorCompany,
    requestAt: requestAt,
    createAt: new Date(),
    status: 'new',
  });

  return newRequest.save();
}

function create(distributorCompany, intermediateCompany, requestAt, price, currency, receiverTitle, status, actor, channel) {


  var newRequest = new Request({
    distributorCompany: distributorCompany,
    intermediateCompany: intermediateCompany,
    requestAt: requestAt,
    createAt: new Date(),
    status: status,
    price: price,
    currency: currency,
    receiverTitle: receiverTitle,
  });

  var logListItem = {
    actor: actor,
    date: new Date(),
    action: 'Submit New Request',
    channel: channel,
  };

  newRequest.logList.push(logListItem);

  return new Promise(function(resolve, reject) {
    newRequest.save(function(err, savedRequest){
      if(err){
        reject(err);
      }else{
        trackingCodeManager.createForRequest(savedRequest)
        .then(function(createdTrackingCode){
          resolve(savedRequest);
        })
        .catch(function(err){
          reject(err);
        });
      }
    });
  });
}

function getAll_distributorCompany(distributorCompany) {
  var query = { distributorCompany: distributorCompany };
  return Request.find(query)
    .populate('remittance')
    .populate('currency')
    .populate('intermediateCompany')
    .populate('distributorCompany')
    .populate('distributorCompanyWageCurrency')
    .limit(500)
    .sort('-createAt');
}

function getAll_distributorCompany_fromDateTime_toDateTime(distributorCompany, fromDateTime, toDateTime) {
  var query = {
      distributorCompany: distributorCompany,
      requestAt: {
        $gte: fromDateTime,
        $lte: toDateTime
      }
    };
  return Request.find(query)
    .populate('remittance')
    .populate('currency')
    .populate('intermediateCompany')
    .populate('distributorCompany')
    .populate('distributorCompanyWageCurrency')
    .limit(500)
    .sort('-createAt');
}

function get(requestId){
  var query = { _id: requestId };
  return Request.findOne(query)
    .deepPopulate(['remittance.intermediateCompany', 'remittance.intermediateCompany.owner','distributorCompany.owner','remittance.receiver','remittance.currency'])
    .populate('distributorCompany')
    .populate('distributorCompanyWageCurrency')
}

function get_requestId_distributorCompany(requestId, distributorCompany){
  var query = {
    _id: requestId,
    distributorCompany: distributorCompany
  };
  return Request.findOne(query)
    .deepPopulate(['remittance.intermediateCompany', 'remittance.intermediateCompany.owner','distributorCompany.owner','remittance.receiver','remittance.currency'])
    .populate('distributorCompany')
    .populate('distributorCompanyWageCurrency')
    .limit(500)
}

function setWage(requestId, distributorCompany, distributorCompanyWagePrice, distributorCompanyWageCurrency, responseActor, responseChannel) {
  var query = {
    _id: requestId,
    distributorCompany: distributorCompany
  };


  var update = {
    status: 'waged',
    distributorCompanyWagePrice: distributorCompanyWagePrice,
    distributorCompanyWageCurrency: distributorCompanyWageCurrency,
    responseActor: responseActor,
    responseChannel: responseChannel,
  };

  console.log('query');
  console.log(query);

  console.log('update');
  console.log(update);

  return Request.findOneAndUpdate(query, update, {new: true})
  .deepPopulate(['remittance.intermediateCompany', 'remittance.intermediateCompany.owner','distributorCompany.owner','remittance.receiver','remittance.currency'])
  .populate('distributorCompany')
  .populate('distributorCompanyWageCurrency');
}

function acceptRequest(distributorCompany, actor, requestId, responseChannel) {
  var query = {
    _id: requestId,
    distributorCompany: distributorCompany
  };

  var update = {
    status: 'accepted',
    responseActor: actor,
    responseChannel: responseChannel,
  };

  return Request.findOneAndUpdate(query, update, {new: true})
  .deepPopulate(['remittance.intermediateCompany', 'remittance.intermediateCompany.owner','distributorCompany.owner','remittance.receiver','remittance.currency'])
  .populate('distributorCompany')
  .populate('distributorCompanyWageCurrency')
}

function acceptWagedRequest( actor, requestId, responseChannel){
  var query = {
    _id: requestId,
    status: 'waged',
  };

  var logListItem = {
    actor: actor,
    date: new Date(),
    action: 'Change Status From Waged to Accepted',
    channel: responseChannel,
  };

  var update = {
    status: 'accepted',
    $push: { logList: logListItem }
  };

  return Request.findOneAndUpdate(query, update, {new: true})
  .deepPopulate(['remittance.intermediateCompany', 'remittance.intermediateCompany.owner','distributorCompany.owner','remittance.receiver','remittance.currency'])
  .populate('distributorCompany')
  .populate('distributorCompanyWageCurrency');
}

function cancelWagedRequest(actor, requestId, responseChannel){
  var query = {
    _id: requestId,
    status: 'waged',
  };

  var logListItem = {
    actor: actor,
    date: new Date(),
    action: 'Change Status From Waged to Canceled',
    channel: responseChannel,
  };

  var update = {
    status: 'canceled',
    $push: { logList: logListItem }
  };

  return Request.findOneAndUpdate(query, update, {new: true})
  .deepPopulate(['remittance.intermediateCompany', 'remittance.intermediateCompany.owner','distributorCompany.owner','remittance.receiver','remittance.currency'])
  .populate('distributorCompany')
  .populate('distributorCompanyWageCurrency');
}

function rejectRequest(distributorCompany, actor, requestId, responseChannel) {
  var query = {
    _id: requestId,
    distributorCompany: distributorCompany,
  };

  console.log('hwew for findin');
  console.log(query);

  var update = {
    status: 'rejected',
    responseActor: actor,
    responseChannel: responseChannel,
  };

  return Request.findOneAndUpdate(query, update, {new: true})
  .populate('remittance');
}

exports = module.exports = function(options){
  Request = options.requestModel;
  trackingCodeManager = options.trackingCodeManager;

  this.createForRemittance = createForRemittance;
  this.create = create;
  this.getAll_distributorCompany = getAll_distributorCompany;
  this.getAll_distributorCompany_fromDateTime_toDateTime = getAll_distributorCompany_fromDateTime_toDateTime;
  this.get = get;
  this.get_requestId_distributorCompany = get_requestId_distributorCompany;
  this.setWage = setWage;
  this.acceptRequest = acceptRequest;
  this.acceptWagedRequest = acceptWagedRequest;
  this.cancelWagedRequest = cancelWagedRequest;
  this.rejectRequest = rejectRequest;
};
