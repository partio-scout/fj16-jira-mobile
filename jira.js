var request = require('superagent');
var _ = require('lodash');
var filesize = require('filesize');
var host = process.env.HOST || 'https://jira.roihu2016.fi';
var baseUrl = host + '/rest/';
var moment = require('moment');

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
    _.map(body.issues, function(issue) {
      if (issue.fields.duedate != undefined) {
        issue.fields.duedate = moment(issue.fields.duedate, 'YYYY-MM-DD').format('DD.MM.YYYY');
      }
    });
    cb(null, body.issues);
  });
}

function getIssue(key, username, password, cb) {
  callJira('api/latest/issue/' + key, username, password, function (err, body) {
    if (err) {
      return cb(err);
    }
    if (body.fields.duedate != undefined) {
      body.fields.duedate = moment(body.fields.duedate, 'YYYY-MM-DD').format('DD.MM.YYYY');
    }
    _.map(body.fields.comment.comments, function(comment) {
      moment.locale('fi')
      comment.fromNow=moment(comment.created).fromNow();
      comment.created=moment(comment.created).format('DD.MM.YYYY HH:mm:ss');
    });
    _.map(body.fields.attachment, function(attachment) {
      attachment.size = filesize(attachment.size);
    });
    cb(null, body);
  });
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

function getAttachmentThumb(attachmentId, username, password, cb) {
  if (!username || !password) {
    return _.defer(function() {
      var err = new Error('No username or password supplied');
      err.status = 401;
      cb(err);
    })
  }

  request
    .get(host + '/secure/thumbnail/' + attachmentId + '/')
    .auth(username, password)
    .end(function (err, res) {
      cb(null, res);
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

function addComment(comment, issueKey, username, password, cb) {
  if (!username || !password) {
    return _.defer(function() {
      var err = new Error('No username or password supplied');
      err.status = 401;
      cb(err);
    })
  }

  request
    .post(baseUrl + 'api/latest/issue/' + issueKey + '/comment')
    .auth(username, password)
    .send({ body: comment})
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
  transitionIssue: transitionIssue,
  addComment: addComment,
  getAttachmentThumb: getAttachmentThumb
};
