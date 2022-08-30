var Transaction;

function create(company,receiverUserPositionId, price, currency, description, type, remittance){
  var newTransaction = new Transaction({
    company: company,
    customer: receiverUserPositionId,
    price: price,
    currency: currency,
    description: description,
    type: type,
    remittance: remittance,
    registrationDate: new Date(),
  });
  return newTransaction.save();
}

function cashCreationJob(company,receiverUserPositionId, price, currencyId, description){
  var newTransaction = new Transaction({
    company: company,
    customer: receiverUserPositionId,
    price: price,
    currency: currencyId,
    description: description,
    type: 'cash',
    registrationDate: new Date(),
  });
  return newTransaction.save();
}

function remittanceCreationJob(remittance){
  return new Promise(function(resolve, reject) {
    var transactionDescriptionForRemittancePrice = 'دریافت بابت اصل مبلغ حواله'
    var transactionDescriptionForRemittanceWage = 'دریافت بابت کارمزد حواله'
    create(remittance.intermediateCompany, remittance.applicant,remittance.price, remittance.currency, transactionDescriptionForRemittancePrice, 'trmittance', remittance)
      .then(function(remittanceTransaction){
        create(remittance.intermediateCompany, remittance.applicant, remittance.intermediateCompanyWagePrice, remittance.intermediateCompanyWageCurrency, transactionDescriptionForRemittanceWage, 'wage', remittance)
          .then(function(wageTransaction){
            var transactionLogList = [];
            transactionLogList.push(remittanceTransaction);
            transactionLogList.push(wageTransaction);
            resolve(transactionLogList);
          })
          .catch(function(err){
            reject(err);
          })
      })
      .catch(function(err){
        reject(err);
      })
  });
}

function disterbutorSetJob(remittance){
  return new Promise(function(resolve, reject) {
    var transactionDescriptionForRemittanceItermediateCompanyPrice = 'کسر بابت اصل مبلغ حواله';
    var transactionDescriptionForRemittanceDistributorCompanyPrice = 'افزایش بابت اصل مبلغ حواله';
    var transactionDescriptionForRemittanceItermediateCompanyWage = 'کسر بابت کارمز حواله به شرکت توزیع کننده';
    var transactionDescriptionForRemittanceDisterbutionWage = 'افزایش بابت کارمز حواله از شرکت واسط';
    var transactionLogList = [];
    create(remittance.intermediateCompany, (-1) * remittance.price, remittance.currency, transactionDescriptionForRemittanceItermediateCompanyPrice, 'remittance', remittance)
      .then(function(decreaseRemittacePriceTransaction){
        transactionLogList.push(decreaseRemittacePriceTransaction);
        create(remittance.distributorCompany, remittance.price, remittance.currency, transactionDescriptionForRemittanceDistributorCompanyPrice, 'remittance', remittance)
          .then(function(increaseRemittacePriceTransaction){
            transactionLogList.push(increaseRemittacePriceTransaction);
            create(remittance.intermediateCompany, (-1) * remittance.distributorCompanyWagePrice, remittance.distributorCompanyWageCurrency, transactionDescriptionForRemittanceItermediateCompanyWage, 'wage', remittance)
              .then(function(decreaseRemittaceWageTransaction){
                transactionLogList.push(decreaseRemittaceWageTransaction);
                create(remittance.distributorCompany, remittance.distributorCompanyWagePrice, remittance.distributorCompanyWageCurrency, transactionDescriptionForRemittanceDisterbutionWage, 'wage', remittance)
                  .then(function(increaseRemittaceWageTransaction){
                    transactionLogList.push(increaseRemittaceWageTransaction);
                    resolve(transactionLogList);
                  })
                  .catch(function(err){
                    reject(err);
                  })
              })
              .catch(function(err){
                reject(err);
              })
          })
          .catch(function(err){
            reject(err);
          })
      })
      .catch(function(err){
        reject(err);
      })
  });
}

