const jsdom = require('jsdom');
const { JSDOM } = jsdom;
var $ = require('jquery');
var http = require('http');
var async = require('async');
// Function call below is only for testing on local machine
// getData('http://www.mouser.com/Search/ProductDetail.aspx?R=C0805C105K4RACTUvirtualkey64600000virtualkey80-C0805C105K4R', function(data) {
//   console.log("ALL Data: ", data);
// })
// getData("https://www.adafruit.com/products/2659", function(data) {
//   console.log("responding to request: ", data);
//   // console.log(typeof data);
//
//   // callback(data);
//
// });
// var urlSet =  'https://www.mouser.com/ProductDetail/Murata-Electronics/GRM1885C1H103JA01D?qs=sGAEpiMZZMs0AnBnWHyRQP81ohtk65EYLjxkpOMiaYc%3d'
// gerPrices(urlSet, function(data) {
//   console.log("responding to getAllHTML: ", data);
//   // console.log(typeof data);
//
// } );

var q = async.queue(function(task, callback) {
    console.log('hello ' + task.body);
    getPrices(task.body, function(data) {
      console.log("responding to request: ", data);
      // console.log(typeof data);
      task.response.write(data);
      task.response.end();

      callback();
    } );
    // getData(task.body, function(data) {
    //   console.log("responding to request: ", data);
    //   // console.log(typeof data);
    //   task.response.write(data);
    //   task.response.end();
    //
    //   callback();
    // });

  }, 2);// create a queue object with concurrency 2

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

      q.push({body: body, response: response}, function (err, data) {
        console.log('Done processing: ', body);

      });


    });
  } else {
    response.statusCode = 404;
    response.end();
  }

}).listen(process.env.PORT || 3000, function() {
  console.log('listening on *:3000');
});

