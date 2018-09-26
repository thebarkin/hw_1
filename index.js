const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

//http server
const httpServer = http.createServer((req, res)=>{
  myServer(req, res);
});

//start HTTP server
httpServer.listen(config.httpPort,()=>{
  console.log('The server is listening on port: '+config.httpPort);
});


var myServer = function(req,res){

  const parsedURL = url.parse(req.url,true);

  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g,'');

  //get the headers as an object
  const headersObject = req.headers;

  //get the payload if there is any
  const decoder = new StringDecoder('utf-8');
  let streamBuffer = '';

  req.on('data',(data)=>{
    streamBuffer += decoder.write(data);
  });

  req.on('end',()=>{
    streamBuffer += decoder.end();

    console.log(trimmedPath);

    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    //construct the data object to send to the handler
    var data = {
      'trimmedPath' : trimmedPath,
      'headers' : headersObject
    };

    function chosenHandlerCallback(statusCode, payload){

      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      payload = typeof(payload) == 'object' ? payload : {};

      var payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type','application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log('Returning this response: ',statusCode,payloadString);
    }

    chosenHandler(data, chosenHandlerCallback);
  });
}

//HANDLERS
var handlers = {};

handlers.hello = function(data, callback){
  callback(200, {'message':'hello world!!!!'});
};
handlers.notFound = function(data, callback){
  callback(404);
};

var router = {
  'hello' : handlers.hello
};
