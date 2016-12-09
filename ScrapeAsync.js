var request = require('request')
  async = require('async')
  _ = require('underscore')
  exec = require('child_process').exec
  cheerio = require('cheerio')
  fs = require('fs');
  url = process.argv[2] || "https://medium.com/"
  depth = process.argv[3] || 2

function setParams (callback){
  var main = url,
    method = "GET",
    pool = 5;
  callback(null, main, method, pool);
};

function makeRequest (url, method, pool, callback){
  request ({'url':url, 'method':method, 'pool.maxSockets': pool}, function(err, resp, body){
    if(body){
      $ = cheerio.load(body);
      links = $('a');
      toSave = "";
      data = [];
      $(links).each(function(i, link){
        var uri = $(link).attr('href');
        if(uri && uri != url && (uri.startsWith('https://') || uri.startsWith('http://') || uri.startsWith('//'))){
          data.push(uri);
        }
      });
      data = _.uniq(data);
      toSave = data.join('\r\n');
      if (data[2])
        callback(null, data, toSave);
      else
        callback("Not Sufficient links found");
    }
    else
      callback(null, [], toSave);
  });
};

function saveData (list, data, callback){
  if (list)
  {
    fs.appendFile('data/temp-async.csv', data, function(err){
      if (err) 
        callback(err);
      callback(err, list)
    });
  }
};

function makeNestedRequests (links,count, callback){
  finalRes = []
  async.map(links, function(link, _callback){
    url = link;
    async.waterfall([setParams, makeRequest, saveData], function(err, res){
      finalRes = finalRes.concat(res);
      if (err)
        _callback(err);
      else
        _callback(err, res);
    });
  }, function(err, results){
      console.log("All URLS at LEVEL " + count.toString() +  " saved succesfully");
      callback(err, finalRes);
  });    
};

exec("rm -rf data/temp-async.csv");
//async.waterfall([setParams, makeRequest, saveData, makeNestedRequests], function(err, res){
//  console.log("All URLS saved succesfully");
//});
async.waterfall([setParams, makeRequest, saveData], function(err, res){
  console.log("All URLS at LEVEL 1 saved succesfully");
  nextSet = _.uniq(res);
  for (var i=2; i<=depth; i++){
    makeNestedRequests(nextSet,i, function(err, data){
      nextSet = _.uniq(data);
    })
  }
});
