var Promise = require('promise');
const iocManagerFile = require('./ioc.manager');
var ioc = new iocManagerFile({});
var socketList = [];

// ==== [Socket] ==================
function addNewSocketConnection(socket){
  socketList = ioc.socketManager.newConnection(socketList, socket);
  socket.on('disconnect', function(){
    console.log('disocnnected');
    var newSocketList = ioc.manager.socket.removeConnection(getSocketList(), socket);
    setSocketList(newSocketList);
  });
}

function getSocketList(){
  return socketList;
}

function setSocketList(newSocketList){
  socketList = newSocketList;
}

// ===== [Transaction] =========================

function create_transaction(company, receiverUserPositionId, price, currencyId, description){
  return ioc.transactionManager.cashCreationJob(company,receiverUserPositionId, price, currencyId, description);
}

function create_transaction_from_remittance(company, receiverUserPositionId, price, currencyId, description, remittanceId){
  return ioc.transactionManager.create(company,receiverUserPositionId, price, currencyId, description, 'cash', remittanceId);
}

function getTotalTransactionCompany(company){
  return new Promise(function(resolve, reject) {
    ioc.companyManager.get_id(company)
      .then(function(foundCompany){
        var promiseList = foundCompany.currencyList.map(function(currency){
          return new Promise(function(resolve, reject) {
            ioc.transactionManager.getAll_company_currency(company, currency)
              .then(function(foundTransactionList){
                var totlaPrice = foundTransactionList.reduce(function(total, foundTransaction){
                  return total + foundTransaction.price;
                },0);
                resolve({
                  currency :currency,
                  total: totlaPrice,
                });
              })
              .catch(function(err){
                reject(err);
              });
          });
        });

        Promise.all(promiseList)
          .then(function(dataSet){
            resolve(dataSet);
          })
          .catch(function(err){
            reject(err);
          });
      })
      .catch(function(err){
        reject(err);
      });


  });
}

function getTotalTransactionCompanyDateTimeRange(company,fromDateTime,toDateTime){
  return new Promise(function(resolve, reject) {
    ioc.companyManager.get_id(company)
      .then(function(foundCompany){
        var promiseList = foundCompany.currencyList.map(function(currency){
          return new Promise(function(resolve, reject) {
            ioc.transactionManager.getAll_company_currency_dateTimeRange(company, currency, fromDateTime,toDateTime)
              .then(function(foundTransactionList){
                var totlaPrice = foundTransactionList.reduce(function(total, foundTransaction){
                  return total + foundTransaction.price;
                },0);
                resolve({
                  currency :currency,
                  total: totlaPrice,
                });
              })
              .catch(function(err){
                reject(err);
              });
          });
        });

        Promise.all(promiseList)
          .then(function(dataSet){
            resolve(dataSet);
          })
          .catch(function(err){
            reject(err);
          });
      })
      .catch(function(err){
        reject(err);
      });


  });
}


//===== [Credit] ==============================

