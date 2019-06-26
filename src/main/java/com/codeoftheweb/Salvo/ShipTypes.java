package com.codeoftheweb.Salvo;

public enum ShipTypes {
    Carrier(5),
    Battleship(4),
    Destroyer(3),
    Submarine(3),
    Patrol(2);

    private int length;

    ShipTypes(int length){
        this.length = length;
    }

    public int getLength(){
        return length;
    }
}