function remittanceDeliveredJob(remittance){
  return new Promise(function(resolve, reject) {
    transactionDescriptionForRemittanceDeliveredDistributorCompany =  'کسر بابت تحویل حواله به دریافت کننده';
    create(remittance.distributorCompany, (-1) * remittance.price, remittance.currency, transactionDescriptionForRemittanceDeliveredDistributorCompany, 'remittance', remittance)
      .then(function(createdTransaction){
        resolve(createdTransaction);
      })
      .catch(function(err){
        reject(err)
      })
  });
}


function remittanceReversedJob(remittance){
  return new Promise(function(resolve, reject) {
    transactionDescriptionForRemittanceReversedDistributorCompany =  'کسر بابت بازگشت حواله به شرکت واسط';
    transactionDescriptionForRemittanceReversedWageDistributorCompany =  'کسر بابت کارمز حواله ی بازگشت داده شده به شرکت واسط';
    transactionDescriptionForRemittanceReversedIntermidiateCompany = 'افزایش بابت اصل مبلغ حواله ی بازگشت داده شده.'
    var transactionLogList = [];
    create(remittance.distributorCompany, (-1) * remittance.price, remittance.currency, transactionDescriptionForRemittanceReversedDistributorCompany, 'remittance', remittance)
      .then(function(createdTransaction){
        transactionLogList.push(createdTransaction)
        create(remittance.distributorCompany, (-1) * remittance.distributorCompanyWagePrice, remittance.distributorCompanyWageCurrency, transactionDescriptionForRemittanceReversedWageDistributorCompany, 'wage', remittance)
          .then(function(createdReverseWageTransaction){
            transactionLogList.push(createdReverseWageTransaction)
            create(remittance.intermediateCompany, remittance.price, remittance.currency, transactionDescriptionForRemittanceReversedIntermidiateCompany, 'remittance', remittance)
              .then(function(createdReverseRemittanceTransaction){
                transactionLogList.push(createdReverseRemittanceTransaction)
                resolve(transactionLogList);
              })
              .catch(function(err){
                reject(err)
              })
          })
          .catch(function(err){
            reject(err)
          })
      })
      .catch(function(err){
        reject(err)
      })
  });
}

function getAll_company(company){
  var query = { company: company };
  return Transaction
    .find(query)
    .populate('company')
    .populate('remittance')
    .populate('currency')
    .deepPopulate(['customer.user'])
    .sort('-registrationDate');

}

function getAll_company_dateTimeRange(company, fromDateTime, toDateTime){
  var query = {
    company: company,
    registrationDate: {
      $gte: fromDateTime,
      $lte: toDateTime
    }
  };
  return Transaction
    .find(query)
    .populate('company')
    .populate('remittance')
    .populate('currency')
    .deepPopulate(['customer.user'])
    .sort('-registrationDate');
}

function getAll_company_currency(company, currency){
  var query = {
    company: company,
    currency:currency
  };

  return Transaction
    .find(query)
    .populate('company')
    .populate('remittance')
    .populate('currency')
    .sort('-registrationDate');
}

function getAll_company_currency_dateTimeRange(company, currency,fromDateTime,toDateTime){
  var query = {
    company: company,
    currency:currency,
    registrationDate: {
      $gte: fromDateTime,
      $lte: toDateTime
    }
  };

  console.log(query);

  return Transaction
    .find(query)
    .populate('company')
    .populate('remittance')
    .populate('currency')
    .sort('-registrationDate');
}


exports = module.exports = function(options){
  Transaction = options.transactionModel;

  this.create = create;
  this.cashCreationJob = cashCreationJob;
  this.remittanceCreationJob = remittanceCreationJob;
  this.disterbutorSetJob = disterbutorSetJob;
  this.getAll_company = getAll_company;
  this.getAll_company_dateTimeRange = getAll_company_dateTimeRange;
  this.remittanceDeliveredJob = remittanceDeliveredJob;
  this.remittanceReversedJob = remittanceReversedJob;
  this.getAll_company_currency = getAll_company_currency;
  this.getAll_company_currency_dateTimeRange = getAll_company_currency_dateTimeRange;
};
