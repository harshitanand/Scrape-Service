var request = require('request');
var async = require('async');
var cheerio = require('cheerio');
var fs = require('fs');

var setParams = function(callback){
  var main = "https://medium.com",
    method = "GET",
    pool = 5;
  callback(null, main, method, pool);
}

var makeRequest = function(url, method, pool, callback){
  request({'url':url, 'method':method, 'pool.maxSockets': pool}, function(err, resp, body){
    
    $ = cheerio.load(body);
    links = $('a');
    data = []
    $(links).each(function(i, link){
      var uri = $(link).attr('href')
      var text = $(link).text()
      data.push(uri);
    });
    if (data.length > 1)
      callback(null, data);
    else
      callback("Not Sufficient links found");
  });
};

var saveData = function(data, callback){
  if (data)
  {
    async.map(data, function(uri, _callback){
      fs.appendFile('temp.csv', uri+'\r\n', function(err){
        if (err) 
          _callback(err);
        _callback(err, uri)
      });
    }, function(err, result){
          callback(err, result);
    });
  }
};

async.waterfall([setParams, makeRequest, saveData], function(err, res){
  if (err)
    console.log(err);
  else
    console.log("All URLS saved succesfully");
});

