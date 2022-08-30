var Remittance;
var moment;
var trackingCodeManager;

function create(applicant, intermediateCompany, price, currencyId, receiver, requestAt, intermediateCompanyWagePrice, intermediateCompanyWageCurrencyId){
  var newRemittance = new Remittance({
    applicant: applicant,
    intermediateCompany: intermediateCompany,
    price: price,
    currency: currencyId,
    intermediateCompanyWagePrice: intermediateCompanyWagePrice,
    intermediateCompanyWageCurrency: intermediateCompanyWageCurrencyId,
    receiver: receiver,
    requestAt: requestAt,
    createAt: new Date(),
    isDelivered: false,
    status: 'new',
  });

  return new Promise(function(resolve, reject) {
      newRemittance.save(function(err, savedRemittance){
        if(err){
            reject(err);
        }else{
          trackingCodeManager.createForRemittance(savedRemittance)
            .then(function(createdTrackingCode){
              resolve(savedRemittance);
            })
            .catch(function(err){
              reject(err);
            });
        }
      });
  });


}

function createSimple(intermediateCompany, receiver, price, currencyId, requestAt){
  var newRemittance = new Remittance({
    intermediateCompany: intermediateCompany,
    price: price,
    currency: currencyId,
    receiver: receiver,
    requestAt: requestAt,
    createAt: new Date(),
    isDelivered: false,
    status: 'new',
  });

  return new Promise(function(resolve, reject) {
      newRemittance.save(function(err, savedRemittance){
        if(err){
            reject(err);
        }else{
          trackingCodeManager.createForRemittance(savedRemittance)
            .then(function(createdTrackingCode){
              resolve(savedRemittance);
            })
            .catch(function(err){
              reject(err);
            });
        }
      });
  });
}

function createFromRequest(intermediateCompany, distributorCompany, receiverUserPosition, price, currencyId, distributorCompanyWagePrice, distributorCompanyWageCurrency, requestAt, request) {
  var newRemittance = new Remittance({
    intermediateCompany: intermediateCompany,
    distributorCompany: distributorCompany,
    price: price,
    currency: currencyId,
    distributorCompanyWagePrice: distributorCompanyWagePrice,
    distributorCompanyWageCurrency: distributorCompanyWageCurrency,
    receiver: receiverUserPosition,
    requestAt: requestAt,
    createAt: new Date(),
    isDelivered: false,
    status: 'new',
  });

  return new Promise(function(resolve, reject) {
      newRemittance.save(function(err, savedRemittance){
        if(err){
          reject(err);
        }else{
          trackingCodeManager
            .assignRemittance_request(request, savedRemittance)
            .then(function(updatedTrackingCode){
              resolve(savedRemittance);
            })
            .catch(function(err){
              reject(err);
            });
        }
      });
  });
}

function createDistribution(intermediateCompany, price, currency, receiver, requestAt, distributorCompany, distributorCompanyWagePrice, distributorCompanyWageCurrency){
  var newRemittance = new Remittance({
    intermediateCompany: intermediateCompany,
    price: price,
    currency: currency,
    receiver: receiver,
    requestAt: requestAt,
    createAt: new Date(),
    isDelivered: false,
    status: 'new',
    distributorCompany: distributorCompany,
    distributorCompanyWagePrice: distributorCompanyWagePrice,
    distributorCompanyWageCurrency: distributorCompanyWageCurrency,
  });

  return new Promise(function(resolve, reject) {
      newRemittance.save(function(err, savedRemittance){
        if(err){
          reject(err);
        }else{
          trackingCodeManager.createForRemittance(savedRemittance)
            .then(function(createdTrackingCode){
              resolve(savedRemittance);
            })
            .catch(function(err){
              reject(err);
            });
        }
      });
  });
}

function get_intermediateCompany_remittanceId(intermediateCompany, remittanceId){
  var query = { intermediateCompany: intermediateCompany, _id: remittanceId };
  return Remittance.findOne(query)
    .populate('intermediateCompany')
    .populate('distributorCompany')
    .populate('currency')
    .populate('intermediateCompanyWageCurrency')
    .populate('distributorCompanyWageCurrency')
    .deepPopulate(['receiver.user','applicant.user'])
    .sort('-createAt');
}

