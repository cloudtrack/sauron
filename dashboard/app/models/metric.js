import Backbone from 'backbone'
var sampleData = require('json!../data/sample.json');

exports.default = Backbone.Model.extend({
	defaults: {
		data: sampleData,
		state: '',
		title: 'Default title',
		id: 0,
		unit: "%"
	}
});
