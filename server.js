// ====================================
//      Dependencies
// ====================================

const bodyParser = require("body-parser")
const logger = require("morgan")
const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

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
// Set the port to use as a variable.
const port = process.env.PORT || 3000;


// Sets up the main handlebars page (main.hbs) to serve our web apps pages
// Sets the viewing engine of the app to handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

//Use body-parser and morgan with the app
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
  }));
app.use(logger("dev"));





// ====================================
//      Database Setup with Mongoose
// ====================================

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_086slhkf:t96inaqlc3krouapt7t4uvf6rd@ds139984.mlab.com:39984/heroku_086slhkf")
//mongoose.connect('mongodb://localhost/scraper');
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
    // Grab every doc in the NewestArticles collection
    NewestArticles.find({}, function(error, result) {
        // Log any errors
        if (error) {
          console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
          var hbsObject= {
              title : "BBC Scraped News",
              mainActive: 'active',
              results : result
          }
          console.log("hbsObj for rendering: " + JSON.stringify(hbsObject), null, 2);
          res.render("index", hbsObject);
        }
      });
});

app.get("/findArticle/:id", function (req, res){
    Article.findById(req.params.id)
        .populate("notes")
        .exec(function(err, article){
            if (err){
                console.log("err " + err)
            } else {
            res.json(article)
            }
        })
    });

// A GET request for the saved articles
app.get('/saved', function (req, res) {
    // Grab every doc in the Article collection
    Article.find({})
    // ..and on top of that, populate the notes (replace the objectIds in the notes array with bona-fide notes)
    .populate("notes")
    // Now, execute the rest of the query
    .exec( function(error, result) {
        // Log any errors
        if (error) {
          console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
          var hbsObject= {
              title : "BBC Scraped News",
              savedActive: 'active',
              results : result
          }
          console.log("hbsObj for rendering: " + JSON.stringify(hbsObject), null, 2);
        //   res.send(result);
          res.render("saved", hbsObject);
        }
      });
});

// POST Saving the article to the Articles collection
app.post('/save', function (req, res) {
    // Using our Article model, create a new entry
    // This effectively passes the result object to the entry (and the title and link)
    let data = req.body;
    console.log("req.body: " + JSON.stringify(req.body, null, 2))
    // console.log("Article pulled: " + NewestArticles.findById(data.articleID))
    NewestArticles.findById(data.articleID)
    .then(function(article) {
        console.log("Article pulled: " + article)
        Article.create({ title: article.title, link: article.link, originalID: article._id})
            .then(function (newArticle) {
                console.log(newArticle);
                res.send('Done.');
                console.log('Done');
            })
            .catch(function(err) {
                console.log(err);
            }); 
    });
});

// POST removing the article from the Articles colelction
app.post('/unsave', function (req, res) {
    // Using our Article model, create a new entry
    // This effectively passes the result object to the entry (and the title and link)
    let data = req.body;
    console.log("req.body: " + JSON.stringify(req.body, null, 2))
    // console.log("Article pulled: " + NewestArticles.findById(data.articleID))
    Article.findByIdAndRemove(data.articleID, 
        function(err,doc) {
            if (err) {
                console.log(err)
            } else {
                res.send(doc + "deleted!")
            }
        });
});
// Saving the notes to the Notes collection
app.post('/articles/:id', function (req, res) {
    // Using our Article model, create a new entry
    // This effectively passes the result object to the entry (and the title and link)
    console.log("req.body: " + JSON.stringify(req.body, null, 2))
    
    // let note = new Note(req.body);

    Note.create(req.body)
        .then(function (newNote) {
        // Find our user and push the new note id into the User's notes array
        Article.findOneAndUpdate({ "_id": req.params.id }, { "notes": newNote._id }, { new: true })
        .exec( function(err, newdoc) {
            // Send any errors to the browser
            if (err) {
            res.send(err);
            }
                // Or send the newdoc to the browser
                else {
                // res.redirect("/saved");
                res.send("success!")
                }
            });
        })
        .catch(function(err) {
            console.log(err);
        }); 
});

// POST removing the note from the Notes collection
app.post('/unsaveNote', function (req, res) {
    // Using our Article model, create a new entry
    // This effectively passes the result object to the entry (and the title and link)
    let data = req.body;
    console.log("req.body: " + JSON.stringify(req.body, null, 2))
    // console.log("Article pulled: " + NewestArticles.findById(data.articleID))
    Note.findByIdAndRemove(data.noteID, 
        function(err,doc) {
            if (err) {
                console.log(err)
            } else {
                res.send(doc + "deleted!")
            }
        });
});

// A GET request to scrape the BBC World website
app.get("/scrape", function(req, res) {
    NewestArticles.remove({}, function(err, result){
        if (err){
            console.log(err)
        } else {
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
    }
        // Tell the browser that we finished scraping the text
        console.log("Done scraping!")
        // res.redirect("/newarticles")
    })
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
        console.log("hbsObj for rendering: " + JSON.stringify(hbsObject), null, 2);
        res.render("newscrapes", hbsObject);
      }
    });
});

// set the app to listen for a server connection
app.listen(port, function(){
    console.log('App listening on port ' + port)
})