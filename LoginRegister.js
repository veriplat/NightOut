// Set up module exports so functions of library can be pulled to other files
module.exports = {
    // Set up login so other files can use Login
    Login: async function (req) {
        // Set function response equal to result of Login function outlined below
        let response = await Login(req);
        // Return response for other files to access
        return response;
    },
    // Set up registration so other files can use Registration
    Register: async function (req) {
        // Set function response equal to result of Registration function outline below
        let response = await (Register(req));
        // Return response of Registration for other files to access
        return response;
    }
}

var crypto = require('crypto');
var mysql = require('mysql');

// Set up Login variable as function
var Login = function(req) {
  // Use promise to return a result of an asynchronous function
  return new Promise(function(resolve, reject) {
    // Setup connection to mysql database to query for existing user
    var con = mysql.createConnection({
        host: "",
        user: "",
        password: "",
        database: ""
      });
    // Get password from request sent by express POST and encrypt it using md5 hashing
    let Password = crypto.createHash('md5').update(req.body.Password).digest("hex");
    // Get username from request sent by express POST
    let Username = req.body.Username;
    // Get unique notification app identifier from request sent by express POST to update token in case user device change or redownload
    let Token = req.body.Token;
    // Set default value of function response
    var response = ""
    // Connect to mysql to begin SQL query for user in database
    con.connect(function(err) {
        if (err) throw err;
        // Setup database query to select user where username (unique) is the username sent by post and password is the md5 encrypted password
        con.query("SELECT * FROM Users WHERE Username=" + mysql.escape(Username) + "AND Password=" + mysql.escape(Password), function (err, result, fields) {
          if (err) throw err;
          // If a user exists with this unique username and password continue to next step
          if (result.length > 0)
          {
            // Next step is to update the users Token on login to ensure that notifications sent to user device always work
            var sql = "UPDATE Users SET Token = " + mysql.escape(Token) + " WHERE Username = " + mysql.escape(Username) + "";
              // Execute the query
              con.query(sql, function (err, result1) {
              if (err) throw err;
              // Get the response as a JSON string in the format of {error: false, Title: "Success", user:{Username: , Password: , Token: , Longitude: , Latitude: }}
              response = JSON.stringify({error:false,Title:"Success",user:result[0]});
              // End the connection
              con.end();
              // Send the response as result of Login function
              resolve(response);
            });
          }
          // If user does not exist
          else {
              // Setup response in form {error: true, Title: "Failure", message:"This username or password is incorrect"}
              response = JSON.stringify({error:true,Title:"Failure",message:"This username or password is incorrect!"});
              // End connection
              con.end();
              // send response as result of Loging function
              resolve(response);
          }
        }); 
    });
  });
}
// Setup Registration variable as a function
var Register = function(req)  {
  // Use promise to wait for and return the result of an asynchronous function
  return new Promise(function(resolve, reject) {
    // Connect to the mysql database server
    var con = mysql.createConnection({
        host: "",
        user: "",
        password: "",
        database: ""
      });
    // Get and encrypt password from POST request to send to database
    let Password = mysql.escape(crypto.createHash('md5').update(req.body.Password).digest("hex"));
    // Get First name of user from POST request
    let First = mysql.escape(req.body.First);
    // Get Last name of user from POST request
    let Last = mysql.escape(req.body.Last);
    // Get Email of user from POST request
    let Email = mysql.escape(req.body.Email);
    // Get Username of user from POST request
    let Username = mysql.escape(req.body.Username);
    // Get Token of user from POST request
    let Token = mysql.escape(req.body.Token);
    // Setup default response of function
    var response = ""
    // Make connection to database server
    con.connect(function(err) {
        if (err) throw err;
        // Insert information into Users database 
        con.query("INSERT INTO Users (`First Name`,`Last Name`,`Email`,`Username`,`Password`, `Token`) VALUES (" + First + ", " + Last + ", " + Email + ", " + Username + ", " + Password + ", " + Token + ")", function (err, result, fields) {
          if (err) {
            // If the error is that Username is duplicated send error message
            if (err.code == "ER_DUP_ENTRY") {
              // Prepare JSON message to be returned
              response = JSON.stringify({error:true,Title:"Failure",message:"This username is taken!!"});
              // Close the connection
              con.end();
              // Return the response as the result of the function
              resolve(response);
            } else {
              // If the error is not duplicate entry prepare general error message to be sent
              response = JSON.stringify({error:true,Title:"Failure",message:"An error has occured!!"});
              // End mysql connection
              con.end();
              // Send response as result of function
              resolve(response);
            }
            // If no error message exists
          } else {
            // Qery database again to get the newly created user to send to client for handling
            con.query("SELECT * FROM Users WHERE Username=" + Username, function (err, result, fields) {
              if (err) throw err;
              // If user exists registration is successful
              if (result.length > 0)
              {
                // Prepare success JSON message to send as result of function
                response = JSON.stringify({error:false,Title:"Success",message:"Successfully Registered!!"});
                // End connection
                con.end();
                // Send the response as result of Registration function
                resolve(response);
              }
              // If user does not exist data was not entered in database and user not created
              else {
                // Prepare response string to send as result of function
                response = JSON.stringify({error:true,Title:"Failure",message:"User could not be registered!!"});
                // End connection
                con.end();
                // Send the response as result of Registration
                resolve(response);
              }
            });
          }
        });
    });
  });
}