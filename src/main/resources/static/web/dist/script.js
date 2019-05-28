var app = new Vue({
    el: "#app",
    data:{
        datos:[],
        ships:[]
    }   
})

const params = new URLSearchParams(window.location.search);
const gpId = params.get('gp')

function load(){
    $.get("/api/game_view/"+gpId)
    .done(function(datazo){
        app.datos = datazo;
        datos =  datazo;
        ships = datazo.ships            
        init(datos,ships)
    })
}
load()

function init(datos,ships){
    
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
        animate: true
    }

    $(".grid-stack").gridstack(options)

    grid = $('#grid').data('gridstack');

    loadShips(ships, grid)

    createGrid(11, $(".grid-ships"))

    
    
    

}

//creates the grid structure
const createGrid = function(size, element){

    let wrapper = document.createElement('DIV')
    wrapper.classList.add('grid-wrapper')

    for(let i = 0; i < size; i++){
        let row = document.createElement('DIV')
        row.classList.add('grid-row')
        row.id =`grid-row${i}`
        wrapper.appendChild(row)

        for(let j = 0; j < size; j++){
            let cell = document.createElement('DIV')
            cell.classList.add('grid-cell')
            if(i > 0 && j > 0)
            cell.id = `${i - 1}${ j - 1}`

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

        grid.addWidget($(`<div id="${ship.type}"><div class="grid-stack-item-content carrierHorizontal"><div class="red"></div></div><div/>`),
        x, y, w, h); //element,x,y,width,height

        $(`#${ship.type}`).css('background-color','red');

    })
}

//adds a listener to the ships, which shoots its rotation when clicked
const rotateShips = function(shipType, cells){

        $(`#${shipType}`).click(function(){
            let x = +($(this).attr('data-gs-x'))
            let y = +($(this).attr('data-gs-y'))
        if($(this).children().hasClass(`${shipType}Horizontal`)){
            if(y + cells - 1 < 10){
                grid.resize($(this),1,cells);
                $(this).children().removeClass(`${shipType}Horizontal`);
                $(this).children().addClass(`${shipType}Vertical`);
            } else{
                grid.update($(this), null, 10 - cells)
                grid.resize($(this),1,cells);
                $(this).children().removeClass(`${shipType}Horizontal`);
                $(this).children().addClass(`${shipType}Vertical`);
                
            }
            
        }else{
            if(x + cells - 1  < 10){
                grid.resize($(this),cells,1);
                $(this).children().addClass(`${shipType}Horizontal`);
                $(this).children().removeClass(`${shipType}Vertical`);
            } else{
                grid.update($(this), 10 - cells)
                grid.resize($(this),cells,1);
                $(this).children().addClass(`${shipType}Horizontal`);
                $(this).children().removeClass(`${shipType}Vertical`);
            }
            
        }
    });

}

//loops over all the grid cells, verifying if they are empty or busy
const listenBusyCells = function(){
    for(let i = 0; i < 10; i++){
        for(let j = 0; j < 10; j++){
            if(!grid.isAreaEmpty(i,j)){
                $(`#${j}${i}`).addClass('busy-cell').removeClass('empty-cell')
            } else{
                $(`#${j}${i}`).removeClass('busy-cell').addClass('empty-cell')
            }
        }
    }
}