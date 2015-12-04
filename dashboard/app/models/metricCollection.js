import Backbone from 'backbone'
import Metric from './metric'

module.exports = Backbone.Collection.extend({
	model: Metric
});
