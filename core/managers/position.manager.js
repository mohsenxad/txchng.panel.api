var Position;

function create(company, title){
  var newPosition = new Position({
    company: company,
    title: title
  });

  return newPosition.save()
}

function get_company_title(company, title){
  return new Promise(function(resolve, reject) {
    var query = { company: company, title: title };
    Position.findOne(query)
    .then(function(foundPosition){
      if(foundPosition){
        resolve(foundPosition);
      }else{
        reject(new Error('No Position Found in ' + company + ' with title '+title))
      }
    })
    .catch(function(err){
      reject(err);
    })
  });
}



function getAll_company(company){
  var query = {
    company: company
  };
  return Position.find(query);
}

function getOrCreate_company_title(company, title){
  return new Promise(function(resolve, reject) {
    var query = {
      company: company,
      title: title
    };

    Position.findOne(query)
    .then(function(foundPosition){
      if(foundPosition){
        resolve(foundPosition);
      }else{
        create(company, title)
          .then(function(createdPosition){
            resolve(createdPosition);
          })
          .catch(function(err){
            reject(err);
          })
      }
    })
    .catch(function(err){
      reject(err);
    })
  });
}

exports = module.exports = function(options){
  Position = options.positionModel;

  this.create = create;
  this.getAll_company = getAll_company;
  this.get_company_title = get_company_title;
  this.getOrCreate_company_title = getOrCreate_company_title;
}
