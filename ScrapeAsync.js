var request = require('request')
  async = require('async')
  exec = require('child_process').exec
  cheerio = require('cheerio')
  fs = require('fs');
  url = process.argv[2] || "https://medium.com/"

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
        if(uri && uri != url && (uri.startsWith('https://') || uri.startsWith('http://'))){
          toSave = toSave + uri + '\r\n';  
          data.push(uri);
        }
      });
      if (data.length > 0)
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

function makeNestedRequests (links, callback){
  async.map(links, function(link, _callback){
    url = link;
    async.waterfall([setParams, makeRequest, saveData], function(err, res){
      if (err)
      _callback(err);
      else
        _callback(err, res);
    });
  }, function(err, results){
      callback(err, results);
  });    
};

exec("rm -rf data/temp-async.csv");
async.waterfall([setParams, makeRequest, saveData, makeNestedRequests], function(err, res){
  console.log("All URLS saved succesfully");
});

