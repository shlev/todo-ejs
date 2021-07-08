const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');

const date = require(__dirname + '/date.js');
const app = express();



app.set('view engine', 'ejs');

app.use(express.urlencoded());
app.use(express.json())
app.use(express.static(__dirname + '/public'));
const PORT = 3000;

const mongodbUrl = 'mongodb://localhost:27017';
const mongoAtlasUrl = 'mongodb+srv://admin-ks:Test123@cluster0.hwkda.mongodb.net';

const dbName = 'todolistDB';

mongoose.connect(`${mongoAtlasUrl}/${dbName}`, 
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

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

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
                res.render('list', {listTitle: "Today", listOfItems: items})
            }
        }
    });
    
})

app.post('/', function( req, res) {
    console.log(req.body);
    const itemName =    req.body.newItem;
    const listName = req.body.list;

    const newItem = new Item({name: itemName});

    if ( listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        
        List.findOne({name: listName}, function(err, foundList) {
            if (err) {
                console.log(err);
            } else {
                if ( foundList ) {
                    foundList.items.push(newItem);
                    foundList.save();
                    res.redirect('/' + listName);
                } else {
                    const newList = new List({ 
                        name: listName,
                        items: [newItem]
                    });
                    console.log("Adding new List: " + listName);
                    newList.save();
                }
            }
        });

    }
    
    
})

app.post('/delete', function( req, res) {
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;

    if ( listName === "Today") {
        Item.findByIdAndRemove(checkItemId, function(err) {
            if ( !err) {
                console.log("Successfully deleted checked item.");
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate(
            { name: listName }, 
            { $pull: {items: {_id: checkItemId}}},
            function(err, foundList) {
                if (!err) {
                    res.redirect("/" + listName)
                } else {
                    console.log(err);
                }
            }
        )

    }
})

app.get('/about', function(req,res) {

    res.render('about');
})

app.get('/:customListName', function(req,res) {
    const customListName = _.capitalize(req.params.customListName);
    console.log("CustomListName: " + customListName)
    List.findOne({name: customListName}, function(err, foundList) {
        console.log("Attempt to find one: " + customListName);
        if ( err) {
            console.log(err);
        } else {
            if ( !foundList) {
                //create a new list 
                const list = new List({ 
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
               //Show existing list
               res.render("list", {listTitle: foundList.name, listOfItems: foundList.items});
             }
            }
        });
    
})



app.listen(PORT, function(){
    console.log(`Server started on port ${PORT}`);
})

