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
      data = []
      $(links).each(function(i, link){
        var uri = $(link).attr('href');
        if(uri !== url)
          data.push(uri);
      });
      if (data.length > 0)
        callback(null, data);
      else
        callback("Not Sufficient links found");
    }
    else
      callback(null, []);
  });
};

function saveData (data, callback){
  if (data)
  {
    async.map(data, function(uri, _callback){
      fs.appendFile('temp-async.csv', uri+'\r\n', function(err){
        if (err) 
          _callback(err);
        _callback(err, uri)
      });
    }, function(err, result){
          callback(err, result);
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

exec("rm -rf temp-async.csv");
async.waterfall([setParams, makeRequest, saveData, makeNestedRequests], function(err, res){
  console.log("All URLS saved succesfully");
});

