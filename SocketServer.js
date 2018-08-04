// Define Person as Person definition in User.js
var Person = require("./User.js").Person;
// Define Users as Users definition in User.js
var Users = require("./User.js").Users;
// Define database functions stored in DB
var DB = require("./DBHandler.js")
// Define Users as new Users()
var Users = new Users();
// Define mysql library as mysql to connect to database
var mysql = require('mysql');
// Initialize Firebase-admin to send notifications
var admin = require('firebase-admin');
var serviceAccount = require('./nightout-b457c-firebase-adminsdk-9q5ci-57787cc178.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
// Define function accessible by main class
module.exports = {
    // Define start function to start server
    start: function (server) {
        // Define server from websocket.server class
        var WebSocketServer = require('websocket').server;
        // Initialize server parameters
        wsServer = new WebSocketServer({
            // Define htppServer as inherited server
            httpServer: server,
            // Don't auto accept connections to server
            autoAcceptConnections: false
        });
              
        function originIsAllowed(origin) {
            // Filter out connections for what you want
            return true;
        }
              
        // On user connect to Websocket
        wsServer.on('request', function(request) {
            // If user is not allowed to connect reject the connection
            if (!originIsAllowed(request.origin)) {
                // Reject Connection
                request.reject();
                return;
            }
              
            // If user is allowed to connect, accept the connection 
            var connection = request.accept(null, request.origin);
            // Log the connection in the console
            console.log((new Date()) + ' Connection accepted.');
            // When connection receives a message from the client
            connection.on('message', function(message) {
                // If the type of the message is a utf8 string
                if (message.type === 'utf8') {
                    // Encode return message from message.utf8Data
                    let returnmess = JSON.parse(message.utf8Data);
                    // Decode message to get message type (0 = User Connected Add User Information, 1 = Received Chat Message, 2 = Update User Location)
                    let type = returnmess["Type"];
                    // Decode the Data of the message sent to the Server
                    let Data = returnmess["Data"];
                    // Send the type, data, and sender (client) connection
                    handleMessages(type,Data,connection);
                }
                // If the message is not a String
                else if (message.type === 'binary') {

                }
            });
            // On connection closed
            connection.on('close', function(reasonCode, description) {
                // Delete user using function from Users class
                Users.deleteUser(connection);
                // Log the message of the Users disconnection
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });
        });
    }
}
// Handle messages sent from the client to the server
async function handleMessages(type, data, connection) {
    switch (type) {
        // User Connected add User to online users Array
        case 0:
        // Get User Data from message encoded as JSON
        // Get First name of User
        let First = data["User"]["First"];
        // Get Last name of User
        let Last = data["User"]["Last"];
        // Get Email of User
        let Email = data["User"]["Email"];
        // Get Username of User
        let Username = data["User"]["Username"];
        // Get Unique Device Token of User for Notifications
        let Token = data["User"]["Token"]
        // Get Longitude Location of User
        let Longitude = data["User"]["Longitude"];
        // Get Latitude Location of User
        let Latitude = data["User"]["Latitude"];
        // Define User as new element of Person class defined in User.js
        var User = new Person(First,Last,Email,Username,Token,connection,Longitude,Latitude);
        // Add Person to User Array
        Users.addUser(User);
        // Send Token to Database
        DB.updateToken(Token,Username);
        // Send Location to Database
        DB.updateLocation(Longitude,Latitude,Username);
        // Get Date as String
        var d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
        // Initialize response variable
        var response = ""
        // Get all new messages for the user from the database
        response = await DB.getNewMessages(Username);
        // Get the user connection from the Username and send the new Messages to the User handle on client side
        Users.getConnection(Username).sendUTF(response);
        break;
        //Received Chat Message
        case 1:
        // Get Message Data
        // Get Chat name from message data
        let Chat = data["Message"]["Chat"];
        // Get User message is being sent to
        let To = data["Message"]["To"];
        // Get User message is being sent by
        let From = data["Message"]["From"];
        // Get User message
        let Message = data["Message"]["Message"];
        // Get date string
        var d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
        // Format message to send to User
        messageData = {chat: Chat, from:From, message: Message, time: d};
        // Format messageData as JSON string to send to user that its for
        messageString = JSON.stringify({type:'1', data:messageData});
        // Format message string to send back to the user that sent it
        messageDataback = {chat: To, from:From, message: Message, time: d};
        // Format message as JSON string to send back to user that sent it
        messageStringback = JSON.stringify({type:'2', data:messageDataback});
        // Format JSON message to send to App Notification
        // If User is offline
        if (!Users.isUserOnline(To)) {
            // Send message with notification
            SendMessageToSingleUserOffline(To,messageString, From, messageStringback, Message.toString())
        } else {
            // Send message without notification if user is online
            SendMessageToSingleUserOnline(To, messageString, From, messageStringback, Message.toString());
        }
        // Send message to be stored in chat database
        DB.addSingleUserMessage(Chat.toString(),To.toString(),From.toString(),Message.toString(),d.toString());
        break;
        // Update User Location
        case 2:
        // Get Username of User to Update Location for
        let UsernametoUpdate = data["User"]["Username"];
        // Get Longitude of User
        let LongitudetoUpdate = data["User"]["Longitude"];
        // Get Latitude of User
        let LatitudetoUpdate = data["User"]["Latitude"];
        // If Longitude, Latitude, or Username is not blank
        if (LongitudetoUpdate != "" && LatitudetoUpdate != "" && UsernametoUpdate != "") {
            // Update location in the database
            DB.updateLocation(LongitudetoUpdate , LatitudetoUpdate, UsernametoUpdate);
            // Update location in the User array
            Users.updateLocation(LongitudetoUpdate , LatitudetoUpdate, UsernametoUpdate);
        }
        break;
    }
}
// Send Message to User Online
function SendMessageToSingleUserOnline(user, msg, backuser, msgback, msgNotify) {
    // Get connection and send string
    Users.getConnection(user).sendUTF(msg);
    // Get connection and send strng back to user that sent it
    Users.getConnection(backuser).sendUTF(msgback);
    // Get token from Users array
    let token = Users.getUser(user).token
    // Send notification to client device
    notify(token, user, msgNotify);
}
// Send Message to User Offline
function SendMessageToSingleUserOffline(user, backuser, msgback,msgNotify) {
    // Setup Connection to Database
    var con = mysql.createConnection({
        host: "",
        user: "",
        password: "",
        database: ""
    });
    // Connect to Database
    con.connect(function(err) {
        if (err) throw err;
        // Execute Query to get stored token of User
        con.query("SELECT Token FROM Users WHERE Username=" + mysql.escape(user) , function (err, result, fields) {
          if (err) throw err;
          if (result.length > 0)
          {
            // Send Notification to User at Token
            notify(result[0]['Token'], user, msgNotify);
            // Send message back to to user that sent it
            Users.getConnection(backuser).sendUTF(msgback);
            // End Connection
            con.end();
          }
          else {
            // If Database has no user with Token return JSON error
            response = JSON.stringify({error:true,Title:"Failure",message:"This username or password is incorrect!"});
            // End Connection
            con.end();
          }
        }); 
    });   
}
// Notification Function to Send Notification to Client
async function notify(token, userfrom, msg) {
    // Set Payload for notification data to be sent to client
    var payload = {
        // Setup notification data sent to client
        notification: {
            // Send title of notification
            title: userfrom,
            // Send body of notification
            body: userfrom + ": " + msg,
            // Send badge notification number to ID to display number on app
            "badge": "1"
        }
    };
    // Send message to specfic device with unique token
    admin.messaging().sendToDevice(token, payload)
    // If message was sent 
    .then(function(response) {
        
    })
    // If error was encountered
    .catch(function(error) {
        console.log("Error sending message:", error);
    });
}