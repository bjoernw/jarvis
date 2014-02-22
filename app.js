/**
 * Module dependencies.
 */

var express = require('express');
var MongoStore = require('connect-mongo')(express);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var passportSocketIo = require("passport.socketio");

/**
 * Load controllers.
 */

var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var contactController = require('./controllers/contact');
var witController = require('./controllers/wit_controller');
var jarvisController = require('./controllers/jarvis_controller');
var sonosController = require('./controllers/sonos_controller');

/**
 * API keys + Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */

var app = express();

/**
 * Mongoose configuration.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function () {
    console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

/**
 * Express configuration.
 */

var hour = 3600000;
var day = (hour * 24);
var week = (day * 7);
var month = (day * 30);

app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(require('connect-assets')({
    src: 'public',
    helperContext: app.locals
}));
app.use(express.compress());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(expressValidator());
app.use(express.methodOverride());

var mongoSessionStore = new MongoStore({
    db: mongoose.connection.db,
    auto_reconnect: true
});

app.use(express.session({
    secret: secrets.sessionSecret,
    key: secrets.sessionKey,
    store: mongoSessionStore
}));
app.use(express.csrf());
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
    res.locals.user = req.user;
    res.locals.token = req.csrfToken();
    res.locals.secrets = secrets;
    next();
});
app.use(flash());


app.use(app.router);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: week }));
app.use(function (req, res) {
    res.status(404);
    res.render('404');
});
app.use(express.errorHandler());

/**
 * Socket setup
 */

var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

io.configure('development', function () {
    io.set('transports', ['websocket']);
    io.set('log level', 1);                    // reduce logging
    // set authorization for socket.io
    io.configure(function () {
        io.set('authorization', function (handshakeData, callback) {
            callback(null, true); // error first callback style
        });
    });
});

io.configure('production', function () {
    io.set('transports', [                     // Manage transports
        'websocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
    ]);
    io.set('log level', 1);                    // reduce logging
    // set authorization for socket.io
    io.set('authorization', passportSocketIo.authorize({
        cookieParser: express.cookieParser,
        key: secrets.sessionKey,       // the name of the cookie where express/connect stores its session_id
        secret: secrets.sessionSecret,    // the session_secret to parse the cookie
        store: mongoSessionStore,        // we NEED to use a sessionstore. no memorystore please
        success: onAuthorizeSuccess,  // *optional* callback on success - read more below
        fail: onAuthorizeFail     // *optional* callback on fail/error - read more below
    }));
});


function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');

    // The accept-callback still allows us to decide whether to
    // accept the connection or not.
    accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
    if (error)
        throw new Error(message);
    console.log('failed connection to socket.io:', message);

    // We use this callback to log all of our failed connections.
    accept(null, false);
}

var setup_sockets = require('./models/sockets');
setup_sockets.init(io, witController);


/**
 * Application routes.
 */

app.get('/', homeController.index);
app.get('/wit', witController.wit);
app.get('/jarvis', jarvisController.index);
app.get('/sonos/play', sonosController.play);
app.get('/sonos/stop', sonosController.stop);
app.get('/sonos/louder', sonosController.louder);
app.get('/sonos/quieter', sonosController.quieter);

app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);
app.get('/api', apiController.getApi);
app.get('/api/lastfm', apiController.getLastfm);
app.get('/api/nyt', apiController.getNewYorkTimes);
app.get('/api/aviary', apiController.getAviary);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/steam', apiController.getSteam);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/foursquare', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFoursquare);
app.get('/api/tumblr', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTumblr);
app.get('/api/facebook', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFacebook);
app.get('/api/github', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getGithub);
app.get('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTwitter);
app.get('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getVenmo);
app.post('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postVenmo);

/**
 * OAuth routes for sign-in.
 */

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));

/**
 * OAuth routes for API examples that require authorization.
 */

app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), function (req, res) {
    res.redirect('/api/foursquare');
});
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), function (req, res) {
    res.redirect('/api/tumblr');
});
app.get('/auth/venmo', passport.authorize('venmo', { scope: 'make_payments access_profile access_balance access_email access_phone' }));
app.get('/auth/venmo/callback', passport.authorize('venmo', { failureRedirect: '/api' }), function (req, res) {
    res.redirect('/api/venmo');
});

/**
 * Start Express server.
 */

server.listen(app.get('port'), function () {
    console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});
// app.listen(app.get('port'), function() {
//   console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
// });