function create_credit(company, coworkerCompanyId, price, currencyId, description){
  // need to insert two rows
  return new Promise(function(resolve, reject) {
        ioc.creditManager.create(company,coworkerCompanyId, price, currencyId, undefined, description)
          .then(function(fromCompanyCreatedCredit){
            ioc.creditManager.create(coworkerCompanyId, company, -1 * parseInt(price), currencyId,undefined, description)
              .then(function(toCompanyCreatedCredit){
                let result = {
                  fromCompanyCredit: fromCompanyCreatedCredit,
                  toCompanyCredit: toCompanyCreatedCredit,
                }
                resolve(result);
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

function getTotalCreditCompany(company){
  return new Promise(function(resolve, reject) {
    ioc.companyManager.get_id(company)
      .then(function(foundCompany){
        var promiseList = []

        for (let coworkerCompany of foundCompany.coworkerCompanyList) {
          for (let currency of foundCompany.currencyList) {
            let newPromise =  new Promise(function(resolve, reject) {
              ioc.creditManager.getAll_company_currency(company, coworkerCompany, currency)
                .then(function(foundCreditList){
                  var totlaPrice = foundCreditList.reduce(function(total, foundCredit){
                    return total + foundCredit.price;
                  },0);
                  resolve({
                    currency :currency,
                    total: totlaPrice,
                    coworkerCompany: coworkerCompany,
                  });
                })
                .catch(function(err){
                  reject(err);
                });
            });

            promiseList.push(newPromise);
          }
        }



        Promise.all(promiseList)
          .then(function(dataSet){
            resolve(dataSet);
          })
          .catch(function(err){
            reject(err);
          });
      })
      .catch(function(err){
        reject(err);
      });


  });
}

function getAll_credit_company_dateTimeRange(company,fromDateTime,toDateTime){
  return ioc.creditManager.getAll_company_dateTimeRange(company,fromDateTime,toDateTime);
}


function exportRequestList(company){
  return new Promise(function(resolve, reject) {
    getAllRequest_company(company)
    .then(function(requestList){
      ioc.reportManager.generateRequestList(company, requestList)
        .then(function(reportFilePath){
          resolve(reportFilePath);
        })
        .catch(function(err){
          reject(err);
        });
    })
    .catch(function(err){
      reject(err);
    });
  });
}

function exportRemittanceList_intermediateCompany(company){
  return new Promise(function(resolve, reject) {
    getAll_intermediateCompany(company)
    .then(function(remittanceList){
      ioc.reportManager.generateRemittanceList_intermediateCompany(company, remittanceList)
        .then(function(reportFilePath){
          resolve(reportFilePath);
        })
        .catch(function(err){
          reject(err);
        });
    })
    .catch(function(err){
      reject(err);
    });
  });
}

function exportRemittanceList_distributorCompany(company){
  return new Promise(function(resolve, reject) {
    getAll_remittance_distributorCompany(company)
    .then(function(remittanceList){
      ioc.reportManager.generateRemittanceList_distributorCompany(company, remittanceList)
        .then(function(reportFilePath){
          resolve(reportFilePath);
        })
        .catch(function(err){
          reject(err);
        });
    })
    .catch(function(err){
      reject(err);
    });
  });
}

function getTrackingCode(company, trackingCode){
  return ioc.trackingCodeManager.get_company_code(company, trackingCode);
}

function getTotalPendingDistribution(company){
  return new Promise(function(resolve, reject) {
    ioc.companyManager.get_id(company)
      .then(function(foundCompany){
        console.log('foundCompany');
        console.log(foundCompany);
        var promiseList = foundCompany.currencyList.map(function(currency){
          return new Promise(function(resolve, reject) {
            ioc.remittanceManager.getAll_distributorCompany_status_currency(company, 'new', currency)
              .then(function(foundPendingRemittanceList){
                var totlaPrice = foundPendingRemittanceList.reduce(function(total, pendingRemittance){
                  return total+pendingRemittance.price;
                },0);
                resolve({
                  currency :currency,
                  total: totlaPrice,
                });
              })
              .catch(function(err){
                reject(err);
              });
          });
        });

        Promise.all(promiseList)
          .then(function(dataSet){
            resolve(dataSet);
          })
          .catch(function(err){
            reject(err);
          });
      })
      .catch(function(err){
        reject(err);
      });


  });
}

function getTotalPendingDistributionToDay(company){
  return new Promise(function(resolve, reject) {
    ioc.companyManager.get_id(company)
      .then(function(foundCompany){
        console.log('foundCompany');
        console.log(foundCompany);
        var promiseList = foundCompany.currencyList.map(function(currency){
          return new Promise(function(resolve, reject) {
            var today = new Date();
            ioc.remittanceManager.getAll_distributorCompany_status_currency_date(company, 'new', currency, today)
              .then(function(foundPendingRemittanceList){
                var totlaPrice = foundPendingRemittanceList.reduce(function(total, pendingRemittance){
                  return total+pendingRemittance.price;
                },0);
                resolve({
                  currency :currency,
                  total: totlaPrice,
                });
              })
              .catch(function(err){
                reject(err);
              });
          });
        });

        Promise.all(promiseList)
          .then(function(dataSet){
            resolve(dataSet);
          })
          .catch(function(err){
            reject(err);
          });
      })
      .catch(function(err){
        reject(err);
      });


  });
}

function getTotalDeliveredDistributionToDay(company){
  return new Promise(function(resolve, reject) {
    ioc.companyManager.get_id(company)
      .then(function(foundCompany){
        console.log('foundCompany');
        console.log(foundCompany);
        var promiseList = foundCompany.currencyList.map(function(currency){
          return new Promise(function(resolve, reject) {
            var today = new Date();
            ioc.remittanceManager.getAll_distributorCompany_status_currency_date(company, 'delivered', currency, today)
              .then(function(foundPendingRemittanceList){
                var totlaPrice = foundPendingRemittanceList.reduce(function(total, pendingRemittance){
                  return total+pendingRemittance.price;
                },0);
                resolve({
                  currency :currency,
                  total: totlaPrice,
                });
              })
              .catch(function(err){
                reject(err);
              });
          });
        });

        Promise.all(promiseList)
          .then(function(dataSet){
            resolve(dataSet);
          })
          .catch(function(err){
            reject(err);
          });
      })
      .catch(function(err){
        reject(err);
      });


  });
}

function searchUserPositionByKeyword(company, keyword, positionTitle){
  return new Promise(function(resolve, reject) {
    ioc.positionManager
    .get_company_title(company, positionTitle)
    .then(function(foundPosition) {
      if(foundPosition){
        ioc.userPositionManager.getAll_position_keyword(foundPosition, keyword)
          .then(function(foundUserPositionList){
            resolve(foundUserPositionList);
          })
          .catch(function(err){
            reject(err);
          });
      }else{
        var noPositionFoundError = new Error('No Position Found With Title : '+positionTitle);
        reject(noPositionFoundError);
      }
    })
    .catch(function(err){
      reject(err);
    });
  });
}


function getAllCompanyUserPositionListWithUser(company){
  return new Promise(function(resolve, reject) {
    ioc.positionManager
    .getAll_company(company)
    .then(function(foundPositionList) {

      let positionIdList = foundPositionList.map(function(currentPosition){
        return currentPosition._id;
      });

      ioc.userPositionManager.getAll_positionList(positionIdList)
        .then(function(foundUserPositionList){
          resolve(foundUserPositionList);
        })
        .catch(function(err){
          reject(err);
        });
    })
    .catch(function(err){
      reject(err);
    });
  });
}

function setAttachment(distributorCompany, filename, remittanceId, actor, channel) {
  return ioc.remittanceManager.attachFile(distributorCompany, filename, remittanceId, actor , channel)
}

function getTokenByEmailAndPassword(email, password){
  return new Promise(function(resolve, reject) {
    ioc.userManager.get_email_password(email, password)
      .then(function(foundUser){
        if(foundUser){
            ioc.authManager.getOrCreateByUser(foundUser)
              .then(function(foundAuth){

                getUserPositionList(foundUser)
                  .then(function(foundUserPositionList){
                    if(foundUserPositionList && foundUserPositionList.length > 0){
                      var adminPosition = foundUserPositionList.find(function(userPosition){
                        if(
                          userPosition.position.title == 'owner'
                        ){
                          return userPosition;
                        }
                      });
                      if(adminPosition){
                        console.log(foundUser.firstname+ ' ' + foundUser.lastname+ ' is ' + adminPosition.position.title + ' of ' + adminPosition.position.company.name);
                        resolve({ auth: foundAuth, company: adminPosition.position.company });
                      }
                    } else {
                      reject(new Error('Access Restricted!'));
                    }
                  })
                  .catch(function(err){
                    console.log(err);
                  });
              })
              .catch(function(err){
                reject(err);
              });
        }else{
          reject(new Error('Invalid Login!'));
        }
      })
      .catch(function(err){
        reject(err);
      });
  });
}

function getCompany_token(token){
  return new Promise(function(resolve, reject) {
    ioc.authManager.get(token)
      .then(function(foundAuth){
        if(foundAuth && foundAuth.user){
          var foundUser = foundAuth.user;
          getUserPositionList(foundUser)
            .then(function(foundUserPositionList){
              if(foundUserPositionList && foundUserPositionList.length > 0){
                var adminPosition = foundUserPositionList.find(function(userPosition){
                  if(
                    userPosition.position.title == 'owner'
                  ){
                    return userPosition;
                  }
                });
                if(adminPosition){
                  console.log(foundUser.firstname+ ' ' + foundUser.lastname+ ' is ' + adminPosition.position.title + ' of ' + adminPosition.position.company.name);
                  resolve({ auth: foundAuth, company: adminPosition.position.company });
                }
              } else {
                reject(new Error('Access Restricted!'));
              }
            })
            .catch(function(err){
              console.log(err);
              reject(err);
            });
        } else {
          reject(new Error('Access Denied!'));
        }

      })
      .catch(function(err){
        reject(err);
      });
  });
}

function setRequestWage(distributorCompany, requestId, distributorCompanyWagePrice, distributorCompanyWageCurrency, responseActor, responseChannel){
  return new Promise(function(resolve, reject) {
    ioc.requestManager.setWage(requestId, distributorCompany, distributorCompanyWagePrice, distributorCompanyWageCurrency, responseActor, responseChannel)
      .then(function(updatedRequest){
          ioc.tlgrmExchangeProvider.notifyWagedRequest(updatedRequest)
            .then(function(result){
              console.log(result);
              resolve(updatedRequest);
            })
            .catch(function(err){
                //reject(err);
                console.log(err);
                resolve(updatedRequest);
            })
      })
      .catch(function(err){
        reject(err);
      })
  });
}

function getUserBytelegramSystemRefId(telegramSystemRefId) {
  return ioc.userManager.get_telegramSystemRefId(telegramSystemRefId);
}

function getUserPositionList(user){
  return ioc.userPositionManager.getAll_user(user);
}

function getWageList_Company(company){
  return ioc.wageManager.getAll_company(company);
}

function getWage_company_coWorkerCompany_price_currency(company, coWorkerCompany, price, currency){
  return ioc.wageManager.get_company_coWorkerCompany_price_currency(company, coWorkerCompany, price, currency)
}

function getCompanyByBotToken(botToken){
  return ioc.companyManager.get_botToken(botToken);
}

function createWageRule(company, coWorkerCompanyId, currencyId, minPrice, maxPrice, price) {
  return ioc.wageManager.create(company, coWorkerCompanyId, currencyId, minPrice, maxPrice, price);
}

function create_request(intermediateCompany, remittanceId, distributorCompany) {
  var requestAt = new Date();
  return ioc.requestManager.createForRemittance(remittanceId, distributorCompany, requestAt);
}

function getAllRequest_company(company) {
  return ioc.requestManager.getAll_distributorCompany(company);
}

function getAllRequest_company_dateTimeRange(company, fromDateTime, toDateTime) {
  return ioc.requestManager.getAll_distributorCompany_fromDateTime_toDateTime(company, fromDateTime, toDateTime);
}

function getAll_currency() {
  return ioc.currencyManager.getAll();
}

function addCurrencyToCompany(company, currencyId) {
  return ioc.companyManager.addCurrency(company, currencyId)
}

function removeCurrencyFromCompany(company, currencyId) {
  return ioc.companyManager.removeCurrency(company, currencyId)
}

function getAll_transaction_company(company){
  return ioc.transactionManager.getAll_company(company);
}

function getAll_transaction_company_dateTimeRange(company,fromDateTime,toDateTime){
  return ioc.transactionManager.getAll_company_dateTimeRange(company,fromDateTime,toDateTime);
}



function setDistributorCompany(intermediateCompany, remittanceId, distributorCompany, distributorCompanyWagePrice, distributorCompanyWageCurrencyId){
  return new Promise(function(resolve, reject) {
    ioc.remittanceManager.setDistributorCompany(intermediateCompany, remittanceId, distributorCompany, distributorCompanyWagePrice, distributorCompanyWageCurrencyId)
      .then(function(updatedRemittance){

        ioc.creditManager.create(updatedRemittance.intermediateCompany, updatedRemittance.distributorCompany, updatedRemittance.price, updatedRemittance.currency,updatedRemittance, 'From Accepted Remittance');
        ioc.creditManager.create(updatedRemittance.intermediateCompany, updatedRemittance.distributorCompany, updatedRemittance.distributorCompanyWagePrice, updatedRemittance.distributorCompanyWageCurrency,updatedRemittance, 'From Accepted Remittance Wage');
        ioc.creditManager.create(updatedRemittance.distributorCompany, updatedRemittance.intermediateCompany, -1 * parseInt(updatedRemittance.price), updatedRemittance.currency,updatedRemittance, 'From Accepted Remittance');
        ioc.creditManager.create(updatedRemittance.distributorCompany, updatedRemittance.intermediateCompany, -1 * parseInt(updatedRemittance.distributorCompanyWagePrice), updatedRemittance.distributorCompanyWageCurrency,updatedRemittance, 'From Accepted Remittance Wage');

        ioc.tlgrmExchangeProvider.notifyAggreedRemittance(updatedRemittance)
          .then(function(response){
            //resolve(updatedRequest);
          })
          .catch(function(err){
            // reject(err);
            console.log(err);
            //resolve(updatedRequest);
          });

        resolve(updatedRemittance);
      })
      .catch(function(err){
        reject(err);
      });
  });
}

function get_company_all() {
  return ioc.companyManager.get_all();
}

function get_company_id(companyId) {
  return ioc.companyManager.get_id(companyId);
}

function create_company(company, owner) {
  return new Promise(function(resolve, reject) {
    ioc.userManager.create(owner.firstname, owner.lastname)
    .then(function(ownerUser){
      ioc.companyManager.createWithOwner(company.name, company.type, ownerUser)
        .then(function(company){
          resolve(company)
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

function create_remittance(intermediateCompany, applicant, receiver, price, currencyId ,intermediateCompanyWagePrice, intermediateCompanyWageCurrencyId){
  return new Promise(function(resolve, reject) {
    findOneOrCreateUserPosition_company_userPosition_positionTitle(intermediateCompany, applicant, 'applicant')
      .then(function(foundApplicantUserPosition){
        findOneOrCreateUserPosition_company_userPosition_positionTitle(intermediateCompany, receiver, 'receiver')
          .then(function(foundReceiverUserPosition){
            ioc.remittanceManager.create(foundApplicantUserPosition, intermediateCompany, price, currencyId, foundReceiverUserPosition, new Date(), intermediateCompanyWagePrice, intermediateCompanyWageCurrencyId)
            .then(function(createdRemittance){
              ioc.transactionManager.remittanceCreationJob(createdRemittance)
                .then(function(createdTransactionLogList){
                  console.log(createdTransactionLogList);
                  resolve(createdRemittance);
                })
                .catch(function(err){
                  reject(err);
                });
              //resolve(createdRemittance);
            })
            .catch(function(err){
              reject(err);
            });
          })
          .catch(function(err){
            reject(err);
          });
      })
      .catch(function(err){
        reject(err);
      });
  });
}

function createSimpleRemittanceRquest(distributorCompany, intermediateCompany, price, currencyId, receiverTitle) {
  return new Promise(function(resolve, reject) {
    ioc.positionManager.getOrCreate_company_title(intermediateCompany,'receiver')
      .then(function(foundReceiverPosition){
        ioc.userManager.createWithTitle(receiverTitle)
        .then(function(createdReceiverUser){
          ioc.userPositionManager.create(createdReceiverUser, foundReceiverPosition)
            .then(function(createdReceiverUserPosition){
              ioc.remittanceManager.createSimple(intermediateCompany, createdReceiverUserPosition, price, currencyId, new Date())
              .then(function(createdRemittance){
                ioc.requestManager.createForRemittance(createdRemittance, distributorCompany, new Date())
                  .then(function(createdRequest){
                    ioc.requestManager.get(createdRequest._id)
                      .then(function(foundRequest){
                        console.log('####REciver info');
                        console.log(foundRequest.remittance.receiver);
                        ioc.userManager.get(foundRequest.remittance.receiver.user)
                          .then(function(foundReceiver){
                            getWage_company_coWorkerCompany_price_currency(distributorCompany, intermediateCompany, price, currencyId)
                              .then(function(foundWage){
                                var destributorCompany = foundRequest.distributorCompany;
                                var destributorCompanyOwner = foundRequest.distributorCompany.owner;
                                var intermediateCompany = foundRequest.remittance.intermediateCompany;
                                var price = foundRequest.remittance.price;
                                var currency = foundRequest.remittance.currency;
                                var wagePrice = foundWage.wagePrice;
                                var wageCurrency = foundWage.currency;
                                var receiverTitle = foundReceiver.title;
                                ioc.tlgrmExchangeProvider.notifyNewRequest(destributorCompany, destributorCompanyOwner, intermediateCompany, price, currency, wagePrice, wageCurrency, receiverTitle, foundRequest._id);
                                resolve(foundRequest);
                              })
                              .catch(function(err){
                                reject(err)
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
              })
              .catch(function(err){
                reject(err);
              })
            })
            .catch(function(err){
              reject(err)
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

function createNewRequest(distributorCompany, intermediateCompany, requestAt, price, currency, receiverTitle, status, actor, channel){
  return ioc.requestManager.create(distributorCompany, intermediateCompany, requestAt, price, currency, receiverTitle, status, actor, channel);
}

function findOneOrCreateUserPosition_company_userPosition_positionTitle(company, userPosition, positionTitle){
  return new Promise(function(resolve, reject) {
    if(userPosition._id){
      ioc.userPositionManager.get_id(userPosition._id)
        .then(function(foundUserPosition){
          if(foundUserPosition){
            resolve(foundUserPosition);
          }else {
            var noUserPositionFoundWithIdError = new Error('No User Position Found With ID ' + userPosition._id);
            reject(noUserPositionFoundWithIdError);
          }
        })
        .catch(function(err){
          reject(err);
        });
    }else{
      ioc.positionManager
        .getOrCreate_company_title(company,positionTitle)
        .then(function(foundPosition){
          ioc.userManager
            .create(userPosition.firstname, userPosition.lastname, userPosition.cellNumber, userPosition.email, userPosition.title)
            .then(function(createdUser){
              ioc.userPositionManager.create(createdUser, foundPosition)
                .then(function(createdUserPosition){
                  resolve(createdUserPosition);
                })
                .catch(function(err){
                  reject(err);
                });
            })
            .catch(function(err){
              reject(err);
            });
        })
        .catch(function(err){
          reject(err);
        });
    }
  });
}

function create_distribution(intermediateCompany, receiver, price, currencyId, distributionCompany, distributorCompanyWagePrice, distributorCompanyWageCurrencyId) {
  return new Promise(function(resolve, reject) {
    if(receiver._id){
      ioc.userPositionManager.get_id(receiver._id)
        .then(function(foundReceiverUserPosition){
          if(foundReceiverUserPosition){
            ioc.remittanceManager
            .createDistribution(distributionCompany, price, currencyId, foundReceiverUserPosition, new Date(),distributionCompany, distributorCompanyWagePrice, distributorCompanyWageCurrencyId)
            .then(function(createdRemittance){
              // ioc.transactionManager.disterbutorSetJob(createdRemittance)
              // .then(function(createdTransactionLogList){
              //   console.log(createdTransactionLogList);
              //   resolve(createdRemittance);
              // })
              // .catch(function(err){
              //   reject(err);
              // })
              resolve(createdRemittance);
            })
            .catch(function(err){
              reject(err);
            })
          } else{
            var noUserPositionFoundWithIdError = new Error('No User Position Found With ID ' + receiver._id);
            reject(noUserPositionFoundWithIdError);
          }
        })
        .catch(function(err){
          reject(err);
        })
    }else{
      ioc.positionManager
        .getOrCreate_company_title(distributionCompany,'receiver')
        .then(function(foundReceiverPosition){
          ioc.userManager.create(receiver.firstname, receiver.lastname, receiver.cellNumber, receiver.email, receiver.title)
          .then(function(foundReceiverUser){
            ioc.userPositionManager.create(foundReceiverUser, foundReceiverPosition)
              .then(function(foundReceiverUserPosition){
                ioc.remittanceManager
                  .createDistribution(intermediateCompany, price, currencyId, foundReceiverUserPosition, new Date(),distributionCompany, distributorCompanyWagePrice, distributorCompanyWageCurrencyId)
                  .then(function(createdRemittance){
                    // ioc.transactionManager.disterbutorSetJob(createdRemittance)
                    //   .then(function(createdTransactionLogList){
                    //     console.log(createdTransactionLogList);
                    //     resolve(createdRemittance);
                    //   })
                    //   .catch(function(err){
                    //     reject(err);
                    //   })
                    resolve(createdRemittance);
                  })
                  .catch(function(err){
                    reject(err);
                  })
              })
              .catch(function(err){
                reject(err)
              })
          })
          .catch(function(err){
            reject(err);
          })
        })
        .catch(function(err){
          reject(err);
        })
    }

  });
}

function get_remittance_intermediateCompany_id(intermediateCompany, remittanceId){
  console.log('intermediateCompany, remittanceId');
  console.log(intermediateCompany, remittanceId);
  return ioc.remittanceManager.get_intermediateCompany_remittanceId(intermediateCompany, remittanceId);
}


function get_remittance_distributorCompany_id(distributorCompany, remittanceId){
  console.log('distributorCompany, remittanceId');
  console.log(distributorCompany, remittanceId);
  return ioc.remittanceManager.get_distributorCompany_remittanceId(distributorCompany, remittanceId);
}

function get_coworkers_company(company){
  return ioc.companyManager.get_coworkers_company(company);
}

function get_currencyList_company(company){
  return ioc.companyManager.get_currencyList_company(company);
}

function getAll_remittance_intermediateCompany(intermediateCompany) {
  return ioc.remittanceManager.getAll_intermediateCompany(intermediateCompany);
}

function getAll_remittance_distributorCompany(distributorCompany) {
  return ioc.remittanceManager.getAll_distributorCompany(distributorCompany);
}

function getAll_remittance_distributorCompany_status(distributorCompany, status) {
  return ioc.remittanceManager.getAll_distributorCompany_status(distributorCompany, status);
}

function getAll_remittance_distributorCompany_dateTimeRange(distributorCompany, fromDateTime, toDateTime) {
  return ioc.remittanceManager.getAll_distributorCompany_fromDate_toDate(distributorCompany, fromDateTime, toDateTime);
}

function add_co_worker(company, coWorkerCompanyName, coWorkerCompanyEmail, ownerFirstname, ownerLastname, ownerCellnumber, ownerEmail) {
  return new Promise(function(resolve, reject) {
    if(
      ownerFirstname ||
      ownerLastname ||
      ownerCellnumber ||
      ownerEmail
    ) {
      ioc
        .userManager
        .create(ownerFirstname, ownerLastname,ownerCellnumber, ownerEmail)
        .then(function(createdOwner){
          ioc
            .companyManager
            .createWithOwnerAndCurrencyList(coWorkerCompanyName, 'member', createdOwner, company.currencyList)
            .then(function(createdCoWorkerCompany) {
              ioc.companyManager.addCoWorker(company, createdCoWorkerCompany)
                .then(function(updatedCompany){
                    resolve(updatedCompany);
                })
                .catch(function(err){
                  reject(err);
                });
            })
            .catch(function(err){
              reject(err);
            });
        })
        .catch(function(err) {
          reject(err);
        });
    }
  });
}

function acceptRequest(company, actor, requestId, responseChannel){
  return new Promise(function(resolve, reject) {
    ioc.requestManager.acceptRequest(company, actor, requestId, responseChannel)
      .then(function(updatedRequest){
        var coWorkerCompany = updatedRequest.remittance.intermediateCompany;
        var price = updatedRequest.remittance.price;
        var currency = updatedRequest.remittance.currency;
        ioc.wageManager.get_company_coWorkerCompany_price_currency(company, coWorkerCompany, price, currency)
          .then(function(foundWage){
            var remittanceId = updatedRequest.remittance._id;
            ioc.remittanceManager.setDistributorCompany(coWorkerCompany, remittanceId, company, foundWage.wagePrice, foundWage.currency)
              .then(function(updatedRemittance){
                // ioc.transactionManager.disterbutorSetJob(updatedRemittance)
                //   .then(function(createdTransactionLogList){
                //     console.log(createdTransactionLogList);
                //     resolve(updatedRemittance);
                //   })
                //   .catch(function(err){
                //     reject(err);
                //   });
                resolve(updatedRemittance);
              })
              .catch(function(err){
                reject(err);
              });
          })
          .catch(function(err){
            reject(err);
          });
      })
      .catch(function(err){
        reject(err);
      });
  });
}

function acceptWagedRequest(intermediateCompany, actor, requestId, responseChannel){
  return new Promise(function(resolve, reject) {
    ioc.requestManager.acceptWagedRequest(actor, requestId, responseChannel)
      .then(function(updatedRequest){
        console.log('acceptWagedRequest updatedRequest');
        console.log(updatedRequest);

        ioc.positionManager.getOrCreate_company_title(updatedRequest.distributorCompany,'receiver')
        //ioc.positionManager.getOrCreate_company_title(intermediateCompany,'receiver')
          .then(function(foundReceiverPosition){
            var receiverTitle = updatedRequest.receiverTitle;
            ioc.userManager.createWithTitle(receiverTitle)
              .then(function(foundReceiverUser){
                ioc.userPositionManager.findOrCreate_user_position(foundReceiverUser, foundReceiverPosition)
                  .then(function(foundReceiverUserPosition){
                    var receiverUserPosition = foundReceiverUserPosition;
                    var distributorCompany = updatedRequest.distributorCompany;
                    var price = updatedRequest.price;
                    var currencyId = updatedRequest.currency;
                    var distributorCompanyWagePrice = updatedRequest.distributorCompanyWagePrice;
                    var distributorCompanyWageCurrency = updatedRequest.distributorCompanyWageCurrency;
                    var requestAt = new Date();

                    ioc.remittanceManager
                      .createFromRequest(intermediateCompany, distributorCompany, receiverUserPosition, price, currencyId, distributorCompanyWagePrice, distributorCompanyWageCurrency, requestAt, updatedRequest)
                      .then(function(createdRemittance){

                        ioc.creditManager.create(distributorCompany, intermediateCompany, -1 * parseInt(price), currencyId,createdRemittance, 'From Accepted Remittance');
                        ioc.creditManager.create(distributorCompany, intermediateCompany, -1 * parseInt(distributorCompanyWagePrice), distributorCompanyWageCurrency,createdRemittance, 'From Accepted Remittance Wage');
                        ioc.creditManager.create(intermediateCompany, distributorCompany, price, currencyId,createdRemittance, 'From Accepted Remittance');
                        ioc.creditManager.create(intermediateCompany, distributorCompany, distributorCompanyWagePrice, distributorCompanyWageCurrency,createdRemittance, 'From Accepted Remittance Wage');

                        resolve(createdRemittance);
                      })
                      .catch(function(err){
                        console.log(err);
                        rejcet(err);
                      });
                  })
                  .catch(function(err){
                    console.log(err);
                    reject(err);
                  });

              })
              .catch(function(err){
                console.log(err);
                reject(err);
              });
          })
          .catch(function(err){
            console.log(err);
            reject(err);
          });
      })
      .catch(function(err){
        reject(err);
      });
  });
}

function cancelWagedRequest(intermediateCompany, actor, requestId, responseChannel){
  return new Promise(function(resolve, reject) {
    ioc.requestManager.cancelWagedRequest(actor, requestId, responseChannel)
      .then(function(updatedRequest){
        resolve(updatedRequest);
      })
      .catch(function(err){
        reject(err);
      });
  });
}

function rejectRequest(company, actor, requestId, responseChannel){
  return new Promise(function(resolve, reject) {
    ioc.requestManager.rejectRequest(company, actor, requestId, responseChannel)
      .then(function(updatedRequest){
        console.log('updatedRequest');
        console.log(updatedRequest);
        // call telegram api to notify the user the rejection
        ioc.tlgrmExchangeProvider.notifyRejectedRequest(updatedRequest)
          .then(function(response){
            resolve(updatedRequest);
          })
          .catch(function(err){
            // reject(err);
            console.log(err);
            resolve(updatedRequest);
          });
      })
      .catch(function(err){
        reject(err);
      })
  });
}

function deliveredRemittance(company, actor, remittanceId, responseChannel){
  return new Promise(function(resolve, reject) {
    console.log('company, remittanceId, actor, responseChannel');
    console.log(company, remittanceId, actor, responseChannel);
    ioc.remittanceManager.setAsDelivered(company, remittanceId, actor, responseChannel)
      .then(function(updatedRemittance){
        if(updatedRemittance){
          // ioc.transactionManager.remittanceDeliveredJob(updatedRemittance)
          // .then(function(createdTransactionLog){
          //   console.log(createdTransactionLog);
          //   ioc.tlgrmExchangeProvider.notifyDeliveredRemittance(updatedRemittance)
          //   .then(function(response){
          //     console.log(response);
          //     resolve(updatedRemittance);
          //   })
          //   .catch(function(err){
          //     //rejcet(err);
          //     console.log(err);
          //     resolve(updatedRemittance);
          //   });
          // })
          // .catch(function(err){
          //   reject(err);
          // });

          ioc.tlgrmExchangeProvider.notifyDeliveredRemittance(updatedRemittance)
          .then(function(response){
            console.log(response);
            resolve(updatedRemittance);
          })
          .catch(function(err){
            //rejcet(err);
            console.log(err);
            resolve(updatedRemittance);
          });
        }else{
          var noRemittanceFoundToSetAsDeliveredError = new Error('No Remittance Found to update with id: ' + remittanceId);
          reject(noRemittanceFoundToSetAsDeliveredError)
        }
      })
      .catch(function(err){
        reject(err);
      });
  });
}

function reverseRemittance(company, actor, remittanceId, responseChannel){
  return new Promise(function(resolve, reject) {
    ioc.remittanceManager.setAsReverse(company, remittanceId, actor, responseChannel)
      .then(function(updatedRemittance){
        // ioc.transactionManager.remittanceReversedJob(updatedRemittance)
        //   .then(function(createdTransactionLogList){
        //     console.log(createdTransactionLogList);
        //     ioc.tlgrmExchangeProvider.notifyReversedRemittance(updatedRemittance)
        //       .then(function(response){
        //         console.log(response);
        //         resolve(updatedRemittance);
        //       })
        //       .catch(function(err){
        //         // rejcet(err);
        //         console.log(err);
        //         resolve(updatedRemittance);
        //       });
        //   })
        //   .catch(function(err){
        //     reject(err);
        //   });

          ioc.tlgrmExchangeProvider.notifyReversedRemittance(updatedRemittance)
            .then(function(response){
              console.log(response);
              resolve(updatedRemittance);
            })
            .catch(function(err){
              // rejcet(err);
              console.log(err);
              resolve(updatedRemittance);
            });
      })
      .catch(function(err){
        reject(err);
      });
  });
}

exports = module.exports = function(){
  this.exportRequestList = exportRequestList;
  this.exportRemittanceList_intermediateCompany = exportRemittanceList_intermediateCompany;
  this.exportRemittanceList_distributorCompany = exportRemittanceList_distributorCompany;
  this.get_company_all = get_company_all;
  this.get_company_id = get_company_id;
  this.create_company = create_company;
  this.create_remittance = create_remittance;
  this.createSimpleRemittanceRquest = createSimpleRemittanceRquest;
  this.create_distribution = create_distribution;
  this.get_remittance_intermediateCompany_id = get_remittance_intermediateCompany_id;
  this.get_coworkers_company = get_coworkers_company;
  this.setDistributorCompany = setDistributorCompany;

  // ======== [socket] ======================================================================
  this.addNewSocketConnection = addNewSocketConnection;

  // ======== [remittance] ======================================================================
  this.getAll_remittance_intermediateCompany = getAll_remittance_intermediateCompany;
  this.getAll_remittance_distributorCompany = getAll_remittance_distributorCompany;
  this.getAll_remittance_distributorCompany_status = getAll_remittance_distributorCompany_status;
  this.getAll_remittance_distributorCompany_dateTimeRange = getAll_remittance_distributorCompany_dateTimeRange;

  // ======== [transactioin] ======================================================================
  this.getAll_transaction_company = getAll_transaction_company;
  this.getAll_transaction_company_dateTimeRange = getAll_transaction_company_dateTimeRange;
  this.create_transaction = create_transaction;
  this.create_transaction_from_remittance = create_transaction_from_remittance;

  // ======== [currency] ======================================================================
  this.getAll_currency = getAll_currency;
  this.addCurrencyToCompany = addCurrencyToCompany;
  this.removeCurrencyFromCompany = removeCurrencyFromCompany;
  this.get_currencyList_company = get_currencyList_company;


  this.add_co_worker = add_co_worker;
  this.create_request = create_request;
  this.getAllRequest_company = getAllRequest_company;
  this.getAllRequest_company_dateTimeRange = getAllRequest_company_dateTimeRange;
  this.getWageList_Company = getWageList_Company;
  this.createWageRule = createWageRule;
  this.getWage_company_coWorkerCompany_price_currency = getWage_company_coWorkerCompany_price_currency;
  this.getUserBytelegramSystemRefId = getUserBytelegramSystemRefId;
  this.getUserPositionList = getUserPositionList;
  this.getCompanyByBotToken = getCompanyByBotToken;
  this.acceptRequest = acceptRequest;
  this.rejectRequest = rejectRequest;
  this.deliveredRemittance = deliveredRemittance;
  this.reverseRemittance = reverseRemittance;
  this.setRequestWage = setRequestWage;
  this.acceptWagedRequest = acceptWagedRequest;
  this.createNewRequest = createNewRequest;
  this.getTokenByEmailAndPassword  = getTokenByEmailAndPassword;
  this.getCompany_token = getCompany_token;
  this.cancelWagedRequest = cancelWagedRequest;
  this.setAttachment = setAttachment;
  this.searchUserPositionByKeyword = searchUserPositionByKeyword;
  this.get_remittance_distributorCompany_id = get_remittance_distributorCompany_id;
  this.getTotalPendingDistribution = getTotalPendingDistribution;
  this.getTotalPendingDistributionToDay = getTotalPendingDistributionToDay;
  this.getTotalDeliveredDistributionToDay = getTotalDeliveredDistributionToDay;
  this.getTrackingCode = getTrackingCode;
  this.getAllCompanyUserPositionListWithUser = getAllCompanyUserPositionListWithUser;
  this.getTotalTransactionCompany = getTotalTransactionCompany;
  this.getTotalTransactionCompanyDateTimeRange = getTotalTransactionCompanyDateTimeRange;

  // ======== [credit] ======================================================================
  this.create_credit = create_credit;
  this.getTotalCreditCompany = getTotalCreditCompany;
  this.getAll_credit_company_dateTimeRange = getAll_credit_company_dateTimeRange;
};
