const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const reservationsRouter = require('./routes/reservations');
const parseMessage = require('./utils/parseMessage');
const createReservation = require('./db/createReservation');
const app = express();
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', indexRouter);
app.use('/reservations', reservationsRouter);

app.post('/sms', async (req, res) => {
  const twiml = new MessagingResponse();
  const twilioData = req.body;
  const [restaurantRequest, ...message] = parseMessage(req.body.Body);
  const statusMessage = await createReservation(message, twilioData);

  twiml.message(statusMessage);
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.post('/', async (req, res) => {
  const text = parseMessage(req.body.text);
  const reserve = await createReservation(text, req.body);
  res.json({reserve});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
