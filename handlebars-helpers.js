const helpers = {
    ifEquals: function(string1, string2, options){
        return string1 === string2 ? options.fn(this) : options.inverse(this);
    },
    ifExistsInArray: function(el, arr, options){
        return arr.includes(el) ? options.fn(this) : options.inverse(this);
    },
    showRating: function(rating){
        let html='';
        for(let i=1; i<=5; i++){
            if(i<=rating){
                html += '<span class="fa fa-star checked"></span>'
            }else{
                html += '<span class="fa fa-star"></span>'
            }
        }
        return html;
    }
}
export default helpers;
