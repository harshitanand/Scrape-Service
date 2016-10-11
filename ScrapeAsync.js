var request = require('request')
  async = require('async')
  cheerio = require('cheerio')
  fs = require('fs');
  readline = require('readline')
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
      data = []
      $(links).each(function(i, link){
        var uri = $(link).attr('href')
        var text = $(link).text()
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

function saveData (data, callback){
  if (data.length>0)
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

function makeNestedRequest (links, callback){
  async.map(links, function(link, _callback){    
    var url = link;  
    function doreq(__callback){
      console.log("here",url);
      request({'url':url, 'method':"GET", 'pool.maxSockets':5}, function(err, resp, body){
        if(body){
          $ = cheerio.load(body);
          links = $('a');
          data = []
          $(links).each(function(i, link){
            var uri = $(link).attr('href')
            var text = $(link).text()
            if(uri!==url || uri!=='https://medium.com/')
              data.push(uri);
          });
          if(data.length > 1)
            __callback(null, data);
          else
            __callback(null);
        }
        else
          __callback(null, []);
      });    
    };

    function savelink(data, __callback){
      if (data.length>1)
      {
        console.log(data);
        async.map(data, function(uri, cb){
          fs.appendFile('temp.csv', uri+'\r\n', function(err){
            if (err) 
              cb(err);
            cb(err, uri)
          });
        }, function(err, result){
              console.log(err, result);
              __callback(err, result);
        });
      }
    }
    
    if(link!=="https://medium.com/"){
      async.waterfall([doreq, savelink], function(err, res){
        if (err)
          _callback(err);
        else
          _callback(err, res);
      })
    }
  },function(err, results){
      callback(err, results);
  });
};

function test (links, callback){
  async.map(links, function(link, _callback){
    if(link!=="https://medium.com/"){
      url = link;
      async.waterfall([setParams, makeRequest, saveData], function(err, res){
        if (err)
          _callback(err);
        else
          _callback(err, res);
      });
    }
  }, function(err, results){
      callback(err, results);
  });    
};

async.waterfall([setParams, makeRequest, saveData, test], function(err, res){
    console.log("All URLS saved succesfully");
});

