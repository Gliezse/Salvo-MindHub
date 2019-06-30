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
        enemyShipsLeft:{
            carrier:5,
            battleship:4,
            destroyer:3,
            submarine:3,
            patrol:2
        },
        playerShipsLeft:{
            carrier:5,
            battleship:4,
            destroyer:3,
            submarine:3,
            patrol:2
        },
        gameState: "",
        dotsAux: 0
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
                    self.datos = datazo;
                    self.gameState = datazo.gamestate 
                    self.setPlayers()
                    self.setTurn()
                    self.setHits()  
                    self.setGrids()     
                }
            })
            .fail(function(response){
                alert(JSON.parse(response.responseText).error);
            })

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
            } else {
                p1n = this.datos.gameplayers[0].player.name
                p2n = this.datos.gameplayers[1].player.name
                p1id = this.datos.gameplayers[0].id
                p2id = this.datos.gameplayers[1].id

                if (parseInt(this.datos.gameplayers[0].id) < parseInt(this.datos.gameplayers[1].id)) {
                    this.player1.name = p1n
                    this.player2.name = p2n
                    this.player1.id = p1id
                    this.player2.id = p2id                
                }else{
                    this.player1.name = p2n
                    this.player2.name = p1n
                    this.player1.id = p2id
                    this.player2.id = p1id
                }
            }
        },

        setGrids: function () {
            let gridCont = $(".grid-ships").first().html("")
            let enemyGridCont = $(".enemy-grid").first().html("")

            let allyAppend = '<div id="grid" class="grid-stack grid-stack-10"></div>'
            let enemyAppend = '<div id="enemy-grid" class="grid-stack grid-stack-10"></div>'

            if(this.gameState == 'WAITING_OPPONENT_TO_JOIN'){
                allyAppend += '<div class="full-layout"></div>'
                enemyAppend += '<div class="full-layout"></div>'
            }else if(this.gameState == 'PLACING_SHIPS' || this.gameState == 'OPPONENT_PLACING_SHIPS'){
                enemyAppend += '<div class="full-layout"></div>'                
            }

            gridCont.append(allyAppend)
            enemyGridCont.append(enemyAppend)
            ships = this.datos.ships
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

            if (this.gameState != "PLACING_SHIPS") {
                options.staticGrid = true
            }

            $("#grid").html("")
            $("#enemy-grid").html("")

            $(".grid-stack").gridstack(options)

            this.grid = $('#grid').data('gridstack');
            this.enemyGrid = $('#enemy-grid').data('gridstack')

            this.loadShips(ships, this.grid)


            this.createGrid(11, $(".grid-ships"), 1)
            this.createGrid(11, $(".enemy-grid"), 2)

            this.loadSalvoes(salvoes, ships)
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

        loadShips: function (ships, grid) {
            if (ships.length == 0 && this.datos.gameplayers[1]) {
                ships = [{
                    "type": "Carrier",
                    "locations": ["A1", "A2", "A3", "A4", "A5"]
                }, {
                    "type": "Battleship",
                    "locations": ["C1", "C2", "C3", "C4"]
                }, {
                    "type": "Destroyer",
                    "locations": ["E1", "E2", "E3"]
                }, {
                    "type": "Submarine",
                    "locations": ["G1", "G2", "G3"]
                }, {
                    "type": "Patrol",
                    "locations": ["I1", "I2"]
                }]
            }

            ships.forEach(function (ship) {
                var loc = ship.locations                    //Lista de cells donde esta el barco

                loc.sort(function (x, y) {
                    if (x.charCodeAt(0) == y.charCodeAt(0)) {

                        console.log(parseInt(x.slice(1)), parseInt(y.slice(1)))

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

                console.log(loc)
                     
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

                grid.addWidget($(`<div id="${ship.type}" class="ship2"><div class="grid-stack-item-content ship ship${orientacion} ${ship.type}${orientacion}"></div><div/>`),
                    x, y, w, h); //element,x,y,width,height

            })

            $(".ship2").dblclick(function () {
                if (app.datos.ships.length != 0) {
                    return
                } else {
                    let shipType = $(this).attr("id")
                    let cells = 0

                    if (shipType == "Carrier") {
                        cells = 5
                    } else if (shipType == "Battleship") {
                        cells = 4
                    } else if (shipType == "Submarine" || shipType == "Destroyer") {
                        cells = 3
                    } else {
                        cells = 2
                    }

                    app.rotateShips(shipType, cells)
                }

            })

        },

        loadSalvoes: function (salvoes, ships) {
            this.enemyShipsLeft = {
                carrier:5,
                battleship:4,
                destroyer:3,
                submarine:3,
                patrol:2
            }
            this.playerShipsLeft = {
                carrier:5,
                battleship:4,
                destroyer:3,
                submarine:3,
                patrol:2
            }

            let self = this

            var locations = ships.map(sh => { return sh.locations })

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

                            if(hit.shipHit == "Carrier"){
                                self.enemyShipsLeft.carrier -= 1
                            }else if(hit.shipHit == "Battleship"){
                                self.enemyShipsLeft.battleship -= 1
                            }else if(hit.shipHit == "Destroyer"){
                                self.enemyShipsLeft.destroyer -= 1
                            }else if(hit.shipHit == "Submarine"){
                                self.enemyShipsLeft.submarine -= 1
                            }else{
                                self.enemyShipsLeft.patrol -= 1
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
                            if(enHit.shipHit == "Carrier"){
                                self.playerShipsLeft.carrier -= 1
                            }else if(enHit.shipHit == "Battleship"){
                                self.playerShipsLeft.battleship -= 1
                            }else if(enHit.shipHit == "Destroyer"){
                                self.playerShipsLeft.destroyer -= 1
                            }else if(enHit.shipHit == "Submarine"){
                                self.playerShipsLeft.submarine -= 1
                            }else{
                                self.playerShipsLeft.patrol -= 1
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

        rotateShips: function (shipType, cells) {

            let ship = $(`#${shipType}`)

            //Arreglar en base al rodri code
            let x = +($(ship).attr('data-gs-x'))
            let y = +($(ship).attr('data-gs-y'))
            let w = +($(ship).attr('data-gs-width'))
            let h = +($(ship).attr('data-gs-height'))

            if (w > h) {

                if (y + w - 1 > 9) {
                    return alert("Be careful, you are going to fall off the table!")
                }

                for (var i = 1; i < w; i++) {
                    if (!this.grid.isAreaEmpty(x, y + i)) {
                        return alert("You are going to crash another ship if you rotate that way.")
                    }
                }


                if (y + cells - 1 < 10) {
                    this.grid.resize($(ship), 1, cells);
                    $(ship).children().removeClass(`${shipType}Horizontal`);
                    $(ship).children().addClass(`${shipType}Vertical`);
                    $(ship).children().removeClass(`shipHorizontal`);
                    $(ship).children().addClass(`shipVertical`);
                } else {
                    this.grid.update($(ship), null, 10 - cells)
                    this.grid.resize($(ship), 1, cells);
                    $(ship).children().removeClass(`${shipType}Horizontal`);
                    $(ship).children().addClass(`${shipType}Vertical`);
                    $(ship).children().removeClass(`shipHorizontal`);
                    $(ship).children().addClass(`shipVertical`);
                }
            } else {

                if (x + h - 1 > 9) {
                    return alert("Be careful, you are going to fall off the table!")
                }
                for (var i = 1; i < h; i++) {
                    if (!this.grid.isAreaEmpty(x + i, y)) {
                        return alert("You are going to crash another ship if you rotate that way.")
                    }
                }

                if (x + cells - 1 < 10) {
                    this.grid.resize($(ship), cells, 1);
                    $(ship).children().addClass(`${shipType}Horizontal`);
                    $(ship).children().removeClass(`${shipType}Vertical`);
                    $(ship).children().addClass(`shipHorizontal`);
                    $(ship).children().removeClass(`shipVertical`);
                } else {
                    this.grid.update($(ship), 10 - cells)
                    this.grid.resize($(ship), cells, 1);
                    $(ship).children().addClass(`${shipType}Horizontal`);
                    $(ship).children().removeClass(`${shipType}Vertical`);
                    $(ship).children().addClass(`shipHorizontal`);
                    $(ship).children().removeClass(`shipVertical`);
                }

            }


        },
        
        placeShips: function(){
            if(this.datos.gameplayers.length == 1){
                return alert("You can only place ships after the player 2 joins!")
            }

            let data = []

            $(".grid-stack-item").get().forEach(function(ship){

                let cells = []

                let x = parseInt($(ship).attr('data-gs-x'))
                let y = parseInt($(ship).attr('data-gs-y'))
                let w = parseInt($(ship).attr('data-gs-width'))
                let h = parseInt($(ship).attr('data-gs-height'))

                let xAux = x+1;
                let yAux = y+65;
                let shipType = $(ship).attr('id')

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
                    "type":shipType,
                    "locations":cells
                })
            })

            $.post({
                url:"/api/games/players/"+app.gpId+"/ships",
                data: JSON.stringify(data),
                dataType: "text",
                contentType: "application/json"
            })
            .done(function(response){
                console.log(response.status)
                app.load()
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
                }else{
                    if(this.selectedCells == 2){
                        alert("you can only select 2 cells per turn!")
                    }else{
                        $(cell).append('<div class="salvo"></div>')
                        $(cell).addClass("preselected-salvo")
                        this.selectedCells += 1;
                    }
                }
            }else{
                if(this.gameState == "WAITING_OPPONENT_TO_JOIN"){
                    return alert("You can't place salvoes if there isn't any opponent!")
                }
                if(this.gameState == "PLACING_SHIPS"){
                    return alert("You can't place salvoes if you haven't placed any ship!")
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
            if (this.gameState != "WAITING_OPPONENT_TO_JOIN" && this.gameState != "PLACING_SHIPS" && this.gameState != "OPPONENT_PLACING_SHIPS") {
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

            if(this.dotsAux < 3){
                $(text).html($(text).html() + ".")
                this.dotsAux += 1
            }else{
                $(text).html($(text).html().slice(0, $(text).html().length-3))
                this.dotsAux = 0
            }
        }
    },
    computed:{
        state: function(){
            if(this.gameState == 'WAITING_OPPONENT_TO_JOIN'){
                return 'Waiting for an opponent to join the game...'
            }else if(this.gameState == 'PLACING_SHIPS'){
                return 'Place your ships!'
            }else if(this.gameState == 'OPPONENT_PLACING_SHIPS'){
                return 'Wait until your opponent places their ships!'
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
        }
    }
    
})