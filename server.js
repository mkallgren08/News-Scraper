// ====================================
//      Dependencies
// ====================================

const bodyParser = require("body-parser")
const logger = require("morgan")
const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");

// Required Models
const NewestArticles = require("./models/NewestArticles.js");
const Article = require("./models/Article.js");
const Note = require("./models/Note.js");

// Scraping Tools
const cheerio = require("cheerio");
const request = require("request");

// ====================================
//      Server Setup
// ====================================

// Initialize Express
const app = express();

// Sets up the main handlebars page (main.hbs) to serve our web apps pages
// Sets the viewing engine of the app to handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

//Use body-parser and morgan with the app
app.use(bodyParser.urlencoded({
    extended: false
  }));
app.use(logger("dev"));

// Set the port to use as a variable.
const port = 3000;

// set the app to listen for a server connection
app.listen(port, function(){
    console.log('App listening on port ' + port)
})


// ====================================
//      Database Setup
// ====================================

// Database configuration with mongoose
mongoose.connect('mongodb://localhost/scraper');
const db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});
  
// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});

// ====================================
//      Routing
// ====================================

// Homepage Route
app.get('/', function (req, res) {
    let hbsObj ={
        title: "BBC News Scraper Homepage",
        mainActive: "active", 
    }
    res.render('index', hbsObj);
});

// A GET request for the saved articles
app.get('/saved', function (req, res) {
    let hbsObj ={
        title: "Saved BBC Articles",
        savedActive: "active" 
    }
    res.render('saved', hbsObj);
});

// A GET request to scrape the BBC World website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request("http://www.bbc.com/news/world", function(error, response, html) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // With cheerio, find each div-tag with the "title" class
    // (i: iterator. element: the current element)

    // Save an empty result object
    var result = [];  
    
    $("a.title-link").each(function(i, element) {

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this).find("span").text();
        result.link = $(this).attr("href");
        
        // Using our Article model, create a new entry
        // This effectively passes the result object to the entry (and the title and link)
        var entry = new NewestArticles(result);
  
        // Now, save that entry to the db
        entry.save(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          // Or log the doc
          else {
            console.log(doc);
          }
        });
      });
    //   res.render("newscrapes", hbsObject);
    });

    // Tell the browser that we finished scraping the text
    console.log("Done scraping!")
    res.redirect("/newarticles")
  });

// This will get the articles we scraped from the mongoDB and post it to 
// the "newarticles" page
app.get("/newarticles", function(req, res) {
    // Grab every doc in the Articles array
    NewestArticles.find({}, function(error, result) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Or send the doc to the browser as a json object
      else {
        var hbsObject= {
            title : "BBC Scraped News",
            results : result
        }
        res.render("newscrapes", hbsObject);
      }
    });
});

