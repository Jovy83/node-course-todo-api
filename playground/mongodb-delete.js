const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, db) => {

    if (error) {
        return console.log('Unable to connect to mongoDB server: ', error); // we can use return here to exit the callback
    }
    console.log('Connected to mongoDB server');

    // deleteMany lets us delete multiple docs
    db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {
        console.log(result); // will output lots of data to the console. 
        // important thing to look at is the result object which has the 'ok' and 'n' properties
        // ok:1 = means everything went ok
        // n: = the number of docs deleted
    }, (error) => {
        console.log('Unable to deleteMany');
    });

    // deleteOne lets us delete a single docs. works similar to deleteMany but only deletes the 1st doc it sees that matches the filter then it stops
    db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((result) => {
        console.log(result); 
    }, (error) => {
        console.log('Unable to deleteOne');
    });


    // findOneAndDelete lets us delete a single doc and returns the values. For example, user deletes a note, we can use the result to display to the user which object got deleted and add an option to undo and re-add the deleted doc using the values returned. most of the time when deleting a doc, you only know the id and not the other properties too so this is handy. 
    db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
        console.log(result);
    }, (error) => {
        console.log('Unable to findOneAndDelete');
    });

    //console.log('Closing db connection...');
    //db.close(); // closes the connection to the mongoDB server
}); 