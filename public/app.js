// =====================================
//      News Scraper Modal Functionality
// =====================================
$(document).ready(function(){
    $('#myModal').on('hidden.bs.modal', function (e) {
        window.location.href = "/"
    }); 
    
    $('.saveArticle').on("click", function(){
        console.log("Click heard!")
        var sentData={};
        sentData.articleID = $(this).attr("data-id")
        console.log("articleID: " + sentData.articleID)
        
        $.ajax({
            type: "POST",
            url: "/save",
            data: sentData,
            success: function(){
                console.log("Sucess!")
            },
        })
    })

    $(".unsaveArticle").on("click", function(){
        console.log("Click heard!")
        var sentData={};
        sentData.articleID = $(this).attr("data-id")
        console.log("articleID: " + sentData.articleID)

        $.ajax({
            type: "POST",
            url: "/unsave",
            data: sentData,
            success: function(){
                console.log("Sucess!")
                window.location.replace("/saved")
            },
        })
    })

    $(".deleteNoteButton").on("click", function(){
        console.log("Click heard!")
        var sentData={};
        sentData.noteID = $(this).attr("data-id")
        console.log("noteID: " + sentData.noteID)

        $.ajax({
            type: "POST",
            url: "/unsaveNote",
            data: sentData,
            success: function(){
                console.log("Sucess!")
                window.location.replace("/saved")
            },
        })
    })

    $('#noteModal').on('show.bs.modal', function (e) {
       var articleId = $(".newNoteArticleId").val()
       
       // This gets any notes if they are saved
        $.ajax({
            method: 'GET',
            url: "/findArticle/" + articleId,
            success: function(result){
                console.log(result)
                console.log(result.notes)
                if (result.notes === null || result.notes === undefined){
                    console.log("Time to write a new note!")
                    $("#noteText").val('');
                }else {
                    $("#noteText").val(result.notes.text);
                    $(".deleteNoteButton").attr("data-id", result.notes._id)
                }
                
                // $.each(result.notes, function(err){
                //     // Build the new row
                //     var newRow = $("<div>");
                //     // Generate the note <p> tags with a col-10 wrapper
                //     var newTenCol = $("<div>");
                //     newTenCol.attr("class", "col-xs-10");
                //     var noteText = $("<p>");
                //     // set the text and append the p tag and wrapper to the row
                //     noteText.text($(this).text);
                //     console.log("text: " + $(this).text)
                //     newTenCol.append(noteText);
                //     newRow.append(newTenCol);
                //     // Generate the note delete buttons and their wrapper
                //     var newTwoCol =  $("<div>");
                //     newTwoCol.attr("class", "col-xs-2")
                //     var newDeleteNoteBtn = $("<button>")
                //     newDeleteNoteBtn.attr("class", "btn btn-danger deleteNote")
                //     // give the delete button a data-id value of the note's _id
                //     newDeleteNoteBtn.attr("data-id", result.notes._id)
                //     // append the button to the column and the column to the row
                //     newTwoCol.append(newDeleteNoteBtn)
                //     newRow.append(newTwoCol)
                //     $("#notesRow").append(newRow)
                //     // append the newRow to 
                // })           
            }, 
        })

    });


    $('.openModal').on("click", function(){
        var linkedArticleId = $(this).data('id');
        $(".newNoteArticleId").val( linkedArticleId );
        console.log(linkedArticleId)
    })

    
    $('.addNoteButton').on("click", function(){
        event.preventDefault()
        console.log("Click heard!")
        var sentData={};
        var articleId = $(".newNoteArticleId").val();

        sentData.text = $("#noteText").val().trim()
        console.log("Sent data: " + JSON.stringify(sentData))

        $.ajax({
            type: "POST",
            url: "/articles/" + articleId,
            data: sentData,
            success: function(result){
                console.log(result)
                window.location.replace("/saved")
            },
        })
    });


})

function displayResults(articles) {
    console.log("Articles: " + articles)
  }
  
// 1: On Load
// ==========

