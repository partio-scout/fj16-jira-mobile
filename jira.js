var request = require('superagent');

var baseUrl = 'https://jira.roihu2016.fi/rest/api/latest/';

function getToDo(username, password, cb) {
  setTimeout(function() {
  	request
      .get(baseUrl + 'search?jql=assignee=teppo.testaaja and status="To Do" ORDER BY Rank')
      .auth(username, password)
      .end(function(err, res) {

        console.log(res.body.issues)

        var issues = res.body.issues;

        for (var a in issues) {
          var issue = issues[a];

          console.log(issue.key + " | " + issue.fields.summary);
        }

      })

    cb({
  	  name: 'yesss'
  	})
  }, 0);
}

module.exports = {
  getToDo: getToDo,
};
