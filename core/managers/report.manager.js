var excelProvider;
var reportStoragePath;

function translateRequestStatus(status){
  if(status == 'new'){
    return 'جدید';
  }else if(status == 'read'){
    return 'معروض';
  }else if(status == 'rejected'){
    return 'مرفوض';
  }else if(status == 'waged'){
    return 'فی الإنتظار';
  }else if(status == 'canceled'){
    return 'ملغي';
  }else if(status == 'accepted'){
    return 'متّفق';
  }else{
    return 'غیر معلوم';
  }
}

function translateRemittanceStatus(status){
  if(status == 'new') {
    return 'جدید';
  } else if(status == 'delivered') {
    return 'سلّمت';
  } else if(status == 'reversed') {
    return 'ردّت';
  } else if(status == 'timeout') {
    return 'منتهیة الصلاحیة';
  } else {
    return 'غیر المعلوم';
  }

}

function generateRequestList(company, requestList){

  var filePath = reportStoragePath + company._id.toString() + '_r_' + new Date().valueOf() + '.xlsx';
  var headerCellList = [
    {
      title: 'کد الطلب',
      width: 25,
    },
    {
      title: 'شرکت واسط',
      width: 25,
    },
    {
      title: 'المبلغ',
      width: 15,
    },
    {
      title: 'العملة',
      width: 15,
    },
    {
      title: 'المستلم',
      width: 20,
    },
    {
      title: 'تاریخ الإتفاق',
      width: 25,
    },
    {
      title: 'الحالة',
      width: 10,
    },
    {
      title: 'المعولة',
      width: 10,
    },

  ];
  var dataSet = requestList.map(function(request, index){
    var cellList =  [
      {
        column: 1,
        value : request._id.toString(),
        type: 'String',
      },
      {
        column: 2,
        value : request.intermediateCompany.name.toString(),
        type: 'String',
      },
      {
        column: 3,
        value : request.price,
        type: 'Number',
      },
      {
        column: 4,
        value : request.currency.ar_name.toString(),
        type: 'String',
      },
      {
        column: 5,
        value : request.receiverTitle.toString(),
        type: 'String',
      },
      {
        column: 6,
        value : request.requestAt.toString(),
        type: 'String',
      },
      {
        column: 7,
        value : translateRequestStatus(request.status),
        type: 'String',
      },
    ];

    var distributorCompanyWagePriceCell = {
      column: 8,
      value : '-',
      type: 'String',
    };

    if(request.distributorCompanyWagePrice){
      distributorCompanyWagePriceCell.value = request.distributorCompanyWagePrice;
      distributorCompanyWagePriceCell.type = 'Number';
    }
    cellList.push(distributorCompanyWagePriceCell);


    return {
      row: index + 2,
      cellList: cellList,
    };

  });


  return new Promise(function(resolve, reject) {
    excelProvider.createExcelFile(filePath, headerCellList, dataSet)
    .then(function(generateReportResult){
      resolve(filePath);
    })
    .catch(function(err){
      reject(err);
    });
  });
}

function generateRemittanceList_intermediateCompany(company, remittanceList){
  var filePath = reportStoragePath + company._id.toString() + '_i_' + new Date().valueOf() + '.xlsx';
}

function generateRemittanceList_distributorCompany(company, remittanceList){
  var filePath = reportStoragePath + company._id.toString() + '_d_' + new Date().valueOf() + '.xlsx';
  var headerCellList = [
    {
      title: 'کد الطلب',
      width: 25,
    },
    {
      title: 'شرکت واسط',
      width: 25,
    },
    {
      title: 'المبلغ',
      width: 15,
    },
    {
      title: 'العملة',
      width: 15,
    },
    {
      title: 'المعولة',
      width: 10,
    },
    {
      title: 'المستلم',
      width: 20,
    },
    {
      title: 'تاریخ الإتفاق',
      width: 25,
    },
    {
      title: 'الحالة',
      width: 10,
    },
  ];

  var dataSet = remittanceList.map(function(remittance, index){
    var cellList = [
      {
        column: 1,
        value : remittance._id.toString(),
        type: 'String',
      },
      {
        column: 2,
        value : remittance.intermediateCompany.name.toString(),
        type: 'String',
      },
      {
        column: 3,
        value : remittance.price,
        type: 'Number',
      },
      {
        column: 4,
        value : remittance.currency.ar_name.toString(),
        type: 'String',
      },
      {
        column: 7,
        value : remittance.requestAt.toString(),
        type: 'String',
      },
      {
        column: 8,
        value : translateRemittanceStatus(remittance.status),
        type: 'String',
      },
    ];

    var distributorCompanyWagePriceCell = {
      column: 5,
      value : '-',
      type: 'String',
    };

    if(remittance.distributorCompanyWagePrice){
      distributorCompanyWagePriceCell.value = remittance.distributorCompanyWagePrice;
      distributorCompanyWagePriceCell.type = 'Number';
    }
    cellList.push(distributorCompanyWagePriceCell);

    var receiverCell = {
      column: 6,
      value : '-',
      type: 'String',
    };

    if(
      remittance.receiver &&
      remittance.receiver.user
    ){
      if(
        remittance.receiver.user.title &&
        !remittance.receiver.user.firstname &&
        !remittance.receiver.user.lastname
      ){
        receiverCell.value = remittance.receiver.user.title;
      }else if(
        remittance.receiver.user.title &&
        remittance.receiver.user.firstname &&
        remittance.receiver.user.lastname
      ){
        receiverCell.value = remittance.receiver.user.firstname + ' ' + remittance.receiver.user.lastname;
      }
    }

    cellList.push(receiverCell);


    return {
      row: index + 2,
      cellList: cellList,
    };
  });

  return new Promise(function(resolve, reject) {
    excelProvider.createExcelFile(filePath, headerCellList, dataSet)
    .then(function(generateReportResult){
      resolve(filePath);
    })
    .catch(function(err){
      reject(err);
    });
  });

}

exports = module.exports = function(options){
  excelProvider = options.excelProvider;
  reportStoragePath = options.reportStoragePath;

  this.generateRequestList = generateRequestList;
  this.generateRemittanceList_intermediateCompany = generateRemittanceList_intermediateCompany;
  this.generateRemittanceList_distributorCompany = generateRemittanceList_distributorCompany;
};
