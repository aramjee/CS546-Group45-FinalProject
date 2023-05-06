//Function to re-render Handlebars partial snippet post AJAX request
const renderHBSnippet = (sourceId, data, destId) => {
    let source = document.getElementById(sourceId).innerHTML;
    let template = Handlebars.compile(source);
    let context = data;
    let html = template(context);
    document.getElementById(destId).innerHTML = html;
}

(($) => {
    // Like/Dislike Gym AJAX request
    $(document).on('click','.btnLikeGym, .btnDislikeGym', (e) => {
        let gymId = $(e.target).data('gymid');
        let dynamicRoute = $(e.target).hasClass('btnLikeGym') ? 'like' : 'dislike';
        let url = `/gym/${gymId}/${dynamicRoute}`;

        $.ajax({
            type: "POST",
            url: url,
            complete: function(res){
                if(res.status === 200){
                    renderHBSnippet("like-dislike-template",res.responseJSON,"like-dislike-wrapper");
                }else{
                    console.log(res.status, res.responseText);
                }
            }
        });
    });

    // Add/Remove Gym to/from Favorites AJAX request
    $(document).on('click', "#btnAddToFav, #btnRemoveFromFav", (e) => {
        let gymId = $(e.target).data("gymid");
        let dynamicRoute = $(e.target).is('#btnAddToFav') ? 'add-to-fav' : 'delete-fav-gym';
        let url = `/user/${dynamicRoute}/${gymId}`;

        $.ajax({
            type: "POST",
            url: url,
            complete: function(res){
                if(res.status === 200){
                    let data = {
                        gym: res.responseJSON.gym,
                        gymIsFavorited: res.responseJSON.user && res.responseJSON.user && res.responseJSON.user.favGymList.includes(gymId)
                    };
                    renderHBSnippet("add-remove-fav-template", data, "fav-button-wrapper");
                }else{
                    console.log(res.status, res.responseText);
                }
            }
        });
    });
})(window.jQuery)