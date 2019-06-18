var app = new Vue({
    el: "#app",
    data:{
        datos:[],
        gpId:""
    },
    methods:{
        placeShips: function(){
            if(datos.gameplayers.length == 1){
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
                load()
            })
            .fail(function(response){
                console.log(response.status)
            })
        }
    }
    
})

//TODO: meter todo dentro del vue

const params = new URLSearchParams(window.location.search);
const gpId = params.get('gp')
app.gpId = gpId

var grid;

function load(){
    $.get("/api/game_view/"+gpId)
    .done(function(datazo){
        app.datos = datazo;
        datos =  datazo;  
        
        let gridCont = $(".grid-ships").first().html("")
        gridCont.append('<div id="grid" class="grid-stack grid-stack-10"></div>')

        init(datos)
    })
}
load()


function init(datos){
    ships = datos.ships
    salvoes = datos.salvoes
    
    var options = {
        //Dimensiones de la grilla
        width:10,
        height:10,
        //Separacion vertical entre widgets
        verticalMargin:0,
        //Altura de las celdas
        cellHeight:45,
        //Desabilitamos que los widgets puedan ser resizeados
        disableResize : true,
        //Widgets flotantes
        float: true,
        //Permite que el widget ocupe mas de una columna
        disableOneColumnMode: true,
        //Columna estatica, true/false
        staticGrid: false,
        //Anims
        animate: false
    }

    if(ships.length != 0){
        options.staticGrid = true
    }

    $("#grid").html("")
    $("#enemy-grid").html("")

    $(".grid-stack").gridstack(options)

    grid = $('#grid').data('gridstack');
    enemyGrid = $('#enemy-grid').data('gridstack')

    loadShips(ships, grid)

    
    createGrid(11, $(".grid-ships"), 1)
    createGrid(11, $(".enemy-grid"), 2)  

    loadSalvoes(salvoes, ships)
}

//creates the grid structure
const createGrid = function(size, element, gridN){

    let wrapper = document.createElement('DIV')
    wrapper.classList.add('grid-wrapper')

    for(let i = 0; i < size; i++){
        let row = document.createElement('DIV')
        row.classList.add('grid-row')
        row.id =`${gridN}-grid-row${i}`
        wrapper.appendChild(row)

        for(let j = 0; j < size; j++){
            let cell = document.createElement('DIV')
            cell.classList.add('grid-cell')
            if(i > 0 && j > 0)
            cell.id = `${gridN}-${i - 1}${ j - 1}`

            if(j===0 && i > 0){
                let textNode = document.createElement('SPAN')
                textNode.innerText = String.fromCharCode(i+64)
                cell.appendChild(textNode)
                cell.classList.add('grid-marks')
            }
            if(i === 0 && j > 0){
                let textNode = document.createElement('SPAN')
                textNode.innerText = j
                cell.appendChild(textNode)
                cell.classList.add('grid-marks')
            }
            row.appendChild(cell)
        }
    }

    element.append(wrapper)
}

const loadShips = function(ships,grid){
    if(ships.length == 0 && datos.gameplayers[1]){        
        ships = [{
            "type":"Carrier",
            "locations":["A1","A2","A3","A4","A5"]
        },{
            "type":"Battleship",
            "locations":["C1","C2","C3","C4"]
        },{
            "type":"Destroyer",
            "locations":["E1","E2","E3"]
        },{
            "type":"Submarine",
            "locations":["G1","G2","G3"]
        },{
            "type":"Patrol",
            "locations":["I1","I2"]
        }]
    }

    ships.forEach(function(ship){
        var loc = ship.locations                    //Lista de cells donde esta el barco
        var firstCell = loc[0]                      //La primera de estas cells
        var lastCell = loc[loc.length - 1]          //La ultima de las mismas

        let x = parseInt(firstCell.slice(1)) - 1   //X inicial
        let y = firstCell.charCodeAt(0)-65          //Y inicial
        let w,h                                     //ancho, alto

        xLast = parseInt(lastCell.slice(1)) - 1    //X de la ultima cell
        yLast = lastCell.charCodeAt(0)-65           //Y "   "   "   "   "

        //Verificar qué sentido tiene la nave
        if(yLast == y){             //Si la ultima Y es igual a la primera Y, significa que su orientacion es vertical
            h = 1                   //La altura es 1
            w = xLast - x + 1       //El ancho es la diferencia entre la primera y la ultima X
        }else{                      //Sino, se sabe que su orientacion es horizontal
            w = 1                   //El ancho es 1
            h = yLast - y + 1       //La altura es la diferencia entre la primera y la ultima Y
        }

        var orientacion = ""

        if(h == 1){
            orientacion = "Horizontal"
        }else{
            orientacion = "Vertical"
        }

        grid.addWidget($(`<div id="${ship.type}" class="ship2"><div class="grid-stack-item-content ship ship${orientacion} ${ship.type}${orientacion}">${ship.type}</div><div/>`),
        x, y, w, h); //element,x,y,width,height

    })

    $(".ship2").dblclick(function(){
        if(app.datos.ships.length != 0){
            return
        }else{
            let shipType= $(this).attr("id")
            let cells = 0

            if(shipType=="Carrier"){
                cells = 5
            }else if(shipType == "Battleship"){
                cells = 4
            }else if(shipType == "Submarine" || shipType == "Destroyer"){
                cells = 3
            }else{
                cells = 2
            }

            rotateShips(shipType,cells)
        }
        
    })

}

