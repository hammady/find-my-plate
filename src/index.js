const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || '3000'
const databaseURL = process.env.MONGODB_URI
const { URL } = require('url')
const urlObject = (new URL(databaseURL))
const protocol = urlObject.protocol
const adapter = require('./mongo')
const requestLanguage = require('express-request-language')

adapter.connect(urlObject)
  .then(function () {
    app.listen(port, () => console.log('Server listening on port', port))
  })
  .catch(function (err) {
    console.error(err)
    process.exit(1)
  })

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(requestLanguage({
  languages: ['en', 'ar', 'ur'],
  queryName: 'language'
}))

app.use(express.static('public'))

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  adapter.total()
  .then(function(total) {
    const dir = req.language === 'en' ? 'ltr' : 'rtl'
    res.render('index', {total: total, lang: req.language, dir: dir})
  })
})

app.get('/ping', (req, res) => {
  res.send('OK')
})

app.get('/search', (req, res) => {
    const plate = req.query.plate
    console.log(`Searching for plate ${plate}`)
    adapter.search(
        plate
      )
        .then(function (results) {
          console.log(`Found ${results.length} results for plate ${plate}`)
          res.render('results', { plate: plate, results: results })
        })
        .catch(function (err) {
          console.log(err)
          res.status(500).json({ status: 'Error' })
        })  })

app.post('/report', (req, res) => {
    const plate = req.body.plate
    const contact = req.body.contact
    const location = req.body.location
    console.log(`Reporting plate ${plate}`)
    adapter.report(
        plate,
        contact,
        location
      )
        .then(function () {
          var msg = `Your report for plate ${plate} was received successfully. Thanks!`
          adapter.searchRegistrations(plate)
          .then(function(results) {
            if (results.length > 0) {
              var contacts = []
              for(var i=0; i<results.length; i++) {
                contacts.push(results[i].contact)
              }
              contacts = contacts.join(', ')
              console.log(`Found matching registrations: ${contacts}`)
              msg += ` Someone searched for this plate, please contact them in case they don't check back later: ` +
                contacts + '.'
            }
            res.send(msg)
          })
          .catch(function (err) {
            console.log(err)
            res.status(500).json({ status: 'Error' })
          })
        })
        .catch(function (err) {
          console.log(err)
          res.status(500).json({ status: 'Error' })
        })
  })

  app.post('/register', (req, res) => {
    const plate = req.body.plate
    const contact = req.body.contact
    console.log(`Registering plate ${plate}`)
    adapter.register(
        plate,
        contact
      )
        .then(function () {
          res.send(`Your registration for plate ${plate} was received successfully. Anyone reporting the same will see your contact number.`)
        })
        .catch(function (err) {
          console.log(err)
          res.status(500).json({ status: 'Error' })
        })
  })
