var request = require('superagent');

function getToDo(username, password, cb) {
  setTimeout(function() {
  	cb({
  	  name: 'yesss'
  	})
  }, 0);
}

module.exports = {
  getToDo: getToDo,
};
