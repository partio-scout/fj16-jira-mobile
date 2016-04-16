var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

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

app.get('/', function(req, res) {
  res.render('login', { name: 'JIRA' });
});

app.listen(3000, function() {
  console.log('Running...');
});
