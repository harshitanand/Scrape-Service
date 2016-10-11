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
      toSave = "";
      data = [];
      $(links).each(function(i, link){
        var uri = $(link).attr('href');
        if(uri !== url){
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
  fs.appendFile('temp-sync.csv', data, function(err){
    if (err) 
      callback(err);
    callback(err, list);
  });
};

exec("rm -rf temp-sync.csv");
setParams(function(err, web, meth, conn){
  makeRequest(web,meth,conn, function(err, list, links){
    if(links){
      saveData(list, links, function(err, res){
        res.forEach(function(uri){
          makeRequest(uri,meth,conn, function(err, arr, data){
            if(data){
              saveData(arr, data, function(err, res){
                console.log(res);
              });
            }
          })
        });
      });
      console.log("All HyperLinks saved Sucessfully");
    }
  });
});
