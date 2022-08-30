var axios;

function notifyNewRequest(destributorCompany, destributorCompanyOwner, intermediateCompany, price, currency, wagePrice, wageCurrency, receiverTitle, requestCoreRefId){
  return new Promise(function(resolve, reject) {
    var url = 'http://116.203.75.73:8004/notify/request'
    var params = {
        destributorCompany: destributorCompany,
        destributorCompanyOwner: destributorCompanyOwner,
        intermediateCompany: intermediateCompany,
        price: price,
        currency: currency,
        wagePrice: wagePrice,
        wageCurrency: wageCurrency,
        receiverTitle: receiverTitle,
        requestCoreRefId: requestCoreRefId,
    };
    console.log(destributorCompany);
    axios.post(url, params)
      .then((res) => {
        var currencyList = res.data.currencyList
        resolve(currencyList);
      })
      .catch((error) => {
        console.log(error);
        resolve(error);
      })

  });
}

function notifyWagedRequest(request){
  return new Promise(function(resolve, reject) {
    var url = 'http://116.203.75.73:8004/notify/wagedRequest'
    var params = {
        request: request,
    };
    axios.post(url, params)
      .then((res) => {
        var result = res.data
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
        resolve(error);
      })
  });
}

function notifyRejectedRequest(request){
  return new Promise(function(resolve, reject) {
    var url = 'http://116.203.75.73:8004/notify/rejectedRequest';
    var params = {
        request: request,
    };
    axios.post(url, params)
      .then((res) => {
        var result = res.data;
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
        resolve(error);
      });
  });
}

function notifyReversedRemittance(remittance){
  return new Promise(function(resolve, reject) {
    var url = 'http://116.203.75.73:8004/notify/reversedRemittance';
    var params = {
        remittance: remittance,
    };
    axios.post(url, params)
      .then((res) => {
        var result = res.data;
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
        resolve(error);
      });
  });
}

function notifyDeliveredRemittance(remittance){
  return new Promise(function(resolve, reject) {
    var url = 'http://116.203.75.73:8004/notify/deliveredRemittance';
    var params = {
        remittance: remittance,
    };
    axios.post(url, params)
      .then((res) => {
        var result = res.data;
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
        resolve(error);
      });
  });
}

function notifyDeliveredRemittance(remittance){
  return new Promise(function(resolve, reject) {
    var url = 'http://116.203.75.73:8004/notify/deliveredRemittance';
    var params = {
        remittance: remittance,
    };
    axios.post(url, params)
      .then((res) => {
        var result = res.data;
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
        resolve(error);
      });
  });
}

function notifyAggreedRemittance(remittance){
  return new Promise(function(resolve, reject) {
    var url = 'http://116.203.75.73:8004/notify/AggreedRemittanceReciept';
    var params = {
        remittance: remittance,
    };
    axios.post(url, params)
      .then((res) => {
        var result = res.data;
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
        resolve(error);
      });
  });
}

function sendInvitaion(){}

exports = module.exports = function(options) {
  axios = options.axios;

  this.notifyNewRequest = notifyNewRequest;
  this.notifyWagedRequest = notifyWagedRequest;
  this.notifyRejectedRequest = notifyRejectedRequest;
  this.notifyReversedRemittance = notifyReversedRemittance;
  this.notifyDeliveredRemittance = notifyDeliveredRemittance;
  this.notifyAggreedRemittance = notifyAggreedRemittance;
}
