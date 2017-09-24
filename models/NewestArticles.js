// ======================
//      Dependencies
// ======================

const mongoose = require("mongoose");
// Create a Schema class
const Schema = mongoose.Schema;

// Make the Article Schema here:
var NewestArticlesSchema = new Schema({
    // The title is a required string
    title: {
        type:String,
        required: true
    },
    // The link is another required string
    link: {
        type: String,
        required: true
    }
});

// Now we actually make the NewestArticles model using the NewestArticlesSchema
const NewestArticles = mongoose.model("NewestArticles", NewestArticlesSchema);

// Export the model
module.exports = NewestArticles;