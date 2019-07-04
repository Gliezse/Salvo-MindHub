var app = new Vue({
    el: "#app",
    data:{
        games:[],
        players:[],
        logged: false,
        user: {},
        filtro: 'all'
    },
    created(){
        this.load()
    },
    methods:{
        load: function(){
            $.get("/api/games")
            .done(function(datazo){
                app.games = datazo.games;
                app.user = datazo.user;
        
                //Si hay alguien loggeado hay que indicarselo al vue
                if(app.user != "guest"){
                    app.logged = true
                    $('#content').removeClass('d-none')
                }else{
                    app.logged = false
                    $('#login').removeClass('d-none')
                }
        
                init(datazo.games)
            })
        },   
        login: function(){
            let self= this

            $.post("/api/login", {
                email: $("#login-email").val(),
                password: $("#login-pwd").val()
            })
            .done(function () {
                console.log("Logged in")
                
                self.showGames();
                self.logged = true

                //Se vuelven a traer los datos con el jugador loggeado
            })
            .fail(function () {
                alert("Incorrect email or password.")
                $("#login-email").val(''),
                $("#login-pwd").val('')
            })
            .then(function(){
                $("#login-email").val(''),
                $("#login-pwd").val('')
            })
        },

        logout: function(){
            let self = this
            $.post('/api/logout')
            .done(function(){
                $('#content').removeClass('fadeIn')
                $('#content').addClass('fadeOut')

                $('#content').one('animationend',function(){
                    $('#content').addClass('d-none')
                    $('#login').removeClass('fadeOutUp')
                    $('#login').addClass('fadeInDown')
                    $('#login').removeClass('d-none')
                    self.load()
                })
            })
            .fail(function(error){
                console.log(error)
            })
        },

        signup: function(){

            let self = this

            let email = $("#signup-email").val()
            let name = $("#signup-name").val()
            let password = $("#signup-pwd").val()
            let passwordConf = $("#signup-pwd-conf").val()

            if(password != passwordConf){
                return alert("Passwords don't match")
            }

            $.post('/api/players',{
                email: email,
                name: name,
                password: password
            })
            .done(function(){
                alert("Registered")
                $("#signup-email").val("")
                $("#signup-name").val("")
                $("#signup-pwd").val("")
                $("#signup-pwd-conf").val("")
                self.showLogin();
            })
            .fail(function(){
                alert("Email Already Registered")
            })
        },

        showSignup: function(){
            let login = $('#login')
            let signup = $('#signup')

            login.removeClass('fadeInDown')
            login.addClass('fadeOutUp')

            login.one('animationend', function(){
                login.addClass('d-none')

                signup.removeClass('fadeOutUp')
                signup.addClass('fadeInDown')
                signup.removeClass('d-none')          
            

            })
        },
        showLogin: function(){
            let login = $('#login')
            let signup = $('#signup')

            signup.removeClass('fadeInDown')
            signup.addClass('fadeOutUp')
            
            signup.one('animationend', function(){ 
                signup.addClass('d-none')  

                login.removeClass('fadeOutUp')
                login.addClass('fadeInDown')
                login.removeClass('d-none')                
            })
        },

        showGames: function(){
            
            let self = this

            let login = $('#login')
            let content = $('#content')

            login.removeClass('fadeInDown')
            login.addClass('fadeOutUp')

            login.one('animationend', function(){
                login.addClass('d-none')
                content.removeClass('fadeOut')
                content.addClass('fadeIn')
                content.removeClass('d-none')
                self.load()
            })
        },


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
        },
        setFilter:function(param){
            let self = this
            $('#games').removeClass('fadeIn')
            $('#games').addClass('fadeOut faster')
            $('#games').one('animationend', function(){
                self.filtro = param
                $('#games').addClass('fadeIn')
                $('#games').removeClass('fadeOut')
            })
        }
    },
    computed:{
        filteredGames: function(){
            if(this.filtro == 'all'){
                return this.games
            }else if(this.filtro == 'player'){
                return this.playerGames
            }else if(this.filtro == 'joinable'){
                return this.joinableGames
            }else if(this.filtro == 'finished'){
                return this.finishedGames
            }
        },
        playerGames: function(){
            let self = this

            return this.games.filter( game =>{
                for(let gp in game.gamePlayers){
                    if(game.gamePlayers[gp].player.id == self.user.id){
                        return true
                    }
                }
            })
        },

        joinableGames: function(){
            return this.games.filter( game =>{
                if(game.gamePlayers.length == 1){
                    if(game.gamePlayers[0].player.id != this.user.id){
                        return true
                    }
                }

                return false
            })
        },

        finishedGames: function(){
            return this.games.filter( game => {
                if(game.gamePlayers[0].score != null){
                    return true
                }
            })
        }
    }    
})

function init(games){

    if(!app.logged){
        $('#login').removeClass('d-none')
    }

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

