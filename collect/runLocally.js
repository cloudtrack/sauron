var fetch = require('./index.js');
var context = {
	succeed: function(msg) {
		console.log(msg);
	}
}
fetch.handler({}, context);
