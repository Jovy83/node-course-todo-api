const mongoose = require('mongoose');

// mongoose supports callbacks by default but we're going to use promises 
// so we're gonna tell mongoose which promise library to use
// set mongoose to use the built-in promise lib as opposed to some 3rd party promise lib
mongoose.Promise = global.Promise;

// connect to db
mongoose.connect('mongodb://localhost:27017/TodoApp'); // obviously it takes some time to connect to the db. and if we have a request to insert something to the db below, mongoose is smart enough to wait for the connection, then execute the db commands we write. this way, we don't have to micro-manage the order things happen ourselves.

// export to be able to access from server.js
module.exports = {
    mongoose
};