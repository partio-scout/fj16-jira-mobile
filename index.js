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

function handleError(err, res) {
  console.error('Handle error: ', err);
  if (err.status && err.status === 401) {
    res.status(401);
    res.render('error_401');
  } else {
    res.status(500);
    res.render('error_500');
  }
}

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
  var username = req.body.username;
  var password = req.body.password;
  jira.validateLogin(username, password, function(err, success) {
    if (err) {
      return res.render('login', { csrfToken: req.csrfToken(), error: err.message });
    } else {
      req.session.username = username;
      req.session.password = password;
      return res.redirect('/');
    }
  });
});

app.get('/todo', function (req, res) {
  jira.getToDo(req.session.username, req.session.password, function(err, todo) {
    if (err) {
      return handleError(err, res);
    }
    res.render('issues', {issues: todo});
  });
});

app.get('/inprog', function (req, res) {
  jira.getInProgress(req.session.username, req.session.password, function(err, todo) {
    if (err) {
      return handleError(err, res);
    }
    res.render('issues', {issues: todo});
  });
});

app.get('/done', function (req, res) {
  jira.getDone(req.session.username, req.session.password, function(err, todo) {
    if (err) {
      return handleError(err, res);
    }
    res.render('issues', {issues: todo});
  });
});

app.listen(3000, function() {
  console.log('Running...');
});
