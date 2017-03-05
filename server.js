var url = "mongodb://sam1234:shortenurl@ds119220.mlab.com:19220/shorturl";

var mongo = require("mongodb").MongoClient;
var express = require("express");

var app = express();

app.use(express.static("public"));