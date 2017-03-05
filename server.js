var url = "mongodb://sam1234:shortenurl@ds119220.mlab.com:19220/shorturl";
var urlext = 'https://shortarse.herokuapp.com/';

var validUrl = require('valid-url');
var mongo = require("mongodb").MongoClient;
var express = require("express");

var app = express();

app.use(express.static("public"));

app.listen(process.env.PORT, function(){
    console.log("connected");
});

app.get("/*", function(req, res){
    var param = req.params[0];
    var numtest = Number(param);
    var bol = isNaN(numtest);
    if(!bol){
        res.send("it's a number");
        var point = finder(param).long;
        res.redirect(point);
    }
    else if(validUrl.isUri(param)){
        var object = shortener(param);
        res.send(object);
    }
});


function finder(param){
    mongo.connect(url, function(err, db){
        if(err) throw err;
        var col = db.collection("urls");
        var found = false;
        col.find({
            'short': urlext+param
        }).toArray(function(err, docs){
            if(err) throw err;
            else if(docs.length>0) found = docs[0];
        })
        return found;
    })
}

function shortener(longUrl){
    console.log("shortening");
    mongo.connect(url, function(err, db){
        if(err) throw err;
        var coll = db.collection("urls");
        
        var shortened = false;
        coll.find({
            'long': longUrl
        }).toArray(function(err, docs){
            if(err) throw err;
            else if(docs.length>0){
                console.log(docs);
                shortened = docs[0];
            }
        });
        if(shortened) return shortened;
        else{
            var shortNum = numberPicker(coll);
            
            var obj = {
                'long': longUrl,
                'short': urlext + shortNum
            }
            
            coll.insert(obj, function(err, data){
                if(err) throw err;
                shortened = data;
            })
            return shortened;
        }
        
    });
}



function numberPicker(coll){
     var num = (Math.random()*100)*(Math.random()*100);
     coll.find({
         'short': num
     }).toArray(function(err, docs){
         if(err) throw err;
         else if(docs.length>1) numberPicker(coll);
         else return num;
     });
}