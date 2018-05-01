var express = require('express')
var bodyParser = require('body-parser')
var shaper = require('../')
var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('client'))

let shapeProfile = shaper({
    firstName: String,
    lastName: String,
    education: [
        {
            school: String,
            years: {
                since: Number,
                till: Number
            }
        }
    ]
})

app.post('/', function (req, res) {
    let profile = shapeProfile(req.body)
    console.log(profile)
    res.send('')
})

app.listen(5000, () => console.log('Running at 5000'))