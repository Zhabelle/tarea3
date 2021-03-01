const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const logger = require('morgan');
const hbs = require('express-handlebars');
const cookieSession=require('cookie-session');
const passport=require('passport');
require('dotenv').config();
require('./config/passport');

const usersRouter = require('./routes/users');
const animalRouter = require('./routes/animalrs');
const authRouter = require('./routes/auth');

const app = express();

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
  maxAge:24*60*60*1000,
  keys:['clave']
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/users', usersRouter);
app.use('/animals', animalRouter);
app.use('/auth', authRouter);

app.get('/',(req,res)=>{
  console.log("awa");
  res.render('home',{t:req.user?'logout':'login'})
});

app.get('/profile',(req,res)=>{
  const p=req.user;
  const pic=p.pica;
  const name=p.displayName;
  const email=p.email;
  console.log("profairu",p);
  res.render('profile',{name:name,pic:pic,email:email});
  //res.send(req.user);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// // error handler
app.use(function(err, req, res, next) {
  req.logout();
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
