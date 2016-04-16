var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var csrf = require('csurf');
var bodyParser = require('body-parser');
var jira = require('./jira');

var app = express();

app.set('views', './views');
app.set('view engine', 'pug');

var sessionOptions = {
  ttl: 8*3600,
  encrypt: true,
};
app.use(session({
  store: new FileStore(sessionOptions),
  secret: process.env.SECRET || 'Set a proper secret in the SECRET env variable',
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: false }));

var csrfProtection = csrf();
app.use(csrfProtection);

app.get('/', function(req, res) {
  if (req.session.username) {
    res.redirect('/todo');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', function(req, res) {
  res.render('login', { csrfToken: req.csrfToken() });
});

app.post('/login', csrfProtection, function(req, res) {
  jira.validateLogin('', '', function(err, res) {
    if (err) {
      return res.render('login', { csrfToken: req.csrfToken, error: err });
    } else {
      //TODO Save session
      return res.redirect('/todo');
    }
  });
});

app.get('/todo', function (req, res) {
  jira.getToDo('api', 'p4ssw0rd@roihu', function(todo) {
    res.render('issues', {issues: todo});
  });
});

app.listen(3000, function() {
  console.log('Running...');
});
