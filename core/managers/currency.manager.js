var Currency;

function add(name, code, type){
  var newCurrency = new Currency({
    name: name,
    code: code,
    type: type,
  });

  return newCurrency.save()
}

function getAll(){
  return Currency.find();
}

exports = module.exports = function(options){
  Currency = options.currencyModel;

  this.add = add;
  this.getAll = getAll;
}
