const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose'); // remember es6 destructuring
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

// setup our express app 
var app = express();

// middleware to convert JSON that gets sent to the server to an object
app.use(bodyParser.json()); // now we can send JSON data to our express app

// POST vs GET
// We use POST whenever we want create a resource. We send that resource as the body.
// We use GET whenever we want to retrieve something from the server

// standard setup of POSTing todos and GETting todos 
app.post('/todos', (req, res) => {

    console.log(req.body); // should print whatever we send from the client 

    // create new Todo object based on what we received from the client 
    var todo = new Todo({
        text: req.body.text
        //completed: req.body.completed // this is optional if you want to be able to set the completed from the client
    });
    // save it to our db
    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err); // 400 means bad request. this means that the client provided invalid JSON to create a Todo object such as not entering a text property at all, etc. 
    })
});

// GET from /todos to get all todos
// or
// /todos/someID to get a specific TODO

app.listen(3000, () => {
    console.log('Server started on port 3000');
})

// export the app so we can access it in server.test.js
module.exports = {app};