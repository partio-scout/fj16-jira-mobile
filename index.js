var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var DatabaseStore = require('connect-pg-simple')(session);
var csrf = require('csurf');
var express_enforces_ssl = require('express-enforces-ssl');
var hsts = require('hsts');
var bodyParser = require('body-parser');
var jira = require('./jira');

var SESSION_TTL = 8*3600;

var app = express();

app.set('views', './views');
app.set('view engine', 'pug');

var sessionStore;
if (process.env.DATABASE_URL) {
  console.log('Using database sessions');
  sessionStore = new DatabaseStore({
    ttl: SESSION_TTL,
    conString: process.env.DATABASE_URL,
  });
} else {
  console.log('Using flat-file sessions');
  sessionStore = new FileStore({
    ttl: SESSION_TTL,
    encrypt: true,
  });
}


app.use(session({
  store: sessionStore,
  secret: process.env.SECRET || 'Set a proper secret in the SECRET env variable',
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: false }));

var csrfProtection = csrf();
app.use(csrfProtection);

if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
  app.use(express_enforces_ssl());
}

app.use(hsts({
  maxAge: 20*7*24*60*60*1000,
  includeSubDomains: true,
  preload: true
}));

app.use(express.static('public'));

function handleError(err, res) {
  console.error('Handle error: ', err);
  if (err.status && err.status === 401) {
    res.status(401);
    res.render('error_401');
  } else {
    res.status(500);
    res.render('error');
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

app.post('/login', function(req, res) {
  req.session.regenerate(function(err) {
    if (err) {
      console.error('Session regeneration failed', err);
    }
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
});

app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.error('Logout failed: ', err);
    }
    res.redirect('/');
  });
});

app.get('/todo', function (req, res) {
  jira.getToDo(req.session.username, req.session.password, function(err, issueList) {
    if (err) {
      return handleError(err, res);
    }
    res.render('issues', { issues: issueList, username: req.session.username, type: 'todo' });
  });
});

app.get('/inprog', function (req, res) {
  jira.getInProgress(req.session.username, req.session.password, function(err, issueList) {
    if (err) {
      return handleError(err, res);
    }
    res.render('issues', { issues: issueList, username: req.session.username, type: 'inprog' });
  });
});

app.get('/done', function (req, res) {
  jira.getDone(req.session.username, req.session.password, function(err, issueList) {
    if (err) {
      return handleError(err, res);
    }
    res.render('issues', { issues: issueList, username: req.session.username, type: 'done' });
  });
});

app.get('/issue/:key', function (req, res) {
  jira.getIssue(req.params.key, req.session.username, req.session.password, function(err, issue) {
    if (err) {
      return handleError(err, res);
    }
    res.render('issue', { issue: issue, username: req.session.username , csrfToken: req.csrfToken()});
  });
});

app.get('/issue/:key/json', function (req, res) {
  jira.getIssue(req.params.key, req.session.username, req.session.password, function(err, issue) {
    if (err) {
      return handleError(err, res);
    }
    res.send(issue);
  });
});

app.get('/issue/:key/transition/:transitionId', function (req, res) {
  jira.transitionIssue(req.params.key, req.params.transitionId, req.session.username, req.session.password, function(err, issue) {
    if (err) {
      return handleError(err, res);
    }
    res.redirect('/issue/' + req.params.key);
    // TODO: better way to handle...
  });
});

app.post('/issue/:key/comment', function (req, res) {
  console.log(req.body.comment);
  if (req.body.comment != undefined && req.body.comment.length > 0) {
    jira.addComment(req.body.comment, req.params.key, req.session.username, req.session.password, function(err, issue) {
      if (err) {
        return handleError(err, res);
      }
    });
  }
  res.redirect('/issue/' + req.params.key);
});

app.get('/attachmentthumb/:attachmentId', function (req, res) {
  jira.getAttachmentThumb(req.params.attachmentId, req.session.username, req.session.password, function(err, resp) {
    if (err) {
      return handleError(err, res);
    }
    res.type(resp.type);
    res.send(resp.body);
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Running...');
});
