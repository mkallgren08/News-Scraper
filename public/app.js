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

    $('#noteModal').on('show.bs.modal', function (e) {
       var articleId = $("#newNoteArticleId").val()
       
        $.ajax({
            method: 'GET',
            url: "/findArticle/" + articleId,
            success: function(result){
                console.log(result)
                console.log(result.notes)
                $("#noteText").val(result.notes.text);        
            }, 
        })

    });


    $('.addNoteButton').on("click", function(){
        var linkedArticleId = $(this).data('id');
        $("#newNoteArticleId").val( linkedArticleId );
        console.log(linkedArticleId)
    })

    
    $('#addNoteButton').on("click", function(){
        event.preventDefault()
        console.log("Click heard!")
        var sentData={};
        var articleId = $("#newNoteArticleId").val();

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

