const app = require ('express')()
const consign = require('consign') // gerenciamento das dependencias usadas na aplicação
const db = require('./config/db')
const mongoose = require('mongoose')

require('./config/mongodb')


app.db = db
app.mongoose = mongoose


consign() 
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api/validation.js')
    .then('./api')
    .then('./schedule')
    .then('./config/routes.js')
    .into(app)
app.listen(3000, () => { 
    console.log('Backend Executando...2')
})