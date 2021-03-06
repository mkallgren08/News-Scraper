// ======================
//      Dependencies
// ======================

const mongoose = require("mongoose");
// Create a Schema class
const Schema = mongoose.Schema;

// Make the Article Schema here:
var NoteSchema = new Schema({
    // The link is another required string
    text: {
        type: String,
        required: true
    }
});

// Now we actually make the Article model using the ArticleSchema
const Note = mongoose.model("Note", NoteSchema);

// Export the model
module.exports = Note;