const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb'); // we need the id validator from mongodb
const _ = require('lodash'); // lodash is usually declared as _

const {mongoose} = require('./db/mongoose'); // remember es6 destructuring
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

// port to use for heroku. if ran locally, will use port 3000
const port = process.env.PORT || 3000;

// setup our express app 
var app = express();

// middleware to convert JSON that gets sent to the server to an object
app.use(bodyParser.json()); // now we can send JSON data to our express app

// POST vs GET
// We use POST whenever we want create a resource. We send that resource as the body.
// We use GET whenever we want to retrieve something from the server

// standard setup of POSTing todos and GETting todos 
app.post('/todos', (req, res) => {

    //console.log(req.body); // should print whatever we send from the client 

    // create new Todo object based on what we received from the client 
    var todo = new Todo({
        text: req.body.text
        //completed: req.body.completed // this is optional if you want to be able to set the completed from the client
    });
    // save it to our db
    todo.save().then((todo) => {
        res.send({ todo });
    }, (err) => {
        res.status(400).send(err); // 400 means bad request. this means that the client provided invalid JSON to create a Todo object such as not entering a text property at all, etc. 
    })
});

app.get('/todos', (req, res) => {
    Todo.find({}).then((todos) => {
        //res.send(todos); // passing the todos as an array like this is not the best way to get the job done. When you pass back an array, you're limiting your options. If you want to add another property likea  status code, you can't because you have an array. 

        // the better solution would be to create an object with the todos property that contains the array. this would let you add other properties such as status codes, later on. 
        res.send({
            todos,
            code: "some status code test"
        });

    }, (err) => {
        res.status(400).send(err);
    });
});

// GET from /todos to get all todos
// or
// /todos/someID to get a specific TODO

app.get('/todos/:id', (req, res) => {
    const id = req.params.id; //req.params = object that holds the parameters passed in by the client
    if (!ObjectID.isValid(id)) {
        return res.status(404).send(); // send 404 not found and empty body
    }
    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send(); // send 404 not found and empty body
        }
        // success case, id is valid and is existing in the db 
        res.status(200).send({ todo }); // return the found todo not as the main body, but in an object so that we have more flexibility when we want to add addtional properties in the future. 
    }).catch((err) => {
        res.status(500).send(); // return 500 because reaching here is a server-side error, not client-side 
    });
});

// route to delete a todo doc 
app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.status(200).send({ todo });
    }).catch((err) => {
        res.status(500).send();
    });
});

// patch is what you use when you want to update a resource
app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    // lodash utility that only picks certain properties from an object / request 
    // this is because the client can send a request that can update ANY todo property or create unwanted new properties
    // we need to limit what the client can do. we only want the client to be able to set the text and the completed properties of todo 
    var body = _.pick(req.body, ['text', 'completed']); // we only want the client to update the text or completed properties. we don't want them to update the _id, completedAt, or add any new unwanted properties that aren't specified in the mongoose model we created. in this case, this only creates an object with the properties we want

    // if the provided completed is a boolean and it is true
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime(); // returns a JS timestamp. number of milliseconds since midnight of jan1,1970. values > 0 are ms from that moment forward. values < 0 are before that unix epic (1/1/1970)
    } else {
        body.completed = false;
        body.completedAt = null; // when you want to remove a value from the database, simply set the property to null  
    }

    // make a query to update the db
    Todo.findByIdAndUpdate(id, {
        $set: body  // remember to use mongoDB operators when updating docs
    }, {
            new: true, // this is similar to the returnOriginal:false flag in the mongodb native driver. it's just called differently in mongoose
            runValidators: true // set this flag so it runs the validators we set in our mongoose model 
        }).then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            res.status(200).send({ todo });
        }).catch((err) => {
            res.status(500).send();
        });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})

// export the app so we can access it in server.test.js
module.exports = { app };