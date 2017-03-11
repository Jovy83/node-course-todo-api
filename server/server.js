require('./config/config'); // no need to store a reference to the config, this would simply run all the code in config.js

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb'); // we need the id validator from mongodb native driver 
const _ = require('lodash'); // lodash is usually declared as _

const { mongoose } = require('./db/mongoose'); // remember es6 destructuring
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

// port to use for heroku. if ran locally, will use port 3000
//const port = process.env.PORT || 3000;
const port = process.env.PORT; // this PORT environment var will never be null now because we have set it above for dev and test environments. and heroku sets it automatically for the production environment

// setup our express app 
var app = express();

// middleware to convert JSON that gets sent to the server to an object
app.use(bodyParser.json()); // now we can send JSON data to our express app

// POST vs GET vs DELETE vs PATCH protocols
// We use POST whenever we want create a resource. We send that resource as the body.
// We use GET whenever we want to retrieve something from the server
// We use DELETE whenever we want to delete something on the server
// We use PATCH whenever we want to update something on the server

// standard setup of POSTing todos and GETting todos 
app.post('/todos', authenticate, (req, res) => {

    //console.log(req.body); // should print whatever we send from the client 

    // create new Todo object based on what we received from the client 
    var todo = new Todo({
        text: req.body.text,
        //completed: req.body.completed // this is optional if you want to be able to set the completed from the client
        _creator: req.user._id
    });
    // save it to our db
    todo.save().then((todo) => {
        res.send({ todo });
    }, (err) => {
        res.status(400).send(err); // 400 means bad request. this means that the client provided invalid JSON to create a Todo object such as not entering a text property at all, etc. 
    })
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({ _creator: req.user._id }).then((todos) => {
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

app.get('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id; //req.params = object that holds the parameters passed in by the client
    if (!ObjectID.isValid(id)) {
        return res.status(404).send(); // send 404 not found and empty body
    }
    Todo.findOne({ _id: id, _creator: req.user._id }).then((todo) => { // EDIT: we changed from findById to findOne and supply the id and _creator filters to only show the note to whoever created it. 
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
app.delete('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOneAndRemove({ _id: id, _creator: req.user._id }).then((todo) => { // EDIT: we changed from findByIdAndRemove to findOneAndRemove and supply the id and _creator filters to only delete a todo owned by the user only, and not others.
        if (!todo) {
            return res.status(404).send();
        }
        res.status(200).send({ todo });
    }).catch((err) => {
        res.status(500).send();
    });
});

// patch is what you use when you want to update a resource
app.patch('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    // lodash utility that only picks certain properties from an object / request 
    // this is because the client can send a request that can update ANY todo property or create unwanted new properties
    // we need to limit what the client can do. we only want the client to be able to set the text and the completed properties of todo 
    var body = _.pick(req.body, ['text', 'completed']); // we only want the client to update the text or completed properties. we don't want them to update the _id, completedAt, or add any new unwanted properties that aren't specified in the mongoose model we created. in this case, this only creates an object with the properties we want. but for good practice, we ought to send an error message here if the client provides invalid properties so that they will know that they did a mistake. 

    // if the provided completed is a boolean and it is true
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime(); // returns a JS timestamp. number of milliseconds since midnight of jan1,1970. values > 0 are ms from that moment forward. values < 0 are before that unix epic (1/1/1970)
    } else {
        body.completed = false;
        body.completedAt = null; // when you want to remove a value from the database, simply set the property to null  
    }

    // make a query to update the db... EDIT: CHANGED findByIdAndUpdate to findOneAndUpdate
    Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, {
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

// POST route to create a new User
app.post('/users', (req, res) => {

    if (hasUnwantedData(req.body)) {
        return res.status(400).send({ error: 'You passed in unwanted data' });
    }

    var newUser = new User(_.pick(req.body, ['email', 'password']));

    newUser.save().then(() => {
        //res.status(200).send({ user });
        return newUser.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send({ newUser });
    }).catch((err) => {
        res.status(400).send({ err }); // 400 is more appropriate since it reaches this catch if we provided invalid emails/pass and duplicate emails. so it's more of a bad request. 
    });
});

// private route for the user to get their own account. 2nd arg is the middleware we created 
app.get('/users/me', authenticate, (req, res) => {
    // const token = req.header('x-auth'); // fetch the x-auth header from the client 

    // User.findByToken(token).then((user) => {
    //     if (!user) {
    //         return Promise.reject(); // this makes the code go straight to line 163
    //     }
    //     // success
    //     res.send({ user });
    // }).catch((err) => {
    //     res.status(401).send(); // 401 means authentication is required. client did not authenticate correctly
    // });

    res.send({ user: req.user }); // remember we modifed the request in our authenticate middleware. by this time, the req object already holds the user requested by the client. 
});

app.post('/users/login', (req, res) => {
    if (hasUnwantedData(req.body)) {
        return res.status(400).send({ error: 'You passed in unwanted data' });
    }

    User.findByCredentials(req.body.email, req.body.password).then((user) => { // the user here is what comes from the bcrypt promise in user.js

        // send him a token as well
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send({ user });
        })
    }).catch((err) => {
        res.status(400).send({ err });
    })
});

app.delete('/users/me/token', authenticate, (req, res) => {
    // rememeber at this point, we already have the user stored in the req obj thanks to the middleware we set up. 
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch((err) => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})

// export the app so we can access it in server.test.js
module.exports = { app };

var hasUnwantedData = (data) => {
    // check for unwanted data. if so, send an error message to user
    var unwantedData = _.omit(data, ['email', 'password']);
    if (_.keys(unwantedData).length > 0) {
        return true;
    }
    return false;
}