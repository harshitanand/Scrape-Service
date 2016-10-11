var request = require('request');
var cheerio = require('cheerio');
var csvWriter = require('csv-write-stream');
var writer = csvWriter();
var fs = require('fs');
var file = fs.createWriteStream('temp.csv')
var url = "https://medium.com/"
request({'url':url, 'method':'GET', 'pool.maxSockets': 5}, function(err, resp, body){
  $ = cheerio.load(body);
  links = $('a'); //jquery get all hyperlinks
  $(links).each(function(i, link){
    var uri = $(link).attr('href')
    var text = $(link).text()
    console.log(text + ':\n  ' + uri);
    fs.appendFile('temp.csv', uri+'\r\n', function(err){
      if (err) return console.log(err);
    });
    //writer.pipe(file);
    //writer.write({link:uri});
    //writer.end();
  });
});
