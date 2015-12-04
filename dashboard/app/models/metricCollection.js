import Backbone from 'backbone'
import Metric from './metric'

exports.default = Backbone.Collection.extend({
	model: Metric
});
