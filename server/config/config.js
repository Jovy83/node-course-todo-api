// this is to determine what environment we're on: production (our app on heroku), development (when we run our app locally), test (when we run tests on our app through mocha). this way we can set the mongoDB URI depending on the environment
var env = process.env.NODE_ENV || 'development'; // this variable is currently only set on heroku. we don't have this set locally
// NODE_ENV will be not null if the app is ran through either heroku or mocha tests(we modified the test script to set NODE_ENV)
console.log('env ******', env);

if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}