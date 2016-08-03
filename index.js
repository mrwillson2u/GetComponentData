var jsdom = require('jsdom');
var $ = require('jquery');
var http = require('http');
var async = require('async');


// Function call below is only for testing on local machine
// getData('http://www.mouser.com/Search/ProductDetail.aspx?R=C0805C105K4RACTUvirtualkey64600000virtualkey80-C0805C105K4R', function(data) {
//   console.log("ALL Data: ", data);
// })

var q = async.queue(function(task, callback) {
    console.log('hello ' + task.name);


    getData(body, function(data) {
      console.log("responding to request: ", data);
      // console.log(typeof data);

      callback(data);
    });
  }, 1);// create a queue object with concurrency 2

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
    getData(request.URL, function(data) {
      console.log("URL: " + URL);
      request.pipe(data);
    });
  } else if (request.method === 'POST') {//request.url === ''

    var body = [];
    request.on('data', function(chunk) {
      body.push(chunk);
    }).on('end', function() {
      body = Buffer.concat(body).toString();
      console.log('body: ', body);
      console.log(typeof body);
      // at this point, `body` has the entire request body stored in it as a string

      q.push(body, function (err, data) {
        //console.log('finished processing: ', body);
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

      // Check which website URL is from
      var website = getHostName(URL);

      if(website === "mouser") {
        var MPN = window.$('#divManufacturerPartNum').text();
        MPN = rmBreaks(MPN);

        var descrption = window.$('#divDes').text();
        descrption = rmBreaks(descrption);

        var priceBreaks = [];
        var i = 0;
        var j = 1

        // Store all the price breaks in an array of objects
        var qty = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lnkQuantity').text());
        var price = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lblPrice').text());
        // console.log("Initial qty/price: ", qty + "/" + price);
        do {
          //Strip "$" and any remaining white space from price
          price = price.replace("$", "");
          // price.trim();

          priceBreaks.push({"quantity": parseInt(qty), "price": parseFloat(price)});
          // Incriment two digit number
          if(j === 9) {
            j = 0;
            i++;
          }else {
            j++;
          }
          qty = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lnkQuantity').text());
          price = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lblPrice').text());

          // console.log("New qty/price: ", qty + "/" + price);
        }
        while (qty)

        var specs = {};
        var i = 0;
        var j = 1
        // Store all the price breaks in an array of objects
        var specCat = rmBreaks(window.$('#ctl00_ContentMain_Specifications_dlspec_ctl' + i.toString() + j.toString() + '_lblDimension').text());
        var specVal = rmBreaks(window.$('#ctl00_ContentMain_Specifications_dlspec_ctl' + i.toString() + j.toString() + '_lblName').text());
        // console.log("Initial cat/val: ", specCat + "/" + specVal);
        do {

          specs[specCat] = specVal;
          // Incriment two digit number
          if (j === 9) {
            j = 0;
            i++;
          } else {
            j++;
          }

          specCat = rmBreaks(window.$('#ctl00_ContentMain_Specifications_dlspec_ctl' + i.toString() + j.toString() + '_lblDimension').text());
          specVal = rmBreaks(window.$('#ctl00_ContentMain_Specifications_dlspec_ctl' + i.toString() + j.toString() + '_lblName').text());

          // console.log("New cat/val: ", specCat + "/" + specVal);
        }
        while (specCat)

        var returnJSON = JSON.stringify({"mpn": MPN, "desc": descrption, "priceBreaks": priceBreaks, "specs": specs});
        console.log("returnJSON: ", returnJSON);
        callback(returnJSON);

      } else if(website === "adafruit") {
        // //prod-right-side product_id prod-price
        // var prodName = window.$('#prod-right-side h1').text();
        // prodName = rmBreaks(prodName);
        // var prodId = window.$('.product_id').text();
        // prodId = rmBreaks(prodId);
        //
        // var priceBreaks = [];
        // var i = 0;
        // var j = 1
        //
        // // Store all the price breaks in an array of objects
        // var qty = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lnkQuantity').text());
        // var price = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lblPrice').text());
        // // console.log("Initial qty/price: ", qty + "/" + price);
        // do {
        //   //Strip "$" and any remaining white space from price
        //   price = price.replace("$", "");
        //   // price.trim();
        //
        //   priceBreaks.push({"quantity": parseInt(qty), "price": parseFloat(price)});
        //
        //   qty = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lnkQuantity').text());
        //   price = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lblPrice').text());
        //
        //   // console.log("New qty/price: ", qty + "/" + price);
        // }
      } else if(website === "amazon") {

      }

    } else {
        console.log(err + "- invalid url.");
    }
  }});
}
// Removes all types of line breaks from a string
function rmBreaks(rawString) {
  return rawString.replace(/(\r\n|\n|\r)/gm,"");
}

// Strips hostname from URL
function getHostName(url) {
  var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
  return match[2];
  }
  else {
      return null;
  }
}
