const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || '3000'
const databaseURL = process.env.DATABASE_URL
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

app.use(bodyParser.json({ limit: '100kb' }))

app.get('/ping', (req, res) => {
    res.send('OK')
  })

app.get('/search/:plate', (req, res) => {
    const plate = req.params.plate
    console.log(`Searching for plate ${plate}`)
    adapter.search(
        plate
      )
        .then(function (results) {
          res.json({ results: results })
        })
        .catch(function (err) {
          console.log(err)
          res.status(500).json({ status: 'Error' })
        })  })
  
app.post('/report/:plate', (req, res) => {
    const plate = req.params.plate
    const contact = req.body.contact
    const location = req.body.location
    console.log(`Reporting plate ${plate}`)
    adapter.report(
        plate,
        contact,
        location
      )
        .then(function (ids) {
          res.send('Thanks')
        })
        .catch(function (err) {
          console.log(err)
          res.status(500).json({ status: 'Error' })
        })
  })
