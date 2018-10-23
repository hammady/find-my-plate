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
const fs = require('fs')
const languages = {}

const loadLanguage = function(code) {
  if (!languages[code]) {
    const contents = fs.readFileSync(`/app/locales/${code}.json`)
    eval(`languages[code] = ${contents}`)
  }
  return languages[code]
}

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
  languages: ['en', 'ar'],
  queryName: 'language'
}))

app.use(express.static('public'))

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  adapter.total()
  .then(function(total) {
    res.render('index', {total: total, l: loadLanguage(req.language)})
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
          res.render('results', { plate: plate, results: results, l: loadLanguage(req.language) })
        })
        .catch(function (err) {
          console.log(err)
          res.status(500).json({ status: 'Error' })
        })  })

app.post('/report', (req, res) => {
    const plate = req.body.plate
    const contact = req.body.contact
    const location = req.body.location
    const l = loadLanguage(req.language)
    console.log(`Reporting plate ${plate}`)
    adapter.report(
        plate,
        contact,
        location
      )
        .then(function () {
          var msg = `${l.report_received} (${l.plate_number} ${plate})`
          adapter.searchRegistrations(plate)
          .then(function(results) {
            if (results.length > 0) {
              var contacts = []
              for(var i=0; i<results.length; i++) {
                contacts.push(results[i].contact)
              }
              contacts = contacts.join(', ')
              console.log(`Found matching registrations: ${contacts}`)
              msg += ` ${l.found_registrations} ${contacts}.`
            }
            res.render('simple', {message: msg, l: loadLanguage(req.language)})
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
    const l = loadLanguage(req.language)
    console.log(`Registering plate ${plate}`)
    adapter.register(
        plate,
        contact
      )
        .then(function () {
          const msg = `${l.registration_received} (${l.plate_number}: ${plate}).`
          res.render('simple', {message: msg, l: loadLanguage(req.language)})
        })
        .catch(function (err) {
          console.log(err)
          res.status(500).json({ status: 'Error' })
        })
  })
