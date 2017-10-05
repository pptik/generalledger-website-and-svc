const express = require('express');
const moment = require('moment');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const database = require('./database/mongo_connection');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const debug = require('debug')('semut-svc:server');
const http = require('http');
const flash = require('express-flash')
const configs = require('./configs/database.json');
const commonMsg = require('./configs/common_messages.json');
let app = express();

/** setup express **/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const cors = require('cors');

app.use(flash());
app.use(cors());
app.use(session({
    secret: "absensiSMP48",
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ url: configs.mongodb_uri }),
    cookie: { secure: !true }
}));

/** get mongodb connection pool* */
database.connect().then(db =>{
    /** if error **/
    app.use((err, req, res, next) => {
        res.status(200).send(commonMsg.service_not_responding);
    });
    app.use(function (req, res, next) {
        res.locals.messages = require('express-messages')(req, res);
        next();
    });
    app.use(function(err, req, res, next) {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        res.status(err.status || 500);
        res.render('error');
    });
    /** init server **/
    let port = normalizePort(process.env.PORT || '3070');
    app.set('port', port);
    let server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    function normalizePort(val) {
        let port = parseInt(val, 10);
        if (isNaN(port)) return val;
        if (port >= 0) return port;
        return false;
    }
    function onError(error) {
        if (error.syscall !== 'listen') throw error;
        let bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
    function onListening() {
        let addr = server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }
    /** export mongodb connection **/
    app.db = db;
    module.exports = app;
    /** run mq service**/
    const rmqConnection = require('./rmq/connection');
    rmqConnection.connect();
    /** define routes**/
    let index = require('./routes/index');
    let users = require('./routes/users');
    let panicButton = require('./routes/panicButton');
    let transaction = require('./routes/transaction');
    app.use('/', index);
    app.use('/users', users);
    app.use('/panicbutton', panicButton);
    app.use('/transaction', transaction);

    /** if route not found**/
    app.use((req, res) => {
        res.status(200).send(commonMsg.routes_not_found);
    });
}).catch(err=>{
    console.log(err);
});

//Middleware untuk memanggil fungsi pencekan database transaksi hari ini
app.use(function(req, res, next){
    database.checkTransactionCollection('transaksi_'+moment().format('l'))
    next();
});

