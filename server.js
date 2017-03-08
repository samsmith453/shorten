var url = "mongodb://sam1234:shorturl@ds119220.mlab.com:19220/shorturl";
var urlext = 'https://shortarse.herokuapp.com/';
var validUrl = require('valid-url');
var mongo = require("mongodb").MongoClient;
var express = require("express");

var app = express();

app.use(express.static("public"));

app.listen(process.env.PORT, function(){
    console.log("connected");
});

app.get("/*", function(req, res, next){
    var param = req.params[0];
    var isnum = isNaN(Number(param));
    
    var callback = function(sendable) {
        console.log("called");
        res.send(sendable);
    };
    
    if(validUrl.isUri(param)){
         exist(param, callback);
    }
    else if(!isnum){
        mongo.connect(url, function(err, db){
            if(err) throw err;
            var col5 = db.collection("urls");
            col5.find({
                "shortUrl": urlext + param
            }).toArray(function(err, docs){
                if(err) throw err;
                if(docs.length==0){
                    res.send("This URL does not exist");
                }
                else{
                    var redirect = docs[0].longUrl;
                    res.redirect(redirect);
                }
            });
        });
    }
    else{
        res.send("This URL is invalid.");
    }
    
});


function exist(param, callback){
    console.log("exist");
    mongo.connect(url, function(err, db){
        if(err) throw err;
        var col1 = db.collection("urls");
        col1.find({
            "longUrl": param
        },{
            "_id":0,
            "longUrl": 1,
            "shortUrl": 1
        }).toArray(function(err, docs){
            if(err) throw err;
            if(docs.length==0){
                randomNumber(param, callback);
            }
            else{
                callback(docs[0]);
            }
        });
        db.close();
    });
}

function randomNumber(param, callback){
    console.log("number");
    var num = Math.floor((Math.random()*100)*(Math.random()*100));
    mongo.connect(url, function(err, db){
        if(err) throw err;
        var col4 = db.collection("urls");
        col4.find({
            "shortUrl": urlext + num
        }).toArray(function(err, docs){
            if(err) throw err;
            if(docs.length>0){
                randomNumber(param, callback);
            }
            else{
                shorten(param, num, callback);
            }
        });
    });
}

function shorten(param, num, callback){
    console.log("short");
    var obj = {
            "longUrl": param,
            "shortUrl": urlext + num
        };
        mongo.connect(url, function(err, db){
            if(err) throw err;
            var col3 = db.collection("urls");
            col3.insert(obj, function(err, docs){
                if(err) throw err;
                var send = {
                    "longUrl": docs.longUrl,
                    "shortUrl": docs.shortUrl
                };
                callback(send);
            });
                
        });
        
}