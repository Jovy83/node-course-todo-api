// crypto-js method aka doing the encoding and decoding ourselves manually
const {SHA256} = require('crypto-js');

var message = 'I am user number 1';
var hash = SHA256(message).toString(); // result will be an object so we need to convert it to string

console.log(`Message: ${message}`);
console.log(`Hash: ${hash}`);

var data = {
    id: 4
};
var token = {
    data,
    hash: SHA256(JSON.stringify(data) + 'somesecretsalt').toString()
}

// scenario of a userA manipulating his token to appear that he is userB
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();

var resultHash = SHA256(JSON.stringify(token.data) + 'somesecretsalt').toString();
if (resultHash === token.hash) {
    console.log('Data was not changed and legit');
} else {
    console.log('Data was changed. Do not trust this user');
}

// json web token plugin method
const jwt = require('jsonwebtoken');

var anotherData = {
    id: 10
};

// this takes an object and signs/hashes it. 
var anotherToken = jwt.sign(anotherData, '123abc'); // the 2nd arg is your secret salt
// this token is the value we're going to send back to the client when they register or login. It's also the value we're going to store on their tokens array: tokens.access = 'auth' , tokens.token = tokenGeneratedAbove

console.log('encoded', anotherToken);

// takes a token and salt and makes sure that the data is not manipulated
var decoded = jwt.verify(anotherToken, '123abc'); // this throws an error if the token or the salt is altered beforehand
console.log('decoded', decoded);