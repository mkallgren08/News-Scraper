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


})

function displayResults(articles) {
    console.log("Articles: " + articles)
  }
  
// 1: On Load
// ==========

