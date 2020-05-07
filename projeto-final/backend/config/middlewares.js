// border parser -> 

// core comuncacao entre aplicacao back e front end


const bodyParser = require('body-parser')
const cors = require('cors')

module.exports = app => {
    app.use(bodyParser.json())
    app.use(cors())
}

