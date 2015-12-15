import app from '../app'

module.exports = function(duration, callback, errCallback) {
	switch(duration) {
		case(15):
			var query = {
				size: 15,
				from: 0,
				sort: {
					"date": "desc"
				},
				query: {
					match: {
						metric: 'CPUUtilization'
					}
				}
			}
			break;
		case(60):
			break;
		case(180):
			break;
	}
	app.es.search({
		index: 'metrics',
		type: 'EC2',
		body: query
	}).then(function(resp) {
		callback(resp)
	}, function(err) {
		errCallback(err)
	});
}
