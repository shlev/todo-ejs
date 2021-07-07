const express = require('express');
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');
const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded());
app.use(express.json())
app.use(express.static(__dirname + '/public'));
const PORT = 3000;

const mongodbUrl = 'mongodb://localhost:27017';

const dbName = 'todolistDB';

mongoose.connect(`${mongodbUrl}/${dbName}`, 
    { useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
     name: {
        type: String,
        required: [true, "Please check your data entry no name specified" ]
     }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Buy Food"});
const item2 = new Item({ name: "Cook Food"});
const item3 = new Item({ name: "Eat Food"});

const defaultItems = [ item1, item2, item3];


app.get('/', function(req,res) {
    
    Item.find({},function (err, items) {
        if (err) {
            console.log(err);
        } else {

            if  (items.length === 0) {
                Item.insertMany(defaultItems, function(err) {
                    if (err) {
                        console.log(err);
                    } else {    
                        console.log("Successfully saves all items");
                        res.redirect("/");
                    }
                });
            } else {
                let day = date.getDate();
                console.log(items)
                res.render('list', {listTitle: day, listOfItems: items})
            }
        }
    });
    
})

app.get('/work', function(req,res) {

    res.render('list', {listTitle: "Work List", listOfItems: workItems})
})

app.post('/', function( req, res) {
    const itemName =    req.body.newItem;
    const newItem = new Item({name: itemName});
    newItem.save();
    res.redirect("/");
    
})

app.post('/delete', function( req, res) {
    const itemId = req.body.checkbox;
    Item.findByIdAndRemove(itemId, function(err) {
        if ( err) {
            console.log("Error deleting Item");
        } else {
            res.redirect('/');
        }
    })
})

app.get('/about', function(req,res) {

    res.render('about');
})



app.listen(PORT, function(){
    console.log(`Server started on port ${PORT}`);
})

