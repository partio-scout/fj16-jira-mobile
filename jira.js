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
  if (!username || !password) {
    return _.defer(function() {
      var err = new Error('No username or password supplied');
      err.status = 401;
      cb(err);
    })
  }

  request
    .get(baseUrl + 'api/latest/search?jql=assignee=teppo.testaaja and status="To Do" ORDER BY Rank')
    .auth(username, password)
    .end(function(err, res) {
      if (err) {
        return cb(err);
      }

      // debug logging
      console.log(res.body.issues)
      var issues = res.body.issues;
      for (var a in issues) {
        var issue = issues[a];
        console.log(issue.key + " | " + issue.fields.summary);
      }
      // end debug logging

      cb(null, issues);

    });
}

module.exports = {
  validateLogin: validateLogin,
  getToDo: getToDo,
};