function get_distributorCompany_remittanceId(distributorCompany, remittanceId){
  var query = { distributorCompany: distributorCompany, _id: remittanceId };
  return Remittance.findOne(query)
    .populate('intermediateCompany')
    .populate('distributorCompany')
    .populate('currency')
    .populate('intermediateCompanyWageCurrency')
    .populate('distributorCompanyWageCurrency')
    .deepPopulate(['receiver.user','applicant.user'])
    .sort('-createAt');
}

function setDistributorCompany(intermediateCompany, remittanceId, distributorCompany, distributorCompanyWagePrice, distributorCompanyWageCurrency){

  var query = {
    intermediateCompany: intermediateCompany,
    _id: remittanceId
  };


  var update = {
    status: 'accepted',
    distributorCompany: distributorCompany,
    distributorCompanyWagePrice: distributorCompanyWagePrice,
    distributorCompanyWageCurrency: distributorCompanyWageCurrency,
  };

  return Remittance
    .findOneAndUpdate(query, update, {new: true})
    .populate('intermediateCompany')
    .populate('distributorCompany')
    .populate('currency')
    .populate('intermediateCompanyWageCurrency')
    .populate('distributorCompanyWageCurrency')
    .deepPopulate(['receiver.user','applicant.user','distributorCompany.owner','intermediateCompany.owner'])


  // return new Promise(function(resolve, reject) {
  //     var query = {
  //       intermediateCompany: intermediateCompany,
  //       _id: remittanceId
  //     };
  //     Remittance.findOne(query)
  //       .then(function(foundRemittance){
  //         if(foundRemittance){
  //           //foundRemittance.distributorCompany = distributorCompany;
  //           //foundRemittance.distributorCompanyWagePrice = distributorCompanyWagePrice;
  //           //foundRemittance.distributorCompanyWageCurrency = distributorCompanyWageCurrency;
  //           //foundRemittance.status = 'accepted';
  //           foundRemittance.save(function(err, updatedRemittance){
  //             if(err){
  //               reject(err);
  //             }else{
  //               resolve(updatedRemittance);
  //             }
  //           })
  //
  //         }else{
  //           reject(new Error('No Remittance Found with id ' + remittanceId + ' for company ' + intermediateCompany.name))
  //         }
  //       })
  //       .catch(function(err){
  //         reject(err);
  //       })
  // });


}

function getAll_intermediateCompany(intermediateCompany){
  var query = {
    intermediateCompany: intermediateCompany
  };
  return Remittance.find(query)
    .deepPopulate(['receiver.user','applicant.user'])
    .populate('intermediateCompany')
    .populate('distributorCompany')
    .populate('currency')
    .populate('intermediateCompanyWageCurrency')
    .populate('distributorCompanyWageCurrency')
    .limit(500)
    .sort('-createAt');
}

function getAll_distributorCompany(distributorCompany){
  let query = { distributorCompany: distributorCompany };

  return Remittance
    .find(query)
    .deepPopulate(['receiver.user','applicant.user'])
    .populate('intermediateCompany')
    .populate('distributorCompany')
    .populate('currency')
    .populate('intermediateCompanyWageCurrency')
    .populate('distributorCompanyWageCurrency')
    .limit(500)
    .sort('-createAt');
}

function getAll_distributorCompany_status(distributorCompany, status){
  let query = {
    distributorCompany: distributorCompany,
    status: status
  };

  return Remittance
    .find(query)
    .deepPopulate(['receiver.user','applicant.user'])
    .populate('intermediateCompany')
    .populate('distributorCompany')
    .populate('currency')
    .populate('intermediateCompanyWageCurrency')
    .populate('distributorCompanyWageCurrency')
    .limit(500)
    .sort('-createAt');
}

function getAll_distributorCompany_fromDate_toDate(distributorCompany, fromDateTime, toDateTime){
  let query = {
    distributorCompany: distributorCompany,
    requestAt: {
      $gte: fromDateTime,
      $lte: toDateTime
    }
  };

  return Remittance
    .find(query)
    .deepPopulate(['receiver.user','applicant.user'])
    .populate('intermediateCompany')
    .populate('distributorCompany')
    .populate('currency')
    .populate('intermediateCompanyWageCurrency')
    .populate('distributorCompanyWageCurrency')
    .limit(500)
    .sort('-createAt');
}

