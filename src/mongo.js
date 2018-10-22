const mongo = require('mongodb')
const ObjectID = mongo.ObjectID
var db, platesCollection, contactsCollection

module.exports = {
  connect: function (urlObject) {
    var host = urlObject.host
    console.log('Connecting to mongodb at', host)
    return mongo.MongoClient.connect(urlObject.href)
      .then(function (client) {
        console.log('Connected to mongodb at', host)
        db = client.db()
        platesCollection = db.collection('plates')
        contactsCollection = db.collection('contacts')
    })
  },

  search: function (plate) {
    return platesCollection.find({plate: plate}).toArray()
  },

  report: function (plate, contact, location) {
    return platesCollection.insertOne({
        plate: plate,
        contact: contact,
        location: location
    })
  },

  register: function (plate, contact) {
    return contactsCollection.insertOne({
        plate: plate,
        contact: contact
    })
  },

  searchRegistrations: function (plate) {
    return contactsCollection.find({plate: plate}).toArray()
  },

  total: function() {
    return platesCollection.count()
  }
}