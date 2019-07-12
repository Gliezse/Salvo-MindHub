var app = new Vue({
    el: "#app",
    data:{
        datos:[],
        gpId:"",
        player1: {},
        player2: {},
        grid: null,
        enemyGrid: null,
        selectedCells: 0,
        turn:0,
        playersTurn:true,
        playerHits: [],
        enemyHits: [],
        enemyPetsLeft:{
            meowrice:5,
            nashiro:4,
            george:3,
            coaly:3,
            oreo:2
        },
        playerPetsLeft:{
            meowrice:5,
            nashiro:4,
            george:3,
            coaly:3,
            oreo:2
        },
        gameState: "",
        dotsAux: 0,
        firstLoad: true
        //uncomment team: 'none'
    },
    //TODO: Add gamestate functions
    created(){
        let self = this
        const params = new URLSearchParams(window.location.search);
        this.gpId = params.get('gp')

        setInterval(self.load,1000)
        setInterval(self.dots,500)
    },
    methods:{
        load:function(){
            let self = this
            $.get("/api/game_view/" + this.gpId)
            .done(function (datazo) {
                if(datazo.gamestate != self.gameState){         
                    self.setAll(datazo)
                }
            })
            .fail(function(response){
                alert(JSON.parse(response.responseText).error);
            })

        },

        setAll: function(datazo){
            let self = this

            this.datos = datazo;
            this.gameState = datazo.gamestate
            this.setPlayers()
            this.setTurn()
            this.setHits()
            this.setGrids()

            //uncomment
            /*
            let body = $('#game-body')
            if(!body.hasClass('team-cats') || !body.hasClass('team-dogs')){
                if(this.team == 'CATS'){
                    body.addClass('to-cats')

                    body.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                        body.removeClass('to-cats')
                        body.addClass('team-cats')

                    })

                }else{
                    body.addClass('to-dogs')

                    body.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                        body.removeClass('to-dogs')
                        body.addClass('team-dogs')

                    })
                }
            }
            */

            
            $('#info').addClass('tada')
            $('#info').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                $('#info').removeClass('tada')
            })



            let waitingText = $("#waiting-div h1").get();
            let initialText = $('#initial-text').get()

            if(this.gameState == 'WAITING_OPPONENT_TO_JOIN'){
                $('#waiting-div h1').removeClass('d-none')
            }
            
            if(this.gameState == 'PLACING_PETS'){
                
                
                if($(waitingText).hasClass('d-none')){
                    $("#initial-grid-cont").removeClass('d-none')
                }else{
                    $(waitingText).removeClass('bounceIn')
                    $(waitingText).html("Opponent found!")
                    $(waitingText).addClass('tada')

                    $(waitingText).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                        if($(waitingText).hasClass('tada')){
                            $(waitingText).addClass('bounceOutDown') 
                            $(waitingText).removeClass('tada')
                        }else if($(waitingText).hasClass('bounceOutDown')){
                            $("#initial-grid-cont").removeClass('d-none')
                        }
                    });
                }

                $(initialText).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                    if($(initialText).hasClass('fadeIn')){
                        $(initialText).removeClass('delay-1s')
                        $(initialText).removeClass('fadeIn')
                        $(initialText).addClass('fadeOut')
                    }else{
                        $(initialText).removeClass('fadeOut')
                        $(initialText).html("Place your pets as your will! When you are ready click 'Place'")
                        $(initialText).addClass('fadeIn')
                    }
                })
                
            }

            if(this.gameState == 'OPPONENT_PLACING_PETS'){
                if(!$("#initial-grid-cont").hasClass('d-none')){
                    $('#initial-grid-cont').addClass('d-none')
                }

                this.dotsAux = 0

                $(waitingText).html('Wait until '+this.enemyPlayer().name+' places their pets')
                $(waitingText).attr('class','animated bounceIn')

            }

            if(this.gameState == 'PLACING_SALVOES' || this.gameState == 'WAITING_OPPONENT_SALVOES'){
                if ($('#initial-grid-cont').children().length != 0){
                    $("#initial-grid-cont").addClass('animated')
                    $("#initial-grid-cont").addClass('fadeOut')
                    
                    $('#initial-grid-cont').html(" ")
                    this.firstLoad = true
                    this.setAll(this.datos)
                }else{
                    if(!$(waitingText).hasClass('d-none')){
                        $(waitingText).html("Done! <br> Game begins!")
                        $(waitingText).attr('class', 'animated tada')

                        $(waitingText).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                            $(waitingText).attr('class', 'animated bounceOutDown')

                            $(waitingText).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                                $(waitingText).attr('class', 'd-none')
                                $('#both-grids-cont').removeClass('d-none')
                            })
                        })
                    }else{
                        $('#both-grids-cont').removeClass('d-none')
                    }
                }


                $('.pet').first().one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                    if(self.gameState == 'PLACING_SALVOES'){

                        $('#shoot-button').addClass('d-none')

                        $('.enemy-grid').first().removeClass('small-grid')
                        $('.ally-grid').first().addClass('small-grid')

                        if($('#ally-turn-marker').hasClass('d-none')){
                            $('#ally-turn-marker').removeClass('d-none')
                        }else{
                            $('#ally-turn-marker').removeClass('fadeOut')
                            $('#ally-turn-marker').addClass('fadeIn')
                        }

                        if(!$('#enemy-turn-marker').hasClass('d-none')){
                            $('#enemy-turn-marker').addClass('fadeOut')
                        }
                        
                    }else{

                        $('.ally-grid').first().removeClass('small-grid')
                        $('.enemy-grid').first().addClass('small-grid')

                        if ($('#enemy-turn-marker').hasClass('d-none')) {
                            $('#enemy-turn-marker').removeClass('d-none')
                        } else {
                            $('#enemy-turn-marker').removeClass('fadeOut')
                            $('#enemy-turn-marker').addClass('fadeIn')
                        }

                        if (!$('#ally-turn-marker').hasClass('d-none')) {
                            $('#ally-turn-marker').addClass('fadeOut')
                        }
                        
                    }
                })
            }

            if(this.gameEnded()){
                if ($('#initial-grid-cont').children().length != 0){
                    $("#initial-grid-cont").addClass('animated')
                    $("#initial-grid-cont").addClass('fadeOut')
                    
                    $('#initial-grid-cont').html(" ")
                    this.firstLoad = true
                    this.setAll(this.datos)
                }else{
                    if($('#both-grids-cont').hasClass('d-none')){
                        $('#both-grids-cont').removeClass('d-none')
                        $('#both-grids-cont').addClass('finished-game-grids')
                        $('.text-above-grids').addClass('d-none')

                        $('#game-ended-state').html('This game has ended!')
                        
                        if(this.gameState == 'WON'){
                            $('#game-ended-subtext').html("You won! You scared all your opponent's pets")
                        }else if(this.gameState == 'LOST'){
                            $('#game-ended-subtext').html("You lost! Your opponent scared all your pets")
                        }else{
                            $('#game-ended-subtext').html("Tied! Both you and your opponent scared each other's pets!")
                        }

                    }else{
                        $('.text-above-grids').addClass('d-none')
                        $('.ally-grid').first().removeClass('small-grid')
                        $('.enemy-grid').first().removeClass('small-grid')
                        $('#both-grids-cont').addClass('finished-game-grids')

                        if(this.gameState == 'WON'){
                            $('#game-ended-subtext').html("You scared all your opponent's pets")
                        }else if(this.gameState == 'LOST'){
                            $('#game-ended-subtext').html("Your opponent scared all your pets")
                        }else{
                            $('#game-ended-subtext').html("Both you and your opponent scared each other's pets!")
                        }
                    }

                    $('.go-back').addClass('animated')
                    $('.go-back').addClass('bounceOut')
                    $('#game-ended').removeClass('d-none')
                }
            }
        },

        setHits: function(){
            if(this.datos.gameplayers.length > 1){
                if(this.datos.hits[0].length > 1){
                    this.datos.hits[0].sort(function(x,y){
                        if (x.turn < y.turn)
                            return 1;
                        if (x.turn > y.turn)
                            return -1;
                        return 0;
                    })
                }
                if(this.datos.hits[1].length > 1){
                    this.datos.hits[1].sort(function(x,y){
                        if (x.turn < y.turn)
                            return 1;
                        if (x.turn > y.turn)
                            return -1;
                        return 0;
                    })
                }

                if(this.datos.hits[0].length > 0){

                    if(this.datos.hits[0][0].gpid == this.gpId){
                        this.playerHits = this.datos.hits[0]
                        this.enemyHits = this.datos.hits[1]
                    }else{
                        this.playerHits = this.datos.hits[1]
                        this.enemyHits = this.datos.hits[0]
                    }
                }else if(this.datos.hits[1].length > 0){
                    if(this.datos.hits[1][0].gpid = this.gpId){
                        this.playerHits = this.datos.hits[1]
                        this.enemyHits = this.datos.hits[0]
                    }else{
                        this.playerHits = this.datos.hits[1]
                        this.enemyHits = this.datos.hits[0]
                    }
                }
            }
            
        },

        setTurn: function(){
            let self = this

            let playerSalvoes = this.datos.salvoes.filter(function (sub) {
                if (sub.player == self.gpId) {
                    return sub
                }
            })

            if(playerSalvoes.length == 0){
                this.turn = 1
            }else{
                this.turn = Math.max(...playerSalvoes.map(salvo => salvo.turn)) + 1
            }

        },

        setPlayers: function(){
            if (this.datos.gameplayers.length == 1) {
                this.player1.name = this.datos.gameplayers[0].player.name
                this.player1.id = this.datos.gameplayers[0].id

                //uncomment this.team = this.datos.gameplayers[0].team
            } else {
                p1n = this.datos.gameplayers[0].player.name
                p2n = this.datos.gameplayers[1].player.name
                p1id = this.datos.gameplayers[0].id
                p2id = this.datos.gameplayers[1].id
                
                //uncomment p1team = this.datos.gameplayers[0].team
                //uncomment p2team = this.datos.gameplayers[1].team
                 

                if (p1id < p2id) {
                    this.player1.name = p1n
                    this.player1.id = p1id
                    //uncomment this.player1.team = p1team

                    this.player2.name = p2n
                    this.player2.id = p2id    
                    //uncomment this.player2.team = p2team
                }else{
                    this.player1.name = p2n
                    this.player1.id = p2id
                    //uncomment this.player1.team = p2team

                    this.player2.name = p1n
                    this.player2.id = p1id
                    //uncomment this.player2.team = p1team
                }
                /*
                uncomment
                if(this.player1.id == this.gpId){
                    this.team = this.player1.team
                }else{
                    this.team = this.player2.team
                }
                */

            }
        },

        setGrids: function () {
            let gridCont = $(".ally-grid").first().html("")
            let enemyGridCont = $(".enemy-grid").first().html("")

            let allyAppend = '<div id="grid" class="grid-stack grid-stack-10"></div>'
            let enemyAppend = '<div id="enemy-grid" class="grid-stack grid-stack-10"></div>'

            gridCont.append(allyAppend)
            enemyGridCont.append(enemyAppend)

            pets = this.datos.pets
            salvoes = this.datos.salvoes

            var options = {
                //Dimensiones de la grilla
                width: 10,
                height: 10,
                //Separacion vertical entre widgets
                verticalMargin: 0,
                //Altura de las celdas
                cellHeight: 45,
                //Desabilitamos que los widgets puedan ser resizeados
                disableResize: true,
                //Widgets flotantes
                float: true,
                //Permite que el widget ocupe mas de una columna
                disableOneColumnMode: true,
                //Columna estatica, true/false
                staticGrid: false,
                //Anims
                animate: false
            }

            if (this.gameState != "PLACING_PETS") {
                options.staticGrid = true
            }

            $("#grid").html("")
            $("#enemy-grid").html("")

            $(".grid-stack").gridstack(options)

            this.grid = $('#grid').data('gridstack');
            this.enemyGrid = $('#enemy-grid').data('gridstack')


            this.createGrid(11, $(".ally-grid"), 1)
            this.createGrid(11, $(".enemy-grid"), 2)

            this.loadSalvoes(salvoes, pets)
            this.loadPets(pets, this.grid)

        },

        createGrid: function (size, element, gridN) {

            let wrapper = document.createElement('DIV')
            wrapper.classList.add('grid-wrapper')

            for (let i = 0; i < size; i++) {
                let row = document.createElement('DIV')
                row.classList.add('grid-row')
                row.id = `${gridN}-grid-row${i}`
                wrapper.appendChild(row)

                for (let j = 0; j < size; j++) {
                    let cell = document.createElement('DIV')
                    cell.classList.add('grid-cell')
                    if (i > 0 && j > 0){
                        cell.id = `${gridN}-${i - 1}${j - 1}`

                        if(gridN == 2){
                            cell.classList.add("enemy-cell")
                            if(this.gameState == 'PLACING_SALVOES'){
                                cell.setAttribute('onClick',`app.placeSalvo("${cell.id}")`)
                                cell.classList.add('selectable-enemy-cell')
                            }
                        }
                    }

                    if (j === 0 && i > 0) {
                        let textNode = document.createElement('SPAN')
                        textNode.innerText = String.fromCharCode(i + 64)
                        cell.appendChild(textNode)
                        cell.classList.add('grid-marks')
                    }
                    if (i === 0 && j > 0) {
                        let textNode = document.createElement('SPAN')
                        textNode.innerText = j
                        cell.appendChild(textNode)
                        cell.classList.add('grid-marks')
                    }

                    row.appendChild(cell)
                }
            }

            element.append(wrapper)
        },

        loadPets: function (pets, grid) {
            let self = this
            if (pets.length == 0 && this.datos.gameplayers[1]) {
                pets = [{
                    "type": "Meowrice",
                    "locations": ["A1", "A2", "A3", "A4", "A5"]
                }, {
                    "type": "Nashiro",
                    "locations": ["C1", "C2", "C3", "C4"]
                }, {
                    "type": "George",
                    "locations": ["E1", "E2", "E3"]
                }, {
                    "type": "Coaly",
                    "locations": ["G1", "G2", "G3"]
                }, {
                    "type": "Oreo",
                    "locations": ["I1", "I2"]
                }]
            }

            pets.forEach(function (pet) {
                var loc = pet.locations                    //Lista de cells donde esta el barco

                loc.sort(function (x, y) {
                    if (x.charCodeAt(0) == y.charCodeAt(0)) {
                        if(parseInt(x.slice(1)) > parseInt(y.slice(1))){
                            return 1
                        }else{
                            return -1
                        }
                    } else {
                        if(x.charCodeAt(0) > y.charCodeAt(0)){
                            return 1
                        }else{
                            return -1
                        }
                    }
                })
                     
                var firstCell = loc[0]                      //La primera de estas cells
                var lastCell = loc[loc.length - 1]          //La ultima de las mismas

                let x = parseInt(firstCell.slice(1)) - 1   //X inicial
                let y = firstCell.charCodeAt(0) - 65          //Y inicial
                let w, h                                     //ancho, alto

                xLast = parseInt(lastCell.slice(1)) - 1    //X de la ultima cell
                yLast = lastCell.charCodeAt(0) - 65           //Y "   "   "   "   "

                //Verificar qué sentido tiene la nave
                if (yLast == y) {             //Si la ultima Y es igual a la primera Y, significa que su orientacion es vertical
                    h = 1                   //La altura es 1
                    w = xLast - x + 1       //El ancho es la diferencia entre la primera y la ultima X
                } else {                      //Sino, se sabe que su orientacion es horizontal
                    w = 1                   //El ancho es 1
                    h = yLast - y + 1       //La altura es la diferencia entre la primera y la ultima Y
                }

                var orientacion = ""

                if (h == 1) {
                    orientacion = "Horizontal"
                } else {
                    orientacion = "Vertical"
                }

                let classes = `grid-stack-item-content pet pet${orientacion} ${pet.type}${orientacion} animated`

                if(self.gameState == 'PLACING_PETS'){
                    classes += " fadeIn delay-3s"
                }else{
                    for(let playerPet in self.playerPetsLeft){
                        if(playerPet == pet.type.toLowerCase()){
                            if(self.playerPetsLeft[playerPet] != 0){
                                if(self.firstLoad){
                                    classes += " bounceIn delay-1s"
                                }else{
                                    classes += " bounce delay-1s fast"
                                }
                            }else{
                                if(self.firstLoad){
                                    classes += " fadeIn delay-1s"
                                }else{
                                    classes += " flash delay-1s faster"
                                }
                            }
                            
                        }
                    }
                            
                }


                grid.addWidget($(`<div id="${pet.type}" class="pet2"><div class="${classes}"></div><div/>`),
                    x, y, w, h); //element,x,y,width,height

            })
            if(self.firstLoad){
                self.firstLoad = false
            }

            $(".pet2").dblclick(function () {
                if (app.datos.pets.length != 0) {
                    return
                } else {
                    let petType = $(this).attr("id")
                    let cells = 0

                    if (petType == "Meowrice") {
                        cells = 5
                    } else if (petType == "Nashiro") {
                        cells = 4
                    } else if (petType == "George" || petType == "Coaly") {
                        cells = 3
                    } else {
                        cells = 2
                    }

                    app.rotatePets(petType, cells)
                }

            })

        },

        loadSalvoes: function (salvoes, pets) {
            this.enemyPetsLeft = {
                meowrice:5,
                nashiro:4,
                george:3,
                coaly:3,
                oreo:2
            }
            this.playerPetsLeft = {
                meowrice:5,
                nashiro:4,
                george:3,
                coaly:3,
                oreo:2
            }

            let self = this

            var locations = pets.map(sh => { return sh.locations })

            playerSalvoes = salvoes.filter(function (sub) {
                if (sub.player == self.gpId) {
                    return sub
                }
            })
            enemySalvoes = salvoes.filter(function (sub) {
                if (sub.player != self.gpId) {
                    return sub
                }
            })

            let playersLastTurn = 0
            let opponentsLastTurn = 0

            playerSalvoes.forEach(function (sub) {
                for (loc in sub.locations) {

                    x = parseInt(sub.locations[loc].slice(1)) - 1
                    y = sub.locations[loc].charCodeAt(0) - 65

                    cell = $(`#2-${y}${x}`)

                    cell.addClass('salvoed')
                    cell.removeClass('selectable-enemy-cell')

                    turn = document.createElement('SPAN')
                    turn.innerText = sub.turn

                    cell.append(turn)

                    if(sub.turn > playersLastTurn){
                        playersLastTurn=sub.turn
                    }


                    self.playerHits.forEach(function(hit){
                        if(sub.locations[loc] == hit.locHit){
                            cell.addClass('bg-red')

                            if(hit.petHit == "Meowrice"){
                                self.enemyPetsLeft.meowrice -= 1
                            }else if(hit.petHit == "Nashiro"){
                                self.enemyPetsLeft.nashiro -= 1
                            }else if(hit.petHit == "George"){
                                self.enemyPetsLeft.george -= 1
                            }else if(hit.petHit == "Coaly"){
                                self.enemyPetsLeft.coaly -= 1
                            }else{
                                self.enemyPetsLeft.oreo -= 1
                            }
                        }
                    })
                }
            })
            enemySalvoes.forEach(function (sub) {
                for (loc in sub.locations) {

                    x = parseInt(sub.locations[loc].slice(1)) - 1
                    y = sub.locations[loc].charCodeAt(0) - 65

                    cell = $(`#1-${y}${x}`)

                    cell.addClass('salvoed')

                    locations.forEach(function (locs) {
                        locs.forEach(function (loc) {
                            xAux = parseInt(loc.slice(1)) - 1
                            yAux = loc.charCodeAt(0) - 65


                            if (xAux == x && yAux == y) {
                                cell.addClass('bg-red')
                            }
                        })
                    })

                    self.enemyHits.forEach(function(enHit){
                        if(enHit.locHit == sub.locations[loc]){
                            if(enHit.petHit == "Meowrice"){
                                self.playerPetsLeft.meowrice -= 1
                            }else if(enHit.petHit == "Nashiro"){
                                self.playerPetsLeft.nashiro -= 1
                            }else if(enHit.petHit == "George"){
                                self.playerPetsLeft.george -= 1
                            }else if(enHit.petHit == "Coaly"){
                                self.playerPetsLeft.coaly -= 1
                            }else{
                                self.playerPetsLeft.oreo -= 1
                            }
                        }
                    })


                    turn = document.createElement('SPAN')
                    turn.innerText = sub.turn

                    cell.append(turn)

                    if(sub.turn > opponentsLastTurn){
                        opponentsLastTurn = sub.turn
                    }
                }
            })

        },

        rotatePets: function (petType, cells) {

            let pet = $(`#${petType}`)

            //Arreglar en base al rodri code
            let x = +($(pet).attr('data-gs-x'))
            let y = +($(pet).attr('data-gs-y'))
            let w = +($(pet).attr('data-gs-width'))
            let h = +($(pet).attr('data-gs-height'))

            if (w > h) {

                if (y + w - 1 > 9) {
                    return alert("Be careful, you are going to fall off the table!")
                }

                for (var i = 1; i < w; i++) {
                    if (!this.grid.isAreaEmpty(x, y + i)) {
                        return alert("You are going to crash another pet if you rotate that way.")
                    }
                }


                if (y + cells - 1 < 10) {
                    this.grid.resize($(pet), 1, cells);
                    $(pet).children().removeClass(`${petType}Horizontal`);
                    $(pet).children().addClass(`${petType}Vertical`);
                    $(pet).children().removeClass(`petHorizontal`);
                    $(pet).children().addClass(`petVertical`);
                } else {
                    this.grid.update($(pet), null, 10 - cells)
                    this.grid.resize($(pet), 1, cells);
                    $(pet).children().removeClass(`${petType}Horizontal`);
                    $(pet).children().addClass(`${petType}Vertical`);
                    $(pet).children().removeClass(`petHorizontal`);
                    $(pet).children().addClass(`petVertical`);
                }
            } else {

                if (x + h - 1 > 9) {
                    return alert("Be careful, you are going to fall off the table!")
                }
                for (var i = 1; i < h; i++) {
                    if (!this.grid.isAreaEmpty(x + i, y)) {
                        return alert("You are going to crash another pet if you rotate that way.")
                    }
                }

                if (x + cells - 1 < 10) {
                    this.grid.resize($(pet), cells, 1);
                    $(pet).children().addClass(`${petType}Horizontal`);
                    $(pet).children().removeClass(`${petType}Vertical`);
                    $(pet).children().addClass(`petHorizontal`);
                    $(pet).children().removeClass(`petVertical`);
                } else {
                    this.grid.update($(pet), 10 - cells)
                    this.grid.resize($(pet), cells, 1);
                    $(pet).children().addClass(`${petType}Horizontal`);
                    $(pet).children().removeClass(`${petType}Vertical`);
                    $(pet).children().addClass(`petHorizontal`);
                    $(pet).children().removeClass(`petVertical`);
                }

            }


        },
        
        placePets: function(){
            if(this.datos.gameplayers.length == 1){
                return alert("You can only place pets after the player 2 joins!")
            }

            let data = []

            $(".grid-stack-item").get().forEach(function(pet){

                let cells = []

                let x = parseInt($(pet).attr('data-gs-x'))
                let y = parseInt($(pet).attr('data-gs-y'))
                let w = parseInt($(pet).attr('data-gs-width'))
                let h = parseInt($(pet).attr('data-gs-height'))

                let xAux = x+1;
                let yAux = y+65;
                let petType = $(pet).attr('id')

                if(w>h){
                    for(var i = 0 ; i < w ; i++){
                        cells.push(String.fromCharCode(yAux) + (xAux+i))
                    }
                }else{
                    for(var i = 0 ; i < h ; i++){
                        cells.push(String.fromCharCode(yAux+i) + (xAux))
                    }
                }
                data.push({
                    "type":petType,
                    "locations":cells
                })
            })

            $.post({
                url:"/api/games/players/"+app.gpId+"/pets",
                data: JSON.stringify(data),
                dataType: "text",
                contentType: "application/json"
            })
            .done(function(response){

                $("#initial-grid-cont").addClass('animated')
                $("#initial-grid-cont").addClass('fadeOut')

                $("#initial-grid-cont").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                    $('#initial-grid-cont').html(" ")
                    app.load()
                })
                
            })
            .fail(function(response){
                alert(JSON.parse(response.responseText).error)
            })
        },

        placeSalvo: function(cellId){
            if(this.gameState == "PLACING_SALVOES"){
                let cell = $(`#${cellId}`)
                if($(cell).hasClass("salvoed")){
                    return
                }
                
                if($(cell).hasClass("preselected-salvo")){
                    $(cell).removeClass("preselected-salvo")
                    $(cell).empty();
                    this.selectedCells -= 1;
                    $('#shoot-button').removeClass('bounceIn')
                    $('#shoot-button').addClass('bounceOut')
                }else{
                    if(this.selectedCells == 2){
                        alert("you can only select 2 cells per turn!")
                    }else{
                        $(cell).append('<div class="salvo"></div>')
                        $(cell).addClass("preselected-salvo")
                        this.selectedCells += 1;

                        if(this.selectedCells == 2){
                            if($('#shoot-button').hasClass('d-none')){
                                $('#shoot-button').removeClass('d-none')
                            }else{
                                $('#shoot-button').removeClass('bounceOut')
                                $('#shoot-button').addClass('bounceIn')
                            }
                            
                        }
                    }
                }
            }else{
                if(this.gameState == "WAITING_OPPONENT_TO_JOIN"){
                    return alert("You can't place salvoes if there isn't any opponent!")
                }
                if(this.gameState == "PLACING_PETS"){
                    return alert("You can't place salvoes if you haven't placed any pet!")
                }
                return alert("You can't place salvoes if it isn't your turn!")
                
                
            }
        },

        shootSalvoes: function(){
            let salvo = {
                turn: this.turn
            }
            let locations = []
            let cells = $(".preselected-salvo").get()

            cells.forEach(function(cell){
                let cellId = $(cell).attr("id")
                let cellRow = String.fromCharCode(parseInt((cellId.charAt(2)))+65)
                let cellCol = parseInt(cellId.charAt(3))+1                

                locations.push(cellRow+cellCol)
            })

            salvo.locations = locations

            self = this
            $.post({
                url:"/api/games/players/"+app.gpId+"/salvoes",
                data: JSON.stringify(salvo),
                dataType: "text",
                contentType: "application/json"
            })
            .done(function(response){
                self.selectedCells = 0
                self.load()
            })
            .fail(function(response){
                alert(JSON.parse(response.responseText).error)
            })
            
        },

        logout: function(){
            $.post('/api/logout')
                .done(function () {
                    window.location.href = "/web/games.html"
                })
                .fail(function () {
                    alert("Logout error")
                })
        },

        back: function(){
            window.location.href = "/web/games.html"
        },
        gameStarted: function(){
            if (this.gameState != "WAITING_OPPONENT_TO_JOIN" && this.gameState != "PLACING_PETS" && this.gameState != "OPPONENT_PLACING_PETS") {
                return true
            }
            return false
        },
        gameEnded: function(){
            if(this.gameState == 'WON' || this.gameState == 'LOST' || this.gameState == 'TIED'){
                return true
            }
            return false
        },

        dots: function () {
            let text = $(".centro h1").get()
            if(this.gameState == 'WAITING_OPPONENT_TO_JOIN' || this.gameState == 'OPPONENT_PLACING_PETS'){
                if(this.dotsAux < 3){
                    $(text).html($(text).html() + ".")
                    this.dotsAux += 1
                }else{
                    $(text).html($(text).html().slice(0, $(text).html().length-3))
                    this.dotsAux = 0
                }
            }
            
        },
        
        
        currPlayer:function(){
            if(this.player1.id == this.gpId){
                return this.player1
            }else{
                return this.player2
            }
        
        },

        enemyPlayer:function(){
            if(this.player1.id != this.gpId){
                return this.player1
            }else{
                return this.player2
            }
        }
    },
    computed:{
        state: function(){
            if(this.gameState == 'WAITING_OPPONENT_TO_JOIN'){
                return 'Waiting for an opponent to join the game...'
            }else if(this.gameState == 'PLACING_PETS'){
                return 'Place your pets!'
            }else if(this.gameState == 'OPPONENT_PLACING_PETS'){
                return 'Wait until your opponent places their pets!'
            }else if(this.gameState == 'PLACING_SALVOES'){
                return "It's your turn, place your salvoes in your opponent grid!"
            }else if(this.gameState == 'WAITING_OPPONENT_SALVOES'){
                return "It's your opponent turn"
            }else if(this.gameState == 'WON'){
                return "You won! Well played!"
            }else if(this.gameState == 'LOST'){
                return "Oh no, you lost!"
            }else if(this.gameState == 'TIED'){
                return 'Tied game! Both win!'
            }
        },

        allyPetsLeftQ: function(){
            let aux = 5;

            let values = Object.values(this.playerPetsLeft);

            values.forEach(v => {
                if (v == 0) {
                    aux -= 1
                }
            })

            return aux
        },

        //TODO: both of these two

        oppPetsLeftQ: function(){
            let aux = 5;

            let values = Object.values(this.enemyPetsLeft);

            values.forEach(v => {
                if(v == 0){
                    aux -= 1
                }
            })

            return aux
        },

        allyHitsOnLastTurn: function(){
            let self = this;

            let hits = this.playerHits.filter(ph =>{
                if(ph.turn == self.turn - 1){
                    return ph
                }
            })

            return hits;
        },

        enemyHitsOnLastTurn: function(){
            let self = this;

            let hits = this.enemyHits.filter(eh => {
                if(self.currPlayer.id == self.player1.id){
                    if(eh.turn == self.turn-1){
                        return eh
                    }
                }else{
                    if(eh.turn == self.turn){
                        return eh
                    }
                }
            })

            return hits
        }
    }
    
})

//TODO: GET LOS DIBUJOS DE LOS PERROS Y DESCOMENTAR TODO LO QUE EMPIEZA CON uncomment