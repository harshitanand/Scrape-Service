var request = require('request')
  cheerio = require('cheerio')
  fs = require('fs');
  url = "https://medium.com/"

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
      data = [];
      $(links).each(function(i, link){
        var uri = $(link).attr('href');
        if(uri != url)
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

function saveData (uri, callback){
  fs.appendFile('tem.csv', uri+'\r\n', function(err){
    if (err) 
      callback(err);
    callback(err, uri);
  });
};

/*function makeNestedRequests (links, callback){
  links, function(link, _callback){
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
};*/

setParams(function(err, web, meth, conn){
  makeRequest(web,meth,conn, function(err, links){
    if(links.length>0){
      links.forEach(function(link){
        saveData(link, function(err, res){
          console.log(res);    
          makeRequest(link,meth,conn, function(err, data){
          if(data){
            data.forEach(function(uri){
              saveData(uri, function(err, res){
                console.log(res);
              });
            });
          }
          });
        });
      });
    }
  });
  console.log("All HyperLinks saved Sucessfully");
});
