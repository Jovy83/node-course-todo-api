// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); // here we created 2 vars that hold mongodb's properties: MongoClient and ObjectID using object de-structuring

MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, db) => {

    if (error) {
        return console.log('Unable to connect to mongoDB server: ', error); // we can use return here to exit the callback
    }
    console.log('Connected to mongoDB server');

    // fetch from the Todos collection
    // calling find() without any args returns all of the docs in the collection. aka no filter
    // pass in an object with key:value pairs to set a filter
    db.collection('Todos').find({ completed: false }).toArray().then((documents) => {
        // print the fetched data here 
        console.log('Todos');
        console.log(JSON.stringify(documents, undefined, 2));
    }, (error) => {
        console.log('Unable to fetch todos: ', error);
    }); // find returns a mongodb cursor, not the actual docs themselves. It's just a pointer, so we need to convert that to an array. The cursor has many functions and toArray is one which is what we need 
    // toArray returns an array of the actual docs themselves. It is also returns a promise so we can use then()

    // to query with an ID filter
    db.collection('Todos').find({ _id: new ObjectID('58ae1b38455d30af6eca9fc3') }).toArray().then((documents) => {
        console.log('Todos');
        console.log(JSON.stringify(documents, undefined, 2));
    }, (error) => {
        console.log('Unable to fetch todos: ', error);
    });

    // we can also use the cursor's count() function to see how many results were returned
    db.collection('Todos').find().count().then((count) => {
        console.log(`Todos count: ${count}`);
    }, (error) => {
        console.log('Unable to fetch todos: ', error);
    });
    //console.log('Closing db connection...');
    //db.close(); // closes the connection to the mongoDB server
}); 