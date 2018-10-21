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

app.get('/search', (req, res) => {
    res.send('TODO search')
  })
  
app.post('/report', (req, res) => {
    res.send('TODO report')
  })
