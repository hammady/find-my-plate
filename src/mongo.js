const mongo = require('mongodb')
const ObjectID = mongo.ObjectID
var db

module.exports = {
  connect: function (urlObject) {
    var host = urlObject.host
    console.log('Connecting to mongodb at', host)
    return mongo.MongoClient.connect(urlObject.href)
      .then(function (client) {
        console.log('Connected to mongodb at', host)
        db = client.db()
      })
  }
}