function getPrices(URL, callback) {

  JSDOM.fromURL(URL, {includeNodeLocations: true}).then(dom => {
  // console.log("SERIALIZE: ", dom.serialize());

  const doc = dom.window.document;
  var rows = doc.getElementsByClassName('pdp-pricing-table')[0].getElementsByClassName('div-table-row');
  // element = element[0].getElementsByClassName('div-table-row');
  // element = element[0].getElementsByTagName('a');
  // element = element[0].text();
  var pricBreakdown = [];
  console.log('HERE 3');
  var returnJSON = '';
  try {
    for(var i = 0; i < rows.length; i++) {


      var qty = rows[i].querySelector('a').text.trim();
      var checkIfQuote = rows[i].getElementsByClassName('col-xs-4')[1].querySelector('a').innerHTML;
      var price = '';

      if(checkIfQuote && checkIfQuote === 'Quote') {
        var price = checkIfQuote;
      } else {
        price = rows[i].getElementsByClassName('col-xs-4')[1].querySelector('span').innerHTML.trim();
      }
      pricBreakdown[i] = {qty: qty, price: price}

      console.log("Price Breakdown: ", pricBreakdown[i]);


    }

    console.log('HERE 4');
      var returnJSON = JSON.stringify(pricBreakdown);
      console.log("returnJSON: ", returnJSON);
  }

  catch (e) {
    console.error(e);
  }
  finally {

    callback(returnJSON);
  }
});
//
//   const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
// console.log(dom.window.document.querySelector("p").textContent);

//   const site = new JSDOM(``, {
//   url: "https://example.org/",
//   referrer: "https://example.com/",
//   contentType: "text/html",
//   userAgent: "Mellblomenator/9000",
//   includeNodeLocations: true
// });

  //
  // JSDOM.fromURL("https://example.com/", options).then(dom => {
  //   console.log(dom.serialize());
  // });

  // jsdom.env({url: URL, scripts: ["http://code.jquery.com/jquery.js"], created: function(err, window) {
  //   console.log("created: " + err);
  //
  // }, done: function (err, window) {
  //   // free memory associated with the window
  //   //console.log("window: " + window);
  //
  //   if (!err && window !== null) {
  //
  //     // Check which website URL is from
  //     var website = getHostName(URL);
  //     console.log("hostname: ", website);
  //     if(website === "mouser.com") {
  //       var MPN = window.$('#divManufacturerPartNum').text();
  //       MPN = rmBreaks(MPN);
  //
  //       var descrption = window.$('#divDes').text();
  //       descrption = rmBreaks(descrption);
  //
  //       var priceBreaks = [];
  //       var i = 0;
  //       var j = 1
  //
  //       var qty = window; //.$('.pdp-pricing-table').html();
  //       console.log("HTML Out:", qty);
  //       // Store all the price breaks in an array of objects
  //       // var qty = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lnkQuantity').text());
  //       var price = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lblPrice').text());
  //       // console.log("Initial qty/price: ", qty + "/" + price);
  //       do {
  //         //Strip "$" and any remaining white space from price
  //         price = price.replace("$", "");
  //         // price.trim();
  //
  //         priceBreaks.push({"quantity": parseInt(qty), "price": parseFloat(price)});
  //         // Incriment two digit number
  //         if(j === 9) {
  //           j = 0;
  //           i++;
  //         }else {
  //           j++;
  //         }
  //         qty = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lnkQuantity').text());
  //         price = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lblPrice').text());
  //
  //         // console.log("New qty/price: ", qty + "/" + price);
  //       }
  //       while (qty)
  //
  //       var specs = {};
  //       var i = 0;
  //       var j = 1
  //       // Store all the price breaks in an array of objects
  //       var specCat = rmBreaks(window.$('#ctl00_ContentMain_Specifications_dlspec_ctl' + i.toString() + j.toString() + '_lblDimension').text());
  //       var specVal = rmBreaks(window.$('#ctl00_ContentMain_Specifications_dlspec_ctl' + i.toString() + j.toString() + '_lblName').text());
  //       // console.log("Initial cat/val: ", specCat + "/" + specVal);
  //       do {
  //
  //         specs[specCat] = specVal;
  //         // Incriment two digit number
  //         if (j === 9) {
  //           j = 0;
  //           i++;
  //         } else {
  //           j++;
  //         }
  //
  //         specCat = rmBreaks(window.$('#ctl00_ContentMain_Specifications_dlspec_ctl' + i.toString() + j.toString() + '_lblDimension').text());
  //         specVal = rmBreaks(window.$('#ctl00_ContentMain_Specifications_dlspec_ctl' + i.toString() + j.toString() + '_lblName').text());
  //
  //         // console.log("New cat/val: ", specCat + "/" + specVal);
  //       }
  //       while (specCat)
  //
  //       var returnJSON = JSON.stringify({"mpn": MPN, "desc": descrption, "priceBreaks": priceBreaks, "specs": specs});
  //       console.log("returnJSON: ", returnJSON);
  //       callback(returnJSON);
  //
  //     }
  //
  //   } else {
  //       console.log(err + "- invalid url.");
  //       callback();
  //   }
  // }});
}
function getData(URL, callback) {

  console.log("getting data for: ", URL);

  // jsdom.env({url: URL, scripts: ["http://code.jquery.com/jquery.js"], created: function(err, window) {
  //   console.log("created: " + err);
  //
  // }, done: function (err, window) {
  //   // free memory associated with the window
  //   //console.log("window: " + window);
  //
  //   if (!err && window !== null) {
  //
  //     // Check which website URL is from
  //     var website = getHostName(URL);
  //     console.log("hostname: ", website);
  //     if(website === "mouser.com") {
  //       var MPN = window.$('#divManufacturerPartNum').text();
  //       MPN = rmBreaks(MPN);
  //
  //       var descrption = window.$('#divDes').text();
  //       descrption = rmBreaks(descrption);
  //
  //       var priceBreaks = [];
  //       var i = 0;
  //       var j = 1
  //
  //       // Store all the price breaks in an array of objects
  //       var qty = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lnkQuantity').text());
  //       var price = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lblPrice').text());
  //       // console.log("Initial qty/price: ", qty + "/" + price);
  //       do {
  //         //Strip "$" and any remaining white space from price
  //         price = price.replace("$", "");
  //         // price.trim();
  //
  //         priceBreaks.push({"quantity": parseInt(qty), "price": parseFloat(price)});
  //         // Incriment two digit number
  //         if(j === 9) {
  //           j = 0;
  //           i++;
  //         }else {
  //           j++;
  //         }
  //         qty = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lnkQuantity').text());
  //         price = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lblPrice').text());
  //
  //         // console.log("New qty/price: ", qty + "/" + price);
  //       }
  //       while (qty)
  //
  //       var specs = {};
  //       var i = 0;
  //       var j = 1
  //       // Store all the price breaks in an array of objects
  //       var specCat = rmBreaks(window.$('#ctl00_ContentMain_Specifications_dlspec_ctl' + i.toString() + j.toString() + '_lblDimension').text());
  //       var specVal = rmBreaks(window.$('#ctl00_ContentMain_Specifications_dlspec_ctl' + i.toString() + j.toString() + '_lblName').text());
  //       // console.log("Initial cat/val: ", specCat + "/" + specVal);
  //       do {
  //
  //         specs[specCat] = specVal;
  //         // Incriment two digit number
  //         if (j === 9) {
  //           j = 0;
  //           i++;
  //         } else {
  //           j++;
  //         }
  //
  //         specCat = rmBreaks(window.$('#ctl00_ContentMain_Specifications_dlspec_ctl' + i.toString() + j.toString() + '_lblDimension').text());
  //         specVal = rmBreaks(window.$('#ctl00_ContentMain_Specifications_dlspec_ctl' + i.toString() + j.toString() + '_lblName').text());
  //
  //         // console.log("New cat/val: ", specCat + "/" + specVal);
  //       }
  //       while (specCat)
  //
  //       var returnJSON = JSON.stringify({"mpn": MPN, "desc": descrption, "priceBreaks": priceBreaks, "specs": specs});
  //       console.log("returnJSON: ", returnJSON);
  //       callback(returnJSON);
  //
  //     } else if(website === "adafruit.com") {
  //       // //prod-right-side product_id prod-price
  //       // var prodName = window.$('#prod-right-side h1').text();
  //       // prodName = rmBreaks(prodName);
  //       // var prodId = window.$('.product_id').text();
  //       // prodId = rmBreaks(prodId);
  //       //
  //       // var priceBreaks = [];
  //       // var i = 0;
  //       // var j = 1
  //       //
  //       // // Store all the price breaks in an array of objects
  //       // var qty = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lnkQuantity').text());
  //       // var price = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lblPrice').text());
  //       // // console.log("Initial qty/price: ", qty + "/" + price);
  //       // do {
  //       //   //Strip "$" and any remaining white space from price
  //       //   price = price.replace("$", "");
  //       //   // price.trim();
  //       //
  //       //   priceBreaks.push({"quantity": parseInt(qty), "price": parseFloat(price)});
  //       //
  //       //   qty = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lnkQuantity').text());
  //       //   price = rmBreaks(window.$('#ctl00_ContentMain_ucP_rptrPriceBreaks_ctl' + i.toString() + j.toString() + '_lblPrice').text());
  //       //
  //       //   // console.log("New qty/price: ", qty + "/" + price);
  //       // }
  //     } else if(website === "amazon.com") {
  //
  //     }
  //
  //   } else {
  //       console.log(err + "- invalid url.");
  //       callback();
  //   }
  // }});
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
