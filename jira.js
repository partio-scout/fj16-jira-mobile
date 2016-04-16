var request = require('superagent');
var _ = require('lodash');
var baseUrl = 'https://jira.roihu2016.fi/rest/';

function validateLogin(username, password, cb) {
  request
    .post(baseUrl + 'auth/1/session')
    .send({
      username: username,
      password: password
    })
    .end(function(err, res) {
      console.log(err, res);
      if (err && res.status === 401) {
        cb(new Error('Wrong username or password'));
      } else if (err && res.status === 403) {
        console.error('Login failed: ', res.body)
        cb(new Error('You cannot log in at this time, please try again later.'));
      } else if (err) {
        console.error('Login failed: ', err);
        cb(new Error('Login failed due to an unknown error.'))
      } else {
        cb(null, true);
      }
    });
}

function getToDo(username, password, cb) {
  var jql = 'assignee=' + username +' and status="To Do" ORDER BY Rank';
  getIssueListBySearch(jql, username, password, cb);
}

function getInProgress(username, password, cb) {
  var jql = 'assignee=' + username +' and status="In Progress" ORDER BY Rank';
  getIssueListBySearch(jql, username, password, cb);
}

function getDone(username, password, cb) {
  var jql = 'assignee=' + username + ' and status="Done" ORDER BY Rank';
  getIssueListBySearch(jql, username, password, cb);
}

function getIssueListBySearch(jql, username, password, cb) {
  callJira('api/latest/search?maxResults=500&jql=' + jql, username, password, function (err, body) {
    if (err) {
      return cb(err);
    }
    cb(null, body.issues);
  });
}

function getIssue(key, username, password, cb) {
  callJira('api/latest/issue/' + key, username, password, cb);
}

function callJira(path, username, password, cb) {
  if (!username || !password) {
    return _.defer(function() {
      var err = new Error('No username or password supplied');
      err.status = 401;
      cb(err);
    })
  }

  request
    .get(baseUrl + path)
    .auth(username, password)
    .end(function(err, res) {
      if (err) {
        return cb(err);
      }
      cb(null, res.body);
    });
}

function transitionIssue(issueKey, transitionId, username, password, cb) {
  if (!username || !password) {
    return _.defer(function() {
      var err = new Error('No username or password supplied');
      err.status = 401;
      cb(err);
    })
  }

  request
    .post(baseUrl + 'api/latest/issue/' + issueKey + '/transitions')
    .auth(username, password)
    .send({ transition: { id: transitionId }})
    .end(function(err, res) {
      if (err) {
        return cb(err);
      }
      console.log(res.body);
      cb(null, res.body);
    });

}

module.exports = {
  validateLogin: validateLogin,
  getToDo: getToDo,
  getInProgress: getInProgress,
  getDone: getDone,
  getIssue: getIssue,
  transitionIssue: transitionIssue
};
