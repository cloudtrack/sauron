import $ from 'jquery'
require('imports?jQuery=jquery!elasticsearch/src/elasticsearch.jquery')
var esClient = new $.es.Client({
  host: ELASTICSEARCH_HOST,
  apiVersion: '1.5'
})
var app = {
  es: esClient
}
module.exports = app
