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
      console.log('body: ', body);
      console.log(typeof body);
      // at this point, `body` has the entire request body stored in it as a string

      getData(body, function(data) {
        console.log("responding to request: ", data);
        console.log(typeof data);
        response.write(data);
        response.end();
      });
    });
  } else {
    response.statusCode = 404;
    response.end();
  }

}).listen(process.env.PORT || 3000);

function getData(URL, callback) {

  console.log("getting data for: ", URL);

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
      MPN = rmBreaks(MPN);

      var descrption = window.$('#divDes').text();
      descrption = rmBreaks(descrption);

      console.log("MPN: ", MPN);

      var priceBreaks = [];
      var i = 0;
      var j = 1

      // Store all the price breaks in an array of objects
      var qty = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lnkQuantity').text());
      var price = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lblPrice').text());
      console.log("Initial qty/price: ", qty + "/" + price);
      do {
        //Strip "$" and any remaining white space from price
        price = price.replace("$", "");
        // price.trim();

        priceBreaks.push({"quantity": parseInt(qty), "price": parseFloat(price)})
        // Incriment two digit number
        if(j === 9) {
          j = 0;
          i++;
        }else {
          j++;
        }

        qty = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lnkQuantity').text());
        price = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lblPrice').text());

        console.log("New qty/price: ", qty + "/" + price);
      }
      while (qty)

      var returnJSON = JSON.stringify({"mpn": MPN, "desc": descrption, "priceBreaks": priceBreaks});
      console.log("returnJSON: ", returnJSON);
      callback(returnJSON);

    } else {
        console.log(err + "- invalid url.");
    }
  }});
}
// Removes all types of line breaks from a string
function rmBreaks(rawString) {
  return rawString.replace(/(\r\n|\n|\r)/gm,"");
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
