var app = new Vue({
    el: "#app",
    data:{
        datos:[]
    },
    
})

$(function(){
    
    function load(){
        $.get("/api/games")
        .done(function(datazo){
            app.datos = datazo;
        })
    }
    
    load();
})
