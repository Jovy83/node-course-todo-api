// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); // here we created 2 vars that hold mongodb's properties: MongoClient and ObjectID using object de-structuring

// ObjectID = this constructor function lets us make new object IDs on the fly
var obj = new ObjectID(); // this is how to create an object id 




 // 1st arg: string = the url where your database lives (in production apps: this could be url to your AWS or Heroku)
 // 2nd arg: callback = will fire after either connection succeeded or failed 
 MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, db) => { // this will create (if not yet created) or use a db named TodoApp. With mongo, you don't have to create a database beforehand to use it. 

    // we will use the db argument to issue commands to read and write data to the database. 
    if (error) {
        return console.log('Unable to connect to mongoDB server: ', error); // we can use return here to exit the callback
    }
    console.log('Connected to mongoDB server');

    // this will create (if not yet created) a collection named Todos.
    // then will insert 1 entry to the collection
    // 1st arg: an object with the key-value pairs you want
    // 2nd arg: callback after success or fail 
    db.collection('Todos').insertOne({
        text: 'Something to do',
        completed: false
    }, (error, result) => { // will pass result if things went well
        if (error) {
            return console.log('Unable to insert todo: ', error);
        }
        console.log(JSON.stringify(result.ops, undefined, 2)); // the ops property stores all the docs/rows that got inserted in the above function 
    });

    // challenge, insert new doc into Users (name, age, location)
    db.collection('Users').insertOne({
        name: 'Jovy',
        age: 25,
        location: 'Africa'
    }, (error, result) => {
        if (error) {
            return console.log('Unable to insert user: ', error);
        }
        console.log(JSON.stringify(result.ops, undefined, 2));

        // we can get the timestamp from a doc's id using
        console.log(result.ops[0]._id.getTimestamp());
    });

    console.log('Closing db connection...');
    db.close(); // closes the connection to the mongoDB server
 }); 