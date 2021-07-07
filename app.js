const express = require('express');
const date = require(__dirname + '/date.js');
const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded());
app.use(express.json())
app.use(express.static(__dirname + '/public'));
const PORT = 3000;

const items = ['Buy food', 'Cook food', 'Eat food'];
const workItems = [];
app.get('/', function(req,res) {
    
    let day = date.getDate();
    res.render('list', {listTitle: day, listOfItems: items})
})

app.post('/', function( req, res) {
    let newItem =    req.body.newItem;

    if ( newItem === 'Work') {
        workItems.push(newItem);
        res.redirect('/work');
    } else {
        items.push(newItem);
        res.redirect('/');
    }
})

app.get('/work', function(req,res) {

    res.render('list', {listTitle: "Work List", listOfItems: workItems})
})

app.post('/', function( req, res) {
    var newItem =    req.body.newItem;
    workItems.push(newItem);
    res.redirect('/work');
})

app.get('/about', function(req,res) {

    res.render('about');
})



app.listen(PORT, function(){
    console.log(`Server started on port ${PORT}`);
})

