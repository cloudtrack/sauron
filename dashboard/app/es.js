import es from 'elasticsearch'

var client = new es.Client({ host: ELASTICSEARCH_HOST })

export default client
