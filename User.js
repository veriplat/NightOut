// Setup Methods for Type Users
var UsersMethod = Users.prototype;
// Define Type of Users as Array
function Users() {
    // Define Users Array
    this.Users = [];
}
// Add add User method to Users class pushing Person to end of Array
UsersMethod.addUser = function(Person) {
    // When method is called push Person to end of array
    this.Users.push(Person);
}
// Add deleteUsers method to Users class taking method of Connection
UsersMethod.deleteUser = function(Connection) {
    // Get connection of user trying to disconnect and search through array
    for (i = 0; i < this.Users.length; i++) {
        // If the connection of the User is equal to the connection of the person trying to disconnect
        if (this.Users[i].connection == Connection) {
            // Remove the user from the array at this location
            this.Users.splice(i,1);
            // Return from function
            return;
        }
    }
}
// Add isUserOnline method to Users class taking connection as input
UsersMethod.isUserOnline = function(Username) {
    // Search for the username in the user array
    for (i = 0; i < this.Users.length; i++) {
        // If the Users username is equal to the username in the array return true
        if (this.Users[i].username == Username) {
            // Return true where username is equal to Username in Users array
            return true;
        }
    }
    // If the Users username isn't equal to any of the Usernames in the array return false because user isn't online
    return false;
}
// Add getConnection method to Users class
UsersMethod.getConnection = function(Username) {
    // Search for the username in the Users array
    for (i = 0; i < this.Users.length; i++) {
        // If the username input is equal to the Username at i in array
        if (this.Users[i].username == Username) {
            // Return the connection of the user at this location in the array
            return this.Users[i].connection;
        }
    }
}
// Add getUser method to Users class
UsersMethod.getUser = function(Username) {
    // Search for the username in the Users array
    for (i = 0; i < this.Users.length; i++) {
        // If the username input is equal to the Username at i in array
        if (this.Users[i].username == Username) {
            // Return the User at this location in the array
            return this.Users[i];
        }
    }
}
// Add updateLocation method to Users class
UsersMethod.updateLocation = function(longitude,latitude, username) {
    // Search the username in the Users array
    for (i = 0; i < this.Users.length; i++) {
        // If the username input is equal to the Username at i in array
        if (this.Users[i].username == username) {
            // Set the longitude of the user at i equal to the longitude input
            this.Users[i].longitude = longitude;
            // Set the latitude of the user at i equal to the latitude input
            this.Users[i].latitude = latitude;
            // return from array because we need to search no further
            return;
        }
    }
};
// Add getSize method to Users class
UsersMethod.getSize = function() {
    // return the size of the Users array 
    return this.Users.length;
}
// Setup PersonMethod in case we need to add methods to Person class
var PersonMethod = Person.prototype;
// Setup Person type
function Person(first, last, email, username,token, connection, longitude, latitude) {
    // Initialize variables of Person type
    // Set First name equal to first name input
    this.first = first;
    // Set Last name equal to last name input
    this.last = last;
    // Set Email equal to email input
    this.email = email;
    // Set Username equal to username input
    this.username = username;
    // Set Connection equal to connection input
    this.connection = connection;
    // Set Token equal to token input
    this.token = token
    // Set location longitude equal to longitude input
    this.longitude = longitude;
    // Set location latitude equal to latitude input
    this.latitude = latitude;
}
// Export Person and User for use as inputs when required
module.exports =   {
    Person,
    Users
}