var app = new Vue({
    el: "#app",
    data:{
        games:[],
        players:[],
        status: "Not Logged",
        logged: false,
        user: {}
    },
    methods:{
        isAPlayer: function(gpList){

            for(var i in gpList){
                if(gpList[i].player.id == this.user.id){
                    return true
                }
            }
            
 
            return false
        },
        enterGame: function(gpList){
            for(var i in gpList){
                console.log("loop")
                if(gpList[i].player.id == this.user.id){
                    console.log("/web/game.html?gp="+gpList[i].id)
                    window.location.href = "/web/game.html?gp="+gpList[i].id
                }
            }
        },
        createNewGame: function(){
            $.post("/api/games")
            .done(function(response){window.location.href = "/web/game.html?gp="+response.gpid})
            .fail(function(){(alert("You must be logged in in order to create a new game!"))})
        },
        joinGame: function(gId){
            $.post("/api/game/"+gId+"/players")
            .done(function(response){window.location.href = "/web/game.html?gp="+response.gpid})
            .fail(function(response){console.log(response.status)})
        }
    }    
})

function load(){
    $.get("/api/games")
    .done(function(datazo){
        app.games = datazo.games;
        app.user = datazo.user;

        //Si hay alguien loggeado hay que indicarselo al vue
        if(app.user != "guest"){
            app.status = "Logged"
            app.logged = true
        }

        init(datazo.games)
    })
}

function init(games){

    var uniquePlayers = []
    
    games.forEach(function(game){
        var gp = game.gamePlayers

        gp.forEach(function(gp){
            var player = gp.player

            if(uniquePlayers == []){
                uniquePlayers.push(player)
            }else{
                var isUnique = true
                for(i in uniquePlayers){
                    if(uniquePlayers[i].id == player.id){
                        isUnique = false
                    }
                }
                if(isUnique){
                    uniquePlayers.push(player)
                }
            }

            
        })
    })

    for(i in uniquePlayers){

        uniquePlayers[i].won = 0
        uniquePlayers[i].tied = 0
        uniquePlayers[i].lost = 0
        uniquePlayers[i].total = 0


        games.forEach(function(game){
            var gps = game.gamePlayers

            gps.forEach(function(gp){
                if(gp.player.id == uniquePlayers[i].id){
                    if(gp.score != null){
                        if(gp.score.score == 1.0){
                            uniquePlayers[i].won += 1
                        }else if(gp.score.score == 0.5){
                            uniquePlayers[i].tied += 1
                        }else{
                            uniquePlayers[i].lost += 1
                        }

                        uniquePlayers[i].total += 1

                    }                  
                }
                
            })

        })
    }
    app.players = uniquePlayers    
}

//Se cargan los datos desde la base de datos por primera vez
load();

$('#login-form').submit(function () {
    $.post("/api/login", {
        email: $("#login-email").val(),
        password: $("#login-pwd").val()
    })
        .done(function () {
            console.log("Logged in")
            
            app.logged = true
            app.status = "Logged"

            //Se vuelven a traer los datos con el jugador loggeado
            load()
        })
        .fail(function () {
            alert("Incorrect email or password.")
        })
})

$("#signup-form").submit(function(){
    $.post('/api/players',{
        email: $("#signup-email").val(),
        name: $("#signup-name").val(),
        password: $("#signup-pwd").val()
    })
        .done(function(){
            alert("Registered")
        })
        .fail(function(){
            alert("Email Already Registered")
        })
})

$('#logout-form').submit(function () {
    $.post('/api/logout')
        .done(function () {
            console.log("Logged out")
            app.logged = false
            app.status = "Not Logged"
            $("#login-email").val("")
            $("#login-pwd").val("")

            //Se actualizan los datos locales
            load()
        })
        .fail(function () {
            console.log("Logout error")
        })
})

