const {User} = require('./../models/user');

// authenticate middleware. this gets triggered before each private route request
var authenticate = (req, res, next) => {
    const token = req.header('x-auth'); // fetch the x-auth header from the client 

    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject(); // this makes the code go straight to line 163
        }
        // success
        // modify the request object here before proceeding to the actual private request
        req.user = user;
        req.token = token;
        next(); // don't forget to call next, otherwise the app flow will hang here
    }).catch((err) => {
        res.status(401).send(); // 401 means authentication is required. client did not authenticate correctly
    });
};

module.exports = { authenticate };