var jsdom = require('jsdom');


jsdom.env({url: url, scripts: ["http://code.jquery.com/jquery.js"], created: function(err, window) {
  console.log("created: " + err);

}, done: function (err, window) {
  // free memory associated with the window
  //console.log("window: " + window);

  if (!err && window !== null) {
    var keyWordsArray = getKeyWords(window);
    var parsedWordsArray = parseWords(keyWordsArray);
    var countedWords = countKeyWords(parsedWordsArray);

    var convertedName = site.hostname.replace(/\./g, " ");
    // ref.child('websites/' + convertedName + "/pages").push({page: site.page.val().URL, keyWords: countedWords});
    fireUpload("websites/" + convertedName + "/pages", "push", {page: site.page.URL, keyWords: countedWords});
    ack();

  } else {
      console.log(err + "- skipping this url.");
      ack();
  }
}});
