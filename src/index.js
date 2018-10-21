const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || '3000'
const databaseURL = process.env.MONGODB_URI
const { URL } = require('url')
const urlObject = (new URL(databaseURL))
const protocol = urlObject.protocol
const adapter = require('./mongo')

adapter.connect(urlObject)
  .then(function () {
    app.listen(port, () => console.log('Server listening on port', port))
  })
  .catch(function (err) {
    console.error(err)
    process.exit(1)
  })

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    adapter.total()
    .then(function(total) {
        res.render('index', {total: total})
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
        .then(function (ids) {
          res.send(`Your report for plate ${plate} was received successfully. Thanks!`)
        })
        .catch(function (err) {
          console.log(err)
          res.status(500).json({ status: 'Error' })
        })
  })
