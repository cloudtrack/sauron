import es from 'elasticsearch'
var esClient = new es.Client({ host: ELASTICSEARCH_HOST })
var app = {
  es: esClient
}
module.exports = app
