require("dotenv").config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
const cors = require('cors')


var app = express();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured.");
}
if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured.");
}

require('./auth/auth');
const login = require('./routes/login')
const loggedInPage = require('./routes/loggedInUser');
const bookingRoute = require('./routes/routeSelection')
var registerRouter = require('./routes/register');
const paymentRoutes = require('./routes/payments');

const DB_URL = require('./config/keys').MongoURI;

mongoose.connect(DB_URL)
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch(err => {
        throw err
    })

if (process.env.NODE_ENV !== 'production') {
    app.use(logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const defaultOrigins = process.env.NODE_ENV === 'production'
    ? ''
    : 'http://localhost:3000,http://localhost:5173';
const allowedOrigins = new Set(
    (process.env.CORS_ORIGINS || defaultOrigins)
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
);
app.use(cors({
    origin(origin, callback) {
        callback(null, !origin || allowedOrigins.has(origin));
    }
}));
app.use(passport.initialize());
app.get('/health', (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    return res.status(databaseConnected ? 200 : 503).json({
        status: databaseConnected ? 'ok' : 'starting'
    });
});
app.use('/', login);
app.use('/booking', bookingRoute);
app.use('/register', registerRouter);  // To register page 
app.use('/user', passport.authenticate('jwt', { session: false }), loggedInPage); //To Secure Route
app.use('/payments', passport.authenticate('jwt', { session: false }), paymentRoutes);

if (process.env.NODE_ENV === 'production') {
    const frontendBuild = path.resolve(__dirname, '../frontend/dist');
    app.use(express.static(frontendBuild));
    app.get('*', (req, res, next) => {
        if (!req.accepts('html')) {
            return next();
        }
        return res.sendFile(path.join(frontendBuild, 'index.html'));
    });
}

module.exports = app;
