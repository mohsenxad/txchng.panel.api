var Wage;

function create(company, coWorkerCompany, currency, minPrice, maxPrice, wagePrice){
  var newWage = new Wage({
    company: company,
    coWorkerCompany: coWorkerCompany,
    currency: currency,
    minPrice: minPrice,
    maxPrice: maxPrice,
    wagePrice: wagePrice,
    fromDate : new Date(),
  });

  return newWage.save();
}

function getAll_company(company){
  var query = { company: company };
  return Wage.find(query)
  .populate('company')
  .populate('coWorkerCompany')
  .populate('currency');
}

function get_company_coWorkerCompany_price_currency(company, coWorkerCompany, price, currency){
  var query = {
    company: company,
    coWorkerCompany: coWorkerCompany,
    currency: currency,
    maxPrice: { $gte : price },
    minPrice: { $lt : price },
  };
  return Wage.findOne(query).populate('currency');
}

function changeCredit(company, coWorkerCompany,currency,changedPrice){
  return new Promise(function(resolve, reject) {
    var query = {
      company: company,
      coWorkerCompany: coWorkerCompany,
      currency: currency
    };

    Wage.findOne(query)
      .then(function(foundWage){
        if(foundWage){
          let newTotalCredit = parseInt(foundWage.totalCredit? foundWage.totalCredit : 0) + parseInt(changedPrice);

          var update = {
            totalCredit : newTotalCredit
          };

          Wage.findOneAndUpdate({_id: foundWage._id}, update, {new: true})
            .then(function(updatedWage){
              resolve(updatedWage)
            })
            .catch(function(err){
              console.log(err);
              reject(err);
            })

        }else{
          let errorrMessage = `No Wage Record found for this`;
          reject(new Error(errorrMessage));
        }
      })
      .catch(function(err){
        console.log(err);
        reject(err);
      })

  });
}

module.exports = exports = function(options){
  Wage = options.wageModel;

  this.create = create;
  this.getAll_company = getAll_company;
  this.get_company_coWorkerCompany_price_currency = get_company_coWorkerCompany_price_currency;
  this.changeCredit = changeCredit;
}
