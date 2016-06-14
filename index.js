var jsdom = require('jsdom');
var $ = require('jquery');
var http = require('http');


http.createServer(function(request, response) {
  console.log("request method:");
  console.log(request.method);

  request.on('error', function(err) {
    console.error(err);
    response.statusCode = 400;
    response.end();
  });
  response.on('error', function(err) {
    console.error(err);
  });

  if (request.method === 'GET') {//request.url === ''
    //var token = tokenGenerator.createToken({uid: request.uid});
    var data = getData(request.URL);
    console.log("URL: " + URL);
    request.pipe(data);
  } else if (request.method === 'POST') {//request.url === ''

    var body = [];
    request.on('data', function(chunk) {
      body.push(chunk);
    }).on('end', function() {
      body = Buffer.concat(body).toString();
      console.log('body');
      console.log(body);
      // at this point, `body` has the entire request body stored in it as a string
      var data = getData(request.URL);
      console.log("URL: " + URL);
      response.write(data);
      response.end();
    });
  } else {
    response.statusCode = 404;
    response.end();
  }

}).listen(process.env.PORT || 3000);

function getData(URL) {

  jsdom.env({url: URL, scripts: ["http://code.jquery.com/jquery.js"], created: function(err, window) {
    console.log("created: " + err);

  }, done: function (err, window) {
    // free memory associated with the window
    //console.log("window: " + window);

    if (!err && window !== null) {
      //var keyWordsArray = getKeyWords(window);
      //var parsedWordsArray = parseWords(keyWordsArray);
      //var countedWords = countKeyWords(parsedWordsArray);

      //var convertedName = site.hostname.replace(/\./g, " ");
      // ref.child('websites/' + convertedName + "/pages").push({page: site.page.val().URL, keyWords: countedWords});
      //fireUpload("websites/" + convertedName + "/pages", "push", {page: site.page.URL, keyWords: countedWords});
      var MPN = window.$('#divManufacturerPartNum').text();
      var descrption = window.$('#divDes').text();
      // var MPN = window.getElementById('divManufacturerPartNum');
      console.log(MPN);
      return {MPN: MPN, descrption: descrption};


    } else {
        console.log(err + "- invalid url.");
    }
  }});
}

// function MouserData(URL) {
//
//   var options = {
//     "muteHttpExceptions": true
//   };
//
//
//   var html = UrlFetchApp.fetch('www.mouser.com/', options).getContentText();
//
//   Logger.log(html);
//   var doc = XmlService.parse(html);
//   var html = doc.getRootElement();
//   var MPN = getElementById(html, 'divManufacturerPartNum');
//   var descrption = getElementById(html, 'divDes');
//
//   return [['MPN', 'descrption']];
//
// }
