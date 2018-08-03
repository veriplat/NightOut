// Initialize express require as express
var express = require('express');
// Setup parser to parse POSR Requests from express
var bodyParser = require('body-parser');
// Require Login and Register functions from LoginRegister file
var LoginRegister = require("./LoginRegister");
// Require Socket Server to setup efficient communication between client and server via websockets
var SocketServer = require("./SocketServer.js");
// Establish parser from body parser to parse url encoded POST requests
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// Establish app from express to receive post requests and setup server
var app = express();
// Setup Login page for app to connect to and login user
app.post('/LogIn',urlencodedParser, async function (req, res) {
    // Set default server response value
    var response = ""
    // Await response from Login confirming user exists in database and set response equal to result
    response = await LoginRegister.Login(req);
    // Log the Login response to the console.
    console.log(response);
    // Send the response to the user trying to login and handle result on client side
    res.send(response);
})
//Setup Registration page for app to connect to and register user
app.post('/Register',urlencodedParser, async function (req, res) {
  // Set default server response value
  var response = ""
  // Await response from Registration to confirm that the user has been created successfully
  response = await LoginRegister.Register(req);
  // Send the response to the user trying to create an account and handle response on client side
  res.send(response);
})

// Initialize server for app to connect to at post 8081
var server = app.listen(8081, '0.0.0.0', function () {
  // Set host as the server address
  var host = server.address().address
  // Set port as the server port
  var port = server.address().port
  // Log the value on start of server to confirm url and port
  console.log("Example app listening at http://%s:%s", host, port)
});
// After creation of express server to handle login setup SocketServer to facilitate communication between client and server
SocketServer.start(server);