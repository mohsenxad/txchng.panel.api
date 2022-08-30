var Credit;

function create(from, to, price, currency, remittance, description){
  let newCredit = new Credit({
    from:from,
    to: to,
    price: price,
    currency: currency,
    remittance: remittance,
    description: description,
    registrationDate: new Date(),
  });
  return newCredit.save();
}

function getAll_company_currency(company, coworkerCompany, currency){
  var query = {
    from: company,
    to: coworkerCompany,
    currency:currency,
  };

  return Credit
    .find(query)
    .populate('to')
    .populate('remittance')
    .populate('currency')
    .sort('-registrationDate');
}

function getAll_company_currency_dateTimeRange(company, currency,fromDateTime,toDateTime){
  var query = {
    from: company,
    currency:currency,
    registrationDate: {
      $gte: fromDateTime,
      $lte: toDateTime
    }
  };

  return Credit
    .find(query)
    .populate('to')
    .populate('remittance')
    .populate('currency')
    .sort('-registrationDate');
}

function getAll_company_dateTimeRange(company,fromDateTime,toDateTime){
  var query = {
    from: company,
    registrationDate: {
      $gte: fromDateTime,
      $lte: toDateTime
    }
  };

  return Credit
    .find(query)
    .populate('to')
    .populate('remittance')
    .populate('currency')
    .sort('-registrationDate');
}

exports = module.exports = function(options){
  Credit = options.creditModel;

  this.create = create;
  this.getAll_company_currency = getAll_company_currency;
  this.getAll_company_currency_dateTimeRange = getAll_company_currency_dateTimeRange;
  this.getAll_company_dateTimeRange = getAll_company_dateTimeRange;

}
