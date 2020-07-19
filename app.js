require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const lodash = require('lodash/string')
const date = require(__dirname + "/src/date.js")

const app = express()
const port = process.env.PORT || 3000
const url = process.env.MONGODB_ATLAS_URI

mongoose.connect(url, { dbName: 'todoList', useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => {
    console.log('Connection to the Atlas Cluster is successful!')
}).catch(err => console.error(err))

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

const itemSchema = new mongoose.Schema({
    name: String
}, { versionKey: 'versionKey' })

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
}, { versionKey: 'versionKey' })

const Item = mongoose.model('Item', itemSchema)
const List = mongoose.model('List', listSchema)

const item1 = new Item({ name: "Welcome to your todolist!" })
const item2 = new Item({ name: "Hit the + button to add new task" })
const item3 = new Item({ name: "Check the box to delete the finished task" })

Item.estimatedDocumentCount().then(res => {
    if(res === 0) {
        Item.insertMany([item1, item2, item3], (err, docs) => {
            if(err)
                console.log(err)
            else
                console.log("First 3 items has been added")
        })
    }
})

var currentdir

app.get('/', (req, res) => {
    let day = date.getDay()
    Item.find({}, (err, docs) => {
        if(err)
            console.log(err)
        else 
            res.render('index', { title: day, newItem: docs })
    })
    currentdir = req.originalUrl
})

app.post('/', (req, res) => {    
    const item = req.body.addList
    const notNull = item !== "" 

    const obj = new Item({
        name: item
    })

    if(currentdir === '/') {
        if(notNull) {
            Item.insertMany(obj, (err, doc) => {
                if(err)
                    console.log(err)
                else
                    console.log("Successfully added the item")
            })
        }
    } else {
        if(notNull) {
            List.updateOne({name: currentdir}, {$push: {items: obj}}, (err, doc) => {
                if(err)
                    console.log(err)
                else
                    console.log(`Successfully added item under ${currentdir} list`)
            })
        }
    }

    res.redirect(currentdir)
})

app.get('/:doc', (req, res) => {
    const customName = lodash.capitalize(lodash.lowerCase(req.params.doc))
    const dir = lodash.kebabCase(customName)

    List.findOne({ name: dir }, (err, result) => {
        if(err)
            console.log(err)
        else {
            if(result == null) {
                //The list does not exist
                const list = new List({
                    name: dir,
                    items: [item1, item2, item3]
                })
                list.save()
                res.redirect(req.params.doc)
            } else {
                List.find({ name: dir }, (error, docs) => {
                    if(error)
                        console.log(error)
                    else
                        res.render('index', { title: `${customName} List`, newItem: docs[0].items })
                })
            }
        }
    })

    currentdir = dir
})

app.post('/delete', (req, res) => {
    var itemID = req.body.checkItem
    
    if(currentdir === '/') {
        Item.findByIdAndRemove(itemID, err => {
            if(err)
                console.log(err)
            else
                console.log(`Item ${itemID} has been successfully deleted`)
        })
    } else {
        List.findOneAndUpdate({name: currentdir}, {$pull: {items: {_id: itemID}}}, err => {
            if(err)
                console.log(err)
            else
                console.log(`Item ${itemID} under ${currentdir} has been successfully deleted`)
        })
    }

    res.redirect(currentdir)
})

app.listen(port, () => console.log(`App is listening on http://localhost:${port}`))