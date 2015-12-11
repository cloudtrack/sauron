var elasticsearch = require('elasticsearch')
var conv = require('./chartjsDataConverter')
var jsonfile = require('jsonfile')

var client = new elasticsearch.Client({
	host: "http://search-sauron-j75hyivu5hfn4sayixpwx6gmru.ap-northeast-1.es.amazonaws.com",
	// log: 'trace'
})

client.search({
	index: 'metrics',
	type: 'EC2',
	body: {
		from: 0,
		size: 10,
		sort: {
			"date": "desc"
		},
		query: {
			match: {
				metric: 'CPUUtilization'
			}
		}
	}
}).then(function (resp) {
	var hits = resp.hits.hits;
	console.log(resp.hits.total);
	jsonfile.writeFileSync('es.json', resp)
	conv(resp)
}, function (err) {
	console.trace(err.message);
})
