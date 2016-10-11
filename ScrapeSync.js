var request = require('request')
  cheerio = require('cheerio')
  exec = require('child_process').exec
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
      data = [];
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

function saveData (uri, callback){
  fs.appendFile('temp-sync.csv', uri+'\r\n', function(err){
    if (err) 
      callback(err);
    callback(err, uri);
  });
};

exec("rm -rf temp-sync.csv");
setParams(function(err, web, meth, conn){
  makeRequest(web,meth,conn, function(err, links){
    if(links){
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
      console.log("All HyperLinks saved Sucessfully");
    }
  });
});
