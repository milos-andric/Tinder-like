
const express = require('express')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/test', function (req, res) {
  res.send('Test successfusdfl')
})


export default {
  path: '/api',
  handler: app
}
