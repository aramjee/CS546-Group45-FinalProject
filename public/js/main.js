(($) => {
    // Like Gym AJAX request
    $(".btnLikeGym").on('click', () => {
        let gymId = $(".btnLikeGym").data("gymid");
        let likecount = parseInt($(".btnLikeGym").attr("data-likecount"));

        let url = `/gym/${gymId}/like`;
        $.ajax({
            type: "POST",
            url: url,
            complete: function(res, xhr){
                if(res.status === 200){
                    likecount++;
                    $(".btnLikeGym").val(`Like (${likecount})`);
                    $(".btnLikeGym").attr('data-likecount',likecount)
                }else{
                    console.log(res.status, res.responseText);
                }
            }
        });
    });

    // Dislike Gym AJAX Request
    $(".btnDislikeGym").on('click', () => {
        let gymId = $(".btnDislikeGym").data("gymid");
        let dislikecount = parseInt($(".btnDislikeGym").attr("data-dislikecount"));

        let url = `/gym/${gymId}/dislike`;
        $.ajax({
            type: "POST",
            url: url,
            complete: function(res, xhr){
                if(res.status === 200){
                    dislikecount++;
                    $(".btnDislikeGym").val(`Dislike (${dislikecount})`);
                    $(".btnDislikeGym").attr('data-dislikecount',dislikecount)
                }else{
                    console.log(res.status, res.responseText);
                }
            }
        });
    });

    // Add to Favorites AJAX request - Pending to complete
    $("#btnAddToFav").on('click', () => {
        let gymId = $("#btnAddToFav").data("gymid");

        let url = `/user/add-to-fav/${gymId}`;
        $.ajax({
            type: "POST",
            url: url,
            complete: function(res, xhr){
                if(res.status === 200){
                    console.log(res);
                }else{
                    console.log(res.status, res.responseText);
                }
            }
        });
    });

     // Remove from Favorites AJAX request - Pending to complete
     $("#btnRemoveFromFav").on('click', () => {
        let gymId = $("#btnRemoveFromFav").data("gymid");

        let url = `/user/delete-fav-gym/${gymId}`;
        $.ajax({
            type: "POST",
            url: url,
            complete: function(res, xhr){
                if(res.status === 200){
                    console.log(res);
                }else{
                    console.log(res.status, res.responseText);
                }
            }
        });
    });
})(window.jQuery)