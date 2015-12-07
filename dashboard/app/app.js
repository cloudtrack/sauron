import $ from 'jquery'
require('imports?jQuery=jquery!elasticsearch/src/elasticsearch.jquery')
var esClient = new $.es.Client({ host: ELASTICSEARCH_HOST })
var app = {
  es: esClient
}
module.exports = app
