var request = require('request')
  cheerio = require('cheerio')
  _ = require('underscore')
  exec = require('child_process').exec
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
  fs.appendFile('data/temp-sync.csv', data, function(err){
    if (err) 
      callback(err);
    callback(err, list);
  });
};

exec("rm -rf data/temp-sync.csv");
setParams(function(err, web, meth, conn){
  makeRequest(web,meth,conn, function(err, list, links){
    if(links){
      saveData(list, links, function(err, res){
        console.log("All HyperLinks at LEVEL 1 saved Sucessfully");
        for (var i=2; i<=depth; i++){
          if (i===2)
            nextSet = _.uniq(res);
          else
            nextSet = _.uniq(finalRes)
          finalRes = []
          nextSet.forEach(function(uri){
            makeRequest(uri,meth,conn, function(err, arr, data){
              if(data){
                saveData(arr, data, function(err, res){
                  finalRes = finalRes.concat(res);
                });
              }
            })
          });
          console.log("All HyperLinks at LEVEL " + i.toString() +  " saved Sucessfully");
        }
      });
    }
  });
});
