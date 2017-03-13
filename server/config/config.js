// this is to determine what environment we're on: production (our app on heroku), development (when we run our app locally), test (when we run tests on our app through mocha). this way we can set the mongoDB URI depending on the environment
var env = process.env.NODE_ENV || 'development'; // this variable is currently only set on heroku. we don't have this set locally
// NODE_ENV will be not null if the app is ran through either heroku or mocha tests(we modified the test script to set NODE_ENV)
console.log('env ******', env);

if(env === 'development' || env === 'test') {
    // load in a separate json file where your development and test config vars are going to live. this config.json is not going to be part of our repo

    // when you require a JSON file, it automatically parses it into a JS object. We don't have to do anything like JSON.parse to get that done. 
    var config = require('./config.json');
    // console.log(config);
    var envConfig = config[env]; // when you want to use a variable to access a property, you have to use bracket notation

    // console.log(Object.keys(envConfig)); // this grabs all the keys of an object. it will return an array with the string keys

    // loop through that array and set the corresponding env vars 
    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
        //eg: process.env.PORT = envConfig.PORT
    });
}

// WE DON'T NEED THIS ANYMORE
// if (env === 'development') {
//     process.env.PORT = 3000;
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
// } else if (env === 'test') {
//     process.env.PORT = 3000;
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
// }