const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, db) => {

    if (error) {
        return console.log('Unable to connect to mongoDB server: ', error); // we can use return here to exit the callback
    }
    console.log('Connected to mongoDB server');

    // update
    // args: filter, update, options, callback (not going to use callback so we can use promises)
    // db.collection('Users').findOneAndUpdate({
    //     // find and update the object with the id below 
    //     _id: new ObjectID('58ade4fbcf47300d49d092d6')
    // }, {
    //     // there are multiple update operators. check out mongodb docs for that. we're mostly going to use $set. 
    //     $set: {
    //         location: 'Iraq' // set the location from Africa to Iraq. 
    //     }
    // }, {
    //     returnOriginal: false // this is one of the optional settings you can configure. By default 'returnOriginal' is true which returns the doc with the old values. We want the updated doc to be returned so we set this to false 
    // }).then((result) => {
    //     console.log(result);
    // }, (error) => {
    //     console.log('Unable to findOneAndUpdate: ', error);
    // });

    // challenge, update the age with the increment operator 
    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('58ade4fbcf47300d49d092d6')
    }, {
        $inc: {
            age: 1
        },
        $set: {
            name: 'gago'
        }
    }, {
        returnOriginal: false
    }).then((result) => {
        console.log(result);
    }, (error) => {
        console.log('Unable to findOneAndUpdate: ', error);
    });

    //console.log('Closing db connection...');
    //db.close(); // closes the connection to the mongoDB server
}); 