var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// auth modules
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('./config');

var indexRouter = require('./routes/index');
var app = express();

const options = require('./knexfile.js');
const knex = require('knex')(options);
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./docs/crimeswagger.json')
const helmet = require('helmet');
const fs = require('fs');

app.use(logger('common'));

app.use(helmet());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// logs each api request
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);
app.use(logger(':remote-addr - :remote-user [:date[clf]] :method :url :status :res[content-length] - :response-time ms', { stream: accessLogStream }))

app.use((req, res, next) => {
  req.db = knex;
  req.bc = bcrypt;
  req.cf = config;
  req.jwt = jwt;
  next()
})

app.use('/', indexRouter);
app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerDocument))


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