function getAll_distributorCompany_status_currency(distributorCompany, status, currency){
  var query = {
    distributorCompany: distributorCompany,
    status: status,
    currency: currency,
  };

  return Remittance
    .find(query)
    .deepPopulate(['receiver.user','applicant.user'])
    .populate('intermediateCompany')
    .populate('distributorCompany')
    .populate('currency')
    .populate('intermediateCompanyWageCurrency')
    .populate('distributorCompanyWageCurrency')
    .sort('-createAt');
}

function getAll_distributorCompany_status_currency_date(distributorCompany, status, currency, date){
  var fromDate = moment(date).startOf('day');
  var toDate = moment(date).endOf('day');
  var query = {
    distributorCompany: distributorCompany,
    status: status,
    currency: currency,
    createAt: { $lte: toDate, $gte: fromDate }
  };

  return Remittance
    .find(query)
    .deepPopulate(['receiver.user','applicant.user'])
    .populate('intermediateCompany')
    .populate('distributorCompany')
    .populate('currency')
    .populate('intermediateCompanyWageCurrency')
    .populate('distributorCompanyWageCurrency')
    .sort('-createAt');
}

function attachFile(distributorCompany, filename, remittanceId, actor , channel){
  var query = {
    _id: remittanceId,
    distributorCompany : distributorCompany,
  };

  var logListItem = {
    actor: actor,
    date: new Date(),
    action: 'Attach File ' + filename,
    channel: channel,
  };


  var update = {
    $push: { logList: logListItem , attachmentFileNameList: filename}
  };

  return Remittance
    .findOneAndUpdate(query, update, {new: true})
    .populate('distributorCompany')
    .populate('currency');
}

function setAsDelivered(distributorCompany, remittanceId, actor , channel){
  var query = {
    _id: remittanceId,
    distributorCompany : distributorCompany,
    isDelivered: false,
  };

  var logListItem = {
    actor: actor,
    date: new Date(),
    action: 'Delivered Remittance',
    channel: channel,
  };

  var update = {
    isDelivered: true,
    status: 'delivered',
    deliveryDate: new Date(),
    deliveryChannel: channel,
    $push: { logList: logListItem }
  };

  return Remittance
    .findOneAndUpdate(query, update, {new: true})
    .populate('distributorCompany')
    .populate('currency');
}

function setAsReverse(distributorCompany, remittanceId, actor , channel){
  var query = {
    _id: remittanceId,
    distributorCompany : distributorCompany,
    isDelivered: false,
  };

  var logListItem = {
    actor: actor,
    date: new Date(),
    action: 'Reverse Remittance',
    channel: channel,
  };

  var update = {
    isDelivered: false,
    status: 'reversed',
    deliveryDate: new Date(),
    deliveryChannel: channel,
    $push: { logList: logListItem }
  };



  return Remittance
    .findOneAndUpdate(query, update, {new: true})
    .populate('distributorCompany')
    .populate('currency');
}

exports = module.exports = function(options){
  Remittance = options.remittanceModel;
  moment = options.moment;
  trackingCodeManager = options.trackingCodeManager;

  this.create = create;
  this.createSimple = createSimple;
  this.createDistribution = createDistribution;
  this.get_intermediateCompany_remittanceId = get_intermediateCompany_remittanceId;
  this.get_distributorCompany_remittanceId = get_distributorCompany_remittanceId;
  this.setDistributorCompany = setDistributorCompany;
  this.getAll_intermediateCompany = getAll_intermediateCompany;
  this.getAll_distributorCompany = getAll_distributorCompany;
  this.getAll_distributorCompany_status = getAll_distributorCompany_status;
  this.getAll_distributorCompany_fromDate_toDate = getAll_distributorCompany_fromDate_toDate;
  this.getAll_distributorCompany_status_currency = getAll_distributorCompany_status_currency;
  this.getAll_distributorCompany_status_currency_date = getAll_distributorCompany_status_currency_date;
  this.setAsDelivered = setAsDelivered;
  this.setAsReverse = setAsReverse;
  this.createFromRequest = createFromRequest;
  this.attachFile = attachFile;
}
