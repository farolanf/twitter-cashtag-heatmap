/**
 * Module dependencies.
 */
var express = require('express')
  , io = require('socket.io')
  , http = require('http')
  , twitter = require('ntwitter')
  , cronJob = require('cron').CronJob
  , _ = require('underscore')
  , path = require('path');

//Create an express app
var app = express();

//Create the HTTP server with the express app as an argument
var server = http.createServer(app);

// IMPORTANT!!
//You will need to get your own key. Don't worry, it's free. But I cannot provide you one
//since it will instantiate a connection on my behalf and will drop all other streaming connections.
//Check out: https://dev.twitter.com/ You should be able to create an application and grab the following
//crednetials from the API Keys section of that application.
// var api_key = '';               // <---- Fill me in
// var api_secret = '';            // <---- Fill me in
// var access_token = '';          // <---- Fill me in
// var access_token_secret = '';   // <---- Fill me in

var api_key = 'C4APRTiFDPbu4f83bxu2crM3X'; 
var api_secret = 'GVXhTV7B7hSeI9i5p7Eg6raKsCTattD7qpTKClPKPVtqpfuxr4';
var access_token = '503627811-RGLyEFBvtbP7IUp1FRBU2OBHphqopUqymsJCgfGK';
var access_token_secret = 'CzFaJMS8hwZMXtip5G2i4M7dKqtcUmRU41yLlI4N6ld9x';

// Twitter symbols array.
var watchSymbols = ['$msft', '$intc', '$hpq', '$goog', '$nok', '$nvda', '$bac', '$orcl', '$csco', '$aapl', '$ntap', '$emc', '$t', '$ibm', '$vz', '$xom', '$cvx', '$ge', '$ko', '$jnj'];

//This structure will keep the total number of tweets received and a map of all the symbols and how many tweets received of that symbol
var watchList = {
    total: 0,
    symbols: {}
};

//Set the watch symbols to zero.
_.each(watchSymbols, function(v) { watchList.symbols[v] = 0; });

//Generic Express setup
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

//We're using bower components so add it to the path to make things easier
// app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Our only route! Render it with the current watchList
app.get('/', function(req, res) {
	res.render('index', { data: watchList });
});

//Start a Socket.IO listen
var sockets = io.listen(server, {
//Set the sockets.io configuration.
//THIS IS NECESSARY ONLY FOR HEROKU!
  transports: ['polling'],
  'polling duration': 10
});

//If the client just connected, give them fresh data!
sockets.sockets.on('connection', function(socket) { 
    socket.emit('data', watchList);
});

// Instantiate the twitter connection
var t = new twitter({
    consumer_key: api_key,
    consumer_secret: api_secret,
    access_token_key: access_token,
    access_token_secret: access_token_secret
});

// //Tell the twitter API to filter on the watchSymbols 
t.stream('statuses/filter', { track: watchSymbols }, function(stream) {

  //We have a connection. Now watch the 'data' event for incomming tweets.
  stream.on('data', function(tweet) {

    //This variable is used to indicate whether a symbol was actually mentioned.
    //Since twitter doesnt why the tweet was forwarded we have to search through the text
    //and determine which symbol it was ment for. Sometimes we can't tell, in which case we don't
    //want to increment the total counter...
    var newCount = 0;

    //Make sure it was a valid tweet
    if (tweet.text !== undefined) {

      //We're gunna do some indexOf comparisons and we want it to be case agnostic.
      var text = tweet.text.toLowerCase();

      //Go through every symbol and see if it was mentioned. If so, increment its counter and
      //set the 'claimed' variable to true to indicate something was mentioned so we can increment
      //the 'total' counter!
      _.each(watchSymbols, function(v) {
          if (text.indexOf(v.toLowerCase()) !== -1) {
              watchList.symbols[v]++;
              newCount++;
          }
      });

      //If something was mentioned, increment the total counter and send the update to all the clients
      if (newCount > 0) {
          //Increment total
          watchList.total += newCount;

          //Send to all the clients
          sockets.sockets.emit('data', watchList);
      }
    }
  });
});

(function emit() {
  sockets.sockets.emit('data', watchList);
  setTimeout(emit, 10000);
})();

// TEST
// (function fill() {
//   watchList.total++;

//   for (var i = 0; i < 10; i++) {
//     const r = Math.floor(Math.random() * watchSymbols.length);
//     const symbol = watchSymbols[r];
//     watchList.symbols[symbol]++;
//   }

//   sockets.sockets.emit('data', watchList);
//   setTimeout(fill, 50);
// })();

//Reset everything on a new day!
//We don't want to keep data around from the previous day so reset everything.
new cronJob('0 0 0 * * *', function(){
    //Reset the total
    watchList.total = 0;

    //Clear out everything in the map
    _.each(watchSymbols, function(v) { watchList.symbols[v] = 0; });

    //Send the update to the clients
    sockets.sockets.emit('data', watchList);
}, null, true);

//Create the server
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