const loadSalvoes = function(salvoes, ships){

    var locations = ships.map(sh => {return sh.locations})

    console.log(locations)

    
    playerSalvoes = salvoes.filter(function(sub){
        if(sub.player == gpId){
            return sub
        }
    })
    enemySalvoes = salvoes.filter(function(sub){
        if(sub.player != gpId){
            return sub
        }
    })

    playerSalvoes.forEach(function(sub){
        for(loc in sub.locations){

            x = parseInt(sub.locations[loc].slice(1))-1
            y = sub.locations[loc].charCodeAt(0)-65
            
            cell = $(`#2-${y}${x}`)

            cell.addClass('salvoed')

            turn = document.createElement('SPAN')
            turn.innerText = sub.turn

            cell.append(turn)

        }
    })

    enemySalvoes.forEach(function(sub){
        for(loc in sub.locations){
            
            x = parseInt(sub.locations[loc].slice(1))-1
            y = sub.locations[loc].charCodeAt(0)-65
            
            cell = $(`#1-${y}${x}`)

            cell.addClass('salvoed')
            
            locations.forEach(function(locs){
                locs.forEach(function(loc){
                    xAux = parseInt(loc.slice(1))-1
                    yAux = loc.charCodeAt(0)-65

                    //If current salvo location coincides with an ally ship location it will turn red
                    if(xAux == x && yAux == y){
                        cell.addClass('bg-red')
                    }
                })
            })
            

            turn = document.createElement('SPAN')
            turn.innerText = sub.turn

            cell.append(turn)
        }
    })
    
    
    
}

//adds a listener to the ships, which shoots its rotation when clicked
const rotateShips = function(shipType, cells){

    let ship = $(`#${shipType}`)

    //Arreglar en base al rodri code
    let x = +($(ship).attr('data-gs-x'))
    let y = +($(ship).attr('data-gs-y'))
    let w = +($(ship).attr('data-gs-width'))
    let h = +($(ship).attr('data-gs-height'))

    if(w>h){
        
        if(y+w-1 > 9){
            return alert("Be careful, you are going to fall off the table!")
        }

        for(var i = 1; i<w ; i++){
            if(!grid.isAreaEmpty(x,y+i)){
                return alert("You are going to crash another ship if you rotate that way.")
            }
        }


        if(y + cells - 1 < 10){
            grid.resize($(ship),1,cells);
            $(ship).children().removeClass(`${shipType}Horizontal`);
            $(ship).children().addClass(`${shipType}Vertical`);
            $(ship).children().removeClass(`shipHorizontal`);
            $(ship).children().addClass(`shipVertical`);
        } else{
            grid.update($(ship), null, 10 - cells)
            grid.resize($(ship),1,cells);
            $(ship).children().removeClass(`${shipType}Horizontal`);
            $(ship).children().addClass(`${shipType}Vertical`);
            $(ship).children().removeClass(`shipHorizontal`);
            $(ship).children().addClass(`shipVertical`);            
        }          
    }else{

        if(x+h-1 > 9){
            return alert("Be careful, you are going to fall off the table!")
        }
        for(var i = 1; i<h; i++){
            if(!grid.isAreaEmpty(x+i , y)){
                return alert("You are going to crash another ship if you rotate that way.")
            }
        }

        if(x + cells - 1  < 10){
            grid.resize($(ship),cells,1);
            $(ship).children().addClass(`${shipType}Horizontal`);
            $(ship).children().removeClass(`${shipType}Vertical`);
            $(ship).children().addClass(`shipHorizontal`);
            $(ship).children().removeClass(`shipVertical`);
        } else{
            grid.update($(ship), 10 - cells)
            grid.resize($(ship),cells,1);
            $(ship).children().addClass(`${shipType}Horizontal`);
            $(ship).children().removeClass( `${shipType}Vertical`);
            $(ship).children().addClass(`shipHorizontal`);
            $(ship).children().removeClass( `shipVertical`);
        }
        
    }
    

}

$("#logout").click(function(){
    $.post('/api/logout')
        .done(function () {
            window.location.href = "/web/games.html"
        })
        .fail(function () {
            console.log("Logout error")
        })
})

$("#back").click(function(){
    window.location.href = "/web/games.html"
})