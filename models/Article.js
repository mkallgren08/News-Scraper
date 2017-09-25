// ======================
//      Dependencies
// ======================

const mongoose = require("mongoose");
// Create a Schema class
const Schema = mongoose.Schema;

// Make the Article Schema here:
var ArticleSchema = new Schema({
    // The title is a required string
    title: {
        type:String,
        required: true
    },
    // The link is another required string
    link: {
        type: String,
        required: true
    },
    // This saves one notes' ObjectID, and refers to the Note model
    notes: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

// Now we actually make the Article model using the ArticleSchema
const Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;